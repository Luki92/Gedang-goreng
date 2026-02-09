<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { supabase } from '$lib/supabaseClient';

    let isEditing = $state(false);
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

    // Helper to format tags array <-> string
    function formatTags(tags) {
        return Array.isArray(tags) ? tags.join(', ') : '';
    }

    function parseTags(tagStr) {
        return tagStr.split(',').map(t => t.trim()).filter(t => t);
    }

    async function saveWork() {
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
        if (isEditing && workForm.id) {
            const res = await supabase.from('works').update(payload).eq('id', workForm.id);
            error = res.error;
        } else {
            const res = await supabase.from('works').insert(payload);
            error = res.error;
        }

        if (error) alert('Error: ' + error.message);
        else {
            resetForm();
            dataStore.fetchWorks();
        }
    }

    async function deleteWork(id) {
        if (!confirm('Delete this work?')) return;
        const { error } = await supabase.from('works').delete().eq('id', id);
        if (error) alert(error.message);
        else dataStore.fetchWorks();
    }

    function editWork(w) {
        workForm = {
            ...w,
            tags: formatTags(w.tags)
        };
        isEditing = true;
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
    }
</script>

<div class="h-full flex flex-col bg-[#0a0a0a] text-xs font-mono p-4 overflow-hidden">
    <div class="border-b border-[#333] pb-2 mb-4 flex justify-between items-center">
        <h2 class="text-white font-bold">VAULT_MANAGER</h2>
        <button onclick={() => dataStore.fetchWorks()} class="text-gray-500 hover:text-white">[REFRESH]</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
        <!-- Form -->
        <div class="bg-[#111] p-4 border border-[#333] overflow-y-auto">
            <h3 class="text-white mb-4 border-b border-[#333] pb-2">{isEditing ? 'EDIT_NODE' : 'NEW_NODE'}</h3>
            <div class="space-y-3">
                <div>
                    <label class="block text-gray-500 mb-1">TITLE</label>
                    <input type="text" bind:value={workForm.title} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                </div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="block text-gray-500 mb-1">TYPE</label>
                        <select bind:value={workForm.type} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                            <option value="ESSAY">ESSAY</option>
                            <option value="SKETCH">SKETCH</option>
                            <option value="PROJECT">PROJECT</option>
                            <option value="MUSIC">MUSIC</option>
                            <option value="ART">ART</option>
                            <option value="POST">POST</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <label class="block text-gray-500 mb-1">STATUS</label>
                        <select bind:value={workForm.status} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                            <option value="draft">DRAFT</option>
                            <option value="published">PUBLISHED</option>
                            <option value="archived">ARCHIVED</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-gray-500 mb-1">DATE (YYYY.MM)</label>
                    <input type="text" bind:value={workForm.date} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                </div>
                <div>
                    <label class="block text-gray-500 mb-1">DESCRIPTION</label>
                    <textarea bind:value={workForm.description} rows="3" class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none"></textarea>
                </div>
                <div>
                    <label class="block text-gray-500 mb-1">URL (Content)</label>
                    <input type="text" bind:value={workForm.content_url} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                </div>
                <div>
                    <label class="block text-gray-500 mb-1">URL (Image)</label>
                    <input type="text" bind:value={workForm.image_url} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                </div>
                <div>
                    <label class="block text-gray-500 mb-1">TAGS (comma separated)</label>
                    <input type="text" bind:value={workForm.tags} placeholder="tech, art, svelte" class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" bind:checked={workForm.featured} id="featured" class="accent-red-500">
                    <label for="featured" class="text-gray-400 cursor-pointer">FEATURED</label>
                </div>

                <div class="flex gap-2 mt-4 pt-4 border-t border-[#333]">
                    <button onclick={saveWork} class="flex-1 bg-red-900/30 border border-red-500/50 text-red-500 py-2 hover:bg-red-500 hover:text-white transition-all">
                        {isEditing ? 'UPDATE' : 'INSERT'}
                    </button>
                    {#if isEditing}
                        <button onclick={resetForm} class="px-4 border border-[#333] text-gray-500 hover:text-white">CANCEL</button>
                    {/if}
                </div>
            </div>
        </div>

        <!-- List -->
        <div class="overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {#each dataStore.works as w}
                <div class="flex items-start justify-between p-3 border border-[#222] bg-[#080808] group hover:border-red-500/30 transition-colors">
                    <div class="overflow-hidden flex-1">
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <span class="text-[9px] text-red-400 border border-red-900 px-1">{w.type}</span>
                            <span class="text-[9px] text-gray-500">{w.date}</span>
                            <span class="text-[9px] px-1 {w.status === 'published' ? 'text-green-500 border border-green-900' : 'text-yellow-500 border border-yellow-900'}">{w.status.toUpperCase()}</span>
                            {#if w.featured}
                                <span class="text-[9px] text-yellow-300 border border-yellow-500/50 px-1">★</span>
                            {/if}
                        </div>
                        <h4 class="text-white truncate font-bold text-sm mb-1">{w.title}</h4>
                        {#if w.tags && w.tags.length}
                            <div class="flex gap-1 flex-wrap">
                                {#each w.tags as t}
                                    <span class="text-[9px] text-gray-600">#{t}</span>
                                {/each}
                            </div>
                        {/if}
                    </div>
                    <div class="flex flex-col gap-2 shrink-0 opacity-20 group-hover:opacity-100 transition-opacity ml-2">
                        <button onclick={() => editWork(w)} class="text-blue-400 hover:text-white text-[10px] border border-blue-900 px-1">EDIT</button>
                        <button onclick={() => deleteWork(w.id)} class="text-red-500 hover:text-white text-[10px] border border-red-900 px-1">DEL</button>
                    </div>
                </div>
            {/each}
             {#if dataStore.works.length === 0}
                <div class="text-center py-8 text-gray-600 italic">No works found.</div>
            {/if}
        </div>
    </div>
</div>
