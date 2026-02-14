<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';
    import EditorLayout from '$lib/components/editor/EditorLayout.svelte';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';

    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    let form = $state({
        id: 1,
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
            form = { ...dataStore.profile };
        }
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
        const payload = { ...form };
        const updateFields = Object.entries(payload)
            .map(([k, v]) => `${k} = ${typeof v === 'string' ? `'${v}'` : v}`)
            .join(', ');
        const sqlCommands = [`UPDATE profile SET ${updateFields} WHERE id = 1;`];

        const { error } = await supabase.from('profile').upsert(payload);

        if (error) {
            showSaveAnimation(false, `Error: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Profile saved successfully', sqlCommands);
            dataStore.fetchProfile();
        }
    }
</script>

<EditorLayout title="Identity Profile">
    <svelte:fragment slot="toolbar">
        <button onclick={save} class="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors">
            <i class="ph ph-check-circle"></i> Save
        </button>
    </svelte:fragment>

    <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-2xl mx-auto bg-white rounded-lg border border-gray-300 p-8 space-y-8">
            <!-- Avatar Section -->
            <div class="flex gap-6">
                <div class="w-32 h-32 rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {#if form.avatar_url}
                        <img src={form.avatar_url} alt="Avatar" class="w-full h-full object-cover" />
                    {:else}
                        <span class="text-5xl text-gray-400">?</span>
                    {/if}
                </div>
                <div class="flex-1 space-y-4">
                    <div>
                        <label class="editor-label">Full Name</label>
                        <input type="text" bind:value={form.full_name} class="editor-input" placeholder="Your name" />
                    </div>
                    <div>
                        <label class="editor-label">Avatar URL</label>
                        <input type="text" bind:value={form.avatar_url} class="editor-input" placeholder="https://..." />
                    </div>
                </div>
            </div>

            <!-- Status -->
            <div class="editor-section">
                <label class="editor-label">Status</label>
                <input type="text" bind:value={form.status} class="editor-input" placeholder="e.g., Building interesting things..." />
            </div>

            <!-- Bio -->
            <div class="editor-section">
                <label class="editor-label">Bio</label>
                <textarea bind:value={form.bio} rows="6" class="editor-textarea" placeholder="Tell your story..."></textarea>
            </div>

            <!-- Contact Info -->
            <div class="editor-section">
                <h3 class="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Contact</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="editor-label">Location</label>
                        <input type="text" bind:value={form.location} class="editor-input" placeholder="City, Country" />
                    </div>
                    <div>
                        <label class="editor-label">Email (Public)</label>
                        <input type="email" bind:value={form.email} class="editor-input" placeholder="you@example.com" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</EditorLayout>

<SaveAnimation {...saveState} />
