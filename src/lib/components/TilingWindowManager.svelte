<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import WindowFrame from './WindowFrame.svelte';

    let isDragging = $state(false);

    // Subscribe to dragging state? WindowFrame manages it locally.
    // We can add a global drag state to windowManager or use events.
    // Let's assume windowManager tracks dragging or we pass it up.
    // But Svelte 5 runes allow deep reactivity.

    // Simpler: Just render zones. WindowFrame will detect hover.
    // But WindowFrame needs to know where zones are.

</script>

<div class="tiling-wm-layer">
    <!-- Snap Zones (Visible only when dragging) -->
    <!-- Ideally, we toggle visibility based on a store or state in windowManager -->

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
