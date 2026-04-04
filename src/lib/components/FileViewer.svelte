<script>
    import { portalStore } from '$lib/stores/portal.svelte.js';
    import AvatarFrame from './AvatarFrame.svelte';
    import { mount } from 'svelte';

    /** @type {{ item?: any, embed?: boolean }} */
    let { item = undefined, embed = false } = $props();

    /** @type {HTMLElement | undefined} */
    let contentEl = $state();

    // Date formatting logic
    let formattedDate = $derived.by(() => {
        if (!item || !item.created_at) return '';
        try {
            return new Intl.DateTimeFormat(navigator.language, {
                dateStyle: 'long'
            }).format(new Date(item.created_at));
        } catch (e) {
            return item.date || '';
        }
    });

    let withinHtml = $derived.by(() => {
        const raw = item?.content || item?.description || '';
        const match = raw.match(/<within>([\s\S]*?)<\/within>/);
        return match ? match[1] : raw;
    });

    let outsideHtml = $derived.by(() => {
        const raw = item?.content || '';
        const match = raw.match(/<outside>([\s\S]*?)<\/outside>/);
        return match ? match[1] : '';
    });

    $effect(() => {
        if (item) {
            portalStore.register(`item-${item.id}`, outsideHtml);
            setTimeout(() => {
                if (contentEl) processContent(contentEl);
            }, 50);
        }
        return () => {
            if (item) portalStore.unregister(`item-${item.id}`);
        };
    });

    /** @param {HTMLElement} container */
    function processContent(container) {
        // 1. Handle scripts
        const scripts = container.querySelectorAll('script');
        scripts.forEach((/** @type {HTMLScriptElement} */ oldScript) => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            if (oldScript.parentNode) oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        // 2. Handle styles
        const styles = container.querySelectorAll('style');
        styles.forEach(style => {
            document.head.appendChild(style.cloneNode(true));
        });

        // 3. Mount Svelte Components
        const avatarPlaceholders = container.querySelectorAll('luki-avatar-frame');
        avatarPlaceholders.forEach((/** @type {Element} */ el) => {
            /** @type {Record<string, any>} */
            const props = {};
            Array.from(el.attributes).forEach(attr => { props[attr.name] = attr.value; });
            mount(AvatarFrame, { target: el, props });
        });
    }
</script>

<div id={item ? `window-${item.id}` : ''} class="file-viewer h-full w-full bg-transparent text-white flex flex-col overflow-hidden" class:p-6={!embed}>
    {#if !item}
        <div class="flex items-center justify-center h-full text-gray-500 font-mono animate-pulse">
            <p>// NULL_POINTER: NO_DATA</p>
        </div>
    {:else}
        <div class="mb-8 shrink-0">
             <h1 class="text-4xl md:text-6xl font-bold mb-2 leading-tight tracking-tight text-white selectable">{item.title}</h1>
             <div class="text-sm text-gray-500 font-mono tracking-wider opacity-60">
                 {formattedDate}
             </div>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 selectable">
             <div bind:this={contentEl} class="luki-free-content min-h-full">
                 {@html withinHtml}
             </div>
        </div>
    {/if}
</div>

<style>
    .luki-free-content :global(h1) { font-size: 3rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1.5rem; }
    .luki-free-content :global(h2) { font-size: 2rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 1rem; }
    .luki-free-content :global(p) { margin-bottom: 1.25rem; line-height: 1.8; color: rgba(255, 255, 255, 0.8); }
    .luki-free-content :global(style) { display: none; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
</style>
