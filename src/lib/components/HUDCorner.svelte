<script>
    import { windowManager } from '$lib/windowManager.svelte.js';

    let { id, position, code, buttonContent, headerTitle } = $props();
    let containerEl;

    let isActive = $derived(windowManager.windows.some(w => w.id === id));

    // Cycle highlight logic
    let isHighlighted = $state(false);

    $effect(() => {
        const checkCycle = () => {
            // Only cycle if no windows are open
            if (windowManager.windows.length === 0) {
                // Determine order: tl -> tr -> br -> bl
                const order = ['tl', 'tr', 'br', 'bl'];
                const now = Date.now();
                // 10s total cycle length: each gets 2s, 2s pause
                const cyclePos = (now % 10000) / 10000;

                let activeIndex = -1;
                if (cyclePos < 0.2) activeIndex = 0;
                else if (cyclePos < 0.4) activeIndex = 1;
                else if (cyclePos < 0.6) activeIndex = 2;
                else if (cyclePos < 0.8) activeIndex = 3;

                isHighlighted = order[activeIndex] === position;
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
