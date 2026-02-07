<script>
    let { id, position, code, buttonContent, onclick } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<nav id={id} class="hud-corner {position}" onclick={onclick} role="button">
    <button class="hud-btn">
        <span class="code">{code}</span>
        {@render buttonContent()}
    </button>
</nav>
