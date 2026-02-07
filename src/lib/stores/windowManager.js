import { writable, get } from 'svelte/store';

// Configuration
const GAP = 20; // px
const MOBILE_BREAKPOINT = 768; // px

function createWindowManager() {
    const { subscribe, update, set } = writable([]);

    return {
        subscribe,

        /**
         * Register a new window type.
         * @param {Object} def - { id, title, component, origin: { x, y } }
         * origin is 'tl', 'tr', 'bl', 'br'
         */
        register: (def) => update(windows => {
            if (windows.find(w => w.id === def.id)) return windows;
            return [...windows, {
                ...def,
                isOpen: false,
                isFloating: false,
                zIndex: 10,
                rect: { x: 0, y: 0, w: 0, h: 0 }
            }];
        }),

        /**
         * Toggle window visibility.
         * @param {string} id
         */
        toggle: (id) => update(windows => {
            // First, toggle the specific window
            const updatedWindows = windows.map(w => {
                if (w.id === id) {
                    const isOpen = !w.isOpen;
                    const maxZ = Math.max(...windows.map(win => win.zIndex), 10);
                    return { ...w, isOpen, zIndex: isOpen ? maxZ + 1 : w.zIndex };
                }
                return w;
            });

            // Then recalculate layout for all open windows
            return recalculateLayout(updatedWindows);
        }),

        /**
         * Bring window to front.
         * @param {string} id
         */
        focus: (id) => update(windows => {
            const maxZ = Math.max(...windows.map(win => win.zIndex), 10);
            return windows.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
        }),

        /**
         * Move window to master position (index 0 of open windows).
         * @param {string} id
         */
        setMaster: (id) => update(windows => {
            // Implementation: We need to reorder the windows so `id` is considered "first"
            // by the layout engine. The layout engine uses `openWindows` order.
            // But `windows` contains all windows.
            // We can just move `id` to the beginning of the `windows` array?
            // Or add a `layoutIndex` property.
            // Simple approach: Move to start of array.
            const w = windows.find(win => win.id === id);
            if (!w) return windows;

            const others = windows.filter(win => win.id !== id);
            const newOrder = [w, ...others];

            return recalculateLayout(newOrder);
        }),

        /**
         * Update floating position (drag).
         */
        move: (id, x, y) => update(windows => {
            return windows.map(w => {
                if (w.id === id) {
                    return { ...w, isFloating: true, rect: { ...w.rect, x, y } };
                }
                return w;
            });
        }),

        resize: (id, w, h) => update(windows => {
            return windows.map(win => {
                if (win.id === id) {
                    return { ...win, isFloating: true, rect: { ...win.rect, w, h } };
                }
                return win;
            });
        }),

        /**
         * Update both position and size (atomic).
         */
        updateRect: (id, newRect) => update(windows => {
            return windows.map(w => w.id === id ? { ...w, isFloating: true, rect: { ...w.rect, ...newRect } } : w);
        }),

        /**
         * Set floating state.
         */
        setFloating: (id, isFloating) => update(windows => {
             const updated = windows.map(w => w.id === id ? { ...w, isFloating } : w);
             return recalculateLayout(updated);
        }),

        /**
         * Force a layout recalculation (e.g., on resize).
         */
        layout: () => update(windows => recalculateLayout(windows))
    };
}

/**
 * Core Tiling Logic (Master-Stack)
 */
function recalculateLayout(windows) {
    if (typeof window === 'undefined') return windows;

    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    // Get open, non-floating windows to determine layout slots
    // We use the order in the array as the "tiling order" (Master = index 0)
    const openNonFloating = windows.filter(w => w.isOpen && !w.isFloating);
    const count = openNonFloating.length;

    // Map of id -> computed rect
    const layoutMap = new Map();

    openNonFloating.forEach((w, i) => {
        layoutMap.set(w.id, calculateTileRect(i, count, isMobile));
    });

    // Apply updates
    return windows.map(w => {
        if (layoutMap.has(w.id)) {
            return { ...w, rect: layoutMap.get(w.id) };
        }
        return w;
    });
}

function calculateTileRect(index, total, isMobile) {
    if (isMobile) {
        return {
            x: GAP,
            y: GAP + 60,
            w: window.innerWidth - (GAP * 2),
            h: window.innerHeight - (GAP * 2) - 80
        };
    }

    if (total === 1) {
        return {
            x: GAP,
            y: GAP,
            w: window.innerWidth - (GAP * 2),
            h: window.innerHeight - (GAP * 2)
        };
    }

    const masterWidth = (window.innerWidth / 2) - (GAP * 1.5);
    const stackWidth = (window.innerWidth / 2) - (GAP * 1.5);
    const stackX = (window.innerWidth / 2) + (GAP * 0.5);

    if (index === 0) {
        // Master
        return {
            x: GAP,
            y: GAP,
            w: masterWidth,
            h: window.innerHeight - (GAP * 2)
        };
    } else {
        // Stack
        const stackCount = total - 1;
        const stackIndex = index - 1;
        // Total height available for stack
        const totalStackHeight = window.innerHeight - (GAP * (stackCount + 1));
        const itemHeight = totalStackHeight / stackCount;

        return {
            x: stackX,
            y: GAP + (stackIndex * (itemHeight + GAP)),
            w: stackWidth,
            h: itemHeight
        };
    }
}

export const windowManager = createWindowManager();
