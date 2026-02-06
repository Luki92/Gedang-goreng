<script>
    import { windows } from '$lib/stores';

    // Check if Identity window (c-tl) is open
    // Note: $windows is an array.
    let identityOpen = $derived($windows.some(w => w.id === 'c-tl'));
</script>

<div id="oc-luki" class:exiting={identityOpen}>🐺</div>

<style>
    #oc-luki {
        position: fixed;
        bottom: -10px; right: 10vw;
        font-size: 8rem;
        z-index: 60;
        filter: drop-shadow(0 0 20px rgba(0,0,0,0.5));
        animation: breathe 4s ease-in-out infinite;
        transition: transform 1s cubic-bezier(0.55, 0.055, 0.675, 0.19);
        pointer-events: none;
        transform-origin: center bottom;
    }
    @keyframes breathe { 0%, 100% { transform: scale(1) translateY(0); } 50% { transform: scale(1.02) translateY(-10px); } }

    #oc-luki.exiting {
        transform: translateY(100vh) scale(0.8) !important;
        animation: none;
    }

    @media (max-width: 768px) {
        #oc-luki { font-size: 5rem; right: -20px; }
    }
</style>
