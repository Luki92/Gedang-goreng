<script>
    import { supabase } from '$lib/supabaseClient';
    import { personaStore } from '$lib/stores/persona.svelte.js';
    import { onMount } from 'svelte';

    let assets = $state([]);
    let triggers = $state([]);
    let activeTab = $state('assets');
    let uploading = $state(false);

    onMount(() => fetchData());

    async function fetchData() {
        const { data: a } = await supabase.from('persona_assets').select('*').order('created_at', { ascending: false });
        const { data: t } = await supabase.from('persona_triggers').select('*').order('created_at', { ascending: false });
        assets = a || [];
        triggers = t || [];
    }

    async function uploadAsset(e) {
        const file = e.currentTarget.files?.[0];
        if (!file) return;
        uploading = true;
        const path = `${Date.now()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('persona').upload(path, file);
        if (uploadError) { alert(uploadError.message); uploading = false; return; }
        const { data: { publicUrl } } = supabase.storage.from('persona').getPublicUrl(path);
        const expressionId = prompt("Expression ID (idle, blink, speak, happy, angry, etc):") || 'idle';
        await supabase.from('persona_assets').insert([{ expression_id: expressionId, image_url: publicUrl }]);
        uploading = false;
        fetchData();
        personaStore.fetchData();
    }

    async function deleteAsset(id) {
        if (!confirm("Delete?")) return;
        await supabase.from('persona_assets').delete().eq('id', id);
        fetchData();
        personaStore.fetchData();
    }

    async function addTrigger() {
        const type = prompt("Type (WINDOW_OPEN, CLICK, COLLISION, IDLE, BROWSER, OS, RESOLUTION):");
        if (!type) return;
        const val = prompt("Value (e.g. terminal, Chrome, Windows, 1920x1080):");
        const msg = prompt("Message:");
        const exp = prompt("Expression ID:");
        await supabase.from('persona_triggers').insert([{ trigger_type: type, trigger_value: val, message: msg, expression_id: exp }]);
        fetchData();
        personaStore.fetchData();
    }

    async function deleteTrigger(id) {
        if (!confirm("Delete?")) return;
        await supabase.from('persona_triggers').delete().eq('id', id);
        fetchData();
        personaStore.fetchData();
    }
</script>

<div class="h-full flex flex-col p-6 font-mono text-xs text-white/80 overflow-hidden bg-black/40 backdrop-blur-md">
    <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <h2 class="text-xl font-bold text-white tracking-widest uppercase">Persona_Core_Matrix</h2>
        <div class="flex gap-2">
            <button onclick={() => activeTab = 'assets'} class="px-4 py-2 border {activeTab === 'assets' ? 'border-red-500 bg-red-500/10' : 'border-white/10'} transition-all">ASSETS</button>
            <button onclick={() => activeTab = 'triggers'} class="px-4 py-2 border {activeTab === 'triggers' ? 'border-red-500 bg-red-500/10' : 'border-white/10'} transition-all">TRIGGERS</button>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {#if activeTab === 'assets'}
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <label class="border-2 border-dashed border-white/10 hover:border-red-500/40 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer group transition-all">
                    <input type="file" class="hidden" onchange={uploadAsset} disabled={uploading}/>
                    <i class="ph-fill ph-plus-circle text-2xl group-hover:scale-110 transition-transform"></i>
                    <span class="mt-2 text-[10px]">{uploading ? 'UPLOADING...' : 'NEW_FRAME'}</span>
                </label>
                {#each assets as asset}
                    <div class="relative group aspect-square rounded-xl border border-white/10 bg-black/20 overflow-hidden">
                        <img src={asset.image_url} alt={asset.expression_id} class="w-full h-full object-contain p-2" />
                        <div class="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                            <span class="text-white font-bold mb-1">{asset.expression_id.toUpperCase()}</span>
                            <button onclick={() => deleteAsset(asset.id)} class="text-red-500 text-[10px] hover:underline">TERMINATE</button>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="space-y-4">
                <button onclick={addTrigger} class="w-full border border-dashed border-white/10 p-4 rounded-xl hover:bg-red-500/5 hover:border-red-500/50 transition-all text-left">
                    <span class="opacity-50">+ REGISTER_BEHAVIORAL_RESPONSE</span>
                </button>
                <div class="grid gap-2">
                    {#each triggers as t}
                        <div class="p-4 rounded-xl border border-white/10 bg-black/20 group hover:border-white/30 transition-all">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex gap-2">
                                    <span class="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[9px] font-bold tracking-widest">{t.trigger_type}</span>
                                    {#if t.trigger_value}
                                        <span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] tracking-wider">{t.trigger_value}</span>
                                    {/if}
                                </div>
                                <button onclick={() => deleteTrigger(t.id)} class="opacity-0 group-hover:opacity-100 text-red-500 transition-opacity">
                                    <i class="ph-fill ph-trash"></i>
                                </button>
                            </div>
                            <p class="text-white italic text-[13px] leading-relaxed mb-1">"{t.message}"</p>
                            <span class="text-[9px] opacity-40 uppercase">Mood: {t.expression_id || 'idle'}</span>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>
