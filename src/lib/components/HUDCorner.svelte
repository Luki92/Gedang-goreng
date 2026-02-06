<script>
    import { windows, openWindow } from '$lib/stores';

    let { id, position, code, headerTitle, buttonContent } = $props();

    // Derived state to check if this window is active
    let isOpen = $derived($windows.some(w => w.id === id));

    function toggle() {
        // We use the new store helper
        openWindow({
            id,
            title: headerTitle,
            // x, y, w, h are handled by the layout engine now
            x: 0, y: 0, w: 0, h: 0
        });
    }

    function stopProp(e) {
        e.stopPropagation();
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<nav
    id={id}
    class="hud-corner {position}"
    onclick={toggle}
    role="button"
    class:hidden-corner={isOpen}
>
    <button class="hud-btn">
        <span class="code">{code}</span>
        {@render buttonContent()}
    </button>
</nav>

<style>
    /* Inherits main styles from global, adding visibility toggle */
    .hidden-corner {
        opacity: 0;
        pointer-events: none;
    }
</style>
