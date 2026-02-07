<script>
    import { windowManager } from '$lib/stores/windowManager';
    import ResizeHandle from './ResizeHandle.svelte';
    import { cubicOut } from 'svelte/easing';
    import { onMount, onDestroy } from 'svelte';

    let { id, rect, zIndex, title, component: Component, origin, isOpen, isFloating, onDragStart, onDragEnd } = $props();

    let isDragging = $state(false);
    let isResizing = $state(false);
    let dragStart = { x: 0, y: 0 };
    let initialRect = { x: 0, y: 0, w: 0, h: 0 };
    let resizePos = null;

    // --- DRAGGING ---
    function onMouseDown(e) {
        if (e.button !== 0) return;

        // Only drag from header
        const target = e.target;
        if (!target.closest('.window-header')) return;

        e.preventDefault();
        windowManager.focus(id);

        isDragging = true;
        dragStart = { x: e.clientX, y: e.clientY };
        initialRect = { ...rect };

        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', onStopDrag);

        if (onDragStart) onDragStart();
    }

    function onDrag(e) {
        if (!isDragging) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        windowManager.move(id, initialRect.x + dx, initialRect.y + dy);
    }

    function onStopDrag(e) {
        isDragging = false;
        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('mouseup', onStopDrag);

        if (onDragEnd) onDragEnd(e.clientX, e.clientY);
    }

    // --- RESIZING ---
    function onResizeStart({ position, startX, startY }) {
        windowManager.focus(id);

        isResizing = true;
        resizePos = position;
        dragStart = { x: startX, y: startY };
        initialRect = { ...rect };

        window.addEventListener('mousemove', onResize);
        window.addEventListener('mouseup', onStopResize);
    }

    function onResize(e) {
        if (!isResizing) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        let newX = initialRect.x;
        let newY = initialRect.y;
        let newW = initialRect.w;
        let newH = initialRect.h;

        const MIN_SIZE = 200;

        if (resizePos.includes('l')) {
            if (initialRect.w - dx >= MIN_SIZE) {
                newW = initialRect.w - dx;
                newX = initialRect.x + dx;
            }
        }
        if (resizePos.includes('r')) {
            if (initialRect.w + dx >= MIN_SIZE) {
                newW = initialRect.w + dx;
            }
        }
        if (resizePos.includes('t')) {
            if (initialRect.h - dy >= MIN_SIZE) {
                newH = initialRect.h - dy;
                newY = initialRect.y + dy;
            }
        }
        if (resizePos.includes('b')) {
            if (initialRect.h + dy >= MIN_SIZE) {
                newH = initialRect.h + dy;
            }
        }

        windowManager.updateRect(id, { x: newX, y: newY, w: newW, h: newH });
    }

    function onStopResize() {
        isResizing = false;
        window.removeEventListener('mousemove', onResize);
        window.removeEventListener('mouseup', onStopResize);
    }

    // --- TRANSITION ---
    function spawnTransition(node, { duration = 500 }) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;

        // Calculate start position relative to target
        let startX = 0, startY = 0;

        // We use window.innerWidth/Height to estimate corner positions relative to the window's final position
        if (origin === 'tl') { startX = -rect.x; startY = -rect.y; }
        else if (origin === 'tr') { startX = window.innerWidth - (rect.x + rect.w); startY = -rect.y; }
        else if (origin === 'bl') { startX = -rect.x; startY = window.innerHeight - (rect.y + rect.h); }
        else if (origin === 'br') { startX = window.innerWidth - (rect.x + rect.w); startY = window.innerHeight - (rect.y + rect.h); }

        return {
            duration,
            easing: cubicOut,
            css: (t, u) => `
                transform: ${transform} translate(${startX * u}px, ${startY * u}px) scale(${0.5 + 0.5 * t});
                opacity: ${t};
            `
        };
    }
</script>

<div
    class="window-container"
    class:floating={isFloating}
    class:dragging={isDragging || isResizing}
    style:top={rect.y + 'px'}
    style:left={rect.x + 'px'}
    style:width={rect.w + 'px'}
    style:height={rect.h + 'px'}
    style:z-index={zIndex}
    transition:spawnTransition
>
    <!-- Header / Drag Handle -->
    <div
        class="window-header"
        onmousedown={onMouseDown}
        role="button"
        tabindex="0"
    >
        <span class="window-title">{title}</span>
    </div>

    <!-- Content -->
    <div class="window-content-wrapper">
         <Component />
    </div>

    <!-- Resize Handles -->
    <ResizeHandle position="tl" onResizeStart={onResizeStart} />
    <ResizeHandle position="tr" onResizeStart={onResizeStart} />
    <ResizeHandle position="bl" onResizeStart={onResizeStart} />
    <ResizeHandle position="br" onResizeStart={onResizeStart} />
</div>

<style>
    .window-container {
        position: absolute;
        background: var(--panel-bg, #0a0a0c);
        border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        /* Transitions for Tiling Mode */
        transition: top 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                    left 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                    width 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                    height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: top, left, width, height;
    }

    .window-container.floating.dragging {
        transition: none;
        box-shadow: 0 0 50px rgba(85, 85, 255, 0.2);
        border-color: var(--accent-color);
    }

    /* Header */
    .window-header {
        height: 30px;
        background: rgba(255,255,255,0.02);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex;
        align-items: center;
        padding: 0 10px;
        cursor: grab;
        user-select: none;
        flex-shrink: 0;
    }
    .window-container.floating .window-header {
        cursor: grab;
    }
    .window-container.floating.dragging .window-header {
        cursor: grabbing;
    }

    .window-title {
        font-family: 'Space Mono', monospace;
        font-size: 0.8rem;
        color: #888;
        letter-spacing: 1px;
    }

    .window-content-wrapper {
        flex: 1;
        overflow: auto;
        position: relative;
    }
</style>
