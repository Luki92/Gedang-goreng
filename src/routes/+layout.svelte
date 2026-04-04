<script>
	import '../app.css';
	import '@phosphor-icons/web/regular';
	import PortalRenderer from '$lib/components/PortalRenderer.svelte';

	let { children } = $props();
</script>

<PortalRenderer />
{@render children()}
