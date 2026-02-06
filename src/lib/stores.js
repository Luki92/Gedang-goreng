import { writable, get } from 'svelte/store';

// Legacy: activeCorner might be deprecated or used for button highlight state only
export const activeCorner = writable(null);

/**
 * @typedef {Object} WindowData
 * @property {string} id
 * @property {string} title
 * @property {any} [component]
 * @property {object} [props]
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {number} z
 * @property {boolean} [min]
 */

// New: Multi-window management
/** @type {import('svelte/store').Writable<WindowData[]>} */
export const windows = writable([]);

export const isAdmin = writable(false);
export const musicState = writable({
    isPlaying: false,
    currentTrack: 0,
    title: 'LOFI_STATION_1',
    artist: 'BUFFERING...'
});

// Layout Constants
const MARGIN = 80; // Margin from screen edges
const GAP = 20;    // Gap between windows

/**
 * Calculates window positions based on count
 * @param {WindowData[]} currentWindows
 * @returns {WindowData[]}
 */
function recalculateLayout(currentWindows) {
    if (typeof window === 'undefined') return currentWindows; // SSR check

    const count = currentWindows.length;
    if (count === 0) return [];

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Usable area
    const safeW = screenW - (MARGIN * 2);
    const safeH = screenH - (MARGIN * 2);
    const startX = MARGIN;
    const startY = MARGIN;

    return currentWindows.map((win, index) => {
        let x, y, w, h;

        if (count === 1) {
            // 1: Big centralized
            w = Math.min(1000, safeW * 0.9);
            h = Math.min(800, safeH * 0.9);
            x = (screenW - w) / 2;
            y = (screenH - h) / 2;
        } else if (count === 2) {
            // 2: Split Vertical (Left/Right)
            w = (safeW - GAP) / 2;
            h = safeH;
            x = startX + (index * (w + GAP));
            y = startY;
        } else if (count === 3) {
            // 3: 1 Left (Half), 2 Right Stacked (Quarter)
            if (index === 0) {
                w = (safeW - GAP) / 2;
                h = safeH;
                x = startX;
                y = startY;
            } else {
                w = (safeW - GAP) / 2;
                h = (safeH - GAP) / 2;
                x = startX + w + GAP;
                y = startY + ((index - 1) * (h + GAP));
            }
        } else {
            // 4+: 2x2 Grid
            // For > 4, we just stack them on the last spot or keep 2x2 logic.
            // Let's stick to 4 max logic for now as requested.
            const col = index % 2;
            const row = Math.floor(index / 2);
            w = (safeW - GAP) / 2;
            h = (safeH - GAP) / 2;
            x = startX + (col * (w + GAP));
            y = startY + (row * (h + GAP));
        }

        return { ...win, x, y, w, h };
    });
}

/**
 * Open or Toggle a window with auto-layout
 * @param {WindowData} newWindow
 */
export function openWindow(newWindow) {
    windows.update(list => {
        const exists = list.find(w => w.id === newWindow.id);
        if (exists) {
            // Close it
            const newList = list.filter(w => w.id !== newWindow.id);
            return recalculateLayout(newList);
        } else {
            // Open it
            // We append first, then layout
            const newList = [...list, { ...newWindow, z: 100 + list.length }];
            return recalculateLayout(newList);
        }
    });
}

/**
 * Close a window by ID
 * @param {string} id
 */
export function closeWindow(id) {
    windows.update(list => {
        const newList = list.filter(w => w.id !== id);
        return recalculateLayout(newList);
    });
}

/**
 * Focus a window (bring to front) without changing layout
 * @param {string} id
 */
export function focusWindow(id) {
    windows.update(list => {
        const maxZ = Math.max(...list.map(w => w.z), 100);
        return list.map(w => w.id === id ? { ...w, z: maxZ + 1 } : w);
    });
}
