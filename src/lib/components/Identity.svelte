<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
</script>

<div class="h-full overflow-y-auto pr-2">
    <div class="flex flex-col md:flex-row gap-6 mt-12 md:mt-0">
        <!-- Placeholder Box for Luki to jump into -->
        <div class="w-32 h-32 md:w-48 md:h-48 border border-dashed border-[#444] rounded flex items-center justify-center bg-black/50 shrink-0 relative overflow-hidden">
            <!-- Inner Wolf -->
            <div
                class="luki-inner-emoji"
                in:fly={{ y: 200, duration: 1000, easing: quintOut, delay: 300 }}
            >
                🐺
            </div>

            <span class="text-xs text-gray-600 absolute bottom-2 left-2 z-0">PERSONA_SLOT</span>
        </div>
        <div>
            <h2 class="text-3xl text-white mb-2 font-bold font-playfair italic">Luki.</h2>
            <p class="text-xs text-green-500 mb-4 font-[VT323]">STATUS: CREATIVE_MODE | MANA: 85%</p>
            <div class="selectable-text space-y-4 text-sm text-gray-300 leading-relaxed font-[Space Mono]">
                <p>
                    "I don't fix computers, I make them dream."
                </p>
                <p>
                    Digital artist & Code weaver. Spending time building things that look cool but might not have a practical use.
                    <br>Flexing aesthetics over corporate functionality.
                </p>
                <div class="p-3 border border-[#333] bg-[#050505]">
                    <span class="text-xs text-gray-500 block mb-1">SKILL_TREE:</span>
                    JS, Creative Coding, Illustration, Chaos Management.
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .luki-inner-emoji {
        font-size: 6rem;
        filter: drop-shadow(0 0 30px var(--accent-color));
        z-index: 10;
        animation: breathe 4s ease-in-out infinite;
    }

    @keyframes breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }

    @media (max-width: 768px) {
        .luki-inner-emoji { font-size: 4rem; }
    }
</style>
