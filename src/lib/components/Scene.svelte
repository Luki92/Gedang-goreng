<script>
    import { T, useTask } from '@threlte/core';
    import * as THREE from 'three';
    import { onMount } from 'svelte';

    let { mouseX = 0, mouseY = 0 } = $props();

    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Custom attributes for the custom shader point system
    const sizes = new Float32Array(particleCount);
    const orbitRadii = new Float32Array(particleCount);
    const orbitAngles = new Float32Array(particleCount);
    const orbitSpeeds = new Float32Array(particleCount);
    const shapes = new Float32Array(particleCount);

    // Cosmic stellar color palette
    const colorWhite = new THREE.Color('#ffffff');       // Bright hot/diamond stars
    const colorCyan = new THREE.Color('#00f2ff');        // High-energy accretion disk
    const colorBlue = new THREE.Color('#3b82f6');        // Deep vacuum cosmic blue
    const colorViolet = new THREE.Color('#a78bfa');      // Warm amethyst/lavender nebula
    const colorGold = new THREE.Color('#fbbf24');        // Solitude-evoking solar amber/gold

    for (let i = 0; i < particleCount; i++) {
        // 1. Galactic accretion disk distribution around central black hole void
        // Leave a clear central dark void representing the event horizon (r < 1.5)
        const rMin = 1.5;
        const rMax = 22.0;

        // Denser near the center, looser at the edge
        // Math.pow(Math.random(), 2.0) clusters points heavily near rMin
        const r = rMin + (rMax - rMin) * Math.pow(Math.random(), 2.0);
        
        // Random initial angle in the orbit plane
        const theta = Math.random() * 2 * Math.PI;

        // Flattened galaxy on the X-Z plane with a vertical bulge
        // Bulge is thickest near the center and decays exponentially as r increases
        const bulgeThickness = 1.8 * Math.exp(-r / 4.0);
        const yNoise = (Math.random() - 0.5) * bulgeThickness;

        // Initial positions (orbital animation runs in vertex shader)
        positions[i * 3] = r * Math.cos(theta);
        positions[i * 3 + 1] = yNoise;
        positions[i * 3 + 2] = r * Math.sin(theta);

        // Store custom orbit properties
        orbitRadii[i] = r;
        orbitAngles[i] = theta;

        // Keplerian orbital speed: closer stars orbit significantly faster!
        // Orbit speed proportional to 1.0 / sqrt(r)
        const baseOrbitSpeed = 0.45 / Math.sqrt(r);
        // Add minor individual variation to make orbits feel more organic
        orbitSpeeds[i] = baseOrbitSpeed * (0.85 + Math.random() * 0.3);

        // Star sizes: accretion disk has smaller hot particles, outer layers have larger solar stars
        const sizeBase = r < 4.0 ? (Math.random() * 0.08 + 0.02) : (Math.random() * 0.18 + 0.04);
        sizes[i] = sizeBase;

        // Assign different shape types:
        // 0.0: Glow spec, 1.0: 4-pointed sparkle star, 2.0: Diamond spec, 3.0: Ring nebula dust
        let shapeType = 0.0;
        const randShape = Math.random();
        if (r < 3.5) {
            // Accretion disk: mostly glows and high-frequency sparkle stars
            shapeType = randShape > 0.82 ? 1.0 : 0.0;
        } else {
            if (randShape > 0.88) shapeType = 1.0;      // Sparkle star
            else if (randShape > 0.72) shapeType = 2.0;  // Diamond spec
            else if (randShape > 0.58) shapeType = 3.0;  // Ring nebula dust
            else shapeType = 0.0;                       // Soft glow spec
        }
        shapes[i] = shapeType;

        // 2. Cosmic temperature color gradient
        let finalColor = colorWhite;
        if (r < 3.2) {
            // Accretion disk: Cyans, hot whites, and electric blue-whites
            finalColor = Math.random() > 0.55 ? colorCyan : colorWhite;
        } else if (r < 8.0) {
            // Bulge and mid-galaxy: Amethysts, deep space blues, and soft purples
            const mixFactor = Math.random();
            if (mixFactor > 0.65) finalColor = colorViolet;
            else if (mixFactor > 0.3) finalColor = colorCyan;
            else finalColor = colorBlue;
        } else {
            // Outer galaxy: Soft blues, cozy solar golds, and dim whites
            const mixFactor = Math.random();
            if (mixFactor > 0.86) finalColor = colorGold;
            else if (mixFactor > 0.55) finalColor = colorViolet;
            else if (mixFactor > 0.3) finalColor = colorBlue;
            else finalColor = new THREE.Color('#94a3b8'); // Dim stellar dust
        }

        colors[i * 3] = finalColor.r;
        colors[i * 3 + 1] = finalColor.g;
        colors[i * 3 + 2] = finalColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aOrbitRadius', new THREE.BufferAttribute(orbitRadii, 1));
    geometry.setAttribute('aOrbitAngle', new THREE.BufferAttribute(orbitAngles, 1));
    geometry.setAttribute('aOrbitSpeed', new THREE.BufferAttribute(orbitSpeeds, 1));
    geometry.setAttribute('aShape', new THREE.BufferAttribute(shapes, 1));

    let rotationGroup = $state();
    let cameraGroup = $state();
    let isTiltSet = false;

    // --- Kinetic Icy Inertia Physics ---
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;
    
    // Dynamic sliding velocity variables
    let driftVx = 0;
    let driftVy = 0;

    let pixelRatio = 1.0;
    let screenWidth = 1000;
    let screenHeight = 1000;

    if (typeof window !== 'undefined') {
        pixelRatio = window.devicePixelRatio || 1.0;
        screenWidth = window.innerWidth;
        screenHeight = window.innerHeight;
    }

    const uniforms = {
        uTime: { value: 0 },
        uVelocity: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: pixelRatio },
        uResolution: { value: new THREE.Vector2(screenWidth, screenHeight) },
        uStreakStrength: { value: 0.18 },
        uOrbitSpeed: { value: 1.0 }
    };

    onMount(() => {
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        const handleResize = () => {
            if (typeof window !== 'undefined') {
                uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
                uniforms.uPixelRatio.value = window.devicePixelRatio || 1.0;
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });

    useTask((delta) => {
        if (!rotationGroup) return;

        // Apply a tilt to the galactic disk for stunning 3D perspective
        if (!isTiltSet) {
            rotationGroup.rotation.x = 0.55; // ~31 degree angle
            isTiltSet = true;
        }

        // Slow constant default galactic rotation
        const baseSpeedY = 0.05;
        const baseSpeedZ = 0.02;

        // Calculate cursor movement speed / kinetic offset
        const diffX = mouseX - lastMouseX;
        const diffY = mouseY - lastMouseY;
        
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        // Add kinetic energy to the slide velocities
        const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const height = typeof window !== 'undefined' ? window.innerHeight : 1000;

        const forceX = (diffX / width) * 15.0;
        const forceY = (diffY / height) * 15.0;

        driftVx += forceX;
        driftVy += forceY;

        // "Icy" inertia slide: low friction damping allows particles to glide and drift smoothly
        // Adapts dynamically to delta to remain uniform across different frame rates
        const friction = Math.pow(0.95, delta * 60.0); // 0.95 damping at 60fps
        driftVx *= friction;
        driftVy *= friction;

        // Apply dynamic sliding drift to rotation group speed
        // This causes the galaxy to speed up, spin, and slide on fast cursor sweeps
        rotationGroup.rotation.y += (baseSpeedY + driftVx * 0.3) * delta;
        rotationGroup.rotation.z += (baseSpeedZ + driftVy * 0.15) * delta;

        // Smooth parallax camera offset based on cursor position
        if (cameraGroup) {
            const targetParallaxY = ((mouseX - width / 2) / width) * 0.35;
            const targetParallaxX = ((mouseY - height / 2) / height) * 0.35;

            // Camera smoothly glides to target coordinates with sliding offsets
            cameraGroup.rotation.y += (targetParallaxY - cameraGroup.rotation.y) * 2.5 * delta + driftVx * 0.15 * delta;
            cameraGroup.rotation.x += (targetParallaxX - cameraGroup.rotation.x) * 2.5 * delta + driftVy * 0.15 * delta;
        }

        // Update uniforms for the ShaderMaterial
        if (uniforms) {
            uniforms.uTime.value += delta;
            
            // Interpolate the velocity uniform to avoid any rendering stutter
            uniforms.uVelocity.value.x += (driftVx - uniforms.uVelocity.value.x) * 12.0 * delta;
            uniforms.uVelocity.value.y += (driftVy - uniforms.uVelocity.value.y) * 12.0 * delta;
        }
    });

    // Custom Vertex Shader
    const vertexShader = `
        uniform float uTime;
        uniform vec2 uVelocity;
        uniform float uPixelRatio;
        uniform vec2 uResolution;
        uniform float uOrbitSpeed;

        attribute float aSize;
        attribute float aOrbitRadius;
        attribute float aOrbitAngle;
        attribute float aOrbitSpeed;
        attribute float aShape;

        varying vec3 vColor;
        varying float vShape;
        varying vec2 vScreenVelocity;

        void main() {
            // 1. Calculate Orbit Movement in 3D
            float currentAngle = aOrbitAngle + uTime * aOrbitSpeed * uOrbitSpeed;
            vec3 orbitPos = vec3(
                aOrbitRadius * cos(currentAngle),
                position.y, // Maintain custom vertical bulge noise
                aOrbitRadius * sin(currentAngle)
            );

            // Orbital velocity vector in 3D tangent to the circular orbit
            vec3 orbitVelocity = vec3(
                -aOrbitRadius * sin(currentAngle),
                0.0,
                aOrbitRadius * cos(currentAngle)
            ) * aOrbitSpeed * uOrbitSpeed;

            // Project current 3D position
            vec4 mvPosition = modelViewMatrix * vec4(orbitPos, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            // 2. Project 3D Orbital Speed and global Cursor Drift to 2D Screen Space
            // We project a point slightly offset along the orbit velocity to find screen-space movement
            vec4 mvPositionNext = modelViewMatrix * vec4(orbitPos + orbitVelocity * 0.05, 1.0);
            vec4 projCurrent = gl_Position;
            vec4 projNext = projectionMatrix * mvPositionNext;

            // Convert projected points to Normalized Device Coordinates (NDC)
            vec2 ndcCurrent = projCurrent.xy / projCurrent.w;
            vec2 ndcNext = projNext.xy / projNext.w;

            // Screen orbital velocity vector (pixels)
            vec2 screenVelOrbital = (ndcNext - ndcCurrent) * uResolution * 0.5;

            // Add the global cursor-induced drift velocity in screen space
            // Scaled inversely by depth so closer stars drift/stretch faster
            vec2 screenVelCursor = uVelocity * uResolution * 1.5 * (1.0 / -mvPosition.z);

            vec2 totalScreenVelocity = screenVelOrbital + screenVelCursor;

            // Pass varyings to the fragment shader
            vColor = color;
            vShape = aShape;
            vScreenVelocity = totalScreenVelocity;

            // 3. Dynamic size attenuation with depth and stretch speed
            float depthAttenuation = 160.0 / -mvPosition.z;
            float baseSize = aSize * uPixelRatio * depthAttenuation;

            // Scale Point Size to fit stretched capsule without bounding-box clipping
            float speedPixels = length(totalScreenVelocity);
            gl_PointSize = baseSize * (1.0 + speedPixels * 0.15);
            
            // Clamp size to prevent excessive screen-cluttering quads
            gl_PointSize = clamp(gl_PointSize, 1.0, 160.0);
        }
    `;

    // Custom Fragment Shader
    const fragmentShader = `
        uniform float uTime;
        varying vec3 vColor;
        varying float vShape;
        varying vec2 vScreenVelocity;

        void main() {
            // Translate origin to Point center (0.0, 0.0)
            vec2 uv = gl_PointCoord - vec2(0.5);

            vec2 vel = vScreenVelocity;
            float speed = length(vel);

            // Default stretch axis
            vec2 dir = vec2(1.0, 0.0);
            if (speed > 0.001) {
                dir = normalize(vel);
            }
            vec2 perp = vec2(-dir.y, dir.x);

            // Project current coordinate onto velocity and perpendicular axes
            float xPrime = dot(uv, dir);
            float yPrime = dot(uv, perp);

            // Calculate motion blur stretch length based on pixel speed
            float stretch = 0.5 + speed * 0.06;
            float thickness = 0.5; // Constant width

            // Elliptical boundary check
            float r2 = (xPrime / stretch) * (xPrime / stretch) + (yPrime / thickness) * (yPrime / thickness);

            // Outer capsule clipping
            if (r2 > 0.25) {
                discard;
            }

            // Map coordinates inside the stretched capsule back to [-1.0, 1.0] for shape drawing
            vec2 p = vec2(xPrime / stretch, yPrime / thickness) * 2.0;
            float pLen = length(p);

            float shapeVal = 0.0;

            if (vShape < 0.5) {
                // Shape 0: Soft Glow Spec (organic gas/dust stars)
                shapeVal = exp(-pLen * 2.5);
            }
            else if (vShape < 1.5) {
                // Shape 1: Gorgeous 4-Pointed Sparkle Star
                float rayX = exp(-abs(p.x) * 9.0) * exp(-abs(p.y) * 1.5);
                float rayY = exp(-abs(p.y) * 9.0) * exp(-abs(p.x) * 1.5);
                shapeVal = max(rayX, rayY) + exp(-pLen * 4.5) * 0.35;
            }
            else if (vShape < 2.5) {
                // Shape 2: Diamond Spec (Technical/retro diamond)
                float diamondDist = abs(p.x) + abs(p.y);
                shapeVal = exp(-diamondDist * 3.5);
            }
            else {
                // Shape 3: Ring Nebula Dust
                float ring = exp(-abs(pLen - 0.45) * 7.5);
                shapeVal = ring + exp(-pLen * 5.0) * 0.15;
            }

            // 3. Motion Blur Velocity-Trail / Comet Tail Fade
            // Negative xPrime coordinates represent the tail behind the heading vector
            float trailFade = 1.0;
            if (speed > 0.5) {
                float normalizedX = xPrime / stretch; // [-0.5, 0.5]
                // Smoothly fade trailing side to zero
                trailFade = smoothstep(-0.5, 0.25, normalizedX);
            }

            // Combine alpha elements
            float alpha = shapeVal * trailFade * (1.0 - smoothstep(0.42, 0.5, r2));

            // Enhance glow intensity dynamically with velocity
            vec3 glowColor = vColor * (1.0 + speed * 0.04);

            gl_FragColor = vec4(glowColor, alpha * 0.9);
        }
    `;
</script>

<T.Group bind:ref={cameraGroup}>
    <T.PerspectiveCamera
        makeDefault
        position={[0, 0, 15]}
        fov={75}
    />
</T.Group>

<T.Group bind:ref={rotationGroup}>
    <T.Points {geometry}>
        <T.ShaderMaterial
            {vertexShader}
            {fragmentShader}
            {uniforms}
            transparent={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
        />
    </T.Points>
</T.Group>
