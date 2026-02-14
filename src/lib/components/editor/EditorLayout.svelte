<script>
	import { windowManager } from '$lib/windowManager.svelte.js';
	let { title = 'Editor', children, accentColor = 'gray' } = $props();
</script>

<div class="h-full flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
	<!-- Toolbar -->
	<div class="shrink-0 border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<h1 class="text-lg font-semibold text-gray-900">{title}</h1>
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

