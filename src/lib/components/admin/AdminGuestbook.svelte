<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { supabase } from '$lib/supabaseClient';
    import { isAdmin } from '$lib/stores';
    import SaveAnimation from '$lib/components/editor/SaveAnimation.svelte';

    /** @type {{isVisible: boolean, isSuccess: boolean, message: string, sqlCommands: string[]}} */
    let saveState = $state({ isVisible: false, isSuccess: false, message: '', sqlCommands: [] });

    /**
     * @param {boolean} isSuccess
     * @param {string} message
     * @param {string[]} commands
     */
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

    /** @param {any} id */
    async function approve(id) {
        const sqlCommands = [`UPDATE guestbook SET is_approved = true WHERE id = ${id};`];
        const { error } = await supabase.from('guestbook').update({ is_approved: true }).eq('id', id);
        if (error) {
            showSaveAnimation(false, `Approval failed: ${error.message}`, sqlCommands);
        } else {
            showSaveAnimation(true, 'Message approved', sqlCommands);
            dataStore.fetchGuestbook();
        }
    }

    /** @param {any} id */
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
</script>

<div class="h-full flex flex-col bg-transparent text-white">
    <div class="shrink-0 border-b border-white/10 bg-black/40 px-6 py-3">
        <h1 class="text-lg font-semibold">GUESTBOOK_MODERATION</h1>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-4">
            {#each dataStore.guestbook as msg}
                <div class="p-4 bg-black/40 border border-white/10 rounded-lg {msg.is_approved ? 'opacity-60' : 'border-blue-500/50 bg-blue-500/5'}">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="font-bold text-white">{msg.author || 'Anonymous'}</span>
                            <span class="text-[10px] text-white/40 ml-2 font-mono">{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                        <div class="flex gap-2">
                            {#if !msg.is_approved}
                                <button onclick={() => approve(msg.id)} class="p-1.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded hover:bg-green-600/40 transition-colors" title="Approve">
                                    <i class="ph ph-check-circle"></i>
                                </button>
                            {/if}
                            <button onclick={() => remove(msg.id)} class="p-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded hover:bg-red-600/40 transition-colors" title="Delete">
                                <i class="ph ph-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="text-sm text-white/80 whitespace-pre-wrap">{msg.content}</p>
                </div>
            {/each}
        </div>
    </div>
</div>

<SaveAnimation {...saveState} />
