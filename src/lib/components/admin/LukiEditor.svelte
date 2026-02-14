<script>
    import { parser } from '$lib/utils/luki-parser.js';
    import LukiRenderer from '$lib/components/renderer/LukiRenderer.svelte';

    let { value = $bindable('') } = $props();

    /** @type {HTMLTextAreaElement | null} */
    let textareaRef = $state(null);
    let activeTab = $state('edit'); // 'edit', 'preview', 'split'

    // Derived AST for preview
    let ast = $derived(parser.parse(value));

    /**
     * @param {string} startTag
     * @param {string} endTag
     * @param {string} defaultText
     */
    function insertTag(startTag, endTag, defaultText) {
        if (!textareaRef) return;

        const start = textareaRef.selectionStart;
        const end = textareaRef.selectionEnd;
        const text = value; // Use bound value
        const selectedText = text.substring(start, end) || defaultText;

        const before = text.substring(0, start);
        const after = text.substring(end);

        value = before + startTag + selectedText + endTag + after;

        // Restore focus and selection
        setTimeout(() => {
            if (textareaRef) {
                textareaRef.focus();
                const newCursorPos = start + startTag.length + selectedText.length;
                textareaRef.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 10);
    }

    const tools = [
        { icon: 'ph-text-b', label: 'Bold', start: '**', end: '**', def: 'bold' },
        { icon: 'ph-text-italic', label: 'Italic', start: '*', end: '*', def: 'italic' },
        { icon: 'ph-text-strikethrough', label: 'Strike', start: '~~', end: '~~', def: 'strike' },
        { icon: 'ph-text-h-one', label: 'H1', start: '# ', end: '', def: 'Header' },
        { icon: 'ph-text-h-two', label: 'H2', start: '## ', end: '', def: 'Header' },
        { icon: 'ph-list-bullets', label: 'List', start: '- ', end: '', def: 'Item' },
        { icon: 'ph-code', label: 'Code', start: '`', end: '`', def: 'code' },
        { icon: 'ph-code-block', label: 'Block', start: '```js\n', end: '\n```', def: '// code' },
        { icon: 'ph-link', label: 'Link', start: '[', end: '](url)', def: 'text' },
        { icon: 'ph-image', label: 'Image', start: '![', end: '](url)', def: 'alt' },
        { icon: 'ph-warning', label: 'Spoiler', start: '||', end: '||', def: 'spoiler' },
        { icon: 'ph-info', label: 'Tooltip', start: '^^', end: '^^(tip)', def: 'text' },
        { icon: 'ph-eye-slash', label: 'Obfuscate', start: '%%', end: '%%', def: 'secret' },
    ];
</script>

<div class="flex flex-col h-full bg-white overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 overflow-x-auto custom-scrollbar shrink-0">
        {#each tools as tool}
            <button
                onclick={() => insertTag(tool.start, tool.end, tool.def)}
                class="p-2 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                title={tool.label}
            >
                <i class={`ph ${tool.icon} text-base`}></i>
            </button>
        {/each}

        <div class="h-5 w-px bg-gray-300 mx-2"></div>

        <div class="flex bg-gray-200 rounded p-0.5 ml-auto gap-1">
            <button
                onclick={() => activeTab = 'edit'}
                class:bg-white={activeTab === 'edit'}
                class:text-gray-900={activeTab === 'edit'}
                class="px-2 py-1 text-xs rounded transition-colors text-gray-600 hover:text-gray-900"
            >
                Edit
            </button>
            <button
                onclick={() => activeTab = 'split'}
                class:bg-white={activeTab === 'split'}
                class:text-gray-900={activeTab === 'split'}
                class="px-2 py-1 text-xs rounded transition-colors text-gray-600 hover:text-gray-900 hidden md:block"
            >
                Split
            </button>
            <button
                onclick={() => activeTab = 'preview'}
                class:bg-white={activeTab === 'preview'}
                class:text-gray-900={activeTab === 'preview'}
                class="px-2 py-1 text-xs rounded transition-colors text-gray-600 hover:text-gray-900"
            >
                Preview
            </button>
        </div>
    </div>

    <!-- Editor Area -->
    <div class="flex-1 flex overflow-hidden relative">
        <!-- Textarea -->
        <div class="flex-1 h-full bg-white relative flex flex-col" class:hidden={activeTab === 'preview'}>
            <textarea
                bind:this={textareaRef}
                bind:value={value}
                class="w-full h-full bg-white text-gray-900 font-mono text-sm p-4 resize-none outline-none leading-relaxed custom-scrollbar"
                placeholder="Write your LukiScript here..."
            ></textarea>
        </div>

        <!-- Preview Pane -->
        <div
            class="flex-1 h-full bg-gray-50 border-l border-gray-200 overflow-y-auto custom-scrollbar p-6 selectable"
            class:hidden={activeTab === 'edit'}
            class:md:block={activeTab === 'split'}
        >
            {#key value}
                <LukiRenderer {ast} />
            {/key}
        </div>
    </div>
</div>
