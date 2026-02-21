<script>
    import { portalStore } from '$lib/stores/portal.svelte.js';
</script>

<div class="portal-root fixed inset-0 pointer-events-none z-[100]">
    {#each [...portalStore.portals.entries()] as [id, portal]}
        <div id="portal-{id}" class="portal-entry absolute inset-0 pointer-events-none">
            {#if portal.type === 'html'}
                {@html portal.content}
            {/if}
        </div>
    {/each}
</div>

<style>
    .portal-entry :global(*) {
        pointer-events: auto;
    }
</style>
