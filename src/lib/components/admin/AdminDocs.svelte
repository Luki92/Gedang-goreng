<script>
    import { parser } from '$lib/utils/luki-parser.js';
    import LukiRenderer from '$lib/components/renderer/LukiRenderer.svelte';
    import { scriptDocs } from './docs/content.js';

    let activeTab = $state('syntax');

    let content = $derived.by(() => {
        if (activeTab === 'syntax') return scriptDocs;
        if (activeTab === 'reference') return `# API Reference\n\n- **Parser**: \`src/lib/utils/luki-parser.js\`\n- **Renderer**: \`src/lib/components/renderer/LukiRenderer.svelte\`\n\nThis documentation is rendered using the parser itself.`;
        if (activeTab === 'examples') return `# Examples\n\nCheck the **Vault** for implementation details or use the sandbox below (coming soon).`;
        return '';
    });

    let ast = $derived(parser.parse(content));
</script>

<div class="h-full flex flex-col bg-transparent text-xs font-mono overflow-hidden select-text">
    <!-- Header -->
    <div class="border-b border-[#333] p-4 flex justify-between items-center bg-[rgba(20,20,30,0.4)]">
        <h2 class="text-white font-bold flex items-center gap-2 uppercase tracking-wider">
            <i class="ph ph-bookmarks-fill text-red-500 text-lg"></i>
            Luki_Script_Docs
        </h2>
        <div class="flex gap-1 bg-[rgba(0,0,0,0.3)] p-1 rounded border border-[#222]">
            <button
                class="px-3 py-1 text-[10px] rounded transition-all {activeTab === 'syntax' ? 'bg-[rgba(85,85,255,0.1)] text-white shadow-sm' : 'text-white/40 hover:text-gray-300'}"
                onclick={() => activeTab = 'syntax'}
            >
                SYNTAX
            </button>
            <button
                class="px-3 py-1 text-[10px] rounded transition-all {activeTab === 'reference' ? 'bg-[rgba(85,85,255,0.1)] text-white shadow-sm' : 'text-white/40 hover:text-gray-300'}"
                onclick={() => activeTab = 'reference'}
            >
                REFERENCE
            </button>
            <button
                class="px-3 py-1 text-[10px] rounded transition-all {activeTab === 'examples' ? 'bg-[rgba(85,85,255,0.1)] text-white shadow-sm' : 'text-white/40 hover:text-gray-300'}"
                onclick={() => activeTab = 'examples'}
            >
                EXAMPLES
            </button>
        </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-transparent">
        <div class="max-w-3xl mx-auto pb-20">
            <LukiRenderer {ast} />
        </div>
    </div>
</div>
