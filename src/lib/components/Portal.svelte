<script>
    import Guestbook from './Guestbook.svelte';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { onMount } from 'svelte';

    /** @type {{previewItem?: any}} */
    let { previewItem = null } = $props();

    onMount(() => {
        if (!previewItem) {
            dataStore.fetchPortal();
        }
    });

    let socialItems = $derived(
        previewItem
        ? [previewItem]
        : dataStore.portalItems.filter(i => i.is_visible)
    );
</script>

<div class="h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar">
    {#if !previewItem && dataStore.loading && socialItems.length === 0}
        <div class="p-4 text-center text-gray-500 animate-pulse">ESTABLISHING_UPLINK...</div>
    {:else}
        <div class="grid grid-cols-2 gap-4 mb-8">
            {#each socialItems as item}
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                   style="border-color: {item.color}33; --hover-color: {item.color}"
                   class="p-6 border hover:border-[var(--hover-color)] hover:bg-[var(--hover-color)]/5 transition-all group flex flex-col items-center gap-2">
                    <i class="ph {item.icon} text-3xl transition-colors" style="color: {item.color}"></i>
                    <span class="text-xs uppercase text-white/80 group-hover:text-white transition-colors">{item.label}</span>
                </a>
            {/each}
        </div>
    {/if}

    {#if !previewItem}
        <Guestbook />
    {/if}
</div>
