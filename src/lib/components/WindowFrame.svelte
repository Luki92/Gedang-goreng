<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { onMount } from 'svelte';

    /** @type {{ win: any }} */
    let { win } = $props();

    let isDragging = $state(false);
    let isResizing = $state(false);
    let resizeDir = $state('');
    let startX, startY, startLeft, startTop, startWidth, startHeight;

    /** @type {HTMLElement} */
    let frameEl = $state();
    let dropZone = $state(null);

    let currentStyle = $derived.by(() => {
        if (win.minimized) return 'display: none;';

        const style = [
            `left: ${win.x}px`,
            `top: ${win.y}px`,
            `width: ${win.width}px`,
            `height: ${win.height}px`,
            `z-index: ${win.zIndex}`,
            `border-radius: ${win.isTiled ? '4px' : '12px'}`
        ];

        if (win.state === 'opening' && win.originRect) {
            // Animation from origin logic (simplified for now)
        }

        return style.join('; ');
    });

    /** @param {MouseEvent} e */
    function handleMouseDown(e) {
        if (win.isMaximized) return; // Prevent dragging maximized windows

        const target = /** @type {HTMLElement} */ (e.target);
        const ignoreTags = ['INPUT', 'TEXTAREA', 'SELECT', 'A', 'I'];
        const isText = target.matches('p, p *, span, span *, h1, h2, h3, h4, h5, h6, li, li *, .selectable-text, .selectable-text *');

        if (target.closest('button') || target.closest('.resize-handle') || ignoreTags.includes(target.tagName) || target.closest('.selectable') || target.closest('.no-drag') || target.tagName === 'path' || isText) {
            return;
        }

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = win.x;
        startTop = win.y;

        windowManager.focus(win.id);
        windowManager.untile(win.id);

        window.addEventListener('mousemove', handleDrag);
        window.addEventListener('mouseup', stopDrag);
    }

    /** @param {MouseEvent} e */
    function handleDrag(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        let newX = startLeft + dx;
        let newY = startTop + dy;

        newX = Math.max(0, Math.min(newX, screenW - win.width));
        newY = Math.max(0, Math.min(newY, screenH - win.height));

        win.x = newX;
        win.y = newY;

        const mouseX = e.clientX;
        if (mouseX < 50) dropZone = 'master';
        else if (mouseX > screenW - 50) dropZone = 'stack';
        else dropZone = null;
    }

    function stopDrag() {
        isDragging = false;
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', stopDrag);
        windowManager.stopDrag();

        if (dropZone) {
            windowManager.snap(win.id, dropZone);
            dropZone = null;
        }
    }

    /**
     * @param {MouseEvent} e
     * @param {string} dir
     */
    function initResize(e, dir) {
        e.stopPropagation();
        e.preventDefault();
        isResizing = true;
        resizeDir = dir;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = win.x;
        startTop = win.y;
        startWidth = win.width;
        startHeight = win.height;

        windowManager.focus(win.id);
        windowManager.untile(win.id);

        window.addEventListener('mousemove', handleResize);
        window.addEventListener('mouseup', stopResize);
    }

    /** @param {MouseEvent} e */
    function handleResize(e) {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newW = startWidth;
        let newH = startHeight;
        let newX = startLeft;
        let newY = startTop;

        if (resizeDir.includes('e')) newW = Math.max(200, startWidth + dx);
        if (resizeDir.includes('w')) {
            const proposedW = startWidth - dx;
            if (proposedW >= 200) {
                newW = proposedW;
                newX = startLeft + dx;
            } else {
                newW = 200;
                newX = startLeft + (startWidth - 200);
            }
        }
        if (resizeDir.includes('s')) newH = Math.max(150, startHeight + dy);
        if (resizeDir.includes('n')) {
            const proposedH = startHeight - dy;
            if (proposedH >= 150) {
                newH = proposedH;
                newY = startTop + dy;
            } else {
                newH = 150;
                newY = startTop + (startHeight - 150);
            }
        }

        win.width = newW;
        win.height = newH;
        win.x = newX;
        win.y = newY;
    }

    function stopResize() {
        isResizing = false;
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', stopResize);
        windowManager.stopDrag();
    }
</script>

