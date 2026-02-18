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
            this.sizeX = 0;
            /** @type {number} */
            this.sizeY = 0;
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
            /** @type {number} */
            this.rotation = 0;
            this.reset(w, h);
        }
        /**
         * @param {number} w
         * @param {number} h
         */
        reset(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.sizeX = Math.random() * 800 + 400;
            this.sizeY = this.sizeX * (0.3 + Math.random() * 0.4);
            const colors = [
                'rgba(100, 40, 200, 0.2)',
                'rgba(40, 80, 220, 0.18)',
                'rgba(0, 150, 180, 0.15)',
                'rgba(150, 50, 200, 0.12)',
                'rgba(60, 20, 180, 0.18)'
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)] || colors[0];
            this.driftX = (Math.random() - 0.5) * 0.1;
            this.driftY = (Math.random() - 0.5) * 0.1;
            this.pulseSpeed = 0.0001 + Math.random() * 0.0002;
            this.pulseOffset = Math.random() * Math.PI * 2;
            this.rotation = Math.random() * Math.PI * 2;
        }
        /**
         * @param {number} w
         * @param {number} h
         */
        update(w, h) {
            this.x += this.driftX;
            this.y += this.driftY;
            const margin = Math.max(this.sizeX, this.sizeY);
            if (this.x < -margin) this.x = w + margin;
            if (this.x > w + margin) this.x = -margin;
            if (this.y < -margin) this.y = h + margin;
            if (this.y > h + margin) this.y = -margin;
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
            const dx = (mouseX - w/2) / w * -80;
            const dy = (mouseY - h/2) / h * -80;
            const pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.2 + 0.8;

            ctx.save();
            ctx.translate(this.x + dx, this.y + dy);
            ctx.rotate(this.rotation);
            ctx.scale(pulse, pulse);

            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.sizeX);
            grad.addColorStop(0, this.color);
            grad.addColorStop(0.6, this.color.replace(/0\.\d+/, '0.05'));
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.sizeX, this.sizeY, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
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
            /** @type {string} */
            this.color = '';
            this.reset(w, h);
        }
        /**
         * @param {number} w
         * @param {number} h
         */
        reset(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = ([0.6, 1.4, 2.8][this.layer] || 1) + Math.random() * 0.5;
            this.speed = ([0.02, 0.08, 0.25][this.layer] || 0.1) * (0.8 + Math.random() * 0.4);
            this.alpha = 0.4 + Math.random() * 0.6;
            this.parallaxFactor = ([15, 30, 70][this.layer] || 20);

            const starColors = ['#ffffff', '#ffffff', '#e0f0ff', '#fff0e0', '#fff8e0', '#f8e0ff'];
            this.color = starColors[Math.floor(Math.random() * starColors.length)] || '#ffffff';
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
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + dx, this.y + dy, this.size, 0, Math.PI * 2);
            ctx.fill();

            if (this.layer === 2) {
                ctx.globalAlpha = this.alpha * 0.4;
                ctx.beginPath();
                ctx.arc(this.x + dx, this.y + dy, this.size * 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    class Comet {
        constructor() {
            this.active = false;
            this.timer = Math.random() * 600 + 300;
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
            this.maxLife = 120 + Math.random() * 200;

            const side = Math.floor(Math.random() * 4);
            if (side === 0) { this.x = -100; this.y = Math.random() * h; this.angle = (Math.random() - 0.5) * Math.PI / 3; }
            else if (side === 1) { this.x = w + 100; this.y = Math.random() * h; this.angle = Math.PI + (Math.random() - 0.5) * Math.PI / 3; }
            else if (side === 2) { this.x = Math.random() * w; this.y = -100; this.angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3; }
            else { this.x = Math.random() * w; this.y = h + 100; this.angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3; }

            this.speed = 5 + Math.random() * 7;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.opacity = 0;
            this.scale = 0.25;
            this.fadingIn = true;
            this.length = 180 + Math.random() * 250;
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
            this.scale += 0.0015;
            this.life++;

            this.length += Math.sin(this.life * 0.08) * 8;

            if (this.fadingIn) {
                this.opacity += 0.03;
                if (this.opacity >= 0.95) { this.opacity = 0.95; this.fadingIn = false; }
            } else if (this.life > this.maxLife * 0.6) {
                this.opacity -= 0.015;
                if (this.opacity <= 0) { this.active = false; this.timer = Math.random() * 1500 + 500; }
            }

            if (this.x < -500 || this.x > w + 500 || this.y < -500 || this.y > h + 500) {
                this.active = false;
                this.timer = Math.random() * 1500 + 500;
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
            grad.addColorStop(0.1, `rgba(200, 230, 255, ${this.opacity * 0.85})`);
            grad.addColorStop(0.4, `rgba(120, 180, 255, ${this.opacity * 0.4})`);
            grad.addColorStop(1, 'transparent');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-this.length, 0);
            ctx.stroke();

            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
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
                const count = [40, 25, 12][i] || 12;
                for(let j=0; j<count; j++) stars.push(new Star(width, height, i));
            }
            clouds = [];
            for(let i=0; i<6; i++) clouds.push(new NebulaCloud(width, height));
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
    #nebula-canvas { z-index: 4; opacity: 0.9; mix-blend-mode: screen; }
    #starfield { z-index: 30; opacity: 1; mix-blend-mode: exclusion; }

    .vignette-overlay {
        position: absolute; inset: 0; pointer-events: none; z-index: -1;
        background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%);
    }
</style>
