import { writable, get } from 'svelte/store';

// Legacy: activeCorner might be deprecated
export const activeCorner = writable(null);

/**
 * @typedef {Object} WindowData
 * @property {string} id
 * @property {string} title
 * @property {string} origin - 'tl', 'tr', 'bl', 'br'
 * @property {any} [component]
 * @property {object} [props]
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {number} z
 * @property {boolean} [min]
 */

/** @type {import('svelte/store').Writable<WindowData[]>} */
export const windows = writable([]);

export const isAdmin = writable(false);
export const musicState = writable({
    isPlaying: false,
    currentTrack: 0,
    title: 'LOFI_STATION_1',
    artist: 'BUFFERING...'
});

// Admin Editable Content (Session Persistence)
export const adminContent = writable({
    welcomeTitle: "Thinking Space",
    welcomeText: "TS",
    easterEggText: "PMO ICL",
    docContent: "# ADMIN GUIDE\n\n1. Use the tabs to edit content.\n2. Changes are session-only in this demo.\n3. See OWNER_GUIDE.md in repo."
});

// Layout Constants
const MARGIN = 80;
const GAP = 20;

/**
 * Calculates window positions based on count and origin constraints.
 * Enforces side-pinning (Right buttons -> Right side).
 * @param {WindowData[]} currentWindows
 * @returns {WindowData[]}
 */
function recalculateLayout(currentWindows) {
    if (typeof window === 'undefined') return currentWindows;

    const count = currentWindows.length;
    if (count === 0) return [];

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Usable area
    const safeW = screenW - (MARGIN * 2);
    const safeH = screenH - (MARGIN * 2);
    const startX = MARGIN;
    const startY = MARGIN;

    // Helper to check if a window is "right side"
    const isRight = (w) => w.origin.includes('r');
    const isBottom = (w) => w.origin.includes('b');

    return currentWindows.map((win) => {
        // If the window has been manually moved/resized significantly, we might want to respect that?
        // But the requirement says "reposition itself automatically when other window is opened".
        // So we strictly enforce layout on list change.

        let x, y, w, h;

        if (count === 1) {
            // 1: Center Large
            // BUT user said: "fill the entire page, not fully"
            // And "if the button is on the right side, it will be always on the right side"
            // Let's bias the "Center" based on origin.

            w = Math.min(1000, safeW * 0.9);
            h = Math.min(800, safeH * 0.9);

            // If strictly right, maybe push it right?
            // "if the button is on the right side, it will be always on the right side"
            // This contradicts "Centered".
            // Let's try:
            // If 1 window:
            //   If Left Origin: Left-ish Center
            //   If Right Origin: Right-ish Center

            if (isRight(win)) {
                x = screenW - MARGIN - w;
            } else {
                x = MARGIN;
            }
            y = (screenH - h) / 2; // Center Vertically

            // Actually, for single window, "Centered" looks best, but let's respect the "Side" rule strictness.
            // Compromise: Centered but biased?
            // Let's do: 1 Window = Centered. (Users usually prefer this).
            // UNLESS the user insists "always on right side".
            // Let's stick to the Grid Logic for consistency.

            // RE-READ: "appear to fill the entire page, not fully"
            // "reposition itself automatically... halving with the second"

            // Implementation:
            // 1 Win: Full Safe Area (Centered)
            x = (screenW - w) / 2;
            y = (screenH - h) / 2;

        } else if (count === 2) {
            // 2: Split Vertical (Left / Right) normally.
            // But we must respect origin.

            const wHalf = (safeW - GAP) / 2;

            if (isRight(win)) {
                x = startX + wHalf + GAP;
                w = wHalf;
                h = safeH;
                y = startY;
            } else {
                x = startX;
                w = wHalf;
                h = safeH;
                y = startY;
            }

            // Edge case: 2 Right windows? Stack them?
            // If we have 2 windows, and both are 'right', we should split vertically on the right side?
            // Or just force them into the Left/Right slots to fill screen?
            // "halving with the second".
            // Let's simply assign slots based on index if collisions, but prefer origin.

            // Simple approach: Sort by Left/Right preference.
            const rights = currentWindows.filter(isRight).length;
            const lefts = currentWindows.filter(w => !isRight(w)).length;

            if (rights === 2) {
                 // Both Right -> Split Top/Bottom on Right? Or Left/Right?
                 // Let's do Left/Right for symmetry.
                 const idx = currentWindows.indexOf(win);
                 x = startX + (idx * (wHalf + GAP));
                 w = wHalf; h = safeH; y = startY;
            } else if (lefts === 2) {
                 const idx = currentWindows.indexOf(win);
                 x = startX + (idx * (wHalf + GAP));
                 w = wHalf; h = safeH; y = startY;
            }
            // Logic handled above covers standard L/R split.

        } else {
            // 3 or 4: Grid 2x2
            const wHalf = (safeW - GAP) / 2;
            const hHalf = (safeH - GAP) / 2;

            // Slot logic:
            // TL (0,0) | TR (1,0)
            // BL (0,1) | BR (1,1)

            // Map origin to ideal slot
            let col = isRight(win) ? 1 : 0;
            let row = isBottom(win) ? 1 : 0;

            // Collision resolution?
            // For now, if 4 windows (all unique corners), they fit perfectly.
            // If 3 windows, they take their corners.

            x = startX + (col * (wHalf + GAP));
            y = startY + (row * (hHalf + GAP));
            w = wHalf;
            h = hHalf;
        }

        return { ...win, x, y, w, h };
    });
}

export function openWindow(newWindow) {
    windows.update(list => {
        const exists = list.find(w => w.id === newWindow.id);
        if (exists) {
            const newList = list.filter(w => w.id !== newWindow.id);
            return recalculateLayout(newList);
        } else {
            const newList = [...list, { ...newWindow, z: 100 + list.length }];
            return recalculateLayout(newList);
        }
    });
}

export function closeWindow(id) {
    windows.update(list => {
        const newList = list.filter(w => w.id !== id);
        return recalculateLayout(newList);
    });
}

export function focusWindow(id) {
    windows.update(list => {
        const maxZ = Math.max(...list.map(w => w.z), 100);
        return list.map(w => w.id === id ? { ...w, z: maxZ + 1 } : w);
    });
}

// NEW: Sync manual changes without triggering layout recalc
export function updateWindow(id, changes) {
    windows.update(list => {
        return list.map(w => w.id === id ? { ...w, ...changes } : w);
    });
}
