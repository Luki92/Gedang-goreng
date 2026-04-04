<script>
	let { title = 'Editor', children, toolbar } = $props();
</script>

<div class="h-full flex flex-col bg-transparent text-white/90">
	<!-- Header -->
	<div class="shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-md px-6 py-3 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<h1 class="text-lg font-semibold text-white tracking-widest uppercase text-xs opacity-50">{title}</h1>
		</div>
		<div class="flex items-center gap-2">
			{#if toolbar}
				{@render toolbar()}
			{/if}
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-hidden">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
