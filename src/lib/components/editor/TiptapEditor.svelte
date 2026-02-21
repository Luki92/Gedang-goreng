<script>
    import { onMount, onDestroy } from 'svelte';
    import { Editor } from '@tiptap/core';
    import StarterKit from '@tiptap/starter-kit';
    import Placeholder from '@tiptap/extension-placeholder';
    import Link from '@tiptap/extension-link';
    import Image from '@tiptap/extension-image';
    import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
    import { common, createLowlight } from 'lowlight';

    /** @type {{ content: string }} */
    let { content = $bindable('') } = $props();

    /** @type {HTMLElement | undefined} */
    let editorElement = $state();
    /** @type {Editor | null} */
    let editor = $state(null);
    let mode = $state('NOTION'); // NOTION, SOURCE
    let showSlashMenu = $state(false);

    const lowlight = createLowlight(common);

    onMount(() => {
        if (!editorElement) return;
        editor = new Editor({
            element: editorElement,
            extensions: [
                StarterKit.configure({
                    codeBlock: false,
                }),
                Placeholder.configure({
                    placeholder: 'Type "/" for commands...',
                }),
                Link,
                Image,
                CodeBlockLowlight.configure({
                    lowlight,
                }),
            ],
            content: extractWithin(content),
            onUpdate: ({ editor }) => {
                if (mode === 'NOTION') {
                    updateSourceFromEditor(editor.getHTML());
                }
            },
        });
    });

    onDestroy(() => {
        if (editor) editor.destroy();
    });

    /** @param {string} fullHtml */
    function extractWithin(fullHtml) {
        if (!fullHtml) return '';
        const match = fullHtml.match(/<within>([\s\S]*?)<\/within>/);
        if (match) {
            return match[1].replace(/<(script|style)[\s\S]*?<\/\1>/gi, '').trim();
        }
        return fullHtml;
    }

    /** @param {string} html */
    function updateSourceFromEditor(html) {
        const withinMatch = content.match(/<within>([\s\S]*?)<\/within>/);
        if (withinMatch) {
            const scriptsStyles = withinMatch[1].match(/<(script|style)[\s\S]*?<\/\1>/gi) || [];
            const newWithin = `\n  ${html}\n  ${scriptsStyles.join('\n  ')}\n`;
            content = content.replace(/<within>[\s\S]*?<\/within>/, `<within>${newWithin}</within>`);
        } else {
            content = `<within>\n  ${html}\n</within>\n<outside>\n</outside>`;
        }
    }

    function toggleMode() {
        if (mode === 'NOTION') {
            mode = 'SOURCE';
        } else {
            if (editor) {
                editor.commands.setContent(extractWithin(content));
            }
            mode = 'NOTION';
        }
    }

    /** @param {KeyboardEvent} e */
    function handleKeyDown(e) {
        if (e.key === '/') {
            showSlashMenu = true;
        } else if (e.key === 'Escape') {
            showSlashMenu = false;
        }
    }

    /** @param {string} type */
    function insertCommand(type) {
        if (!editor) return;

        const { from, to } = editor.state.selection;
        editor.commands.deleteRange({ from: from - 1, to });

        if (type === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
        if (type === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
        if (type === 'bullet') editor.chain().focus().toggleBulletList().run();
        if (type === 'code') editor.chain().focus().toggleCodeBlock().run();
        if (type === 'image') {
            const url = window.prompt('Enter Image URL:');
            if (url) editor.chain().focus().setImage({ src: url }).run();
        }

        showSlashMenu = false;
    }
</script>

<div class="flex-1 flex flex-col min-h-0 bg-black/20 border border-white/10 rounded overflow-hidden relative">
    <div class="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 shrink-0">
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-1 text-xs font-mono text-gray-500">
                <span class="text-blue-500">MODE:</span>
                <span class="text-white">{mode}</span>
            </div>

            <div class="flex items-center gap-1">
                <button type="button" onclick={() => editor?.chain().focus().undo().run()} class="p-1 hover:bg-white/10 rounded transition-colors" title="Undo"><i class="ph ph-arrow-u-up-left"></i></button>
                <button type="button" onclick={() => editor?.chain().focus().redo().run()} class="p-1 hover:bg-white/10 rounded transition-colors" title="Redo"><i class="ph ph-arrow-u-up-right"></i></button>
            </div>
        </div>

        <button
            type="button"
            onclick={toggleMode}
            class="px-4 py-1 text-[10px] font-bold tracking-widest rounded transition-all duration-300 {mode === 'SOURCE' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'}"
        >
            {mode === 'SOURCE' ? 'VIEW_NOTION' : 'VIEW_SOURCE'}
        </button>
    </div>

    <div class="flex-1 relative overflow-hidden flex flex-col">
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6" class:hidden={mode === 'SOURCE'} role="textbox" aria-label="Rich text editor">
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div bind:this={editorElement} onkeydown={handleKeyDown} class="tiptap-wrapper max-w-2xl mx-auto min-h-full"></div>
        </div>

        <textarea
            bind:value={content}
            class:hidden={mode === 'NOTION'}
            class="w-full h-full p-8 bg-transparent text-white/90 font-mono text-sm resize-none outline-none custom-scrollbar leading-relaxed"
            placeholder="<html>\n  <within>...</within>\n  <outside>...</outside>\n</html>"
        ></textarea>
    </div>

    {#if showSlashMenu}
        <div class="absolute left-10 top-20 bg-[#111] border border-white/20 rounded-lg shadow-2xl p-2 z-50 w-48 font-mono">
            <div class="text-[9px] text-gray-500 mb-2 px-2 uppercase tracking-widest">Commands</div>
            <button type="button" onclick={() => insertCommand('h1')} class="w-full text-left px-2 py-1.5 hover:bg-blue-500 rounded flex items-center gap-3 transition-colors">
                <i class="ph ph-text-h-one"></i> <span class="text-xs">Heading 1</span>
            </button>
            <button type="button" onclick={() => insertCommand('h2')} class="w-full text-left px-2 py-1.5 hover:bg-blue-500 rounded flex items-center gap-3 transition-colors">
                <i class="ph ph-text-h-two"></i> <span class="text-xs">Heading 2</span>
            </button>
            <button type="button" onclick={() => insertCommand('bullet')} class="w-full text-left px-2 py-1.5 hover:bg-blue-500 rounded flex items-center gap-3 transition-colors">
                <i class="ph ph-list-bullets"></i> <span class="text-xs">Bullet List</span>
            </button>
            <button type="button" onclick={() => insertCommand('code')} class="w-full text-left px-2 py-1.5 hover:bg-blue-500 rounded flex items-center gap-3 transition-colors">
                <i class="ph ph-code"></i> <span class="text-xs">Code Block</span>
            </button>
            <button type="button" onclick={() => insertCommand('image')} class="w-full text-left px-2 py-1.5 hover:bg-blue-500 rounded flex items-center gap-3 transition-colors">
                <i class="ph ph-image"></i> <span class="text-xs">Image</span>
            </button>
        </div>
    {/if}
</div>

<style>
    :global(.tiptap) { outline: none; }
    :global(.tiptap p.is-editor-empty:first-child::before) { content: attr(data-placeholder); float: left; color: #4b5563; pointer-events: none; height: 0; }
    :global(.tiptap h1) { font-size: 2.5rem; font-weight: 800; margin-bottom: 1.5rem; color: white; }
    :global(.tiptap h2) { font-size: 1.8rem; font-weight: 700; margin-bottom: 1rem; color: #e5e7eb; }
    :global(.tiptap p) { margin-bottom: 1rem; color: #d1d5db; line-height: 1.7; }
    :global(.tiptap ul) { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; color: #d1d5db; }
    :global(.tiptap pre) { background: #000; padding: 1rem; border-radius: 0.5rem; border: 1px solid #333; margin: 1rem 0; font-family: 'Space Mono', monospace; }
    :global(.tiptap img) { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
</style>
