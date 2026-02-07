<script>
    import { onMount } from 'svelte';
    import { isAdmin } from '$lib/stores';

    // Default Hash for "admin"
    // 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
    const ADMIN_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";

    let isVisible = $state(false);
    let inputVal = $state('');
    let output = $state([
        { type: 'info', text: 'LUKI.OS v2.0.4 [Authorized Personnel Only]' },
        { type: 'info', text: 'Type "help" for available commands.' }
    ]);
    let inputRef;

    async function hash(string) {
        const utf8 = new TextEncoder().encode(string);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    async function handleCommand() {
        const cmd = inputVal.trim();
        if (!cmd) return;

        output = [...output, { type: 'user', text: `> ${cmd}` }];
        inputVal = '';

        const args = cmd.split(' ');
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                output = [...output,
                    { type: 'info', text: 'AVAILABLE COMMANDS:' },
                    { type: 'info', text: '  login <password>  - Elevate privileges' },
                    { type: 'info', text: '  logout            - Drop privileges' },
                    { type: 'info', text: '  clear             - Clear terminal' },
                    { type: 'info', text: '  whoami            - Display current user' },
                    { type: 'info', text: '  exit              - Close terminal' }
                ];
                break;
            case 'clear':
                output = [];
                break;
            case 'whoami':
                output = [...output, { type: 'info', text: $isAdmin ? 'root (ADMIN)' : 'guest (VISITOR)' }];
                break;
            case 'exit':
                isVisible = false;
                break;
            case 'logout':
                $isAdmin = false;
                output = [...output, { type: 'warn', text: 'Privileges dropped.' }];
                break;
            case 'login':
                if (args[1]) {
                    const h = await hash(args[1]);
                    if (h === ADMIN_HASH) {
                        $isAdmin = true;
                        output = [...output, { type: 'success', text: 'ACCESS GRANTED. WELCOME BACK, OPERATOR.' }];
                    } else {
                        output = [...output, { type: 'error', text: 'ACCESS DENIED. INVALID CREDENTIALS.' }];
                    }
                } else {
                    output = [...output, { type: 'error', text: 'Usage: login <password>' }];
                }
                break;
            default:
                output = [...output, { type: 'error', text: `Unknown command: ${command}` }];
        }

        // Scroll to bottom
        setTimeout(() => {
            const t = document.getElementById('term-content');
            if (t) t.scrollTop = t.scrollHeight;
        }, 10);
    }

    function handleKeydown(e) {
        // Toggle: Ctrl + Shift + L
        if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
            e.preventDefault();
            isVisible = !isVisible;
            if (isVisible) {
                setTimeout(() => inputRef?.focus(), 100);
            }
        }

        // Close on Escape
        if (isVisible && e.key === 'Escape') {
            isVisible = false;
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    });
</script>

{#if isVisible}
    <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onclick={() => isVisible = false}>
        <div class="w-full max-w-2xl bg-[#050505] border border-green-900 shadow-[0_0_30px_rgba(0,255,0,0.2)] font-mono rounded overflow-hidden" onclick={(e) => e.stopPropagation()}>
            <!-- Header -->
            <div class="bg-green-900/20 border-b border-green-900 p-2 flex justify-between items-center text-xs text-green-500">
                <span>TERMINAL_SESSION_01</span>
                <button onclick={() => isVisible = false} class="hover:text-green-300">[X]</button>
            </div>

            <!-- Content -->
            <div id="term-content" class="h-96 p-4 overflow-y-auto text-sm space-y-1 font-[VT323] text-lg">
                {#each output as line}
                    <div class:text-green-500={line.type === 'info'}
                         class:text-white={line.type === 'user'}
                         class:text-red-500={line.type === 'error'}
                         class:text-yellow-400={line.type === 'warn'}
                         class:text-blue-400={line.type === 'success'}>
                        {line.text}
                    </div>
                {/each}

                <div class="flex items-center text-green-500 mt-2">
                    <span class="mr-2">{$isAdmin ? 'root@luki:~$' : 'guest@luki:~$'}</span>
                    <input
                        bind:this={inputRef}
                        type="text"
                        bind:value={inputVal}
                        onkeydown={(e) => e.key === 'Enter' && handleCommand()}
                        class="bg-transparent border-none outline-none flex-1 text-white caret-green-500"
                        spellcheck="false"
                        autocomplete="off"
                    />
                </div>
            </div>
        </div>
    </div>
{/if}
