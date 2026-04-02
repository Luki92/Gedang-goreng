<script>
    import { activeCorner } from '$lib/stores';

    // To prevent hydration mismatches or state flicker, we rely on the store
    let isProfileOpen = $derived($activeCorner === 'c-tl');
</script>

<!--
    The container uses a transition-based class approach.
    When `isProfileOpen` is true (User clicks "Identity"), the container moves to Top-Left.
    The animation on `.luki-emoji` triggers because the class changes.
-->
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

        /* CLOSED STATE: Bottom Right */
        bottom: 0; right: 10vw;
        top: auto; left: auto;

        /* We remove the transition on top/left/bottom/right because we want the ELEMENT to jump
           to the new position instantly, but we want the ANIMATION to handle the visual movement
           (sliding in/out). If we transition the position AND animate transform, it looks messy.

           HOWEVER, the user asked for "Slide Downward" when opening.
           If we just jump the position, the "Slide Down" animation will play at the new position.
           That is exactly what we want: It appears at the top (hidden by translateY -50vh)
           and slides down into place.
        */
    }

    /* OPEN STATE: Top Left */
    .luki-container.open {
        bottom: auto; right: auto;
        top: 25vh; left: 18vw;
        z-index: 101;
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

    /* Override Animation when Open (Slide Down + Breathe) */
    .luki-container.open .luki-emoji {
        font-size: 6rem;
        filter: drop-shadow(0 0 30px var(--accent-color));
        animation: slideDown 1s cubic-bezier(0.16, 1, 0.3, 1) forwards, breathe 4s ease-in-out infinite;
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

    .luki-container.open .luki-bubble {
        opacity: 1;
        transform: scale(1) translateX(0);
        transition-delay: 0.8s;
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
       Slide Down: Moves from TOP (-50vh) to 0.
       This makes it look like it's dropping into the profile frame.
    */
    @keyframes slideDown {
        0% { transform: translateY(-50vh); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
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

        .luki-container.open {
            top: 18vh; left: 50%; transform: translateX(-50%);
            width: auto;
        }

        .luki-bubble {
            top: 100%; left: 50%; margin-top: 10px; margin-left: -50%;
        }
        .luki-bubble::before {
            left: 50%; top: -6px; transform: translateX(-50%) rotate(90deg);
        }
    }
</style>
