<script>
    import { onMount } from 'svelte';
    let { content } = $props();
    let display = $state(content);
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`010101';

    onMount(() => {
        let interval = setInterval(() => {
            if (Math.random() > 0.95) {
                // Glitch effect
                let original = display;
                display = content.split('').map((c) => {
                     if (c === ' ') return ' ';
                     if (Math.random() > 0.7) return chars[Math.floor(Math.random() * chars.length)];
                     return c;
                }).join('');

                setTimeout(() => display = content, 150);
            }
        }, 1000);
        return () => clearInterval(interval);
    });
</script>

<span class="font-mono text-red-400 inline-block hover:text-red-300 transition-colors cursor-crosshair" title="Obfuscated Data">{display}</span>
