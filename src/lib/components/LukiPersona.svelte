<script>
    import { activeCorner } from '$lib/stores';
</script>

<div id="oc-luki" class:in-profile={$activeCorner === 'c-tl'}>🐺</div>

<style>
    #oc-luki {
        position: fixed;
        bottom: -10px; right: 10vw;
        font-size: 8rem;
        z-index: 60;
        filter: drop-shadow(0 0 20px rgba(0,0,0,0.5));
        animation: breathe 4s ease-in-out infinite;
        transition: all 1s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        pointer-events: none;
    }
    @keyframes breathe { 0%, 100% { transform: scale(1) translateY(0); } 50% { transform: scale(1.02) translateY(-10px); } }

    #oc-luki.in-profile {
        bottom: unset; right: unset;
        top: 25vh; left: 18vw;
        font-size: 6rem;
        z-index: 101;
        filter: drop-shadow(0 0 30px var(--accent-color));
    }

    @media (max-width: 768px) {
        #oc-luki { font-size: 5rem; right: -20px; }
        #oc-luki.in-profile { top: 18vh; left: 50%; transform: translateX(-50%); }
    }
</style>
