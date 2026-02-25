<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';

    let messages = $state([]);
    let loading = $state(true);
    let sending = $state(false);

    // Form State
    let name = $state('');
    let message = $state('');
    let visitorId = $state(null);
    let hasSigned = $state(false); // Track if user has signed before (optional, maybe allow multiple messages)

    onMount(async () => {
        // 1. Identity Check
        const storedId = localStorage.getItem('luki_visitor_id');
        const storedName = localStorage.getItem('luki_visitor_name');

        if (storedId) {
            visitorId = storedId;
            if (storedName) {
                name = storedName;
                hasSigned = true; // They have an ID, so likely signed before
            }
        } else {
            visitorId = crypto.randomUUID();
            localStorage.setItem('luki_visitor_id', visitorId);
        }

        // 2. Fetch Messages
        const { data, error } = await supabase
            .from('guestbook')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) messages = data;
        loading = false;
    });

    async function signGuestbook() {
        if (!name.trim() || !message.trim()) return;
        sending = true;

        // Save name for future
        localStorage.setItem('luki_visitor_name', name);

        const { error } = await supabase.from('guestbook').insert({
            name: name,
            message: message,
            visitor_id: visitorId
        });

        if (error) {
            alert('Transmission Failed: ' + error.message);
        } else {
            message = '';
            alert('Signal Sent. Awaiting Uplink Approval.');
        }
        sending = false;
    }
</script>

<div class="mt-8 border-t border-[#333] pt-4">
    <h3 class="text-white font-bold mb-4 flex items-center gap-2">
        <i class="ph ph-broadcast text-green-500 animate-pulse"></i>
        SIGNAL_LOG
    </h3>

    <!-- Form -->
    <div class="bg-transparent p-4 border border-white/10 rounded-xl mb-6 relative overflow-hidden group">
        {#if sending}
            <div class="absolute inset-0 bg-transparent/80 flex items-center justify-center z-10">
                <span class="text-green-500 font-mono animate-pulse">UPLOADING...</span>
            </div>
        {/if}

        <div class="mb-2">
            <label class="block text-[10px] text-gray-500 mb-1">IDENTITY_SIGNATURE</label>
            <input
                type="text"
                bind:value={name}
                disabled={hasSigned}
                placeholder="CALLSIGN"
                maxlength="20"
                class="w-full bg-transparent border border-white/10 rounded-lg text-green-400 p-2 font-mono focus:border-green-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
        </div>
        <div class="mb-2">
            <textarea
                bind:value={message}
                placeholder="TRANSMIT MESSAGE..."
                rows="2"
                maxlength="140"
                class="w-full bg-transparent border border-white/10 rounded-lg text-gray-300 p-2 font-mono focus:border-green-500 outline-none resize-none"
            ></textarea>
        </div>
        <button onclick={signGuestbook} disabled={!name || !message} class="w-full bg-white/5 text-gray-400 py-2 text-xs hover:bg-green-900/20 hover:text-green-400 border border-white/10 rounded-lg transition-colors disabled:opacity-30">
            SEND_TRANSMISSION
        </button>
    </div>

    <!-- Feed -->
    <div class="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {#if loading}
            <div class="text-center text-xs text-gray-600 animate-pulse">Scanning frequencies...</div>
        {:else if messages.length === 0}
            <div class="text-center text-xs text-gray-600 border border-dashed border-[#333] py-4">NO_SIGNALS_DETECTED</div>
        {:else}
            {#each messages as msg}
                <div class="p-3 bg-transparent border-l-2 border-green-900 hover:border-green-500 transition-colors">
                    <div class="flex justify-between items-baseline mb-1">
                        <span class="text-green-500 font-bold text-sm">{msg.name}</span>
                        <span class="text-[10px] text-gray-700">{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-gray-400 text-xs font-mono leading-relaxed">"{msg.message}"</p>
                </div>
            {/each}
        {/if}
    </div>
</div>
