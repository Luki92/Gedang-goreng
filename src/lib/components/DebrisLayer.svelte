<script>
    import { onMount } from 'svelte';

    const allItems = [
        { char: '<i class="ph ph-cube"></i>', id: 'cube', scale: 1 },
        { char: '<i class="ph ph-game-controller"></i>', id: 'game', scale: 1.2 },
        { char: '<i class="ph ph-floppy-disk"></i>', id: 'disk', scale: 1 },
        { char: '<i class="ph ph-alien"></i>', id: 'alien', scale: 1.2 },
        { char: '<i class="ph ph-planet"></i>', id: 'planet', scale: 1.5 },
    ];

    let container;
    let mouseX = 0, mouseY = 0;

    class Actor {
        constructor(data, parent) {
            this.element = document.createElement('div');
            this.element.innerHTML = data.char;
            this.element.className = 'debris-item';
            this.element.style.fontSize = `${2 * data.scale}rem`;
            // Initial random position
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = (Math.random() - 0.5) * 1;
            this.rotation = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 2;
            parent.appendChild(this.element);
        }
        update(mX, mY) {
            this.x += this.vx; this.y += this.vy; this.rotation += this.rotSpeed;
            // Wrap around screen
            if (this.x > window.innerWidth + 50) this.x = -50;
            if (this.x < -50) this.x = window.innerWidth + 50;
            if (this.y > window.innerHeight + 50) this.y = -50;
            if (this.y < -50) this.y = window.innerHeight + 50;

            // Mouse Parallax
            const dx = (mX - window.innerWidth/2) / window.innerWidth;
            const dy = (mY - window.innerHeight/2) / window.innerHeight;

            // Use transform3d for hardware acceleration
            this.element.style.transform = `translate3d(${this.x + dx * -30}px, ${this.y + dy * -30}px, 0) rotate(${this.rotation}deg)`;
        }
    }

    onMount(() => {
        const actors = allItems.map(item => new Actor(item, container));

        const loop = () => {
             actors.forEach(obj => obj.update(mouseX, mouseY));
             requestAnimationFrame(loop);
        };
        const animFrame = requestAnimationFrame(loop);

        const mm = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
        window.addEventListener('mousemove', mm);

        return () => {
            cancelAnimationFrame(animFrame);
            window.removeEventListener('mousemove', mm);
        };
    });
</script>

<div bind:this={container} class="debris-container"></div>
