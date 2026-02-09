<script>
    import Guestbook from './Guestbook.svelte';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { onMount } from 'svelte';

    onMount(() => {
        dataStore.fetchPortal();
    });

    let socialItems = $derived(dataStore.portalItems.filter(i => i.is_visible));
</script>

<div class="h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar">
    {#if dataStore.loading && socialItems.length === 0}
        <div class="p-4 text-center text-gray-500 animate-pulse">ESTABLISHING_UPLINK...</div>
    {:else}
        <div class="grid grid-cols-2 gap-4 mb-8">
            {#each socialItems as item}
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                   class="p-6 border border-[#333] hover:border-blue-500 hover:bg-[#0a0a0a] transition-all group flex flex-col items-center gap-2">
                    <i class="ph {item.icon} text-3xl group-hover:text-blue-500 transition-colors"></i>
                    <span class="text-xs uppercase">{item.label}</span>
                </a>
            {/each}
        </div>
    {/if}

    <Guestbook />
</div>
