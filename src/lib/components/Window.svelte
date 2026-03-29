<script>
    import { closeWindow, focusWindow, updateWindow } from '$lib/stores';
    import { scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    // Added origin prop
    let { id, title, origin = 'tl', x = 100, y = 100, w = 500, h = 400, z = 50, children } = $props();

    let dragging = $state(false);
    let resizing = $state(false);
    let resizeDir = '';
    let dragOffX = 0, dragOffY = 0;

    // Local state
    let posX = $state(x);
    let posY = $state(y);
    let width = $state(w);
    let height = $state(h);

    // Sync props -> local (One way, unless interacting)
    $effect(() => {
        // If we are NOT interacting, and the PROPS changed significantly (layout update), sync local.
        if (!dragging && !resizing) {
            // Check if props actually differ to avoid loop (though Svelte 5 is smart)
            if (x !== posX || y !== posY || w !== width || h !== height) {
                posX = x;
                posY = y;
                width = w;
                height = h;
            }
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
        e.stopPropagation();
        focusWindow(id);
    }

    function onMouseMove(e) {
        if (dragging) {
            let nextX = e.clientX - dragOffX;
            let nextY = e.clientY - dragOffY;

            // Snap Assist (Edges)
            const SNAP = 20;
            if (typeof window !== 'undefined') {
                 // Left
                 if (Math.abs(nextX) < SNAP) nextX = 0;
                 // Right
                 if (Math.abs(nextX + width - window.innerWidth) < SNAP) nextX = window.innerWidth - width;
                 // Top
                 if (Math.abs(nextY) < SNAP) nextY = 0;
                 // Bottom
                 if (Math.abs(nextY + height - window.innerHeight) < SNAP) nextY = window.innerHeight - height;
            }

            posX = nextX;
            posY = nextY;
        }
        if (resizing) {
            const minW = 300;
            const minH = 200;

            if (resizeDir.includes('e')) width = Math.max(minW, e.clientX - posX);
            if (resizeDir.includes('s')) height = Math.max(minH, e.clientY - posY);
            if (resizeDir.includes('w')) {
                const newW = Math.max(minW, posX + width - e.clientX);
                if (newW !== width) { posX = e.clientX; width = newW; }
            }
            if (resizeDir.includes('n')) {
                const newH = Math.max(minH, posY + height - e.clientY);
                if (newH !== height) { posY = e.clientY; height = newH; }
            }
        }
    }

    function onMouseUp() {
        if (dragging || resizing) {
            // FIX: Sync back to store so the "props" match the "local" state.
            // This prevents the "yank back" because the store will update,
            // then props update, matching local state.
            updateWindow(id, { x: posX, y: posY, w: width, h: height });
        }
        dragging = false;
        resizing = false;
        resizeDir = '';
    }

    function close() {
        closeWindow(id);
    }

    // Calculate Transform Origin for Scale
    let tOrigin = $derived.by(() => {
        let v = 'center'; let h = 'center';
        if (origin === 'center') return 'center center';
        if (origin.includes('t')) v = 'top';
        if (origin.includes('b')) v = 'bottom';
        if (origin.includes('l')) h = 'left';
        if (origin.includes('r')) h = 'right';
        return `${v} ${h}`;
    });

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
    style:transform-origin={tOrigin}
    onmousedown={onMouseDown}
    transition:scale={{ duration: 400, start: 0, easing: quintOut }}
>
    <!-- Cyberpunk Decoration lines -->
    <div class="deco-corner tl"></div>
    <div class="deco-corner tr"></div>
    <div class="deco-corner bl"></div>
    <div class="deco-corner br"></div>

    <div class="window-header" onmousedown={startDrag}>
        <div class="flex items-center gap-2">
            <span class="status-dot"></span>
            <span class="win-title"> // {title}</span>
        </div>
        <div class="controls">
            <button class="win-btn close-btn" onclick={close} aria-label="Close">
                <i class="ph ph-x"></i>
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
        background-color: rgba(5, 5, 8, 0.95);
        border: 1px solid #333;
        box-shadow: 0 0 30px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);
        display: flex;
        flex-direction: column;
        overflow: visible; /* For decoration */
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

    .window-frame.interacting { transition: none; }

    /* Decoration */
    .deco-corner { position: absolute; width: 10px; height: 10px; border: 2px solid var(--accent-color); pointer-events: none; transition: all 0.3s; opacity: 0.5; }
    .window-frame:focus-within .deco-corner, .window-frame:hover .deco-corner { opacity: 1; box-shadow: 0 0 10px var(--accent-color); }
    .tl { top: -1px; left: -1px; border-bottom: none; border-right: none; }
    .tr { top: -1px; right: -1px; border-bottom: none; border-left: none; }
    .bl { bottom: -1px; left: -1px; border-top: none; border-right: none; }
    .br { bottom: -1px; right: -1px; border-top: none; border-left: none; }

    .window-header {
        height: 40px;
        background: linear-gradient(90deg, rgba(255,255,255,0.05), transparent);
        border-bottom: 1px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        cursor: grab;
        user-select: none;
    }
    .window-header:active { cursor: grabbing; }

    .status-dot { width: 8px; height: 8px; background: var(--accent-color); border-radius: 50%; display: inline-block; box-shadow: 0 0 5px var(--accent-color); }

    .win-title {
        font-family: 'Space Mono', monospace;
        color: #aaa;
        font-size: 0.9rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .win-btn {
        background: none; border: none; color: #666; cursor: pointer;
        padding: 4px; border-radius: 4px; transition: all 0.2s;
        display: flex; align-items: center; justify-content: center;
    }
    .win-btn:hover { color: #fff; transform: scale(1.1); }
    .close-btn:hover { color: #ff5555; text-shadow: 0 0 10px red; }

    .window-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden; /* Prevent horiz scroll */
        padding: 0;
        position: relative;
        background: radial-gradient(circle at top right, rgba(20,20,30,0.5), transparent);
    }

    /* Resize Handles */
    .resize-handle { position: absolute; z-index: 10; }
    .n { top: -5px; left: 0; width: 100%; height: 10px; cursor: ns-resize; }
    .s { bottom: -5px; left: 0; width: 100%; height: 10px; cursor: ns-resize; }
    .e { top: 0; right: -5px; width: 10px; height: 100%; cursor: ew-resize; }
    .w { top: 0; left: -5px; width: 10px; height: 100%; cursor: ew-resize; }

    .ne { top: -5px; right: -5px; width: 20px; height: 20px; cursor: nesw-resize; z-index: 11; }
    .nw { top: -5px; left: -5px; width: 20px; height: 20px; cursor: nwse-resize; z-index: 11; }
    .se { bottom: -5px; right: -5px; width: 20px; height: 20px; cursor: nwse-resize; z-index: 11; }
    .sw { bottom: -5px; left: -5px; width: 20px; height: 20px; cursor: nesw-resize; z-index: 11; }

    /* Scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
</style>
