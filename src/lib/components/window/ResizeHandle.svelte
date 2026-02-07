<script>
    let { position, size = 30, thickness = 2, onResizeStart } = $props();

    function onMouseDown(e) {
        e.preventDefault();
        onResizeStart({ position, startX: e.clientX, startY: e.clientY });
    }

    function getPath(pos, s) {
        // Adjust for stroke width to ensure crisp rendering
        // We assume coordinate system 0,0 is the corner of the window
        switch (pos) {
            case 'tl': return `M 1,${s} L 1,1 L ${s},1`;
            case 'tr': return `M 0,1 L ${s-1},1 L ${s-1},${s}`;
            case 'bl': return `M 1,0 L 1,${s-1} L ${s},${s-1}`;
            case 'br': return `M ${s-1},0 L ${s-1},${s-1} L 0,${s-1}`;
        }
    }

    function getStyle(pos) {
        const base = "position: absolute; z-index: 50; pointer-events: none;";
        switch (pos) {
            case 'tl': return base + "top: 0; left: 0;";
            case 'tr': return base + "top: 0; right: 0;";
            case 'bl': return base + "bottom: 0; left: 0;";
            case 'br': return base + "bottom: 0; right: 0;";
        }
    }

    function getCursor(pos) {
         switch (pos) {
            case 'tl': return 'nwse-resize';
            case 'tr': return 'nesw-resize';
            case 'bl': return 'nesw-resize';
            case 'br': return 'nwse-resize';
        }
    }
</script>

<svg
    style={getStyle(position)}
    width={size} height={size}
    viewBox={`0 0 ${size} ${size}`}
    xmlns="http://www.w3.org/2000/svg"
    class="resize-svg"
>
    <!-- Hit Area (Invisible, Thick) -->
    <!-- pointer-events: stroke ensures only the path is clickable -->
    <path
        d={getPath(position, size)}
        stroke="transparent"
        stroke-width="20"
        fill="none"
        class="hit-area"
        style:cursor={getCursor(position)}
        onmousedown={onMouseDown}
    />

    <!-- Visual Bracket -->
    <path
        d={getPath(position, size)}
        class="visual-bracket"
        stroke="currentColor"
        stroke-width={thickness}
        fill="none"
        stroke-linecap="square"
    />
</svg>

<style>
    .resize-svg {
        overflow: visible;
        color: #444;
        transition: color 0.3s;
    }

    .hit-area {
        pointer-events: stroke;
    }

    .hit-area:hover ~ .visual-bracket {
        stroke: var(--accent-color, #55f);
        filter: drop-shadow(0 0 5px var(--accent-color, #55f));
        stroke-width: 3px;
    }

    .visual-bracket {
        pointer-events: none;
        transition: all 0.3s ease;
    }
</style>
