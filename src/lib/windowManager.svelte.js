import { tick } from 'svelte';

class WindowManager {
    windows = $state([]);
    activeWindowId = $state(null);
    masterWindowId = $state(null);

    // Layout Configuration
    innerGap = $state(15);
    outerGap = $derived(this.windows.filter(w => !w.minimized).length > 1 ? 100 : 40);

    // Global Drag State
    isDragging = $state(false);

    registry = new Map();

    iconMap = {
        'terminal': 'ph-terminal-window',
        'c-tr': 'ph-safe',
        'c-tl': 'ph-fingerprint',
        'c-bl': 'ph-vinyl-record',
        'c-br': 'ph-planet',
        'admin-guestbook': 'ph-envelope-open',
        'control-center': 'ph-gear-six',
        'file-viewer': 'ph-file-text'
    };

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

    getIcon(id) {
        return this.iconMap[id] || (id.startsWith('admin-') ? 'ph-shield-check' : 'ph-app-window');
    }

    /**
     * @param {string} id
     * @param {Object} [options]
     */
    open(id, options = {}) {
        const component = this.registry.get(options.componentId || id);
        if (!component) {
            console.error(`Component for ${id} not found.`);
            return;
        }

        let originRect = options.originRect;
        let props = options.props || {};
        let originType = options.originType || 'bc';

        const existing = this.windows.find(w => w.id === id);
        if (existing) {
            if (existing.minimized) {
                existing.minimized = false;
            }
            if (Object.keys(props).length > 0) {
                existing.props = props;
            }
            this.focus(id);
            this.recalculateLayout();
            return;
        }

        const defaultWidth = id === 'terminal' ? 950 : 600;
        const defaultHeight = id === 'terminal' ? 650 : 450;

        let width = options.width || originRect?.width || Math.min(window.innerWidth * 0.9, defaultWidth);
        let height = options.height || originRect?.height || Math.min(window.innerHeight * 0.9, defaultHeight);
        let x = originRect?.left || 0;
        let y = originRect?.top || 0;
        let isTiled = options.isTiled !== undefined ? options.isTiled : true;

        if (!isTiled && !originRect && typeof window !== 'undefined') {
             const floatingWindows = this.windows.filter(w => !w.isTiled && w.state !== 'closing' && !w.minimized);
             if (floatingWindows.length > 0) {
                 const last = floatingWindows[floatingWindows.length - 1];
                 x = last.x + 40;
                 y = last.y + 40;
                 if (x + width > window.innerWidth - 20) x = 40;
                 if (y + height > window.innerHeight - 20) y = 40;
             } else {
                 x = (window.innerWidth - width) / 2;
                 y = (window.innerHeight - height) / 2;
             }
        }

        const newWindow = {
            id,
            component,
            props,
            originRect: originRect || null,
            originType,
            title: options.title || "",
            x,
            y,
            width,
            height,
            zIndex: 10,
            state: 'opening',
            isTiled,
            isMaximized: false,
            minimized: false,
            preMaximizedRect: null
        };

        this.windows.push(newWindow);

        if (!this.masterWindowId && isTiled) {
            this.masterWindowId = id;
        }

        this.focus(id);

        if (isTiled) {
            this.resolveCollisions(id);
            this.recalculateLayout();
        }

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

        setTimeout(() => {
            const wasMaster = (this.masterWindowId === id);
            this.windows = this.windows.filter(win => win.id !== id);

            if (wasMaster) {
                if (this.windows.length > 0) {
                    const nextMaster = this.windows.find(win => win.isTiled);
                    if (nextMaster) this.masterWindowId = nextMaster.id;
                    else this.masterWindowId = null;
                } else {
                    this.masterWindowId = null;
                }
            }

            this.recalculateLayout();
        }, 400);
    }

    focus(id) {
        this.activeWindowId = id;
        const w = this.windows.find(w => w.id === id);
        if (w) {
            if (w.minimized) w.minimized = false;
            const maxZ = this.windows.reduce((max, win) => Math.max(max, win.zIndex), 10);
            w.zIndex = maxZ + 1;
            this.recalculateLayout();
        }
    }

    toggle(id, options = {}) {
        const existing = this.windows.find(w => w.id === id);
        if (existing) {
            if (existing.minimized) {
                existing.minimized = false;
                this.focus(id);
            } else {
                this.close(id);
            }
        } else {
            this.open(id, options);
        }
    }

    maximize(id) {
        const w = this.windows.find(win => win.id === id);
        if (!w) return;

        if (w.isMaximized) {
            this.restore(id);
        } else {
            w.preMaximizedRect = { x: w.x, y: w.y, width: w.width, height: w.height, isTiled: w.isTiled };
            w.isMaximized = true;
            w.isTiled = false;
            w.x = 0;
            w.y = 0;
            w.width = window.innerWidth;
            w.height = window.innerHeight;
            this.recalculateLayout();
        }
    }

    minimize(id) {
        const w = this.windows.find(win => win.id === id);
        if (!w) return;

        if (w.isMaximized) {
            this.restore(id);
            return;
        }

        w.minimized = true;
        this.recalculateLayout();
    }

