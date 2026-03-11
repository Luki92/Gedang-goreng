<script>
    import { onMount, untrack } from 'svelte';
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import EditorLayout from '$lib/components/editor/EditorLayout.svelte';
    import ContentSettings from '$lib/components/editor/ContentSettings.svelte';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';

    /** @type {{isVisible: boolean, isSuccess: boolean, message: string, sqlCommands: string[]}} */
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    // Local state for the form, initialized from dataStore
    /** @type {{id: number | null, full_name: string, bio: string, status: string, location: string, email: string, avatar_url: string}} */
    let form = $state({
        id: null,
        full_name: '',
        bio: '',
        status: '',
        location: '',
        email: '',
        avatar_url: ''
    });

    onMount(async () => {
        await dataStore.fetchProfile();
        // Initialize form from store
        if (dataStore.profile) {
            Object.assign(form, dataStore.profile);
        }
    });

    // Real-time sync to dataStore.profile for preview
    $effect(() => {
        // We want to update the store whenever the form changes
        // so that any preview window (Identity.svelte) reacts immediately
        dataStore.profile = { ...untrack(() => dataStore.profile), ...form };
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

        /** @type {any} */
        const payload = { ...form };
        const id = payload.id;
        delete payload.id;

        let error;
        /** @type {string[]} */
        let sqlCommands = [];

        if (id) {
            const updateFields = Object.entries(payload)
                .map(([k, v]) => `${k} = ${typeof v === 'string' ? `'${String(v).replace(/'/g, "''")}'` : v}`)
                .join(', ');
            sqlCommands = [`UPDATE profile SET ${updateFields} WHERE id = ${id};`];
            const res = await supabase.from('profile').update(payload).eq('id', id);
            error = res.error;
        } else {
            const columns = Object.keys(payload).join(', ');
            const values = Object.values(payload)
                .map(v => typeof v === 'string' ? `'${String(v).replace(/'/g, "''")}'` : v)
                .join(', ');
            sqlCommands = [`INSERT INTO profile (${columns}) VALUES (${values});`];
            const res = await supabase.from('profile').insert(payload).select().single();
            error = res.error;
            if (!error && res.data) {
                form.id = res.data.id;
            }
        }

        if (error) {
            showSaveAnimation(false, `Error: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Profile saved successfully', sqlCommands);
            dataStore.fetchProfile();
        }
    }

    function openPreview() {
        windowManager.open('profile-preview', {
            componentId: 'c-tl', title: 'IDENTITY_PREVIEW',
            width: 800,
            height: 600,
            originType: 'bc'
        });
    }

    const settingsSections = [
        {
            title: 'Appearance',
            fields: [
                { key: 'avatar_url', label: 'Avatar URL', type: 'text' },
                { key: 'status', label: 'Online Status', type: 'text' }
            ]
        },
        {
            title: 'Contact',
            fields: [
                { key: 'location', label: 'Location', type: 'text' },
                { key: 'email', label: 'Email', type: 'text' }
            ]
        }
    ];
</script>

<EditorLayout title="IDENTITY_MATRIX_EDITOR">
    <svelte:fragment slot="toolbar">
        <button onclick={openPreview} class="editor-toolbar-button">
            <i class="ph ph-eye"></i> Preview
        </button>
        <div class="h-6 w-px bg-white/10 mx-2"></div>
        <button onclick={save} class="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors">
            <i class="ph ph-check-circle"></i> Save Profile
        </button>
    </svelte:fragment>

    <div class="flex h-full gap-4 p-4 overflow-hidden">
        <!-- Main Form -->
        <div class="flex-1 bg-black/20 border border-white/10 rounded p-6 overflow-y-auto">
            <div class="max-w-2xl space-y-6">
                <div>
                    <label for="full_name" class="editor-label">Full Name</label>
                    <input id="full_name" type="text" bind:value={form.full_name} class="editor-input text-xl font-bold" />
                </div>

                <div>
                    <label for="bio" class="editor-label">Bio / Description</label>
                    <textarea id="bio" bind:value={form.bio} class="editor-textarea text-base" rows="8" placeholder="Tell your story..."></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="status" class="editor-label">Status</label>
                        <input id="status" type="text" bind:value={form.status} class="editor-input" />
                    </div>
                    <div>
                        <label for="location" class="editor-label">Location</label>
                        <input id="location" type="text" bind:value={form.location} class="editor-input" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Settings Panel -->
        <ContentSettings
            bind:data={form}
            sections={settingsSections}
            onChange={() => {}}
        />
    </div>
</EditorLayout>

<SaveAnimation {...saveState} />
