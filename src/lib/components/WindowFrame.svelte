<script>
    import { spring } from 'svelte/motion';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import ResizeHandle from './ResizeHandle.svelte';
    import { onMount } from 'svelte';

    let { win } = $props();

    // Determine initial position based on anchor for spawning animation
    let initialX = 0;
    let initialY = 0;

    // Check if running in browser
    if (typeof window !== 'undefined') {
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;

        if (win.anchor === 'tr') initialX = vpW - 100;
        else if (win.anchor === 'bl') initialY = vpH - 100;
        else if (win.anchor === 'br') {
            initialX = vpW - 100;
            initialY = vpH - 100;
        } else {
            // tl
            initialX = 20;
            initialY = 20;
        }
    }

    // Spring stores for smooth animation (60fps)
    const coords = spring({ x: initialX, y: initialY, w: 100, h: 100 }, {
        stiffness: 0.1,
        damping: 0.8
    });

    // Reactively update spring target when window position changes
    $effect(() => {
        if (win.position.width > 0) {
            coords.set({
                x: win.position.x,
                y: win.position.y,
                w: win.position.width,
                h: win.position.height
            });
        }
    });

    // Drag Logic (Floating only)
    let isDragging = $state(false);
    let dragStart = { x: 0, y: 0 };
    let winStart = { x: 0, y: 0 };

    function startDrag(e) {
        if (win.mode !== 'floating') return;
        // Check if target is a button, if so don't drag
        if (e.target.tagName === 'BUTTON') return;

        isDragging = true;
        windowManager.startDrag(win.id);
        dragStart = { x: e.clientX, y: e.clientY };
        winStart = { x: win.position.x, y: win.position.y };
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', stopDrag);
    }

    function onDrag(e) {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        windowManager.updateWindowRect(win.id, {
            x: winStart.x + dx,
            y: winStart.y + dy
        });
    }

    function stopDrag() {
        isDragging = false;
        windowManager.endDrag();
        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('mouseup', stopDrag);
    }

    // Resize Logic
    let isResizing = $state(false);
    let resizeStart = { w: 0, h: 0 };

    function startResize(e) {
        if (win.mode !== 'floating') return;
        isResizing = true;
        dragStart = { x: e.clientX, y: e.clientY };
        resizeStart = { w: win.position.width, h: win.position.height };
        window.addEventListener('mousemove', onResize);
        window.addEventListener('mouseup', stopResize);
    }

    function onResize(e) {
        if (!isResizing) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        windowManager.updateWindowRect(win.id, {
            width: Math.max(200, resizeStart.w + dx),
            height: Math.max(150, resizeStart.h + dy)
        });
    }

    function stopResize() {
        isResizing = false;
        window.removeEventListener('mousemove', onResize);
        window.removeEventListener('mouseup', stopResize);
    }

    function toggleMode() {
        const newMode = win.mode === 'tiled' ? 'floating' : 'tiled';
        windowManager.setMode(win.id, newMode);
    }

    function close() {
        windowManager.close(win.id);
    }

    function focus() {
        windowManager.focus(win.id);
    }

    // Derived Component
    const Component = $derived(win.component);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
    class="window-frame"
    class:floating={win.mode === 'floating'}
    class:dragging={isDragging}
    style:transform="translate({$coords.x}px, {$coords.y}px)"
    style:width="{$coords.w}px"
    style:height="{$coords.h}px"
    style:z-index={win.zIndex}
    onmousedown={focus}
    role="dialog"
    aria-labelledby="win-title-{win.id}"
>
    <!-- Header -->
    <div class="window-header" onmousedown={startDrag} role="group" aria-label="Window Controls">
        <span id="win-title-{win.id}" class="window-title">// {win.props.title || win.id}</span>
        <div class="window-controls">
            <button onclick={toggleMode} aria-label={win.mode === 'tiled' ? 'Float' : 'Tile'}>
                {win.mode === 'tiled' ? 'FLOAT' : 'TILE'}
            </button>
            <button onclick={close} class="close-btn" aria-label="Close">[X]</button>
        </div>
    </div>

    <!-- Content -->
    <div class="window-content">
        {#if Component}
            <Component {...win.props} />
        {/if}
    </div>

    <!-- Resize Handle -->
    {#if win.mode === 'floating'}
        <ResizeHandle onResizeStart={startResize} />
    {/if}
</div>

<style>
    .window-frame {
        position: fixed;
        top: 0; left: 0;
        background-color: var(--panel-bg, rgba(10, 10, 12, 0.85));
        border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        box-shadow: 0 0 50px rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        will-change: transform, width, height;
        user-select: none;
        pointer-events: auto;
    }

    .window-frame.dragging {
        pointer-events: none;
        opacity: 0.9;
        box-shadow: 0 0 60px rgba(85, 85, 255, 0.4);
    }

    .window-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        cursor: grab;
        flex-shrink: 0;
    }
    .window-header:active {
        cursor: grabbing;
    }

    .window-title {
        font-family: 'VT323', monospace;
        color: #888;
        font-size: 1.1rem;
    }

    .window-controls {
        display: flex;
        gap: 10px;
    }

    .window-controls button {
        background: none;
        border: none;
        color: #666;
        font-family: 'Space Mono', monospace;
        font-size: 0.8rem;
        cursor: pointer;
        transition: color 0.2s;
    }
    .window-controls button:hover {
        color: #fff;
    }
    .window-controls .close-btn:hover {
        color: #ff5555;
    }

    .window-content {
        flex: 1;
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
    }

    .window-content :global(*::-webkit-scrollbar) {
        width: 6px;
        height: 6px;
    }
    .window-content :global(*::-webkit-scrollbar-track) {
        background: #000;
    }
    .window-content :global(*::-webkit-scrollbar-thumb) {
        background: #333;
        border-radius: 3px;
    }
</style>
