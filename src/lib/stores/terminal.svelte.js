import { tick } from 'svelte';

class TerminalStore {
    history = $state([
        { type: 'info', text: 'LukiOS v3.0.0 (tty1)' },
        { type: 'info', text: 'Type "help" for a list of commands.' }
    ]);

    add(text, type = 'info') {
        this.history.push({ text, type });
        // Auto-scroll if terminal is open
        if (typeof document !== 'undefined') {
            tick().then(() => {
                const el = document.getElementById('terminal-scroll');
                if (el) el.scrollTop = el.scrollHeight;
            });
        }
    }

    clear() {
        this.history = [];
    }
}

export const terminalStore = new TerminalStore();
