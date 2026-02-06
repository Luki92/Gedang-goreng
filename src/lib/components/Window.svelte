<script>
    import { closeWindow, focusWindow } from '$lib/stores';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    let { id, title, x = 100, y = 100, w = 500, h = 400, z = 50, children } = $props();

    let dragging = $state(false);
    let resizing = $state(false);
    let resizeDir = ''; // nw, ne, sw, se, n, s, e, w
    let dragOffX = 0, dragOffY = 0;

    // Local state for smooth interaction
    let posX = $state(x);
    let posY = $state(y);
    let width = $state(w);
    let height = $state(h);

    // Sync with props (Auto-Layout)
    // Only update if NOT currently interacting to prevent fighting
    $effect(() => {
        if (!dragging && !resizing) {
            posX = x;
            posY = y;
            width = w;
            height = h;
        }
    });

    function onMouseDown(e) {
        focusWindow(id);
    }

    function startDrag(e) {
        if (e.target.closest('button')) return;
        dragging = true;
        dragOffX = e.clientX - posX;
        dragOffY = e.clientY - posY;
        focusWindow(id);
    }

    function startResize(e, dir) {
        resizing = true;
        resizeDir = dir;
        e.stopPropagation(); // Prevent drag start
        focusWindow(id);
    }

    function onMouseMove(e) {
        if (dragging) {
            posX = e.clientX - dragOffX;
            posY = e.clientY - dragOffY;
        }
        if (resizing) {
            const minW = 300;
            const minH = 200;

            if (resizeDir.includes('e')) {
                width = Math.max(minW, e.clientX - posX);
            }
            if (resizeDir.includes('s')) {
                height = Math.max(minH, e.clientY - posY);
            }
            if (resizeDir.includes('w')) {
                const newW = Math.max(minW, posX + width - e.clientX);
                if (newW !== width) {
                    posX = e.clientX;
                    width = newW;
                }
            }
            if (resizeDir.includes('n')) {
                const newH = Math.max(minH, posY + height - e.clientY);
                if (newH !== height) {
                    posY = e.clientY;
                    height = newH;
                }
            }
        }
    }

    function onMouseUp() {
        dragging = false;
        resizing = false;
        resizeDir = '';
    }

    function close() {
        closeWindow(id);
    }
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="window-frame"
    class:interacting={dragging || resizing}
    style:left="{posX}px"
    style:top="{posY}px"
    style:width="{width}px"
    style:height="{height}px"
    style:z-index={z}
    onmousedown={onMouseDown}
    transition:fly={{ y: 20, duration: 400, easing: quintOut }}
>
    <div class="window-header" onmousedown={startDrag}>
        <span class="win-title">// {title}</span>
        <div class="controls">
            <button class="win-btn close-btn" onclick={close} aria-label="Close">
                <i class="ph ph-caret-down"></i>
            </button>
        </div>
    </div>

    <div class="window-content custom-scrollbar">
        {@render children()}
    </div>

    <!-- Resize Handles -->
    <div class="resize-handle n" onmousedown={(e) => startResize(e, 'n')}></div>
    <div class="resize-handle s" onmousedown={(e) => startResize(e, 's')}></div>
    <div class="resize-handle e" onmousedown={(e) => startResize(e, 'e')}></div>
    <div class="resize-handle w" onmousedown={(e) => startResize(e, 'w')}></div>
    <div class="resize-handle ne" onmousedown={(e) => startResize(e, 'ne')}></div>
    <div class="resize-handle nw" onmousedown={(e) => startResize(e, 'nw')}></div>
    <div class="resize-handle se" onmousedown={(e) => startResize(e, 'se')}></div>
    <div class="resize-handle sw" onmousedown={(e) => startResize(e, 'sw')}></div>
</div>

<style>
    .window-frame {
        position: fixed;
        background-color: var(--panel-bg, rgba(10, 10, 12, 0.9));
        border: 1px solid var(--border-color, #333);
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 4px;
        will-change: left, top, width, height;
        color: #eee;
        min-width: 300px;
        min-height: 200px;
        /* Smooth auto-layout transition */
        transition: left 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                    top 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                    width 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                    height 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Disable transition during drag/resize for responsiveness */
    .window-frame.interacting {
        transition: none;
    }

    .window-frame:focus-within, .window-frame:hover {
        border-color: rgba(255,255,255,0.2);
    }

    .window-header {
        height: 36px;
        background: rgba(255,255,255,0.03);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        cursor: grab;
        user-select: none;
    }
    .window-header:active { cursor: grabbing; }

    .win-title {
        font-family: 'VT323', monospace;
        color: #888;
        font-size: 1.1rem;
        letter-spacing: 1px;
    }

    .win-btn {
        background: none; border: none; color: #666; cursor: pointer;
        padding: 4px; border-radius: 4px; transition: all 0.2s;
        display: flex; align-items: center; justify-content: center;
    }
    .win-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .close-btn:hover { color: var(--accent-color, #5555ff); transform: translateY(2px); }

    .window-content {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        position: relative;
    }

    /* Resize Handles */
    .resize-handle { position: absolute; z-index: 10; }
    .n { top: 0; left: 0; width: 100%; height: 5px; cursor: ns-resize; }
    .s { bottom: 0; left: 0; width: 100%; height: 5px; cursor: ns-resize; }
    .e { top: 0; right: 0; width: 5px; height: 100%; cursor: ew-resize; }
    .w { top: 0; left: 0; width: 5px; height: 100%; cursor: ew-resize; }

    .ne { top: 0; right: 0; width: 15px; height: 15px; cursor: nesw-resize; z-index: 11; }
    .nw { top: 0; left: 0; width: 15px; height: 15px; cursor: nwse-resize; z-index: 11; }
    .se { bottom: 0; right: 0; width: 15px; height: 15px; cursor: nwse-resize; z-index: 11; background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%); }
    .sw { bottom: 0; left: 0; width: 15px; height: 15px; cursor: nesw-resize; z-index: 11; }

    /* Scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
</style>
