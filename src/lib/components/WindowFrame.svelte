<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';

    let { win } = $props();

    let isDragging = $state(false);
    let isResizing = $state(false);
    let resizeDir = '';
    let startX = 0, startY = 0, startLeft = 0, startTop = 0, startWidth = 0, startHeight = 0;

    let frameEl;
    let isClosing = $state(false);

    let animationState = $state('initial');

    // Drop Zone Highlighting (Local state)
    let dropZone = $state(null); // 'master', 'stack', or null

    let currentStyle = $derived.by(() => {
        if (isDragging || isResizing) {
            return `
                left: ${win.x}px;
                top: ${win.y}px;
                width: ${win.width}px;
                height: ${win.height}px;
                z-index: ${win.zIndex};
                opacity: 1 !important;
                transform: none !important;
                transition: none !important;
            `;
        }

        if (win.state === 'closing') {
             if (win.originRect) {
                 return `
                    left: ${win.originRect.left}px;
                    top: ${win.originRect.top}px;
                    width: ${win.originRect.width}px;
                    height: ${win.originRect.height}px;
                    z-index: ${win.zIndex};
                    opacity: 0;
                    transform: scale(0.5);
                    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                 `;
             }
             return `
                left: ${win.x}px;
                top: ${win.y}px;
                width: ${win.width}px;
                height: ${win.height}px;
                z-index: ${win.zIndex};
                opacity: 0;
                transform: scale(0.95);
                transition: opacity 0.3s, transform 0.3s;
             `;
        }

        if (animationState === 'initial') {
            if (win.originRect) {
                return `
                    left: ${win.originRect.left}px;
                    top: ${win.originRect.top}px;
                    width: ${win.originRect.width}px;
                    height: ${win.originRect.height}px;
                    z-index: ${win.zIndex};
                    opacity: 0;
                    transform: scale(0.8);
                    transition: none;
                `;
            } else {
                 return `
                    left: ${win.x}px;
                    top: ${win.y}px;
                    width: ${win.width}px;
                    height: ${win.height}px;
                    z-index: ${win.zIndex};
                    opacity: 0;
                    transform: scale(0.9);
                    transition: none;
                `;
            }
        }

        return `
            left: ${win.x}px;
            top: ${win.y}px;
            width: ${win.width}px;
            height: ${win.height}px;
            z-index: ${win.zIndex};
            opacity: 1;
            transform: scale(1);
            transition: left 0.5s cubic-bezier(0.19, 1, 0.22, 1),
                        top 0.5s cubic-bezier(0.19, 1, 0.22, 1),
                        width 0.5s cubic-bezier(0.19, 1, 0.22, 1),
                        height 0.5s cubic-bezier(0.19, 1, 0.22, 1),
                        opacity 0.3s ease,
                        transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        `;
    });

    onMount(() => {
        requestAnimationFrame(() => {
            animationState = 'animating';
        });
    });

    /** @param {MouseEvent} e */
    function handleMouseDown(e) {
        /** @type {HTMLElement} */
        // @ts-ignore
        const target = e.target;

        // Prevent drag on interactive elements
        const ignoreTags = ['BUTTON', 'INPUT', 'TEXTAREA', 'A', 'SELECT', 'OPTION', 'PRE', 'CODE', 'TABLE'];
        if (target.closest('button') || target.closest('.resize-handle') || ignoreTags.includes(target.tagName) || target.closest('.selectable') || target.closest('.no-drag') || target.tagName === 'path') {
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

        win.x = startLeft + dx;
        win.y = startTop + dy;

        // Revised Zone Logic: Only trigger if very close to edges (< 50px)
        const screenW = window.innerWidth;
        const mouseX = e.clientX;

        if (mouseX < 50) {
             // @ts-ignore
             dropZone = 'master';
        }
        else if (mouseX > screenW - 50) {
             // @ts-ignore
             dropZone = 'stack';
        }
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

    /** @param {MouseEvent} e */
    function closeWindow(e) {
        e.stopPropagation();
        windowManager.close(win.id);
    }
</script>

<!-- Minimal Edge Indicators -->
{#if isDragging}
    <div class="edge-glow left" class:active={dropZone === 'master'}></div>
    <div class="edge-glow right" class:active={dropZone === 'stack'}></div>
{/if}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={frameEl}
    class="window-frame {win.state}"
    class:dragging={isDragging}
    class:resizing={isResizing}
    style={currentStyle}
    onmousedown={handleMouseDown}
>
    <!-- Close Button (Standard X) -->
    <button class="close-btn" onclick={closeWindow} aria-label="Close" type="button">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    </button>

    <!-- Content -->
    <div class="content-wrapper">
        <div class="window-content">
            {#if win.component}
                {@const Component = win.component}
                <Component {...(win.props || {})} />
            {/if}
        </div>
    </div>

    <!-- Resize Handles -->
    <div class="resize-handle n" onmousedown={(e) => initResize(e, 'n')} role="button" tabindex="0"></div>
    <div class="resize-handle s" onmousedown={(e) => initResize(e, 's')} role="button" tabindex="0"></div>
    <div class="resize-handle e" onmousedown={(e) => initResize(e, 'e')} role="button" tabindex="0"></div>
    <div class="resize-handle w" onmousedown={(e) => initResize(e, 'w')} role="button" tabindex="0"></div>
    <div class="resize-handle ne" onmousedown={(e) => initResize(e, 'ne')} role="button" tabindex="0"></div>
    <div class="resize-handle nw" onmousedown={(e) => initResize(e, 'nw')} role="button" tabindex="0"></div>
    <div class="resize-handle se" onmousedown={(e) => initResize(e, 'se')} role="button" tabindex="0"></div>
    <div class="resize-handle sw" onmousedown={(e) => initResize(e, 'sw')} role="button" tabindex="0"></div>
</div>

<style>
    .window-frame {
        position: absolute;
        background: rgba(10, 10, 12, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        pointer-events: auto;
    }

    .window-frame.dragging,
    .window-frame.resizing {
        box-shadow: 0 20px 50px rgba(85, 85, 255, 0.3);
        z-index: 1000 !important;
    }

    .content-wrapper {
        position: absolute;
        top: 12px; left: 12px; right: 12px; bottom: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        pointer-events: auto;
    }

    .window-content {
        flex: 1;
        overflow: auto;
        position: relative;
        padding: 1rem;
    }

    .resize-handle { position: absolute; z-index: 100; outline: none; }
    .n { top: 0; left: 0; right: 0; height: 8px; cursor: ns-resize; }
    .s { bottom: 0; left: 0; right: 0; height: 8px; cursor: ns-resize; }
    .e { top: 0; bottom: 0; right: 0; width: 8px; cursor: ew-resize; }
    .w { top: 0; bottom: 0; left: 0; width: 8px; cursor: ew-resize; }
    .ne { top: 0; right: 0; width: 16px; height: 16px; cursor: ne-resize; z-index: 101; }
    .nw { top: 0; left: 0; width: 16px; height: 16px; cursor: nw-resize; z-index: 101; }
    .se { bottom: 0; right: 0; width: 16px; height: 16px; cursor: se-resize; z-index: 101; }
    .sw { bottom: 0; left: 0; width: 16px; height: 16px; cursor: sw-resize; z-index: 101; }

    .close-btn {
        position: absolute;
        top: 0; right: 0;
        width: 40px; height: 40px;
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.5);
        z-index: 102;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s, transform 0.2s;
    }

    .close-btn:hover {
        color: #fff;
        transform: scale(1.1);
        filter: drop-shadow(0 0 5px var(--accent-color));
    }

    .close-btn:active {
        transform: scale(0.95);
    }

    /* New Minimal Edge Indicators - Refined */
    .edge-glow {
        position: fixed;
        top: 10vh; bottom: 10vh; /* Don't cover full height */
        width: 100px;
        background: radial-gradient(ellipse at center left, rgba(85,85,255,0.15) 0%, transparent 70%);
        z-index: 900;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
        filter: blur(20px); /* Diffuse it */
    }

    .edge-glow.left { left: 0; background: radial-gradient(ellipse at center left, rgba(85,85,255,0.15) 0%, transparent 70%); }
    .edge-glow.right { right: 0; background: radial-gradient(ellipse at center right, rgba(85,85,255,0.15) 0%, transparent 70%); }

    .edge-glow.active {
        opacity: 1;
        /* box-shadow removed, relying on gradient and blur for softness */
    }
</style>
