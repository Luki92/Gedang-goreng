<script>
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import EditorLayout from '$lib/components/editor/EditorLayout.svelte';
    import ContentSettings from '$lib/components/editor/ContentSettings.svelte';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';
    import LukiEditor from '$lib/components/editor/LukiEditor.svelte';

    /** @type {{initialWork?: any}} */
    let { initialWork = null } = $props();

    let isEditing = $state(!!initialWork);
    let showSettings = $state(false);
    /** @type {{isVisible: boolean, isSuccess: boolean, message: string, sqlCommands: string[]}} */
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    const initial = initialWork || {};

    // Unified reactive object for form and live preview
    let work = $state({
        id: initial.id || null,
        title: initial.title || '',
        description: initial.description || '',
        type: initial.type || 'ESSAY',
        date: initial.date || new Date().toISOString().slice(0, 7).replace('-', '.'),
        content_url: initial.content_url || '',
        image_url: initial.image_url || '',
        status: initial.status || 'published',
        tags: initial.tags ? (Array.isArray(initial.tags) ? initial.tags.join(', ') : initial.tags) : '',
        featured: initial.featured || false,
        content: initial.content || ''
    });

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

    async function save() {
        if (!$isAdmin) return;
        if (!work.title) return alert('Title required');

        const payload = {
            ...work,
            tags: work.tags.split(',').map(/** @param {string} t */ (t) => t.trim()).filter(Boolean)
        };
        delete payload.id;

        let error;
        let sqlCommands = [];

        if (isEditing && work.id) {
            const updateFields = Object.entries(payload)
                .map(([k, v]) => `${k} = ${typeof v === 'string' ? "'"+v.replace(/'/g, "''")+"'" : v}`)
                .join(', ');
            sqlCommands = [`UPDATE works SET ${updateFields} WHERE id = ${work.id};`];
            const res = await supabase.from('works').update(payload).eq('id', work.id);
            error = res.error;
        } else {
            const columns = Object.keys(payload).join(', ');
            const values = Object.values(payload)
                .map(v => typeof v === 'string' ? "'"+v.replace(/'/g, "''")+"'" : v)
                .join(', ');
            sqlCommands = [`INSERT INTO works (${columns}) VALUES (${values});`];
            const res = await supabase.from('works').insert(payload).select().single();
            error = res.error;
            if (!error && res.data) {
                work.id = res.data.id;
                isEditing = true;
            }
        }

        if (error) {
            showSaveAnimation(false, `Error: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Work saved successfully', sqlCommands);
            dataStore.fetchWorks();
        }
    }

    async function remove() {
        if (!work.id || !$isAdmin) return;
        if (!confirm('Delete this work?')) return;
        const sqlCommands = [`DELETE FROM works WHERE id = ${work.id};`];
        const { error } = await supabase.from('works').delete().eq('id', work.id);
        if (error) {
            showSaveAnimation(false, `Delete failed: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Work deleted successfully', sqlCommands);
            dataStore.fetchWorks();
        }
    }

    function openPreview() {
        // Use a unique ID for this specific preview to allow multiple previews
        const previewId = `vault-preview-${work.id || 'new'}`;
        windowManager.open(previewId, {
            componentId: 'file-viewer',
            title: `PREVIEW: ${work.title || 'Untitled'}`,
            props: { item: work }, // Passing the reactive $state object
            width: 900,
            height: 700,
            originType: 'bc'
        });
    }

    const settingsSections = [
        {
            title: 'General',
            fields: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'type', label: 'Type', type: 'select', options: [
                    { value: 'ESSAY', label: 'Essay' },
                    { value: 'WRITING', label: 'Writing' },
                    { value: 'ART', label: 'Art' },
                    { value: 'POST', label: 'Post' },
                    { value: 'SKETCH', label: 'Sketch' },
                    { value: 'PROJECT', label: 'Project' },
                    { value: 'MUSIC', label: 'Music' }
                ]},
                { key: 'date', label: 'Date', type: 'text', placeholder: 'YYYY.MM' }
            ]
        },
        {
            title: 'Media & Links',
            fields: [
                { key: 'image_url', label: 'Image URL', type: 'text' },
                { key: 'content_url', label: 'External Content URL', type: 'text' }
            ]
        },
        {
            title: 'Meta',
            fields: [
                { key: 'tags', label: 'Tags (comma separated)', type: 'text' },
                { key: 'status', label: 'Status', type: 'select', options: [
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft' }
                ]},
                { key: 'featured', label: 'Featured', type: 'checkbox' }
            ]
        }
    ];
</script>

<EditorLayout title={isEditing ? `EDITING: ${work.title}` : 'NEW_WORK'}>
    <svelte:fragment slot="toolbar">
        <button onclick={openPreview} class="editor-toolbar-button">
            <i class="ph ph-eye"></i> Preview
        </button>
        <div class="h-6 w-px bg-white/10 mx-2"></div>
        <button
            onclick={() => showSettings = !showSettings}
            class="editor-toolbar-button"
            class:active={showSettings}
        >
            <i class="ph ph-gear"></i> Settings
        </button>
        <div class="h-6 w-px bg-white/10 mx-2"></div>
        <button onclick={save} class="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
            <i class="ph ph-check-circle"></i> Save
        </button>
        {#if isEditing}
            <button onclick={remove} class="px-4 py-2 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition-colors">
                <i class="ph ph-trash"></i> Delete
            </button>
        {/if}
    </svelte:fragment>

    <div class="flex h-full gap-4 p-4 overflow-hidden">
        <!-- Editor -->
        <div class="flex-1 flex flex-col min-w-0">
            <LukiEditor bind:content={work.content} />
        </div>

        <!-- Settings Panel -->
        {#if showSettings}
            <ContentSettings
                bind:data={work}
                sections={settingsSections}
                onChange={() => {}}
            />
        {/if}
    </div>
</EditorLayout>

<SaveAnimation {...saveState} />
