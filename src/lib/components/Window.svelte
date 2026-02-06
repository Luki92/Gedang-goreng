<script>
    import { windows } from '$lib/stores';
    import { fly, fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    let { id, title, x = 100, y = 100, w = 500, h = 400, z = 50, children } = $props();

    let dragging = false;
    let resizing = false;
    let dragOffX = 0, dragOffY = 0;

    // State for position/size (local to component for performance, synced to store if needed or just local)
    // Since we destroy the component on close, local state is fine until we want persistence.
    // But if we want to support "minimize" later, store sync is better.
    // For now, local is faster.
    let posX = $state(x);
    let posY = $state(y);
    let width = $state(w);
    let height = $state(h);

    function focus() {
        // Bring to front
        windows.update(list => {
            const maxZ = Math.max(...list.map(w => w.z), 50);
            return list.map(w => w.id === id ? { ...w, z: maxZ + 1 } : w);
        });
    }

    function startDrag(e) {
        if (e.target.closest('button')) return; // Don't drag if clicking buttons
        dragging = true;
        dragOffX = e.clientX - posX;
        dragOffY = e.clientY - posY;
        focus();
    }

    function startResize(e) {
        resizing = true;
        e.stopPropagation();
        focus();
    }

    function onMouseMove(e) {
        if (dragging) {
            posX = e.clientX - dragOffX;
            posY = e.clientY - dragOffY;
        }
        if (resizing) {
            width = Math.max(300, e.clientX - posX);
            height = Math.max(200, e.clientY - posY);
        }
    }

    function onMouseUp() {
        dragging = false;
        resizing = false;
    }

    function close() {
        windows.update(list => list.filter(w => w.id !== id));
    }
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="window-frame"
    style:left="{posX}px"
    style:top="{posY}px"
    style:width="{width}px"
    style:height="{height}px"
    style:z-index={z}
    onmousedown={focus}
    transition:fly={{ y: 20, duration: 400, easing: quintOut }}
>
    <div class="window-header" onmousedown={startDrag}>
        <span class="win-title">// {title}</span>
        <div class="controls">
            <button class="win-btn close-btn" onclick={close} aria-label="Close">
                <i class="ph ph-caret-down"></i>
            </button>
        </div>
    </div>

    <div class="window-content custom-scrollbar">
        {@render children()}
    </div>

    <div class="resize-handle" onmousedown={startResize}></div>
</div>

<style>
    .window-frame {
        position: fixed;
        background-color: var(--panel-bg, rgba(10, 10, 12, 0.9));
        border: 1px solid var(--border-color, #333);
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 4px;
        will-change: transform, width, height;
        color: #eee;
        min-width: 300px;
        min-height: 200px;
    }

    .window-frame:focus-within, .window-frame:hover {
        border-color: rgba(255,255,255,0.2);
    }

    .window-header {
        height: 36px;
        background: rgba(255,255,255,0.03);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        cursor: grab;
        user-select: none;
    }
    .window-header:active { cursor: grabbing; }

    .win-title {
        font-family: 'VT323', monospace;
        color: #888;
        font-size: 1.1rem;
        letter-spacing: 1px;
    }

    .win-btn {
        background: none; border: none; color: #666; cursor: pointer;
        padding: 4px; border-radius: 4px; transition: all 0.2s;
        display: flex; align-items: center; justify-content: center;
    }
    .win-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .close-btn:hover { color: var(--accent-color, #5555ff); transform: translateY(2px); }

    .window-content {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        position: relative;
    }

    .resize-handle {
        position: absolute; bottom: 0; right: 0;
        width: 15px; height: 15px;
        cursor: nwse-resize;
        background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%);
    }

    /* Scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
</style>
