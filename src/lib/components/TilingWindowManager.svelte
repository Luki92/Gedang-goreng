<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import WindowFrame from './WindowFrame.svelte';
    import { onMount } from 'svelte';

    // Reactivity: windowManager.windows is a $state array, so this block re-runs when it changes?
    // In Svelte 5, usage in template is automatically reactive.

    function onResize() {
        windowManager.updateLayout();
    }

    onMount(() => {
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    });

    function snapToMaster() {
        if (windowManager.draggingWindowId) {
            const id = windowManager.draggingWindowId;
            windowManager.setMode(id, 'tiled');

            // Move to start of array to be Master
            // We need to operate on the proxy.
            const index = windowManager.windows.findIndex(w => w.id === id);
            if (index > -1) {
                const win = windowManager.windows[index];
                windowManager.windows.splice(index, 1);
                windowManager.windows.unshift(win);
            }
            // updateLayout is called by setMode, but we reordered, so call it again just in case
            windowManager.updateLayout();
        }
    }

    function snapToStack() {
         if (windowManager.draggingWindowId) {
            const id = windowManager.draggingWindowId;
            windowManager.setMode(id, 'tiled');

            // Move to end of array (or just keep it where it is if it's already last?)
            // If it was Master (index 0), we might want to move it to stack.
            // Let's move to end to ensure it's in stack.
            const index = windowManager.windows.findIndex(w => w.id === id);
            if (index > -1) {
                const win = windowManager.windows[index];
                windowManager.windows.splice(index, 1);
                windowManager.windows.push(win);
            }
            windowManager.updateLayout();
        }
    }
</script>

<div class="tiling-manager">
    <!-- Drop Zones -->
    {#if windowManager.draggingWindowId}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="drop-zones">
            <div class="zone master" onmouseup={snapToMaster}>
                <span>MASTER</span>
            </div>
            <div class="zone stack" onmouseup={snapToStack}>
                <span>STACK</span>
            </div>
        </div>
    {/if}

    {#each windowManager.windows as win (win.id)}
        {#if win.isOpen}
            <WindowFrame {win} />
        {/if}
    {/each}
</div>

<style>
    .tiling-manager {
        position: fixed;
        inset: 0;
        pointer-events: none; /* Let background interaction happen */
        z-index: 40;
    }

    .drop-zones {
        position: absolute;
        inset: 0;
        display: flex;
        pointer-events: auto; /* Zones catch mouse events */
        z-index: 30; /* Below windows (but windows ignore events when dragging) */
    }

    .zone {
        flex: 1;
        border: 2px dashed rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.5);
        font-family: 'Space Mono';
        font-size: 2rem;
        background: rgba(0, 0, 0, 0.2);
        transition: all 0.2s;
    }

    .zone:hover {
        background: rgba(85, 85, 255, 0.2); /* Accent color */
        border-color: rgba(85, 85, 255, 0.8);
        color: #fff;
    }

    .master { width: 60%; border-right: none; }
    .stack { width: 40%; }
</style>
