import { personaStore } from './stores/persona.svelte.js';

class WindowManager {
    windows = $state([]);
    activeWindowId = $state(null);
    masterWindowId = $state(null);
    innerGap = $state(15);
    outerGap = $derived(this.windows.filter(w => !w.minimized).length > 1 ? 100 : 40);
    isDragging = $state(false);

    registry = new Map();
    iconMap = {
        'terminal': 'ph-terminal-window',
        'c-tr': 'ph-archive-tray',
        'c-tl': 'ph-user-focus',
        'c-bl': 'ph-music-notes',
        'c-br': 'ph-globe-hemisphere-east'
    };

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => this.recalculateLayout());
            window.windowManager = this; // Explicit global exposure
        }
    }

    register(id, component) { this.registry.set(id, component); }

    open(id, options = {}) {
        const component = this.registry.get(options.componentId || id);
        if (!component) return;

        const existing = this.windows.find(w => w.id === id);
        if (existing) {
            existing.minimized = false;
            this.focus(id);
            return;
        }

        const width = options.width || (id === 'terminal' ? 950 : 600);
        const height = options.height || (id === 'terminal' ? 650 : 450);

        const newWindow = $state({
            id,
            component,
            props: options.props || {},
            title: options.title || id.toUpperCase(),
            x: (window.innerWidth - width) / 2,
            y: (window.innerHeight - height) / 2,
            width,
            height,
            zIndex: 10,
            state: 'opening',
            isTiled: options.isTiled !== undefined ? options.isTiled : true,
            isMaximized: false,
            minimized: false
        });

        this.windows.push(newWindow);
        if (!this.masterWindowId && newWindow.isTiled) this.masterWindowId = id;

        this.focus(id);
        this.recalculateLayout();

        setTimeout(() => { newWindow.state = 'open'; }, 50);
        personaStore.triggerRandom('WINDOW_OPEN', id);
    }

    close(id) {
        const w = this.windows.find(w => w.id === id);
        if (!w) return;
        w.state = 'closing';
        setTimeout(() => {
            this.windows = this.windows.filter(win => win.id !== id);
            if (this.masterWindowId === id) {
                const next = this.windows.find(win => win.isTiled);
                this.masterWindowId = next ? next.id : null;
            }
            this.recalculateLayout();
        }, 600);
    }

    focus(id) {
        this.activeWindowId = id;
        const w = this.windows.find(w => w.id === id);
        if (w) {
            w.minimized = false;
            w.zIndex = Math.max(...this.windows.map(win => win.zIndex), 10) + 1;
            this.recalculateLayout();
        }
    }

    toggle(id, options = {}) {
        if (this.windows.find(w => w.id === id)) this.close(id);
        else this.open(id, options);
    }

    recalculateLayout() {
        const tiled = this.windows.filter(w => w.isTiled && w.state !== 'closing' && !w.minimized);
        if (tiled.length === 0) return;

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const gap = this.outerGap;

        if (tiled.length === 1) {
            const w = tiled[0];
            w.width = Math.min(screenW * 0.8, 1400);
            w.height = Math.min(screenH * 0.8, 1000);
            w.x = (screenW - w.width) / 2;
            w.y = (screenH - w.height) / 2;
            return;
        }

        const master = tiled.find(w => w.id === this.masterWindowId) || tiled[0];
        const stacks = tiled.filter(w => w.id !== master.id);
        const availW = screenW - (gap * 2) - (stacks.length > 0 ? this.innerGap : 0);

        master.x = gap;
        master.y = gap;
        master.width = stacks.length > 0 ? availW * 0.6 : availW;
        master.height = screenH - (gap * 2);

        if (stacks.length > 0) {
            const sH = (screenH - (gap * 2) - (stacks.length - 1) * this.innerGap) / stacks.length;
            stacks.forEach((s, i) => {
                s.x = gap + master.width + this.innerGap;
                s.y = gap + i * (sH + this.innerGap);
                s.width = availW * 0.4;
                s.height = sH;
            });
        }
    }
}

export const windowManager = new WindowManager();
