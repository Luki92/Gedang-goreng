<script>
    import { windowManager } from '$lib/windowManager.svelte.js';

    // To prevent hydration mismatches or state flicker, we rely on the windowManager
    let isProfileOpen = $derived(windowManager.windows.some(w => w.id === 'c-tl'));
</script>

<div class="luki-container" class:open={isProfileOpen}>
    <div class="luki-wrapper">
        <div class="luki-emoji">🐺</div>
        <div class="luki-bubble">
            <span class="bubble-text">"Welcome to the void."</span>
        </div>
    </div>
</div>

<style>
    .luki-container {
        position: fixed;
        z-index: 60;
        pointer-events: none;

        /* DEFAULT STATE: Bottom Right */
        bottom: 0; right: 10vw;
        top: auto; left: auto;

        transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s;
    }

    /* OPEN STATE: Hide it! The internal one takes over. */
    .luki-container.open {
        /* Move it down off screen */
        transform: translateY(100%);
        opacity: 0;
    }

    .luki-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .luki-emoji {
        font-size: 8rem;
        filter: drop-shadow(0 0 20px rgba(0,0,0,0.5));
        /* Default Animation (Slide Up + Breathe) */
        animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards, breathe 4s ease-in-out infinite;
    }

    .luki-bubble {
        opacity: 0;
        transform: scale(0.8) translateX(-20px);
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        background: rgba(0,0,0,0.8);
        border: 1px solid var(--accent-color);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        position: absolute;
        left: 100%;
        width: max-content;
        max-width: 200px;
    }

    .luki-container:not(.open) .luki-bubble {
        /* Only show bubble occasionally or on hover? */
        /* For now, keep it hidden by default logic in original file?
           Original had animation delay. Let's keep it simple. */
    }

    /* Trigger bubble on hover of emoji? Or random? */
    .luki-emoji:hover + .luki-bubble {
        opacity: 1;
        transform: scale(1) translateX(0);
    }

    .luki-bubble::before {
        content: ''; position: absolute;
        left: -6px; top: 50%; transform: translateY(-50%);
        border-top: 6px solid transparent; border-bottom: 6px solid transparent;
        border-right: 6px solid var(--accent-color);
    }
    .bubble-text {
        font-family: 'VT323', monospace; color: var(--accent-color); font-size: 1.2rem;
    }

    /*
       Slide Up: Moves from BOTTOM (50vh) to 0.
       This makes it look like it's rising from the bottom of the screen.
    */
    @keyframes slideUp {
        0% { transform: translateY(50vh); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
    }

    @keyframes breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }

    @media (max-width: 768px) {
        .luki-container { right: -20px; bottom: -10px; }
        .luki-emoji { font-size: 5rem; }
    }
</style>
