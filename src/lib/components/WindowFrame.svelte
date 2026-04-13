<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { onMount, tick } from 'svelte';

    /** @type {{ win: any }} */
    let { win } = $props();

    let isDragging = $state(false);
    let isResizing = $state(false);
    let resizeDir = $state('');
    let startX, startY, startLeft, startTop, startWidth, startHeight;

    /** @type {HTMLElement} */
    let frameEl = $state();
    let dropZone = $state(null);

        let transformOrigin = $derived.by(() => {
        const type = win.state === 'closing' ? win.birthOriginType : win.originType;
        if (!type) return 'center center';
        if (type === 'tl') return 'top left';
        if (type === 'tr') return 'top right';
        if (type === 'bl') return 'bottom left';
        if (type === 'br') return 'bottom right';
        if (type === 'bc') return 'bottom center';
        return 'center center';
    });

        let currentStyle = $derived.by(() => {
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1280;
        const screenH = typeof window !== 'undefined' ? window.innerHeight : 720;

        const baseStyles = [
            `z-index: ${win.zIndex}`,
            `transform-origin: ${transformOrigin}`
        ];

        if (win.minimized) {
             const dockEl = typeof document !== 'undefined' ? document.getElementById(`dock-item-${win.id}`) : null;
             const dockRect = dockEl ? dockEl.getBoundingClientRect() : { left: screenW/2, top: screenH, width: 50, height: 50 };
             return [
                 ...baseStyles,
                 `left: ${dockRect.left}px`,
                 `top: ${dockRect.top}px`,
                 `width: ${dockRect.width}px`,
                 `height: ${dockRect.height}px`,
                 `opacity: 0`,
                 `transform: scale(0.1) rotate(-5deg) skewX(10deg)`,
                 `pointer-events: none`
             ].join('; ');
        }

        if (win.state === 'opening' || win.state === 'closing') {
             const origin = win.state === 'closing' ? win.birthOriginRect : win.originRect;
             const actualOrigin = origin || { left: screenW / 2, top: screenH, width: 100, height: 100 };
             return [
                 ...baseStyles,
                 `left: ${actualOrigin.left}px`,
                 `top: ${actualOrigin.top}px`,
                 `width: ${actualOrigin.width}px`,
                 `height: ${actualOrigin.height}px`,
                 `opacity: 0`,
                 `transform: scale(0.1) rotate(5deg) skewX(-10deg)`,
                 `pointer-events: none`
             ].join('; ');
        }

        return [
            ...baseStyles,
            `left: ${win.x}px`,
            `top: ${win.y}px`,
            `width: ${win.width}px`,
            `height: ${win.height}px`,
            `opacity: 1`,
            `transform: scale(1) rotate(0deg) skewX(0deg)`,
            `border-radius: ${win.isTiled ? '4px' : '16px'}`
        ].join('; ');
    });

    /** @param {MouseEvent} e */
    function handleMouseDown(e) {
        if (win.isMaximized) return;

        const target = /** @type {HTMLElement} */ (e.target);

        // If clicking a control dot, don't start drag
        if (target.closest('.window-controls')) return;

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

        const minVisible = 40;
        newX = Math.max(minVisible - win.width, Math.min(newX, screenW - minVisible));
        newY = Math.max(0, Math.min(newY, screenH - minVisible));

        win.x = newX;
        win.y = newY;

        const mouseX = e.clientX;
        if (mouseX < 20) dropZone = 'master';
        else if (mouseX > screenW - 20) dropZone = 'stack';
        else dropZone = null;
    }

    function stopDrag() {
        isDragging = false;
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', stopDrag);
        windowManager.stopDrag();

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        const clampedX = Math.max(0, Math.min(win.x, screenW - win.width));
        const clampedY = Math.max(0, Math.min(win.y, screenH - win.height));

        if (win.x !== clampedX || win.y !== clampedY) {
            win.x = clampedX;
            win.y = clampedY;
        }

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
    class:minimized={win.minimized}
    style={currentStyle}
>
    <!-- Window Controls (Mac Style Dots) -->
    <div class="window-header" onmousedown={handleMouseDown}>
        <div class="window-controls">
            <button class="control-dot close" onclick={() => windowManager.close(win.id)} aria-label="Close"></button>
            <button class="control-dot minimize" onclick={() => windowManager.minimize(win.id)} aria-label="Minimize"></button>
            <button class="control-dot maximize" onclick={() => windowManager.maximize(win.id)} aria-label="Maximize"></button>
        </div>
        <div class="window-title">
            <i class="ph-fill {windowManager.getIcon(win.id)} mr-2 opacity-50"></i>
            {win.title}
        </div>
    </div>

    <!-- Content -->
    <div class="content-wrapper">
        <div class="window-content custom-scrollbar {win.id}">
            {#if win.component}
                {@const Component = win.component}
                <Component win={win} {...(win.props || {})} />
            {/if}
        </div>
    </div>

    <!-- Resize Handles -->
    {#if !win.isMaximized && !win.minimized}
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
        background: rgba(10, 10, 15, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(24px) saturate(150%);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        pointer-events: auto;
        transition: left 0.8s cubic-bezier(0.25, 1.25, 0.5, 1),
                    top 0.8s cubic-bezier(0.25, 1.25, 0.5, 1),
                    width 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                    height 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                    opacity 0.5s ease,
                    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                    border-radius 0.3s ease;
        transform-origin: center center;
    }

    .window-frame.maximized {
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        left: 0 !important;
        top: 0 !important;
        transform: none !important;
        border-radius: 0 !important;
        border: none;
    }

    .window-frame.minimized {
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        filter: blur(10px);
    }

    .window-frame.dragging,
    .window-frame.resizing {
        box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
        z-index: 1000 !important;
        transition: opacity 0.3s ease;
    }

    .window-header {
        cursor: grab;
        height: 38px;
        display: flex;
        align-items: center;
        padding: 0 16px;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        flex-shrink: 0;
        gap: 12px;
    }

    .window-header:active { cursor: grabbing; }

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
        margin-right: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
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


</style>
