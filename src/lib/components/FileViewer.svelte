<script>
    import LukiRenderer from '$lib/components/renderer/LukiRenderer.svelte';
    import { parser } from '$lib/utils/luki-parser.js';

    /** @type {{ item?: any }} */
    let { item = undefined } = $props();

    // Prioritize 'content' for rich text, fallback to 'description'
    let ast = $derived(item ? parser.parse(item.content || item.description || '') : []);
</script>

<div class="file-viewer h-full w-full bg-transparent text-white flex flex-col p-6 overflow-hidden">
    {#if !item}
        <div class="flex items-center justify-center h-full text-gray-500 font-mono animate-pulse">
            <p>// NULL_POINTER: NO_FILE_SELECTED</p>
        </div>
    {:else}
        <div class="mb-6 border-b border-white/10 pb-4 shrink-0">
             <div class="flex items-center gap-3 mb-2">
                 <span class="px-2 py-0.5 border border-white/20 text-[10px] text-gray-400 font-mono tracking-widest uppercase">{item.type}</span>
                 <span class="text-xs text-gray-500 font-mono tracking-wider">DATE: {item.date}</span>
             </div>
             <h1 class="text-3xl md:text-5xl font-bold mb-2 leading-tight tracking-tight text-white selectable">{item.title}</h1>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 selectable">
             {#if ['ART', 'SKETCH'].includes(item.type)}
                 <div class="w-full flex flex-col items-center gap-6">
                     <div class="w-full flex items-center justify-center bg-black/40 border border-white/5 p-2 md:p-8 relative group">
                         <!-- Subtle grid background for art viewer -->
                         <div class="absolute inset-0 opacity-10 pointer-events-none"
                              style="background-image: linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px); background-size: 20px 20px;">
                         </div>

                         {#if item.image_url && item.image_url.startsWith('http')}
                             <img src={item.image_url} alt={item.title} class="max-w-full max-h-[60vh] object-contain shadow-2xl relative z-10" />
                         {:else if item.image_url}
                             <div class="text-9xl opacity-50 relative z-10">{item.image_url}</div>
                         {:else}
                             <div class="p-20 text-white/20 font-mono uppercase tracking-widest border border-dashed border-white/10">No_Media_Payload</div>
                         {/if}
                     </div>
                     {#if item.description}
                         <div class="text-sm md:text-base text-gray-400 max-w-3xl leading-relaxed text-center font-serif italic border-l-2 border-white/20 pl-4 selectable">
                             {item.description}
                         </div>
                     {/if}
                 </div>
             {:else}
                 <!-- Text Content (Essay/Post) -->
                 <div class="prose prose-invert prose-sm md:prose-lg max-w-3xl mx-auto py-4 font-serif selectable">
                     <LukiRenderer {ast} />

                     <div class="mt-12 pt-8 border-t border-white/10 flex justify-between items-center text-xs text-gray-600 font-mono">
                         <span>END_OF_FILE</span>
                         <span>NODE: LUKI_V4_SECURE</span>
                     </div>
                 </div>
             {/if}
        </div>
    {/if}
</div>
