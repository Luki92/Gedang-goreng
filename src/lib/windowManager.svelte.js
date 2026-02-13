import { tick } from 'svelte';

class WindowManager {
    windows = $state([]);
    activeWindowId = $state(null);
    masterWindowId = $state(null);

    // Layout Configuration
    innerGap = $state(15);
    outerGap = $derived(this.windows.length > 1 ? 100 : 40);

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

    /**
     * @param {string} id
     * @param {Object} [options]
     * @param {boolean} [options.isTiled]
     * @param {number} [options.width]
     * @param {number} [options.height]
     * @param {Object} [options.props]
     * @param {Object} [options.originRect]
     * @param {string} [options.originType]
     * @param {string} [options.title]
     */
    open(id, options = {}) {
        const component = this.registry.get(id);
        if (!component) {
            console.error(`Component for ${id} not found.`);
            return;
        }

        // Handle legacy usage: open(id, originRect) where originRect has 'left' property
        let originRect = options.originRect;
        let props = options.props || {};
        let originType = options.originType || 'bc'; // Default to bottom-center

        if (!originRect && options.left !== undefined) {
            originRect = options;
        }

        const existing = this.windows.find(w => w.id === id);
        if (existing) {
            // Update props if provided
            if (Object.keys(props).length > 0) {
                existing.props = props;
            }
            this.focus(id);
            return;
        }

        // Increased default sizes for specific windows like Terminal
        const defaultWidth = id === 'terminal' ? 950 : 600;
        const defaultHeight = id === 'terminal' ? 650 : 450;

        let width = options.width || originRect?.width || Math.min(window.innerWidth * 0.9, defaultWidth);
        let height = options.height || originRect?.height || Math.min(window.innerHeight * 0.9, defaultHeight);
        let x = originRect?.left || 0;
        let y = originRect?.top || 0;
        let isTiled = options.isTiled !== undefined ? options.isTiled : true;

        // Smart Cascade for Floating Windows
        if (!isTiled && !originRect && typeof window !== 'undefined') {
             const floatingWindows = this.windows.filter(w => !w.isTiled && w.state !== 'closing');
             if (floatingWindows.length > 0) {
                 const last = floatingWindows[floatingWindows.length - 1];
                 x = last.x + 40;
                 y = last.y + 40;

                 // Bounds Check
                 if (x + width > window.innerWidth - 20) x = 40;
                 if (y + height > window.innerHeight - 20) y = 40;
             } else {
                 // Center if first floating window
                 x = (window.innerWidth - width) / 2;
                 y = (window.innerHeight - height) / 2;
             }
        }

        // Create new window object
        const newWindow = {
            id,
            component,
            props,
            originRect: originRect || null,
            originType, title: options.title || "",
            x,
            y,
            width,
            height,
            zIndex: 10,
            state: 'opening', // opening, open, closing
            isTiled,
        };

        this.windows.push(newWindow);

        // Determine Master/Stack
        if (!this.masterWindowId && isTiled) {
            this.masterWindowId = id;
        }

        this.focus(id);

        if (isTiled) {
            this.resolveCollisions(id);
            this.recalculateLayout();
        }

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
                    const nextMaster = this.windows.find(win => win.isTiled);
                    if (nextMaster) this.masterWindowId = nextMaster.id;
                    else this.masterWindowId = null;
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

    /**
     * @param {string} id
     * @param {Object} [options]
     * @param {boolean} [options.isTiled]
     * @param {number} [options.width]
     * @param {number} [options.height]
     * @param {Object} [options.props]
     * @param {Object} [options.originRect]
     * @param {string} [options.originType]
     * @param {string} [options.title]
     */
    toggle(id, options = {}) {
        const existing = this.windows.find(w => w.id === id);
        if (existing) {
            this.close(id);
        } else {
            this.open(id, options);
        }
    }

    // Called by WindowFrame when user starts dragging/resizing
    untile(id) {
        const w = this.windows.find(w => w.id === id);
        if (w && w.isTiled) {
             w.isTiled = false;
             // When untiled, give it current dimensions explicitly to prevent layout jump
             // (Though x/y/width/height are reactive, so they should be fine)
        }
        this.isDragging = true;
        this.recalculateLayout(); // Re-layout remaining tiled windows
    }

    stopDrag() {
        this.isDragging = false;
    }

    /** @param {string} newId */
    resolveCollisions(newId) {
        if (typeof window === 'undefined') return;
        const screenW = window.innerWidth;
        const untiled = this.windows.filter(w => !w.isTiled && w.id !== newId && w.state !== 'closing');
        if (untiled.length === 0) return;

        const gap = 100; // Assume large gap mode

        untiled.forEach(w => {
            const cx = w.x + w.width / 2;
            const screenMid = screenW / 2;

            // If window is roughly centered (within 15% of center), push it
            if (Math.abs(cx - screenMid) < screenW * 0.15) {
                const distLeft = w.x;
                const distRight = screenW - (w.x + w.width);

                if (distLeft < distRight) {
                    w.x = gap;
                } else {
                    w.x = screenW - w.width - gap;
                }
            }
        });
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

        const untiledWindows = this.windows.filter(w => !w.isTiled && w.state !== 'closing');
        const hasUntiled = untiledWindows.length > 0;
        const totalWindows = tiledWindows.length + untiledWindows.length; // Approximate "density"
        const currentOuterGap = this.outerGap;

        // 1. Single Tiled Window (Hybrid Check)
        if (tiledWindows.length === 1) {
            const w = tiledWindows[0];

            if (hasUntiled) {
                // Check if Untiled windows occupy the Left (Master) side
                let leftOccupied = false;
                const masterLimit = screenW * 0.6; // Boundary between Master/Stack

                untiledWindows.forEach(u => {
                    const uc = u.x + u.width / 2;
                    if (uc < masterLimit) leftOccupied = true;
                });

                // Prepare geometries
                const totalGapW = currentOuterGap * 2 + this.innerGap;
                const availableW = screenW - totalGapW;
                const masterWidth = availableW * 0.6;
                const stackWidth = availableW * 0.4;

                const masterX = currentOuterGap;
                const stackX = masterX + masterWidth + this.innerGap;
                const h = screenH - (currentOuterGap * 2);

                if (leftOccupied) {
                    // Untiled is Left -> Place Tiled in Stack (Right)
                    w.x = stackX;
                    w.y = currentOuterGap;
                    w.width = stackWidth;
                    w.height = h;
                } else {
                    // Untiled is Right (or unknown) -> Place Tiled in Master (Left)
                    w.x = masterX;
                    w.y = currentOuterGap;
                    w.width = masterWidth;
                    w.height = h;
                }
            } else {
                // Standard Single Center
                const targetW = Math.min(screenW * 0.6, 1200);
                const targetH = Math.min(screenH * 0.7, 900);

                w.x = (screenW - targetW) / 2;
                w.y = (screenH - targetH) / 2;
                w.width = targetW;
                w.height = targetH;
            }
            return;
        }

        // 2. Master + Stack (2+ Tiled Windows)
        let masterW = tiledWindows.find(w => w.id === this.masterWindowId);
        if (!masterW) {
             masterW = tiledWindows[0];
             this.masterWindowId = masterW.id;
        }

        const stackWs = tiledWindows.filter(w => w.id !== masterW.id);

        // Gap is already calculated above as currentOuterGap

        const totalGapW = currentOuterGap * 2 + (stackWs.length > 0 ? this.innerGap : 0);
        const availableW = screenW - totalGapW;

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

            // Height per item (with minimum height constraint)
            const minStackH = 150;
            const stackItemH = Math.max(availableStackH / stackWs.length, minStackH);

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
