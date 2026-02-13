<script>
    import { onMount } from 'svelte';

    let cNebula;
    let cStar;
    let width, height;

    onMount(() => {
        const ctxNebula = cNebula.getContext('2d');
        const ctxStar = cStar.getContext('2d');
        let stars = [], mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
        let animationFrame;

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            cNebula.width = cStar.width = width;
            cNebula.height = cStar.height = height;
            initStars();
        }

        function initStars() {
            stars = [];
            for(let i=0; i<150; i++) {
                stars.push({x: Math.random()*cStar.width, y: Math.random()*cStar.height, size: Math.random()*2, alpha: Math.random(), speed: Math.random()*0.3});
            }
        }

        function animateFrame() {
            const time = Date.now();
            const w = width, h = height;

            // Nebula
            ctxNebula.clearRect(0, 0, w, h);
            const x1 = w * 0.4 + Math.sin(time * 0.0002) * 100;
            const y1 = h * 0.4 + Math.cos(time * 0.0003) * 50;
            const g1 = ctxNebula.createRadialGradient(x1, y1, 0, x1, y1, 500);
            g1.addColorStop(0, 'rgba(60, 20, 100, 0.2)'); g1.addColorStop(1, 'transparent');
            ctxNebula.fillStyle = g1; ctxNebula.fillRect(0, 0, w, h);

            // Stars
            ctxStar.clearRect(0, 0, w, h);
            ctxStar.fillStyle = "white";
            const dx = (mouseX - w/2) / w; const dy = (mouseY - h/2) / h;
            stars.forEach(star => {
                star.y -= star.speed;
                if (star.y < 0) star.y = h;
                ctxStar.globalAlpha = star.alpha; ctxStar.beginPath();
                ctxStar.arc(star.x + dx * -15, star.y + dy * -15, star.size, 0, Math.PI * 2); ctxStar.fill();
            });

            animationFrame = requestAnimationFrame(animateFrame);
        }

        const handleMouseMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        animateFrame();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrame);
        };
    });
</script>

<div class="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
<canvas bind:this={cNebula} id="nebula-canvas" class="absolute inset-0 pointer-events-none -z-30 opacity-60 mix-blend-screen"></canvas>
<canvas bind:this={cStar} id="starfield" class="absolute inset-0 pointer-events-none -z-20 opacity-90"></canvas>
