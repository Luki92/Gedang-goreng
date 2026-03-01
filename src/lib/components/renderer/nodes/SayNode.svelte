<script>
    import { personaStore } from '$lib/stores/persona.svelte.js';
    import { onMount } from 'svelte';
    import InlineRenderer from './InlineRenderer.svelte';

    let { attribution, message, children } = $props();
    let element = $state();

    function trigger() {
        personaStore.say(message, attribution.expression || 'idle');
    }

    onMount(() => {
        if (attribution.cause === 'scroll') {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    trigger();
                    observer.disconnect();
                }
            }, { threshold: 0.5 });
            if (element) observer.observe(element);
            return () => observer.disconnect();
        }
    });

    function handleMouseEnter() {
        if (attribution.cause === 'hover') {
            trigger();
        }
    }
</script>

<span
    bind:this={element}
    class="persona-say-target border-b border-dashed border-red-500/50 hover:border-red-500 cursor-help transition-colors"
    onmouseenter={handleMouseEnter}
    role="status"
>
    <InlineRenderer nodes={children} />
</span>
