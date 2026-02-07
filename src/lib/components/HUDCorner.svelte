<script>
    import { windowManager } from '$lib/stores/windowManager';

    // We only need basic props now. Content is handled by WindowManager.
    // 'headerTitle' is unused here (moved to Window title in store registration).
    let { id, position, code, buttonContent } = $props();

    function toggle() {
        windowManager.toggle(id);
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
