<script>
    import { onMount, tick } from 'svelte';
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { terminalStore } from '$lib/stores/terminal.svelte.js';

    let inputVal = $state('');
    let inputRef = $state(null);
    let currentPath = $state('~/');
    let user = $state('guest');

    // Virtual File System
    const fileSystem = {
        '~/': {
            type: 'dir',
            children: {
                'readme.txt': { type: 'file', content: 'Welcome to LukiOS.\nThis is a portfolio system mimicking a Tiling Window Manager.' },
                'projects': { type: 'dir', children: {} }, // Will populate from dataStore
                'system': { type: 'dir', children: {
                    'config': { type: 'file', content: 'Display: 1920x1080\nTheme: Dark' },
                    'logs': { type: 'file', content: 'System initialized...' }
                }}
            }
        }
    };

    let commandHistory = $state([]);
    let historyIndex = $state(-1);

    onMount(() => {
        if (inputRef) inputRef.focus();

        // Sync user state
        if ($isAdmin) user = 'root';

        // Listen for global auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            user = session ? 'root' : 'guest';
            $isAdmin = !!session;
            if (session) {
                print(`Auth: Logged in as ${session.user.email}`, 'success');
            }
        });

        // Listen for system logs (Deployment events)
        const handleLog = (e) => {
            print(e.detail.text, e.detail.type || 'info');
        };
        window.addEventListener('terminal-log', handleLog);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('terminal-log', handleLog);
        }
    });

    function print(text, type = 'text') {
        terminalStore.add(text, type);
    }

    async function execute(cmdStr) {
        if (!cmdStr.trim()) return;

        // Add to command history
        commandHistory.push(cmdStr);
        historyIndex = commandHistory.length;

        const parts = cmdStr.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Print prompt line
        print(`${user}@lukios:${currentPath}$ ${cmdStr}`, 'user');

        switch (cmd) {
            case 'help':
                print('Available commands:', 'info');
                print('  login <email> <password>  Authenticate as admin', 'info');
                print('  logout                    Sign out', 'info');
                print('  clear                     Clear screen', 'info');
                print('  ls                        List directory content', 'info');
                print('  cat <file>                Read file content', 'info');
                print('  whoami                    Show current user', 'info');
                print('  open <app>                Open application (vault, portal, guestbook)', 'info');
                print('  sudo admin                Open Control Center', 'info');
                break;

            case 'clear':
                terminalStore.clear();
                break;

            case 'echo':
                print(args.join(' '));
                break;

            case 'whoami':
                print(user);
                break;

            case 'ls':
                // Simple mock ls for now
                if (currentPath === '~/') {
                    print('readme.txt  projects/  system/', 'info');
                } else {
                    print('Total 0', 'info');
                }
                break;

            case 'cat':
                if (args[0] === 'readme.txt') {
                    print(fileSystem['~/'].children['readme.txt'].content);
                } else {
                    print(`cat: ${args[0]}: No such file or directory`, 'error');
                }
                break;

            case 'login':
                if (args.length < 2) {
                    print('Usage: login <email> <password>', 'error');
                } else {
                    print('Authenticating...', 'warn');
                    const { error } = await supabase.auth.signInWithPassword({
                        email: args[0],
                        password: args[1]
                    });
                    if (error) print(`Login failed: ${error.message}`, 'error');
                    else print('Access Granted.', 'success');
                }
                break;

            case 'logout':
                await supabase.auth.signOut();
                print('Logged out.', 'warn');
                break;

            case 'open':
                const app = args[0]?.toLowerCase();
                const apps = {
                    'vault': 'c-tr',
                    'guestbook': 'admin-guestbook',
                    'portal': 'c-br',
                    'playlist': 'c-bl',
                    'identity': 'c-tl'
                };

                if (apps[app]) {
                    print(`Launching ${app}...`, 'success');
                    windowManager.toggle(apps[app]);
                } else {
                    print(`Application '${app}' not found.`, 'error');
                    print('Available: vault, portal, playlist, identity', 'info');
                }
                break;

            case 'sudo':
                if (args[0] === 'admin') {
                     if (!$isAdmin) {
                         print('sudo: permission denied (are you root?)', 'error');
                     } else {
                         print('Starting Control Center...', 'success');
                         windowManager.open('control-center', { isTiled: false, width: 900, height: 600 });
                     }
                } else {
                    print(`sudo: unknown command ${args[0]}`, 'error');
                }
                break;

            default:
                print(`${cmd}: command not found`, 'error');
        }

        inputVal = '';
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') {
            execute(inputVal);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                inputVal = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                inputVal = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                inputVal = '';
            }
        }
    }
</script>

<div class="h-full bg-black font-mono text-sm p-2 flex flex-col overflow-hidden" onclick={() => inputRef?.focus()}>
    <div id="terminal-scroll" class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {#each terminalStore.history as line}
            <div class:text-green-500={line.type === 'info'}
                 class:text-white={line.type === 'user'}
                 class:text-red-500={line.type === 'error'}
                 class:text-yellow-400={line.type === 'warn'}
                 class:text-blue-400={line.type === 'success'}>
                 {#if line.type === 'user'}
                    <span class="opacity-50 mr-2">➜</span>
                 {/if}
                 {line.text}
            </div>
        {/each}

        <div class="flex items-center text-gray-300 mt-2">
            <span class="text-green-500 mr-2">{user}@lukios:{currentPath}$</span>
            <input
                bind:this={inputRef}
                type="text"
                bind:value={inputVal}
                onkeydown={handleKeydown}
                class="bg-transparent border-none outline-none flex-1 text-white caret-white"
                spellcheck="false"
                autocomplete="off"
            />
        </div>
    </div>
</div>
