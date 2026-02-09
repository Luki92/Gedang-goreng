<script>
    let { content } = $props();
    let revealed = $state(false);
</script>

<button
    onclick={() => revealed = !revealed}
    class="inline-block px-1 rounded cursor-pointer transition-all align-middle border border-transparent mx-1 relative overflow-hidden"
    class:bg-[#222]={!revealed}
    class:hover:bg-[#333]={!revealed}
    class:border-red-900={!revealed}
    title={revealed ? 'Hide' : 'Reveal Spoiler'}
>
    <span class="absolute inset-0 flex items-center justify-center text-[8px] text-gray-600 font-bold uppercase tracking-widest pointer-events-none" class:hidden={revealed}>SPOILER</span>
    <span
        class="transition-all duration-300"
        class:opacity-0={!revealed}
        class:blur-sm={!revealed}
    >
        {content}
    </span>
</button>
