import { tick } from 'svelte';

class WindowManager {
    windows = $state([]);
    activeWindowId = $state(null);
    masterWindowId = $state(null);

    // Layout Configuration
    innerGap = $state(16);
    outerGap = $state(32);

    // Global Drag State
    isDragging = $state(false);

    registry = new Map();

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => {
                this.recalculateLayout();
            });
        }
    }

    register(id, component) {
        this.registry.set(id, component);
    }

    open(id, originRect, options = {}) {
        let component = this.registry.get(id);
        if (!component) {
            if (options.component) {
                component = options.component;
            } else {
                console.error(`Component for ${id} not found.`);
                return;
            }
        }

        const existing = this.windows.find(w => w.id === id);
        if (existing) {
            this.focus(id);
            return;
        }

        // Create new window object
        const newWindow = {
            id,
            component,
            props: options.props || {},
            originRect: originRect || { left: 0, top: 0, width: 0, height: 0 },
            x: originRect?.left || 0,
            y: originRect?.top || 0,
            width: originRect?.width || 300,
            height: originRect?.height || 200,
            zIndex: 10,
            state: 'opening', // opening, open, closing
            isTiled: true,
        };

        this.windows.push(newWindow);

        // Determine Master/Stack
        if (!this.masterWindowId) {
            this.masterWindowId = id;
        }

        this.focus(id);
        this.recalculateLayout();

        // Animation delay to allow CSS transition from origin to calculated pos
        setTimeout(() => {
            const w = this.windows.find(w => w.id === id);
            if (w) w.state = 'open';
        }, 50);
    }

    close(id) {
        const index = this.windows.findIndex(w => w.id === id);
        if (index === -1) return;

        const w = this.windows[index];
        w.state = 'closing';

        // Wait for animation then remove
        setTimeout(() => {
            const wasMaster = (this.masterWindowId === id);

            // Remove from array
            const newWindows = this.windows.filter(win => win.id !== id);
            this.windows = newWindows;

            if (wasMaster) {
                // Promote next window to master
                if (this.windows.length > 0) {
                    this.masterWindowId = this.windows[0].id;
                } else {
                    this.masterWindowId = null;
                }
            }

            this.recalculateLayout();
        }, 400); // Animation duration
    }

    focus(id) {
        this.activeWindowId = id;
        const w = this.windows.find(w => w.id === id);
        if (w) {
            const maxZ = this.windows.reduce((max, win) => Math.max(max, win.zIndex), 10);
            w.zIndex = maxZ + 1;
        }
    }

    toggle(id, originRect) {
        const existing = this.windows.find(w => w.id === id);
        if (existing) {
            this.close(id);
        } else {
            this.open(id, originRect);
        }
    }

    // Called by WindowFrame when user starts dragging/resizing
    untile(id) {
        const w = this.windows.find(w => w.id === id);
        if (w && w.isTiled) {
             w.isTiled = false;
        }
        this.isDragging = true;
    }

    stopDrag() {
        this.isDragging = false;
    }

    snap(id, zone) {
        const w = this.windows.find(w => w.id === id);
        if (!w) return;

        w.isTiled = true;

        // If snapped to 'master' zone (left), make it master
        if (zone === 'master') {
            this.masterWindowId = id;
        }
        // If snapped to 'stack' (right), just ensure it is not master
        else if (zone === 'stack') {
            if (this.masterWindowId === id) {
                // Find another master
                const other = this.windows.find(win => win.id !== id && win.isTiled);
                if (other) this.masterWindowId = other.id;
                else {
                    // Stay master if alone, or swap with first stack item
                    const firstStack = this.windows.find(win => win.id !== id && win.isTiled);
                    if (firstStack) this.masterWindowId = firstStack.id;
                }
            }
        }

        this.recalculateLayout();
    }

    // Called to re-tile everything
    retileAll() {
        this.windows.forEach(w => w.isTiled = true);
        this.recalculateLayout();
    }

    recalculateLayout() {
        if (typeof window === 'undefined') return;
        if (this.windows.length === 0) return;

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        const tiledWindows = this.windows.filter(w => w.isTiled && w.state !== 'closing');

        if (tiledWindows.length === 0) return;

        // 1. Single Window Center
        if (tiledWindows.length === 1) {
            const w = tiledWindows[0];
            const targetW = Math.min(screenW * 0.6, 1200);
            const targetH = Math.min(screenH * 0.7, 900);

            w.x = (screenW - targetW) / 2;
            w.y = (screenH - targetH) / 2;
            w.width = targetW;
            w.height = targetH;
            return;
        }

        // 2. Master + Stack
        let masterW = tiledWindows.find(w => w.id === this.masterWindowId);
        if (!masterW) {
             masterW = tiledWindows[0];
             this.masterWindowId = masterW.id;
        }

        const stackWs = tiledWindows.filter(w => w.id !== masterW.id);

        // Scale down the grid when 2+ windows are open to reveal HUD
        const currentOuterGap = (stackWs.length > 0) ? 100 : this.outerGap;

        const totalGapW = currentOuterGap * 2 + (stackWs.length > 0 ? this.innerGap : 0);
        const availableW = screenW - totalGapW;

        // If stack exists, master takes 60%, else 100% (but handled by single window case mostly)
        // Wait, if 2 windows, 1 master 1 stack.
        // If stackWs.length > 0

        const masterWidth = stackWs.length > 0 ? availableW * 0.6 : availableW;
        const stackWidth = stackWs.length > 0 ? availableW * 0.4 : 0;

        const masterX = currentOuterGap;
        const masterY = currentOuterGap;
        const masterH = screenH - (currentOuterGap * 2);

        // Update Master
        masterW.x = masterX;
        masterW.y = masterY;
        masterW.width = masterWidth;
        masterW.height = masterH;

        // Update Stack
        if (stackWs.length > 0) {
            const stackX = masterX + masterWidth + this.innerGap;

            // Total available height for stack items
            // Subtract outer gaps (top/bottom) and inner gaps between items
            const totalStackGapH = (stackWs.length - 1) * this.innerGap;
            const availableStackH = (screenH - (currentOuterGap * 2)) - totalStackGapH;

            // Height per item
            const stackItemH = availableStackH / stackWs.length;

            stackWs.forEach((sw, i) => {
                sw.x = stackX;
                sw.y = currentOuterGap + (i * (stackItemH + this.innerGap));
                sw.width = stackWidth;
                sw.height = stackItemH;
            });
        }
    }
}

export const windowManager = new WindowManager();
