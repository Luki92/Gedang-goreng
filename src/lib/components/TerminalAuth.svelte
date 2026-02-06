<script>
    import { onMount, tick } from 'svelte';
    import { isAdmin, openWindow, focusWindow, windows } from '$lib/stores';
    import { get } from 'svelte/store';

    // --- Configuration ---
    // Hashed Password for Security (SHA-256 of "GHOST_PROTOCOL")
    // This prevents plain-text leakage in client source.
    const PASS_HASH = "37ebb774d08a7820a717193b4a999c08749983fc092d4d965db39e5b3d936645";

    let visible = $state(false);
    let inputLine = $state('');
    let outputLog = $state(['> INITIALIZING SECURE SHELL...', '> WAITING FOR AUTHENTICATION...']);
    let cursorVisible = $state(true);
    let inputRef;
    let contentRef; // For auto-scroll

    // --- Window State (Draggable/Resizable) ---
    // Start centered-ish
    let x = $state(100);
    let y = $state(100);
    let w = $state(600);
    let h = $state(400);

    let dragging = false;
    let resizing = false;
    let dragOffX = 0, dragOffY = 0;
    let resizeDir = '';

    function openAdminPanel() {
        // Check if exists
        const exists = get(windows).find(w => w.id === 'admin-panel');
        if (exists) {
            focusWindow('admin-panel');
        } else {
             openWindow({
                 id: 'admin-panel',
                 title: 'ADMIN_CONTROL_PANEL',
                 origin: 'center',
                 x: 0, y: 0, w: 700, h: 500,
             });
        }
    }

    function handleGlobalKeydown(e) {
        if (e.shiftKey && e.key === 'L') {
            e.preventDefault();

            // If already authenticated, just toggle the panel
            if ($isAdmin) {
                openAdminPanel();
                return;
            }

            visible = !visible;
            if (visible) {
                // Center on open if not set
                if (typeof window !== 'undefined') {
                    x = (window.innerWidth - w) / 2;
                    y = (window.innerHeight - h) / 2;
                }
                inputLine = '';
                outputLog = ['> INITIALIZING SECURE SHELL...', '> WAITING FOR AUTHENTICATION...'];
                setTimeout(() => {
                    inputRef?.focus();
                    scrollToBottom();
                }, 100);
            }
        }
        if (visible && e.key === 'Escape') {
            visible = false;
        }
    }

    async function scrollToBottom() {
        await tick();
        if (contentRef) {
            contentRef.scrollTop = contentRef.scrollHeight;
        }
    }

    const DENIALS = [
        "ACCESS DENIED.",
        "NICE TRY, KID.",
        "YOUR IP HAS BEEN FLAGGED.",
        "INSUFFICIENT CLEARANCE.",
        "ARE YOU LOST?",
        "ERROR: PEBCAK DETECTED.",
        "SECURITY ALERT TRIGGERED."
    ];

    async function verify(text) {
        const enc = new TextEncoder();
        const data = enc.encode(text);
        const hash = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex === PASS_HASH;
    }

    async function handleCommand(e) {
        if (e.key === 'Enter') {
            const cmd = inputLine.trim();
            outputLog = [...outputLog, `> ${cmd.replace(/./g, '*')}`]; // Mask input in log for security
            inputLine = '';
            await scrollToBottom();

            const isValid = await verify(cmd);

            if (isValid) {
                // Drama Sequence
                const steps = [
                    "VERIFYING HASH...",
                    "BYPASSING FIREWALL...",
                    "DECRYPTING KEY...",
                    "ESTABLISHING SECURE LINK...",
                    "ACCESS GRANTED."
                ];

                for (const step of steps) {
                    await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
                    outputLog = [...outputLog, `> ${step}`];
                    await scrollToBottom();
                }

                await new Promise(r => setTimeout(r, 800));
                $isAdmin = true;
                outputLog = [...outputLog, '> ADMIN MODE: ACTIVE'];
                await scrollToBottom();
                await new Promise(r => setTimeout(r, 1000));
                visible = false;
                openAdminPanel();

            } else if (cmd === 'EXIT') {
                visible = false;
            } else if (cmd === 'HELP') {
                 outputLog = [...outputLog, 'COMMANDS: HELP, EXIT, [PASSCODE]'];
                 outputLog = [...outputLog, 'HINT: HASH VERIFICATION ENABLED.'];
                 await scrollToBottom();
            } else {
                // Sarcastic Failure
                await new Promise(r => setTimeout(r, 300));
                const msg = DENIALS[Math.floor(Math.random() * DENIALS.length)];
                outputLog = [...outputLog, `> ${msg}`];
                await scrollToBottom();
            }
        }
    }

    // --- Interaction Logic ---
    function startDrag(e) {
        if (e.target.closest('input') || e.target.closest('.content')) return;
        dragging = true;
        dragOffX = e.clientX - x;
        dragOffY = e.clientY - y;
    }

    function startResize(e, dir) {
        resizing = true;
        resizeDir = dir;
        e.stopPropagation();
    }

    function onMouseMove(e) {
        if (dragging) {
            x = e.clientX - dragOffX;
            y = e.clientY - dragOffY;
        }
        if (resizing) {
            const minW = 300;
            const minH = 200;
            if (resizeDir.includes('e')) w = Math.max(minW, e.clientX - x);
            if (resizeDir.includes('s')) h = Math.max(minH, e.clientY - y);
            if (resizeDir.includes('w')) {
                const newW = Math.max(minW, x + w - e.clientX);
                if (newW !== w) { x = e.clientX; w = newW; }
            }
            if (resizeDir.includes('n')) {
                const newH = Math.max(minH, y + h - e.clientY);
                if (newH !== h) { y = e.clientY; h = newH; }
            }
        }
    }

    function onMouseUp() {
        dragging = false;
        resizing = false;
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

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

{#if visible}
    <div class="terminal-overlay">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="terminal-box"
            style:left="{x}px"
            style:top="{y}px"
            style:width="{w}px"
            style:height="{h}px"
            onmousedown={startDrag}
        >
            <div class="crt-scanline"></div>
            <div class="header">// SECURE_TERMINAL // V.1.0.4</div>

            <div class="content custom-scrollbar" bind:this={contentRef} onmousedown={(e) => e.stopPropagation()}>
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

            <!-- Resize Handles -->
            <div class="resize-handle n" onmousedown={(e) => startResize(e, 'n')}></div>
            <div class="resize-handle s" onmousedown={(e) => startResize(e, 's')}></div>
            <div class="resize-handle e" onmousedown={(e) => startResize(e, 'e')}></div>
            <div class="resize-handle w" onmousedown={(e) => startResize(e, 'w')}></div>
            <div class="resize-handle se" onmousedown={(e) => startResize(e, 'se')}></div>
            <div class="resize-handle sw" onmousedown={(e) => startResize(e, 'sw')}></div>
            <div class="resize-handle ne" onmousedown={(e) => startResize(e, 'ne')}></div>
            <div class="resize-handle nw" onmousedown={(e) => startResize(e, 'nw')}></div>
        </div>
    </div>
{/if}

<style>
    .terminal-overlay {
        position: fixed; inset: 0; z-index: 9999;
        /* Remove background dimming to keep it feeling like a window on top */
        pointer-events: none;
        font-family: 'VT323', monospace;
        color: #0f0;
    }
    .terminal-box {
        position: absolute;
        pointer-events: auto;
        border: 2px solid #0f0;
        background: rgba(0, 20, 0, 0.95);
        box-shadow: 0 0 20px #0f0;
        display: flex; flex-direction: column;
        overflow: hidden;
    }

    .header {
        background: #000; padding: 5px 10px;
        color: #0f0; font-size: 1rem; border-bottom: 1px solid #0f0;
        cursor: grab; flex-shrink: 0;
    }
    .header:active { cursor: grabbing; }

    .content {
        flex: 1; overflow-y: auto; padding: 1rem;
        display: flex; flex-direction: column; gap: 0.2rem;
        font-size: 1.2rem;
        cursor: text;
    }

    .input-area {
        display: flex; gap: 10px; margin-top: auto; position: relative;
    }
    .hidden-input {
        position: absolute; opacity: 0; pointer-events: none;
    }
    .cursor.hidden { opacity: 0; }

    /* CRT Effect */
    .crt-scanline {
        position: absolute; inset: 0; pointer-events: none;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
        background-size: 100% 4px;
        z-index: 10; opacity: 0.3;
    }

    /* Resize Handles */
    .resize-handle { position: absolute; z-index: 20; }
    .n { top: 0; left: 0; width: 100%; height: 5px; cursor: ns-resize; }
    .s { bottom: 0; left: 0; width: 100%; height: 5px; cursor: ns-resize; }
    .e { top: 0; right: 0; width: 5px; height: 100%; cursor: ew-resize; }
    .w { top: 0; left: 0; width: 5px; height: 100%; cursor: ew-resize; }
    .se { bottom: 0; right: 0; width: 15px; height: 15px; cursor: nwse-resize; }
    .sw { bottom: 0; left: 0; width: 15px; height: 15px; cursor: nesw-resize; }
    .ne { top: 0; right: 0; width: 15px; height: 15px; cursor: nesw-resize; }
    .nw { top: 0; left: 0; width: 15px; height: 15px; cursor: nwse-resize; }

    /* Custom Scrollbar for Terminal */
    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #001100; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #0f0; border: 1px solid #000; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3; }
</style>
