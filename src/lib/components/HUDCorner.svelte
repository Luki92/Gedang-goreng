<script>
    import { activeCorner } from '$lib/stores';

    let { id, position, code, headerTitle, buttonContent, children } = $props();

    function toggle() {
        if ($activeCorner === id) {
            $activeCorner = null;
        } else {
            $activeCorner = id;
        }
    }

    function close(e) {
        e.stopPropagation();
        $activeCorner = null;
    }

    function stopProp(e) {
        e.stopPropagation();
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<nav id={id} class="hud-corner {position}" class:expanded={$activeCorner === id} onclick={toggle} role="button">
    <button class="hud-btn">
        <span class="code">{code}</span>
        {@render buttonContent()}
    </button>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="win-content" onclick={stopProp}>
        <div class="sys-header">
            <span>// {headerTitle}</span>
            <span class="close-btn" onclick={close} role="button" tabindex="0">[X]</span>
        </div>
        {@render children()}
    </div>
</nav>