{#if isDragging}
    <div class="edge-glow left" class:active={dropZone === 'master'}></div>
    <div class="edge-glow right" class:active={dropZone === 'stack'}></div>
{/if}

<div
    bind:this={frameEl}
    class="window-frame {win.state}"
    class:dragging={isDragging}
    class:resizing={isResizing}
    class:maximized={win.isMaximized}
    style={currentStyle}
    onmousedown={handleMouseDown}
>
    <!-- Window Controls (Mac Style Dots) -->
    <div class="window-header">
        <div class="window-controls">
            <button class="control-dot close" onclick={() => windowManager.close(win.id)} aria-label="Close"></button>
            <button class="control-dot minimize" onclick={() => windowManager.minimize(win.id)} aria-label="Minimize"></button>
            <button class="control-dot maximize" onclick={() => windowManager.maximize(win.id)} aria-label="Maximize"></button>
        </div>
        <div class="window-title">{win.title}</div>
    </div>

    <!-- Content -->
    <div class="content-wrapper">
        <div class="window-content custom-scrollbar">
            {#if win.component}
                {@const Component = win.component}
                <Component win={win} {...(win.props || {})} />
            {/if}
        </div>
    </div>

    <!-- Resize Handles -->
    {#if !win.isMaximized}
        <div class="resize-handle n" onmousedown={(e) => initResize(e, 'n')} role="button" tabindex="0"></div>
        <div class="resize-handle s" onmousedown={(e) => initResize(e, 's')} role="button" tabindex="0"></div>
        <div class="resize-handle e" onmousedown={(e) => initResize(e, 'e')} role="button" tabindex="0"></div>
        <div class="resize-handle w" onmousedown={(e) => initResize(e, 'w')} role="button" tabindex="0"></div>
        <div class="resize-handle ne" onmousedown={(e) => initResize(e, 'ne')} role="button" tabindex="0"></div>
        <div class="resize-handle nw" onmousedown={(e) => initResize(e, 'nw')} role="button" tabindex="0"></div>
        <div class="resize-handle se" onmousedown={(e) => initResize(e, 'se')} role="button" tabindex="0"></div>
        <div class="resize-handle sw" onmousedown={(e) => initResize(e, 'sw')} role="button" tabindex="0"></div>
    {/if}
</div>

<style>
    .window-frame {
        position: absolute;
        background: rgba(10, 10, 15, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        pointer-events: auto;
        transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    top 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    width 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    height 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    border-radius 0.3s ease,
                    box-shadow 0.3s ease;
    }

    .window-frame.maximized {
        border-radius: 0 !important;
        border: none;
    }

    .window-frame.dragging,
    .window-frame.resizing {
        box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
        z-index: 1000 !important;
        transition: none; /* Smooth dragging */
    }

    .window-header {
        height: 38px;
        display: flex;
        align-items: center;
        padding: 0 16px;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        flex-shrink: 0;
        gap: 12px;
    }

    .window-controls {
        display: flex;
        gap: 8px;
    }

    .control-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        transition: filter 0.2s;
        padding: 0;
    }

    .control-dot:hover {
        filter: brightness(1.2);
    }

    .control-dot.close { background-color: #ff5f56; }
    .control-dot.minimize { background-color: #ffbd2e; }
    .control-dot.maximize { background-color: #27c93f; }

    .window-title {
        flex: 1;
        text-align: center;
        font-family: 'Space Mono', monospace;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: rgba(255, 255, 255, 0.4);
        pointer-events: none;
        margin-right: 60px; /* Offset to center title relative to window, not just available space */
    }

    .content-wrapper {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .window-content {
        flex: 1;
        overflow: auto;
        position: relative;
        padding: 0;
    }

    /* Resize handles stay the same but cleaner */
    .resize-handle { position: absolute; z-index: 100; }
    .n { top: 0; left: 0; right: 0; height: 4px; cursor: ns-resize; }
    .s { bottom: 0; left: 0; right: 0; height: 4px; cursor: ns-resize; }
    .e { top: 0; bottom: 0; right: 0; width: 4px; cursor: ew-resize; }
    .w { top: 0; bottom: 0; left: 0; width: 4px; cursor: ew-resize; }
    .ne { top: 0; right: 0; width: 10px; height: 10px; cursor: ne-resize; z-index: 101; }
    .nw { top: 0; left: 0; width: 10px; height: 10px; cursor: nw-resize; z-index: 101; }
    .se { bottom: 0; right: 0; width: 10px; height: 10px; cursor: se-resize; z-index: 101; }
    .sw { bottom: 0; left: 0; width: 10px; height: 10px; cursor: sw-resize; z-index: 101; }

    .edge-glow {
        position: fixed;
        top: 0; bottom: 0;
        width: 60px;
        z-index: 900;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
    }
    .edge-glow.left { left: 0; background: linear-gradient(to right, rgba(39, 201, 63, 0.1), transparent); }
    .edge-glow.right { right: 0; background: linear-gradient(to left, rgba(39, 201, 63, 0.1), transparent); }
    .edge-glow.active { opacity: 1; }

    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
</style>
