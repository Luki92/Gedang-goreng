<script>
    let { node } = $props();
    let copied = $state(false);

    function copy() {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(node.value);
            copied = true;
            setTimeout(() => copied = false, 2000);
        }
    }
</script>

<div class="relative group my-4 border border-[#333] bg-[#050505] rounded overflow-hidden">
    <div class="flex justify-between items-center bg-[#111] px-3 py-1 border-b border-[#333] text-[10px] text-gray-500 uppercase font-mono">
        <span>{node.language || 'text'}</span>
        <button onclick={copy} class="hover:text-white transition-colors">
            {copied ? 'COPIED' : 'COPY'}
        </button>
    </div>
    <div class="p-4 overflow-x-auto">
        <pre class="text-xs text-gray-300 font-mono leading-tight whitespace-pre"><code>{node.value}</code></pre>
    </div>
</div>
