import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const supabaseUrl = (env && env.PUBLIC_SUPABASE_URL) || 'https://placeholder.supabase.co';
const supabaseAnonKey = (env && env.PUBLIC_SUPABASE_ANON_KEY) || 'placeholder-key';

// Ensure URL is valid to prevent 500 errors if env var is malformed or missing logic fails
const isValidUrl = (url) => {
    try {
        if (!url || typeof url !== 'string') return false;
        const parsedUrl = new URL(url);
        // Supabase client requires http or https protocol
        return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
    } catch (e) {
        return false;
    }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co';

export const supabase = createClient(finalUrl, supabaseAnonKey);
