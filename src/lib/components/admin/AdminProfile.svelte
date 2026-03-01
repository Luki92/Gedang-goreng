<script>
    import { onMount, untrack } from 'svelte';
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import EditorLayout from '$lib/components/editor/EditorLayout.svelte';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';
    import TiptapEditor from '$lib/components/editor/TiptapEditor.svelte';

    /** @type {{isVisible: boolean, isSuccess: boolean, message: string, sqlCommands: string[]}} */
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    /** @type {{id: number | null, full_name: string, bio: string, avatar_url: string, status: string, location: string, email: string}} */
    let form = $state({
        id: null,
        full_name: '',
        bio: '',
        avatar_url: '',
        status: '',
        location: '',
        email: ''
    });

    onMount(async () => {
        await dataStore.fetchProfile();
        if (dataStore.profile) {
            Object.assign(form, dataStore.profile);
        }
    });

    $effect(() => {
        dataStore.profile = { ...untrack(() => dataStore.profile), ...form };
    });

    async function save() {
        if (!isAdmin) return;

        const payload = { ...form };
        const id = payload.id;
        payload.id = null;

        let error;
        /** @type {string[]} */
        let sqlCommands = [];

        if (id) {
            const updateFields = Object.entries(payload)
                .map(([k, v]) => `${k} = ${typeof v === 'string' ? "'" + String(v).replace(/'/g, "''") + "'" : v}`)
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
            width: 1000, height: 800, originType: 'bc'
        });
    }
</script>

<EditorLayout title="IDENTITY_EDITOR">
    {#snippet toolbar()}
        <div class="flex items-center gap-4">
             <input
                bind:value={form.full_name}
                placeholder="IDENTITY_NAME"
                class="bg-transparent border-b border-white/20 text-white font-bold px-2 py-1 outline-none focus:border-blue-500 transition-colors w-64"
            />
             <input
                bind:value={form.avatar_url}
                placeholder="AVATAR_URL"
                class="bg-transparent border-b border-white/20 text-white/50 text-xs px-2 py-1 outline-none focus:border-blue-500 transition-colors w-48"
            />
        </div>

        <div class="flex items-center gap-2">
            <button type="button" onclick={openPreview} class="editor-toolbar-button">
                <i class="ph-fill ph-eye"></i> Preview
            </button>
            <div class="h-6 w-px bg-white/10 mx-2"></div>
            <button type="button" onclick={save} class="px-6 py-2 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 active:scale-95">
                <i class="ph-fill ph-check-circle"></i> SAVE_PROFILE
            </button>
        </div>
    {/snippet}

    <div class="flex h-full p-6 overflow-hidden">
        <TiptapEditor bind:content={form.bio} />
    </div>
</EditorLayout>

<SaveAnimation {...saveState} />
