<script>
    import TooltipNode from './TooltipNode.svelte';
    import SpoilerNode from './SpoilerNode.svelte';
    import ObfuscatedNode from './ObfuscatedNode.svelte';

    let { nodes } = $props();
</script>

{#each nodes as node}
    {#if node.type === 'text'}
        {node.value}
    {:else if node.type === 'bold'}
        <strong class="font-bold text-white"><svelte:self nodes={node.children}/></strong>
    {:else if node.type === 'italic'}
        <em class="italic text-gray-400"><svelte:self nodes={node.children}/></em>
    {:else if node.type === 'strike'}
        <span class="line-through opacity-50 decoration-red-500"><svelte:self nodes={node.children}/></span>
    {:else if node.type === 'code_inline'}
        <code class="bg-[#222] text-red-400 px-1.5 py-0.5 rounded text-xs font-mono border border-[#333]">{node.content}</code>
    {:else if node.type === 'link'}
        <a href={node.href} target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/30 hover:decoration-blue-500 transition-all">{node.text}</a>
    {:else if node.type === 'image'}
        <div class="my-4 relative group">
            <img src={node.src} alt={node.alt} class="max-w-full max-h-[400px] rounded border border-[#333] bg-[#050505]" />
            {#if node.alt}
                <div class="text-[10px] text-gray-600 mt-1 font-mono text-center">{node.alt}</div>
            {/if}
        </div>
    {:else if node.type === 'tooltip'}
        <TooltipNode text={node.text} tip={node.tip} />
    {:else if node.type === 'spoiler'}
        <SpoilerNode content={node.content} />
    {:else if node.type === 'obfuscated'}
        <ObfuscatedNode content={node.content} />
    {:else if node.type === 'footnote'}
        <sup class="text-[10px] text-gray-500 align-super cursor-help hover:text-white transition-colors" title="Footnote">[{node.content}]</sup>
    {/if}
{/each}
