<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { supabase } from '$lib/supabaseClient';

    let isEditing = $state(false);
    let form = $state({
        id: null,
        title: '',
        artist: '',
        youtube_id: '',
        sort_order: 0,
        lyrics_content: ''
    });

    async function save() {
        if (!form.title || !form.youtube_id) return alert('Title and YouTube ID required');

        const payload = { ...form };
        delete payload.id;

        let error;
        if (isEditing && form.id) {
            const res = await supabase.from('playlist').update(payload).eq('id', form.id);
            error = res.error;
        } else {
            const res = await supabase.from('playlist').insert(payload);
            error = res.error;
        }

        if (error) alert('Error: ' + error.message);
        else {
            reset();
            dataStore.fetchPlaylist();
        }
    }

    async function remove(id) {
        if (!confirm('Delete this track?')) return;
        const { error } = await supabase.from('playlist').delete().eq('id', id);
        if (error) alert(error.message);
        else dataStore.fetchPlaylist();
    }

    function edit(item) {
        form = { ...item };
        isEditing = true;
    }

    function reset() {
        form = {
            id: null,
            title: '',
            artist: '',
            youtube_id: '',
            sort_order: 0,
            lyrics_content: ''
        };
        isEditing = false;
    }
</script>

<div class="h-full flex flex-col bg-transparent text-xs font-mono p-4">
    <div class="border-b border-[#333] pb-2 mb-4 flex justify-between items-center">
        <h2 class="text-pink-400 font-bold">AUDIO_VISUALIZER_DB</h2>
        <button onclick={() => dataStore.fetchPlaylist()} class="text-gray-500 hover:text-white">[REFRESH]</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
        <!-- Form -->
        <div class="bg-[rgba(20,20,30,0.4)] p-4 border border-[#333] overflow-y-auto">
            <h3 class="text-white mb-4 border-b border-[#333] pb-2">{isEditing ? 'EDIT_TRACK' : 'NEW_TRACK'}</h3>
            <div class="space-y-3">
                <div>
                    <label class="block text-gray-500 mb-1">TITLE</label>
                    <input type="text" bind:value={form.title} class="w-full bg-black border border-[#333] text-white p-2 focus:border-pink-500 outline-none">
                </div>
                <div>
                    <label class="block text-gray-500 mb-1">ARTIST</label>
                    <input type="text" bind:value={form.artist} class="w-full bg-black border border-[#333] text-white p-2 focus:border-pink-500 outline-none">
                </div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="block text-gray-500 mb-1">YOUTUBE ID</label>
                        <input type="text" bind:value={form.youtube_id} class="w-full bg-black border border-[#333] text-white p-2 focus:border-pink-500 outline-none">
                    </div>
                    <div class="w-20">
                        <label class="block text-gray-500 mb-1">ORDER</label>
                        <input type="number" bind:value={form.sort_order} class="w-full bg-black border border-[#333] text-white p-2 focus:border-pink-500 outline-none">
                    </div>
                </div>
                <div>
                    <label class="block text-gray-500 mb-1">LYRICS (Optional)</label>
                    <textarea bind:value={form.lyrics_content} rows="5" class="w-full bg-black border border-[#333] text-white p-2 focus:border-pink-500 outline-none font-mono text-[10px]"></textarea>
                </div>

                <div class="flex gap-2 mt-4 pt-4 border-t border-[#333]">
                    <button onclick={save} class="flex-1 bg-pink-900/30 border border-pink-500/50 text-pink-500 py-2 hover:bg-pink-500 hover:text-white transition-all">
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
            {#each dataStore.playlist as item}
                <div class="flex items-center justify-between p-3 border border-[#222] bg-[rgba(10,10,15,0.2)] group hover:border-pink-500/30 transition-colors">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="text-xl text-gray-500 w-8 text-center font-bold">
                            {item.sort_order}
                        </div>
                        <div class="overflow-hidden">
                            <h4 class="text-white truncate font-bold">{item.title}</h4>
                            <p class="text-[10px] text-gray-500 truncate">{item.artist}</p>
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
