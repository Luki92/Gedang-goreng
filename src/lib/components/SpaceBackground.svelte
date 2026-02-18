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
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.driftX = (Math.random() - 0.5) * 0.08;
            this.driftY = (Math.random() - 0.5) * 0.08;

            /** @type {Array<{ox: number, oy: number, size: number, color: string, phase: number, speed: number}>} */
            this.puffs = [];
            const puffCount = 15 + Math.floor(Math.random() * 10);
            const colors = [
                'rgba(120, 50, 220, 0.08)',
                'rgba(50, 100, 255, 0.06)',
                'rgba(0, 180, 200, 0.05)',
                'rgba(180, 60, 220, 0.04)'
            ];
            const baseColor = colors[Math.floor(Math.random() * colors.length)] || colors[0];

            for(let i=0; i<puffCount; i++) {
                this.puffs.push({
                    ox: (Math.random() - 0.5) * 400,
                    oy: (Math.random() - 0.5) * 300,
                    size: Math.random() * 300 + 200,
                    color: baseColor,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.0005 + Math.random() * 0.001
                });
            }
        }

        /**
         * @param {number} w
         * @param {number} h
         */
        update(w, h) {
            this.x += this.driftX;
            this.y += this.driftY;
            if (this.x < -600) this.x = w + 600;
            if (this.x > w + 600) this.x = -600;
            if (this.y < -600) this.y = h + 600;
            if (this.y > h + 600) this.y = -600;
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

            ctx.save();
            ctx.translate(this.x + dx, this.y + dy);

            this.puffs.forEach(p => {
                const alpha = Math.sin(time * p.speed + p.phase) * 0.2 + 0.8;
                const grad = ctx.createRadialGradient(p.ox, p.oy, 0, p.ox, p.oy, p.size);
                grad.addColorStop(0, p.color);
                grad.addColorStop(1, 'transparent');

                ctx.globalAlpha = alpha;
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.ox, p.oy, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
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
            this.coreSize = 0;
            /** @type {number} */
            this.speed = 0;
            /** @type {number} */
            this.parallaxFactor = 0;
            /** @type {string} */
            this.color = '';
            /** @type {string} */
            this.glow = '';

            this.reset(w, h);
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.twinkleSpeed = 0.02 + Math.random() * 0.05;
        }

        /**
         * @param {number} w
         * @param {number} h
         */
        reset(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.coreSize = ([0.4, 0.8, 1.2][this.layer] || 0.8) + Math.random() * 0.3;
            this.speed = ([0.02, 0.06, 0.15][this.layer] || 0.06) * (0.8 + Math.random() * 0.4);
            this.parallaxFactor = ([10, 25, 55][this.layer] || 25);

            const types = [
                { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.8)' },
                { color: '#ffffff', glow: 'rgba(180, 210, 255, 0.9)' },
                { color: '#ffffff', glow: 'rgba(255, 240, 180, 0.8)' },
                { color: '#ffffff', glow: 'rgba(255, 180, 150, 0.7)' }
            ];
            const t = types[Math.floor(Math.random() * types.length)] || types[0];
            this.color = t.color;
            this.glow = t.glow;
        }

        /** @param {number} h */
        update(h) {
            this.y -= this.speed;
            if (this.y < 0) this.y = h;
            this.twinklePhase += this.twinkleSpeed;
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
            const intensity = Math.sin(this.twinklePhase) * 0.3 + 0.7;

            const px = this.x + dx;
            const py = this.y + dy;

            const glowSize = this.coreSize * (4 + intensity * 4);
            const grad = ctx.createRadialGradient(px, py, 0, px, py, glowSize);
            grad.addColorStop(0, this.glow.replace(/0\.\d+/, (0.4 * intensity).toFixed(2)));
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, glowSize, 0, Math.PI * 2);
            ctx.fill();

            if (this.layer > 0) {
                const spikeLen = this.coreSize * (6 + intensity * 8);
                const spikeAlpha = 0.2 * intensity;
                ctx.strokeStyle = `rgba(255, 255, 255, ${spikeAlpha})`;
                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.moveTo(px - spikeLen, py);
                ctx.lineTo(px + spikeLen, py);
                ctx.moveTo(px, py - spikeLen);
                ctx.lineTo(px, py + spikeLen);
                ctx.stroke();
            }

            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.9 + intensity * 0.1;
            ctx.beginPath();
            ctx.arc(px, py, this.coreSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    class Comet {
        constructor() {
            this.active = false;
            this.timer = Math.random() * 500 + 300;
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
            this.maxLife = 100 + Math.random() * 150;
            const side = Math.floor(Math.random() * 4);
            if (side === 0) { this.x = -100; this.y = Math.random() * h; this.angle = (Math.random() - 0.5) * Math.PI / 4; }
            else if (side === 1) { this.x = w + 100; this.y = Math.random() * h; this.angle = Math.PI + (Math.random() - 0.5) * Math.PI / 4; }
            else if (side === 2) { this.x = Math.random() * w; this.y = -100; this.angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 4; }
            else { this.x = Math.random() * w; this.y = h + 100; this.angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 4; }
            this.speed = 6 + Math.random() * 6;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.opacity = 0;
            this.scale = 0.3;
            this.fadingIn = true;
            this.length = 200 + Math.random() * 300;
        }
        /**
         * @param {number} w
         * @param {number} h
         */
        update(w, h) {
            if (!this.active) { this.timer--; if (this.timer <= 0) this.spawn(w, h); return; }
            this.x += this.vx; this.y += this.vy; this.scale += 0.002; this.life++;
            if (this.fadingIn) { this.opacity += 0.05; if (this.opacity >= 1) { this.opacity = 1; this.fadingIn = false; } }
            else if (this.life > this.maxLife * 0.7) { this.opacity -= 0.02; if (this.opacity <= 0) { this.active = false; this.timer = Math.random() * 1500 + 500; } }
            if (this.x < -600 || this.x > w + 600 || this.y < -600 || this.y > h + 600) { this.active = false; this.timer = Math.random() * 1500 + 500; }
        }
        /** @param {CanvasRenderingContext2D} ctx */
        draw(ctx) {
            if (!this.active) return;
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
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
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
            width = window.innerWidth; height = window.innerHeight;
            if (cNebula && cStar) {
                cNebula.width = cStar.width = width; cNebula.height = cStar.height = height;
                init();
            }
        }

        function init() {
            stars = [];
            for(let i=0; i<3; i++) {
                const count = [40, 25, 12][i] || 12;
                for(let j=0; j<count; j++) stars.push(new Star(width, height, i));
            }
            clouds = [];
            for(let i=0; i<4; i++) clouds.push(new NebulaCloud(width, height));
            comets = [new Comet(), new Comet()];
        }

        function loop() {
            if (!ctxNebula || !ctxStar) return;
            const time = Date.now();
            ctxNebula.clearRect(0, 0, width, height);
            ctxNebula.globalCompositeOperation = 'screen';
            clouds.forEach(c => { c.update(width, height); c.draw(ctxNebula, time, mouseX, mouseY, width, height); });

            ctxStar.clearRect(0, 0, width, height);
            stars.forEach(s => { s.update(height); s.draw(ctxStar, mouseX, mouseY, width, height); });
            comets.forEach(c => { c.update(width, height); c.draw(ctxStar); });

            animationFrame = requestAnimationFrame(loop);
        }

        /** @param {MouseEvent} e */
        const mm = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', mm);
        resizeCanvas();
        loop();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', mm);
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
