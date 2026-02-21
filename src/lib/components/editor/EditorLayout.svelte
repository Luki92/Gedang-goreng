<script>
	import { windowManager } from '$lib/windowManager.svelte.js';
	let { title = 'Editor', children, accentColor = 'gray' } = $props();
</script>

<div class="h-full flex flex-col bg-transparent text-white/90">
	<!-- Toolbar -->
	<div class="shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-md px-6 py-3 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<h1 class="text-lg font-semibold text-white">{title}</h1>
		</div>
		<div class="flex items-center gap-2">
			<slot name="toolbar" />
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-hidden">
		<slot />
	</div>
</div>

