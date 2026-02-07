import { getContext, setContext } from 'svelte';

class WindowManager {
    windows = $state([]);
    activeWindowId = $state(null);
    draggingWindowId = $state(null);
    layoutMode = $state('master-stack'); // 'master-stack' | 'grid'

    // Configuration
    gap = 20; // px
    outerGap = 40; // px
    masterWidthFactor = 0.6; // 60%

    constructor() {
        this.windows = [];
    }

    register(id, component, props = {}, anchor = 'tl') {
        // Check if window already exists
        const existing = this.windows.find(w => w.id === id);
        if (existing) return;

        // Initial state
        const win = {
            id,
            component,
            props,
            anchor,
            mode: 'tiled', // 'tiled' | 'floating'
            isOpen: false,
            zIndex: 10,
            position: { x: 0, y: 0, width: 0, height: 0 }, // Calculated by updateLayout
            originalRect: { width: 400, height: 300 } // Default size for floating
        };

        // Use a reactive wrapper or just push plain object if the array is $state
        // Since windows is $state([]), pushing to it triggers updates.
        // But the object properties need to be reactive too?
        // In Svelte 5, deep reactivity works for arrays and objects in $state.
        this.windows.push(win);
    }

    open(id, component, props, anchor) {
        let win = this.windows.find(w => w.id === id);

        if (!win) {
            this.register(id, component, props, anchor);
            win = this.windows.find(w => w.id === id);
        }

        if (!win.isOpen) {
            win.isOpen = true;
            this.focus(id);
            this.updateLayout();
        }
    }

    close(id) {
        const win = this.windows.find(w => w.id === id);
        if (win && win.isOpen) {
            win.isOpen = false;
            this.updateLayout();
        }
    }

    toggle(id, component, props, anchor) {
        const win = this.windows.find(w => w.id === id);
        if (win && win.isOpen) {
            this.close(id);
        } else {
            this.open(id, component, props, anchor);
        }
    }

    focus(id) {
        this.activeWindowId = id;
        // Bring to front logic for floating windows could go here
        // For tiled, z-index might not matter as much, but visual focus does.
        const win = this.windows.find(w => w.id === id);
        if (win) {
            // Update z-index globally? or just track active ID.
            // Let's increment a global z-index counter or resort.
            const maxZ = Math.max(...this.windows.map(w => w.zIndex), 10);
            win.zIndex = maxZ + 1;
        }
    }

    setMode(id, mode) {
        const win = this.windows.find(w => w.id === id);
        if (win) {
            win.mode = mode;
            this.updateLayout();
        }
    }

    updateLayout() {
        if (typeof window === 'undefined') return;

        const openWindows = this.windows.filter(w => w.isOpen && w.mode === 'tiled');
        const count = openWindows.length;

        if (count === 0) return;

        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        const effectiveW = viewportW - (2 * this.outerGap);
        const effectiveH = viewportH - (2 * this.outerGap);
        const startX = this.outerGap;
        const startY = this.outerGap;

        if (count === 1) {
            // Single window: Master Area Factor (60%) or fixed size?
            // "If only one window exists, it should retain its original defined dimensions or the Master Area width"
            // Let's use Master Area Width (60%) for consistency with the layout logic.
            const w = effectiveW * this.masterWidthFactor;
            // Center it
            const x = startX + (effectiveW - w) / 2;

            openWindows[0].position = {
                x,
                y: startY,
                width: w,
                height: effectiveH
            };
        } else {
            // Master-Stack
            // Master gets masterWidthFactor
            // Stack gets the rest
            const masterW = effectiveW * this.masterWidthFactor - (this.gap / 2);
            const stackW = effectiveW * (1 - this.masterWidthFactor) - (this.gap / 2);

            // Master is the first one (or active one? usually first in list is master)
            // Let's assume index 0 is master for now.
            // We could implement swap logic later.

            const masterWin = openWindows[0];
            masterWin.position = {
                x: startX,
                y: startY,
                width: masterW,
                height: effectiveH
            };

            const stackWindows = openWindows.slice(1);
            const stackCount = stackWindows.length;
            const stackH = (effectiveH - (stackCount - 1) * this.gap) / stackCount;

            stackWindows.forEach((win, index) => {
                win.position = {
                    x: startX + masterW + this.gap,
                    y: startY + index * (stackH + this.gap),
                    width: stackW,
                    height: stackH
                };
            });
        }
    }

    // Floating window drag/resize updates
    updateWindowRect(id, rect) {
        const win = this.windows.find(w => w.id === id);
        if (win) {
            win.position = { ...win.position, ...rect };
        }
    }

    startDrag(id) {
        this.draggingWindowId = id;
    }

    endDrag() {
        this.draggingWindowId = null;
    }
}

// Create a singleton instance
export const windowManager = new WindowManager();
