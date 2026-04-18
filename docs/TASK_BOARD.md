# OVERHAUL TASK BOARD

> Quick-reference tracker. For full specifications, see [OVERHAUL_PLAN.md](./OVERHAUL_PLAN.md).  
> Mark tasks `[x]` as they are completed. Mark `[/]` for in-progress.

---

## Phase 0 — Pre-Flight

- [ ] `npm install gsap`
- [ ] Add Inter font import to `src/app.css`
- [ ] Define `--font-body` and `--font-mono` CSS vars in `:root`
- [ ] Create branch `overhaul/phase-1`

---

## Phase 1 — Immediate Polish

**Branch:** `overhaul/phase-1`  
**Estimated:** 1–4 days

- [ ] **1.1** Rename HUD buttons (About Me / Portfolio / Listening / Connect)
- [ ] **1.2** Fix Guestbook `<input>` HTML bug
- [ ] **1.3** Expand control-dot hit targets (32px desktop, 44px touch)
- [ ] **1.4** Add depth-based parallax to debris actors
- [ ] Merge `overhaul/phase-1` → `main`

---

## Phase 2 — Short-Term Redesign

**Branch:** `overhaul/phase-2`  
**Estimated:** 2–3 weeks

### HUD Corners (Task 2.1)
- [ ] **2.1.1** Replace breathe animation with clockwise heartbeat (CSS-only)
- [ ] **2.1.2** Replace L-bracket with corner hairline accents
- [ ] **2.1.3** Create `NeuralThreads.svelte` component
- [ ] **2.1.3** Wire neural threads to respond to open windows

### Window System (Task 2.2)
- [ ] **2.2.1** Create `platform.svelte.js` store
- [ ] **2.2.2** Implement OS-adaptive window controls
- [ ] **2.2.3** Upgrade glass transparency (blur 40px, gradient bg, inset highlight)
- [ ] **2.2.3** Add drag-lift transparency reduction
- [ ] **2.2.4** Redesign Identity window layout (Inter font, status badge, structured sections)
- [ ] **2.2.5** Redesign Guestbook palette (accent colors, not green)

### Typography (Task 2.3)
- [ ] **2.3** Switch body font to Inter, restrict monospace to terminal/UI labels
- [ ] Merge `overhaul/phase-2` → `main`

---

## Phase 3 — Long-Term Cinematic

### Loading & Onboarding (Task 3.1)
**Branch:** `overhaul/loading`  
**Estimated:** 1.5–2 weeks

- [ ] Create `visitor.svelte.js` store (mode, returning, referrer)
- [ ] Create `LoadingGate.svelte` state machine
- [ ] Create `IntroScene.svelte` (new visitor greeting + mode choice)
- [ ] Create `ReturnGreeting.svelte` (returning visitor + skip option)
- [ ] Create `LoadingBar.svelte`
- [ ] Implement session-based quick resume (prevent refresh re-animation)
- [ ] Add referrer detection (Upwork, GitHub, LinkedIn)
- [ ] Implement visitor mode content switching in Identity.svelte
- [ ] Add `<professional>`/`<casual>` parser to Identity bio
- [ ] Extend persona triggers with mode-aware messages
- [ ] Add mode toggle to Connect window
- [ ] Add `set mode` terminal command
- [ ] Merge `overhaul/loading` → `main`

### Big Bang (Task 3.2)
**Branch:** `overhaul/bigbang`  
**Estimated:** 1–2 weeks

- [ ] Refactor Scene.svelte to use custom ShaderMaterial
- [ ] Store home positions as BufferAttribute
- [ ] Add `u_progress` uniform for center→home interpolation
- [ ] Implement GSAP timeline for collapse → flash → expand
- [ ] Add CSS flash overlay
- [ ] Implement HUD corner entry animation (fly from center)
- [ ] Implement neural thread draw-in animation
- [ ] Implement OC persona glide-up entry
- [ ] Coordinate with text animation timing
- [ ] Add bloom post-processing (desktop only, during sequence only)
- [ ] Merge `overhaul/bigbang` → `main`

### Background & Navigation (Task 3.3)
**Branch:** `overhaul/background`  
**Estimated:** 2–3 weeks

- [ ] **3.3.1** Create `IdeaNodes.svelte` (interactive floating labels)
- [ ] **3.3.1** Remove old debris actor system
- [ ] **3.3.2** Implement ice-glide momentum parallax
- [ ] **3.3.2** Add minimum rotation speed (never-dead scene)
- [ ] **3.3.3** Implement scroll-to-zoom (wheel → camera Z)
- [ ] **3.3.3** Add OC head model slot at zoom center (placeholder until GLB ready)
- [ ] **3.3.3** Add pinch-to-zoom for Android/iOS
- [ ] **3.3.3** Add boundary shimmer at zoom limits
- [ ] Merge `overhaul/background` → `main`

### Mobile (Task 3.4)
**Branch:** `overhaul/mobile`  
**Estimated:** 1.5–2 weeks

- [ ] Create `MobileShell.svelte` layout
- [ ] Create `BottomSheet.svelte` drawer component
- [ ] Implement touch parallax (one-finger drag → camera)
- [ ] Add 2×2 nav grid or horizontal tabs
- [ ] Adapt window content for mobile (single-column, large targets)
- [ ] Remove old mobile reactor button
- [ ] Reduce particle count for mobile GPU
- [ ] Merge `overhaul/mobile` → `main`

### OS-Unique Layer (Task 3.5)
**Branch:** `overhaul/os-layer`  
**Estimated:** 3–5 days

- [ ] Extend platform store with full OS theme config
- [ ] Add OS-specific terminal prompt
- [ ] Add OS-specific persona comments
- [ ] Add cursor style per OS
- [ ] Add font-rendering hints per OS
- [ ] Merge `overhaul/os-layer` → `main`

---

## Post-Overhaul

- [ ] Full cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (Android Chrome, iOS Safari)
- [ ] Performance audit (Lighthouse, WebGL inspector)
- [ ] Update README.md with new feature list
- [ ] Update this document with completion dates

---

*Last updated: 2026-04-17*
