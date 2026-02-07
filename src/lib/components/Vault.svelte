<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';

    let works = $state([]);
    let loading = $state(true);
    let errorState = $state(false);

    onMount(async () => {
        // Simulated delay for "aesthetic" loading
        setTimeout(async () => {
            const { data, error } = await supabase.from('works').select('*').order('date', { ascending: false });

            if (error) {
                console.error('Vault Access Error:', error);
                errorState = true;
                // Fallback to mock data on error (likely no DB connection)
                loadMockData();
            } else {
                // Success (even if empty)
                works = data || [];
                loading = false;
            }
        }, 800);
    });

    function loadMockData() {
        works = [
            { id: 1, type: 'ESSAY', date: '2024.01', title: 'The Psychology of Pixel Art', description: 'Analyzing why low-res makes us feel high-emotion.', color: 'text-green-400' },
            { id: 2, type: 'SKETCH', date: '2023.12', title: 'Void Walker Concept', description: 'Character design draft for Project Nebula.', color: 'text-purple-400' }
        ];
        loading = false;
    }

    function getTypeColor(type) {
        switch(type) {
            case 'ESSAY': return 'text-green-400';
            case 'SKETCH': return 'text-purple-400';
            case 'PROJECT': return 'text-blue-400';
            case 'MUSIC': return 'text-pink-400';
            default: return 'text-gray-400';
        }
    }
</script>

<div class="h-full overflow-y-auto relative">
    <!-- Filter Header -->
    <div class="sticky top-0 bg-[#050505] z-10 flex gap-4 mb-4 border-b border-[#333] pb-2 text-sm pt-1">
        <span class="text-white border-b border-white cursor-pointer">ALL</span>
        <span class="text-gray-500 hover:text-white cursor-pointer">WRITING</span>
        <span class="text-gray-500 hover:text-white cursor-pointer">IMAGES</span>
    </div>

    {#if loading}
        <div class="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-[#050505]/80 z-20">
            <div class="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            <p class="text-xs text-green-500 font-mono animate-pulse">DECRYPTING_VAULT...</p>
        </div>
    {/if}

    <div class="grid grid-cols-1 gap-2 pb-4">
        {#each works as item}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <a href={item.content_url || '#'} target={item.content_url ? '_blank' : ''} class="block p-4 border border-[#222] bg-[#080808] hover:bg-[#111] hover:border-white transition-all cursor-pointer group relative overflow-hidden">
                <!-- Glitch Hover Effect Overlay -->
                <div class="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>

                <div class="flex justify-between items-center mb-2 relative z-10">
                    <span class="{getTypeColor(item.type)} text-xs font-[VT323] border border-current px-1 opacity-80">[{item.type}]</span>
                    <span class="text-gray-600 text-xs font-mono">{item.date}</span>
                </div>

                <h3 class="text-white font-bold group-hover:text-blue-400 transition-colors relative z-10 flex items-center gap-2">
                    {item.title}
                    {#if item.content_url}
                        <i class="ph ph-arrow-up-right text-xs opacity-50"></i>
                    {/if}
                </h3>

                {#if item.description}
                    <p class="text-xs text-gray-500 mt-1 relative z-10 group-hover:text-gray-400">{item.description}</p>
                {/if}

                {#if item.image_url}
                    <div class="mt-3 h-24 w-full overflow-hidden border border-[#333] opacity-60 group-hover:opacity-100 transition-opacity">
                        <img src={item.image_url} alt={item.title} class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                {/if}
            </a>
        {/each}

        {#if works.length === 0 && !loading}
             <div class="text-center py-10 border border-dashed border-[#333] text-gray-600 font-mono text-xs">
                // NULL_SET: NO_DATA_FOUND
             </div>
        {/if}
    </div>
</div>
