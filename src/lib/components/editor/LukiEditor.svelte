<script>
    import { onMount } from 'svelte';
    import { parser } from '$lib/utils/luki-parser.js';
    import LukiRenderer from '$lib/components/renderer/LukiRenderer.svelte';

    /** @type {{content: string}} */
    let { content = $bindable('') } = $props();
    let previewMode = $state(false);

    /** @type {any} */
    let ast = $derived(parser.parse(content));

    /** @param {string} tag */
    function insertTag(tag) {
        const textarea = document.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);

        let newText = '';
        if (tag === 'B') newText = `**${text.substring(start, end) || 'bold'}**`;
        else if (tag === 'I') newText = `*${text.substring(start, end) || 'italic'}*`;
        else if (tag === 'H1') newText = `# ${text.substring(start, end) || 'Heading 1'}`;
        else if (tag === 'H2') newText = `## ${text.substring(start, end) || 'Heading 2'}`;
        else if (tag === 'UL') newText = `\n- ${text.substring(start, end) || 'list item'}`;
        else if (tag === 'CODE') newText = `\`${text.substring(start, end) || 'code'}\``;
        else if (tag === 'LINK') newText = `[${text.substring(start, end) || 'link'}](url)`;
        else if (tag === 'IMG') newText = `![${text.substring(start, end) || 'alt'}](url)`;
        else if (tag === 'DIV') newText = `::: ${text.substring(start, end) || 'content'} :::`;

        content = before + newText + after;

        // Refocus and set cursor
        setTimeout(() => {
            textarea.focus();
            const newPos = start + newText.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    }
</script>

<div class="flex-1 flex flex-col min-h-0 bg-black/20 border border-white/10 rounded overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
        <div class="flex items-center gap-1">
            <button onclick={() => insertTag('B')} class="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70" title="Bold"><i class="ph ph-text-b-fill"></i></button>
            <button onclick={() => insertTag('I')} class="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70" title="Italic"><i class="ph ph-text-italic-fill"></i></button>
            <button onclick={() => insertTag('DIV')} class="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70" title="Strike"><i class="ph ph-text-strikethrough-fill"></i></button>
            <div class="w-px h-4 bg-white/10 mx-1"></div>
            <button onclick={() => insertTag('H1')} class="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70" title="H1"><i class="ph ph-text-h-one-fill"></i></button>
            <button onclick={() => insertTag('H2')} class="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70" title="H2"><i class="ph ph-text-h-two-fill"></i></button>
            <div class="w-px h-4 bg-white/10 mx-1"></div>
            <button onclick={() => insertTag('UL')} class="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70" title="List"><i class="ph ph-list-bullets-fill"></i></button>
            <button onclick={() => insertTag('CODE')} class="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70" title="Code"><i class="ph ph-code-fill"></i></button>
            <button onclick={() => insertTag('DIV')} class="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70" title="Container"><i class="ph ph-bounding-box-fill"></i></button>
            <div class="w-px h-4 bg-white/10 mx-1"></div>
            <button onclick={() => insertTag('LINK')} class="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70" title="Link"><i class="ph ph-link-simple-horizontal-fill"></i></button>
            <button onclick={() => insertTag('IMG')} class="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70" title="Image"><i class="ph ph-image-fill"></i></button>
        </div>

        <div class="flex items-center gap-2">
            <button
                onclick={() => previewMode = !previewMode}
                class="px-3 py-1 text-xs font-medium rounded transition-colors {previewMode ? 'bg-blue-500 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}"
            >
                {previewMode ? 'EDIT' : 'PREVIEW'}
            </button>
        </div>
    </div>

    <!-- Editor Area -->
    <div class="flex-1 relative overflow-hidden flex flex-col">
        {#if previewMode}
            <div class="absolute inset-0 overflow-y-auto p-8 bg-transparent custom-scrollbar">
                <div class="max-w-2xl mx-auto pb-20">
                    <LukiRenderer {ast} />
                </div>
            </div>
        {:else}
            <textarea
                bind:value={content}
                class="w-full h-full p-6 bg-transparent text-white/90 font-mono text-sm resize-none outline-none custom-scrollbar leading-relaxed"
                placeholder="Write your LukiScript here..."
            ></textarea>
        {/if}
    </div>
</div>

<style>
    /* Custom thin scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
</style>
