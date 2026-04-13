<script>
    import { T, useTask } from '@threlte/core';
    import * as THREE from 'three';

    let { mouseX = 0, mouseY = 0 } = $props();

    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorA = new THREE.Color('#5555ff');
    const colorB = new THREE.Color('#ffffff');
    const colorC = new THREE.Color('#a78bfa');

    for (let i = 0; i < particleCount; i++) {
        // Spherical distribution for a more galaxy-like feel
        const r = 20 * Math.pow(Math.random(), 0.5);
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Mix colors
        const randColor = Math.random();
        let c = colorB;
        if (randColor > 0.8) c = colorA;
        else if (randColor > 0.5) c = colorC;

        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        sizes[i] = Math.random() * 0.15 + 0.02;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    let rotationGroup = $state();
    let cameraGroup = $state();

    let targetRotationX = 0;
    let targetRotationY = 0;

    useTask((delta) => {
        if (!rotationGroup) return;

        // Slow constant rotation
        rotationGroup.rotation.y += delta * 0.05;
        rotationGroup.rotation.z += delta * 0.02;

        // Mouse parallax
        if (cameraGroup) {
            const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
            const height = typeof window !== 'undefined' ? window.innerHeight : 1000;

            targetRotationY = (mouseX - width / 2) * 0.001;
            targetRotationX = (mouseY - height / 2) * 0.001;

            cameraGroup.rotation.y += (targetRotationY - cameraGroup.rotation.y) * 5 * delta;
            cameraGroup.rotation.x += (targetRotationX - cameraGroup.rotation.x) * 5 * delta;
        }
    });
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
        <T.PointsMaterial
            size={0.1}
            vertexColors={true}
            transparent={true}
            opacity={0.8}
            sizeAttenuation={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
        />
    </T.Points>
</T.Group>
