<script>
    /** @type {{ title: string, type: string, date: string, description: string, content?: string, image_url?: string, content_url?: string, color?: string }} */
    let { title, type, date, description, content, image_url, content_url, color } = $props();

    function getTypeColor(t) {
        switch(t) {
            case 'ESSAY': return 'text-green-400 border-green-400';
            case 'SKETCH': return 'text-purple-400 border-purple-400';
            case 'PROJECT': return 'text-blue-400 border-blue-400';
            case 'MUSIC': return 'text-pink-400 border-pink-400';
            case 'ART': return 'text-yellow-400 border-yellow-400';
            case 'POST': return 'text-gray-400 border-gray-400';
            default: return 'text-gray-400 border-gray-400';
        }
    }
</script>

<div class="file-viewer w-full h-full flex flex-col text-white">
    <!-- Header -->
    <div class="header mb-6 pb-4 border-b border-[#333]">
        <div class="flex items-center gap-3 mb-2 font-mono text-xs opacity-70">
            <span class="px-2 py-0.5 border {getTypeColor(type)} rounded-sm">{type}</span>
            <span>{date}</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
    </div>

    <!-- Content Area -->
    <div class="content flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {#if image_url && image_url.startsWith('http')}
            <div class="mb-6 rounded-sm overflow-hidden border border-[#333]">
                <img src={image_url} alt={title} class="w-full h-auto object-cover" />
            </div>
        {:else if image_url}
             <div class="mb-6 flex items-center justify-center h-64 bg-[#111] border border-[#333] text-6xl rounded-sm">
                {image_url}
             </div>
        {/if}

        {#if description}
            <p class="text-lg text-gray-300 mb-6 italic border-l-2 border-[#333] pl-4">{description}</p>
        {/if}

        {#if content}
            <div class="prose prose-invert prose-p:font-mono prose-headings:font-bold max-w-none text-gray-300 space-y-4 leading-relaxed text-sm md:text-base">
                {@html content}
            </div>
        {/if}

        {#if content_url}
            <div class="mt-8 pt-4 border-t border-[#333]">
                <a href={content_url} target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#222] border border-[#333] hover:border-white transition-colors text-sm font-mono group">
                    OPEN_EXTERNAL_LINK
                    <i class="ph ph-arrow-up-right group-hover:translate-x-1 transition-transform"></i>
                </a>
            </div>
        {/if}
    </div>
</div>

<style>
    /* Custom Scrollbar for content */
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #333;
        border-radius: 2px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
</style>
