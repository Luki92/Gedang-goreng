<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { personaStore } from '$lib/stores/persona.svelte.js';
    import AvatarFrame from './AvatarFrame.svelte';

    let isProfileOpen = $derived(windowManager.windows.some(w => w.id === 'c-tl' && !w.minimized));
    let containerEl = $state();
    let currentPos = $state({ x: 0, y: 0, scale: 1, opacity: 1 });
    let isGliding = $state(false);
    let isBouncing = $state(false);

    $effect(() => {
        if (isProfileOpen) glideToIdentity();
        else glideToCorner();
    });

    async function glideToIdentity() {
        if (!containerEl) return;
        const target = document.getElementById('persona-identity-target');
        if (!target) return;
        isGliding = true;
        const targetRect = target.getBoundingClientRect();
        const startRect = containerEl.getBoundingClientRect();
        currentPos = { x: targetRect.left - startRect.left, y: targetRect.top - startRect.top, scale: targetRect.width / startRect.width, opacity: 0.2 };
        setTimeout(() => { isGliding = false; }, 800);
    }

    async function glideToCorner() {
        isGliding = true;
        currentPos = { x: 0, y: 0, scale: 1, opacity: 1 };
        setTimeout(() => { isGliding = false; }, 800);
    }

    function handleClick() {
        personaStore.triggerRandom('CLICK');
        isBouncing = true;
        setTimeout(() => isBouncing = false, 500);
    }

    // Direct collision check without $effect dependency on rect
    // We poll briefly when windows move
    let collisionTimer;
    $effect(() => {
        // Track windows
        const winList = windowManager.windows.map(w => ({ id: w.id, x: w.x, y: w.y, w: w.width, h: w.height, m: w.minimized, s: w.state }));

        if (isGliding || !containerEl || winList.length === 0) return;

        const myRect = containerEl.getBoundingClientRect();

        winList.forEach(w => {
            if (w.m || w.s === 'closing' || w.id === 'c-tl') return;
            const hasCollision = !(myRect.right < w.x || myRect.left > w.x + w.w || myRect.bottom < w.y || myRect.top > w.y + w.h);
            if (hasCollision) {
                if (!personaStore.isSpeaking) {
                    personaStore.triggerRandom('COLLISION') || personaStore.say("HEY! Don't cover me!", 'angry');
                    isBouncing = true;
                    setTimeout(() => isBouncing = false, 500);
                }
            }
        });
    });
</script>

<div
    bind:this={containerEl}
    class="luki-persona-fixed"
    class:is-bouncing={isBouncing}
    style="transform: translate({currentPos.x}px, {currentPos.y}px) scale({currentPos.scale}); opacity: {currentPos.opacity}; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s;"
>
    <div class="relative group">
        {#if personaStore.isSpeaking}
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-max max-w-[200px] z-[2000] pointer-events-none">
                <div class="bg-black/90 border border-red-500/50 p-3 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.2)] relative animate-pop-in">
                    <p class="text-red-400 font-mono text-xs leading-relaxed text-center">"{personaStore.currentMessage}"</p>
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90"></div>
                </div>
            </div>
        {/if}

        <button
            onclick={handleClick}
            class="cursor-pointer hover:scale-110 transition-transform active:scale-90 outline-none"
            aria-label="Persona"
        >
            <AvatarFrame size="sm" customClass="border-none shadow-none" />
        </button>
    </div>
</div>

<style>
    .luki-persona-fixed {
        position: fixed;
        bottom: 2rem;
        right: 10vw;
        z-index: 1000;
        pointer-events: auto;
    }
    .is-bouncing { animation: bounce 0.5s ease; }
    @keyframes bounce {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(-5px, -10px) scale(1.05); }
        50% { transform: translate(5px, -5px) scale(0.95); }
        75% { transform: translate(-2px, -2px) scale(1.02); }
    }
    @keyframes pop-in {
        from { opacity: 0; transform: translate(-50%, 10px) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, 0) scale(1); }
    }
</style>
