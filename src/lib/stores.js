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

// Vault Data Store (Shared between Vault and Admin)
export const vaultWorks = writable([]);

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

        } else {
            // 2, 3, 4+ Windows: Columnar Layout
            // "If three windows... lone window occupy same half as if there is 2."

            // 1. Sort into Columns based on Origin
            // We want to group L/R
            const wHalf = (safeW - GAP) / 2;

            // Determine if this window belongs to Left or Right Column
            // If we have 3 windows: 2L, 1R -> Right gets Full Height.
            // If we have 2 windows: 1L, 1R -> Both Full Height.

            // Get all windows sorted/grouped
            const lefts = currentWindows.filter(w => !isRight(w));
            const rights = currentWindows.filter(isRight);

            // Fallback: If 3 Lefts and 0 Rights, force one to Right?
            // "reposition itself automatically"
            // Let's distribute evenly if unbalanced?
            // Actually, strictly respecting origin is safer for UX predictability unless user wants auto-balance.
            // Requirement implies: "lone window from a side". So we respect the side.

            let myCol = isRight(win) ? 'right' : 'left';
            let myGroup = myCol === 'right' ? rights : lefts;
            let myIndex = myGroup.indexOf(win);
            let groupSize = myGroup.length;

            // Calculate Slot Height
            // If 1 item in group -> Full Height
            // If 2 items -> Half Height
            // If 3 items -> Third Height

            let myH = (safeH - (GAP * (groupSize - 1))) / groupSize;
            let myY = startY + (myIndex * (myH + GAP));

            // X Pos
            let myX = (myCol === 'left') ? startX : (startX + wHalf + GAP);
            let myW = wHalf;

            // Edge Case Handling:
            // If we have 0 items in one column and X in other, do we expand width?
            // "occupy same half" implies width is fixed to 50%.

            // Special Case: 2 Windows total, both Left.
            // Should we move one to Right?
            // Original logic: "halving with the second".
            // If I open Identity (TL) and Audio (BL), do they stack on Left or Split L/R?
            // "halving with the second" implies Split Screen usually.
            // Let's stick to the "Side" rule:
            // "if the button is on the right side, it will be always on the right side"
            // So: TL + BL = Stacked on Left. Empty Right.
            // TL + Vault (TR) = Split L/R.

            // Wait, previous code forced L/R split for 2 windows if they were L and L?
            // "Simple approach: Sort by Left/Right preference."

            // Let's improve balancing for count=2 only?
            // "If three windows... lone window from a side will occupy same half as if there is 2."
            // This implies the standard state for 2 windows is Left/Right split.

            // Let's force balancing if count <= 4 and one column is empty?
            if (count <= 2) {
                 if (lefts.length === 2 && rights.length === 0) {
                     // Force second one to Right?
                     if (myIndex === 1) { myX = startX + wHalf + GAP; myY = startY; myH = safeH; }
                     else { myH = safeH; }
                 } else if (rights.length === 2 && lefts.length === 0) {
                     if (myIndex === 0) { myX = startX; myY = startY; myH = safeH; } // Move first to Left?
                     else { myY = startY; myH = safeH; }
                 }
            }

            x = myX;
            y = myY;
            w = myW;
            h = myH;
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
