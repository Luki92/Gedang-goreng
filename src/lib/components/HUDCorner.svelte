<script>
    import { windows } from '$lib/stores';

    let { id, position, code, headerTitle, buttonContent } = $props();

    function toggle() {
        windows.update(list => {
            const existing = list.find(w => w.id === id);
            if (existing) {
                return list.filter(w => w.id !== id);
            } else {
                // Smart positioning based on corner
                const padding = 50;
                const winW = 500;
                const winH = 400;
                let x = padding;
                let y = padding;

                // We can't access window.innerWidth on server, but this runs on client click
                if (typeof window !== 'undefined') {
                    if (position.includes('r')) x = window.innerWidth - winW - padding;
                    if (position.includes('b')) y = window.innerHeight - winH - padding;
                }

                return [...list, { id, title: headerTitle, x, y, w: winW, h: winH, z: 100 }];
            }
        });
    }

    function stopProp(e) {
        e.stopPropagation();
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<nav id={id} class="hud-corner {position}" onclick={toggle} role="button">
    <button class="hud-btn">
        <span class="code">{code}</span>
        {@render buttonContent()}
    </button>
</nav>