    restore(id) {
        const w = this.windows.find(win => win.id === id);
        if (!w) return;

        if (w.minimized) {
            w.minimized = false;
        } else if (w.isMaximized) {
            w.isMaximized = false;
            if (w.preMaximizedRect) {
                w.x = w.preMaximizedRect.x;
                w.y = w.preMaximizedRect.y;
                w.width = w.preMaximizedRect.width;
                w.height = w.preMaximizedRect.height;
                w.isTiled = w.preMaximizedRect.isTiled;
            }
        }
        this.recalculateLayout();
    }

    untile(id) {
        const w = this.windows.find(w => w.id === id);
        if (w && w.isTiled) {
             w.isTiled = false;
        }
        this.isDragging = true;
        this.recalculateLayout();
    }

    stopDrag() {
        this.isDragging = false;
    }

    resolveCollisions(newId) {
        if (typeof window === 'undefined') return;
        const screenW = window.innerWidth;
        const untiled = this.windows.filter(w => !w.isTiled && w.id !== newId && w.state !== 'closing' && !w.minimized);
        if (untiled.length === 0) return;

        const gap = 100;
        untiled.forEach(w => {
            const cx = w.x + w.width / 2;
            const screenMid = screenW / 2;
            if (Math.abs(cx - screenMid) < screenW * 0.15) {
                const distLeft = w.x;
                const distRight = screenW - (w.x + w.width);
                if (distLeft < distRight) w.x = gap;
                else w.x = screenW - w.width - gap;
            }
        });
    }

    snap(id, zone) {
        const w = this.windows.find(w => w.id === id);
        if (!w) return;
        w.isTiled = true;
        if (zone === 'master') this.masterWindowId = id;
        else if (zone === 'stack') {
            if (this.masterWindowId === id) {
                const other = this.windows.find(win => win.id !== id && win.isTiled && !win.minimized);
                if (other) this.masterWindowId = other.id;
            }
        }
        this.recalculateLayout();
    }

    retileAll() {
        this.windows.forEach(w => w.isTiled = true);
        this.recalculateLayout();
    }

    recalculateLayout() {
        if (typeof window === 'undefined') return;
        if (this.windows.length === 0) return;

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        const tiledWindows = this.windows.filter(w => w.isTiled && w.state !== 'closing' && !w.minimized);
        if (tiledWindows.length === 0) return;

        const untiledWindows = this.windows.filter(w => !w.isTiled && w.state !== 'closing' && !w.minimized);
        const hasUntiled = untiledWindows.length > 0;
        const currentOuterGap = this.outerGap;

        if (tiledWindows.length === 1) {
            const w = tiledWindows[0];
            if (hasUntiled) {
                let leftOccupied = false;
                const masterLimit = screenW * 0.6;
                untiledWindows.forEach(u => {
                    if ((u.x + u.width / 2) < masterLimit) leftOccupied = true;
                });

                const totalGapW = currentOuterGap * 2 + this.innerGap;
                const availableW = screenW - totalGapW;
                const masterWidth = availableW * 0.6;
                const stackWidth = availableW * 0.4;
                const h = screenH - (currentOuterGap * 2);

                if (leftOccupied) {
                    w.x = currentOuterGap + masterWidth + this.innerGap;
                    w.y = currentOuterGap;
                    w.width = stackWidth;
                    w.height = h;
                } else {
                    w.x = currentOuterGap;
                    w.y = currentOuterGap;
                    w.width = masterWidth;
                    w.height = h;
                }
            } else {
                const targetW = Math.min(screenW * 0.8, 1400);
                const targetH = Math.min(screenH * 0.8, 1000);
                w.x = (screenW - targetW) / 2;
                w.y = (screenH - targetH) / 2;
                w.width = targetW;
                w.height = targetH;
            }
            return;
        }

        let masterW = tiledWindows.find(w => w.id === this.masterWindowId);
        if (!masterW) {
             masterW = tiledWindows[0];
             this.masterWindowId = masterW.id;
        }
        const stackWs = tiledWindows.filter(w => w.id !== masterW.id);
        const totalGapW = currentOuterGap * 2 + (stackWs.length > 0 ? this.innerGap : 0);
        const availableW = screenW - totalGapW;
        const masterWidth = stackWs.length > 0 ? availableW * 0.6 : availableW;
        const stackWidth = stackWs.length > 0 ? availableW * 0.4 : 0;
        const masterH = screenH - (currentOuterGap * 2);

        masterW.x = currentOuterGap;
        masterW.y = currentOuterGap;
        masterW.width = masterWidth;
        masterW.height = masterH;

        if (stackWs.length > 0) {
            const stackX = currentOuterGap + masterWidth + this.innerGap;
            const totalStackGapH = (stackWs.length - 1) * this.innerGap;
            const availableStackH = (screenH - (currentOuterGap * 2)) - totalStackGapH;
            const stackItemH = Math.max(availableStackH / stackWs.length, 150);

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
