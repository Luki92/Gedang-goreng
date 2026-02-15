<script>
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import EditorLayout from '$lib/components/editor/EditorLayout.svelte';
    import ContentSettings from '$lib/components/editor/ContentSettings.svelte';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';

    /** @type {{initialItem?: any}} */
    let { initialItem = null } = $props();

    let isEditing = $state(!!initialItem);
    let showSettings = $state(false);
    /** @type {{isVisible: boolean, isSuccess: boolean, message: string, sqlCommands: string[]}} */
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    const initial = initialItem || {};

    let form = $state({
        id: initial.id || null,
        label: initial.label || '',
        url: initial.url || '',
        icon: initial.icon || 'ph-link',
        description: initial.description || '',
        sort_order: initial.sort_order || 0,
        color: initial.color || '#ffffff'
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
        if (!form.label || !form.url) return alert('Label and URL required');

        const payload = { ...form };
        delete payload.id;

        let error;
        let sqlCommands = [];

        if (isEditing && form.id) {
            const updateFields = Object.entries(payload)
                .map(([k, v]) => `${k} = ${typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v}`)
                .join(', ');
            sqlCommands = [`UPDATE portal SET ${updateFields} WHERE id = ${form.id};`];
            const res = await supabase.from('portal').update(payload).eq('id', form.id);
            error = res.error;
        } else {
            const columns = Object.keys(payload).join(', ');
            const values = Object.values(payload)
                .map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v)
                .join(', ');
            sqlCommands = [`INSERT INTO portal (${columns}) VALUES (${values});`];
            const res = await supabase.from('portal').insert(payload);
            error = res.error;
            if (!error) isEditing = true;
        }

        if (error) {
            showSaveAnimation(false, `Error: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Portal item saved successfully', sqlCommands);
            dataStore.fetchPortal();
        }
    }

    async function remove() {
        if (!form.id || !$isAdmin) return;
        if (!confirm('Delete this portal item?')) return;
        const sqlCommands = [`DELETE FROM portal WHERE id = ${form.id};`];
        const { error } = await supabase.from('portal').delete().eq('id', form.id);
        if (error) {
            showSaveAnimation(false, `Delete failed: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Portal item deleted successfully', sqlCommands);
            dataStore.fetchPortal();
        }
    }

    const settingsSections = [
        {
            title: 'Basic Info',
            fields: [
                { key: 'label', label: 'Label', type: 'text' },
                { key: 'url', label: 'URL', type: 'text' },
                { key: 'icon', label: 'Icon class (Phosphor)', type: 'text' }
            ]
        },
        {
            title: 'Display',
            fields: [
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'color', label: 'Accent Color', type: 'text' },
                { key: 'sort_order', label: 'Order', type: 'number' }
            ]
        }
    ];
</script>

<EditorLayout title={isEditing ? `EDITING: ${form.label}` : 'NEW_PORTAL_ITEM'}>
    <svelte:fragment slot="toolbar">
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
        <div class="flex-1 bg-black/20 border border-white/10 rounded p-6 overflow-y-auto">
            <div class="space-y-4 max-w-xl">
                <div>
                    <label class="editor-label">Label</label>
                    <input type="text" bind:value={form.label} class="editor-input" />
                </div>
                <div>
                    <label class="editor-label">URL</label>
                    <input type="text" bind:value={form.url} class="editor-input" />
                </div>
                <div>
                    <label class="editor-label">Description</label>
                    <textarea bind:value={form.description} class="editor-textarea" rows="4"></textarea>
                </div>
            </div>
        </div>

        {#if showSettings}
            <ContentSettings
                bind:data={form}
                sections={settingsSections}
                onChange={() => {}}
            />
        {/if}
    </div>
</EditorLayout>

<SaveAnimation {...saveState} />
