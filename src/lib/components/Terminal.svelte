<script>
    import { onMount, tick } from 'svelte';
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { terminalStore } from '$lib/stores/terminal.svelte.js';
    import TerminalBoot from './terminal/TerminalBoot.svelte';
    import TerminalNeofetch from './terminal/TerminalNeofetch.svelte';

    /** @type {HTMLInputElement | null} */
    let inputRef = $state(null);
    let inputVal = $state('');
    let currentPath = $state('~/');
    let user = $state('guest');
    let isBooting = $state(true);

    /** @type {Record<string, { type: string, children: Record<string, any> }>} */
    const fileSystem = {
        '~/': {
            type: 'dir',
            children: {
                'readme.txt': { type: 'file', content: 'Welcome to LukiOS.\nThis is a portfolio system mimicking a Tiling Window Manager.' },
                'projects': { type: 'dir', children: {} },
                'system': { type: 'dir', children: {
                    'config': { type: 'file', content: 'Display: 1920x1080\nTheme: Dark' },
                    'logs': { type: 'file', content: 'System initialized...' }
                }}
            }
        }
    };

    const commands = [
        'cat', 'cd', 'clear', 'echo', 'exit', 'grep', 'help', 'history',
        'login', 'ls', 'logout', 'man', 'neofetch', 'open', 'rm', 'sudo',
        'top', 'uname', 'whoami', 'coffee', 'apt', 'apt-get', 'yum', 'pacman',
        'nix-shell', 'nixos-rebuild'
    ];

    /** @type {string[]} */
    let commandHistory = $state([]);
    let historyIndex = $state(-1);

    onMount(() => {
        if (inputRef) inputRef.focus();

        if ($isAdmin) user = 'root';

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            user = session ? 'root' : 'guest';
            $isAdmin = !!session;
            if (session) {
                print(`Auth: Logged in as ${session.user.email}`, 'success');
            }
        });

        const handleLog = (/** @type {CustomEvent} */ e) => {
            print(e.detail.text, e.detail.type || 'info');
        };
        // @ts-ignore
        window.addEventListener('terminal-log', handleLog);

        return () => {
            subscription.unsubscribe();
            // @ts-ignore
            window.removeEventListener('terminal-log', handleLog);
        }
    });

    function handleBootComplete() {
        isBooting = false;
        terminalStore.clear();
        showNeofetch();
        tick().then(() => inputRef?.focus());
    }

    /**
     * @param {string | null} text
     * @param {string} [type]
     */
    function print(text, type = 'text') {
        terminalStore.add(text, type);
    }

    function showNeofetch() {
        terminalStore.add(null, 'neofetch');
    }

    /** @param {string} cmdStr */
    async function execute(cmdStr) {
        if (!cmdStr.trim()) return;

        commandHistory.push(cmdStr);
        historyIndex = commandHistory.length;

        const parts = cmdStr.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        print(`${user}@lukios:${currentPath}$ ${cmdStr}`, 'user');

        switch (cmd) {
            case 'help':
                print('LukiOS Shell, version 5.2.15(1)-release (x86_64-pc-linux-gnu)', 'info');
                print('These shell commands are defined internally. Type `help\' to see this list.', 'info');
                print('', 'info');
                print('  cat [FILE]             Dump file contents.', 'info');
                print('  cd [DIR]               Change directory.', 'info');
                print('  clear                  Wipe screen and show system info.', 'info');
                print('  echo [TEXT]            Repeat words back to me.', 'info');
                print('  exit                   Terminate session.', 'info');
                print('  help                   Display this list.', 'info');
                print('  login [USR] [PWD]      Authenticate.', 'info');
                print('  ls [DIR]               List directory contents.', 'info');
                print('  man [CMD]              Read manual.', 'info');
                print('  neofetch               Display system specs.', 'info');
                print('  nix-shell              Enter a pure shell (mock).', 'info');
                print('  nixos-rebuild          Rebuild system (mock).', 'info');
                print('  open [APP]             Launch subsystem.', 'info');
                print('  rm [FILE]              Delete a file.', 'info');
                print('  sudo admin             Demand higher privileges.', 'info');
                print('  top                    Monitor processes.', 'info');
                print('  uname -a               System info.', 'info');
                print('  whoami                 Current user ID.', 'info');
                break;

            case 'clear':
                terminalStore.clear();
                showNeofetch();
                break;

            case 'apt':
            case 'apt-get':
            case 'yum':
            case 'pacman':
            case 'dnf':
                print(`error: '${cmd}' is not found. This is NixOS. We use 'nix-shell' or we suffer in the purity of our declarative derivations. Please read a book.`, 'error');
                break;

            case 'nix-shell':
                print('entering pure shell... (just kidding, you exist in the void)', 'info');
                break;

            case 'nixos-rebuild':
                if (args[0] === 'switch') {
                     print('building Nix... error: infinite recursion encountered at "meaning_of_life"', 'error');
                } else {
                     print('usage: nixos-rebuild switch', 'info');
                }
                break;

            case 'coffee':
                print('error: Coffee pot is empty. Please leverage cross-functional resources to refill.', 'error');
                break;

            case 'uname':
                const now = new Date();
                print(`Linux LukiOS 6.1.72-nixos #1-NixOS SMP PREEMPT_DYNAMIC ${now.toUTCString()} x86_64 GNU/Linux`, 'info');
                break;

            case 'neofetch':
                showNeofetch();
                break;

            case 'echo':
                print(args.join(' '));
                break;

            case 'whoami':
                print(user);
                break;

            case 'history':
                commandHistory.forEach((c, i) => print(`  ${i+1}  ${c}`, 'info'));
                break;

            case 'ls':
                if (currentPath === '~/') {
                    print('readme.txt  projects/  system/', 'info');
                } else {
                    print('Total 0', 'info');
                }
                break;

            case 'cat':
                if (args[0] === 'readme.txt') {
                    // @ts-ignore
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
                /** @type {Record<string, {id: string, origin: string}>} */
                const apps = {
                    'vault': { id: 'c-tr', origin: 'tr', title: 'ARCHIVE_VAULT' },
                    'guestbook': { id: 'admin-guestbook', origin: 'bc', title: 'GUESTBOOK_MOD' },
                    'portal': { id: 'c-br', origin: 'br', title: 'LINK_PORTAL' },
                    'playlist': { id: 'c-bl', origin: 'bl', title: 'AUDIO_STATION' },
                    'identity': { id: 'c-tl', origin: 'tl', title: 'USER_IDENTITY' }
                };

                if (apps[app]) {
                    print(`Launching ${app}...`, 'success');
                    windowManager.toggle(apps[app].id, { originType: apps[app].origin, title: apps[app].title });
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
                         // Fix: pass width/height inside originRect or correctly as per logic
                         // windowManager.open(id, options) -> options can be originRect
                         windowManager.open('control-center', { isTiled: false, width: 900, height: 600, originType: 'bc', title: 'SYSTEM_CONTROL' });
                     }
                } else {
                    print('error: Incorrect password.', 'error');
                }
                break;

            case 'man':
                 print(`No manual entry for ${args[0] || 'life'}`, 'error');
                 break;

            case 'top':
                 print('PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND', 'info');
                 print('  1 root      20   0   12.4g   1.2g   0.4g R  12.0  64.0   4d12h systemd (tired)', 'info');
                 print(' 42 guest     20   0    2.1g   0.4g   0.1g S   2.0   5.0   0:00.01 bash', 'info');
                 break;

            case 'rm':
                if (args[0] === '-rf' && args[1] === '/') {
                    print('nice try.', 'error');
                } else {
                    print(`rm: cannot remove '${args[0]}': Permission denied (and emotional attachment)`, 'error');
                }
                break;

            case 'exit':
                windowManager.close('terminal');
                break;

            default:
                print(`${cmd}: command not found`, 'error');
        }

        inputVal = '';
    }

    /** @param {KeyboardEvent} e */
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
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleTabCompletion();
        }
    }

    function handleTabCompletion() {
        if (!inputVal) return;
        const parts = inputVal.split(' ');
        const currentWord = parts[parts.length - 1];
        if (!currentWord) return;

        if (parts.length === 1) {
            const matches = commands.filter(c => c.startsWith(currentWord));
            if (matches.length === 1) {
                inputVal = matches[0] + ' ';
            }
        } else if (parts.length > 1) {
             const files = ['readme.txt', 'projects/', 'system/'];
             const matches = files.filter(f => f.startsWith(currentWord));
             if (matches.length === 1) {
                 parts[parts.length - 1] = matches[0];
                 inputVal = parts.join(' ');
             }
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="h-full bg-transparent font-mono text-sm p-2 flex flex-col overflow-hidden" onclick={() => inputRef?.focus()}>
    {#if isBooting}
        <TerminalBoot on:complete={handleBootComplete} />
    {:else}
        <div id="terminal-scroll" class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {#each terminalStore.history as line}
                {#if line.type === 'neofetch'}
                    <TerminalNeofetch />
                {:else}
                    <div class:text-green-500={line.type === 'info'}
                         class:text-white={line.type === 'user'}
                         class:text-red-500={line.type === 'error'}
                         class:text-yellow-400={line.type === 'warn'}
                         class:text-blue-400={line.type === 'success'}
                         class="whitespace-pre-wrap leading-tight selectable-text select-text">
                         {#if line.type === 'user'}
                            <span class="opacity-50 mr-2">➜</span>
                         {/if}
                         {line.text}
                    </div>
                {/if}
            {/each}

            <div class="flex items-center text-gray-300 mt-2">
                <span class="text-green-500 mr-2 shrink-0">{user}@lukios:{currentPath}$</span>
                <input
                    bind:this={inputRef}
                    type="text"
                    bind:value={inputVal}
                    onkeydown={handleKeydown}
                    class="bg-transparent border-none outline-none flex-1 text-white caret-white min-w-0"
                    spellcheck="false"
                    autocomplete="off"
                />
            </div>
        </div>
    {/if}
</div>
