<script>
    import { personaStore } from '$lib/stores/persona.svelte.js';
    import { onMount } from 'svelte';

    let { message, expression, trigger = 'scroll' } = $props();
    let observer;
    let containerEl;

    onMount(() => {
        if (trigger === 'scroll' && containerEl) {
            observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    personaStore.say(message, expression);
                }
            }, { threshold: 0.5 });
            observer.observe(containerEl);
        }
    });

    function handleMouseEnter() {
        if (trigger === 'hover') {
            personaStore.say(message, expression);
        }
    }
</script>

<div
    bind:this={containerEl}
    onmouseenter={handleMouseEnter}
    class="my-4 border-l-2 border-red-500/30 pl-4 py-2 italic text-white/40 text-sm cursor-help hover:text-red-400 hover:border-red-500 transition-all group"
>
    <i class="ph-fill ph-chat-circle-dots opacity-0 group-hover:opacity-100 mr-2"></i>
    <span>[Interaction Trigger]</span>
</div>
