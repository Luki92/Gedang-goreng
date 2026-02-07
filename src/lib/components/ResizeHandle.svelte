<script>
    let { onResizeStart } = $props();

    function handleMouseDown(e) {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        onResizeStart(e);
    }
</script>

<svg
    class="resize-handle"
    viewBox="0 0 30 30"
    width="30"
    height="30"
    xmlns="http://www.w3.org/2000/svg"
>
    <!-- Invisible Hitbox: Thick stroke -->
    <!-- pointer-events: stroke makes only the stroke interactable -->
    <path
        d="M2 28 L28 28 L28 2"
        fill="none"
        stroke="transparent"
        stroke-width="15"
        stroke-linecap="square"
        style="cursor: nwse-resize; pointer-events: stroke;"
        onmousedown={handleMouseDown}
        role="button"
        tabindex="-1"
    />

    <!-- Visible Decor: Thin stroke -->
    <path
        d="M2 28 L28 28 L28 2"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="square"
        style="pointer-events: none;"
    />
</svg>

<style>
    .resize-handle {
        position: absolute;
        bottom: 0;
        right: 0;
        z-index: 50;
        color: var(--accent-color, #5555ff);
        transition: color 0.2s;
        /* Ensure the bounding box doesn't block clicks */
        pointer-events: none;
    }

    .resize-handle:hover {
        color: white;
    }
</style>
