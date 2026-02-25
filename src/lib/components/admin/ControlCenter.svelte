<script>
    import { onMount } from 'svelte';
    import { isAdmin } from '$lib/stores';
    import { windowManager } from '$lib/windowManager.svelte.js';

    let { win } = $props(); // receive window props if needed

    onMount(() => {
        if (!$isAdmin) {
            // Auto-close if not authorized
            // setTimeout(() => windowManager.close('control-center'), 100);
            // Actually, let's show an error message instead of closing abruptly
        }
    });

    /** @param {string} id
     * @param {string} title */
    function openApp(id, title) {
        windowManager.toggle(id, { title });
    }
</script>

<div class="h-full bg-transparent flex flex-col p-4 text-xs font-mono select-none">
    {#if !$isAdmin}
        <div class="flex-1 flex items-center justify-center flex-col text-red-500 gap-2">
            <i class="ph ph-lock-key text-4xl animate-pulse"></i>
            <span class="font-bold text-lg">ACCESS DENIED</span>
            <span class="opacity-70">Elevated privileges required.</span>
        </div>
    {:else}
        <div class="mb-4 border-b border-white/10 pb-2 flex justify-between items-center">
            <span class="text-white font-bold">SYSTEM_CONTROL</span>
            <span class="text-green-500 text-[10px] border border-green-900 px-1">ROOT_ACCESS</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar">
            <!-- Vault Manager -->
            <button onclick={() => openApp('admin-vault-list', 'VAULT_MANAGER')} class="group p-4 border border-white/10 rounded-xl bg-[rgba(20,20,30,0.4)] hover:border-red-500 transition-all flex flex-col items-center gap-3 relative overflow-hidden">
                <div class="absolute inset-0 bg-red-900/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <i class="ph ph-safe text-3xl text-white/40 group-hover:text-red-500 z-10 transition-colors"></i>
                <div class="flex flex-col items-center z-10">
                    <span class="text-gray-300 group-hover:text-white font-bold">VAULT</span>
                    <span class="text-[9px] text-white/50">Content Database</span>
                </div>
            </button>

            <!-- Portal Manager -->
            <button onclick={() => openApp('admin-portal-list', 'PORTAL_MANAGER')} class="group p-4 border border-white/10 rounded-xl bg-[rgba(20,20,30,0.4)] hover:border-blue-500 transition-all flex flex-col items-center gap-3 relative overflow-hidden">
                <div class="absolute inset-0 bg-blue-900/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <i class="ph ph-planet text-3xl text-white/40 group-hover:text-blue-500 z-10 transition-colors"></i>
                <div class="flex flex-col items-center z-10">
                    <span class="text-gray-300 group-hover:text-white font-bold">PORTAL</span>
                    <span class="text-[9px] text-white/50">Link Array</span>
                </div>
            </button>

            <!-- Playlist Manager -->
            <button onclick={() => openApp('admin-playlist-list', 'AUDIO_MANAGER')} class="group p-4 border border-white/10 rounded-xl bg-[rgba(20,20,30,0.4)] hover:border-pink-500 transition-all flex flex-col items-center gap-3 relative overflow-hidden">
                <div class="absolute inset-0 bg-pink-900/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <i class="ph ph-vinyl-record text-3xl text-white/40 group-hover:text-pink-500 z-10 transition-colors"></i>
                <div class="flex flex-col items-center z-10">
                    <span class="text-gray-300 group-hover:text-white font-bold">AUDIO</span>
                    <span class="text-[9px] text-white/50">Sonic Emitter</span>
                </div>
            </button>

            <!-- Identity Manager -->
            <button onclick={() => openApp('admin-profile', 'IDENTITY_MATRIX')} class="group p-4 border border-white/10 rounded-xl bg-[rgba(20,20,30,0.4)] hover:border-green-500 transition-all flex flex-col items-center gap-3 relative overflow-hidden">
                <div class="absolute inset-0 bg-green-900/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <i class="ph ph-fingerprint text-3xl text-white/40 group-hover:text-green-500 z-10 transition-colors"></i>
                <div class="flex flex-col items-center z-10">
                    <span class="text-gray-300 group-hover:text-white font-bold">IDENTITY</span>
                    <span class="text-[9px] text-white/50">Profile Data</span>
                </div>
            </button>

            <!-- Guestbook Manager -->
            <button onclick={() => openApp('admin-guestbook', 'MODERATION_QUEUE')} class="group p-4 border border-white/10 rounded-xl bg-[rgba(20,20,30,0.4)] hover:border-yellow-500 transition-all flex flex-col items-center gap-3 relative overflow-hidden">
                <div class="absolute inset-0 bg-yellow-900/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <i class="ph ph-envelope-open text-3xl text-white/40 group-hover:text-yellow-500 z-10 transition-colors"></i>
                <div class="flex flex-col items-center z-10">
                    <span class="text-gray-300 group-hover:text-white font-bold">MODERATION</span>
                    <span class="text-[9px] text-white/50">Guestbook Queue</span>
                </div>
            </button>

             <!-- Docs -->
            <button onclick={() => openApp('admin-docs', 'DOCUMENTATION')} class="group p-4 border border-white/10 rounded-xl bg-[rgba(20,20,30,0.4)] hover:border-purple-500 transition-all flex flex-col items-center gap-3 relative overflow-hidden">
                <div class="absolute inset-0 bg-purple-900/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <i class="ph ph-book-bookmark text-3xl text-white/40 group-hover:text-purple-500 z-10 transition-colors"></i>
                <div class="flex flex-col items-center z-10">
                    <span class="text-gray-300 group-hover:text-white font-bold">DOCS</span>
                    <span class="text-[9px] text-white/50">Manual & Specs</span>
                </div>
            </button>
        </div>
    {/if}
</div>
