<script>
    import { onMount, tick } from 'svelte';
    import { isAdmin } from '$lib/stores';
    import { supabase } from '$lib/supabaseClient';
    import { windowManager } from '$lib/windowManager.svelte.js';
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
                'projects': { type: 'dir', children: {} },
                'system': { type: 'dir', children: {
                    'configuration.nix': { type: 'file', content: '{ config, pkgs, ... }: { system.stateVersion = "25.11"; }' },
                    'flake.nix': { type: 'file', content: '{ description = "LukiOS System Flake"; }' }
                }}
            }
        }
    };

    const commands = [
        'cat', 'cd', 'clear', 'echo', 'exit', 'grep', 'help', 'history',
        'login', 'ls', 'logout', 'man', 'neofetch', 'open', 'rm', 'sudo',
        'top', 'uname', 'whoami', 'coffee', 'nixos-rebuild', 'nix-shell'
    ];

    let commandHistory = $state([]);
    let historyIndex = $state(-1);

    onMount(() => {
        if (inputRef) inputRef.focus();

        // Boot Sequence
        if (terminalStore.history.length === 0) {
             terminalStore.boot();
        }

        if ($isAdmin) user = 'root';

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            user = session ? 'root' : 'guest';
            $isAdmin = !!session;
            if (session) {
                print(`Auth: Logged in as ${session.user.email}`, 'success');
            }
        });

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

    async function execute(cmd) {
        if (!cmd.trim()) return;

        // Add to history
        terminalStore.add(`${user}@lukios:${currentPath}$ ${cmd}`, 'user');
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;

        const args = cmd.trim().split(' ');
        const mainCmd = args.shift();

        switch (mainCmd) {
            case 'help':
                print('LukiOS Shell (Bash 5.2.15-release)', 'info');
                print('Available commands:', 'info');
                print('  nixos-rebuild switch   Apply system configuration changes.', 'info');
                print('  nix-shell [PKG]        Enter a reproduceable shell environment.', 'info');
                print('  neofetch               Display system information.', 'info');
                print('  ls, cat, cd            Standard filesystem operations.', 'info');
                print('  login, logout          Authentication management.', 'info');
                print('  open [APP]             Launch subsystem (vault, portal).', 'info');
                break;

            case 'clear':
                terminalStore.clear();
                break;

            case 'apt':
            case 'apt-get':
            case 'yum':
            case 'pacman':
            case 'dnf':
                print(`error: '${mainCmd}' command not found. This is NixOS.`, 'error');
                print(`hint: try 'nix-shell -p ${mainCmd}' or edit configuration.nix`, 'info');
                break;

            case 'nixos-rebuild':
                if (args[0] === 'switch') {
                    print('building Nix... [1/5] copying configuration', 'system');
                    await new Promise(r => setTimeout(r, 600));
                    print('building Nix... [2/5] resolving dependencies', 'system');
                    await new Promise(r => setTimeout(r, 800));
                    print('building Nix... [3/5] compiling aesthetic-module.nix', 'system');
                    await new Promise(r => setTimeout(r, 500));
                    print('building Nix... [4/5] optimizing existential dread', 'system');
                    await new Promise(r => setTimeout(r, 900));
                    print('building Nix... [5/5] activating new generation', 'system');
                    await new Promise(r => setTimeout(r, 300));
                    print('Done. System state version 25.11.', 'success');
                } else {
                    print('Usage: nixos-rebuild switch', 'error');
                }
                break;

            case 'nix-shell':
                print(`Entering nix-shell...`, 'system');
                print(`[nix-shell:${currentPath}]$ `, 'info');
                break;

            case 'neofetch':
                const neofetch = `
          .
         / \\
        |   |    ${user}@LukiOS
      . |   | .  ------------
     / \\|   |/ \\ OS: NixOS 25.11 (Caffeinated) x86_64
    |   |   |   | Host: LukiBook Pro
    |   |   |   | Kernel: 6.1.72-nixos
    |   |   |   | Uptime: 4d 12h 31m
     \\ /|   |\\ /  Packages: 1403 (nix-system), 42 (nix-user)
      . |   | .  Shell: bash 5.2.15
        |   |    Resolution: 1920x1080
         \\ /     WM: LukiWM (Svelte-based Tiling)
          '      Terminal: LukiTerm 3.0
                 Theme: Void Dark [GTK2/3]
                 CPU: Silicon Heart (12% Load)
                 Memory: 64% / 100% (Leaking)
`;
                print(neofetch, 'info');
                break;

            case 'ls':
                if (currentPath === '~/') {
                    print('readme.txt  projects/  system/', 'info');
                } else if (currentPath === '~/system/') {
                    print('configuration.nix  flake.nix', 'info');
                } else {
                    print('Total 0', 'info');
                }
                break;

            case 'cd':
                if (!args[0] || args[0] === '~') {
                    currentPath = '~/';
                } else if (args[0] === 'system') {
                    currentPath = '~/system/';
                } else if (args[0] === '..') {
                    currentPath = '~/';
                } else {
                    print(`cd: ${args[0]}: No such file or directory`, 'error');
                }
                break;

            case 'cat':
                let target = args[0];
                let content = null;
                if (currentPath === '~/' && fileSystem['~/'].children[target]) {
                    content = fileSystem['~/'].children[target].content;
                } else if (currentPath === '~/system/' && fileSystem['~/'].children['system'].children[target]) {
                    content = fileSystem['~/'].children['system'].children[target].content;
                } else if (target && target.startsWith('~/')) {
                     const parts = target.split('/');
                     if (parts[1] === 'system') content = fileSystem['~/'].children['system'].children[parts[2]]?.content;
                     else content = fileSystem['~/'].children[parts[1]]?.content;
                }

                if (content) print(content, 'info');
                else print(`cat: ${target}: No such file or directory`, 'error');
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
                    print(`Application '${app}' not found. Available: vault, portal, playlist, identity`, 'error');
                }
                break;

            case 'sudo':
                 print('sudo: permission denied (this is a portfolio, not a server)', 'error');
                 break;

            case 'exit':
                windowManager.close('terminal');
                break;

            default:
                print(`${mainCmd}: command not found`, 'error');
        }

        inputVal = '';
    }

    function formatSystemLine(text) {
        if (text.startsWith('[  OK  ]')) {
            return { prefix: '[  OK  ]', content: text.substring(8) };
        }
        return { prefix: '', content: text };
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

        if (parts.length === 1) {
            const matches = commands.filter(c => c.startsWith(currentWord));
            if (matches.length === 1) inputVal = matches[0] + ' ';
        }
    }
