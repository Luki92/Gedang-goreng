<script>
    import { onMount, onDestroy } from 'svelte';
    import { Editor } from '@tiptap/core';
    import StarterKit from '@tiptap/starter-kit';
    import Placeholder from '@tiptap/extension-placeholder';
    import Link from '@tiptap/extension-link';
    import Image from '@tiptap/extension-image';
    import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
    import { common, createLowlight } from 'lowlight';
    import MediaUpload from './MediaUpload.svelte';

    /** @type {{ content: string }} */
    let { content = $bindable('') } = $props();

    /** @type {HTMLElement | undefined} */
    let editorElement = $state();
    /** @type {Editor | null} */
    let editor = $state(null);
    let mode = $state('NOTION'); // NOTION, SOURCE
    let showSlashMenu = $state(false);
    let showUpload = $state(false);

    const lowlight = createLowlight(common);

    const DEFAULT_TEMPLATE = '<within>\n' +
        '  <h1>New Project</h1>\n' +
        '  <p>Start writing or use <strong>Slash Commands</strong>...</p>\n' +
        '  \n' +
        '  <style>\n' +
        '    /* Add window-specific styles here */\n' +
        '  </style>\n' +
        '  \n' +
        '  <script>\n' +
        '    console.log("Window initialized");\n' +
        '  </' + 'script>\n' +
        '</within>\n\n' +
        '<outside>\n' +
        '  <!-- Elements here render globally outside the window -->\n' +
        '</outside>';

    onMount(() => {
        if (!content) content = DEFAULT_TEMPLATE;

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
            onUpdate: ({ editor: ed }) => {
                if (mode === 'NOTION' && ed) {
                    updateSourceFromEditor(ed.getHTML());
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
            const newWithin = '\n  ' + html + '\n  ' + scriptsStyles.join('\n  ') + '\n';
            content = content.replace(/<within>[\s\S]*?<\/within>/, '<within>' + newWithin + '</within>');
        } else {
            content = '<within>\n  ' + html + '\n</within>\n<outside>\n</outside>';
        }
    }

    /** @param {string} newMode */
    function toggleMode(newMode) {
        if (mode === newMode) return;

        if (newMode === 'NOTION') {
            if (editor) {
                editor.commands.setContent(extractWithin(content));
            }
        }
        mode = newMode;
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
            showUpload = true;
        }

        showSlashMenu = false;
    }

    /** @param {string} url */
    function handleUpload(url) {
        if (editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }
</script>

<div class="flex-1 flex flex-col min-h-0 bg-black/20 border border-white/10 rounded overflow-hidden relative">
    <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
        <div class="flex items-center gap-6">
            <div class="flex items-center gap-1">
                <button type="button" onclick={() => editor?.chain().focus().undo().run()} class="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white" title="Undo"><i class="ph ph-arrow-u-up-left"></i></button>
                <button type="button" onclick={() => editor?.chain().focus().redo().run()} class="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white" title="Redo"><i class="ph ph-arrow-u-up-right"></i></button>
            </div>
        </div>

        <div class="relative flex items-center bg-black/40 p-1 rounded-full border border-white/10 w-64 h-10 overflow-hidden">
            <div
                class="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg shadow-blue-500/20"
                style:left={mode === 'NOTION' ? '4px' : 'calc(50% + 0px)'}
            ></div>

            <button type="button" onclick={() => toggleMode('NOTION')} class="relative z-10 flex-1 text-[10px] font-bold tracking-widest transition-colors duration-300 {mode === 'NOTION' ? 'text-white' : 'text-white/30'}">NOTION</button>
            <button type="button" onclick={() => toggleMode('SOURCE')} class="relative z-10 flex-1 text-[10px] font-bold tracking-widest transition-colors duration-300 {mode === 'SOURCE' ? 'text-white' : 'text-white/30'}">SOURCE</button>
        </div>

        <div class="w-20"></div>
    </div>

    <div class="flex-1 relative overflow-hidden">
        <div class="flex w-[200%] h-full transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]" style:transform={mode === 'NOTION' ? 'translateX(0%)' : 'translateX(-50%)'}>
            <div class="w-1/2 h-full overflow-y-auto custom-scrollbar p-8">
                <div class="max-w-3xl mx-auto min-h-full tiptap-container">
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div bind:this={editorElement} onkeydown={handleKeyDown} class="tiptap-wrapper min-h-full"></div>
                </div>
            </div>
            <div class="w-1/2 h-full bg-black/10">
                <textarea bind:value={content} class="w-full h-full p-10 bg-transparent text-white/90 font-mono text-sm resize-none outline-none custom-scrollbar leading-relaxed" spellcheck="false"></textarea>
            </div>
        </div>
    </div>

    {#if showSlashMenu}
        <div class="absolute left-10 top-24 bg-[#0a0a0f] border border-white/20 rounded-xl shadow-2xl p-2 z-50 w-56 backdrop-blur-xl animate-pop-in">
            <div class="text-[9px] text-gray-500 mb-2 px-3 pt-1 uppercase tracking-[0.2em] font-bold">Commands</div>
            <div class="space-y-0.5">
                <button type="button" onclick={() => insertCommand('h1')} class="w-full text-left px-3 py-2 hover:bg-blue-600 rounded-lg flex items-center gap-3 transition-all group">
                    <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center group-hover:bg-white/10"><i class="ph ph-text-h-one"></i></div>
                    <span class="text-xs font-medium">Heading 1</span>
                </button>
                <button type="button" onclick={() => insertCommand('h2')} class="w-full text-left px-3 py-2 hover:bg-blue-600 rounded-lg flex items-center gap-3 transition-all group">
                    <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center group-hover:bg-white/10"><i class="ph ph-text-h-two"></i></div>
                    <span class="text-xs font-medium">Heading 2</span>
                </button>
                <button type="button" onclick={() => insertCommand('bullet')} class="w-full text-left px-3 py-2 hover:bg-blue-600 rounded-lg flex items-center gap-3 transition-all group">
                    <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center group-hover:bg-white/10"><i class="ph ph-list-bullets"></i></div>
                    <span class="text-xs font-medium">Bullet List</span>
                </button>
                <button type="button" onclick={() => insertCommand('code')} class="w-full text-left px-3 py-2 hover:bg-blue-600 rounded-lg flex items-center gap-3 transition-all group">
                    <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center group-hover:bg-white/10"><i class="ph ph-code"></i></div>
                    <span class="text-xs font-medium">Code Block</span>
                </button>
                <div class="h-px bg-white/5 my-1 mx-2"></div>
                <button type="button" onclick={() => insertCommand('image')} class="w-full text-left px-3 py-2 hover:bg-blue-600 rounded-lg flex items-center gap-3 transition-all group">
                    <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center group-hover:bg-white/10"><i class="ph ph-image"></i></div>
                    <div class="flex flex-col">
                        <span class="text-xs font-medium">Upload Media</span>
                        <span class="text-[8px] text-gray-500 group-hover:text-white/70">Images, Videos...</span>
                    </div>
                </button>
            </div>
        </div>
    {/if}
</div>

{#if showUpload}
    <MediaUpload
        onUpload={handleUpload}
        onClose={() => showUpload = false}
    />
{/if}

<style>
    @keyframes pop-in { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .animate-pop-in { animation: pop-in 0.2s ease-out; }
    :global(.tiptap) { outline: none; }
    :global(.tiptap p.is-editor-empty:first-child::before) { content: attr(data-placeholder); float: left; color: #4b5563; pointer-events: none; height: 0; }
    :global(.tiptap h1) { font-size: 3rem; font-weight: 800; margin-bottom: 2rem; color: white; letter-spacing: -0.02em; }
    :global(.tiptap h2) { font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; color: #f3f4f6; }
    :global(.tiptap p) { margin-bottom: 1.5rem; color: #9ca3af; line-height: 1.8; font-size: 1.1rem; }
    :global(.tiptap ul) { list-style-type: disc; margin-left: 2rem; margin-bottom: 1.5rem; color: #9ca3af; }
    :global(.tiptap li) { margin-bottom: 0.5rem; }
    :global(.tiptap pre) { background: #000; padding: 1.5rem; border-radius: 1rem; border: 1px solid #222; margin: 1.5rem 0; font-family: 'Space Mono', monospace; }
    :global(.tiptap img) { max-width: 100%; height: auto; border-radius: 1rem; margin: 2rem 0; border: 1px solid #333; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
</style>
