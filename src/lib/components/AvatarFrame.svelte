<script>
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    let {
        avatarUrl = null,
        size = 'md', // sm, md, lg, xl or numeric
        customClass = '',
        style = '',
        expression = 'idle' // idle, blink, speak, etc.
    } = $props();

    // Mapping size to tailwind or custom
    const sizeClasses = {
        sm: 'w-24 h-24',
        md: 'w-32 h-32 md:w-48 md:h-48',
        lg: 'w-64 h-64',
        xl: 'w-80 h-80'
    };

    let resolvedSizeClass = $derived(/** @type {any} */ (sizeClasses)[size] || (typeof size === 'string' ? size : 'w-48 h-48'));
</script>

<div
    class="avatar-frame border border-dashed border-[#444] rounded-xl flex items-center justify-center bg-transparent shrink-0 relative overflow-hidden {resolvedSizeClass} {customClass}"
    {style}
>
    <div
        class="luki-inner-emoji w-full h-full flex items-center justify-center"
        in:fly={{ y: 50, duration: 800, easing: quintOut }}
    >
        {#if avatarUrl}
            <img src={avatarUrl} alt="Avatar" class="w-full h-full object-cover" data-expression={expression} />
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
