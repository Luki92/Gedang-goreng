<script>
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import EditorLayout from '$lib/components/editor/EditorLayout.svelte';
    import ContentSettings from '$lib/components/editor/ContentSettings.svelte';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';

    /** @type {{initialProfile?: any}} */
    let { initialProfile = null } = $props();

    let isEditing = $state(!!initialProfile);
    let showSettings = $state(false);
    /** @type {{isVisible: boolean, isSuccess: boolean, message: string, sqlCommands: string[]}} */
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    const initial = initialProfile || {};

    let form = $state({
        id: initial.id || null,
        key: initial.key || '',
        value: initial.value || '',
        category: initial.category || 'general',
        description: initial.description || '',
        is_public: initial.is_public !== undefined ? initial.is_public : true
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
        if (!form.key || !form.value) return alert('Key and Value required');

        const payload = { ...form };
        delete payload.id;

        let error;
        let sqlCommands = [];

        if (isEditing && form.id) {
            const updateFields = Object.entries(payload)
                .map(([k, v]) => `${k} = ${typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v}`)
                .join(', ');
            sqlCommands = [`UPDATE profile_data SET ${updateFields} WHERE id = ${form.id};`];
            const res = await supabase.from('profile_data').update(payload).eq('id', form.id);
            error = res.error;
        } else {
            const columns = Object.keys(payload).join(', ');
            const values = Object.values(payload)
                .map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v)
                .join(', ');
            sqlCommands = [`INSERT INTO profile_data (${columns}) VALUES (${values});`];
            const res = await supabase.from('profile_data').insert(payload);
            error = res.error;
            if (!error) isEditing = true;
        }

        if (error) {
            showSaveAnimation(false, `Error: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Profile entry saved successfully', sqlCommands);
            dataStore.fetchProfile();
        }
    }

    async function remove() {
        if (!form.id || !$isAdmin) return;
        if (!confirm('Delete this profile entry?')) return;
        const sqlCommands = [`DELETE FROM profile_data WHERE id = ${form.id};`];
        const { error } = await supabase.from('profile_data').delete().eq('id', form.id);
        if (error) {
            showSaveAnimation(false, `Delete failed: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Profile entry deleted successfully', sqlCommands);
            dataStore.fetchProfile();
        }
    }

    const settingsSections = [
        {
            title: 'Entry Meta',
            fields: [
                { key: 'category', label: 'Category', type: 'text' },
                { key: 'is_public', label: 'Publicly Visible', type: 'checkbox' },
                { key: 'description', label: 'Notes', type: 'textarea' }
            ]
        }
    ];
</script>

<EditorLayout title={isEditing ? `EDITING: ${form.key}` : 'NEW_PROFILE_ENTRY'}>
    <svelte:fragment slot="toolbar">
        <button
            onclick={() => showSettings = !showSettings}
            class="editor-toolbar-button"
            class:active={showSettings}
        >
            <i class="ph ph-gear"></i> Settings
        </button>
        <div class="h-6 w-px bg-white/10 mx-2"></div>
        <button onclick={save} class="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors">
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
                    <label class="editor-label">Key</label>
                    <input type="text" bind:value={form.key} class="editor-input" placeholder="e.g. location" />
                </div>
                <div>
                    <label class="editor-label">Value</label>
                    <textarea bind:value={form.value} class="editor-textarea" rows="6" placeholder="Value..."></textarea>
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
