<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { supabase } from '$lib/supabaseClient';
    import { isAdmin } from '$lib/stores';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import EditorLayout from '$lib/components/editor/EditorLayout.svelte';
    import ContentSettings from '$lib/components/editor/ContentSettings.svelte';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';
    import LukiEditor from './LukiEditor.svelte';

    let isEditing = $state(false);
    let showSettings = $state(false);
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    let workForm = $state({
        id: null,
        title: '',
        description: '',
        type: 'ESSAY',
        date: new Date().toISOString().slice(0, 7).replace('-', '.'),
        content_url: '',
        image_url: '',
        status: 'published',
        tags: '',
        featured: false
    });

    /** @param {string[]} tags */
    function formatTags(tags) {
        return Array.isArray(tags) ? tags.join(', ') : '';
    }

    /** @param {string} tagStr */
    function parseTags(tagStr) {
        return tagStr.split(',').map(t => t.trim()).filter(t => t);
    }

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

    async function saveWork() {
        if (!$isAdmin) {
            alert('Access Denied');
            return;
        }

        if (!workForm.title) return alert('Title required');

        const payload = {
            title: workForm.title,
            description: workForm.description,
            type: workForm.type,
            date: workForm.date,
            content_url: workForm.content_url,
            image_url: workForm.image_url,
            status: workForm.status,
            tags: parseTags(workForm.tags),
            featured: workForm.featured
        };

        let error;
        let sqlCommands = [];

        if (isEditing && workForm.id) {
            const updateFields = Object.entries(payload)
                .map(([k, v]) => `${k} = ${typeof v === 'string' ? `'${v}'` : v}`)
                .join(', ');
            sqlCommands = [`UPDATE works SET ${updateFields} WHERE id = ${workForm.id};`];
            const res = await supabase.from('works').update(payload).eq('id', workForm.id);
            error = res.error;
        } else {
            const columns = Object.keys(payload).join(', ');
            const values = Object.values(payload)
                .map(v => typeof v === 'string' ? `'${v}'` : v)
                .join(', ');
            sqlCommands = [`INSERT INTO works (${columns}) VALUES (${values});`];
            const res = await supabase.from('works').insert(payload);
            error = res.error;
        }

        if (error) {
            showSaveAnimation(false, `Error: ${error.message}`, sqlCommands);
            await dataStore.fetchWorks();
        } else {
            showSaveAnimation(true, 'Successfully saved to database', sqlCommands);
            resetForm();
            await dataStore.fetchWorks();
        }
    }

    /** @param {number} id */
    async function deleteWork(id) {
        if (!$isAdmin) return alert('Access Denied');
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

    /** @param {any} w */
    function editWork(w) {
        workForm = {
            ...w,
            tags: formatTags(w.tags)
        };
        isEditing = true;
        showSettings = false;
    }

    function resetForm() {
        workForm = {
            id: null,
            title: '',
            description: '',
            type: 'ESSAY',
            date: new Date().toISOString().slice(0, 7).replace('-', '.'),
            content_url: '',
            image_url: '',
            status: 'published',
            tags: '',
            featured: false
        };
        isEditing = false;
        showSettings = false;
    }

    function openPreview() {
        const previewId = `preview-${Date.now()}`;
        windowManager.open(previewId, {
            title: `Previewing: ${workForm.title || 'New Work'}`,
            width: 900,
            height: 700,
            component: 'WorkPreview',
            props: { content: workForm.description }
        });
    }

    const settingsSections = [
        {
            title: 'Basic Info',
            fields: [
                { key: 'title', label: 'Title', type: 'text', placeholder: 'Work title' },
                { key: 'type', label: 'Type', type: 'select', options: [
                    { value: 'ESSAY', label: 'Essay' },
                    { value: 'SKETCH', label: 'Sketch' },
                    { value: 'PROJECT', label: 'Project' },
                    { value: 'MUSIC', label: 'Music' },
                    { value: 'ART', label: 'Art' },
                    { value: 'POST', label: 'Post' }
                ]},
                { key: 'status', label: 'Status', type: 'select', options: [
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                    { value: 'archived', label: 'Archived' }
                ]}
            ]
        },
        {
            title: 'Metadata',
            fields: [
                { key: 'date', label: 'Date', type: 'text', placeholder: 'YYYY.MM' },
                { key: 'tags', label: 'Tags', type: 'text', placeholder: 'tech, art, svelte' },
                { key: 'featured', label: 'Featured', type: 'checkbox' }
            ]
        },
        {
            title: 'Resources',
            fields: [
                { key: 'content_url', label: 'Content URL', type: 'text', placeholder: 'https://...' },
                { key: 'image_url', label: 'Image URL', type: 'text', placeholder: 'https://...' }
            ]
        }
    ];
</script>

<EditorLayout title={isEditing ? `Editing: ${workForm.title}` : 'New Work'}>
    <svelte:fragment slot="toolbar">
        <button
            onclick={() => showSettings = !showSettings}
            class="editor-toolbar-button"
            class:active={showSettings}
        >
            <i class="ph ph-gear"></i> Settings
        </button>
        {#if workForm.description}
            <button onclick={openPreview} class="editor-toolbar-button">
                <i class="ph ph-eye"></i> Preview
            </button>
        {/if}
        <div class="h-6 w-px bg-gray-300 mx-2"></div>
        <button onclick={saveWork} class="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
            <i class="ph ph-check-circle"></i> Save
        </button>
        {#if isEditing}
            <button onclick={resetForm} class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                Cancel
            </button>
        {/if}
        <button onclick={() => dataStore.fetchWorks()} class="editor-toolbar-button">
            <i class="ph ph-arrows-clockwise"></i>
        </button>
    </svelte:fragment>

    <div class="flex h-full gap-4 p-4">
        <!-- Content Editor -->
        <div class="flex-1 flex flex-col gap-4 overflow-hidden">
            <div class="flex-1 border border-gray-300 rounded bg-white overflow-hidden">
                <LukiEditor bind:value={workForm.description} />
            </div>
        </div>

        <!-- Settings Panel -->
        {#if showSettings}
            <ContentSettings
                bind:data={workForm}
                sections={settingsSections}
                onChange={() => {}}
            />
        {/if}
    </div>

    <!-- File Browser -->
    <div class="h-64 border-t border-gray-200 bg-gray-50 overflow-y-auto">
        <div class="sticky top-0 px-4 py-2 bg-gray-100 border-b border-gray-200">
            <h3 class="text-sm font-semibold text-gray-900">Works ({dataStore.works.length})</h3>
        </div>
        <div class="divide-y divide-gray-200">
            {#each dataStore.works as w}
                <div
                    class="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors group flex items-start justify-between"
                    onclick={() => editWork(w)}
                >
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded">{w.type}</span>
                            <span class="text-xs text-gray-500">{w.date}</span>
                            <span class="text-xs font-medium {w.status === 'published' ? 'text-green-700' : 'text-yellow-700'}">{w.status}</span>
                        </div>
                        <h4 class="font-semibold text-gray-900 truncate">{w.title}</h4>
                        <p class="text-xs text-gray-500 truncate">{w.description?.substring(0, 60)}...</p>
                    </div>
                    <button
                        onclick={(e) => { e.stopPropagation(); deleteWork(w.id); }}
                        class="shrink-0 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
            {/each}
            {#if dataStore.works.length === 0}
                <div class="text-center py-8 text-gray-500 italic">No works yet</div>
            {/if}
        </div>
    </div>
</EditorLayout>

<SaveAnimation {...saveState} />
