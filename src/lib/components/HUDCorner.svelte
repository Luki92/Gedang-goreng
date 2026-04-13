<script>
    import { windowManager } from '$lib/windowManager.svelte.js';

    let { id, position, code, buttonContent, headerTitle } = $props();
    let containerEl;

    let isActive = $derived(windowManager.windows.some(w => w.id === id));

    // Cycle highlight logic
    let isHighlighted = $state(false);

    $effect(() => {
        const checkCycle = () => {
            if (windowManager.windows.length === 0) {
                // Dreamy sequence: 8s cycle
                // Top pulse: 1.5s
                // Bottom pulse: 1.5s
                // Sleep: 5s
                const now = Date.now();
                const cyclePos = now % 8000;

                if (cyclePos < 1500) {
                    isHighlighted = (position === 'tl' || position === 'tr');
                } else if (cyclePos >= 1500 && cyclePos < 3000) {
                    isHighlighted = (position === 'bl' || position === 'br');
                } else {
                    isHighlighted = false;
                }
            } else {
                isHighlighted = false;
            }
            requestAnimationFrame(checkCycle);
        };
        const frame = requestAnimationFrame(checkCycle);
        return () => cancelAnimationFrame(frame);
    });

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

<div id={id} class="hud-corner {position}" class:active={isActive} class:cycle-highlight={isHighlighted} bind:this={containerEl}>
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
