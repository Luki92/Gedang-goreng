<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { supabase } from '$lib/supabaseClient';
    import { isAdmin } from '$lib/stores';
    import { terminalStore } from '$lib/stores/terminal.svelte.js';
    import LukiEditor from './LukiEditor.svelte';

    let isEditing = $state(false);
    let workForm = $state({
        id: null,
        title: '',
        description: '', // This will hold the LukiScript content
        type: 'ESSAY',
        date: new Date().toISOString().slice(0, 7).replace('-', '.'),
        content_url: '',
        image_url: '',
        status: 'published',
        tags: '',
        featured: false
    });

    /** @param {string[]} tags */
    function formatTags(tags) {
        return Array.isArray(tags) ? tags.join(', ') : '';
    }

    /** @param {string} tagStr */
    function parseTags(tagStr) {
        return tagStr.split(',').map(t => t.trim()).filter(t => t);
    }

    /**
     * @param {string} msg
     * @param {string} type
     */
    function log(msg, type='info') {
        terminalStore.add(msg, type);
    }

    async function saveWork() {
        if (!$isAdmin) {
             log('Unauthorized access attempt detected.', 'error');
             alert('Access Denied');
             return;
        }

        if (!workForm.title) return alert('Title required');

        log(`Initiating deployment for node: ${workForm.title}...`, 'warn');

        const payload = {
            title: workForm.title,
            description: workForm.description,
            type: workForm.type,
            date: workForm.date,
            content_url: workForm.content_url,
            image_url: workForm.image_url,
            status: workForm.status,
            tags: parseTags(workForm.tags),
            featured: workForm.featured
        };

        let error;
        if (isEditing && workForm.id) {
            log(`Updating existing record ${workForm.id}...`);
            const res = await supabase.from('works').update(payload).eq('id', workForm.id);
            error = res.error;
        } else {
            log('Creating new record...');
            const res = await supabase.from('works').insert(payload);
            error = res.error;
        }

        if (error) {
            log(`Deployment Failed: ${error.message}`, 'error');
            alert('Error: ' + error.message);
        }
        else {
            log('Deployment Successful. Syncing database...', 'success');
            resetForm();
            dataStore.fetchWorks();
        }
    }

    /** @param {number} id */
    async function deleteWork(id) {
        if (!$isAdmin) return alert('Access Denied');
        if (!confirm('Delete this work?')) return;

        log(`Deleting record ${id}...`, 'warn');
        const { error } = await supabase.from('works').delete().eq('id', id);
        if (error) log(`Delete failed: ${error.message}`, 'error');
        else {
            log('Record deleted.', 'success');
            dataStore.fetchWorks();
        }
    }

    /** @param {any} w */
    function editWork(w) {
        workForm = {
            ...w,
            tags: formatTags(w.tags)
        };
        isEditing = true;
    }

    function resetForm() {
        workForm = {
            id: null,
            title: '',
            description: '',
            type: 'ESSAY',
            date: new Date().toISOString().slice(0, 7).replace('-', '.'),
            content_url: '',
            image_url: '',
            status: 'published',
            tags: '',
            featured: false
        };
        isEditing = false;
    }
</script>

