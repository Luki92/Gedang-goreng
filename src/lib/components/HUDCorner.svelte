<script>
    import { windowManager } from '$lib/windowManager.svelte.js';

    let { id, position, code, buttonContent, headerTitle } = $props();
    let btnEl;
    let containerEl;

    // Check if window is active to hide the button?
    // "The original 'origin' corner buttons should transition to an inactive or hidden state once their respective window is active"
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

        windowManager.toggle(id, { originRect });
    }
</script>

<div class="hud-corner {position}" class:active={isActive} bind:this={containerEl}>
    <button class="hud-btn" bind:this={btnEl} onclick={handleClick}>
        <span class="code">{code}</span>
        {@render buttonContent()}
    </button>
</div>

<style>
    /* Inherit styles from app.css for .hud-corner and .hud-btn */
    /* Add specific styles for active state */

    .hud-corner {
        transition: opacity 0.5s, transform 0.5s;
    }

    .hud-corner.active {
        opacity: 0;
        pointer-events: none;
        transform: scale(0.8);
    }
</style>