</script>

<div class="h-full bg-black font-mono text-sm p-2 flex flex-col overflow-hidden" onclick={() => inputRef?.focus()}>
    <div id="terminal-scroll" class="flex-1 overflow-y-auto overflow-x-auto p-2 space-y-1 custom-scrollbar">
        {#each terminalStore.history as line}
            {#if line.type === 'system' && line.text.startsWith('[  OK  ]')}
                 <div class="whitespace-pre font-mono leading-tight text-gray-300">
                    <span class="text-green-500 font-bold">[  OK  ]</span>
                    {line.text.substring(8)}
                </div>
            {:else}
                <div class:text-green-500={line.type === 'info'}
                     class:text-white={line.type === 'user'}
                     class:text-red-500={line.type === 'error'}
                     class:text-yellow-400={line.type === 'warn'}
                     class:text-blue-400={line.type === 'success'}
                     class:text-gray-300={line.type === 'system'}
                     class:font-bold={line.type === 'user'}
                     class="whitespace-pre font-mono leading-tight">
                     {#if line.type === 'user'}
                        <span class="text-green-400 mr-2">➜</span>
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
                disabled={terminalStore.booting}
                class="bg-transparent border-none outline-none flex-1 text-white caret-white min-w-0 disabled:opacity-50"
                spellcheck="false"
                autocomplete="off"
            />
        </div>
    </div>
</div>
