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
    let borderRadius = $derived(win.isTiled ? "4px" : "12px");

        let currentStyle = $derived.by(() => {
        const originMap = {
            'tl': 'top left',
            'tr': 'top right',
            'bl': 'bottom left',
            'br': 'bottom right',
            'bc': 'bottom center'
        };
        const transformOrigin = originMap[/** @type {keyof typeof originMap} */ (win.originType)] || 'center center';

        if (isDragging || isResizing) {
            return `
                left: ${win.x}px;
                top: ${win.y}px;
                width: ${win.width}px;
                height: ${win.height}px; border-radius: ${borderRadius};
                z-index: ${win.zIndex};
                opacity: 1 !important;
                transform: none !important;
                transition: none !important;
                transform-origin: ${transformOrigin};
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
                    transform: scale(0.1);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-origin: ${transformOrigin};
                 `;
             }
             return `
                left: ${win.x}px;
                top: ${win.y}px;
                width: ${win.width}px;
                height: ${win.height}px; border-radius: ${borderRadius};
                z-index: ${win.zIndex};
                opacity: 0;
                transform: scale(0.9);
                transition: opacity 0.2s, transform 0.2s;
                transform-origin: ${transformOrigin};
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
                    transform: scale(0.1);
                    transition: none;
                    transform-origin: ${transformOrigin};
                `;
            } else {
                 // For bc (bottom center) or others without originRect
                 let startX = win.x;
                 let startY = win.y;
                 if (win.originType === 'bc') {
                     startX = window.innerWidth / 2 - win.width / 2;
                     startY = window.innerHeight;
                 }

                 return `
                    left: ${startX}px;
                    top: ${startY}px;
                    width: ${win.width}px;
                    height: ${win.height}px; border-radius: ${borderRadius};
                    z-index: ${win.zIndex};
                    opacity: 0;
                    transform: scale(0.1);
                    transition: none;
                    transform-origin: ${transformOrigin};
                `;
            }
        }

        return `
            left: ${win.x}px;
            top: ${win.y}px;
            width: ${win.width}px;
            height: ${win.height}px; border-radius: ${borderRadius};
            z-index: ${win.zIndex};
            opacity: 1;
            transform: scale(1);
            transform-origin: ${transformOrigin};
            transition: left 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        top 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        width 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        height 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        opacity 0.2s ease,
                        transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
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

        // Also ignore text elements to allow selection
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

        // Clamp to screen boundaries
        newX = Math.max(0, Math.min(newX, screenW - win.width));
        newY = Math.max(0, Math.min(newY, screenH - win.height));

        win.x = newX;
        win.y = newY;

        // Revised Zone Logic: Only trigger if very close to edges (< 50px)
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
<!-- Window Title -->
    <div class="window-title-bar">
        {win.title || 'SYSTEM_PROCESS'}
    </div>

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
        background: rgba(10, 10, 15, 0.75);
        border: 1px solid var(--accent-color);
        backdrop-filter: blur(8px);
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        pointer-events: auto;
        transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    top 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    width 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    height 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    border-radius 0.3s ease;
    }

    .window-frame.dragging,
    .window-frame.resizing {
        box-shadow: 0 0 20px var(--accent-color);
        z-index: 1000 !important;
    }

    .content-wrapper {
        position: absolute;
        top: 20px; left: 0; right: 0; bottom: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        pointer-events: auto;
    }

    .window-content {
        flex: 1;
        overflow: auto;
        position: relative;
        padding: 0.5rem;
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


    .window-title-bar {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 20px;
        display: flex;
        align-items: center;
        padding: 0 8px;
        font-family: 'VT323', monospace;
        font-size: 11px;
        color: var(--accent-color);
        opacity: 0.5;
        pointer-events: none;
        text-transform: uppercase;
        letter-spacing: 1px;
        z-index: 101;
    }

    .close-btn {
        position: absolute;
        top: 0px; right: 0px;
        width: 28px; height: 28px;
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        z-index: 102;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .close-btn svg {
        width: 10px;
        height: 20px;
    }

    .close-btn:hover {
        color: #ff5555;
        filter: drop-shadow(0 0 5px rgba(255, 85, 85, 0.8));
    }



    /* New Minimal Edge Indicators - Refined */
    .edge-glow {
        position: fixed;
        top: 10vh; bottom: 10vh; /* Don't cover full height */
        width: 40px;
        background: radial-gradient(ellipse at center left, rgba(85,85,255,0.1) 0%, transparent 70%);
        z-index: 900;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
        filter: blur(20px); /* Diffuse it */
    }

    .edge-glow.left { left: 0; background: radial-gradient(ellipse at center left, rgba(85,85,255,0.1) 0%, transparent 70%); }
    .edge-glow.right { right: 0; background: radial-gradient(ellipse at center right, rgba(85,85,255,0.1) 0%, transparent 70%); }

    .edge-glow.active {
        opacity: 1;
        /* box-shadow removed, relying on gradient and blur for softness */
    }
</style>
