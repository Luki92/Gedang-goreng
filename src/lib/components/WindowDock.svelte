<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { fade, fly, scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    let minimizedWindows = $derived(windowManager.windows.filter(w => w.minimized));
</script>

{#if minimizedWindows.length > 0}
    <div class="dock-container" transition:fly={{ y: 50, duration: 500, easing: quintOut }}>
        <div class="dock-bar">
            {#each minimizedWindows as win (win.id)}
                <button
                    id="dock-item-${win.id}"
                    class="dock-item"
                    onclick={() => windowManager.restore(win.id)}
                    transition:scale={{ duration: 300, start: 0.5, easing: quintOut }}
                    title={win.title}
                >
                    <div class="icon-wrapper">
                        <i class="ph ${windowManager.getIcon(win.id)}"></i>
                    </div>
                    <div class="active-indicator"></div>
                </button>
            {/each}
        </div>
    </div>
{/if}

<style>
    .dock-container {
        position: fixed;
        bottom: 25px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        pointer-events: auto;
    }

    .dock-bar {
        background: rgba(10, 10, 15, 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 8px;
        display: flex;
        gap: 12px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.05);
        min-width: 60px;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dock-item {
        background: transparent;
        border: none;
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 16px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
    }

    .dock-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-8px) scale(1.1);
    }

    .icon-wrapper {
        font-size: 24px;
        opacity: 0.8;
        transition: opacity 0.3s;
    }

    .dock-item:hover .icon-wrapper {
        opacity: 1;
    }

    .active-indicator {
        width: 4px;
        height: 4px;
        background: var(--accent-color, #fff);
        border-radius: 50%;
        margin-top: 4px;
        box-shadow: 0 0 8px var(--accent-color, #fff);
        position: absolute;
        bottom: 4px;
    }

    @media (max-width: 768px) {
        .dock-bar { gap: 8px; padding: 6px; }
        .dock-item { width: 44px; height: 44px; }
    }
</style>
