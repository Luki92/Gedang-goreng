<script>
    import { windowManager } from '$lib/stores/windowManager';
    import Window from './window/Window.svelte';
    import { fade } from 'svelte/transition';

    let draggingId = $state(null);
    let hoverZone = $state(null);

    function onDragStart(id) {
        draggingId = id;
    }

    function onDragEnd(id, x, y) {
        draggingId = null;
        hoverZone = null;

        const w = window.innerWidth;
        // Snap logic based on drop position relative to screen width
        if (x < w * 0.3) {
            windowManager.setMaster(id);
            windowManager.setFloating(id, false);
        } else if (x > w * 0.7) {
            windowManager.setFloating(id, false);
        }
    }

    function handleMouseMove(e) {
        if (!draggingId) return;
        const w = window.innerWidth;
        const x = e.clientX;

        if (x < w * 0.3) hoverZone = 'master';
        else if (x > w * 0.7) hoverZone = 'stack';
        else hoverZone = null;
    }

    function handleResize() {
        windowManager.layout();
    }
</script>

<svelte:window onresize={handleResize} onmousemove={handleMouseMove} />

<div class="wm-container">
    {#if draggingId}
        {#if hoverZone === 'master'}
            <div
                class="drop-zone master active"
                transition:fade={{ duration: 200 }}
            >
                <div class="zone-label">MASTER</div>
            </div>
        {/if}
        {#if hoverZone === 'stack'}
            <div
                class="drop-zone stack active"
                transition:fade={{ duration: 200 }}
            >
                <div class="zone-label">STACK</div>
            </div>
        {/if}
    {/if}

    {#each $windowManager as win (win.id)}
        {#if win.isOpen}
            <Window
                {...win}
                onDragStart={() => onDragStart(win.id)}
                onDragEnd={(x, y) => onDragEnd(win.id, x, y)}
            />
        {/if}
    {/each}
</div>

<style>
    .wm-container {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 40;
    }

    :global(.window-container) {
        pointer-events: auto;
    }

    .drop-zone {
        position: absolute;
        top: 20px; bottom: 20px;
        border: 2px dashed rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.2);
        display: flex; align-items: center; justify-content: center;
        z-index: 5;
        pointer-events: none;
    }

    .drop-zone.master { left: 20px; width: 45%; }
    .drop-zone.stack { right: 20px; width: 45%; }

    .drop-zone.active {
        background: rgba(85, 85, 255, 0.1);
        border-color: var(--accent-color, #55f);
        box-shadow: 0 0 30px rgba(85, 85, 255, 0.2);
    }

    .zone-label {
        font-family: 'Space Mono', monospace;
        color: rgba(255,255,255,0.5);
        letter-spacing: 2px;
        font-weight: bold;
        font-size: 2rem;
    }
    .drop-zone.active .zone-label {
        color: var(--accent-color, #55f);
        text-shadow: 0 0 10px var(--accent-color, #55f);
    }
</style>
