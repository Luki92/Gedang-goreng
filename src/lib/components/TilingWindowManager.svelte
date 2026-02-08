<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import WindowFrame from './WindowFrame.svelte';
</script>

<div class="tiling-wm-layer">
    {#each windowManager.windows as win (win.id)}
        <WindowFrame {win} />
    {/each}
</div>

<style>
    .tiling-wm-layer {
        position: fixed;
        inset: 0;
        pointer-events: none; /* Let clicks pass through to background/debris if no window */
        z-index: 60; /* Above HUD (50) */
    }
</style>
