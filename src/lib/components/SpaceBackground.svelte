<script>
    import { Canvas } from '@threlte/core';
    import Scene from './Scene.svelte';
    import { onMount } from 'svelte';

    let mouseX = $state(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
    let mouseY = $state(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

    onMount(() => {
        mouseX = window.innerWidth / 2;
        mouseY = window.innerHeight / 2;

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    });
</script>

<div class="canvas-container">
    <Canvas>
        <Scene {mouseX} {mouseY} />
    </Canvas>
</div>
<div class="vignette-overlay"></div>

<style>
    .canvas-container {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: -2;
        background: radial-gradient(circle at center, #0a0a14 0%, #000000 100%);
    }

    .vignette-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: -1;
        background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%);
    }
</style>
