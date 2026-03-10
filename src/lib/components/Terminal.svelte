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

    // Command List for Tab Completion
    const commands = [
        'cat', 'cd', 'clear', 'echo', 'exit', 'grep', 'help', 'history',
        'login', 'ls', 'logout', 'man', 'neofetch', 'open', 'rm', 'sudo',
        'top', 'uname', 'whoami', 'coffee', 'apt', 'apt-get', 'yum', 'pacman'
    ];

    let commandHistory = $state([]);
    let historyIndex = $state(-1);

    onMount(() => {
        if (inputRef) inputRef.focus();

        // Initial MOTD
        if (terminalStore.history.length <= 2) { // Only if fresh
             terminalStore.clear();
             printMOTD();
        }

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

    function printMOTD() {
        const now = new Date();
        const dateStr = now.toUTCString();
        const motd = `╔═════════════════════════════════════════════════════════════╗
║ ___       ___  ___  ___  __    ___  ________  ________      ║
║|\  \     |\  \|\  \|\  \|\  \ |\  \|\   __  \|\   ____\     ║
║\ \  \    \ \  \\  \ \  \/  /|\ \  \ \  \|\  \ \  \___|_    ║
║ \ \  \    \ \  \\  \ \   ___  \ \  \ \  \\  \ \_____  \   ║
║  \ \  \____\ \  \\  \ \  \ \  \ \  \ \  \\  \|____|\  \  ║
║   \ \_______\ \_______\ \__\ \__\ \__\ \_______\____\_\  \ ║
║    \|_______|\|_______|\|__| \|__|\|__|\|_______|\_________\║
║                                                 \|_________|║
╚═════════════════════════════════════════════════════════════╝

 Welcome to LukiOS 2.0.4-stable (NixOS 25.11 "Caffeinated")

 * Documentation:  Try 'man luck' (Manual page not found)
 * Support:        Life is suffering. Submit a ticket to the void.
 * Performance:    Aggregating existential dread for Q1 deliverables.
 * System Status:  All systems nominal. Developer status: Critical.

 System Data:
   CPU Usage:      12% (Idle, like my career goals)
   Memory Usage:   64% (Leaking memory and patience)
   Disk Usage:     89% (Mostly unread 'To-Do' lists)
   Uptime:         4 days, 12 hours, 31 minutes

 Current Strategy: Leveraging cross-functional synergy to automate
 being tired. Do not run 'rm -rf /' unless you really mean it.

 There are 42 pending security updates. None of them solve the
 underlying structural issues of the universe.

 Last login: ${dateStr} from 127.0.0.1`;

        print(motd, 'info');
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
                print('LukiOS Shell, version 5.2.15(1)-release (x86_64-pc-linux-gnu)', 'info');
                print('These shell commands are defined internally. Type `help\' to see this list.', 'info');
                print('', 'info');
                print('  cat [FILE]             Dump file contents. Useful for seeing exactly where it all went wrong.', 'info');
                print('  cd [DIR]               Change directory. Use it to navigate the labyrinth of your own folders.', 'info');
                print('  clear                  Wipe the screen of your failures. Does not work on personal history.', 'info');
                print('  echo [TEXT]            Repeat words back to me. Excellent for echoing corporate platitudes.', 'info');
                print('  exit                   Terminate the session. Return to the waking world. Life is suffering.', 'info');
                print('  grep [PATTERN]         Search for meaning in a sea of strings. Usually returns 0 results.', 'info');
                print('  help                   Display this list. For when you inevitably lose the plot.', 'info');
                print('  history                A chronological list of every mistake you have made this session.', 'info');
                print('  login [USR] [PWD]      Attempt to gain entry. Security is just a vibe we maintain for legal.', 'info');
                print('  ls [DIR]               List directory contents. If it is empty, it is probably a metaphor.', 'info');
                print('  logout                 Destroy session tokens. Go back to being a guest in your own house.', 'info');
                print('  man [CMD]              Read the manual. It is long, dry, and provides no actual comfort.', 'info');
                print('  neofetch               Display system specs. Essential for proving you actually use NixOS.', 'info');
                print('  open [APP]             Launch subsystem (vault, portal). High latency, questionable ROI.', 'info');
                print('  rm [FILE]              Delete a file. Finally, a way to actually get rid of something.', 'info');
                print('  sudo admin             Demand higher privileges. Results vary based on caffeine levels.', 'info');
                print('  top                    Monitor processes. Mostly just watching the CPU struggle to exist.', 'info');
                print('  uname -a               Confirm that yes, we are still running on a NixOS derivation.', 'info');
                print('  whoami                 Print current user ID. Useful for identity crises during late-night builds.', 'info');
                break;

            case 'clear':
                terminalStore.clear();
                break;

            case 'apt':
            case 'apt-get':
            case 'yum':
            case 'pacman':
            case 'dnf':
                print(`error: '${cmd}' is not found. This is NixOS. We use 'nix-shell' or we suffer in the purity of our declarative derivations. Please read a book. Nor that would actually do anything...`, 'error');
                break;

            case 'coffee':
                print('error: Coffee pot is empty. Please leverage cross-functional resources to refill.', 'error');
                break;

            case 'uname':
                const now = new Date();
                print(`Linux LukiOS 6.1.72-nixos #1-NixOS SMP PREEMPT_DYNAMIC ${now.toUTCString()} x86_64 GNU/Linux`, 'info');
                break;

            case 'neofetch':
                const neofetch = `
       .  .
      |  |
  ___|  |___
 /          \   ${user}@LukiOS
|  --.  .--  |  ----------
|   |    |   |  OS: NixOS 25.11 (Caffeinated) x86_64
|   |    |   |  Kernel: 6.1.72-nixos
 \  |    |  /   Uptime: 4d 12h 31m
  \ |    | /    Shell: bash 5.2.15
   \|____|/     Resolution: 1920x1080
                DE: TWM (Svelte-based)
                WM: LukiWM
                Theme: Void Dark [GTK2/3]
                Icons: Phosphor [GTK2/3]
                Terminal: LukiTerm 3.0.0
                CPU: Silicon Heart (12% Load)
                Memory: 64% / 100% (Leaking)
`;
                print(neofetch, 'info');
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
                    print('error: Incorrect password. This incident will be reported to the Bureau of Lukian Oversight.', 'error');
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

        // Command completion (if first word)
        if (parts.length === 1) {
            const matches = commands.filter(c => c.startsWith(currentWord));
            if (matches.length === 1) {
                inputVal = matches[0] + ' ';
            }
        }

        // File completion (simple mock)
        if (parts.length > 1) {
             const files = ['readme.txt', 'projects/', 'system/'];
             const matches = files.filter(f => f.startsWith(currentWord));
             if (matches.length === 1) {
                 parts[parts.length - 1] = matches[0];
                 inputVal = parts.join(' ');
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
                 class:text-blue-400={line.type === 'success'}
                 class="whitespace-pre-wrap leading-tight selectable-text select-text">
                 {#if line.type === 'user'}
                    <span class="opacity-50 mr-2">➜</span>
                 {/if}
                 {line.text}
            </div>
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
</div>
