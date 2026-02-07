<script>
    import { onMount } from 'svelte';
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';

    let activeTab = $state('WORKS');
    let works = $state([]);
    let guestbookEntries = $state([]);
    let loading = $state(false);

    // --- WORKS STATE ---
    let workForm = $state({
        id: null,
        title: '',
        description: '',
        type: 'ESSAY',
        date: new Date().toISOString().slice(0, 7).replace('-', '.'),
        content_url: '',
        image_url: ''
    });
    let isEditing = $state(false);

    // --- FETCHING ---
    async function fetchWorks() {
        loading = true;
        const { data, error } = await supabase.from('works').select('*').order('date', { ascending: false });
        if (data) works = data;
        loading = false;
    }

    async function fetchGuestbook() {
        loading = true;
        // Fetch ALL entries for moderation
        const { data, error } = await supabase.from('guestbook').select('*').order('created_at', { ascending: false });
        if (data) guestbookEntries = data;
        loading = false;
    }

    // --- WORK ACTIONS ---
    async function saveWork() {
        if (!workForm.title) return alert('Title required');

        const payload = {
            title: workForm.title,
            description: workForm.description,
            type: workForm.type,
            date: workForm.date,
            content_url: workForm.content_url,
            image_url: workForm.image_url
        };

        let error;
        if (isEditing && workForm.id) {
            const res = await supabase.from('works').update(payload).eq('id', workForm.id);
            error = res.error;
        } else {
            const res = await supabase.from('works').insert(payload);
            error = res.error;
        }

        if (error) alert('Error: ' + error.message);
        else {
            resetWorkForm();
            fetchWorks();
        }
    }

    async function deleteWork(id) {
        if (!confirm('Delete this work?')) return;
        const { error } = await supabase.from('works').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchWorks();
    }

    function editWork(w) {
        workForm = { ...w };
        isEditing = true;
    }

    function resetWorkForm() {
        workForm = {
            id: null,
            title: '',
            description: '',
            type: 'ESSAY',
            date: new Date().toISOString().slice(0, 7).replace('-', '.'),
            content_url: '',
            image_url: ''
        };
        isEditing = false;
    }

    // --- GUESTBOOK ACTIONS ---
    async function approveEntry(id) {
        const { error } = await supabase.from('guestbook').update({ is_approved: true }).eq('id', id);
        if (error) alert(error.message);
        else fetchGuestbook();
    }

    async function deleteEntry(id) {
        if (!confirm('Delete this message?')) return;
        const { error } = await supabase.from('guestbook').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchGuestbook();
    }

    // --- LIFECYCLE ---
    $effect(() => {
        if ($isAdmin) {
            fetchWorks();
            fetchGuestbook();
        }
    });
</script>

