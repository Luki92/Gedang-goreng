<script>
    import { onMount } from 'svelte';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { dataStore } from '$lib/stores/data.svelte.js';

    let activeFilter = $state('ALL'); // ALL, WRITING, ART, POST

    onMount(() => {
        dataStore.fetchWorks();
    });

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
        const works = dataStore.works.filter(w => w.status === 'published');
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
        windowManager.open('file-viewer', { props: { item }, originType: 'bc', title: item.title });
    }
</script>

<div class="h-full overflow-y-auto relative custom-scrollbar pr-2">
    <!-- Filter Header -->
    <div class="sticky top-0 bg-transparent z-20 flex gap-4 mb-4 border-b border-[#333] pb-2 text-sm pt-1">
        <button onclick={() => activeFilter = 'ALL'} class="text-gray-500 hover:text-white border-b-2 transition-colors {activeFilter === 'ALL' ? 'text-white border-white' : 'border-transparent'}">ALL</button>
        <button onclick={() => activeFilter = 'WRITING'} class="text-gray-500 hover:text-white border-b-2 transition-colors {activeFilter === 'WRITING' ? 'text-white border-white' : 'border-transparent'}">WRITING</button>
        <button onclick={() => activeFilter = 'ART'} class="text-gray-500 hover:text-white border-b-2 transition-colors {activeFilter === 'ART' ? 'text-white border-white' : 'border-transparent'}">ART</button>
        <button onclick={() => activeFilter = 'POST'} class="text-gray-500 hover:text-white border-b-2 transition-colors {activeFilter === 'POST' ? 'text-white border-white' : 'border-transparent'}">POST</button>
    </div>

    {#if dataStore.loading && dataStore.works.length === 0}
        <div class="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-transparent/80 z-20">
            <div class="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            <p class="text-xs text-green-500 font-mono animate-pulse">DECRYPTING_VAULT...</p>
        </div>
    {/if}

    <!-- Masonry Layout for All Items -->
    <div class="columns-2 md:columns-3 gap-4 pb-4 px-2">
        {#each filteredWorks as item}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_interactive_supports_focus -->
            <div
                class="relative mb-4 break-inside-avoid group cursor-pointer overflow-hidden border border-[#333] rounded-lg bg-transparent rounded-lg hover:border-white transition-all duration-300 shadow-lg"
                onclick={() => openFile(item)}
                onkeydown={(e) => e.key === 'Enter' && openFile(item)}
                role="button"
            >
                <!-- Card Content -->
                <div class="relative w-full">
                    <!-- Visual aspect -->
                    {#if item.image_url && item.image_url.startsWith('http')}
                         <!-- Actual Image -->
                         <img src={item.image_url} alt={item.title} class="w-full h-auto object-cover block" />
                    {:else if ['ART', 'SKETCH'].includes(item.type)}
                         <!-- Art Placeholder -->
                         <div class="w-full aspect-[4/5] flex items-center justify-center text-6xl bg-transparent text-gray-700">
                             {item.image_url || '🎨'}
                         </div>
                    {:else}
                         <!-- Text Placeholder / Abstract Vis -->
                         <div class="w-full aspect-video flex flex-col p-4 bg-transparent border-b border-[#222]">
                             <div class="w-full h-full border border-dashed border-[#333] flex items-center justify-center text-gray-700 font-mono text-xs">
                                 {item.type}_FILE
                             </div>
                         </div>
                    {/if}

                    <!-- Text Overlay (Glides up) -->
                    <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent translate-y-[20%] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex flex-col justify-end min-h-[50%]">
                        <div class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="text-[9px] font-mono px-1 border border-white/30 text-white/70 uppercase">{item.type}</span>
                                <span class="text-[9px] font-mono text-gray-400">{item.date}</span>
                                {#if item.featured}
                                    <span class="text-[9px] text-yellow-500">★</span>
                                {/if}
                            </div>
                            <h3 class="text-white font-bold text-sm leading-snug drop-shadow-md group-hover:text-blue-300 transition-colors mb-1">{item.title}</h3>
                            {#if item.description}
                                <p class="text-[10px] text-gray-400 line-clamp-2 leading-tight">{item.description}</p>
                            {/if}
                            {#if item.tags && item.tags.length > 0}
                                <div class="flex gap-1 flex-wrap mt-1">
                                    {#each item.tags.slice(0, 3) as t}
                                        <span class="text-[8px] text-gray-500">#{t}</span>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Hover Border Glow Effect -->
                <div class="absolute inset-0 border border-white/0 group-hover:border-white/50 pointer-events-none transition-colors duration-300"></div>
            </div>
        {/each}
    </div>

    {#if filteredWorks.length === 0 && !dataStore.loading}
            <div class="text-center py-10 border border-dashed border-[#333] text-gray-600 font-mono text-xs">
            // NULL_SET: NO_DATA_FOUND
            </div>
    {/if}
</div>
