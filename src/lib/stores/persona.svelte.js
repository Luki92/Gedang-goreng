import { supabase } from '$lib/supabaseClient';

/**
 * @typedef {Object} PersonaAsset
 * @property {string} expression_id
 * @property {string} image_url
 */

/**
 * @typedef {Object} PersonaTrigger
 * @property {string} trigger_type
 * @property {string|null} trigger_value
 * @property {string} message
 * @property {string} expression_id
 */

class PersonaStore {
    /** @type {PersonaAsset[]} */
    assets = $state([]);
    /** @type {PersonaTrigger[]} */
    triggers = $state([]);

    /** @type {string} */
    currentExpression = $state('idle');
    /** @type {string} */
    currentMessage = $state('');
    /** @type {boolean} */
    isSpeaking = $state(false);

    // UI State
    /** @type {boolean} */
    isBlinking = $state(false);
    /** @type {number} */
    lastInteraction = $state(Date.now());

    /** @type {ReturnType<typeof setTimeout> | undefined} */
    sayTimeout;

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

    /**
     * @param {string} message
     * @param {string} expressionId
     * @param {number} duration
     */
    say(message, expressionId = 'idle', duration = 5000) {
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

    /**
     * @param {string} expressionId
     * @returns {string | undefined}
     */
    getAsset(expressionId) {
        return this.assets.find(a => a.expression_id === expressionId)?.image_url ||
               this.assets.find(a => a.expression_id === 'idle')?.image_url;
    }

    startAnimationLoop() {
        const loop = () => {
            // Random blinking
            if (!this.isBlinking && Math.random() < 0.05) {
                this.isBlinking = true;
                setTimeout(() => { this.isBlinking = false; }, 150);
            }

            // Idle check for randomized roasts could go here
            const now = Date.now();
            if (now - this.lastInteraction > 30000) { // 30s idle
                this.triggerRandom('IDLE');
                this.lastInteraction = now;
            }

            setTimeout(loop, 2000 + Math.random() * 3000);
        };

        if (typeof window !== 'undefined') loop();
    }

    /**
     * @param {string} type
     * @param {string|null} value
     */
    triggerRandom(type, value = null) {
        const pool = this.triggers.filter(t => t.trigger_type === type && (!value || t.trigger_value === value));
        if (pool.length > 0) {
            const random = pool[Math.floor(Math.random() * pool.length)];
            this.say(random.message, random.expression_id || 'idle');
        }
    }
}

export const personaStore = new PersonaStore();
