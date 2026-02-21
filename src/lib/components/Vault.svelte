<script>
    import { onMount } from 'svelte';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import FileViewer from './FileViewer.svelte';

    /**
     * @typedef {Object} NavState
     * @property {string} type
     * @property {string} [filter]
     * @property {any} [item]
     */

    // Navigation State
    /** @type {NavState[]} */
    let history = $state([{ type: 'SELECTOR' }]);
    let currentIndex = $state(0);

    let currentView = $derived(history[currentIndex]);

    onMount(() => {
        dataStore.fetchWorks();
    });

    /** @param {NavState} view */
    function navigate(view) {
        history = [...history.slice(0, currentIndex + 1), view];
        currentIndex = history.length - 1;
    }

    function goBack() {
        if (currentIndex > 0) currentIndex--;
    }

    function goForward() {
        if (currentIndex < history.length - 1) currentIndex++;
    }

    /** @param {string} filter */
    function selectCategory(filter) {
        navigate({ type: 'LIST', filter });
    }

    /** @param {any} item */
    function openFile(item) {
        navigate({ type: 'VIEWER', item });
    }

    let filteredWorks = $derived.by(() => {
        const works = dataStore.works.filter(w => w.status === 'published');
        const filter = currentView.filter || 'ALL';
        if (filter === 'ALL') return works;
        return works.filter(w => {
            if (filter === 'WRITING') return ['ESSAY', 'PROJECT', 'WRITING'].includes(w.type);
            if (filter === 'ART') return ['ART', 'SKETCH'].includes(w.type);
            if (filter === 'POST') return w.type === 'POST';
            return true;
        });
    });
</script>

<div class="h-full flex flex-col bg-transparent text-white overflow-hidden">
    <div class="flex items-center gap-4 px-2 py-2 border-b border-white/10 shrink-0">
        <div class="flex items-center gap-1">
            <button
                type="button"
                onclick={goBack}
                disabled={currentIndex === 0}
                class="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                title="Undo (Back)"
            >
                <i class="ph ph-arrow-left"></i>
            </button>
            <button
                type="button"
                onclick={goForward}
                disabled={currentIndex === history.length - 1}
                class="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                title="Reverse Undo (Forward)"
            >
                <i class="ph ph-arrow-right"></i>
            </button>
        </div>

        <div class="h-4 w-px bg-white/10"></div>

        <div class="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span class="text-blue-500">SYS_PATH:</span>
            <span>ROOT</span>
            {#if currentView.type !== 'SELECTOR'}
                <i class="ph ph-caret-right text-[8px]"></i>
                <span>{currentView.filter || 'FILE'}</span>
            {/if}
            {#if currentView.type === 'VIEWER' && currentView.item}
                 <i class="ph ph-caret-right text-[8px]"></i>
                 <span class="text-white truncate max-w-[150px]">{currentView.item.title}</span>
            {/if}
        </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar relative p-4">
        {#if currentView.type === 'SELECTOR'}
            <div class="h-full flex flex-col items-center justify-center gap-12 py-10">
                <h2 class="text-2xl font-bold tracking-[0.2em] text-white/40 mb-4 font-mono uppercase">Select_Category</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl px-8">
                    <button
                        type="button"
                        onclick={() => selectCategory('WRITING')}
                        class="group flex flex-col items-center gap-6 p-8 border border-white/10 bg-white/5 rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-500"
                    >
                        <div class="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:border-blue-500 transition-all duration-500 shadow-xl">
                            <i class="ph ph-quill text-gray-400 group-hover:text-blue-400"></i>
                        </div>
                        <div class="text-center">
                            <span class="block text-lg font-bold tracking-widest uppercase mb-1">Writing</span>
                            <span class="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">Essays / Projects</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onclick={() => selectCategory('ART')}
                        class="group flex flex-col items-center gap-6 p-8 border border-white/10 bg-white/5 rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-500"
                    >
                        <div class="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:border-purple-500 transition-all duration-500 shadow-xl">
                            <i class="ph ph-palette text-gray-400 group-hover:text-purple-400"></i>
                        </div>
                        <div class="text-center">
                            <span class="block text-lg font-bold tracking-widest uppercase mb-1">Art</span>
                            <span class="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">Sketches / Visuals</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onclick={() => selectCategory('POST')}
                        class="group flex flex-col items-center gap-6 p-8 border border-white/10 bg-white/5 rounded-2xl hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-500"
                    >
                        <div class="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:border-green-500 transition-all duration-500 shadow-xl">
                            <i class="ph ph-chat-centered-text text-gray-400 group-hover:text-green-400"></i>
                        </div>
                        <div class="text-center">
                            <span class="block text-lg font-bold tracking-widest uppercase mb-1">Post</span>
                            <span class="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">Quick Thoughts</span>
                        </div>
                    </button>
                </div>

                <button
                    type="button"
                    onclick={() => selectCategory('ALL')}
                    class="mt-8 text-[10px] text-gray-500 hover:text-white font-mono tracking-[0.3em] uppercase transition-colors"
                >
                    [ Access_All_Nodes ]
                </button>
            </div>

        {:else if currentView.type === 'LIST'}
            <div class="columns-2 md:columns-3 gap-4 pb-4">
                {#each filteredWorks as item}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_interactive_supports_focus -->
                    <div
                        class="relative mb-4 break-inside-avoid group cursor-pointer overflow-hidden border border-[#333] rounded-lg bg-transparent hover:border-white transition-all duration-300 shadow-lg"
                        onclick={() => openFile(item)}
                        role="button"
                    >
                        <div class="relative w-full">
                            {#if item.image_url && item.image_url.startsWith('http')}
                                 <img src={item.image_url} alt={item.title} class="w-full h-auto object-cover block" />
                            {:else}
                                 <div class="w-full aspect-video flex flex-col p-4 bg-transparent border-b border-[#222]">
                                     <div class="w-full h-full border border-dashed border-[#333] flex items-center justify-center text-gray-700 font-mono text-xs">
                                         {item.type}_FILE
                                     </div>
                                 </div>
                            {/if}

                            <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end">
                                <h3 class="text-white font-bold text-sm leading-snug truncate">{item.title}</h3>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            {#if filteredWorks.length === 0}
                <div class="text-center py-20 text-gray-600 font-mono text-xs uppercase tracking-widest">
                    // NULL_SET: NO_RECORDS_IN_THIS_PATH
                </div>
            {/if}

        {:else if currentView.type === 'VIEWER' && currentView.item}
            <div class="h-full">
                <FileViewer item={currentView.item} embed={true} />
            </div>
        {/if}
    </div>
</div>
