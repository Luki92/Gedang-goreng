<script>
    import InlineRenderer from './InlineRenderer.svelte';
    let { node } = $props();
</script>

<div class="overflow-x-auto my-6 border border-[#333] rounded bg-[#0a0a0a]">
    <table class="w-full text-left text-xs font-mono border-collapse">
        {#if node.head && node.head.length}
            <thead class="bg-[#111] text-gray-500">
                <tr>
                    {#each node.head as cell}
                        <th class="p-3 font-normal uppercase tracking-wider border-b border-[#333]">
                            <InlineRenderer nodes={cell} />
                        </th>
                    {/each}
                </tr>
            </thead>
        {/if}
        <tbody class="divide-y divide-[#222]">
            {#each node.body as row}
                <tr class="hover:bg-[#111] transition-colors">
                    {#each row as cell}
                        <td class="p-3 text-gray-400 border-r border-[#222] last:border-r-0">
                            <InlineRenderer nodes={cell} />
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>
