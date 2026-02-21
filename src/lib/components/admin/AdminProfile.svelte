<script>
    import { onMount, untrack } from 'svelte';
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import EditorLayout from '$lib/components/editor/EditorLayout.svelte';
    import ContentSettings from '$lib/components/editor/ContentSettings.svelte';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';
    import TiptapEditor from '$lib/components/editor/TiptapEditor.svelte';

    /** @type {{isVisible: boolean, isSuccess: boolean, message: string, sqlCommands: string[]}} */
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

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
        if (dataStore.profile) {
            Object.assign(form, dataStore.profile);
            if (form.bio && !form.bio.includes('<within>')) {
                form.bio = `<within>\n  ${form.bio}\n</within>\n<outside>\n</outside>`;
            } else if (!form.bio) {
                form.bio = `<within>\n  <p>Tell your story...</p>\n</within>\n<outside>\n</outside>`;
            }
        }
    });

    $effect(() => {
        dataStore.profile = { ...untrack(() => dataStore.profile), ...form };
    });

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
            const res = await supabase.from('profile').insert(payload).select().single();
            error = res.error;
            if (!error && res.data) form.id = res.data.id;
        }

        if (error) {
            saveState = { isVisible: true, isSuccess: false, message: `Error: ${error.message}`, sqlCommands };
        } else {
            saveState = { isVisible: true, isSuccess: true, message: 'Profile saved', sqlCommands };
            dataStore.fetchProfile();
        }
        setTimeout(() => saveState.isVisible = false, 4000);
    }

    function openPreview() {
        windowManager.open('profile-preview', {
            componentId: 'c-tl', title: 'IDENTITY_PREVIEW',
            width: 800, height: 600, originType: 'bc'
        });
    }

    const settingsSections = [
        {
            title: 'Meta',
            fields: [
                { key: 'full_name', label: 'Full Name', type: 'text' },
                { key: 'avatar_url', label: 'Avatar URL', type: 'text' },
                { key: 'status', label: 'Online Status', type: 'text' },
                { key: 'location', label: 'Location', type: 'text' },
                { key: 'email', label: 'Email', type: 'text' }
            ]
        }
    ];
</script>

<EditorLayout title="IDENTITY_FREEDOM_EDITOR">
    <svelte:fragment slot="toolbar">
        <button type="button" onclick={openPreview} class="editor-toolbar-button">
            <i class="ph ph-eye"></i> Preview
        </button>
        <div class="h-6 w-px bg-white/10 mx-2"></div>
        <button type="button" onclick={save} class="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors">
            <i class="ph ph-check-circle"></i> Save Profile
        </button>
    </svelte:fragment>

    <div class="flex h-full gap-4 p-4 overflow-hidden">
        <div class="flex-1 flex flex-col min-w-0">
            <TiptapEditor bind:content={form.bio} />
        </div>

        <ContentSettings
            bind:data={form}
            sections={settingsSections}
            onChange={() => {}}
        />
    </div>
</EditorLayout>

<SaveAnimation {...saveState} />
