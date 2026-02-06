<script>
    import { windows, openWindow } from '$lib/stores';
    import { fly } from 'svelte/transition';

    // Added 'origin' prop to pass to openWindow
    let { id, position, code, headerTitle, buttonContent } = $props();

    // Derived state to check if this window is active
    let isOpen = $derived($windows.some(w => w.id === id));

    function toggle() {
        openWindow({
            id,
            title: headerTitle,
            origin: position, // Pass 'tl', 'tr', 'bl', 'br'
            x: 0, y: 0, w: 0, h: 0 // Will be calculated by layout
        });
    }

    // Determine fly direction for button exit
    let flyY = 0;
    if (position.includes('t')) flyY = -50;
    if (position.includes('b')) flyY = 50;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<nav
    id={id}
    class="hud-corner {position}"
    onclick={toggle}
    role="button"
    class:pointer-events-none={isOpen}
>
    <!-- We animate the INNER button out, keeping the Nav/Hitbox but making it inert -->
    {#if !isOpen}
        <div class="btn-wrapper" transition:fly={{ y: flyY, duration: 400 }}>
            <button class="hud-btn">
                <span class="code">{code}</span>
                {@render buttonContent()}
            </button>
        </div>
    {/if}
</nav>

<style>
    /*
       FIX: The invisible square issue.
       The .hud-corner has fixed width/height.
       We ensure it doesn't block clicks unless there is content.
       Actually, standard behavior is fine if the dimensions match the visual.
       The user said "highlights an entire invisible square".
       If width is large but button is small?
       Let's optimize hit area.
    */
    .hud-corner {
        position: fixed; z-index: 50;
        /* Adjusted dimensions to wrap content better */
        width: auto; height: auto;
        min-width: 140px; min-height: 100px;
        padding: 2rem;
        /* Remove background unless hovering */
        background: transparent;
        transition: all 0.3s ease;
        pointer-events: auto; display: flex; flex-direction: column;
    }

    /* Only show corner brackets on hover or always?
       Previous CSS had them on pseudo elements of .hud-corner.
       If .hud-corner is large, the brackets are far apart.
       Let's restrict the hit area.
    */

    /* Inherits CSS from app.css for positioning (tl, tr, etc.) */
    /* We override specific behaviors here */

    .btn-wrapper {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
    }

    .pointer-events-none { pointer-events: none; }
</style>
