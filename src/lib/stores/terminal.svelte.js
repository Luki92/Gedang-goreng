import { tick } from 'svelte';

const NIX_LOGO = `
          .
         / \\
        |   |
      . |   | .
     / \\|   |/ \\
    |   |   |   |
    |   |   |   |
    |   |   |   |
     \\ /|   |\\ /
      . |   | .
        |   |
         \\ /
          '`;

const LUKIOS_TEXT = `
  _           _    _  ____  _____
 | |         | |  | |/ __ \\/ ____|
 | |   _   _ | |  | | |  | | (___
 | |  | | | || |/\\| | |  | |\\___ \\
 | |__| |_| ||  /\\  | |__| |____) |
 |_____\\__,_||\\/  \\/ \\____/|_____/
`;

class TerminalStore {
    history = $state([]);
    booting = $state(false);

    async add(text, type = 'info') {
        this.history.push({ text, type });
        if (typeof document !== 'undefined') {
            await tick();
            const el = document.getElementById('terminal-scroll');
            if (el) el.scrollTop = el.scrollHeight;
        }
    }

    clear() {
        this.history = [];
        this.printMOTD();
    }

    async boot() {
        if (this.booting) return;
        this.booting = true;
        this.history = [];

        const bootLogs = [
            "[  OK  ] Found device /dev/disk/by-uuid/nixos-root.",
            "[  OK  ] Started File System Check on /dev/disk/by-uuid/nixos-root.",
            "[  OK  ] Mounted /nix/store.",
            "[  OK  ] Started Nix Daemon.",
            "[  OK  ] Reached target Network.",
            "[  OK  ] Started WPA Supplicant.",
            "[  OK  ] Started D-Bus System Message Bus.",
            "[  OK  ] Started User Login Management.",
            "[  OK  ] Started Session c1 of user guest.",
            "[  OK  ] Started GNOME Display Manager.",
            "[  OK  ] Reached target Graphical Interface."
        ];

        for (const log of bootLogs) {
            await new Promise(r => setTimeout(r, Math.random() * 50 + 20));
            this.add(log, 'system');
        }

        await new Promise(r => setTimeout(r, 500));
        this.clear();
        this.booting = false;
    }

    printMOTD() {
        const motd = `${LUKIOS_TEXT}
${NIX_LOGO}

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

 Last login: Tue, 10 Feb 2026 13:02:54 GMT from 127.0.0.1`;

        this.add(motd, 'info');
    }
}

export const terminalStore = new TerminalStore();
