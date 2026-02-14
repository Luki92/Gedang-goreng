import { supabase } from '$lib/supabaseClient';
import { isAdmin } from '$lib/stores';
import { get } from 'svelte/store';

class DataStore {
    /** @type {any[]} */
    works = $state([]);
    /** @type {any[]} */
    portalItems = $state([]);
    /** @type {any} */
    profile = $state({ full_name: 'Luki', bio: 'Loading...', status: 'Offline', socials: {} });
    /** @type {any[]} */
    playlist = $state([]);
    /** @type {any[]} */
    guestbook = $state([]);
    /** @type {any[]} */
    allGuestbook = $state([]); // For admin moderation

    loading = $state(true);
    error = $state(null);

    constructor() {
        // Auto-fetch on mount logic handled by components
    }

    async refreshAll() {
        await Promise.all([
            this.fetchWorks(),
            this.fetchPortal(),
            this.fetchProfile(),
            this.fetchPlaylist(),
            this.fetchGuestbook()
        ]);
    }

    async fetchWorks() {
        // Fetch all if admin, else published only
        // RLS handles visibility, so just select *
        const { data, error } = await supabase
            .from('works')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching works:', error);
            // Fallback to empty or mock if needed
        } else {
            this.works = data || [];
        }
    }

    async fetchPortal() {
        const { data, error } = await supabase
            .from('portal_items')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) console.error('Error fetching portal:', error);
        else {
            this.portalItems = data || [];
        }
    }

    async fetchProfile() {
        const { data, error } = await supabase
            .from('profile')
            .select('*')
            .maybeSingle(); // Use maybeSingle to avoid 406 if none exist

        if (error) {
            console.warn('Profile fetch warning:', error.message);
        } else if (data) {
            this.profile = data;
        }
    }

    async fetchPlaylist() {
        const { data, error } = await supabase
            .from('playlist')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) console.error('Error fetching playlist:', error);
        else {
            this.playlist = data || [];
        }
    }

    async fetchGuestbook() {
        // Public sees approved, Admin sees all via RLS
        const { data, error } = await supabase
            .from('guestbook')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching guestbook:', error);
        else {
            this.guestbook = data || [];
        }
    }
}

export const dataStore = new DataStore();
