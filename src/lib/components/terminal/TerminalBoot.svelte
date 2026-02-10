<script>
    import { onMount, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    let lines = $state([]);
    let container;

    const bootMessages = [
        "[  OK  ] Started Network Manager Script Dispatcher Service.",
        "[  OK  ] Reached target Network.",
        "[  OK  ] Reached target Remote File Systems.",
        "[  OK  ] Started D-Bus System Message Bus.",
        "[  OK  ] Started Permit User Sessions.",
        "[  OK  ] Started Getty on tty1.",
        "[  OK  ] Started Serial Getty on ttyS0.",
        "[  OK  ] Reached target Login Prompts.",
        "[  OK  ] Started NixOS System Configuration.",
        "[  OK  ] Mounting /dev/sda1 (Coffee Partition)...",
        "[  OK  ] Mounted /dev/sda1.",
        "[  OK  ] Started LukiWM.",
        "[  OK  ] Reached target Graphical Interface.",
        "[  OK  ] Started Update UTMP about System Runlevel Changes.",
        "Welcome to NixOS 25.11 (Caffeinated)!"
    ];

    onMount(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index >= bootMessages.length) {
                clearInterval(interval);
                setTimeout(() => dispatch('complete'), 800);
            } else {
                lines = [...lines, bootMessages[index]];
                index++;
                if (container) container.scrollTop = container.scrollHeight;
            }
        }, 150); // Speed of boot text

        return () => clearInterval(interval);
    });
</script>

<div bind:this={container} class="h-full w-full bg-black font-mono text-sm p-4 overflow-y-auto text-gray-300">
    {#each lines as line}
        <div class="whitespace-pre-wrap">
            {#if line.startsWith('[  OK  ]')}
                <span class="text-green-500 font-bold">[  OK  ]</span> {line.substring(9)}
            {:else}
                {line}
            {/if}
        </div>
    {/each}
    <div class="animate-pulse">_</div>
</div>
