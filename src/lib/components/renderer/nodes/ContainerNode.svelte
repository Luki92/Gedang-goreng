<script>
    import LukiRenderer from '../LukiRenderer.svelte';

    let { node } = $props();
    let variant = $derived(node.variant || 'info');
    let title = $derived(node.args ? node.args.trim() : variant.toUpperCase());

    let isOpen = $state(false);
</script>

{#if variant === 'details' || variant === 'spoiler'}
    <div class="border border-[#333] bg-[#080808] my-4 rounded overflow-hidden">
        <button onclick={() => isOpen = !isOpen} class="w-full flex items-center justify-between p-3 bg-[#111] hover:bg-[#1a1a1a] transition-colors text-left text-xs font-bold text-gray-400 group">
            <span class="group-hover:text-white">{title || 'DETAILS'}</span>
            <span class="transform transition-transform {isOpen ? 'rotate-180' : ''} text-gray-600">▼</span>
        </button>
        {#if isOpen}
            <div class="p-4 border-t border-[#333] bg-black/50">
                <LukiRenderer ast={node.children} />
            </div>
        {/if}
    </div>

{:else if variant === 'sidebar'}
    <div class="md:float-right md:w-[40%] md:ml-6 mb-4 border-l-2 border-blue-500/50 bg-blue-900/5 p-4 text-xs shadow-lg shadow-blue-900/10">
        {#if title && title !== 'SIDEBAR'}
            <div class="font-bold text-blue-400 mb-2 uppercase tracking-wider text-[10px] border-b border-blue-500/20 pb-1">{title}</div>
        {/if}
        <LukiRenderer ast={node.children} />
    </div>

{:else if variant === 'warning' || variant === 'alert'}
    <div class="border border-yellow-900/30 bg-yellow-900/5 p-4 my-4 rounded flex gap-4 items-start shadow-[0_0_20px_rgba(255,200,0,0.05)]">
        <div class="text-xl text-yellow-500 opacity-80">⚠</div>
        <div class="flex-1">
            {#if title}
                <div class="font-bold text-yellow-500 mb-2 text-xs tracking-wider">{title}</div>
            {/if}
             <LukiRenderer ast={node.children} />
        </div>
    </div>

{:else if variant === 'file'}
    <div class="border border-[#333] bg-[#0a0a0a] p-3 my-4 flex items-center gap-3 hover:border-gray-500 transition-colors group rounded cursor-pointer">
         <div class="text-2xl text-gray-500 group-hover:text-white transition-colors"><i class="ph ph-file"></i></div>
         <div class="flex-1 overflow-hidden">
             <div class="text-xs font-bold text-gray-300 truncate">{title || 'Attachment'}</div>
             <!-- Try to find filename or description from first child paragraph -->
             {#if node.children.length > 0 && node.children[0].type === 'paragraph'}
                 <div class="text-[10px] text-gray-600 truncate">
                    <LukiRenderer ast={[node.children[0]]} />
                 </div>
             {/if}
         </div>
         <div class="text-[10px] border border-[#333] px-2 py-1 text-gray-500 group-hover:text-white group-hover:border-white transition-all rounded">DOWNLOAD</div>
    </div>

{:else}
    <!-- Default Container -->
    <div class="border border-[#333] bg-[#0a0a0a] p-4 my-4 rounded relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-gray-700 group-hover:bg-white transition-colors"></div>
        <div class="pl-4">
            {#if title}
                <div class="text-[10px] text-gray-600 uppercase mb-2 font-bold tracking-widest group-hover:text-gray-400 transition-colors">{title}</div>
            {/if}
            <LukiRenderer ast={node.children} />
        </div>
    </div>
{/if}
