<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { windowManager } from '$lib/windowManager.svelte.js';

    /** @type {any[]} */
    let works = $state([]);
    let loading = $state(true);
    /** @type {string} */
    let activeFilter = $state('ALL'); // ALL, WRITING, ART, POST
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
                // If empty from DB, maybe load mock just to show something?
                if (works.length === 0) loadMockData();
                loading = false;
            }
        }, 800);
    });

    function loadMockData() {
        works = [
            { id: 1, type: 'ESSAY', date: '2024.01', title: 'The Psychology of Pixel Art', description: 'Analyzing why low-res makes us feel high-emotion.', color: 'text-green-400' },
            { id: 2, type: 'SKETCH', date: '2023.12', title: 'Void Walker Concept', description: 'Character design draft for Project Nebula.', color: 'text-purple-400', image_url: '🎨' },
            { id: 3, type: 'ART', date: '2024.02', title: 'Cyber Sunset', description: 'Digital painting.', image_url: '🎨' },
            { id: 4, type: 'POST', date: '2024.03', title: 'Thinking about Svelte 5', description: 'Runes are a game changer for reactivity. The simplicity is refreshing.' },
            { id: 5, type: 'ART', date: '2023.11', title: 'Glitch Portrait', description: 'Experimenting with datamoshing.', image_url: '👾' },
            { id: 6, type: 'POST', date: '2024.03', title: 'Coffee Break', description: 'Sometimes you just need to stare at the void.' }
        ];
        loading = false;
    }

    /** @param {string} type */
    function getTypeColor(type) {
        switch(type) {
            case 'ESSAY': return 'text-green-400';
            case 'SKETCH': return 'text-purple-400';
            case 'PROJECT': return 'text-blue-400';
            case 'MUSIC': return 'text-pink-400';
            case 'ART': return 'text-yellow-400';
            case 'POST': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    }

    // Filter Logic
    let filteredWorks = $derived.by(() => {
        if (activeFilter === 'ALL') return works;
        return works.filter(w => {
            if (activeFilter === 'WRITING') return ['ESSAY', 'PROJECT'].includes(w.type);
            if (activeFilter === 'ART') return ['ART', 'SKETCH'].includes(w.type);
            if (activeFilter === 'POST') return w.type === 'POST';
            return true;
        });
    });

    /** @param {any} item */
    function openFile(item) {
        windowManager.open('file-viewer', { props: { item } });
    }
</script>

<div class="h-full overflow-y-auto relative custom-scrollbar pr-2">
    <!-- Filter Header -->
    <div class="sticky top-0 bg-[#050505] z-20 flex gap-4 mb-4 border-b border-[#333] pb-2 text-sm pt-1">
        <button onclick={() => activeFilter = 'ALL'} class="text-gray-500 hover:text-white border-b-2 transition-colors {activeFilter === 'ALL' ? 'text-white border-white' : 'border-transparent'}">ALL</button>
        <button onclick={() => activeFilter = 'WRITING'} class="text-gray-500 hover:text-white border-b-2 transition-colors {activeFilter === 'WRITING' ? 'text-white border-white' : 'border-transparent'}">WRITING</button>
        <button onclick={() => activeFilter = 'ART'} class="text-gray-500 hover:text-white border-b-2 transition-colors {activeFilter === 'ART' ? 'text-white border-white' : 'border-transparent'}">ART</button>
        <button onclick={() => activeFilter = 'POST'} class="text-gray-500 hover:text-white border-b-2 transition-colors {activeFilter === 'POST' ? 'text-white border-white' : 'border-transparent'}">POST</button>
    </div>

    {#if loading}
        <div class="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-[#050505]/80 z-20">
            <div class="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            <p class="text-xs text-green-500 font-mono animate-pulse">DECRYPTING_VAULT...</p>
        </div>
    {/if}

    <!-- Masonry Layout for All Items -->
    <div class="columns-2 md:columns-3 gap-4 pb-4 px-2">
        {#each filteredWorks as item}
            <div
                class="relative mb-4 break-inside-avoid group cursor-pointer overflow-hidden border border-[#333] bg-[#080808] hover:border-white transition-all duration-300 shadow-lg"
                onclick={() => openFile(item)}
                onkeydown={(e) => e.key === 'Enter' && openFile(item)}
                role="button"
                tabindex="0"
            >
                <!-- Card Content -->
                <div class="relative w-full">
                    <!-- Visual aspect -->
                    {#if item.image_url && item.image_url.startsWith('http')}
                         <!-- Actual Image -->
                         <img src={item.image_url} alt={item.title} class="w-full h-auto object-cover block" />
                    {:else if ['ART', 'SKETCH'].includes(item.type)}
                         <!-- Art Placeholder -->
                         <div class="w-full aspect-[4/5] flex items-center justify-center text-6xl bg-[#111] text-gray-700">
                             {item.image_url || '🎨'}
                         </div>
                    {:else}
                         <!-- Text Placeholder / Abstract Vis -->
                         <div class="w-full aspect-video flex flex-col p-4 bg-[#111] border-b border-[#222]">
                             <div class="w-full h-full border border-dashed border-[#333] flex items-center justify-center text-gray-700 font-mono text-xs">
                                 {item.type}_FILE
                             </div>
                         </div>
                    {/if}

                    <!-- Text Overlay (Glides up) -->
                    <!-- Position absolute at bottom, initially translated down -->
                    <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent translate-y-[20%] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex flex-col justify-end min-h-[50%]">
                        <div class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[9px] font-mono px-1 border border-white/30 text-white/70 uppercase">{item.type}</span>
                                <span class="text-[9px] font-mono text-gray-400">{item.date}</span>
                            </div>
                            <h3 class="text-white font-bold text-sm leading-snug drop-shadow-md group-hover:text-blue-300 transition-colors mb-1">{item.title}</h3>
                            {#if item.description}
                                <p class="text-[10px] text-gray-400 line-clamp-2 leading-tight">{item.description}</p>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Hover Border Glow Effect -->
                <div class="absolute inset-0 border border-white/0 group-hover:border-white/50 pointer-events-none transition-colors duration-300"></div>
            </div>
        {/each}
    </div>

    {#if filteredWorks.length === 0 && !loading}
            <div class="text-center py-10 border border-dashed border-[#333] text-gray-600 font-mono text-xs">
            // NULL_SET: NO_DATA_FOUND
            </div>
    {/if}
</div>
