<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { supabase } from '$lib/supabaseClient';
    import { isAdmin } from '$lib/stores';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';

    /** @type {{isVisible: boolean, isSuccess: boolean, message: string, sqlCommands: string[]}} */
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    /**
     * @param {boolean} isSuccess
     * @param {string} message
     * @param {string[]} commands
     */
    function showSaveAnimation(isSuccess, message, commands) {
        saveState = {
            isVisible: true,
            isSuccess,
            message,
            sqlCommands: commands
        };
        setTimeout(() => {
            saveState.isVisible = false;
        }, 4000);
    }

    /** @param {any} work */
    function openEditor(work = null) {
        const id = work ? `vault-editor-${work.id}` : `vault-editor-new-${Date.now()}`;
        const title = work ? `EDITING: ${work.title}` : 'NEW_WORK';

        windowManager.open(id, {
            componentId: 'admin-vault',
            title,
            width: 1000,
            height: 800,
            props: { initialWork: work }
        });
    }

    /** @param {any} id */
    async function deleteWork(id) {
        if (!$isAdmin) return;
        if (!confirm('Delete this work?')) return;

        const sqlCommands = [`DELETE FROM works WHERE id = ${id};`];
        const { error } = await supabase.from('works').delete().eq('id', id);

        if (error) {
            showSaveAnimation(false, `Delete failed: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Work deleted successfully', sqlCommands);
            dataStore.fetchWorks();
        }
    }
</script>

<div class="h-full flex flex-col bg-transparent text-white">
    <div class="shrink-0 border-b border-white/10 bg-black/40 px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <h1 class="text-lg font-semibold text-white">VAULT_MANAGER</h1>
            <span class="text-xs text-white/40 font-mono">[{dataStore.works.length} FILES]</span>
        </div>
        <div class="flex items-center gap-2">
            <button onclick={() => dataStore.fetchWorks()} class="p-2 hover:bg-white/10 rounded transition-colors" title="Refresh" aria-label="Refresh">
                <i class="ph-fill ph-arrows-clockwise"></i>
            </button>
            <button onclick={() => openEditor()} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors flex items-center gap-2">
                <i class="ph-fill ph-plus-circle"></i> NEW_FILE
            </button>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each dataStore.works as w}
                <div class="group relative bg-black/40 border border-white/10 rounded-lg overflow-hidden hover:border-blue-500/50 transition-all">
                    <div class="aspect-video bg-black/60 relative overflow-hidden">
                        {#if w.image_url}
                            <img src={w.image_url} alt={w.title} class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        {:else}
                            <div class="w-full h-full flex items-center justify-center text-white/10">
                                <i class="ph-fill ph-image text-4xl"></i>
                            </div>
                        {/if}
                        <div class="absolute top-2 left-2 flex gap-1">
                            <span class="text-[10px] font-bold px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">{w.type}</span>
                            <span class="text-[10px] font-bold px-1.5 py-0.5 bg-black/60 text-white/60 border border-white/10 rounded">{w.date}</span>
                        </div>
                    </div>

                    <div class="p-4">
                        <h3 class="font-semibold text-white truncate mb-1">{w.title}</h3>
                        <p class="text-xs text-white/40 line-clamp-2 mb-4 h-8">{w.description || 'No description'}</p>

                        <div class="flex items-center justify-between pt-4 border-t border-white/5">
                            <span class="text-[10px] font-mono text-white/20">ID: {w.id}</span>
                            <div class="flex gap-2">
                                <button onclick={() => openEditor(w)} class="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded transition-colors" title="Edit" aria-label="Edit">
                                    <i class="ph-fill ph-pencil-simple text-lg"></i>
                                </button>
                                <button onclick={() => deleteWork(w.id)} class="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors" title="Delete" aria-label="Delete">
                                    <i class="ph-fill ph-trash text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        {#if dataStore.works.length === 0}
            <div class="h-full flex flex-col items-center justify-center text-white/20 py-20">
                <i class="ph-fill ph-folder-open text-6xl mb-4"></i>
                <p class="font-mono">NO_FILES_FOUND</p>
            </div>
        {/if}
    </div>
</div>

<SaveAnimation {...saveState} />
