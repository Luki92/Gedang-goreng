<script>
    import { windowManager } from '$lib/windowManager.svelte.js';

    let { id, position, code, buttonContent, headerTitle } = $props();
    let containerEl;

    let isActive = $derived(windowManager.windows.some(w => w.id === id));

    function handleClick() {
        if (!containerEl) return;
        const rect = containerEl.getBoundingClientRect();

        const originRect = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };

        windowManager.toggle(id, { originRect, originType: position, title: headerTitle });
    }
</script>

<div id={id} class="hud-corner {position}" class:active={isActive} bind:this={containerEl}>
    <button class="hud-btn" onclick={handleClick}>
        <span class="code">{code}</span>
        {@render buttonContent()}
    </button>
</div>

<style>
    .hud-corner {
        transition: opacity 0.5s, transform 0.5s, visibility 0.5s;
    }

    .hud-corner.active {
        opacity: 0;
        pointer-events: none;
        transform: scale(0.8);
        visibility: hidden;
    }
</style>
