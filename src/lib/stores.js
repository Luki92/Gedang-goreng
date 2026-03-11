import { writable } from 'svelte/store';

export const activeCorner = writable(null);
export const isAdmin = writable(false);
export const musicState = writable({
    isPlaying: false,
    currentTrack: 0,
    title: 'LOFI_STATION_1',
    artist: 'BUFFERING...',
    youtube_id: null
});
