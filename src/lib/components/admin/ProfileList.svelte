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
        const id = item ? `profile-editor-${item.id}` : `profile-editor-new-${Date.now()}`;
        const title = item ? `EDITING: ${item.key}` : 'NEW_PROFILE_ENTRY';

        windowManager.open(id, {
            componentId: 'admin-profile',
            title,
            width: 800,
            height: 600,
            props: { initialProfile: item }
        });
    }

    /** @param {any} id */
    async function remove(id) {
        if (!$isAdmin) return;
        if (!confirm('Delete this entry?')) return;

        const sqlCommands = [`DELETE FROM profile_data WHERE id = ${id};`];
        const { error } = await supabase.from('profile_data').delete().eq('id', id);

        if (error) {
            showSaveAnimation(false, `Delete failed: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Entry deleted', sqlCommands);
            dataStore.fetchProfile();
        }
    }
</script>

<div class="h-full flex flex-col bg-transparent text-white">
    <div class="shrink-0 border-b border-white/10 bg-black/40 px-6 py-3 flex items-center justify-between">
        <h1 class="text-lg font-semibold">IDENTITY_MANAGER</h1>
        <button onclick={() => openEditor()} class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors">
            NEW_ENTRY
        </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-2">
            {#each dataStore.profile as entry}
                <div class="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded hover:border-green-500/50 transition-all">
                    <div>
                        <h3 class="font-semibold text-green-400 font-mono">{entry.key}</h3>
                        <p class="text-xs text-white/40 truncate max-w-md">{entry.value}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick={() => openEditor(entry)} class="p-2 hover:bg-white/10 rounded"><i class="ph ph-pencil" aria-label="Edit"></i></button>
                        <button onclick={() => remove(entry.id)} class="p-2 hover:bg-red-500/20 text-red-400 rounded"><i class="ph ph-trash" aria-label="Delete"></i></button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<SaveAnimation {...saveState} />
