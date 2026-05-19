# Phase 1 & 2 Overhaul Assessment

> **Date:** 2026-05-19
> **Status:** Internal Audit
> **Scope:** Phase 1 and Phase 2 progression review against `OVERHAUL_PLAN.md`.

## 1. Progress Audit

### Phase 1 — Immediate Polish
- **1.1 Rename HUD buttons:** **[Completed]** The HUD buttons in `+page.svelte` are correctly updated to "ABOUT ME", "PORTFOLIO", "LISTENING", and "CONNECT".
- **1.2 Fix Guestbook `<input>` HTML bug:** **[Not Completed]** The syntax error inside `Guestbook.svelte` persists.
- **1.3 Expand control-dot hit targets:** **[Not Completed]** WindowFrame styles still use old dimensions.
- **1.4 Add depth-based parallax to debris actors:** **[Not Completed]** The old debris system is still active without depth-parallax.

### Phase 2 — Short-Term Redesign
- **2.1 HUD Corners:** **[Not Started]** `HUDCorner.svelte` still uses `requestAnimationFrame`, `NeuralThreads.svelte` does not exist, and old CSS animations (`btn-breathe`) and L-brackets remain.
- **2.2 Window System:** **[Not Started]** The platform store (`platform.svelte.js`) is missing, controls are hardcoded to macOS dots in `WindowFrame.svelte`, Identity template is unchanged, and Guestbook still relies on the green palette.
- **2.3 Typography:** **[Not Started]** Space Mono is still forced globally inside `app.css` instead of introducing Inter for bodies.

---

## 2. Identified Visual Bugs & Root Causes

### Bug 1: Broken Input Field in Guestbook
**Description:** The "CALLSIGN" input inside the `Guestbook` component (`src/lib/components/Guestbook.svelte`) fails to render correctly or may leak attributes into the DOM.
**Root Cause:** A missing opening angle bracket (`<`) on the `input` element.
**Resolution Instructions:**
In `src/lib/components/Guestbook.svelte` around line 82, modify:
```html
<label for="callsign-input" ...>IDENTITY_SIGNATURE</label>
    type="text"
```
To:
```html
<label for="callsign-input" ...>IDENTITY_SIGNATURE</label>
<input
    type="text"
```

### Bug 2: Typography Theme Inconsistency
**Description:** The entire site forces a monospace font (`Space Mono`), disregarding the planned switch to a cleaner reading font (`Inter`) for body text, creating a "hacky" feel rather than the intended professional cinematic vibe.
**Root Cause:** `app.css` sets `font-family: 'Space Mono', monospace;` globally on `body` instead of limiting it to terminals and specific UI labels.
**Resolution Instructions:**
Update `app.css` to define `--font-body: 'Inter', sans-serif;` and apply it to the `body` tag. Move the `Space Mono` definition into a `--font-mono` variable and apply it selectively to terminal elements, labels, and `.code` spans.

### Bug 3: Performance Drain on Idle
**Description:** CPU/Battery usage is unnecessarily high even when the user isn't interacting with the page.
**Root Cause:** The `HUDCorner.svelte` component has an `$effect` block running an infinite `requestAnimationFrame` loop that manually polls `Date.now()` to trigger CSS classes for the "breathing" animation.
**Resolution Instructions:**
Remove the JS-based animation loop. Refactor `app.css` to implement a CSS-only `@keyframes hud-heartbeat` animation as detailed in Sub-Task 2.1.1 of the Overhaul Plan. Let the browser's compositor handle the animation.

---

## 3. Further Plan Before Phase 3

To ensure a solid foundation before executing the heavy cinematic additions in Phase 3, we must complete the following items systematically:

### Immediate Fixes (Next 24-48 Hours)
1. **Fix Guestbook HTML:** Apply the `<input>` tag fix.
2. **Setup Global Fonts:** Import `Inter` in `app.css` and enforce the new typography rules.

### Window & UI System Refactor (Next 1-2 Weeks)
1. **Create Platform Store:** Build `src/lib/stores/platform.svelte.js` to begin OS detection logic.
2. **Upgrade Window Controls:** Modify `WindowFrame.svelte` to read from the platform store and render macOS, Windows, Linux, or Mobile window controls accordingly.
3. **Enhance Glass Effects:** Replace `.window-frame` background and blur properties with the new gradient and `40px` blur logic.
4. **Redesign Identity & Guestbook:** Apply the layout and color palette changes outlined in Phase 2.2.4 and 2.2.5.
5. **HUD System Modernization:** Create `NeuralThreads.svelte`, strip the `requestAnimationFrame` logic from `HUDCorner.svelte`, and apply the new heartbeat CSS.

Once the above items are merged, the codebase will be correctly positioned to begin Phase 3 (Loading screen gate, Big Bang, and 3D momentum features).
