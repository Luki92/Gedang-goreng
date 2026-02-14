<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { supabase } from '$lib/supabaseClient';
    import EditorLayout from '$lib/components/editor/EditorLayout.svelte';
    import ContentSettings from '$lib/components/editor/ContentSettings.svelte';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';

    let isEditing = $state(false);
    let showSettings = $state(false);
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    let form = $state({
        id: null,
        title: '',
        artist: '',
        youtube_id: '',
        sort_order: 0,
        lyrics_content: ''
    });

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

    async function save() {
        if (!form.title || !form.youtube_id) return alert('Title and YouTube ID required');

        const payload = { ...form };
        delete payload.id;

        let error;
        let sqlCommands = [];

        if (isEditing && form.id) {
            const updateFields = Object.entries(payload)
                .map(([k, v]) => `${k} = ${typeof v === 'string' ? `'${v}'` : v}`)
                .join(', ');
            sqlCommands = [`UPDATE playlist SET ${updateFields} WHERE id = ${form.id};`];
            const res = await supabase.from('playlist').update(payload).eq('id', form.id);
            error = res.error;
        } else {
            const columns = Object.keys(payload).join(', ');
            const values = Object.values(payload)
                .map(v => typeof v === 'string' ? `'${v}'` : v)
                .join(', ');
            sqlCommands = [`INSERT INTO playlist (${columns}) VALUES (${values});`];
            const res = await supabase.from('playlist').insert(payload);
            error = res.error;
        }

        if (error) {
            showSaveAnimation(false, `Error: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Track saved successfully', sqlCommands);
            reset();
            dataStore.fetchPlaylist();
        }
    }

    async function remove(id) {
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

    function edit(item) {
        form = { ...item };
        isEditing = true;
        showSettings = false;
    }

    function reset() {
        form = {
            id: null,
            title: '',
            artist: '',
            youtube_id: '',
            sort_order: 0,
            lyrics_content: ''
        };
        isEditing = false;
        showSettings = false;
    }

    const settingsSections = [
        {
            title: 'Track Info',
            fields: [
                { key: 'title', label: 'Title', type: 'text', placeholder: 'Song title' },
                { key: 'artist', label: 'Artist', type: 'text', placeholder: 'Artist name' },
                { key: 'youtube_id', label: 'YouTube ID', type: 'text', placeholder: '11-character ID' }
            ]
        },
        {
            title: 'Display',
            fields: [
                { key: 'sort_order', label: 'Order', type: 'number' }
            ]
        }
    ];
</script>

<EditorLayout title={isEditing ? `Editing: ${form.title}` : 'New Track'}>
    <svelte:fragment slot="toolbar">
        <button
            onclick={() => showSettings = !showSettings}
            class="editor-toolbar-button"
            class:active={showSettings}
        >
            <i class="ph ph-gear"></i> Settings
        </button>
        <div class="h-6 w-px bg-gray-300 mx-2"></div>
        <button onclick={save} class="px-4 py-2 bg-pink-600 text-white rounded font-medium hover:bg-pink-700 transition-colors">
            <i class="ph ph-check-circle"></i> Save
        </button>
        {#if isEditing}
            <button onclick={reset} class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                Cancel
            </button>
        {/if}
        <button onclick={() => dataStore.fetchPlaylist()} class="editor-toolbar-button">
            <i class="ph ph-arrows-clockwise"></i>
        </button>
    </svelte:fragment>

    <div class="flex h-full gap-4 p-4">
        <!-- Main Form -->
        <div class="flex-1 flex flex-col gap-4 overflow-hidden">
            <div class="bg-white border border-gray-300 rounded p-6 flex-1 overflow-y-auto">
                <div class="space-y-4 max-w-xl">
                    <div>
                        <label class="editor-label">Title</label>
                        <input type="text" bind:value={form.title} class="editor-input" placeholder="Song title" />
                    </div>
                    <div>
                        <label class="editor-label">Artist</label>
                        <input type="text" bind:value={form.artist} class="editor-input" placeholder="Artist name" />
                    </div>
                    <div>
                        <label class="editor-label">YouTube ID</label>
                        <input type="text" bind:value={form.youtube_id} class="editor-input" placeholder="11-character ID" />
                    </div>
                    <div class="editor-section">
                        <label class="editor-label">Lyrics (Optional)</label>
                        <textarea bind:value={form.lyrics_content} rows="8" class="editor-textarea" placeholder="Song lyrics..."></textarea>
                    </div>
                </div>
            </div>
        </div>

        <!-- Settings Panel -->
        {#if showSettings}
            <ContentSettings
                bind:data={form}
                sections={settingsSections}
                onChange={() => {}}
            />
        {/if}
    </div>

    <!-- File Browser -->
    <div class="h-64 border-t border-gray-200 bg-gray-50 overflow-y-auto">
        <div class="sticky top-0 px-4 py-2 bg-gray-100 border-b border-gray-200">
            <h3 class="text-sm font-semibold text-gray-900">Tracks ({dataStore.playlist.length})</h3>
        </div>
        <div class="divide-y divide-gray-200">
            {#each dataStore.playlist as item}
                <div
                    class="px-4 py-3 hover:bg-pink-50 cursor-pointer transition-colors group flex items-start justify-between"
                    onclick={() => edit(item)}
                >
                    <div class="min-w-0 flex-1 flex items-center gap-3">
                        <div class="text-sm font-bold text-gray-500 w-6 text-center shrink-0">
                            {item.sort_order}
                        </div>
                        <div class="min-w-0">
                            <h4 class="font-semibold text-gray-900 truncate">{item.title}</h4>
                            <p class="text-xs text-gray-500 truncate">{item.artist}</p>
                        </div>
                    </div>
                    <button
                        onclick={(e) => { e.stopPropagation(); remove(item.id); }}
                        class="shrink-0 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                    >
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
            {/each}
            {#if dataStore.playlist.length === 0}
                <div class="text-center py-8 text-gray-500 italic">No tracks yet</div>
            {/if}
        </div>
    </div>
</EditorLayout>

<SaveAnimation {...saveState} />
