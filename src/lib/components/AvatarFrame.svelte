<script>
    import { personaStore } from '$lib/stores/persona.svelte.js';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    /**
     * @typedef {Object} Props
     * @property {'sm' | 'md' | 'lg' | 'xl' | string} [size]
     * @property {string} [customClass]
     * @property {string} [style]
     * @property {boolean} [isIdentityFrame]
     */

    /** @type {Props} */
    let {
        size = 'md',
        customClass = '',
        style = '',
        isIdentityFrame = false
    } = $props();

    /** @type {Record<string, string>} */
    const sizeClasses = {
        sm: 'w-24 h-24',
        md: 'w-32 h-32 md:w-48 md:h-48',
        lg: 'w-64 h-64',
        xl: 'w-80 h-80'
    };

    let resolvedSizeClass = $derived(sizeClasses[size] || size);

    // Determine the current image based on store state
    let currentImage = $derived.by(() => {
        if (personaStore.isSpeaking) return personaStore.getAsset('speak') || personaStore.getAsset('idle');
        if (personaStore.isBlinking) return personaStore.getAsset('blink') || personaStore.getAsset('idle');
        return personaStore.getAsset(personaStore.currentExpression) || personaStore.getAsset('idle');
    });
</script>

<div
    class="avatar-frame border border-dashed border-[#444] rounded-xl flex items-center justify-center bg-transparent shrink-0 relative overflow-hidden {resolvedSizeClass} {customClass}"
    {style}
    id={isIdentityFrame ? 'persona-identity-target' : undefined}
>
    <div
        class="luki-inner-emoji w-full h-full flex items-center justify-center"
        in:fly={{ y: 50, duration: 800, easing: quintOut }}
    >
        {#if currentImage}
            <img src={currentImage} alt="Persona" class="w-full h-full object-contain" />
        {:else}
            <span class="text-6xl filter drop-shadow-[0_0_30px_var(--accent-color)] animate-breathe">🐺</span>
        {/if}
    </div>

    <span class="text-[10px] text-gray-600 absolute bottom-2 left-2 z-0 uppercase tracking-tighter">PERSONA_SLOT</span>
</div>

<style>
    .avatar-frame {
        transition: all 0.3s ease;
    }

    .animate-breathe {
        animation: breathe 4s ease-in-out infinite;
    }

    @keyframes breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
</style>
