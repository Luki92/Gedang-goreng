<script>
    import { supabase } from '$lib/supabaseClient';
    import { personaStore } from '$lib/stores/persona.svelte.js';
    import { onMount } from 'svelte';

    /** @type {any[]} */
    let assets = $state([]);
    /** @type {any[]} */
    let triggers = $state([]);
    let activeTab = $state('assets');
    let uploading = $state(false);

    onMount(() => {
        fetchData();
    });

    async function fetchData() {
        const { data: a } = await supabase.from('persona_assets').select('*').order('created_at', { ascending: false });
        const { data: t } = await supabase.from('persona_triggers').select('*').order('created_at', { ascending: false });
        assets = a || [];
        triggers = t || [];
    }

    /** @param {Event & { currentTarget: EventTarget & HTMLInputElement }} e */
    async function uploadAsset(e) {
        const file = e.currentTarget.files?.[0];
        if (!file) return;

        uploading = true;
        const ext = file.name.split('.').pop();
        const path = `${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage.from('persona').upload(path, file);
        if (uploadError) {
            alert(uploadError.message);
            uploading = false;
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('persona').getPublicUrl(path);

        const expressionId = prompt("Enter Expression ID (e.g. idle, blink, angry):") || 'temp';

        const { error: dbError } = await supabase.from('persona_assets').insert([{
            expression_id: expressionId,
            image_url: publicUrl,
            is_default: expressionId === 'idle'
        }]);

        if (dbError) alert(dbError.message);
        uploading = false;
        fetchData();
        personaStore.fetchData();
    }

    /** @param {any} id */
    async function deleteAsset(id) {
        if (!confirm("Delete this expression?")) return;
        await supabase.from('persona_assets').delete().eq('id', id);
        fetchData();
        personaStore.fetchData();
    }

    async function addTrigger() {
        const type = prompt("Trigger Type (OS, BROWSER, RESOLUTION, IDLE, CLICK):") || 'IDLE';
        const val = prompt("Trigger Value (e.g. Windows, 1920x1080, leave blank for any):");
        const msg = prompt("What should I say?");
        const exp = prompt("Expression ID to use:");

        if (msg) {
            await supabase.from('persona_triggers').insert([{
                trigger_type: type,
                trigger_value: val,
                message: msg,
                expression_id: exp
            }]);
            fetchData();
            personaStore.fetchData();
        }
    }

    /** @param {any} id */
    async function deleteTrigger(id) {
        if (!confirm("Delete this trigger?")) return;
        await supabase.from('persona_triggers').delete().eq('id', id);
        fetchData();
        personaStore.fetchData();
    }
</script>

<div class="h-full flex flex-col p-6 font-mono text-xs text-white/80 overflow-hidden">
    <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <h2 class="text-xl font-bold text-white tracking-widest">PERSONA_CORE_CONFIG</h2>
        <div class="flex gap-2">
            <button onclick={() => activeTab = 'assets'} class="px-3 py-1 rounded-sm border {activeTab === 'assets' ? 'border-red-500 bg-red-500/10 text-white' : 'border-white/10 hover:border-white/40'} transition-all">ASSETS</button>
            <button onclick={() => activeTab = 'triggers'} class="px-3 py-1 rounded-sm border {activeTab === 'triggers' ? 'border-red-500 bg-red-500/10 text-white' : 'border-white/10 hover:border-white/40'} transition-all">TRIGGERS</button>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar">
        {#if activeTab === 'assets'}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label class="border-2 border-dashed border-white/10 hover:border-red-500/50 transition-all rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer gap-2 group relative">
                    <input type="file" class="hidden" onchange={uploadAsset} disabled={uploading}/>
                    <i class="ph-fill ph-upload-simple text-2xl group-hover:scale-110 transition-transform"></i>
                    <span>{uploading ? 'UPLOADING...' : 'NEW_EXPRESSION'}</span>
                </label>

                {#each assets as asset}
                    <div class="relative group aspect-square rounded-xl border border-white/10 bg-black/40 overflow-hidden">
                        <img src={asset.image_url} alt={asset.expression_id} class="w-full h-full object-contain" />
                        <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                            <span class="text-white font-bold mb-2">{asset.expression_id.toUpperCase()}</span>
                            <button onclick={() => deleteAsset(asset.id)} class="text-red-500 hover:text-red-400">DELETE</button>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="space-y-4">
                <button onclick={addTrigger} class="w-full border border-dashed border-white/20 p-4 rounded-xl hover:border-red-500 hover:bg-red-500/5 transition-all">
                    + REGISTER_NEW_TRIGGER
                </button>

                <div class="space-y-2">
                    {#each triggers as t}
                        <div class="border border-white/10 p-4 rounded-xl bg-black/40 flex items-start justify-between group">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-sm text-[10px]">{t.trigger_type}</span>
                                    {#if t.trigger_value}
                                        <span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-sm text-[10px]">{t.trigger_value}</span>
                                    {/if}
                                    <span class="text-white/40 italic">[{t.expression_id || 'idle'}]</span>
                                </div>
                                <p class="text-white italic text-[13px]">"{t.message}"</p>
                            </div>
                            <button aria-label="Delete trigger" onclick={() => deleteTrigger(t.id)} class="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                <i class="ph-fill ph-trash"></i>
                            </button>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>
