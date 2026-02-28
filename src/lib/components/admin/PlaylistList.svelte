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

    /** @param {any} track */
    function openEditor(track = null) {
        const id = track ? `audio-editor-${track.id}` : `audio-editor-new-${Date.now()}`;
        const title = track ? `EDITING: ${track.title}` : 'NEW_AUDIO_TRACK';

        windowManager.open(id, {
            componentId: 'admin-playlist',
            title,
            width: 800,
            height: 600,
            props: { initialItem: track }
        });
    }

    /** @param {any} id */
    async function remove(id) {
        if (!$isAdmin) return;
        if (!confirm('Delete this track?')) return;

        const sqlCommands = [`DELETE FROM playlist WHERE id = ${id};`];
        const { error } = await supabase.from('playlist').delete().eq('id', id);

        if (error) {
            showSaveAnimation(false, `Delete failed: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Track deleted successfully', sqlCommands);
            dataStore.fetchPlaylist();
        }
    }
</script>

<div class="h-full flex flex-col bg-transparent text-white">
    <div class="shrink-0 border-b border-white/10 bg-black/40 px-6 py-3 flex items-center justify-between">
        <h1 class="text-lg font-semibold">AUDIO_MANAGER</h1>
        <button onclick={() => openEditor()} class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded font-medium transition-colors">
            NEW_TRACK
        </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-2">
            {#each dataStore.playlist as track}
                <div class="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded hover:border-pink-500/50 transition-all">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-white/5 flex items-center justify-center rounded">
                            <i class="ph ph-music-notes-fill text-xl text-pink-400"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold">{track.title}</h3>
                            <p class="text-xs text-white/40">{track.artist}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick={() => openEditor(track)} class="p-2 hover:bg-white/10 rounded" title="Edit" aria-label="Edit">
                            <i class="ph ph-pencil-simple-fill"></i>
                        </button>
                        <button onclick={() => remove(track.id)} class="p-2 hover:bg-red-500/20 text-red-400 rounded" title="Delete" aria-label="Delete">
                            <i class="ph ph-trash-fill"></i>
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<SaveAnimation {...saveState} />
