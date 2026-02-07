<script>
    import { onMount } from 'svelte';
    import { musicState } from '$lib/stores';

    const playlist = [
        { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio', artist: 'Lofi Girl' },
        { id: '5yx6BWlEVcY', title: 'Chillhop Essentials', artist: 'Chillhop' },
        { id: '4xDzrJKXOOY', title: 'synthwave radio', artist: 'Lofi Girl' }
    ];

    // Initial deterministic state for SSR/Hydration match
    let bars = Array(20).fill(0).map((_, i) => ({
        duration: 1.0 + (i * 0.05),
        delay: 0
    }));

    let player;
    let loaded = false;

    onMount(() => {
        // Randomize visualizer on client mount to look organic
        bars = bars.map(() => ({
            duration: 0.7 + Math.random() * 0.8,
            delay: Math.random() * -1.0
        }));

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

    function initPlayer() {
        if (!loaded) return;
        player = new window.YT.Player('yt-player', {
            height: '0', width: '0',
            videoId: playlist[$musicState.currentTrack].id,
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
        let next = $musicState.currentTrack + dir;
        if (next >= playlist.length) next = 0;
        if (next < 0) next = playlist.length - 1;

        $musicState.currentTrack = next;

        if (player) {
            player.loadVideoById(playlist[next].id);
        }
        updateTrackInfo();
    }

    function updateTrackInfo() {
        $musicState.title = playlist[$musicState.currentTrack].title;
        $musicState.artist = playlist[$musicState.currentTrack].artist;
    }
</script>

<div class="h-full flex flex-col justify-center items-center relative overflow-hidden group">
    <!-- Visualizer Mockup -->
    <div class="flex items-end justify-center gap-1 h-32 w-full mb-6 px-8">
        {#each bars as bar}
            <div
                class="w-1.5 bg-[#5555ff] opacity-60 group-hover:opacity-100 transition-opacity duration-300 rounded-t-sm shadow-[0_0_5px_rgba(85,85,255,0.5)]"
                style="
                    height: 10%;
                    animation: equalizer {bar.duration}s ease-in-out infinite alternate;
                    animation-delay: {bar.delay}s;
                    animation-play-state: {$musicState.isPlaying ? 'running' : 'paused'};
                "
            ></div>
        {/each}
    </div>

    <!-- Song Info -->
    <h3 class="text-xl text-white font-bold mb-1">{$musicState.title}</h3>
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

    <!-- Hidden Youtube Container -->
    <div id="yt-player" class="absolute pointer-events-none opacity-0 h-0 w-0"></div>
</div>

<style>
    @keyframes equalizer {
        0% { height: 10%; }
        100% { height: 90%; }
    }
</style>
