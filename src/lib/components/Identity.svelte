<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { dataStore } from '$lib/stores/data.svelte.js';

    onMount(() => {
        dataStore.fetchProfile();
    });

    let profile = $derived(dataStore.profile || {
        full_name: 'Luki',
        bio: "I don't fix computers, I make them dream.",
        avatar_url: null,
        status: 'Offline'
    });
</script>

<div class="h-full overflow-y-auto pr-2">
    <div class="flex flex-col md:flex-row gap-6 mt-12 md:mt-0">
        <!-- Placeholder Box for Luki to jump into -->
        <div class="w-32 h-32 md:w-48 md:h-48 border border-dashed border-[#444] rounded-xl flex items-center justify-center bg-transparent shrink-0 relative overflow-hidden">
            <!-- Inner Wolf / Avatar -->
            <div
                class="luki-inner-emoji"
                in:fly={{ y: 200, duration: 1000, easing: quintOut, delay: 300 }}
            >
                {#if profile.avatar_url}
                    <img src={profile.avatar_url} alt="Avatar" class="w-full h-full object-cover" />
                {:else}
                    🐺
                {/if}
            </div>

            <span class="text-xs text-gray-600 absolute bottom-2 left-2 z-0">PERSONA_SLOT</span>
        </div>
        <div>
            <h2 class="text-3xl text-white mb-2 font-bold font-playfair italic">{profile.full_name}.</h2>
            <p class="text-xs text-green-500 mb-4 font-[VT323]">STATUS: {profile.status || 'UNKNOWN'}</p>
            <div class="selectable-text space-y-4 text-sm text-gray-300 leading-relaxed font-[Space Mono]">
                <p>
                    "{profile.bio}"
                </p>
                {#if profile.location}
                    <p>
                        Based in {profile.location}.
                    </p>
                {/if}
                <div class="p-3 border border-[#333] bg-transparent rounded-lg">
                    <span class="text-xs text-gray-500 block mb-1">CONTACT:</span>
                    {profile.email || 'Encrypted Channel Only'}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .luki-inner-emoji {
        font-size: 6rem;
        filter: drop-shadow(0 0 30px var(--accent-color));
        z-index: 10;
        animation: breathe 4s ease-in-out infinite;
        width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
    }

    .luki-inner-emoji img {
        width: 100%; height: 100%; object-fit: cover;
    }

    @keyframes breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }

    @media (max-width: 768px) {
        .luki-inner-emoji { font-size: 4rem; }
    }
</style>
