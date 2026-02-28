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

    /** @param {any} item */
    function openEditor(item = null) {
        const id = item ? `portal-editor-${item.id}` : `portal-editor-new-${Date.now()}`;
        const title = item ? `EDITING: ${item.label}` : 'NEW_PORTAL_ITEM';

        windowManager.open(id, {
            componentId: 'admin-portal',
            title,
            width: 800,
            height: 600,
            props: { initialItem: item }
        });
    }

    /** @param {any} id */
    async function remove(id) {
        if (!$isAdmin) return;
        if (!confirm('Delete this portal item?')) return;

        const sqlCommands = [`DELETE FROM portal WHERE id = ${id};`];
        const { error } = await supabase.from('portal').delete().eq('id', id);

        if (error) {
            showSaveAnimation(false, `Delete failed: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Portal item deleted', sqlCommands);
            dataStore.fetchPortal();
        }
    }
</script>

<div class="h-full flex flex-col bg-transparent text-white">
    <div class="shrink-0 border-b border-white/10 bg-black/40 px-6 py-3 flex items-center justify-between">
        <h1 class="text-lg font-semibold">PORTAL_MANAGER</h1>
        <button onclick={() => openEditor()} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
            NEW_ITEM
        </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-2">
            {#each dataStore.portalItems as item}
                <div class="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded hover:border-blue-500/50 transition-all">
                    <div class="flex items-center gap-4">
                        <i class="{item.icon} text-2xl text-blue-400"></i>
                        <div>
                            <h3 class="font-semibold">{item.label}</h3>
                            <p class="text-xs text-white/40">{item.url}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick={() => openEditor(item)} class="p-2 hover:bg-white/10 rounded" title="Edit" aria-label="Edit">
                            <i class="ph-fill ph-pencil-simple"></i>
                        </button>
                        <button onclick={() => remove(item.id)} class="p-2 hover:bg-red-500/20 text-red-400 rounded" title="Delete" aria-label="Delete">
                            <i class="ph-fill ph-trash"></i>
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<SaveAnimation {...saveState} />
