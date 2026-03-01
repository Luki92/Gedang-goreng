<script>
    import { onMount, mount } from 'svelte';
    import { dataStore } from '$lib/stores/data.svelte.js';
    import { portalStore } from '$lib/stores/portal.svelte.js';
    import AvatarFrame from './AvatarFrame.svelte';

    onMount(() => {
        dataStore.fetchProfile();
    });

    let profile = $derived(dataStore.profile || {
        full_name: 'Luki',
        avatar_url: null,
        bio: '<within><p>Dreaming...</p></within><outside></outside>'
    });

    /** @type {HTMLElement | undefined} */
    let contentEl = $state();

    let withinHtml = $derived.by(() => {
        const raw = profile.bio || '';
        const match = raw.match(/<within>([\s\S]*?)<\/within>/);
        return match ? match[1] : raw;
    });

    let outsideHtml = $derived.by(() => {
        const raw = profile.bio || '';
        const match = raw.match(/<outside>([\s\S]*?)<\/outside>/);
        return match ? match[1] : '';
    });

    $effect(() => {
        if (profile) {
            portalStore.register('identity', outsideHtml);
            setTimeout(() => {
                if (contentEl) processContent(contentEl);
            }, 50);
        }
        return () => portalStore.unregister('identity');
    });

    /** @param {HTMLElement} container */
    function processContent(container) {
        // Handle scripts
        const scripts = container.querySelectorAll('script');
        scripts.forEach((/** @type {HTMLScriptElement} */ oldScript) => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            if (oldScript.parentNode) oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        // Mount Avatar Frame
        const avatarPlaceholders = container.querySelectorAll('luki-avatar-frame');
        avatarPlaceholders.forEach((/** @type {Element} */ el) => {
            /** @type {Record<string, any>} */
            const props = { avatarUrl: profile.avatar_url };
            Array.from(el.attributes).forEach(attr => { props[attr.name] = attr.value; });
            mount(AvatarFrame, { target: el, props });
        });
    }
</script>

<div id="identity-window" class="h-full flex flex-col overflow-hidden">
    <div class="mb-8 shrink-0">
        <h1 class="text-4xl md:text-6xl font-bold mb-2 leading-tight tracking-tight text-white">{profile.full_name}.</h1>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div bind:this={contentEl} class="identity-content min-h-full">
            {#if !withinHtml.includes('<luki-avatar-frame')}
                <div class="flex flex-col md:flex-row gap-8 items-start">
                    <luki-avatar-frame size="md" isIdentityFrame="true"></luki-avatar-frame>
                    <div class="flex-1">
                        {@html withinHtml}
                    </div>
                </div>
            {:else}
                {@html withinHtml}
            {/if}
        </div>
    </div>
</div>

<style>
    .identity-content :global(p) { line-height: 1.8; color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem; }
    .identity-content :global(style) { display: none; }
</style>
