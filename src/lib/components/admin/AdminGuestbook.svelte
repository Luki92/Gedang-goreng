<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { supabase } from '$lib/supabaseClient';

    async function approve(id) {
        const { error } = await supabase.from('guestbook').update({ is_approved: true }).eq('id', id);
        if (error) alert(error.message);
        else dataStore.fetchGuestbook();
    }

    async function remove(id) {
        if (!confirm('Delete this message?')) return;
        const { error } = await supabase.from('guestbook').delete().eq('id', id);
        if (error) alert(error.message);
        else dataStore.fetchGuestbook();
    }
</script>

<div class="h-full flex flex-col bg-[#0a0a0a] text-xs font-mono p-4">
    <div class="border-b border-[#333] pb-2 mb-4 flex justify-between items-center">
        <h2 class="text-yellow-400 font-bold">MODERATION_QUEUE</h2>
        <button onclick={() => dataStore.fetchGuestbook()} class="text-gray-500 hover:text-white">[REFRESH]</button>
    </div>

    <div class="overflow-y-auto space-y-4 h-full custom-scrollbar pr-2">
         {#if dataStore.guestbook.length === 0}
            <div class="text-center py-8 text-gray-600">NO_DATA_FOUND</div>
         {:else}
            {#each dataStore.guestbook as entry}
                <div class="p-4 border border-[#333] bg-[#080808] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-white font-bold">{entry.name}</span>
                            <span class="text-[9px] text-gray-600 font-[VT323]">ID: {entry.visitor_id.slice(0, 8)}...</span>
                            {#if entry.is_approved}
                                <span class="text-[9px] text-green-500 border border-green-900 px-1">APPROVED</span>
                            {:else}
                                <span class="text-[9px] text-yellow-500 border border-yellow-900 px-1 animate-pulse">PENDING</span>
                            {/if}
                        </div>
                        <p class="text-gray-400 text-sm">{entry.message}</p>
                        <p class="text-[10px] text-gray-700 mt-2">{new Date(entry.created_at).toLocaleString()}</p>
                    </div>
                    <div class="flex gap-3">
                        {#if !entry.is_approved}
                            <button onclick={() => approve(entry.id)} class="text-green-500 hover:text-white border border-green-900 px-3 py-1 hover:bg-green-900/50">APPROVE</button>
                        {/if}
                        <button onclick={() => remove(entry.id)} class="text-red-500 hover:text-white border border-red-900 px-3 py-1 hover:bg-red-900/50">DELETE</button>
                    </div>
                </div>
            {/each}
         {/if}
    </div>
</div>
