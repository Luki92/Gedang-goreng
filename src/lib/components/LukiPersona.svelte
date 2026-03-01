<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { personaStore } from '$lib/stores/persona.svelte.js';
    import AvatarFrame from './AvatarFrame.svelte';
    import { onMount } from 'svelte';
    import { quintOut } from 'svelte/easing';

    // State
    let isProfileOpen = $derived(windowManager.windows.some(w => w.id === 'c-tl' && !w.minimized));
    let containerEl = $state();
    let currentPos = $state({ x: 0, y: 0, scale: 1, opacity: 1 });
    let isGliding = $state(false);

    // Watch for profile state change to trigger glide
    $effect(() => {
        if (isProfileOpen) {
            glideToIdentity();
        } else {
            glideToCorner();
        }
    });

    async function glideToIdentity() {
        if (!containerEl) return;
        const target = document.getElementById('persona-identity-target');
        if (!target) return;

        isGliding = true;
        const targetRect = target.getBoundingClientRect();
        const startRect = containerEl.getBoundingClientRect();

        // Simple Glide animation
        currentPos = {
            x: targetRect.left - startRect.left,
            y: targetRect.top - startRect.top,
            scale: targetRect.width / startRect.width,
            opacity: 0
        };

        setTimeout(() => { isGliding = false; }, 800);
    }

    async function glideToCorner() {
        isGliding = true;
        currentPos = { x: 0, y: 0, scale: 1, opacity: 1 };
        setTimeout(() => { isGliding = false; }, 800);
    }

    function handleClick() {
        personaStore.triggerRandom('CLICK');
        personaStore.lastInteraction = Date.now();
    }

    // Logic for "pushing" windows
    $effect(() => {
        if (!isProfileOpen && !isGliding) {
            const myRect = containerEl?.getBoundingClientRect();
            if (myRect) {
                windowManager.windows.forEach(w => {
                    if (w.minimized || w.state === 'closing') return;
                    const wx = w.x;
                    const wy = w.y;
                    const ww = w.width;
                    const wh = w.height;

                    if (!(myRect.right < wx ||
                          myRect.left > wx + ww ||
                          myRect.bottom < wy ||
                          myRect.top > wy + wh)) {
                        // COLLISION! Bounce the window.
                        if (w.isTiled) {
                             personaStore.say("HEY! Don't cover me with your workspace!", 'angry');
                        } else {
                             w.x -= 50; w.y -= 50;
                             personaStore.say("Move this thing, I can't see!", 'angry');
                        }
                    }
                });
            }
        }
    });
</script>

<div
    bind:this={containerEl}
    class="luki-persona-fixed"
    class:hidden-in-identity={isProfileOpen && !isGliding}
    style="transform: translate({currentPos.x}px, {currentPos.y}px) scale({currentPos.scale}); opacity: {currentPos.opacity}; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s;"
>
    <div class="relative group">
        <!-- Speech Bubble -->
        {#if personaStore.isSpeaking}
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-max max-w-[200px] z-50">
                <div class="bg-black/90 border border-red-500/50 p-3 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.2)] relative">
                    <p class="text-red-400 font-mono text-xs leading-relaxed">"{personaStore.currentMessage}"</p>
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90"></div>
                </div>
            </div>
        {/if}

        <!-- The Character -->
        <button
            onclick={handleClick}
            class="cursor-pointer hover:scale-105 transition-transform active:scale-95"
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
        z-index: 100;
        pointer-events: auto;
    }

    .hidden-in-identity {
        opacity: 0 !important;
        pointer-events: none;
    }

    @media (max-width: 768px) {
        .luki-persona-fixed { right: 1rem; bottom: 1rem; }
    }
</style>