{#if $isAdmin}
    <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl h-[80vh] bg-[#0a0a0a] border border-red-500/50 shadow-[0_0_50px_rgba(255,0,0,0.1)] z-50 flex flex-col font-mono text-sm overflow-hidden rounded-lg">
        <!-- Header -->
        <div class="bg-red-900/20 border-b border-red-900/50 p-2 flex justify-between items-center text-red-500 font-bold">
            <span>[ADMIN_PANEL_V1]</span>
            <div class="flex gap-4">
                <button onclick={() => activeTab = 'WORKS'} class:text-white={activeTab === 'WORKS'} class="hover:text-white">[WORKS_DB]</button>
                <button onclick={() => activeTab = 'GUESTBOOK'} class:text-white={activeTab === 'GUESTBOOK'} class="hover:text-white">[GUESTBOOK_MOD]</button>
                <button onclick={() => $isAdmin = false} class="ml-4 hover:text-white">[LOGOUT]</button>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 bg-black/80">
            {#if activeTab === 'WORKS'}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Form -->
                    <div class="bg-[#111] p-4 border border-[#333]">
                        <h3 class="text-white mb-4 border-b border-[#333] pb-2">{isEditing ? 'EDIT_NODE' : 'NEW_NODE'}</h3>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-gray-500 text-xs mb-1">TITLE</label>
                                <input type="text" bind:value={workForm.title} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none transition-colors">
                            </div>
                            <div>
                                <label class="block text-gray-500 text-xs mb-1">TYPE</label>
                                <select bind:value={workForm.type} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                                    <option value="ESSAY">ESSAY</option>
                                    <option value="SKETCH">SKETCH</option>
                                    <option value="PROJECT">PROJECT</option>
                                    <option value="MUSIC">MUSIC</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-gray-500 text-xs mb-1">DATE</label>
                                <input type="text" bind:value={workForm.date} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-gray-500 text-xs mb-1">DESCRIPTION</label>
                                <textarea bind:value={workForm.description} rows="3" class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none"></textarea>
                            </div>
                            <div class="flex gap-2">
                                <div class="flex-1">
                                    <label class="block text-gray-500 text-xs mb-1">CONTENT URL</label>
                                    <input type="text" bind:value={workForm.content_url} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                                </div>
                                <div class="flex-1">
                                    <label class="block text-gray-500 text-xs mb-1">IMAGE URL</label>
                                    <input type="text" bind:value={workForm.image_url} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                                </div>
                            </div>
                            <div class="flex gap-2 mt-4">
                                <button onclick={saveWork} class="flex-1 bg-red-900/30 border border-red-500/50 text-red-500 py-2 hover:bg-red-500 hover:text-white transition-all">
                                    {isEditing ? 'UPDATE' : 'INSERT'}
                                </button>
                                {#if isEditing}
                                    <button onclick={resetWorkForm} class="px-4 border border-[#333] text-gray-500 hover:text-white">CANCEL</button>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- List -->
                    <div class="space-y-2">
                        {#if loading}
                            <div class="text-center py-8 text-gray-500 animate-pulse">SYNCING_DATABASE...</div>
                        {:else}
                            {#each works as w}
                                <div class="flex items-center justify-between p-3 border border-[#222] bg-[#080808] group hover:border-red-500/30 transition-colors">
                                    <div class="overflow-hidden">
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="text-[10px] text-red-400 border border-red-900 px-1">{w.type}</span>
                                            <span class="text-xs text-gray-500">{w.date}</span>
                                        </div>
                                        <h4 class="text-white truncate">{w.title}</h4>
                                    </div>
                                    <div class="flex gap-2 shrink-0 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <button onclick={() => editWork(w)} class="text-blue-400 hover:text-white">[EDIT]</button>
                                        <button onclick={() => deleteWork(w.id)} class="text-red-500 hover:text-white">[DEL]</button>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>

            {:else if activeTab === 'GUESTBOOK'}
                <div class="space-y-4">
                     <h3 class="text-white mb-4 border-b border-[#333] pb-2">MODERATION_QUEUE</h3>
                     {#if loading}
                        <div class="text-center py-8 text-gray-500 animate-pulse">FETCHING_SIGNALS...</div>
                     {:else if guestbookEntries.length === 0}
                        <div class="text-center py-8 text-gray-600">NO_DATA_FOUND</div>
                     {:else}
                        {#each guestbookEntries as entry}
                            <div class="p-4 border border-[#333] bg-[#080808] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="text-white font-bold">{entry.name}</span>
                                        <span class="text-xs text-gray-600 font-[VT323]">ID: {entry.visitor_id.slice(0, 8)}...</span>
                                        {#if entry.is_approved}
                                            <span class="text-[10px] text-green-500 border border-green-900 px-1">APPROVED</span>
                                        {:else}
                                            <span class="text-[10px] text-yellow-500 border border-yellow-900 px-1 animate-pulse">PENDING</span>
                                        {/if}
                                    </div>
                                    <p class="text-gray-400 text-sm">{entry.message}</p>
                                    <p class="text-[10px] text-gray-700 mt-2">{new Date(entry.created_at).toLocaleString()}</p>
                                </div>
                                <div class="flex gap-3">
                                    {#if !entry.is_approved}
                                        <button onclick={() => approveEntry(entry.id)} class="text-green-500 hover:text-white border border-green-900 px-3 py-1 hover:bg-green-900/50">APPROVE</button>
                                    {/if}
                                    <button onclick={() => deleteEntry(entry.id)} class="text-red-500 hover:text-white border border-red-900 px-3 py-1 hover:bg-red-900/50">DELETE</button>
                                </div>
                            </div>
                        {/each}
                     {/if}
                </div>
            {/if}
        </div>
    </div>
{/if}
