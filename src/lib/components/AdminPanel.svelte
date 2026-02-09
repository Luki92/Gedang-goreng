<script>
    import { onMount } from 'svelte';
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { dataStore } from '$lib/stores/data.svelte.js';

    $effect(() => {
        if ($isAdmin) {
            dataStore.refreshAll();
        }
    });

    function open(id) {
        windowManager.toggle(id, {
            width: 800,
            height: 600
        });
    }

    async function logout() {
        await supabase.auth.signOut();
        $isAdmin = false;
    }
</script>

{#if $isAdmin}
    <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-[#0a0a0a] border border-red-500/50 shadow-[0_0_50px_rgba(255,0,0,0.1)] z-50 flex flex-col font-mono text-sm overflow-hidden rounded-lg">
        <!-- Header -->
        <div class="bg-red-900/20 border-b border-red-900/50 p-2 flex justify-between items-center text-red-500 font-bold">
            <span>[ADMIN_CONTROL_CENTER]</span>
            <button onclick={logout} class="hover:text-white">[LOGOUT]</button>
        </div>

        <!-- Content -->
        <div class="p-6 grid grid-cols-2 gap-4">
            <button onclick={() => open('admin-vault')} class="group relative p-6 border border-[#333] hover:border-red-500 bg-[#111] transition-all flex flex-col items-center gap-2">
                <i class="ph ph-safe text-3xl text-gray-500 group-hover:text-red-500 transition-colors"></i>
                <span class="text-xs text-gray-400 group-hover:text-white">VAULT_MANAGER</span>
            </button>

            <button onclick={() => open('admin-portal')} class="group relative p-6 border border-[#333] hover:border-blue-500 bg-[#111] transition-all flex flex-col items-center gap-2">
                <i class="ph ph-planet text-3xl text-gray-500 group-hover:text-blue-500 transition-colors"></i>
                <span class="text-xs text-gray-400 group-hover:text-white">PORTAL_MANAGER</span>
            </button>

            <button onclick={() => open('admin-profile')} class="group relative p-6 border border-[#333] hover:border-green-500 bg-[#111] transition-all flex flex-col items-center gap-2">
                <i class="ph ph-fingerprint text-3xl text-gray-500 group-hover:text-green-500 transition-colors"></i>
                <span class="text-xs text-gray-400 group-hover:text-white">IDENTITY_MATRIX</span>
            </button>

            <button onclick={() => open('admin-playlist')} class="group relative p-6 border border-[#333] hover:border-pink-500 bg-[#111] transition-all flex flex-col items-center gap-2">
                <i class="ph ph-vinyl-record text-3xl text-gray-500 group-hover:text-pink-500 transition-colors"></i>
                <span class="text-xs text-gray-400 group-hover:text-white">AUDIO_DB</span>
            </button>

            <button onclick={() => open('admin-guestbook')} class="group relative p-6 border border-[#333] hover:border-yellow-500 bg-[#111] transition-all flex flex-col items-center gap-2">
                <i class="ph ph-envelope-open text-3xl text-gray-500 group-hover:text-yellow-500 transition-colors"></i>
                <span class="text-xs text-gray-400 group-hover:text-white">MODERATION_QUEUE</span>
            </button>

            <button onclick={() => open('admin-docs')} class="group relative p-6 border border-[#333] hover:border-purple-500 bg-[#111] transition-all flex flex-col items-center gap-2">
                <i class="ph ph-book-bookmark text-3xl text-gray-500 group-hover:text-purple-500 transition-colors"></i>
                <span class="text-xs text-gray-400 group-hover:text-white">DOCS_&_MANUAL</span>
            </button>
        </div>
    </div>
{/if}
