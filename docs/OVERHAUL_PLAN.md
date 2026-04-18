# THINKING SPACE — COMPLETE OVERHAUL SPECIFICATION

> **Document Type:** Implementation Plan  
> **Version:** 1.0  
> **Created:** 2026-04-17  
> **Status:** APPROVED  
> **Owner:** Luki  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Phase 0 — Pre-Flight](#3-phase-0--pre-flight)
4. [Phase 1 — Immediate Polish](#4-phase-1--immediate-polish-1-4-days)
5. [Phase 2 — Short-Term Redesign](#5-phase-2--short-term-redesign-2-3-weeks)
6. [Phase 3 — Long-Term Cinematic Overhaul](#6-phase-3--long-term-cinematic-overhaul-4-8-weeks)
7. [Deployment & Update Strategy](#7-deployment--update-strategy)
8. [Risk Register](#8-risk-register)
9. [Dependency Changelog](#9-dependency-changelog)
10. [Appendix A — File Inventory](#appendix-a--file-inventory)
11. [Appendix B — Visitor Mode Content Matrix](#appendix-b--visitor-mode-content-matrix)
12. [Appendix C — Performance Budget](#appendix-c--performance-budget)

---

## 1. Executive Summary

### What We're Building

Transform Gedang-goreng from a functional portfolio page into a **cinematic, identity-driven web experience** that:

- Delivers a professional, content-first surface for hirers
- Reveals a personal, playful depth for friends and curious visitors
- Feels modern, polished, and genuinely impressive across all devices and operating systems
- Runs efficiently on low-end hardware without sacrificing visual quality on high-end machines

### Guiding Principles

| # | Principle | Meaning |
|---|-----------|---------|
| 1 | **The site IS the portfolio** | Every interaction — the window system, the animations, the persona — proves technical competence. No badges needed. |
| 2 | **Professional on arrival, personal on exploration** | Hirers get what they need in 10 seconds. Friends discover depth over 10 minutes. |
| 3 | **No hacky aesthetics** | Monospace fonts stay in the terminal. Clean sans-serif everywhere else. System codes become human words. |
| 4 | **Motion with purpose** | Every animation serves a narrative: arrival, discovery, connection. No animation for decoration's sake. |
| 5 | **Graceful degradation** | Every feature has a fallback. No device gets a broken experience. Low-end gets a simpler but complete version. |

### What DOESN'T Change

- **Framework:** SvelteKit (Svelte 5 Runes)
- **Styling engine:** TailwindCSS v4 + custom CSS
- **Database:** Supabase (PostgreSQL + RLS)
- **Deployment:** Vercel via `@sveltejs/adapter-vercel`
- **3D engine:** Three.js via Threlte
- **Admin system:** Existing editor, control center, terminal auth — all untouched

---

## 2. Architecture Overview

### Current Component Tree

```
+page.svelte (root)
├── SpaceBackground.svelte
│   └── Scene.svelte (Threlte Canvas + 2000 particles)
├── Debris Layer (DOM, 5 icon actors)
├── Lyrics Layer (DOM, floating text)
├── TilingWindowManager.svelte
│   └── WindowFrame.svelte (per window)
│       └── [Identity | Vault | Playlist | Portal | Terminal | Admin*]
├── WindowDock.svelte (minimized tray)
├── LukiPersona.svelte (OC avatar, bottom-right)
├── HUDCorner.svelte ×4 (corner buttons)
└── Mobile Reactor (unused button)
```

### Target Component Tree (Post-Overhaul)

```
+page.svelte (root)
├── LoadingGate.svelte ─────────────────── [NEW] Phase 3.1
│   ├── IntroScene.svelte ──────────────── [NEW] New visitor greeting
│   ├── ReturnGreeting.svelte ──────────── [NEW] Returning visitor
│   └── LoadingBar.svelte ───────────────  [NEW] Asset progress
├── BigBang.svelte ─────────────────────── [NEW] Phase 3.2
├── SpaceBackground.svelte ──────────────  [MODIFIED] Bloom, scroll-zoom
│   └── Scene.svelte ────────────────────  [MODIFIED] Shader particles, momentum
├── IdeaNodes.svelte ────────────────────  [NEW] Phase 3.3, replaces debris
├── NeuralThreads.svelte ──────────────── [NEW] Phase 2.1, corner-to-center lines
├── TilingWindowManager.svelte ─────────── [UNCHANGED]
│   └── WindowFrame.svelte ────────────── [MODIFIED] OS-adaptive chrome, glass++
│       └── [Identity | Vault | Playlist | Portal | ...] ── [MODIFIED] redesigned
├── WindowDock.svelte ─────────────────── [UNCHANGED]
├── LukiPersona.svelte ───────────────── [MODIFIED] Entry animation, mode-aware
├── HUDCorner.svelte ×4 ──────────────── [MODIFIED] Heartbeat, labels, connected
├── MobileShell.svelte ────────────────── [NEW] Phase 3.4
│   └── BottomSheet.svelte ────────────── [NEW] Drawer for mobile windows
└── (Mobile Reactor — REMOVED)

New Stores:
├── visitor.svelte.js ─────────────────── [NEW] Mode, returning, referrer
└── platform.svelte.js ────────────────── [NEW] OS theme, device tier
```

---

## 3. Phase 0 — Pre-Flight

> Do these BEFORE touching source code.

### 0.1 — Install New Dependencies

```bash
npm install gsap
```

No other dependencies are needed for Phase 1 and 2. Phase 3 may add `postprocessing` for Three.js bloom — install it only when you reach that phase.

### 0.2 — Add Google Font

In `src/app.css`, update the font import to include Inter:

```css
/* EXISTING (keep it): */
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital@1&family=VT323&display=swap');

/* ADD this second import: */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

Update `:root` to define the typography system:

```css
:root {
    /* ... existing vars ... */
    --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'Space Mono', monospace;
    --font-display: 'VT323', monospace;
}
```

### 0.3 — Create Branch

```bash
git checkout -b overhaul/phase-1
```

Every phase gets its own feature branch. Merge to `main` only after local testing passes. Vercel auto-deploys `main`.

---

## 4. Phase 1 — Immediate Polish (1–4 Days)

> Small, high-impact fixes. No new components. No structural changes.  
> **Branch:** `overhaul/phase-1`

---

### TASK 1.1 — Rename HUD Button Labels

**Priority:** P0 — Do first  
**Effort:** 30 minutes  
**Risk:** None

#### Problem

Current labels require decoding. `> 001_SYS` / `IDENTITY` tells a visitor nothing. A first-time visitor must guess what each corner does.

#### Changes

**File:** `src/routes/+page.svelte` — Lines 265–284

Replace every `<HUDCorner>` instance:

```svelte
<!-- TOP-LEFT: was "IDENTITY" -->
<HUDCorner id="c-tl" position="tl" code="who I am" headerTitle="ABOUT_ME">
    {#snippet buttonContent()}
        <span class="label"><i class="ph-fill ph-user-focus"></i> ABOUT ME</span>
    {/snippet}
</HUDCorner>

<!-- TOP-RIGHT: was "WORKS" -->
<HUDCorner id="c-tr" position="tr" code="what I've made" headerTitle="PORTFOLIO">
    {#snippet buttonContent()}
        <span class="label">PORTFOLIO <i class="ph-fill ph-archive-tray"></i></span>
    {/snippet}
</HUDCorner>

<!-- BOTTOM-LEFT: was "PLAYLIST" -->
<HUDCorner id="c-bl" position="bl" code="what I hear" headerTitle="LISTENING">
    {#snippet buttonContent()}
        <span class="label"><i class="ph-fill ph-music-notes"></i> LISTENING</span>
    {/snippet}
</HUDCorner>

<!-- BOTTOM-RIGHT: was "PORTAL" -->
<HUDCorner id="c-br" position="br" code="where to find me" headerTitle="CONNECT">
    {#snippet buttonContent()}
        <span class="label">CONNECT <i class="ph-fill ph-globe-hemisphere-east"></i></span>
    {/snippet}
</HUDCorner>
```

#### Also update `windowManager.svelte.js` icon map labels

No code change needed — the icon map uses IDs (`c-tl`, `c-tr`, etc.), not display names.

#### Verification

- Load the page → four corners should show new labels
- Click each corner → window title bar should show new `headerTitle`

---

### TASK 1.2 — Fix Guestbook HTML Bug

**Priority:** P0 — This is a broken input field  
**Effort:** 5 minutes  
**Risk:** None

#### Problem

`src/lib/components/Guestbook.svelte` line 81–88 has a `<label>` followed by raw HTML attributes without an `<input` opening tag.

#### Change

**File:** `src/lib/components/Guestbook.svelte` — Lines 80–88

Replace:

```svelte
<div class="mb-2">
    <label for="callsign-input" class="block text-[10px] text-gray-500 mb-1">IDENTITY_SIGNATURE</label>
        type="text"
        bind:value={name}
        disabled={hasSigned}
        id="callsign-input" placeholder="CALLSIGN"
        maxlength="20"
        class="w-full bg-transparent border border-white/10 rounded-lg text-green-400 p-2 font-mono focus:border-green-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    >
</div>
```

With:

```svelte
<div class="mb-2">
    <label for="callsign-input" class="block text-[10px] text-gray-500 mb-1">IDENTITY_SIGNATURE</label>
    <input
        type="text"
        bind:value={name}
        disabled={hasSigned}
        id="callsign-input"
        placeholder="CALLSIGN"
        maxlength="20"
        class="w-full bg-transparent border border-white/10 rounded-lg text-green-400 p-2 font-mono focus:border-green-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    />
</div>
```

#### Verification

- Open the Connect window → Guestbook section → the name input should be visible and functional

---

### TASK 1.3 — Increase Window Control Hit Targets

**Priority:** P1  
**Effort:** 30 minutes  
**Risk:** Low — visual change only

#### Problem

macOS traffic-light dots are 12×12px. Apple's HIG specifies a minimum 44×44pt touch target. Even for mouse users, 12px is frustratingly small.

#### Change

**File:** `src/lib/components/WindowFrame.svelte` — style block, `.control-dot` rule

Replace:

```css
.control-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: filter 0.2s;
    padding: 0;
}
```

With:

```css
.control-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: filter 0.2s, transform 0.15s;
    padding: 0;
    position: relative;
}

/* Invisible hit zone — 32px on desktop, 44px on touch */
.control-dot::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
}

@media (pointer: coarse) {
    .control-dot::before {
        width: 44px;
        height: 44px;
    }
}
```

Also add an active feedback press:

```css
.control-dot:active {
    transform: scale(0.85);
}
```

#### Verification

- Hover near (but not directly on) a dot → cursor should change to pointer
- Click the expanded zone → button should fire
- On touch device: tap anywhere within ~22px of dot center → should register

---

### TASK 1.4 — Improve Debris Parallax Depth

**Priority:** P2  
**Effort:** 1 hour  
**Risk:** Low

#### Problem

All debris items respond to mouse with the same parallax factor (`dx * -30`). Everything feels flat — like a sticker on glass.

#### Change

**File:** `src/routes/+page.svelte` — `Actor` class, lines 46–71

Add a `depth` property so each icon has a different parallax multiplier:

```javascript
class Actor {
    constructor(data, index) {
        // ... existing setup ...
        this.depth = 0.3 + Math.random() * 0.7; // 0.3 = far, 1.0 = near
        this.element.style.opacity = (0.3 + this.depth * 0.5).toString();
        this.element.style.fontSize = `${2 * data.scale * this.depth}rem`;
    }
    update(mX, mY) {
        this.x += this.vx * this.depth;
        this.y += this.vy * this.depth;
        // ... existing wrapping logic ...
        const dx = (mX - window.innerWidth / 2) / window.innerWidth;
        const dy = (mY - window.innerHeight / 2) / window.innerHeight;
        const parallax = this.depth * -50; // depth-scaled parallax
        this.element.style.transform =
            `translate(${this.x + dx * parallax}px, ${this.y + dy * parallax}px) rotate(${this.rotation}deg)`;
    }
}
```

"Near" items (depth ~1.0): large, bright, move a lot with the mouse.  
"Far" items (depth ~0.3): small, dim, barely move.  
This creates genuine spatial depth without changing any HTML.

#### Verification

- Move mouse slowly → closer items should move noticeably more than distant ones
- The visual impression should be "layers" rather than a flat plane

---

### Phase 1 Merge Checklist

```
[ ] All four tasks complete
[ ] npm run build succeeds
[ ] No console errors in dev server
[ ] Guestbook input works
[ ] Corner labels display correctly
[ ] Window dots are clickable within expanded zone
[ ] Debris has visible depth separation
```

After all checks pass:

```bash
git add -A
git commit -m "phase-1: polish — rename labels, fix guestbook, hit targets, depth parallax"
git checkout main
git merge overhaul/phase-1
git push origin main       # triggers Vercel deploy
git branch -d overhaul/phase-1
```

---

## 5. Phase 2 — Short-Term Redesign (2–3 Weeks)

> Structural changes to the HUD corners, window chrome, and content layout.  
> **Branch:** `overhaul/phase-2`

---

### TASK 2.1 — HUD Corner Complete Redesign

**Priority:** P0 — This is the main interaction surface  
**Effort:** 3–5 days  
**Risk:** Medium — touches global CSS + animation logic + a new component

This task replaces three things:
1. The "breathe" pulse cycle → **sequential clockwise heartbeat**
2. The L-bracket `::before` → **thin corner hairline**
3. The gradient line `::after` → **neural thread line to center**

---

#### SUB-TASK 2.1.1 — Sequential Clockwise Heartbeat

**Problem:** The current `$effect` in `HUDCorner.svelte` runs `requestAnimationFrame` every frame and checks `Date.now() % 8000`. This is expensive and the animation itself (top pair → bottom pair) is not intuitive.

**Solution:** CSS-only heartbeat animation with JS-controlled class toggles.

**File:** `src/app.css` — Replace the existing `@keyframes btn-breathe` and all `.hud-corner` / `.hud-btn` animation rules (lines 121–196) with:

```css
/* ── HUD HEARTBEAT SYSTEM ── */
@keyframes hud-heartbeat {
    0%   { transform: scale(1); opacity: 0.4; }
    12%  { transform: scale(1.08); opacity: 1; filter: drop-shadow(0 0 12px rgba(255,255,255,0.3)); }
    24%  { transform: scale(1); opacity: 0.6; }
    36%  { transform: scale(1.05); opacity: 0.9; filter: drop-shadow(0 0 8px rgba(255,255,255,0.15)); }
    50%  { transform: scale(1); opacity: 0.4; }
    100% { transform: scale(1); opacity: 0.4; }
}

.hud-btn {
    /* ... keep existing layout properties ... */
    opacity: 0.4;
    transition: opacity 0.3s, color 0.3s, transform 0.3s;
}

.hud-btn:hover {
    opacity: 1;
    color: #fff;
}

/* Heartbeat runs only when .heartbeat-active is set on the corner */
.hud-corner.heartbeat-active .hud-btn {
    animation: hud-heartbeat 2.4s ease-in-out;
    animation-fill-mode: both;
}

/* Stagger per corner — each corner pulses 600ms apart */
.tl.heartbeat-active .hud-btn { animation-delay: 0s; }
.tr.heartbeat-active .hud-btn { animation-delay: 0.6s; }
.br.heartbeat-active .hud-btn { animation-delay: 1.2s; }
.bl.heartbeat-active .hud-btn { animation-delay: 1.8s; }
```

**File:** `src/lib/components/HUDCorner.svelte` — Replace the `$effect` block (lines 12–36) with:

```svelte
<script>
    import { windowManager } from '$lib/windowManager.svelte.js';

    let { id, position, code, buttonContent, headerTitle } = $props();
    let containerEl;

    let isActive = $derived(windowManager.windows.some(w => w.id === id));

    // Heartbeat: active ONLY when zero windows are open
    let heartbeatActive = $derived(
        windowManager.windows.filter(w => w.state !== 'closing').length === 0
    );

    // ... keep existing handleClick function unchanged ...
</script>

<div
    id={id}
    class="hud-corner {position}"
    class:active={isActive}
    class:heartbeat-active={heartbeatActive}
    bind:this={containerEl}
>
    <!-- ... rest unchanged ... -->
</div>
```

**Key behavior:**
- When no windows are open → all four corners receive `.heartbeat-active` → CSS animation plays with staggered delays (TL→TR→BR→BL clockwise)
- When ANY window opens → class removed → animation stops immediately and does not resume until all windows close
- No `requestAnimationFrame` loop — pure CSS + reactive class toggle

---

#### SUB-TASK 2.1.2 — Replace L-Bracket with Corner Hairline

**File:** `src/app.css` — Replace `.hud-corner::before` rules (lines 156–176)

```css
/* Previous L-bracket: REMOVE the entire .hud-corner::before block */
/* Replace with: */

.hud-corner::before {
    content: '';
    position: absolute;
    pointer-events: none;
    z-index: 1;
    transition: opacity 0.6s ease, width 0.4s ease, height 0.4s ease;
}

/* Each corner gets two hairlines forming a right angle */
.hud-corner::after {
    content: '';
    position: absolute;
    pointer-events: none;
    z-index: 1;
    transition: opacity 0.6s ease, width 0.4s ease, height 0.4s ease;
}

/* TOP-LEFT */
.tl::before { top: 0; left: 0; width: 24px; height: 1px; background: rgba(255,255,255,0.06); }
.tl::after  { top: 0; left: 0; width: 1px; height: 24px; background: rgba(255,255,255,0.06); }

/* TOP-RIGHT */
.tr::before { top: 0; right: 0; width: 24px; height: 1px; background: rgba(255,255,255,0.06); }
.tr::after  { top: 0; right: 0; width: 1px; height: 24px; background: rgba(255,255,255,0.06); }

/* BOTTOM-LEFT */
.bl::before { bottom: 0; left: 0; width: 24px; height: 1px; background: rgba(255,255,255,0.06); }
.bl::after  { bottom: 0; left: 0; width: 1px; height: 24px; background: rgba(255,255,255,0.06); }

/* BOTTOM-RIGHT */
.br::before { bottom: 0; right: 0; width: 24px; height: 1px; background: rgba(255,255,255,0.06); }
.br::after  { bottom: 0; right: 0; width: 1px; height: 24px; background: rgba(255,255,255,0.06); }

/* On hover: extend + glow */
.hud-corner:has(.hud-btn:hover)::before,
.hud-corner:has(.hud-btn:hover)::after {
    opacity: 1;
    background: rgba(255,255,255,0.2);
}
.hud-corner:has(.hud-btn:hover)::before { width: 40px; }
.hud-corner:has(.hud-btn:hover)::after  { height: 40px; }

/* During heartbeat: subtle glow sync */
.hud-corner.heartbeat-active::before,
.hud-corner.heartbeat-active::after {
    animation: hairline-glow 2.4s ease-in-out;
}
.tl.heartbeat-active::before, .tl.heartbeat-active::after { animation-delay: 0s; }
.tr.heartbeat-active::before, .tr.heartbeat-active::after { animation-delay: 0.6s; }
.br.heartbeat-active::before, .br.heartbeat-active::after { animation-delay: 1.2s; }
.bl.heartbeat-active::before, .bl.heartbeat-active::after { animation-delay: 1.8s; }

@keyframes hairline-glow {
    0%   { opacity: 0.1; }
    15%  { opacity: 0.4; background: rgba(167, 139, 250, 0.3); }
    50%  { opacity: 0.1; }
    100% { opacity: 0.1; }
}
```

---

#### SUB-TASK 2.1.3 — Neural Thread Lines (Corner-to-Center)

**Create:** `src/lib/components/NeuralThreads.svelte`

This component renders four thin lines connecting each HUD corner to the viewport center. They act as visual "synapses" that light up when corners are interacted with.

```svelte
<script>
    import { windowManager } from '$lib/windowManager.svelte.js';
    import { onMount } from 'svelte';

    let threads = $state([]);
    let center = $state({ x: 0, y: 0 });

    // Which corners have open windows
    let openCorners = $derived(
        new Set(windowManager.windows
            .filter(w => w.state !== 'closing' && !w.minimized)
            .map(w => w.originType)
            .filter(Boolean)
        )
    );

    let allOpen = $derived(openCorners.size >= 4);

    const corners = [
        { id: 'tl', getPos: () => ({ x: 60, y: 60 }) },
        { id: 'tr', getPos: () => ({ x: window.innerWidth - 60, y: 60 }) },
        { id: 'bl', getPos: () => ({ x: 60, y: window.innerHeight - 60 }) },
        { id: 'br', getPos: () => ({ x: window.innerWidth - 60, y: window.innerHeight - 60 }) },
    ];

    function recalc() {
        center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        threads = corners.map(c => {
            const pos = c.getPos();
            const dx = center.x - pos.x;
            const dy = center.y - pos.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return { id: c.id, x: pos.x, y: pos.y, length, angle };
        });
    }

    onMount(() => {
        recalc();
        window.addEventListener('resize', recalc);
        return () => window.removeEventListener('resize', recalc);
    });
</script>

<div class="neural-threads" class:all-connected={allOpen}>
    {#each threads as t (t.id)}
        <div
            class="thread"
            class:active={openCorners.has(t.id)}
            style="
                left: {t.x}px;
                top: {t.y}px;
                width: {t.length}px;
                transform: rotate({t.angle}deg);
            "
        ></div>
    {/each}
</div>

<style>
    .neural-threads {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 45; /* below HUD (50), above background */
    }

    .thread {
        position: absolute;
        height: 1px;
        transform-origin: 0 50%;
        background: linear-gradient(
            90deg,
            rgba(167, 139, 250, 0.03),
            rgba(167, 139, 250, 0.08),
            rgba(167, 139, 250, 0.03)
        );
        opacity: 0;
        transition: opacity 1.5s ease, background 0.6s ease;
    }

    /* Show threads after first heartbeat cycle (CSS animation-delay handles timing) */
    .neural-threads .thread {
        animation: thread-fadein 3s ease 5s forwards; /* 5s delay for first heartbeat completion */
    }

    @keyframes thread-fadein {
        to { opacity: 1; }
    }

    /* When the corner's window is open: thread glows */
    .thread.active {
        opacity: 1;
        background: linear-gradient(
            90deg,
            rgba(167, 139, 250, 0.05),
            rgba(167, 139, 250, 0.2),
            rgba(167, 139, 250, 0.05)
        );
        box-shadow: 0 0 8px rgba(167, 139, 250, 0.1);
    }

    /* All four open: diamond glow */
    .all-connected .thread {
        opacity: 1;
        background: linear-gradient(
            90deg,
            rgba(167, 139, 250, 0.08),
            rgba(167, 139, 250, 0.3),
            rgba(167, 139, 250, 0.08)
        );
        box-shadow: 0 0 15px rgba(167, 139, 250, 0.15);
    }

    @media (max-width: 768px) {
        .neural-threads { display: none; }
    }
</style>
```

**File:** `src/routes/+page.svelte` — Add import and render just before the HUDCorner group:

```svelte
import NeuralThreads from '$lib/components/NeuralThreads.svelte';
```

```svelte
<NeuralThreads />
<!-- HUDCorners below -->
```

---

### TASK 2.2 — Window System Modernization

**Priority:** P0  
**Effort:** 5–7 days  
**Risk:** Medium — touches the most-used component

---

#### SUB-TASK 2.2.1 — Create Platform Store

**Create:** `src/lib/stores/platform.svelte.js`

This store detects the visitor's OS and device capabilities, then exposes a reactive theme configuration that other components read.

```javascript
class PlatformStore {
    os = $state('unknown');
    browser = $state('unknown');
    isTouchDevice = $state(false);
    isLowEnd = $state(false);
    particleCount = $state(2000);

    controlStyle = $derived(this.#resolveControlStyle());

    constructor() {
        if (typeof window === 'undefined') return;

        const ua = navigator.userAgent;

        // OS detection
        if (/Android/i.test(ua)) this.os = 'android';
        else if (/like Mac.*Mobile/i.test(ua)) this.os = 'ios';
        else if (/Mac/i.test(ua)) this.os = 'macos';
        else if (/Win/i.test(ua)) this.os = 'windows';
        else if (/Linux/i.test(ua)) this.os = 'linux';

        // Browser detection
        if (/Firefox/i.test(ua)) this.browser = 'firefox';
        else if (/Edg/i.test(ua)) this.browser = 'edge';
        else if (/Chrome/i.test(ua)) this.browser = 'chrome';
        else if (/Safari/i.test(ua)) this.browser = 'safari';

        // Touch detection
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Performance tier
        this.isLowEnd = (navigator.hardwareConcurrency || 4) <= 4
            || (navigator.deviceMemory || 8) < 4
            || window.innerWidth < 768;

        this.particleCount = this.isLowEnd ? 600 : 2000;
    }

    #resolveControlStyle() {
        switch (this.os) {
            case 'macos': return 'macos';       // Traffic-light dots, left-aligned
            case 'windows': return 'windows';   // ─ □ ✕ icons, right-aligned
            case 'linux': return 'linux';        // Dots + icon overlay on hover
            case 'android':
            case 'ios': return 'mobile';         // Single ✕, large hit target
            default: return 'macos';             // fallback
        }
    }
}

export const platformStore = new PlatformStore();
```

---

#### SUB-TASK 2.2.2 — OS-Adaptive Window Controls

**File:** `src/lib/components/WindowFrame.svelte`

Replace the static macOS dots block (lines 234–245) with a conditional renderer:

```svelte
<script>
    // Add to existing imports:
    import { platformStore } from '$lib/stores/platform.svelte.js';
</script>

<!-- Replace the window-header section with: -->
<div class="window-header" onmousedown={handleMouseDown}>
    {#if platformStore.controlStyle === 'windows'}
        <!-- Windows: right-aligned text icons -->
        <div class="window-title window-title-left">
            <i class="ph-fill {windowManager.getIcon(win.id)} mr-2 opacity-50"></i>
            {win.title}
        </div>
        <div class="window-controls windows-controls">
            <button class="control-icon minimize" onclick={() => windowManager.minimize(win.id)} aria-label="Minimize">
                <i class="ph ph-minus"></i>
            </button>
            <button class="control-icon maximize" onclick={() => windowManager.maximize(win.id)} aria-label="Maximize">
                <i class="ph ph-square"></i>
            </button>
            <button class="control-icon close" onclick={() => windowManager.close(win.id)} aria-label="Close">
                <i class="ph ph-x"></i>
            </button>
        </div>
    {:else if platformStore.controlStyle === 'mobile'}
        <!-- Mobile: single large close button -->
        <div class="window-title window-title-left" style="flex: 1;">
            <i class="ph-fill {windowManager.getIcon(win.id)} mr-2 opacity-50"></i>
            {win.title}
        </div>
        <button class="control-icon close mobile-close" onclick={() => windowManager.close(win.id)} aria-label="Close">
            <i class="ph ph-x"></i>
        </button>
    {:else}
        <!-- macOS / Linux: dot controls, left-aligned (current layout, improved) -->
        <div class="window-controls">
            <button class="control-dot close" onclick={() => windowManager.close(win.id)} aria-label="Close"></button>
            <button class="control-dot minimize" onclick={() => windowManager.minimize(win.id)} aria-label="Minimize"></button>
            <button class="control-dot maximize" onclick={() => windowManager.maximize(win.id)} aria-label="Maximize"></button>
        </div>
        <div class="window-title">
            <i class="ph-fill {windowManager.getIcon(win.id)} mr-2 opacity-50"></i>
            {win.title}
        </div>
    {/if}
</div>
```

Add corresponding styles:

```css
/* Windows-style controls */
.windows-controls {
    display: flex;
    gap: 0;
}

.control-icon {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    font-size: 14px;
}

.control-icon:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
}

.control-icon.close:hover {
    background: rgba(255, 80, 80, 0.8);
    color: #fff;
}

.mobile-close {
    width: 44px;
    height: 44px;
    font-size: 18px;
}

.window-title-left {
    text-align: left;
    margin-right: 0;
}
```

---

#### SUB-TASK 2.2.3 — Amplified Glass Transparency

**File:** `src/lib/components/WindowFrame.svelte` — Style block

Replace `.window-frame` base styles:

```css
.window-frame {
    position: absolute;
    background: linear-gradient(
        135deg,
        rgba(8, 8, 14, 0.35),
        rgba(12, 12, 20, 0.55)
    );
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(40px) saturate(180%) brightness(1.05);
    -webkit-backdrop-filter: blur(40px) saturate(180%) brightness(1.05);
    box-shadow:
        0 25px 60px rgba(0, 0, 0, 0.5),
        0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    pointer-events: auto;
    transition: left 0.8s cubic-bezier(0.25, 1.25, 0.5, 1),
                top 0.8s cubic-bezier(0.25, 1.25, 0.5, 1),
                width 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                height 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                opacity 0.5s ease,
                transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                border-radius 0.3s ease,
                border-color 0.3s ease,
                backdrop-filter 0.4s ease;
    transform-origin: center center;
}

/* Tiled: sharp professional edges */
.window-frame[style*="border-radius: 2px"],
.window-frame.tiled-mode {
    border-radius: 2px;
    border-color: rgba(255, 255, 255, 0.04);
}

/* Dragging: lift effect — glass becomes more transparent */
.window-frame.dragging {
    backdrop-filter: blur(30px) saturate(140%) brightness(1.1);
    background: linear-gradient(
        135deg,
        rgba(8, 8, 14, 0.2),
        rgba(12, 12, 20, 0.4)
    );
    box-shadow: 0 35px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 255, 255, 0.05);
}
```

Also update `currentStyle` computed property to use `border-radius: ${win.isTiled ? '2px' : '20px'}` (was `16px`/`4px`).

---

#### SUB-TASK 2.2.4 — Identity Window Redesign

**File:** `src/lib/components/Identity.svelte`

Replace the template section:

```svelte
<div id="identity-window" class="h-full flex flex-col overflow-hidden p-6 md:p-8"
     style="font-family: var(--font-body);">

    <!-- Header: Name + Role -->
    <div class="mb-6 shrink-0">
        <h1 class="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-white"
            style="font-family: var(--font-body);">
            {profile.full_name}.
        </h1>
        {#if profile.status}
            <div class="mt-2 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                <span class="text-xs text-white/50 uppercase tracking-widest"
                      style="font-family: var(--font-mono);">
                    {profile.status}
                </span>
            </div>
        {/if}
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar c-tl pr-2">
        <!-- Avatar + Summary Row -->
        <div class="flex flex-col md:flex-row gap-6 items-start mb-8">
            <div class="shrink-0">
                <AvatarFrame size="md" isIdentityFrame={true} />
            </div>
            <div class="flex-1 min-w-0">
                <div bind:this={contentEl} class="identity-content">
                    {@html withinHtml}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .identity-content :global(p) {
        line-height: 1.9;
        color: rgba(255, 255, 255, 0.75);
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }
    .identity-content :global(h2),
    .identity-content :global(h3) {
        color: rgba(255, 255, 255, 0.9);
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }
    .identity-content :global(a) {
        color: var(--accent-glow);
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color 0.2s;
    }
    .identity-content :global(a:hover) {
        color: #fff;
    }
    .identity-content :global(style) { display: none; }
</style>
```

**IMPORTANT NOTES:**
- The `<within>`/`<outside>` tag system stays. It's a good content-splitting mechanism.
- The font changes from `Space Mono` to `Inter` via `var(--font-body)` for body text.
- `Space Mono` stays for labels and status badges only.
- This task does NOT implement the visitor-mode content switching yet — that's Phase 3.1.

---

#### SUB-TASK 2.2.5 — Guestbook Redesign (inside Connect/Portal Window)

**File:** `src/lib/components/Guestbook.svelte`

Key visual changes:
- Replace green terminal aesthetic (`text-green-500`, `border-green-900`) with the site's accent palette
- Use `var(--font-body)` for message text
- Keep `var(--font-mono)` only for the form labels and callsign input

Replace the green color classes:

```
text-green-500  →  text-indigo-400
text-green-400  →  text-violet-300
border-green-900  →  border-violet-500/20
border-green-500  →  border-violet-500/50
hover:bg-green-900/20  →  hover:bg-violet-500/10
hover:text-green-400  →  hover:text-violet-300
focus:border-green-500  →  focus:border-violet-500/60
```

---

### TASK 2.3 — Typography Clean-Up (Strip Hacky Feel)

**Priority:** P1  
**Effort:** 1 day  
**Risk:** Low — CSS-only

#### Rule

| Context | Font | Usage |
|---------|------|-------|
| **Body text** (bios, descriptions, card content) | `var(--font-body)` (Inter) | Clean, professional reading |
| **UI labels** (window titles, button labels, status badges) | `var(--font-mono)` (Space Mono) | Structural, small, uppercase |
| **Terminal** | `var(--font-mono)` (Space Mono) | This is the ONLY place monospace dominates |
| **Decorative / easter eggs** | `var(--font-display)` (VT323) | Lyrics floaters, hidden jokes |
| **Headings** (Identity name, Vault category titles) | `var(--font-body)` (Inter) weight 700 | Bold, modern |

Apply this by updating `body { font-family }` to `var(--font-body)` in `app.css`, keeping monospace only where explicitly set.

---

### Phase 2 Merge Checklist

```
[ ] Heartbeat pulses clockwise TL→TR→BR→BL when no windows open
[ ] Heartbeat stops when any window opens
[ ] Corner hairlines glow on hover
[ ] Neural threads visible, glow when corresponding window is open
[ ] Window controls match visitor's OS
[ ] Increased blur/glass effect is visible
[ ] Identity window uses Inter font, clean layout
[ ] Guestbook uses accent palette (not green)
[ ] No monospace fonts outside terminal/UI labels
[ ] Mobile: HUD corners hidden, neural threads hidden
[ ] npm run build succeeds
```

---

## 6. Phase 3 — Long-Term Cinematic Overhaul (4–8 Weeks)

> Each sub-task is a self-contained feature branch.

---

### TASK 3.1 — Loading & Onboarding Sequence

**Branch:** `overhaul/loading`  
**Effort:** 1.5–2 weeks  
**Dependencies:** GSAP (installed in Phase 0)

#### State Machine

```
                ┌─────────────┐
                │ CHECK STATE │
                └──────┬──────┘
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ NEW USER │  │ RETURNING│  │ CACHED   │
   │          │  │          │  │          │
   │ Show OC  │  │ Quick hi │  │ Bypass   │
   │ Ask mode │  │ Skip btn │  │ all      │
   │ Animates │  │ Animates │  │          │
   └────┬─────┘  └────┬─────┘  └────┬─────┘
        │              │             │
        ▼              ▼             ▼
   ┌──────────────────────────┐  ┌──────────┐
   │ LOADING BAR              │  │ MAIN     │
   │ Preload 3D + Supabase    │  │ EXPERIENCE│
   └──────────┬───────────────┘  └──────────┘
              ▼
   ┌──────────────────────────┐
   │ BIG BANG (Task 3.2)      │
   └──────────┬───────────────┘
              ▼
   ┌──────────────────────────┐
   │ MAIN EXPERIENCE          │
   └──────────────────────────┘
```

#### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/stores/visitor.svelte.js` | Manages visitor state: `isNew`, `mode` (professional/casual), `hasSeenIntro`, `referrer` |
| `src/lib/components/LoadingGate.svelte` | Top-level gate component. Renders EITHER the loading flow OR the main experience |
| `src/lib/components/IntroScene.svelte` | New-visitor greeting. OC + message + mode buttons |
| `src/lib/components/ReturnGreeting.svelte` | Returning-visitor greeting. Quick message + skip |
| `src/lib/components/LoadingBar.svelte` | Asset loading progress bar |

#### Visitor Store Spec

```javascript
// src/lib/stores/visitor.svelte.js
class VisitorStore {
    isNew = $state(true);
    mode = $state('casual');     // 'professional' | 'casual'
    hasSeenIntro = $state(false);
    assetsReady = $state(false);
    referrer = $state('direct');  // 'upwork' | 'github' | 'linkedin' | 'direct' | 'other'

    constructor() {
        if (typeof window === 'undefined') return;

        // Check returning
        const stored = localStorage.getItem('luki_visitor');
        if (stored) {
            const data = JSON.parse(stored);
            this.isNew = false;
            this.mode = data.mode || 'casual';
            this.hasSeenIntro = true;
        }

        // Check referrer
        const ref = document.referrer || '';
        if (/upwork/i.test(ref)) this.referrer = 'upwork';
        else if (/github/i.test(ref)) this.referrer = 'github';
        else if (/linkedin/i.test(ref)) this.referrer = 'linkedin';

        // Check session (avoid re-animation on accidental refresh)
        if (sessionStorage.getItem('luki_session_active')) {
            this.assetsReady = true; // skip everything
        }
    }

    setMode(mode) {
        this.mode = mode;
        this.save();
    }

    markIntroSeen() {
        this.isNew = false;
        this.hasSeenIntro = true;
        this.save();
        sessionStorage.setItem('luki_session_active', 'true');
    }

    markAssetsReady() {
        this.assetsReady = true;
        sessionStorage.setItem('luki_session_active', 'true');
    }

    save() {
        localStorage.setItem('luki_visitor', JSON.stringify({
            mode: this.mode,
            visits: (this.#getVisitCount() + 1),
            lastVisit: Date.now()
        }));
    }

    #getVisitCount() {
        try {
            return JSON.parse(localStorage.getItem('luki_visitor') || '{}').visits || 0;
        } catch { return 0; }
    }
}

export const visitorStore = new VisitorStore();
```

#### Visitor Mode Content Switching

When `mode === 'professional'`:
- Identity window: Bio leads with work experience and skills
- Persona greetings are warm but professional: *"Thanks for stopping by. Everything you need is just a click away."*
- Portfolio defaults to "Writing" (project docs)
- Identity `headerTitle` reads `ABOUT_ME — WORK`

When `mode === 'casual'`:
- Identity window: Bio leads with personality, hobbies, interests
- Persona greetings are wild: *"Yo, welcome to my brain. Don't touch the furniture."*
- Portfolio defaults to "Art"
- Identity `headerTitle` reads `ABOUT_ME`

**Content source:** The existing `<within>/<outside>` tags in the Supabase `profile.bio` field should be extended:

```html
<within>
  <professional>Work experience and professional bio...</professional>
  <casual>Personal bio, hobbies, weird stuff...</casual>
</within>
```

The `Identity.svelte` parser checks `visitorStore.mode` and renders the appropriate section.

**Mode switching:** Add a toggle in the Connect window (a small pill switch: `Hiring | Exploring`) and as a terminal command (`set mode professional` / `set mode casual`). Switching triggers a smooth crossfade on the Identity content.

#### OC Persona Mode-Aware Messages

**File:** `src/lib/stores/persona.svelte.js` — Extend `defaults` array

```javascript
// Professional mode greetings
{ type: 'GREETING', mode: 'professional', msg: "Welcome. Everything's organized for you.", exp: 'idle' },
{ type: 'GREETING', mode: 'professional', msg: "Here for work? Great. Let me show you around.", exp: 'idle' },
{ type: 'WINDOW_OPEN', mode: 'professional', val: 'c-tl', msg: "My experience, at a glance.", exp: 'idle' },

// Casual mode greetings
{ type: 'GREETING', mode: 'casual', msg: "Yo. This is my brain. Explore at your own risk.", exp: 'blink' },
{ type: 'GREETING', mode: 'casual', msg: "Welcome to the void. Make yourself comfortable.", exp: 'idle' },
{ type: 'WINDOW_OPEN', mode: 'casual', val: 'c-tl', msg: "That's me. No filter.", exp: 'blink' },
```

The `triggerRandom()` method should filter by `visitorStore.mode` when `mode` is present on a trigger.

---

### TASK 3.2 — The Big Bang Transition

**Branch:** `overhaul/bigbang`  
**Effort:** 1–2 weeks  
**Dependencies:** GSAP, potentially `postprocessing` for bloom

#### High-Level Sequence (5 seconds total)

| Time | Phase | Visual | Audio Cue (optional) |
|------|-------|--------|---------------------|
| 0.0s | **Collapse** | All particles accelerate toward center point. Screen darkens. | Deep rumble |
| 1.0s | **Critical mass** | Single bright point. OC has exited screen. Loading bar dissolved. | Rising tone |
| 1.5s | **Flash** | White CSS overlay flashes for 200ms | Impact |
| 1.7s | **Expand** | 2000 particles fly outward from center, decelerating | Whoosh → ambient |
| 2.5s | **Settle** | Particles arrive at orbital positions. Slow rotation begins | — |
| 2.5s | **HUD Entry** | Corner buttons fly from center to corners (staggered 100ms each) | — |
| 3.0s | **Threads** | Neural lines draw themselves from center outward | — |
| 3.5s | **OC Entry** | Persona glides up from below into bottom-right | — |
| 4.0s | **Text** | "Welcome" fades in. Text animation loop starts | — |
| 5.0s | **Complete** | Heartbeat starts. Full interactivity enabled | — |

#### Technical: Custom Shader for Particles

**File:** `src/lib/components/Scene.svelte` — Major rewrite

Replace `THREE.PointsMaterial` with a custom `THREE.ShaderMaterial`:

```javascript
// Store two positions per particle: center and home
const centerPositions = new Float32Array(particleCount * 3); // all zeros
const homePositions = positions; // the existing spherical distribution

geometry.setAttribute('homePosition', new THREE.BufferAttribute(homePositions, 3));

// Uniform controlling interpolation
const uniforms = {
    u_progress: { value: 0.0 },   // 0 = center, 1 = home
    u_time: { value: 0.0 },
    u_size: { value: 0.1 },
};

const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
        attribute vec3 homePosition;
        attribute vec3 color;
        attribute float size;
        uniform float u_progress;
        uniform float u_time;
        varying vec3 vColor;

        void main() {
            vColor = color;
            vec3 pos = mix(vec3(0.0), homePosition, u_progress);
            // Add subtle rotation once settled
            float angle = u_time * 0.05;
            mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            pos.xz = rot * pos.xz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * 200.0 / gl_Position.w;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float alpha = 1.0 - smoothstep(0.3, 0.5, d);
            gl_FragColor = vec4(vColor, alpha * 0.8);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
});
```

**GSAP tween for the expansion:**

```javascript
import gsap from 'gsap';

// Called when loading completes:
function triggerBigBang() {
    gsap.to(uniforms.u_progress, {
        value: 1.0,
        duration: 2.5,
        ease: "power2.out",
    });
}
```

#### Flash Overlay

A simple CSS div overlaid on everything, controlled by GSAP:

```svelte
<!-- In BigBang.svelte -->
<div bind:this={flashEl} class="fixed inset-0 bg-white z-[9999] opacity-0 pointer-events-none"></div>

<script>
    gsap.to(flashEl, {
        opacity: 1,
        duration: 0.1,
        delay: 1.5,     // after collapse
        yoyo: true,
        repeat: 1,
    });
</script>
```

#### HUD Entry Animation

Each `HUDCorner` starts at viewport center with `opacity: 0; transform: scale(0)` and flies to its corner position:

```javascript
// In +page.svelte, after Big Bang completes:
gsap.fromTo('.hud-corner.tl',
    { x: window.innerWidth/2, y: window.innerHeight/2, scale: 0, opacity: 0 },
    { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0 }
);
gsap.fromTo('.hud-corner.tr',
    { x: -window.innerWidth/2, y: window.innerHeight/2, scale: 0, opacity: 0 },
    { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.1 }
);
// ... repeat for .br (delay: 0.2) and .bl (delay: 0.3)
```

---

### TASK 3.3 — Background & Navigation Overhaul

**Branch:** `overhaul/background`  
**Effort:** 2–3 weeks

#### SUB-TASK 3.3.1 — Idea Nodes (Replace Debris)

**Delete** the `Actor` class and debris system from `+page.svelte`.

**Create:** `src/lib/components/IdeaNodes.svelte`

Each node is a floating pill chip with a label. Source labels from a static list initially; later from Supabase.

```javascript
const ideas = [
    { text: 'SvelteKit', color: '#ff3e00' },
    { text: 'NixOS', color: '#7ebae4' },
    { text: '3D Art', color: '#a78bfa' },
    { text: 'Gamedev', color: '#22c55e' },
    { text: 'Rust', color: '#dea584' },
    { text: 'Music', color: '#ec4899' },
    { text: 'Typography', color: '#f59e0b' },
    { text: 'UI Design', color: '#06b6d4' },
    // ... etc
];
```

Each node: pill-shaped div, subtle glow border matching `color`, floating with the same wind-like drift as deep particles. Clickable → opens a relevant window or shows a tooltip.

#### SUB-TASK 3.3.2 — Ice Glide Parallax (Momentum Camera)

**File:** `src/lib/components/Scene.svelte`

Replace the direct parallax with momentum physics:

```javascript
let velocityX = 0, velocityY = 0;
const friction = 0.97;
const sensitivity = 0.0003;
let lastMouseX = 0, lastMouseY = 0;

useTask((delta) => {
    if (!cameraGroup) return;

    // Apply velocity
    velocityX *= friction;
    velocityY *= friction;
    cameraGroup.rotation.y += velocityX * delta * 60;
    cameraGroup.rotation.x += velocityY * delta * 60;

    // Clamp vertical
    cameraGroup.rotation.x = Math.max(-0.4, Math.min(0.4, cameraGroup.rotation.x));

    // Base rotation (never fully stops)
    if (rotationGroup) {
        rotationGroup.rotation.y += delta * 0.03;
    }
});

// On mousemove (in SpaceBackground or passed down):
function onMouseMove(e) {
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    velocityX += dx * sensitivity;
    velocityY += dy * sensitivity;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
}
```

#### SUB-TASK 3.3.3 — Scroll-to-Zoom

Add wheel event listener that controls `camera.position.z`:

```javascript
let targetZoom = 15; // default camera Z
const ZOOM_MIN = 5;   // closest (OC head visible)
const ZOOM_MAX = 25;  // farthest (star field)
const ZOOM_SPEED = 0.5;

function onWheel(e) {
    e.preventDefault();
    targetZoom += e.deltaY * 0.01 * ZOOM_SPEED;
    targetZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, targetZoom));
}

// In useTask:
if (camera) {
    camera.position.z += (targetZoom - camera.position.z) * 3 * delta;
}
```

For the OC head model at zoom center:
- Use `@threlte/extras` `useGltf` to load the model
- Only render when `camera.position.z < 8`
- Placeholder until you commission the GLB: use a placeholder sphere or your Roblox head export

---

### TASK 3.4 — Mobile Layout

**Branch:** `overhaul/mobile`  
**Effort:** 1.5–2 weeks

#### Approach

Do NOT try to shrink the desktop layout. Build a separate mobile experience that shares the same data layer.

**Create:** `src/lib/components/MobileShell.svelte`  
**Create:** `src/lib/components/BottomSheet.svelte`

The main `+page.svelte` conditionally renders:

```svelte
<script>
    import { platformStore } from '$lib/stores/platform.svelte.js';
</script>

{#if platformStore.isTouchDevice && window.innerWidth < 768}
    <MobileShell />
{:else}
    <!-- existing desktop layout -->
{/if}
```

MobileShell layout:
- Full-screen 3D background (same Scene, reduced particles)
- Touch parallax (one-finger drag → camera rotation)
- Pinch to zoom
- Centered text animation
- Persona avatar bottom-center
- 2×2 grid of navigation buttons OR horizontal scroll tabs at bottom
- Tapping a button opens a BottomSheet (full-height slide-up panel)
- BottomSheet has a drag handle to dismiss

---

### TASK 3.5 — OS-Unique Experience Layer

**Branch:** `overhaul/os-layer`  
**Effort:** 3–5 days

This is mostly a data-driven extension of the platform store. See the table in the approved plan. Implementation is straightforward:

- Terminal prompt changes based on OS (already partially done)
- Window controls (done in 2.2.2)
- Persona comments (extend trigger pool in persona store)
- Font rendering hints via CSS

---

## 7. Deployment & Update Strategy

### Current Pipeline

```
Local dev (npm run dev)
    → git push to main
    → Vercel auto-deploys
    → Live at production URL
```

**This pipeline is good. Keep it.**

### Recommended Workflow for Ongoing Updates

#### For Content Updates (profile bio, works, portal links, playlist)

Use the **existing admin system** (Terminal → `login` → `sudo admin` → Control Center). This is already built and works through Supabase. No code deploy needed for content changes.

**Improvement:** Consider adding a "Quick Edit" button visible only to authenticated admin users on each window — clicking it opens the relevant admin editor directly. This saves the Terminal → login → sudo → navigate flow.

#### For Code Updates (new features, bug fixes, design changes)

```
1. git checkout -b feature/my-feature
2. npm run dev  (local development)
3. Test in browser on multiple viewports
4. git commit + git push
5. Create a Pull Request on GitHub
6. Vercel creates a Preview Deployment (free) — test on mobile, share with friends
7. Merge to main → Vercel deploys to production
```

**Key insight:** Vercel gives you a preview URL for every branch/PR automatically. This means:
- You can test new features on your phone before they go live
- You can share the preview link with friends for feedback
- Production stays stable until you explicitly merge

#### For Database Changes (new tables, columns)

1. Write the SQL migration in a new file: `supabase/migrations/YYYYMMDD_description.sql`
2. Test locally using Supabase CLI (`npx supabase db push`)
3. Apply to production via Supabase Dashboard → SQL Editor

#### Content Living Strategy

To keep the site "alive" without code changes:

| What to Update | Where | How Often |
|----------------|-------|-----------|
| Works (essays, art, projects) | Supabase `works` table via Admin Vault | Whenever you create something |
| Profile bio | Supabase `profile` table via Admin Profile | Every few months |
| Persona triggers (new roasts, reactions) | Supabase `persona_triggers` table via Admin Persona | When inspiration strikes |
| Portal links | Supabase `portal_items` table via Admin Portal | When you join new platforms |
| Playlist | Supabase `playlist` table via Admin Playlist | When you discover new music |
| Guestbook moderation | Supabase `guestbook` table via Admin Guestbook | Check weekly |

**Everything above is already supported by your admin panel.** The site's architecture is already designed for this — the text editor and admin system you built ARE the update mechanism.

---

## 8. Risk Register

| ID | Risk | Severity | Likelihood | Mitigation |
|----|------|----------|-----------|------------|
| R1 | Custom shader breaks on older GPUs | HIGH | MEDIUM | Feature-detect WebGL 2 support. Fall back to current `PointsMaterial` if not available. |
| R2 | GSAP bundle size increase | LOW | CERTAIN | GSAP is ~30KB gzipped. Acceptable. Tree-shake unused plugins. |
| R3 | Bloom post-processing tanks mobile FPS | HIGH | HIGH | Only enable bloom during Big Bang (Phase 3.2). Disable immediately after. On low-end devices, skip bloom entirely. |
| R4 | OS detection is unreliable | MEDIUM | LOW | Fallback to macOS-style controls if detection fails. UA sniffing covers 95%+ of cases. |
| R5 | Scroll-zoom conflicts with browser scroll | MEDIUM | MEDIUM | Use `e.preventDefault()` on wheel events. Add a "scroll lock" explanation tooltip on first visit. |
| R6 | Loading sequence annoys returning power users | MEDIUM | MEDIUM | `sessionStorage` quick-resume (3.1c) ensures refreshes are instant. "Skip" button always visible. |
| R7 | Visitor mode fork creates maintenance burden | MEDIUM | HIGH | Both modes share 95% of code. Only the bio section and persona greetings differ. Keep both in the same Supabase record using the `<professional>`/`<casual>` tags. |
| R8 | Mobile bottom-sheet feels generic | LOW | MEDIUM | Add physics-based drag (spring easing), backdrop blur matching desktop windows, and persona integration. |

---

## 9. Dependency Changelog

| Phase | Package | Version | Purpose | Size Impact |
|-------|---------|---------|---------|-------------|
| Phase 0 | `gsap` | ^3.x | Animation timelines for loading, Big Bang, entry sequences | ~30KB gzipped |
| Phase 3.2 (optional) | `postprocessing` | ^6.x | Bloom effect for Big Bang flash | ~50KB (tree-shakeable) |

All existing dependencies remain unchanged:
- `@threlte/core`, `@threlte/extras`, `three` — 3D engine
- `@supabase/supabase-js` — backend
- `tailwindcss` v4 — styling
- `@phosphor-icons/web` — iconography

---

## Appendix A — File Inventory

### Files MODIFIED (in order of work)

| File | Phase | What Changes |
|------|-------|-------------|
| `src/app.css` | 0, 1, 2 | Add Inter font, replace HUD corner CSS, new keyframes |
| `src/routes/+page.svelte` | 1, 2, 3 | Rename buttons, import NeuralThreads, loading gate, remove debris |
| `src/lib/components/Guestbook.svelte` | 1, 2 | Fix HTML bug, redesign palette |
| `src/lib/components/WindowFrame.svelte` | 1, 2 | Hit targets, OS controls, glass effect |
| `src/lib/components/HUDCorner.svelte` | 2 | Heartbeat logic, remove RAF loop |
| `src/lib/components/Identity.svelte` | 2, 3 | Layout redesign, mode-aware content |
| `src/lib/components/Scene.svelte` | 3 | Custom shader, momentum, scroll-zoom |
| `src/lib/components/SpaceBackground.svelte` | 3 | Bloom, event forwarding |
| `src/lib/components/LukiPersona.svelte` | 3 | Entry animation, mode-aware |
| `src/lib/stores/persona.svelte.js` | 3 | Mode-filtered triggers |
| `src/lib/utils/persona-detect.js` | 3 | Referrer detection, export integration |
| `src/lib/components/Vault.svelte` | 2 | Card hover previews, lazy images |
| `src/lib/components/Portal.svelte` | 2 | Warmer design |
| `src/lib/components/Playlist.svelte` | 2 | Now-playing indicator |

### Files CREATED

| File | Phase | Purpose |
|------|-------|---------|
| `src/lib/components/NeuralThreads.svelte` | 2 | Corner-to-center synapse lines |
| `src/lib/stores/platform.svelte.js` | 2 | OS/device detection store |
| `src/lib/stores/visitor.svelte.js` | 3 | Visitor mode/returning state |
| `src/lib/components/LoadingGate.svelte` | 3 | Loading state machine |
| `src/lib/components/IntroScene.svelte` | 3 | New-visitor greeting |
| `src/lib/components/ReturnGreeting.svelte` | 3 | Returning-visitor greeting |
| `src/lib/components/LoadingBar.svelte` | 3 | Progress indicator |
| `src/lib/components/BigBang.svelte` | 3 | Expansion sequence |
| `src/lib/components/IdeaNodes.svelte` | 3 | Interactive floating labels |
| `src/lib/components/MobileShell.svelte` | 3 | Mobile layout coordinator |
| `src/lib/components/BottomSheet.svelte` | 3 | Mobile slide-up drawer |

### Files DELETED

| File | Phase | Reason |
|------|-------|--------|
| (none) | — | No files are deleted. The old debris system is replaced in-place inside `+page.svelte`. |

---

## Appendix B — Visitor Mode Content Matrix

| Element | `mode: 'professional'` | `mode: 'casual'` |
|---------|----------------------|-------------------|
| **Identity bio** | Work experience, tech skills, availability, resume download | Personality, hobbies, current interests, what you're binge-watching |
| **Identity title** | `ABOUT ME — WORK` | `ABOUT ME` |
| **Default Vault category** | Writing (project docs) | Art |
| **Persona greeting** | *"Welcome. I've laid everything out for your convenience."* | *"Yo. This is my brain. Explore at your own risk."* |
| **Persona collision** | *"Careful — that's a live demo."* | *"HEY! Move your window, I'm standing here!"* |
| **Persona idle** | *"Take your time. I'm right here if you need me."* | *"Still here? Go click something, anything."* |
| **Mode switch UI** | Pill toggle in Connect window: `Hiring ↔ Exploring` | Same |
| **Mode switch terminal** | `set mode casual` / `set mode professional` | Same |

---

## Appendix C — Performance Budget

| Metric | Target (Desktop) | Target (Mobile) | Technique |
|--------|-----------------|----------------|-----------|
| First Contentful Paint | < 1.5s | < 2s | SSR the intro screen (black + OC) — no WebGL needed for FCP |
| Time to Interactive | < 3s | < 4s | Lazy-load Three.js canvas inside `onMount` |
| Three.js particles | 2000 | 500–800 | `platformStore.particleCount` driven by device tier |
| Pixel ratio | `min(dpr, 2)` | `min(dpr, 2)` | `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` |
| Backdrop blur | `blur(40px)` | `blur(16px)` | Reduce on low-end devices |
| Bloom post-processing | During Big Bang only | DISABLED | Too expensive for mobile GPUs |
| Memory ceiling | < 200MB heap | < 100MB heap | Dispose Big Bang geometries after use |
| Animation frame budget | 16ms (60fps) | 16ms (60fps) | Monitor with `stats.js` during development |
| Total JS bundle | < 300KB gzipped | Same | Tree-shake GSAP, Three.js |

**Low-end detection (applied automatically):**

```javascript
// In platform.svelte.js
const isLowEnd = (navigator.hardwareConcurrency || 4) <= 4
    || (navigator.deviceMemory || 8) < 4
    || window.innerWidth < 768;

if (isLowEnd) {
    particleCount = 600;
    backdropBlur = '16px';
    enableBloom = false;
    enableIceGlide = false; // fall back to direct parallax
    enableScrollZoom = false; // too jarring on low-end
}
```

---

*End of specification. This document should be treated as the single source of truth for all overhaul work. Update it as decisions change.*
