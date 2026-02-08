<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { fade } from 'svelte/transition';

    let { win } = $props();

    let isDragging = $state(false);
    let isResizing = $state(false);
    let resizeDir = '';
    let startX = 0, startY = 0, startLeft = 0, startTop = 0, startWidth = 0, startHeight = 0;

    // Determine close button position based on origin
    const closePos = $derived.by(() => {
        if (!win.originRect) return 'tr';
        const cx = win.originRect.left + (win.originRect.width / 2);
        const cy = win.originRect.top + (win.originRect.height / 2);
        const sw = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const sh = typeof window !== 'undefined' ? window.innerHeight : 1000;

        const y = cy < sh / 2 ? 't' : 'b';
        const x = cx < sw / 2 ? 'l' : 'r';
        return y + x;
    });

    /** @param {MouseEvent} e */
    function handleMouseDown(e) {
        // Prevent drag if clicking buttons or interactive elements
        // Also check if target is the SVG path (which has pointer-events: stroke)
        // @ts-ignore
        if (e.target.closest('button') || e.target.closest('.resize-handle') || e.target.closest('input') || e.target.closest('a') || e.target.tagName === 'path') return;

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
    }

    function stopDrag() {
        isDragging = false;
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', stopDrag);
    }

    /**
     * @param {MouseEvent} e
     * @param {string} dir
     */
    function initResize(e, dir) {
        e.stopPropagation();
        e.preventDefault(); // Prevent text selection
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
    }

    /** @param {MouseEvent} e */
    function closeWindow(e) {
        e.stopPropagation();
        windowManager.close(win.id);
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="window-frame {win.state}"
    class:dragging={isDragging}
    class:resizing={isResizing}
    style="
        left: {win.x}px;
        top: {win.y}px;
        width: {win.width}px;
        height: {win.height}px;
        z-index: {win.zIndex};
    "
    onmousedown={handleMouseDown}
>
    <!-- Close Button (L-Shape) -->
    <!-- pointer-events: none on wrapper, stroke on path. Events bubble to onclick. -->
    <button class="close-btn {closePos}" onclick={closeWindow} aria-label="Close" type="button">
        <svg viewBox="0 0 40 40" class="l-shape">
            <path d="M5,35 L5,5 L35,5" fill="none" stroke="currentColor" stroke-width="4" vector-effect="non-scaling-stroke" />
            <!-- Hitbox Helper: Transparent thicker stroke -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <path d="M5,35 L5,5 L35,5" fill="none" stroke="transparent" stroke-width="20" vector-effect="non-scaling-stroke" />
        </svg>
    </button>

    <!-- Content -->
    <!-- Content Wrapper to prevent scrollbar/resize conflict -->
    <div class="content-wrapper">
        <div class="window-content">
            {#if win.component}
                {@const Component = win.component}
                <Component />
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
        /* Smooth transitions for tiling */
        transition: left 0.5s cubic-bezier(0.19, 1, 0.22, 1),
                    top 0.5s cubic-bezier(0.19, 1, 0.22, 1),
                    width 0.5s cubic-bezier(0.19, 1, 0.22, 1),
                    height 0.5s cubic-bezier(0.19, 1, 0.22, 1),
                    opacity 0.3s ease;
        opacity: 0;
        pointer-events: auto;
    }

    .window-frame.open {
        opacity: 1;
    }

    /* Disable transitions when manually interacting */
    .window-frame.dragging,
    .window-frame.resizing {
        transition: none !important;
        box-shadow: 0 20px 50px rgba(85, 85, 255, 0.3); /* Glow when dragging */
        z-index: 1000 !important;
    }

    .content-wrapper {
        position: absolute;
        top: 12px; left: 12px; right: 12px; bottom: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        pointer-events: auto; /* Ensure content is interactive */
    }

    .window-content {
        flex: 1;
        overflow: auto;
        position: relative;
        padding: 1rem;
    }

    /* Resize Handles */
    .resize-handle { position: absolute; z-index: 100; outline: none; }
    .n { top: 0; left: 0; right: 0; height: 8px; cursor: ns-resize; }
    .s { bottom: 0; left: 0; right: 0; height: 8px; cursor: ns-resize; }
    .e { top: 0; bottom: 0; right: 0; width: 8px; cursor: ew-resize; }
    .w { top: 0; bottom: 0; left: 0; width: 8px; cursor: ew-resize; }
    .ne { top: 0; right: 0; width: 16px; height: 16px; cursor: ne-resize; z-index: 101; }
    .nw { top: 0; left: 0; width: 16px; height: 16px; cursor: nw-resize; z-index: 101; }
    .se { bottom: 0; right: 0; width: 16px; height: 16px; cursor: se-resize; z-index: 101; }
    .sw { bottom: 0; left: 0; width: 16px; height: 16px; cursor: sw-resize; z-index: 101; }

    /* Close Button */
    .close-btn {
        position: absolute;
        width: 60px; /* Larger tap area container */
        height: 60px;
        background: transparent;
        border: none;
        color: var(--accent-color, #55f);
        z-index: 102;
        padding: 0;
        pointer-events: none; /* Let SVG path handle events */
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .l-shape {
        width: 100%; height: 100%;
        pointer-events: none;
    }

    .l-shape path {
        pointer-events: stroke; /* Hitbox defined by stroke */
        cursor: pointer;
        transition: stroke 0.2s;
    }

    .l-shape path:hover {
        stroke: #fff;
        filter: drop-shadow(0 0 5px var(--accent-color));
    }

    /* Position and Rotation of L-shape based on corner */
    .close-btn.tl { top: 0; left: 0; transform: rotate(0deg); }
    .close-btn.tr { top: 0; right: 0; transform: rotate(90deg); }
    .close-btn.br { bottom: 0; right: 0; transform: rotate(180deg); }
    .close-btn.bl { bottom: 0; left: 0; transform: rotate(270deg); }

</style>
