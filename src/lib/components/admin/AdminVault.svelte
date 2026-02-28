<script>
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import EditorLayout from '$lib/components/editor/EditorLayout.svelte';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';
    import TiptapEditor from '$lib/components/editor/TiptapEditor.svelte';

    /** @type {{initialWork?: any}} */
    let { initialWork = null } = $props();

    let isEditing = $state(false);
    $effect(() => { if (initialWork) isEditing = true; });
    /** @type {{isVisible: boolean, isSuccess: boolean, message: string, sqlCommands: string[]}} */
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    const initial = initialWork || {};

    let work = $state({
        id: initial.id || null,
        title: initial.title || '',
        content: initial.content || '',
        type: initial.type || 'ESSAY',
        status: initial.status || 'published',
        featured: initial.featured || false
    });

    async function save() {
        if (!isAdmin) return;
        if (!work.title) return alert('Title required');

        const payload = { ...work };
        const id = payload.id;
        delete payload.id;

        let error;
        /** @type {string[]} */
        let sqlCommands = [];

        if (isEditing && work.id) {
            const updateFields = Object.entries(payload)
                .map(([k, v]) => `${k} = ${typeof v === 'string' ? "'" + String(v).replace(/'/g, "''") + "'" : v}`)
                .join(', ');
            sqlCommands = [`UPDATE works SET ${updateFields} WHERE id = ${work.id};`];
            const res = await supabase.from('works').update(payload).eq('id', work.id);
            error = res.error;
        } else {
            const res = await supabase.from('works').insert(payload).select().single();
            error = res.error;
            if (!error && res.data) {
                work.id = res.data.id;
                isEditing = true;
            }
        }

        if (error) {
            saveState = { isVisible: true, isSuccess: false, message: `Error: ${error.message}`, sqlCommands };
        } else {
            saveState = { isVisible: true, isSuccess: true, message: 'Work saved successfully', sqlCommands };
            dataStore.fetchWorks();
        }
        setTimeout(() => saveState.isVisible = false, 4000);
    }

    async function remove() {
        if (!work.id || !isAdmin) return;
        if (!confirm('Delete this work?')) return;
        const { error } = await supabase.from('works').delete().eq('id', work.id);
        if (error) alert('Delete failed: ' + error.message);
        else {
            windowManager.close(`admin-vault-${work.id}`);
            dataStore.fetchWorks();
        }
    }

    function openPreview() {
        const previewId = `vault-preview-${work.id || 'new'}`;
        windowManager.open(previewId, {
            componentId: 'file-viewer',
            title: `PREVIEW: ${work.title || 'Untitled'}`,
            props: { item: work },
            width: 1000,
            height: 800,
            originType: 'bc'
        });
    }
</script>

<EditorLayout title={isEditing ? `EDITING: ${work.title}` : 'NEW_WORK'}>
    {#snippet toolbar()}
        <div class="flex items-center gap-4">
             <input
                bind:value={work.title}
                placeholder="PROJECT_TITLE"
                class="bg-transparent border-b border-white/20 text-white font-bold px-2 py-1 outline-none focus:border-blue-500 transition-colors w-64"
            />
        </div>

        <div class="flex items-center gap-2">
            <button type="button" onclick={openPreview} class="editor-toolbar-button">
                <i class="ph ph-eye-fill"></i> Preview
            </button>
            <div class="h-6 w-px bg-white/10 mx-2"></div>
            <button type="button" onclick={save} class="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                <i class="ph ph-check-circle-fill"></i> SAVE
            </button>
            {#if isEditing}
                <button type="button" onclick={remove} class="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors" title="Delete">
                    <i class="ph ph-trash-fill"></i>
                </button>
            {/if}
        </div>
    {/snippet}

    <div class="flex h-full p-6 overflow-hidden">
        <TiptapEditor bind:content={work.content} />
    </div>
</EditorLayout>

<SaveAnimation {...saveState} />
