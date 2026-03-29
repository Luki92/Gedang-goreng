<script>
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { backOut } from 'svelte/easing';

    let showWolf = $state(false);

    onMount(() => {
        // Sync with LukiPersona exit time (approx 800ms-1000ms)
        const t = setTimeout(() => {
            showWolf = true;
        }, 600);
        return () => clearTimeout(t);
    });
</script>

<div class="h-full overflow-y-auto pr-2">
    <div class="flex flex-col md:flex-row gap-6 mt-12 md:mt-0">
        <!-- Placeholder Box for Luki to jump into -->
        <div class="w-32 h-32 md:w-48 md:h-48 border border-dashed border-[#444] rounded flex items-end justify-center bg-black/50 shrink-0 relative overflow-hidden">
             {#if showWolf}
                <div
                    class="text-[4rem] md:text-[6rem] leading-none select-none"
                    style="filter: drop-shadow(0 0 15px rgba(85,85,255,0.4));"
                    in:fly={{ y: 200, duration: 800, easing: backOut }}
                >
                    🐺
                </div>
            {:else}
                <span class="text-xs text-gray-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">SUMMONING...</span>
            {/if}
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
