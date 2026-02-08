<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import FileViewer from './FileViewer.svelte';

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
                loadMockData();
            } else {
                works = data || [];
                if (works.length === 0) loadMockData();
                loading = false;
            }
        }, 800);
    });

    function loadMockData() {
        works = [
            { id: 1, type: 'ESSAY', date: '2024.01', title: 'The Psychology of Pixel Art', description: 'Analyzing why low-res makes us feel high-emotion.', color: 'text-green-400', content: "<p>We live in a high-fidelity world. 4K screens, 120Hz refresh rates, photorealistic rendering. Yet, pixel art remains distinctively emotional. Why?</p><p>Perhaps it is the <strong>abstraction</strong>. By removing detail, the mind is forced to fill in the gaps. It is a collaborative act of imagination between the artist and the viewer.</p><h3>The Nostalgia Factor</h3><p>For many, it triggers memories of simpler times. But even for those who never grew up with a SNES, there is a certain 'digital warmth' to chunky pixels.</p>" },
            { id: 2, type: 'SKETCH', date: '2023.12', title: 'Void Walker Concept', description: 'Character design draft for Project Nebula.', color: 'text-purple-400', image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop' },
            { id: 3, type: 'ART', date: '2024.02', title: 'Cyber Sunset', description: 'Digital painting.', image_url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop' },
            { id: 4, type: 'POST', date: '2024.03', title: 'Thinking about Svelte 5', description: 'Runes are a game changer for reactivity. The simplicity is refreshing.', content: "<p>Svelte 5 introduces <code>$state</code> and <code>$derived</code> runes. This moves reactivity away from the component compiler magic and into standard JavaScript semantics.</p><p>It feels much more like writing normal code. No more quirky top-level let exports or $ labels that behave unexpectedly.</p>" },
            { id: 5, type: 'ART', date: '2023.11', title: 'Glitch Portrait', description: 'Experimenting with datamoshing.', image_url: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?q=80&w=1000&auto=format&fit=crop' },
            { id: 6, type: 'POST', date: '2024.03', title: 'Coffee Break', description: 'Sometimes you just need to stare at the void.', content: "<p>Taking a break is productive work. The brain needs downtime to consolidate information. Go touch grass.</p>" },
            { id: 7, type: 'ESSAY', date: '2023.10', title: 'Digital Gardening', description: 'Why you should own your own data.', content: "<p>Social media is a rented apartment. A personal website is a home you own. Tend to it, let it grow wild, and don't worry about the algorithm.</p>" },
             { id: 8, type: 'ART', date: '2023.09', title: 'Neon Rain', description: 'Blender 3D render.', image_url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1000&auto=format&fit=crop' }
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

    /**
     * @param {MouseEvent} e
     * @param {any} item
     */
    function openFile(e, item) {
        // Calculate origin rect for animation
        const rect = e.currentTarget.getBoundingClientRect();
        const origin = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };

        windowManager.open('file-' + item.id, origin, {
            component: FileViewer,
            props: item
        });
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

    <!-- Masonry Layout for ALL -->
    <div class="masonry-grid pb-4">
        {#each filteredWorks as item}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="masonry-item mb-4 bg-[#080808] border border-[#222] hover:border-white transition-colors cursor-pointer relative group overflow-hidden break-inside-avoid"
                onclick={(e) => openFile(e, item)}
            >
                <div class="item-content relative transform transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.02]">
                    <!-- Image or Placeholder -->
                    {#if item.image_url && item.image_url.startsWith('http')}
                         <img src={item.image_url} alt={item.title} class="w-full h-auto object-cover block" />
                    {:else if item.image_url}
                         <div class="w-full aspect-square flex items-center justify-center text-4xl bg-[#111]">
                             {item.image_url}
                         </div>
                    {:else}
                         <!-- Text Only Card -->
                         <div class="p-6 min-h-[150px] flex flex-col justify-between">
                            <span class="{getTypeColor(item.type)} text-xs font-[VT323] border border-current px-1 self-start opacity-70 mb-2">[{item.type}]</span>
                            <h3 class="text-white text-lg font-bold leading-tight mb-2">{item.title}</h3>
                            <p class="text-gray-500 text-xs line-clamp-3">{item.description}</p>
                         </div>
                    {/if}
                </div>

                <!-- Hover Info (Gliding from bottom) -->
                {#if item.image_url}
                    <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col items-start justify-end h-24 pointer-events-none">
                        <span class="{getTypeColor(item.type)} text-[10px] font-mono mb-1">{item.type} // {item.date}</span>
                        <h4 class="text-white font-bold text-sm leading-tight">{item.title}</h4>
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    {#if filteredWorks.length === 0 && !loading}
            <div class="text-center py-10 border border-dashed border-[#333] text-gray-600 font-mono text-xs">
            // NULL_SET: NO_DATA_FOUND
            </div>
    {/if}
</div>

<style>
    .masonry-grid {
        column-count: 2;
        column-gap: 1rem;
    }
    .masonry-item {
        break-inside: avoid;
    }
</style>
