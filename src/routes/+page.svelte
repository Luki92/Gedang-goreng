<script>
    // @ts-nocheck
    import { onMount, onDestroy } from 'svelte';
    import SpaceBackground from '$lib/components/SpaceBackground.svelte';
    import LukiPersona from '$lib/components/LukiPersona.svelte';
    import HUDCorner from '$lib/components/HUDCorner.svelte';
    import Identity from '$lib/components/Identity.svelte';
    import Vault from '$lib/components/Vault.svelte';
    import Playlist from '$lib/components/Playlist.svelte';
    import Portal from '$lib/components/Portal.svelte';
    import TerminalAuth from '$lib/components/TerminalAuth.svelte';
    import AdminPanel from '$lib/components/AdminPanel.svelte';
    import TilingWindowManager from '$lib/components/TilingWindowManager.svelte';
    import FileViewer from '$lib/components/FileViewer.svelte';

    // Admin Components
    import AdminVault from '$lib/components/admin/AdminVault.svelte';
    import AdminPortal from '$lib/components/admin/AdminPortal.svelte';
    import AdminProfile from '$lib/components/admin/AdminProfile.svelte';
    import AdminPlaylist from '$lib/components/admin/AdminPlaylist.svelte';
    import AdminGuestbook from '$lib/components/admin/AdminGuestbook.svelte';

    import { windowManager } from '$lib/windowManager.svelte.js';
    import { musicState } from '$lib/stores';

    // --- Debris Logic ---
    let debrisContainer;
    const allItems = [
        { char: '<i class="ph ph-cube"></i>', id: 'cube', scale: 1 },
        { char: '<i class="ph ph-game-controller"></i>', id: 'game', scale: 1.2 },
        { char: '<i class="ph ph-floppy-disk"></i>', id: 'disk', scale: 1 },
        { char: '<i class="ph ph-alien"></i>', id: 'alien', scale: 1.2 },
        { char: '<i class="ph ph-planet"></i>', id: 'planet', scale: 1.5 },
    ];
    let actors = [];
    let mouseX = 0, mouseY = 0;

    class Actor {
        constructor(data) {
            this.element = document.createElement('div');
            this.element.innerHTML = data.char;
            this.element.className = 'debris-item';
            this.element.style.fontSize = `${2 * data.scale}rem`;
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = (Math.random() - 0.5) * 1;
            this.rotation = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 2;
            if (debrisContainer) debrisContainer.appendChild(this.element);
        }
        update(mX, mY) {
            this.x += this.vx; this.y += this.vy; this.rotation += this.rotSpeed;
            if (this.x > window.innerWidth + 50) this.x = -50;
            if (this.x < -50) this.x = window.innerWidth + 50;
            if (this.y > window.innerHeight + 50) this.y = -50;
            if (this.y < -50) this.y = window.innerHeight + 50;

            const dx = (mX - window.innerWidth/2) / window.innerWidth;
            const dy = (mY - window.innerHeight/2) / window.innerHeight;

            this.element.style.transform = `translate(${this.x + dx * -30}px, ${this.y + dy * -30}px) rotate(${this.rotation}deg)`;
        }
    }

    // --- Text Animation ---
    let welcomeContainer;
    let titleEl;

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    async function typeIntoNode(textNode, textToType, totalDuration) {
        const charDelay = totalDuration / textToType.length;
        for (let char of textToType) {
            textNode.nodeValue += char;
            await sleep(charDelay);
        }
    }

    async function deleteFromNode(textNode, count, delay) {
        for (let i = 0; i < count; i++) {
            textNode.nodeValue = textNode.nodeValue.slice(0, -1);
            await sleep(delay);
        }
    }

    // --- Lyrics Logic ---
    let lyricsContainer;
    const words = ["VIBING", "THINKING...", "LOADING ASSETS", "SYSTEM NORMAL", "ECHO", "VOID", "RENDER", "PIXEL", "DREAMING", "LUKI.SYS"];
    let lyricInterval;

    function startLyrics() {
        if (lyricInterval) return;
        lyricInterval = setInterval(() => {
            if (!lyricsContainer) return;

            // Mix in current song title if playing
            const pool = [...words];
            if ($musicState.title && $musicState.title !== 'LOFI_STATION_1') {
                pool.push($musicState.title.toUpperCase());
                pool.push($musicState.artist.toUpperCase());
            }

            const el = document.createElement('div');
            el.innerText = pool[Math.floor(Math.random() * pool.length)];
            el.className = 'lyric-float';
            el.style.left = Math.random() * 80 + 10 + '%';
            el.style.top = '100%';
            el.style.fontSize = (Math.random() * 1 + 0.8) + 'rem';
            lyricsContainer.appendChild(el);
            setTimeout(() => el.remove(), 8000);
        }, 2000);
    }

    // --- Mobile Menu ---
    let mobileMenuActive = false;
    function toggleMobileMenu() {
        mobileMenuActive = !mobileMenuActive;
        if (mobileMenuActive) document.body.classList.add('mobile-menu-active');
        else document.body.classList.remove('mobile-menu-active');
    }

    // Register Components
    if (typeof window !== 'undefined') {
        windowManager.register('c-tl', Identity);
        windowManager.register('c-tr', Vault);
        windowManager.register('c-bl', Playlist);
        windowManager.register('c-br', Portal);
        windowManager.register('file-viewer', FileViewer);

        // Admin
        windowManager.register('admin-vault', AdminVault);
        windowManager.register('admin-portal', AdminPortal);
        windowManager.register('admin-profile', AdminProfile);
        windowManager.register('admin-playlist', AdminPlaylist);
        windowManager.register('admin-guestbook', AdminGuestbook);
    }

    onMount(() => {
        // Init Debris
        actors = allItems.map(item => new Actor(item));

        const loop = () => {
             actors.forEach(obj => obj.update(mouseX, mouseY));
             requestAnimationFrame(loop);
        };
        const animFrame = requestAnimationFrame(loop);

        const mm = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
        window.addEventListener('mousemove', mm);

        // Init Text Animation
        runAnimationLoop();

        // Init Lyrics subscription
        const unsubMusic = musicState.subscribe(s => {
            if (s.isPlaying) startLyrics();
            else {
                clearInterval(lyricInterval);
                lyricInterval = null;
            }
        });

        return () => {
            cancelAnimationFrame(animFrame);
            window.removeEventListener('mousemove', mm);
            unsubMusic();
            clearInterval(lyricInterval);
            if (mobileMenuActive) document.body.classList.remove('mobile-menu-active');
        }
    });

    async function runAnimationLoop() {
        if (!welcomeContainer || !titleEl) return;

        welcomeContainer.innerHTML = 'Welcome<span class="cursor-marker cursor-active"></span>';
        let wTextNode = welcomeContainer.childNodes[0];
        let c1 = welcomeContainer.querySelector('.cursor-marker');

        titleEl.innerHTML = "";
        titleEl.className = "main-title";

        await sleep(2000);

        while (true) {
            if (!welcomeContainer) break;

            welcomeContainer.classList.add('shrunk');
            wTextNode = welcomeContainer.childNodes[0];
            const typingPromise = typeIntoNode(wTextNode, " to my", 1200);

            await sleep(100);
            titleEl.innerText = "TS";
            titleEl.classList.add('fade-in');

            await typingPromise;

            if (c1) {
                c1.classList.remove('cursor-active');
                c1.classList.add('cursor-hidden');
            }

            if (Math.random() < 0.4) {
                titleEl.innerHTML = 'TS<span class="split-cursor"></span>';
                const eggCursor = titleEl.querySelector('.split-cursor');
                const eggText = " PMO ICL🥀";

                for(let char of eggText) {
                    eggCursor.insertAdjacentText('beforebegin', char);
                    await sleep(50);
                }
                await sleep(300);

                titleEl.innerHTML = 'TS<span class="glitch-selection"> PMO ICL🥀</span><span class="split-cursor"></span>';
                await sleep(500);

                titleEl.innerHTML = 'TS<span class="split-cursor"></span>';
                await sleep(200);
            }

            titleEl.innerHTML = `
                <div class="ts-wrapper" id="ts-container">
                    <span id="ts-left" class="flex items-baseline">T<span class="split-cursor"></span></span>
                    <span id="ts-right" class="flex items-baseline">S<span class="split-cursor"></span></span>
                </div>
            `;

            await sleep(0);

            const wrapper = document.getElementById('ts-container');
            const left = document.getElementById('ts-left');
            const right = document.getElementById('ts-right');

            const word1 = "hinking";
            const word2 = "pace";
            const maxLen = Math.max(word1.length, word2.length);

            setTimeout(() => { if (wrapper) wrapper.classList.add('expanded'); }, 50);

            for (let i = 1; i <= maxLen; i++) {
                const sub1 = i <= word1.length ? word1.substring(0, i) : word1;
                const sub2 = i <= word2.length ? word2.substring(0, i) : word2;
                if (left) left.innerHTML = `T${sub1}<span class="split-cursor"></span>`;
                if (right) right.innerHTML = `S${sub2}<span class="split-cursor"></span>`;
                await sleep(80);
            }

            await sleep(500);
            titleEl.innerHTML = 'Thinking Space<span class="split-cursor"></span>';
            await sleep(5000);

            const tsText = "Thinking Space";
            for(let i=0; i<tsText.length; i++) {
                titleEl.innerHTML = tsText.substring(0, tsText.length - 1 - i) + '<span class="split-cursor"></span>';
                await sleep(20);
            }
            titleEl.innerHTML = "";
            titleEl.classList.remove('fade-in');

            if (c1) {
                c1.classList.remove('cursor-hidden');
                c1.classList.add('cursor-active');
            }

            wTextNode = welcomeContainer.childNodes[0];
            await deleteFromNode(wTextNode, " to my".length, 40);

            welcomeContainer.classList.remove('shrunk');
            await sleep(1500);
        }
    }