<div class="h-full flex flex-col bg-[#0a0a0a] text-xs font-mono p-4 overflow-hidden">
    <div class="border-b border-[#333] pb-2 mb-4 flex justify-between items-center shrink-0">
        <h2 class="text-white font-bold flex items-center gap-2">
            <i class="ph ph-safe text-red-500"></i> VAULT_MANAGER
        </h2>
        <button onclick={() => dataStore.fetchWorks()} class="text-gray-500 hover:text-white">[REFRESH]</button>
    </div>

    {#if !$isAdmin}
        <div class="flex-1 flex items-center justify-center text-red-500 font-bold">
            ACCESS DENIED
        </div>
    {:else}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden min-h-0">
            <!-- Form -->
            <div class="flex flex-col bg-[#111] border border-[#333] overflow-hidden">
                <div class="p-3 border-b border-[#333] bg-[#161616] flex justify-between items-center">
                    <span class="text-white font-bold">{isEditing ? 'EDIT_NODE' : 'NEW_NODE'}</span>
                    {#if isEditing}
                        <button onclick={resetForm} class="text-[10px] text-red-400 hover:text-red-300">CANCEL EDIT</button>
                    {/if}
                </div>

                <div class="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                    <!-- Metadata Fields -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="col-span-2">
                            <label for="work-title" class="block text-gray-500 mb-1">TITLE</label>
                            <input id="work-title" type="text" bind:value={workForm.title} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none transition-colors">
                        </div>

                        <div>
                            <label for="work-type" class="block text-gray-500 mb-1">TYPE</label>
                            <select id="work-type" bind:value={workForm.type} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                                <option value="ESSAY">ESSAY</option>
                                <option value="SKETCH">SKETCH</option>
                                <option value="PROJECT">PROJECT</option>
                                <option value="MUSIC">MUSIC</option>
                                <option value="ART">ART</option>
                                <option value="POST">POST</option>
                            </select>
                        </div>

                        <div>
                            <label for="work-status" class="block text-gray-500 mb-1">STATUS</label>
                            <select id="work-status" bind:value={workForm.status} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                                <option value="draft">DRAFT</option>
                                <option value="published">PUBLISHED</option>
                                <option value="archived">ARCHIVED</option>
                            </select>
                        </div>

                        <div>
                            <label for="work-date" class="block text-gray-500 mb-1">DATE</label>
                            <input id="work-date" type="text" bind:value={workForm.date} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                        </div>

                        <div class="flex items-center">
                             <label for="work-featured" class="flex items-center gap-2 text-gray-400 cursor-pointer select-none hover:text-white">
                                <input id="work-featured" type="checkbox" bind:checked={workForm.featured} class="accent-red-500">
                                <span>FEATURED</span>
                            </label>
                        </div>
                    </div>

                    <!-- LukiEditor for Description -->
                    <div class="h-64 border border-[#333] rounded overflow-hidden">
                        <LukiEditor bind:value={workForm.description} />
                    </div>

                    <!-- URLs & Tags -->
                    <div class="space-y-3">
                        <div>
                            <label for="work-content-url" class="block text-gray-500 mb-1">URL (Content)</label>
                            <input id="work-content-url" type="text" bind:value={workForm.content_url} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                        </div>
                        <div>
                            <label for="work-image-url" class="block text-gray-500 mb-1">URL (Image)</label>
                            <input id="work-image-url" type="text" bind:value={workForm.image_url} class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                        </div>
                        <div>
                            <label for="work-tags" class="block text-gray-500 mb-1">TAGS</label>
                            <input id="work-tags" type="text" bind:value={workForm.tags} placeholder="tech, art, svelte" class="w-full bg-black border border-[#333] text-white p-2 focus:border-red-500 outline-none">
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="pt-4 border-t border-[#333] sticky bottom-0 bg-[#111]">
                        <button onclick={saveWork} class="w-full bg-red-900/20 border border-red-500/50 text-red-500 py-3 font-bold hover:bg-red-500 hover:text-white transition-all">
                            {isEditing ? 'UPDATE SYSTEM NODE' : 'DEPLOY NEW NODE'}
                        </button>
                    </div>
                </div>
            </div>

            <!-- List -->
            <div class="bg-[#080808] border border-[#333] flex flex-col overflow-hidden">
                <div class="p-3 border-b border-[#333] bg-[#111] text-gray-400 font-bold">
                    DATABASE_ENTRIES ({dataStore.works.length})
                </div>
                <div class="overflow-y-auto p-2 space-y-2 flex-1 custom-scrollbar">
                    {#each dataStore.works as w}
                        <div class="flex items-start justify-between p-3 border border-[#222] bg-[#0c0c0c] group hover:border-red-500/30 transition-colors">
                            <div class="overflow-hidden flex-1 min-w-0 pr-2">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    <span class="text-[9px] text-red-400 border border-red-900 px-1">{w.type}</span>
                                    <span class="text-[9px] text-gray-500">{w.date}</span>
                                    <span class="text-[9px] px-1 {w.status === 'published' ? 'text-green-500 border border-green-900' : 'text-yellow-500 border border-yellow-900'}">{w.status.toUpperCase()}</span>
                                    {#if w.featured}
                                        <span class="text-[9px] text-yellow-300 border border-yellow-500/50 px-1">★</span>
                                    {/if}
                                </div>
                                <h4 class="text-white truncate font-bold text-sm mb-1">{w.title}</h4>
                                <div class="text-gray-600 text-[10px] truncate">{w.description?.substring(0, 50)}...</div>
                            </div>
                            <div class="flex flex-col gap-2 shrink-0 opacity-20 group-hover:opacity-100 transition-opacity">
                                <button onclick={() => editWork(w)} class="text-blue-400 hover:text-white text-[10px] border border-blue-900 px-1 w-full">EDIT</button>
                                <button onclick={() => deleteWork(w.id)} class="text-red-500 hover:text-white text-[10px] border border-red-900 px-1 w-full">DEL</button>
                            </div>
                        </div>
                    {/each}
                     {#if dataStore.works.length === 0}
                        <div class="text-center py-8 text-gray-600 italic">No works found.</div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>
