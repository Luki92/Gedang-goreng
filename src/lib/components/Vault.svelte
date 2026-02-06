<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { isAdmin } from '$lib/stores';

    let works = $state([]);
    let showUpload = $state(false);

    onMount(async () => {
        // Fetch works
        const { data, error } = await supabase.from('works').select('*').order('date', { ascending: false });
        if (data && data.length > 0) works = data;
        else {
             // Mock data if no DB connection or empty
             works = [
                { id: 1, type: 'ESSAY', date: '2024.01', title: 'The Psychology of Pixel Art', description: 'Analyzing why low-res makes us feel high-emotion.', color: 'text-green-400' },
                { id: 2, type: 'SKETCH', date: '2023.12', title: 'Void Walker Concept', description: 'Character design draft for Project Nebula.', color: 'text-purple-400' }
             ];
        }

    });

    // Upload Form Handlers
    let newTitle = $state('');
    let newDesc = $state('');
    let newType = $state('ESSAY');

    async function handleUpload() {
        const { error } = await supabase.from('works').insert({
            title: newTitle, description: newDesc, type: newType, date: new Date().toISOString().slice(0, 7).replace('-', '.')
        });
        if (!error) {
            alert('Uploaded!');
            // refresh
            const { data } = await supabase.from('works').select('*').order('date', { ascending: false });
            if (data) works = data;
            showUpload = false;
        } else {
            alert('Error: ' + error.message);
        }
    }
</script>

<div class="h-full overflow-y-auto">
    <div class="flex gap-4 mb-4 border-b border-[#333] pb-2 text-sm">
        <span class="text-white border-b border-white cursor-pointer">ALL</span>
        <span class="text-gray-500 hover:text-white cursor-pointer">WRITING</span>
        <span class="text-gray-500 hover:text-white cursor-pointer">IMAGES</span>
        {#if $isAdmin}
             <button class="ml-auto text-red-500 hover:text-red-400" onclick={() => showUpload = !showUpload}>[UPLOAD]</button>
        {/if}
    </div>

    {#if showUpload}
        <div class="p-4 border border-red-900 bg-red-900/10 mb-4">
            <input type="text" bind:value={newTitle} placeholder="Title" class="bg-black border border-gray-700 text-white p-2 w-full mb-2">
            <input type="text" bind:value={newDesc} placeholder="Description" class="bg-black border border-gray-700 text-white p-2 w-full mb-2">
            <select bind:value={newType} class="bg-black border border-gray-700 text-white p-2 w-full mb-2">
                <option value="ESSAY">ESSAY</option>
                <option value="SKETCH">SKETCH</option>
            </select>
            <button onclick={handleUpload} class="bg-red-600 text-white px-4 py-2 hover:bg-red-500">SUBMIT</button>
        </div>
    {/if}

    <div class="grid grid-cols-1 gap-2">
        {#each works as item}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="p-4 border border-[#222] hover:bg-[#111] hover:border-white transition-all cursor-pointer group">
                <div class="flex justify-between items-center mb-2">
                    <span class="{item.color || 'text-green-400'} text-xs font-[VT323]">[{item.type}]</span>
                    <span class="text-gray-600 text-xs">{item.date}</span>
                </div>
                <h3 class="text-white group-hover:text-blue-400">{item.title}</h3>
                <p class="text-xs text-gray-500 mt-1">{item.description}</p>
            </div>
        {/each}
    </div>
</div>
