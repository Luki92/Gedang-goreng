<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';

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
            { id: 2, type: 'SKETCH', date: '2023.12', title: 'Void Walker Concept', description: 'Character design draft for Project Nebula.', color: 'text-purple-400' },
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

    {#if activeFilter === 'ART'}
        <!-- Grid Layout for ART -->
        <div class="grid grid-cols-2 gap-3 pb-4">
            {#each filteredWorks as item}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class="aspect-square border border-[#333] bg-[#080808] relative overflow-hidden group hover:border-white transition-colors cursor-pointer">
                    <!-- Image / Placeholder -->
                    <div class="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                        {#if item.image_url && item.image_url.startsWith('http')}
                            <img src={item.image_url} alt={item.title} class="w-full h-full object-cover" />
                        {:else}
                            <span>{item.image_url || '🖼️'}</span>
                        {/if}
                    </div>

                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-2 text-center">
                        <!-- We use translateY animation on hover via CSS classes in app.css or inline -->
                        <div class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center">
                            <span class="text-[10px] text-yellow-400 font-[VT323]">{item.date}</span>
                            <h4 class="text-white font-bold text-sm leading-tight">{item.title}</h4>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <!-- List Layout for Writing/Posts -->
        <div class="grid grid-cols-1 gap-2 pb-4">
            {#each filteredWorks as item}
                <a href={item.content_url || '#'} target={item.content_url ? '_blank' : ''} class="block p-4 border border-[#222] bg-[#080808] hover:bg-[#111] hover:border-white transition-all cursor-pointer group relative overflow-hidden">
                    <!-- Glitch Hover Effect Overlay -->
                    <div class="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>

                    <div class="flex justify-between items-center mb-2 relative z-10">
                        <span class="{getTypeColor(item.type)} text-xs font-[VT323] border border-current px-1 opacity-80">[{item.type}]</span>
                        <span class="text-gray-600 text-xs font-mono group-hover:text-gray-400 transition-colors">{item.date}</span>
                    </div>

                    <h3 class="text-white font-bold group-hover:text-blue-400 transition-colors relative z-10 flex items-center gap-2">
                        {item.title}
                        {#if item.content_url}
                            <i class="ph ph-arrow-up-right text-xs opacity-50"></i>
                        {/if}
                    </h3>

                    {#if item.description}
                        <p class="text-xs text-gray-500 mt-1 relative z-10 group-hover:text-gray-400 max-w-[90%] leading-relaxed">{item.description}</p>
                    {/if}
                </a>
            {/each}
        </div>
    {/if}

    {#if filteredWorks.length === 0 && !loading}
            <div class="text-center py-10 border border-dashed border-[#333] text-gray-600 font-mono text-xs">
            // NULL_SET: NO_DATA_FOUND
            </div>
    {/if}
</div>
