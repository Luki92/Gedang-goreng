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

    // Determine fly direction for button exit (Fly OUT of frame)
    let flyY = 0;
    let flyX = 0;
    const dist = 100;

    if (position.includes('t')) flyY = -dist;
    if (position.includes('b')) flyY = dist;
    if (position.includes('l')) flyX = -dist;
    if (position.includes('r')) flyX = dist;
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
    <!-- We animate the INNER button out -->
    {#if !isOpen}
        <div class="btn-wrapper" transition:fly={{ x: flyX, y: flyY, duration: 500, opacity: 1 }}>
            <button class="hud-btn">
                <span class="code">{code}</span>
                {@render buttonContent()}
            </button>
        </div>
    {/if}
</nav>

<style>
    .hud-corner {
        position: fixed; z-index: 50;
        /* Remove strict min-sizes that created the "invisible box" */
        width: auto; height: auto;
        padding: 1rem;
        background: transparent;
        transition: opacity 0.3s ease;
        pointer-events: auto; display: flex; flex-direction: column;
        /* Clip path to follow L-shape roughly if needed, but reducing padding helps most */
    }

    /* Ensure only the content triggers interactions if possible,
       but for L-shape visual we usually rely on the element itself.
       We'll rely on the button styling which is usually the visual part.
    */

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
