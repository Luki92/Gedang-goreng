<script>
    import { onMount } from 'svelte';
    import { musicState } from '$lib/stores';
    import { dataStore } from '$lib/stores/data.svelte.js';

    let loaded = false;
    let player;

    onMount(async () => {
        await dataStore.fetchPlaylist();

        // Load YouTube API if not already loaded
        if (!window.YT) {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            loaded = true;
            initPlayer();
        };

        if (window.YT && window.YT.Player) {
            loaded = true;
            initPlayer();
        }
    });

    // Reactive playlist from store
    let playlist = $derived(dataStore.playlist);

    $effect(() => {
        if (playlist.length > 0 && loaded && !player) {
            initPlayer();
        }
    });

    function initPlayer() {
        if (!loaded || playlist.length === 0) return;

        // Destroy existing if re-init (though unlikely needed if we just update cue)
        // But the first video needs to be correct.
        const firstId = playlist[$musicState.currentTrack]?.youtube_id || playlist[0].youtube_id;

        player = new window.YT.Player('yt-player', {
            height: '0', width: '0',
            videoId: firstId,
            playerVars: { 'playsinline': 1, 'controls': 0, 'disablekb': 1 },
            events: { 'onStateChange': onPlayerStateChange }
        });
        updateTrackInfo();
    }

    function onPlayerStateChange(event) {
        if (event.data == window.YT.PlayerState.PLAYING) {
            $musicState.isPlaying = true;
        } else {
            $musicState.isPlaying = false;
        }
    }

    function togglePlay() {
        if(!player) return;
        if ($musicState.isPlaying) player.pauseVideo();
        else player.playVideo();
    }

    function changeTrack(dir) {
        if (playlist.length === 0) return;
        let next = $musicState.currentTrack + dir;
        if (next >= playlist.length) next = 0;
        if (next < 0) next = playlist.length - 1;

        $musicState.currentTrack = next;

        if (player) {
            player.loadVideoById(playlist[next].youtube_id);
        }
        updateTrackInfo();
    }

    function updateTrackInfo() {
        if (playlist[$musicState.currentTrack]) {
            $musicState.title = playlist[$musicState.currentTrack].title;
            $musicState.artist = playlist[$musicState.currentTrack].artist;
            // Add lyrics to musicState for the main page to consume if needed
            // We might need to extend musicState structure in a future update
            // For now, title/artist is enough.
        }
    }
</script>

<div class="h-full flex flex-col justify-center items-center relative overflow-hidden">
    {#if playlist.length === 0}
         <div class="text-xs text-gray-500 animate-pulse">LOADING_AUDIO...</div>
    {:else}
        <!-- Visualizer Mockup -->
        <div class="flex items-end gap-1 h-16 mb-6">
            <div class="w-2 bg-blue-500 animate-[bounce_1s_infinite]"></div>
            <div class="w-2 bg-purple-500 animate-[bounce_1.2s_infinite]"></div>
            <div class="w-2 bg-pink-500 animate-[bounce_0.8s_infinite]"></div>
            <div class="w-2 bg-blue-500 animate-[bounce_1.5s_infinite]"></div>
            <div class="w-2 bg-white animate-[bounce_0.5s_infinite]"></div>
        </div>

        <!-- Song Info -->
        <h3 class="text-xl text-white font-bold mb-1 text-center px-4">{$musicState.title}</h3>
        <p class="text-xs text-gray-500 mb-8">{$musicState.artist}</p>

        <!-- Custom Controls -->
        <div class="flex gap-6 items-center z-20">
            <button onclick={() => changeTrack(-1)} class="text-gray-400 hover:text-white text-2xl"><i class="ph ph-skip-back"></i></button>
            <button onclick={togglePlay} class="w-16 h-16 rounded-full border border-white flex items-center justify-center text-2xl hover:bg-white hover:text-black transition-all">
                <i class="ph {$musicState.isPlaying ? 'ph-pause' : 'ph-play'}"></i>
            </button>
            <button onclick={() => changeTrack(1)} class="text-gray-400 hover:text-white text-2xl"><i class="ph ph-skip-forward"></i></button>
        </div>

        <p class="text-[10px] text-gray-600 mt-8 font-[VT323]">POWERED BY YOUTUBE API (HIDDEN)</p>
    {/if}

    <!-- Hidden Youtube Container -->
    <div id="yt-player" class="absolute pointer-events-none opacity-0 h-0 w-0"></div>
</div>
