<script>
	import '../app.css';
	import '@phosphor-icons/web/fill';
	import PortalRenderer from '$lib/components/PortalRenderer.svelte';

	let { children } = $props();
</script>

<PortalRenderer />
{@render children()}
