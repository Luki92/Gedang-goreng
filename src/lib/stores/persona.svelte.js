import { supabase } from '$lib/supabaseClient';

class PersonaStore {
    assets = $state([]);
    triggers = $state([]);
    currentExpression = $state('idle');
    currentMessage = $state('');
    isSpeaking = $state(false);
    isBlinking = $state(false);
    lastInteraction = $state(Date.now());
    sayTimeout;

    // Hardcoded defaults to ensure he always speaks
    defaults = [
        { type: 'COLLISION', msg: "HEY! Don't cover me with that!", exp: 'angry' },
        { type: 'COLLISION', msg: "I'm right here, move it!", exp: 'angry' },
        { type: 'CLICK', msg: "Stop poking me!", exp: 'blink' },
        { type: 'IDLE', msg: "Still here? Go click something.", exp: 'idle' },
        { type: 'BROWSER', val: 'Edge', msg: "Using Edge in '26? Brave choice.", exp: 'blink' },
        { type: 'RESOLUTION', val: '1920x1080', msg: "Nice 1080p monitor. Very... classic.", exp: 'idle' }
    ];

    constructor() {
        this.fetchData();
        this.startAnimationLoop();
    }

    async fetchData() {
        const [assetsRes, triggersRes] = await Promise.all([
            supabase.from('persona_assets').select('*'),
            supabase.from('persona_triggers').select('*')
        ]);
        if (assetsRes.data) this.assets = assetsRes.data;
        if (triggersRes.data) this.triggers = triggersRes.data;
    }

    say(message, expressionId = 'idle', duration = 4000) {
        this.currentMessage = message;
        this.currentExpression = expressionId;
        this.isSpeaking = true;
        this.lastInteraction = Date.now();
        if (this.sayTimeout) clearTimeout(this.sayTimeout);
        this.sayTimeout = setTimeout(() => {
            this.currentMessage = '';
            this.isSpeaking = false;
            this.currentExpression = 'idle';
        }, duration);
    }

    getAsset(expressionId) {
        return this.assets.find(a => a.expression_id === expressionId)?.image_url ||
               this.assets.find(a => a.expression_id === 'idle')?.image_url;
    }

    triggerRandom(type, value = null) {
        // Search DB triggers first
        let pool = this.triggers.filter(t => t.trigger_type === type && (!value || t.trigger_value === value));

        // Fallback to defaults
        if (pool.length === 0) {
            pool = this.defaults.filter(d => d.type === type && (!value || d.val === value));
        }

        if (pool.length > 0) {
            const chosen = pool[Math.floor(Math.random() * pool.length)];
            this.say(chosen.message || chosen.msg, chosen.expression_id || chosen.exp || 'idle');
            return true;
        }
        return false;
    }

    startAnimationLoop() {
        const loop = () => {
            if (!this.isBlinking && Math.random() < 0.05) {
                this.isBlinking = true;
                setTimeout(() => { this.isBlinking = false; }, 150);
            }
            if (Date.now() - this.lastInteraction > 60000) {
                this.triggerRandom('IDLE');
                this.lastInteraction = Date.now();
            }
            setTimeout(loop, 3000);
        };
        if (typeof window !== 'undefined') loop();
    }
}

export const personaStore = new PersonaStore();
