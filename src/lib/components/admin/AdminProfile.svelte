<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';

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

    async function save() {
        const payload = { ...form };
        // Upsert logic for ID 1
        const { error } = await supabase.from('profile').upsert(payload);

        if (error) alert('Error: ' + error.message);
        else {
            alert('Profile updated!');
            dataStore.fetchProfile();
        }
    }
</script>

<div class="h-full flex flex-col bg-transparent text-xs font-mono p-4 overflow-hidden">
    <div class="border-b border-[#333] pb-2 mb-4 flex justify-between items-center">
        <h2 class="text-green-400 font-bold">IDENTITY_MATRIX</h2>
    </div>

    <div class="flex gap-6 h-full overflow-hidden">
        <!-- Form -->
        <div class="flex-1 bg-[rgba(20,20,30,0.4)] p-6 border border-[#333] overflow-y-auto space-y-4 max-w-2xl mx-auto">
            <h3 class="text-white mb-6 border-b border-[#333] pb-2">USER_PROFILE_LUKI</h3>

            <div class="flex gap-4">
                 <div class="w-32 h-32 border border-[#333] bg-black flex items-center justify-center overflow-hidden shrink-0">
                     {#if form.avatar_url}
                         <img src={form.avatar_url} alt="Avatar" class="w-full h-full object-cover">
                     {:else}
                         <span class="text-4xl text-gray-700">?</span>
                     {/if}
                 </div>
                 <div class="flex-1 space-y-3">
                     <div>
                        <label class="block text-gray-500 mb-1">FULL NAME</label>
                        <input type="text" bind:value={form.full_name} class="w-full bg-black border border-[#333] text-white p-2 focus:border-green-500 outline-none">
                    </div>
                     <div>
                        <label class="block text-gray-500 mb-1">AVATAR URL</label>
                        <input type="text" bind:value={form.avatar_url} class="w-full bg-black border border-[#333] text-white p-2 focus:border-green-500 outline-none">
                    </div>
                 </div>
            </div>

            <div>
                <label class="block text-gray-500 mb-1">STATUS</label>
                <input type="text" bind:value={form.status} class="w-full bg-black border border-[#333] text-white p-2 focus:border-green-500 outline-none">
            </div>

            <div>
                <label class="block text-gray-500 mb-1">BIO</label>
                <textarea bind:value={form.bio} rows="5" class="w-full bg-black border border-[#333] text-white p-2 focus:border-green-500 outline-none"></textarea>
            </div>

            <div class="flex gap-4">
                 <div class="flex-1">
                    <label class="block text-gray-500 mb-1">LOCATION</label>
                    <input type="text" bind:value={form.location} class="w-full bg-black border border-[#333] text-white p-2 focus:border-green-500 outline-none">
                </div>
                 <div class="flex-1">
                    <label class="block text-gray-500 mb-1">EMAIL (Public)</label>
                    <input type="text" bind:value={form.email} class="w-full bg-black border border-[#333] text-white p-2 focus:border-green-500 outline-none">
                </div>
            </div>

            <div class="pt-6 border-t border-[#333] text-right">
                <button onclick={save} class="bg-green-900/30 border border-green-500/50 text-green-500 py-3 px-8 hover:bg-green-500 hover:text-white transition-all">
                    COMMIT CHANGES
                </button>
            </div>
        </div>
    </div>
</div>
