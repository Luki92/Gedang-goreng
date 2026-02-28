<script>
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { musicState } from '$lib/stores';
    import { onMount } from 'svelte';

    /** @type {{previewTrack?: any}} */
    let { previewTrack = null } = $props();

    onMount(() => {
        if (!previewTrack) {
            dataStore.fetchPlaylist();
        }
    });

    let tracks = $derived(previewTrack ? [previewTrack] : dataStore.playlist);

    /** @param {any} track */
    function playTrack(track) {
        musicState.set({
            isPlaying: true,
            currentTrack: 0,
            title: track.title,
            artist: track.artist,
            youtube_id: track.youtube_id
        });
    }
</script>

<div class="h-full flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
    {#if !previewTrack && dataStore.loading && tracks.length === 0}
        <div class="p-4 text-center text-gray-500 animate-pulse">SYNCHRONIZING_AUDIO_STREAM...</div>
    {:else}
        <div class="space-y-2">
            {#each tracks as track}
                <button
                    onclick={() => playTrack(track)}
                    class="w-full p-4 border border-white/5 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all flex items-center gap-4 group text-left rounded-xl">
                    <div class="w-12 h-12 bg-white/5 flex items-center justify-center rounded-lg group-hover:bg-pink-500/20 transition-colors">
                        <i class="ph ph-play-circle-fill text-2xl text-white/40 group-hover:text-pink-500"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-white truncate uppercase tracking-wider text-sm">{track.title}</div>
                        <div class="text-xs text-white/40 uppercase font-mono">{track.artist}</div>
                    </div>
                </button>
            {/each}
        </div>
    {/if}

    {#if tracks.length > 0 && tracks[0].lyrics_content}
        <div class="mt-8 p-6 bg-black/40 border border-white/5 rounded">
            <h4 class="text-xs font-mono text-pink-500/60 uppercase mb-4 tracking-[0.2em]">Data_Log: Lyrics</h4>
            <pre class="text-xs text-white/60 leading-relaxed font-mono whitespace-pre-wrap">{tracks[0].lyrics_content}</pre>
        </div>
    {/if}
</div>
