<script>
    import { onMount } from 'svelte';
    import { isAdmin } from '$lib/stores';

    let visible = $state(false);
    let inputLine = $state('');
    let outputLog = $state(['> INITIALIZING SECURE SHELL...', '> WAITING FOR AUTHENTICATION...']);
    let cursorVisible = $state(true);
    let inputRef;

    // Hardcoded secret for "Creative" Auth. In a real app, verify against server.
    // The user wants "Most creative way".
    const PASSCODE = "GHOST_PROTOCOL";

    function handleGlobalKeydown(e) {
        if (e.shiftKey && e.key === 'L') {
            e.preventDefault();
            visible = !visible;
            if (visible) {
                inputLine = '';
                outputLog = ['> INITIALIZING SECURE SHELL...', '> WAITING FOR AUTHENTICATION...'];
                setTimeout(() => inputRef?.focus(), 100);
            }
        }
        if (visible && e.key === 'Escape') {
            visible = false;
        }
    }

    async function handleCommand(e) {
        if (e.key === 'Enter') {
            const cmd = inputLine.trim();
            outputLog = [...outputLog, `> ${cmd}`];

            if (cmd === PASSCODE) {
                outputLog = [...outputLog, '> ACCESS GRANTED.', '> UPDATING PERMISSIONS...'];
                await new Promise(r => setTimeout(r, 800));
                $isAdmin = true;
                outputLog = [...outputLog, '> ADMIN MODE: ACTIVE'];
                await new Promise(r => setTimeout(r, 800));
                visible = false;
            } else if (cmd === 'EXIT') {
                visible = false;
            } else if (cmd === 'HELP') {
                 outputLog = [...outputLog, 'COMMANDS: HELP, EXIT, [PASSCODE]'];
            } else {
                outputLog = [...outputLog, '> ACCESS DENIED.', '> INVALID CREDENTIALS.'];
            }
            inputLine = '';
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleGlobalKeydown);
        const blinkInterval = setInterval(() => cursorVisible = !cursorVisible, 500);
        return () => {
            window.removeEventListener('keydown', handleGlobalKeydown);
            clearInterval(blinkInterval);
        };
    });
</script>

{#if visible}
    <div class="terminal-overlay">
        <div class="crt-scanline"></div>
        <div class="terminal-box">
            <div class="header">SECURE_TERMINAL // V.1.0.4</div>
            <div class="content">
                {#each outputLog as line}
                    <div class="line">{line}</div>
                {/each}
                <div class="input-area">
                    <span>></span>
                    <input
                        bind:this={inputRef}
                        bind:value={inputLine}
                        onkeydown={handleCommand}
                        type="text"
                        class="hidden-input"
                        spellcheck="false"
                        autocomplete="off"
                    />
                    <span class="typed-text">{inputLine}</span>
                    <span class="cursor" class:hidden={!cursorVisible}>_</span>
                </div>
            </div>
            <div class="hint">PRESS ESC TO CANCEL</div>
        </div>
    </div>
{/if}

<style>
    .terminal-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(0, 5, 0, 0.95);
        display: flex; align-items: center; justify-content: center;
        font-family: 'VT323', monospace;
        color: #0f0;
    }
    .terminal-box {
        width: 600px; height: 400px;
        border: 2px solid #0f0;
        padding: 2rem;
        position: relative;
        box-shadow: 0 0 20px #0f0;
        background: rgba(0, 20, 0, 0.9);
    }
    .header {
        position: absolute; top: -12px; left: 1rem;
        background: #000; padding: 0 10px;
        color: #0f0; font-size: 1.2rem;
    }
    .content {
        display: flex; flex-direction: column; gap: 0.5rem;
        font-size: 1.4rem; height: 100%;
    }
    .input-area {
        display: flex; gap: 10px; margin-top: auto;
    }
    .hidden-input {
        position: absolute; opacity: 0; pointer-events: none;
    }
    .cursor.hidden { opacity: 0; }
    .hint {
        position: absolute; bottom: -2rem; width: 100%; text-align: center;
        color: #050; font-size: 1rem;
    }
    /* CRT Effect */
    .crt-scanline {
        position: absolute; inset: 0; pointer-events: none;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
        background-size: 100% 2px, 3px 100%;
        z-index: 10;
    }
</style>
