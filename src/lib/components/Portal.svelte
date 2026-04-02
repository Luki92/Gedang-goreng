<script>
    import Guestbook from './Guestbook.svelte';
</script>

<div class="h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar">
    <div class="grid grid-cols-2 gap-4 mb-8">
        <a href="#" class="p-6 border border-[#333] hover:border-green-500 hover:bg-[#0a0a0a] transition-all group flex flex-col items-center gap-2">
            <i class="ph ph-instagram-logo text-3xl group-hover:text-pink-500"></i>
            <span class="text-xs">INSTAGRAM</span>
        </a>
        <a href="#" class="p-6 border border-[#333] hover:border-blue-500 hover:bg-[#0a0a0a] transition-all group flex flex-col items-center gap-2">
            <i class="ph ph-discord-logo text-3xl group-hover:text-blue-500"></i>
            <span class="text-xs">DISCORD</span>
        </a>
        <a href="#" class="p-6 border border-[#333] hover:border-white hover:bg-[#0a0a0a] transition-all group flex flex-col items-center gap-2">
            <i class="ph ph-envelope-simple text-3xl group-hover:text-white"></i>
            <span class="text-xs">MAIL</span>
        </a>
        <a href="#" class="p-6 border border-[#333] hover:border-yellow-500 hover:bg-[#0a0a0a] transition-all group flex flex-col items-center gap-2">
            <i class="ph ph-coffee text-3xl group-hover:text-yellow-500"></i>
            <span class="text-xs">KO-FI</span>
        </a>
    </div>

    <Guestbook />
</div>
