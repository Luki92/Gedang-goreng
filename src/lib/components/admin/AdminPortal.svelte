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
        label: '',
        url: '',
        description: '',
        icon: 'ph-link',
        category: 'SOCIAL',
        is_visible: true,
        sort_order: 0
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
        if (!form.label || !form.url) return alert('Label and URL required');

        const payload = { ...form };
        delete payload.id;

        let error;
        let sqlCommands = [];

        if (isEditing && form.id) {
            const updateFields = Object.entries(payload)
                .map(([k, v]) => `${k} = ${typeof v === 'string' ? `'${v}'` : v}`)
                .join(', ');
            sqlCommands = [`UPDATE portal_items SET ${updateFields} WHERE id = ${form.id};`];
            const res = await supabase.from('portal_items').update(payload).eq('id', form.id);
            error = res.error;
        } else {
            const columns = Object.keys(payload).join(', ');
            const values = Object.values(payload)
                .map(v => typeof v === 'string' ? `'${v}'` : v)
                .join(', ');
            sqlCommands = [`INSERT INTO portal_items (${columns}) VALUES (${values});`];
            const res = await supabase.from('portal_items').insert(payload);
            error = res.error;
        }

        if (error) {
            showSaveAnimation(false, `Error: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Link saved successfully', sqlCommands);
            reset();
            dataStore.fetchPortal();
        }
    }

    async function remove(id) {
        if (!confirm('Delete this item?')) return;
        const sqlCommands = [`DELETE FROM portal_items WHERE id = ${id};`];
        const { error } = await supabase.from('portal_items').delete().eq('id', id);
        if (error) {
            showSaveAnimation(false, `Delete failed: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Link deleted successfully', sqlCommands);
            dataStore.fetchPortal();
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
            label: '',
            url: '',
            description: '',
            icon: 'ph-link',
            category: 'SOCIAL',
            is_visible: true,
            sort_order: 0
        };
        isEditing = false;
        showSettings = false;
    }

    const settingsSections = [
        {
            title: 'Link Details',
            fields: [
                { key: 'label', label: 'Label', type: 'text', placeholder: 'Link label' },
                { key: 'url', label: 'URL', type: 'text', placeholder: 'https://...' },
                { key: 'description', label: 'Description', type: 'text', placeholder: 'Short description' }
            ]
        },
        {
            title: 'Display',
            fields: [
                { key: 'icon', label: 'Icon', type: 'text', placeholder: 'ph-github-logo' },
                { key: 'category', label: 'Category', type: 'select', options: [
                    { value: 'SOCIAL', label: 'Social' },
                    { value: 'PROJECT', label: 'Project' },
                    { value: 'RESOURCE', label: 'Resource' },
                    { value: 'OTHER', label: 'Other' }
                ]},
                { key: 'sort_order', label: 'Order', type: 'number' },
                { key: 'is_visible', label: 'Visible', type: 'checkbox' }
            ]
        }
    ];
</script>

<EditorLayout title={isEditing ? `Editing: ${form.label}` : 'New Link'}>
    <svelte:fragment slot="toolbar">
        <button
            onclick={() => showSettings = !showSettings}
            class="editor-toolbar-button"
            class:active={showSettings}
        >
            <i class="ph ph-gear"></i> Settings
        </button>
        <div class="h-6 w-px bg-gray-300 mx-2"></div>
        <button onclick={save} class="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
            <i class="ph ph-check-circle"></i> Save
        </button>
        {#if isEditing}
            <button onclick={reset} class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                Cancel
            </button>
        {/if}
        <button onclick={() => dataStore.fetchPortal()} class="editor-toolbar-button">
            <i class="ph ph-arrows-clockwise"></i>
        </button>
    </svelte:fragment>

    <div class="flex h-full gap-4 p-4">
        <!-- Main Form -->
        <div class="flex-1 flex flex-col gap-4 overflow-hidden">
            <div class="bg-white border border-gray-300 rounded p-6 flex-1 overflow-y-auto">
                <div class="space-y-4">
                    <div>
                        <label class="editor-label">Label</label>
                        <input type="text" bind:value={form.label} class="editor-input" placeholder="Link label" />
                    </div>
                    <div>
                        <label class="editor-label">URL</label>
                        <input type="text" bind:value={form.url} class="editor-input" placeholder="https://..." />
                    </div>
                    <div>
                        <label class="editor-label">Description</label>
                        <textarea bind:value={form.description} class="editor-textarea" rows="3" placeholder="Short description"></textarea>
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
            <h3 class="text-sm font-semibold text-gray-900">Links ({dataStore.portalItems.length})</h3>
        </div>
        <div class="divide-y divide-gray-200">
            {#each dataStore.portalItems as item}
                <div
                    class="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors group flex items-start justify-between"
                    onclick={() => edit(item)}
                >
                    <div class="min-w-0 flex-1 flex items-start gap-3">
                        <div class="text-lg text-gray-400 shrink-0 mt-1">
                            <i class="ph {item.icon}"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{item.category}</span>
                                {#if !item.is_visible}
                                    <span class="text-xs font-medium text-red-700">Hidden</span>
                                {/if}
                            </div>
                            <h4 class="font-semibold text-gray-900 truncate">{item.label}</h4>
                            <p class="text-xs text-gray-500 truncate">{item.url}</p>
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
            {#if dataStore.portalItems.length === 0}
                <div class="text-center py-8 text-gray-500 italic">No links yet</div>
            {/if}
        </div>
    </div>
</EditorLayout>

<SaveAnimation {...saveState} />
