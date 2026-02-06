import { writable } from 'svelte/store';

// Legacy: activeCorner might be deprecated or used for button highlight state only
export const activeCorner = writable(null);

/**
 * @typedef {Object} WindowData
 * @property {string} id
 * @property {string} title
 * @property {any} [component]
 * @property {object} [props]
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {number} z
 * @property {boolean} [min]
 */

// New: Multi-window management
/** @type {import('svelte/store').Writable<WindowData[]>} */
export const windows = writable([]);

export const isAdmin = writable(false);
export const musicState = writable({
    isPlaying: false,
    currentTrack: 0,
    title: 'LOFI_STATION_1',
    artist: 'BUFFERING...'
});
