<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { supabase } from '$lib/supabaseClient';

    let isEditing = $state(false);
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

    async function save() {
        if (!form.label || !form.url) return alert('Label and URL required');

        const payload = { ...form };
        delete payload.id; // handled by update or insert

        let error;
        if (isEditing && form.id) {
            const res = await supabase.from('portal_items').update(payload).eq('id', form.id);
            error = res.error;
        } else {
            const res = await supabase.from('portal_items').insert(payload);
            error = res.error;
        }

        if (error) alert('Error: ' + error.message);
        else {
            reset();
            dataStore.fetchPortal();
        }
    }

    async function remove(id) {
        if (!confirm('Delete this item?')) return;
        const { error } = await supabase.from('portal_items').delete().eq('id', id);
        if (error) alert(error.message);
        else dataStore.fetchPortal();
    }

    function edit(item) {
        form = { ...item };
        isEditing = true;
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
    }
</script>

<div class="h-full flex flex-col bg-transparent text-xs font-mono p-4">
    <div class="border-b border-[#333] pb-2 mb-4 flex justify-between items-center">
        <h2 class="text-blue-400 font-bold">PORTAL_MANAGER</h2>
        <button onclick={() => dataStore.fetchPortal()} class="text-gray-500 hover:text-white">[REFRESH]</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
        <!-- Form -->
        <div class="bg-[rgba(20,20,30,0.4)] p-4 border border-[#333] overflow-y-auto">
            <h3 class="text-white mb-4 border-b border-[#333] pb-2">{isEditing ? 'EDIT_LINK' : 'NEW_LINK'}</h3>
            <div class="space-y-3">
                <div>
                    <label class="block text-gray-500 mb-1">LABEL</label>
                    <input type="text" bind:value={form.label} class="w-full bg-black border border-[#333] text-white p-2 focus:border-blue-500 outline-none">
                </div>
                <div>
                    <label class="block text-gray-500 mb-1">URL</label>
                    <input type="text" bind:value={form.url} class="w-full bg-black border border-[#333] text-white p-2 focus:border-blue-500 outline-none">
                </div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="block text-gray-500 mb-1">ICON (Phosphor)</label>
                        <input type="text" bind:value={form.icon} placeholder="ph-github-logo" class="w-full bg-black border border-[#333] text-white p-2 focus:border-blue-500 outline-none">
                    </div>
                    <div class="flex-1">
                        <label class="block text-gray-500 mb-1">CATEGORY</label>
                         <select bind:value={form.category} class="w-full bg-black border border-[#333] text-white p-2 focus:border-blue-500 outline-none">
                            <option value="SOCIAL">SOCIAL</option>
                            <option value="PROJECT">PROJECT</option>
                            <option value="RESOURCE">RESOURCE</option>
                            <option value="OTHER">OTHER</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-gray-500 mb-1">DESCRIPTION</label>
                    <input type="text" bind:value={form.description} class="w-full bg-black border border-[#333] text-white p-2 focus:border-blue-500 outline-none">
                </div>
                <div class="flex gap-2">
                     <div class="flex-1">
                        <label class="block text-gray-500 mb-1">ORDER</label>
                        <input type="number" bind:value={form.sort_order} class="w-full bg-black border border-[#333] text-white p-2 focus:border-blue-500 outline-none">
                    </div>
                     <div class="flex-1 flex items-center gap-2 pt-6">
                         <input type="checkbox" bind:checked={form.is_visible} id="vis" class="accent-blue-500">
                         <label for="vis" class="text-gray-400">VISIBLE</label>
                    </div>
                </div>

                <div class="flex gap-2 mt-4 pt-4 border-t border-[#333]">
                    <button onclick={save} class="flex-1 bg-blue-900/30 border border-blue-500/50 text-blue-500 py-2 hover:bg-blue-500 hover:text-white transition-all">
                        {isEditing ? 'UPDATE' : 'INSERT'}
                    </button>
                    {#if isEditing}
                        <button onclick={reset} class="px-4 border border-[#333] text-gray-500 hover:text-white">CANCEL</button>
                    {/if}
                </div>
            </div>
        </div>

        <!-- List -->
        <div class="overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {#each dataStore.portalItems as item}
                <div class="flex items-center justify-between p-3 border border-[#222] bg-[rgba(10,10,15,0.2)] group hover:border-blue-500/30 transition-colors">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="text-xl text-gray-500 w-8 text-center">
                            <i class="ph {item.icon}"></i>
                        </div>
                        <div class="overflow-hidden">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[9px] text-blue-400 border border-blue-900 px-1">{item.category}</span>
                                {#if !item.is_visible}
                                    <span class="text-[9px] text-red-500 border border-red-900 px-1">HIDDEN</span>
                                {/if}
                                <span class="text-[9px] text-gray-600">#{item.sort_order}</span>
                            </div>
                            <h4 class="text-white truncate font-bold">{item.label}</h4>
                            <p class="text-[10px] text-gray-500 truncate">{item.url}</p>
                        </div>
                    </div>
                    <div class="flex gap-2 shrink-0 opacity-20 group-hover:opacity-100 transition-opacity">
                        <button onclick={() => edit(item)} class="text-blue-400 hover:text-white">[EDIT]</button>
                        <button onclick={() => remove(item.id)} class="text-red-500 hover:text-white">[DEL]</button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
