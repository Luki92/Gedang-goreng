<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { supabase } from '$lib/supabaseClient';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';

    /** @type {{isVisible: boolean, isSuccess: boolean, message: string, sqlCommands: string[]}} */
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

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

    async function approve(id) {
        const sqlCommands = [`UPDATE guestbook SET is_approved = true WHERE id = ${id};`];
        const { error } = await supabase.from('guestbook').update({ is_approved: true }).eq('id', id);
        if (error) {
            showSaveAnimation(false, `Error: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Message approved', sqlCommands);
            dataStore.fetchGuestbook();
        }
    }

    async function remove(id) {
        if (!confirm('Delete this message?')) return;
        const sqlCommands = [`DELETE FROM guestbook WHERE id = ${id};`];
        const { error } = await supabase.from('guestbook').delete().eq('id', id);
        if (error) {
            showSaveAnimation(false, `Delete failed: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Message deleted', sqlCommands);
            dataStore.fetchGuestbook();
        }
    }

    function getPendingCount() {
        return dataStore.guestbook.filter(e => !e.is_approved).length;
    }
</script>

<div class="h-full flex flex-col bg-transparent">
    <!-- Header -->
    <div class="shrink-0 border-b border-white/10 bg-transparent px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <h1 class="text-lg font-semibold text-white">Moderation Queue</h1>
            <span class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                {getPendingCount()} pending
            </span>
        </div>
        <button
            onclick={() => dataStore.fetchGuestbook()}
            class="px-4 py-2 rounded text-sm font-medium text-white/70 hover:bg-white/5 transition-colors"
        >
            <i class="ph ph-arrows-clockwise"></i> Refresh
        </button>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto divide-y divide-white/10">
        {#if dataStore.guestbook.length === 0}
            <div class="flex items-center justify-center h-full text-white/40">
                <div class="text-center">
                    <i class="ph ph-envelope text-4xl mb-2 opacity-50"></i>
                    <p>No messages</p>
                </div>
            </div>
        {:else}
            {#each dataStore.guestbook as entry}
                <div class="p-6 hover:bg-transparent transition-colors group {!entry.is_approved ? 'bg-yellow-500/10' : ''}">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 class="font-semibold text-white">{entry.name}</h3>
                                <span class="text-xs text-white/40">{new Date(entry.created_at).toLocaleString()}</span>
                                {#if entry.is_approved}
                                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                        <i class="ph ph-check-circle"></i> Approved
                                    </span>
                                {:else}
                                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 animate-pulse">
                                        <i class="ph ph-clock"></i> Pending
                                    </span>
                                {/if}
                            </div>
                            <p class="text-white/70 leading-relaxed mb-2">{entry.message}</p>
                            <p class="text-xs text-white/40">ID: {entry.visitor_id.slice(0, 12)}...</p>
                        </div>
                        <div class="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {#if !entry.is_approved}
                                <button
                                    onclick={() => approve(entry.id)}
                                    class="px-4 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                    <i class="ph ph-check"></i> Approve
                                </button>
                            {/if}
                            <button
                                onclick={() => remove(entry.id)}
                                class="px-4 py-2 rounded border border-white/10 text-red-600 text-sm font-medium hover:bg-red-500/10 transition-colors"
                            >
                                <i class="ph ph-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<SaveAnimation {...saveState} />