</script>

<SpaceBackground />

<div bind:this={debrisContainer} id="debris-layer" class="debris-container"></div>
<div bind:this={lyricsContainer} id="lyrics-layer" class="absolute inset-0 pointer-events-none overflow-hidden z-30"></div>

<TilingWindowManager />

<main class="header-container">
    <div bind:this={welcomeContainer} id="welcome-target" class="welcome-line">Welcome<span class="cursor-marker cursor-active"></span></div>
    <h1 bind:this={titleEl} id="title-target" class="main-title"></h1>
</main>

<LukiPersona />

<button id="mobile-reactor" onclick={toggleMobileMenu} style:transform={mobileMenuActive ? 'translateX(-50%) scale(0.8)' : 'translateX(-50%) scale(1)'}></button>

<HUDCorner id="c-tl" position="tl" code="> 001_SYS" headerTitle="USER_PROFILE_LUKI">
    {#snippet buttonContent()}
        <span class="label"><i class="ph ph-fingerprint"></i> IDENTITY</span>
    {/snippet}
</HUDCorner>

<HUDCorner id="c-tr" position="tr" code="> 002_VAULT" headerTitle="ARCHIVE_DATABASE">
    {#snippet buttonContent()}
        <span class="label">WORKS <i class="ph ph-safe"></i></span>
    {/snippet}
</HUDCorner>

<HUDCorner id="c-bl" position="bl" code="> 003_AUDIO" headerTitle="SONIC_EMITTER">
    {#snippet buttonContent()}
        <span class="label"><i class="ph ph-vinyl-record"></i> PLAYLIST</span>
    {/snippet}
</HUDCorner>

<HUDCorner id="c-br" position="br" code="> 004_LINK" headerTitle="COMM_CHANNELS">
    {#snippet buttonContent()}
        <span class="label">PORTAL <i class="ph ph-planet"></i></span>
    {/snippet}
</HUDCorner>

<TerminalAuth />
<AdminPanel />
