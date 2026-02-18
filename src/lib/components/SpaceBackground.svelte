<script>
    import { onMount } from 'svelte';

    /** @type {HTMLCanvasElement | undefined} */
    let cNebula;
    /** @type {HTMLCanvasElement | undefined} */
    let cStar;
    /** @type {number} */
    let width = 0;
    /** @type {number} */
    let height = 0;

    class NebulaCloud {
        /**
         * @param {number} w
         * @param {number} h
         */
        constructor(w, h) {
            /** @type {number} */
            this.x = 0;
            /** @type {number} */
            this.y = 0;
            /** @type {number} */
            this.size = 0;
            /** @type {string} */
            this.color = '';
            /** @type {number} */
            this.driftX = 0;
            /** @type {number} */
            this.driftY = 0;
            /** @type {number} */
            this.pulseSpeed = 0;
            /** @type {number} */
            this.pulseOffset = 0;
            this.reset(w, h);
        }
        /**
         * @param {number} w
         * @param {number} h
         */
        reset(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 600 + 400;
            const colors = [
                'rgba(60, 20, 100, 0.2)',   // Deep Purple
                'rgba(20, 60, 150, 0.15)',  // Deep Blue
                'rgba(0, 100, 120, 0.12)',  // Teal
                'rgba(100, 20, 150, 0.1)',  // Violet
                'rgba(40, 0, 100, 0.15)'    // Indigo
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)] || colors[0];
            this.driftX = (Math.random() - 0.5) * 0.15;
            this.driftY = (Math.random() - 0.5) * 0.15;
            this.pulseSpeed = 0.0001 + Math.random() * 0.0002;
            this.pulseOffset = Math.random() * Math.PI * 2;
        }
        /**
         * @param {number} w
         * @param {number} h
         */
        update(w, h) {
            this.x += this.driftX;
            this.y += this.driftY;
            if (this.x < -this.size) this.x = w + this.size;
            if (this.x > w + this.size) this.x = -this.size;
            if (this.y < -this.size) this.y = h + this.size;
            if (this.y > h + this.size) this.y = -this.size;
        }
        /**
         * @param {CanvasRenderingContext2D} ctx
         * @param {number} time
         * @param {number} mouseX
         * @param {number} mouseY
         * @param {number} w
         * @param {number} h
         */
        draw(ctx, time, mouseX, mouseY, w, h) {
            const dx = (mouseX - w/2) / w * -60;
            const dy = (mouseY - h/2) / h * -60;
            const pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.15 + 0.85;
            const currentSize = this.size * pulse;

            const grad = ctx.createRadialGradient(
                this.x + dx, this.y + dy, 0,
                this.x + dx, this.y + dy, currentSize
            );
            grad.addColorStop(0, this.color);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }
    }

    class Star {
        /**
         * @param {number} w
         * @param {number} h
         * @param {number} layer
         */
        constructor(w, h, layer) {
            this.layer = layer;
            /** @type {number} */
            this.x = 0;
            /** @type {number} */
            this.y = 0;
            /** @type {number} */
            this.size = 0;
            /** @type {number} */
            this.speed = 0;
            /** @type {number} */
            this.alpha = 0;
            /** @type {number} */
            this.parallaxFactor = 0;
            this.reset(w, h);
        }
        /**
         * @param {number} w
         * @param {number} h
         */
        reset(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = ([0.4, 0.9, 1.8][this.layer] || 1) + Math.random() * 0.4;
            this.speed = ([0.03, 0.1, 0.3][this.layer] || 0.1) * (0.8 + Math.random() * 0.4);
            this.alpha = 0.2 + Math.random() * 0.8;
            this.parallaxFactor = ([8, 20, 45][this.layer] || 10);
        }
        /**
         * @param {number} h
         */
        update(h) {
            this.y -= this.speed;
            if (this.y < 0) this.y = h;
        }
        /**
         * @param {CanvasRenderingContext2D} ctx
         * @param {number} mouseX
         * @param {number} mouseY
         * @param {number} w
         * @param {number} h
         */
        draw(ctx, mouseX, mouseY, w, h) {
            const dx = (mouseX - w/2) / w * -this.parallaxFactor;
            const dy = (mouseY - h/2) / h * -this.parallaxFactor;
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x + dx, this.y + dy, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class Comet {
        constructor() {
            this.active = false;
            this.timer = Math.random() * 1200 + 600;
            /** @type {number} */
            this.life = 0;
            /** @type {number} */
            this.maxLife = 0;
            /** @type {number} */
            this.x = 0;
            /** @type {number} */
            this.y = 0;
            /** @type {number} */
            this.angle = 0;
            /** @type {number} */
            this.speed = 0;
            /** @type {number} */
            this.vx = 0;
            /** @type {number} */
            this.vy = 0;
            /** @type {number} */
            this.opacity = 0;
            /** @type {number} */
            this.scale = 0;
            this.fadingIn = true;
            /** @type {number} */
            this.length = 0;
        }
        /**
         * @param {number} w
         * @param {number} h
         */
        spawn(w, h) {
            this.active = true;
            this.life = 0;
            this.maxLife = 200 + Math.random() * 300;

            // Randomly start from an edge or inside
            if (Math.random() < 0.5) {
                // From edges
                const side = Math.floor(Math.random() * 4);
                if (side === 0) { this.x = -100; this.y = Math.random() * h; this.angle = (Math.random() - 0.5) * Math.PI / 2; }
                else if (side === 1) { this.x = w + 100; this.y = Math.random() * h; this.angle = Math.PI + (Math.random() - 0.5) * Math.PI / 2; }
                else if (side === 2) { this.x = Math.random() * w; this.y = -100; this.angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2; }
                else { this.x = Math.random() * w; this.y = h + 100; this.angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2; }
            } else {
                // Inside screen
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.angle = Math.random() * Math.PI * 2;
            }

            this.speed = 2 + Math.random() * 4;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.opacity = 0;
            this.scale = 0.1;
            this.fadingIn = true;
            this.length = 80 + Math.random() * 100;
        }
        /**
         * @param {number} w
         * @param {number} h
         */
        update(w, h) {
            if (!this.active) {
                this.timer--;
                if (this.timer <= 0) this.spawn(w, h);
                return;
            }
            this.x += this.vx;
            this.y += this.vy;
            this.scale += 0.002;
            this.life++;

            if (this.fadingIn) {
                this.opacity += 0.01;
                if (this.opacity >= 0.8) { this.opacity = 0.8; this.fadingIn = false; }
            } else if (this.life > this.maxLife * 0.5) {
                this.opacity -= 0.008;
                if (this.opacity <= 0) { this.active = false; this.timer = Math.random() * 3000 + 1500; }
            }

            if (this.x < -300 || this.x > w + 300 || this.y < -300 || this.y > h + 300) {
                this.active = false;
                this.timer = Math.random() * 3000 + 1500;
            }
        }
        /**
         * @param {CanvasRenderingContext2D} ctx
         */
        draw(ctx) {
            if (!this.active || this.opacity <= 0) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.scale(this.scale, this.scale);
            const grad = ctx.createLinearGradient(0, 0, -this.length, 0);
            grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
            grad.addColorStop(0.2, `rgba(150, 200, 255, ${this.opacity * 0.6})`);
            grad.addColorStop(1, 'transparent');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-this.length, 0);
            ctx.stroke();

            // Head glow
            const headGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 5);
            headGrad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
            headGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = headGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    onMount(() => {
        if (!cNebula || !cStar) return;
        const ctxNebula = cNebula.getContext('2d');
        const ctxStar = cStar.getContext('2d');
        if (!ctxNebula || !ctxStar) return;

        /** @type {Star[]} */
        let stars = [];
        /** @type {NebulaCloud[]} */
        let clouds = [];
        /** @type {Comet[]} */
        let comets = [];
        let mouseX = window.innerWidth/2;
        let mouseY = window.innerHeight/2;
        /** @type {number | undefined} */
        let animationFrame;

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            if (cNebula && cStar) {
                cNebula.width = cStar.width = width;
                cNebula.height = cStar.height = height;
                initElements();
            }
        }

        function initElements() {
            stars = [];
            for(let i=0; i<3; i++) {
                const count = [60, 40, 20][i] || 20;
                for(let j=0; j<count; j++) stars.push(new Star(width, height, i));
            }
            clouds = [];
            for(let i=0; i<8; i++) clouds.push(new NebulaCloud(width, height));
            comets = [new Comet(), new Comet()];
        }

        function animateFrame() {
            if (!ctxNebula || !ctxStar) return;
            const time = Date.now();
            ctxNebula.clearRect(0, 0, width, height);
            ctxNebula.globalCompositeOperation = 'screen';
            clouds.forEach(cloud => {
                cloud.update(width, height);
                cloud.draw(ctxNebula, time, mouseX, mouseY, width, height);
            });

            ctxStar.clearRect(0, 0, width, height);
            ctxStar.fillStyle = "white";
            stars.forEach(star => {
                star.update(height);
                star.draw(ctxStar, mouseX, mouseY, width, height);
            });

            comets.forEach(comet => {
                comet.update(width, height);
                comet.draw(ctxStar);
            });

            animationFrame = requestAnimationFrame(animateFrame);
        }

        /** @param {MouseEvent} e */
        const handleMouseMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        animateFrame();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    });
</script>

<div class="vignette-overlay"></div>
<canvas bind:this={cNebula} id="nebula-canvas" class="canvas-layer"></canvas>
<canvas bind:this={cStar} id="starfield" class="canvas-layer"></canvas>

<style>
    .canvas-layer { position: absolute; inset: 0; pointer-events: none; }
    #nebula-canvas { z-index: -3; opacity: 0.7; mix-blend-mode: screen; }
    #starfield { z-index: -2; opacity: 1; }

    .vignette-overlay {
        position: absolute; inset: 0; pointer-events: none; z-index: -1;
        background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%);
    }
</style>
