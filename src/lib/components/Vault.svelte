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

    /** @param {any} item */
    function getCardImage(item) {
        if (item.image_url && item.image_url.startsWith('http')) return item.image_url;
        const match = item.content?.match(/<img src="([^"]+)"/);
        return match ? match[1] : null;
    }
</script>

<div class="h-full flex flex-col bg-transparent text-white overflow-hidden">
    <div class="flex items-center justify-between px-4 py-2 border-b border-white/10 shrink-0">
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
                <button
                    type="button"
                    onclick={goBack}
                    disabled={currentIndex === 0}
                    class="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-20 transition-all active:scale-90"
                    title="Back"
                >
                    <i class="ph ph-arrow-circle-left-fill"></i>
                </button>
                <button
                    type="button"
                    onclick={goForward}
                    disabled={currentIndex === history.length - 1}
                    class="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-20 transition-all active:scale-90"
                    title="Forward"
                >
                    <i class="ph ph-arrow-circle-right-fill"></i>
                </button>
            </div>

            <div class="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <span class="text-blue-500">SYSTEM:</span>
                <button type="button" onclick={() => currentIndex = 0} class="hover:text-white transition-colors">VAULT</button>
                {#if currentView.type !== 'SELECTOR'}
                    <i class="ph ph-caret-circle-right-fill text-[8px]"></i>
                    <button type="button" onclick={() => { if(currentView.type === 'VIEWER') goBack(); }} class="hover:text-white transition-colors">{currentView.filter || 'FILE'}</button>
                {/if}
            </div>
        </div>

        {#if currentView.type === 'VIEWER' && currentView.item}
             <div class="text-[10px] font-bold text-white/40 tracking-tighter uppercase truncate max-w-[200px]">
                FILE: {currentView.item.title}
             </div>
        {/if}
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar relative">
        {#if currentView.type === 'SELECTOR'}
            <div class="h-full flex flex-col items-center justify-center gap-16 py-10 px-8">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 w-full max-w-5xl">
                    <button
                        type="button"
                        onclick={() => selectCategory('WRITING')}
                        class="group relative flex flex-col items-center gap-8 p-6 sm:p-10 border border-white/5 bg-white/[0.02] rounded-[1.5rem] hover:border-blue-500/50 hover:bg-blue-500/[0.03] transition-all duration-700 hover:-translate-y-2"
                    >
                        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 flex items-center justify-center text-4xl group-hover:bg-blue-500 group-hover:text-white transition-all duration-700 shadow-2xl group-hover:shadow-blue-500/40">
                            <i class="ph ph-pen-nib-fill"></i>
                        </div>
                        <div class="text-center">
                            <span class="block text-xl font-bold tracking-[0.2em] uppercase mb-2">Writing</span>
                            <span class="text-[9px] text-gray-500 font-mono tracking-widest uppercase opacity-60">Thought.Archive</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onclick={() => selectCategory('ART')}
                        class="group relative flex flex-col items-center gap-8 p-6 sm:p-10 border border-white/5 bg-white/[0.02] rounded-[1.5rem] hover:border-purple-500/50 hover:bg-purple-500/[0.03] transition-all duration-700 hover:-translate-y-2"
                    >
                        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 flex items-center justify-center text-4xl group-hover:bg-purple-500 group-hover:text-white transition-all duration-700 shadow-2xl group-hover:shadow-purple-500/40">
                            <i class="ph ph-palette-fill"></i>
                        </div>
                        <div class="text-center">
                            <span class="block text-xl font-bold tracking-[0.2em] uppercase mb-2">Art</span>
                            <span class="text-[9px] text-gray-500 font-mono tracking-widest uppercase opacity-60">Visual.Space</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onclick={() => selectCategory('POST')}
                        class="group relative flex flex-col items-center gap-8 p-6 sm:p-10 border border-white/5 bg-white/[0.02] rounded-[1.5rem] hover:border-green-500/50 hover:bg-green-500/[0.03] transition-all duration-700 hover:-translate-y-2"
                    >
                        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 flex items-center justify-center text-4xl group-hover:bg-green-500 group-hover:text-white transition-all duration-700 shadow-2xl group-hover:shadow-green-500/40">
                            <i class="ph ph-chat-circle-dots-fill"></i>
                        </div>
                        <div class="text-center">
                            <span class="block text-xl font-bold tracking-[0.2em] uppercase mb-2">Post</span>
                            <span class="text-[9px] text-gray-500 font-mono tracking-widest uppercase opacity-60">Neural.Echo</span>
                        </div>
                    </button>
                </div>

                <button
                    type="button"
                    onclick={() => selectCategory('ALL')}
                    class="text-[10px] text-gray-600 hover:text-white font-mono tracking-[0.2em] uppercase transition-all  py-4"
                >
                    [ ACCESS_ALL_DATA_NODES ]
                </button>
            </div>

        {:else if currentView.type === 'LIST'}
            <div class="p-8">
                <div class="columns-2 lg:columns-3 gap-6 pb-12">
                    {#each filteredWorks as item}
                        {@const img = getCardImage(item)}
                        <button
                            type="button"
                            class="relative w-full mb-6 break-inside-avoid group cursor-pointer overflow-hidden border border-white/5 rounded-3xl bg-white/[0.02] hover:border-white/20 transition-all duration-500 shadow-lg text-left"
                            onclick={() => openFile(item)}
                        >
                            <div class="relative w-full">
                                {#if img}
                                     <img src={img} alt={item.title} class="w-full h-auto object-cover block group-hover:scale-105 transition-transform duration-700" />
                                {:else}
                                     <div class="w-full aspect-[4/3] flex flex-col p-8 bg-black/20">
                                         <div class="w-full h-full border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-white/10 font-mono text-[10px] uppercase tracking-tighter">
                                             No_Preview_Media
                                         </div>
                                     </div>
                                {/if}

                                <div class="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end">
                                    <h3 class="text-white font-bold text-sm leading-tight line-clamp-2">{item.title}</h3>
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>

                {#if filteredWorks.length === 0}
                    <div class="flex flex-col items-center justify-center py-32 text-gray-600 font-mono text-xs uppercase tracking-widest opacity-40">
                        <i class="ph ph-warning-circle-fill text-2xl mb-4"></i>
                        <span>// NULL_SET: NO_RECORDS_FOUND</span>
                    </div>
                {/if}
            </div>

        {:else if currentView.type === 'VIEWER' && currentView.item}
            <div class="h-full p-8 pt-0">
                <FileViewer item={currentView.item} embed={true} />
            </div>
        {/if}
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
</style>
