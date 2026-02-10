<script>
    import { onMount } from 'svelte';
    import { isAdmin } from '$lib/stores';

    let uptime = $state('0d 0h 0m');
    let resolution = $state('1920x1080');

    onMount(() => {
        // Calculate uptime based on some arbitrary start date or just mock it
        const start = new Date('2024-01-01T00:00:00');
        const now = new Date();
        const diff = now - start;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        uptime = `${days}d ${hours}h ${minutes}m`;

        if (typeof window !== 'undefined') {
            resolution = `${window.innerWidth}x${window.innerHeight}`;
        }
    });

    const user = $derived($isAdmin ? 'root' : 'guest');

    const logo = `
                 ~>)>)>*.>>)>)>:~======:
                ~>>>)>= >>)>)>)>::~=~=~=:
               ~>)>>>~:>)>>>>>>)>=.======~
              ~>>>)>~ *>>)>)>)>>)>=.=~=~=~~
             =>)>)>~  ^>)>>>>>)>>)>~:==~===:         ~.
            =>)>>>.   ^>>)>)*~>)>>)>=.==~===~       ~=~.
           =)>)>)>)>)>)>)>>)^ ~>)>>>>^ ==~=~=~     ==~==.
          *)>)>>)>>>>>>>>)>>^  =>)>)>>*.~===~==   ~=~=~=~
         ^>>)>)>>)>)>)>)>>)>^   ~>)>)>)*:~=~=~=~.~=====~.>=
        :~~~~~~~~~~~~~~~~~~~:    .~~~~~~. ========~=~=:~>>)=
       ~==================~                ~=~=~=====:~>)>>>*
      ~=~===~==~=~=~=~===~                  ~===~=~=:~>>>)>)*
     ~===~===~========~=~                    ~=====:~>)>)>>~
    ~=~=~=~  . .:~=~=~=~                      ~~=~.=>>>>>>=
   ~=====:     .====~=~                        ~~.*>)>)>)~     *^
  ~=~=~=:     :=~=~==~                          .=)>>)>>~     ^>>>
  ~=====~    ~======:                           *>>)>>):     ^>)>)^
   ~~=====  :=~=~=~~:>^                        ^>)>>)>:     >>)>>>^.
    ~=~=~=~~=====~:.>>>>                      ^)>>)>)>>>>>>>>)>)>>
     :=~===~==~=~::)>)>>^                    ^>>)>>)>)>>)>)>>>>>^
      :=~=~=~==~: ~>>>)>)^.                 ^>)>>)>>>>)>>>>))>)*
       :=====~=:   :>)>>>>>                >>)>)>>^***********~
        :~=~==.     :>>)>)>>. ...............................
         :==~.       :>>>)>)>~:=~=~=~=~=~=========~=~=~=~=~=.
          .=.         ~>)>>>>>~~=========~=~=~=~===========.
                       .>)>)>)>:~=~==~==========~===~==~=~.
                        .>>>>>>>~      :~=~=~==~=:
                         .^)>)>)>=    ~====~=~====~
                                     ~=~=~=~~=~=~=~=
                            >>>>>>>=.=====~  :=====~~
                             ^>)>)>>= =~=~    .=~=~=~
                              *>)>)>)^ ~~      .====
`;
</script>

<div class="flex flex-col md:flex-row gap-6 p-4 font-mono text-sm overflow-hidden w-full max-w-full">
    <!-- Logo Column -->
    <div class="hidden sm:block shrink-0">
        <pre class="text-blue-400 font-bold leading-[1.15] select-none text-[10px] md:text-xs">
{logo}
        </pre>
    </div>

    <!-- Info Column -->
    <div class="flex flex-col justify-center min-w-0 flex-1 space-y-1">
        <div class="mb-2">
            <span class="text-blue-400 font-bold">{user}@LukiOS</span>
            <div class="text-gray-500">------------------</div>
        </div>

        <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <span class="text-blue-400">OS:</span> <span class="text-gray-300">NixOS 25.11 (Caffeinated) x86_64</span>
            <span class="text-blue-400">Kernel:</span> <span class="text-gray-300">6.1.72-nixos</span>
            <span class="text-blue-400">Uptime:</span> <span class="text-gray-300">{uptime}</span>
            <span class="text-blue-400">Shell:</span> <span class="text-gray-300">bash 5.2.15</span>
            <span class="text-blue-400">Resolution:</span> <span class="text-gray-300">{resolution}</span>
            <span class="text-blue-400">DE:</span> <span class="text-gray-300">TWM (Svelte-based)</span>
            <span class="text-blue-400">WM:</span> <span class="text-gray-300">LukiWM</span>
            <span class="text-blue-400">Theme:</span> <span class="text-gray-300">Void Dark [GTK2/3]</span>
            <span class="text-blue-400">Icons:</span> <span class="text-gray-300">Phosphor [GTK2/3]</span>
            <span class="text-blue-400">Terminal:</span> <span class="text-gray-300">LukiTerm 3.0.0</span>
            <span class="text-blue-400">CPU:</span> <span class="text-gray-300">Silicon Heart (12% Load)</span>
            <span class="text-blue-400">Memory:</span> <span class="text-gray-300">64% / 100% (Leaking)</span>
        </div>

        <div class="mt-4 flex gap-2">
            <div class="w-8 h-4 bg-black"></div>
            <div class="w-8 h-4 bg-red-500"></div>
            <div class="w-8 h-4 bg-green-500"></div>
            <div class="w-8 h-4 bg-yellow-500"></div>
            <div class="w-8 h-4 bg-blue-500"></div>
            <div class="w-8 h-4 bg-purple-500"></div>
            <div class="w-8 h-4 bg-cyan-500"></div>
            <div class="w-8 h-4 bg-gray-200"></div>
        </div>
    </div>
</div>
