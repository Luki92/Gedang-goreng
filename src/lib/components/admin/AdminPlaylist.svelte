<script>
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import EditorLayout from '$lib/components/editor/EditorLayout.svelte';
    import ContentSettings from '$lib/components/editor/ContentSettings.svelte';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';

    /** @type {{initialItem?: any}} */
    let { initialItem = null } = $props();

    const instanceId = Math.random().toString(36).substring(2, 9);
    let isEditing = $state(!!initialItem);
    let showSettings = $state(false);
    /** @type {{isVisible: boolean, isSuccess: boolean, message: string, sqlCommands: string[]}} */
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    const initial = initialItem || {};

    let form = $state({
        id: initial.id || null,
        title: initial.title || '',
        artist: initial.artist || '',
        youtube_id: initial.youtube_id || '',
        sort_order: initial.sort_order || 0,
        lyrics_content: initial.lyrics_content || ''
    });

    /**
     * @param {boolean} isSuccess
     * @param {string} message
     * @param {string[]} commands
     */
    function showSaveAnimation(isSuccess, message, commands) {
        saveState = { isVisible: true, isSuccess, message, sqlCommands: commands };
        setTimeout(() => saveState.isVisible = false, 4000);
    }

    async function save() {
        if (!isAdmin) return;
        if (!form.title || !form.youtube_id) return alert('Title and YouTube ID required');

        const payload = { ...form };
        const id = payload.id;
        delete payload.id;

        let error;
        /** @type {string[]} */
        let sqlCommands = [];

        if (isEditing && form.id) {
            const updateFields = Object.entries(payload)
                .map(([k, v]) => `${k} = ${typeof v === 'string' ? "'" + v.replace(/'/g, "''") + "'" : v}`)
                .join(', ');
            sqlCommands = [`UPDATE playlist SET ${updateFields} WHERE id = ${form.id};`];
            const res = await supabase.from('playlist').update(payload).eq('id', form.id);
            error = res.error;
        } else {
            const columns = Object.keys(payload).join(', ');
            const values = Object.values(payload)
                .map(v => typeof v === 'string' ? "'" + String(v).replace(/'/g, "''") + "'" : v)
                .join(', ');
            sqlCommands = [`INSERT INTO playlist (${columns}) VALUES (${values});`];
            const res = await supabase.from('playlist').insert(payload).select().single();
            error = res.error;
            if (!error && res.data) {
                form.id = res.data.id;
                isEditing = true;
            }
        }

        if (error) {
            showSaveAnimation(false, `Error: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Track saved successfully', sqlCommands);
            dataStore.fetchPlaylist();
        }
    }

    async function remove() {
        if (!form.id || !isAdmin) return;
        if (!confirm('Delete this track?')) return;
        const sqlCommands = [`DELETE FROM playlist WHERE id = ${form.id};`];
        const { error } = await supabase.from('playlist').delete().eq('id', form.id);
        if (error) {
            showSaveAnimation(false, `Delete failed: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Track deleted successfully', sqlCommands);
            dataStore.fetchPlaylist();
        }
    }

    function openPreview() {
        const previewId = `playlist-preview-${form.id || 'new'}`;
        windowManager.open(previewId, {
            componentId: 'c-bl',
            title: `PREVIEW: ${form.title || 'Audio Track'}`,
            props: { previewTrack: form },
            width: 500,
            height: 600,
            originType: 'bl'
        });
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

<EditorLayout title={isEditing ? `EDITING: ${form.title}` : 'NEW_AUDIO_TRACK'}>
    {#snippet toolbar()}
        <button type="button" onclick={openPreview} class="editor-toolbar-button">
            <i class="ph-fill ph-eye"></i> Preview
        </button>
        <div class="h-6 w-px bg-white/10 mx-2"></div>
        <button
            type="button"
            onclick={() => showSettings = !showSettings}
            class="editor-toolbar-button"
            class:active={showSettings}
        >
            <i class="ph-fill ph-gear-six"></i> Settings
        </button>
        <div class="h-6 w-px bg-white/10 mx-2"></div>
        <button type="button" onclick={save} class="px-4 py-2 bg-pink-600 text-white rounded font-medium hover:bg-pink-700 transition-colors">
            <i class="ph-fill ph-check-circle"></i> Save
        </button>
        {#if isEditing}
            <button type="button" onclick={remove} class="px-4 py-2 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition-colors">
                <i class="ph-fill ph-trash"></i> Delete
            </button>
        {/if}
    {/snippet}

    <div class="flex h-full gap-4 p-4 overflow-hidden">
        <div class="flex-1 flex flex-col gap-4 overflow-hidden">
            <div class="bg-black/20 border border-white/10 rounded p-6 flex-1 overflow-y-auto">
                <div class="space-y-4 max-w-xl">
                    <div>
                        <label class="editor-label" for="title-{instanceId}">Title</label>
                        <input id="title-{instanceId}" type="text" bind:value={form.title} class="editor-input" placeholder="Song title" />
                    </div>
                    <div>
                        <label class="editor-label" for="artist-{instanceId}">Artist</label>
                        <input id="artist-{instanceId}" type="text" bind:value={form.artist} class="editor-input" placeholder="Artist name" />
                    </div>
                    <div>
                        <label class="editor-label" for="ytid-{instanceId}">YouTube ID</label>
                        <input id="ytid-{instanceId}" type="text" bind:value={form.youtube_id} class="editor-input" placeholder="11-character ID" />
                    </div>
                    <div class="editor-section">
                        <label class="editor-label" for="lyrics-{instanceId}">Lyrics (Optional)</label>
                        <textarea id="lyrics-{instanceId}" bind:value={form.lyrics_content} rows="10" class="editor-textarea" placeholder="Song lyrics..."></textarea>
                    </div>
                </div>
            </div>
        </div>

        {#if showSettings}
            <ContentSettings bind:data={form} sections={settingsSections} onChange={() => {}} />
        {/if}
    </div>
</EditorLayout>

<SaveAnimation {...saveState} />
