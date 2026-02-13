<script>
    import { onMount } from 'svelte';
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';

    let isVisible = $state(false);
    let inputVal = $state('');
    /** @type {{ type: string, text: string }[]} */
    let output = $state([
        { type: 'info', text: 'LUKI.OS v3.0.0 [Authorized Personnel Only]' },
        { type: 'info', text: 'Type "help" for available commands.' }
    ]);
    /** @type {HTMLInputElement | null} */
    let inputRef = $state(null);

    async function handleCommand() {
        const cmd = inputVal.trim();
        if (!cmd) return;

        // Mask password in output if command is login
        const isLogin = cmd.toLowerCase().startsWith('login ');
        const displayCmd = isLogin ? 'login ********' : cmd;

        output = [...output, { type: 'user', text: `> ${displayCmd}` }];
        inputVal = '';

        const args = cmd.split(' ');
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                output = [...output,
                    { type: 'info', text: 'AVAILABLE COMMANDS:' },
                    { type: 'info', text: '  login <email> <password>  - Authenticate via Supabase' },
                    { type: 'info', text: '  logout                    - End session' },
                    { type: 'info', text: '  clear                     - Clear terminal' },
                    { type: 'info', text: '  whoami                    - Display current user' },
                    { type: 'info', text: '  exit                      - Close terminal' }
                ];
                break;
            case 'clear':
                output = [];
                break;
            case 'whoami':
                if ($isAdmin) {
                    const { data } = await supabase.auth.getUser();
                    output = [...output, { type: 'info', text: `root (ADMIN) - ${data.user?.email}` }];
                } else {
                    output = [...output, { type: 'info', text: 'guest (VISITOR)' }];
                }
                break;
            case 'exit':
                isVisible = false;
                break;
            case 'logout':
                await supabase.auth.signOut();
                $isAdmin = false;
                output = [...output, { type: 'warn', text: 'Session terminated.' }];
                break;
            case 'login':
                if (args[1] && args[2]) {
                    output = [...output, { type: 'info', text: 'Authenticating...' }];
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email: args[1],
                        password: args[2]
                    });

                    if (error) {
                        output = [...output, { type: 'error', text: `ACCESS DENIED: ${error.message}` }];
                    } else {
                        $isAdmin = true;
                        output = [...output, { type: 'success', text: 'ACCESS GRANTED. WELCOME BACK, OPERATOR.' }];
                    }
                } else {
                    output = [...output, { type: 'error', text: 'Usage: login <email> <password>' }];
                }
                break;
            default:
                output = [...output, { type: 'error', text: `Unknown command: ${command}` }];
        }

        setTimeout(() => {
            const t = document.getElementById('term-content');
            if (t) t.scrollTop = t.scrollHeight;
        }, 10);
    }

    /** @param {KeyboardEvent} e */
    function handleKeydown(e) {
        if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
            e.preventDefault();
            isVisible = !isVisible;
            if (isVisible) {
                setTimeout(() => inputRef?.focus(), 100);
            }
        }

        if (isVisible && e.key === 'Escape') {
            isVisible = false;
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);

        supabase.auth.getSession().then(({ data: { session } }) => {
            $isAdmin = !!session;
            if (session) {
                 output = [...output, { type: 'success', text: `Session restored: ${session.user.email}` }];
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            $isAdmin = !!session;
        });

        return () => {
            window.removeEventListener('keydown', handleKeydown);
            subscription.unsubscribe();
        };
    });
</script>

{#if isVisible}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onclick={() => isVisible = false}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <div class="w-full max-w-2xl bg-[rgba(10,10,15,0.75)] backdrop-blur-[8px] border border-[#5555ff] shadow-xl font-mono rounded-lg overflow-hidden" onclick={(e) => e.stopPropagation()} role="document">
            <!-- Header -->
            <div class="bg-transparent border-b border-[#5555ff] p-2 flex justify-between items-center text-xs text-gray-400 select-none">
                <span>RESTRICTED_ACCESS_GATEWAY</span>
                <button onclick={() => isVisible = false} class="hover:text-white transition-colors">[X]</button>
            </div>

            <!-- Content -->
            <div id="term-content" class="h-96 p-4 overflow-y-auto text-sm space-y-1 font-mono text-gray-300">
                {#each output as line}
                    <div class:text-gray-300={line.type === 'info'}
                         class:text-white={line.type === 'user'}
                         class:text-red-400={line.type === 'error'}
                         class:text-yellow-400={line.type === 'warn'}
                         class:text-blue-400={line.type === 'success'}>
                        {line.text}
                    </div>
                {/each}

                <div class="flex items-center text-gray-400 mt-2">
                    <span class="mr-2 text-blue-500">{$isAdmin ? 'root@luki:~$' : 'guest@luki:~$'}</span>
                    <input
                        bind:this={inputRef}
                        type="text"
                        bind:value={inputVal}
                        onkeydown={(e) => e.key === 'Enter' && handleCommand()}
                        class="bg-transparent border-none outline-none flex-1 text-white caret-blue-500 placeholder-gray-600"
                        spellcheck="false"
                        autocomplete="off"
                    />
                </div>
            </div>
        </div>
    </div>
{/if}
