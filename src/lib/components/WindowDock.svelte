<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { flip } from 'svelte/animate';
    import { fade, fly } from 'svelte/transition';

    let minimizedWindows = $derived(windowManager.windows.filter(w => w.minimized));

    const iconMap = {
        'terminal': 'ph-terminal-window',
        'c-tr': 'ph-safe',
        'c-tl': 'ph-fingerprint',
        'c-bl': 'ph-vinyl-record',
        'c-br': 'ph-planet',
        'admin-guestbook': 'ph-envelope-open',
        'control-center': 'ph-gear-six',
        'file-viewer': 'ph-file-text'
    };

    /** @param {string} id */
    function getIcon(id) {
        return iconMap[id] || (id.startsWith('admin-') ? 'ph-shield-check' : 'ph-app-window');
    }
</script>

{#if minimizedWindows.length > 0}
    <div class="dock-container" transition:fly={{ y: 50, duration: 500 }}>
        <div class="dock-bar">
            {#each minimizedWindows as win (win.id)}
                <button
                    class="dock-item"
                    onclick={() => windowManager.restore(win.id)}
                    transition:fade={{ duration: 200 }}
                    title={win.title}
                >
                    <i class="ph {getIcon(win.id)}"></i>
                    <span class="dock-label">{win.title}</span>
                </button>
            {/each}
        </div>
    </div>
{/if}

<style>
    .dock-container {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        pointer-events: auto;
    }

    .dock-bar {
        background: rgba(10, 10, 15, 0.8);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 6px;
        display: flex;
        gap: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        min-width: 60px;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dock-item {
        background: transparent;
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .dock-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-4px);
    }

    .dock-item i {
        font-size: 20px;
        opacity: 0.8;
    }

    .dock-label {
        font-family: 'Space Mono', monospace;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
        opacity: 0.6;
    }

    @media (max-width: 768px) {
        .dock-label { display: none; }
        .dock-item { padding: 8px; }
    }
</style>
