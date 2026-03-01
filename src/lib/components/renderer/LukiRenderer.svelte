<script>
    import InlineRenderer from './nodes/InlineRenderer.svelte';
    import ContainerNode from './nodes/ContainerNode.svelte';
    import CodeBlock from './nodes/CodeBlock.svelte';
    import TableNode from './nodes/TableNode.svelte';
    import SayNode from './nodes/SayNode.svelte';

    let { ast } = $props();
</script>

<div class="luki-content space-y-4 font-mono text-sm">
    {#each ast as node}
        {#if node.type === 'header'}
            {@const H = `h${node.level}`}
            <div class="group relative mt-6 mb-3 first:mt-0">
                {#if node.id}
                    <a id={node.id} class="absolute -top-20 invisible"></a>
                {/if}
                <svelte:element this={H} class="font-bold text-white flex items-center gap-2 w-full border-b border-[#333] pb-2"
                    class:text-2xl={node.level===1}
                    class:text-xl={node.level===2}
                    class:text-lg={node.level===3}
                    class:text-base={node.level>=4}
                >
                    <span class="text-red-500 opacity-50 select-none mr-1">{'#'.repeat(node.level)}</span>
                    <span class="flex-1"><InlineRenderer nodes={node.children} /></span>

                    {#if node.id}
                        <a href="#{node.id}" class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-opacity ml-2 text-xs">#</a>
                    {/if}
                </svelte:element>
            </div>

        {:else if node.type === 'paragraph'}
            <p class="text-gray-400 leading-relaxed">
                <InlineRenderer nodes={node.children} />
            </p>

        {:else if node.type === 'say'}
            <SayNode message={node.message} expression={node.expression} trigger={node.trigger} />

        {:else if node.type === 'list'}
            <svelte:element this={node.ordered ? 'ol' : 'ul'} class="space-y-1 ml-4 pl-4 border-l border-[#222]">
                {#each node.items as item, i}
                    <li class="text-gray-400 relative">
                        <span class="absolute -left-6 text-gray-600 select-none text-xs top-0.5">
                            {node.ordered ? `${i+1}.` : '•'}
                        </span>
                        <InlineRenderer nodes={item} />
                    </li>
                {/each}
            </svelte:element>

        {:else if node.type === 'blockquote'}
             <div class="border-l-2 border-red-500/50 bg-red-900/5 p-4 italic text-gray-400 my-4">
                 <svelte:self ast={node.children} />
             </div>

        {:else if node.type === 'code'}
            <CodeBlock {node} />

        {:else if node.type === 'container'}
            <ContainerNode {node} />

        {:else if node.type === 'table'}
            <TableNode {node} />

        {:else if node.type === 'thematic_break'}
            <hr class="border-[#333] my-8" />

        {/if}
    {/each}
</div>
