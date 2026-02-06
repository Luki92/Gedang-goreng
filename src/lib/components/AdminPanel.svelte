<script>
    import { isAdmin, musicState, windows, openWindow, adminContent } from '$lib/stores';
    import { fade, fly } from 'svelte/transition';
    import Window from './Window.svelte';

    // Admin state
    let activeTab = $state('general'); // general | identity | vault | audio | docs

    // Bind to Store
    let thinkingText = $state($adminContent.welcomeTitle);
    let easterEggText = $state($adminContent.easterEggText);

    let newTrackUrl = $state("");
    let newTrackTitle = $state("");
    let docsContent = $state($adminContent.docContent);

    async function loadDocs() {
        // In a real app, fetch from DB
        docsContent = $adminContent.docContent;
    }

    function saveGeneral() {
        // Update the global store
        adminContent.update(c => ({
            ...c,
            welcomeTitle: thinkingText,
            easterEggText: easterEggText
        }));
        alert(`SAVED SESSION CHANGES`);
    }

    function addTrack() {
        if (!newTrackTitle) return;
        alert(`ADDED TRACK: ${newTrackTitle}`);
        newTrackTitle = "";
        newTrackUrl = "";
    }
</script>

{#if $isAdmin}
    <!-- We don't render Window directly here because it's managed by +page.svelte via store -->
    <!-- Instead, we provide the CONTENT for the window if it exists -->
    <!-- Wait, our architecture is: +page.svelte renders ALL windows in $windows store. -->
    <!-- So we need to inject this component INTO the windows store? -->
    <!-- Yes. The 'component' property in stores.js was meant for this, or we switch in +page.svelte. -->
    <!-- Current +page.svelte uses if/else based on ID. We need to add admin case there. -->
{/if}

<!-- This file is now just the CONTENT of the Admin Panel -->
<div class="admin-layout">
    <nav class="sidebar">
        <button class:active={activeTab === 'general'} onclick={() => activeTab = 'general'}>GENERAL</button>
        <button class:active={activeTab === 'identity'} onclick={() => activeTab = 'identity'}>IDENTITY</button>
        <button class:active={activeTab === 'vault'} onclick={() => activeTab = 'vault'}>VAULT</button>
        <button class:active={activeTab === 'audio'} onclick={() => activeTab = 'audio'}>AUDIO</button>
        <button class:active={activeTab === 'docs'} onclick={() => { activeTab = 'docs'; loadDocs(); }}>DOCS</button>
    </nav>

    <div class="main-content custom-scrollbar">
        {#if activeTab === 'general'}
            <div class="section">
                <h3>MAIN TITLE TEXT</h3>
                <input type="text" bind:value={thinkingText} class="admin-input" />

                <h3>EASTER EGG TEXT</h3>
                <input type="text" bind:value={easterEggText} class="admin-input" />

                <button class="action-btn" onclick={saveGeneral}>SAVE CHANGES</button>
            </div>
        {/if}

        {#if activeTab === 'audio'}
            <div class="section">
                <h3>ADD NEW TRACK</h3>
                <input type="text" placeholder="Track Title" bind:value={newTrackTitle} class="admin-input" />
                <input type="text" placeholder="Stream URL" bind:value={newTrackUrl} class="admin-input" />
                <button class="action-btn" onclick={addTrack}>UPLOAD TRACK</button>

                <hr class="divider"/>
                <h3>CURRENT PLAYLIST</h3>
                <div class="list">
                    <div class="item">LOFI_STATION_1 [ACTIVE] <button class="sm-btn">DEL</button></div>
                </div>
            </div>
        {/if}

        {#if activeTab === 'docs'}
            <div class="section">
                <pre class="docs-view">{docsContent}</pre>
            </div>
        {/if}

        <!-- Other tabs placeholders -->
        {#if activeTab === 'identity' || activeTab === 'vault'}
            <div class="section center">
                <p>MODULE UNDER CONSTRUCTION</p>
                <i class="ph ph-wrench"></i>
            </div>
        {/if}
    </div>
</div>

<style>
    .admin-layout {
        display: flex; height: 100%; background: #050505; color: #eee;
    }
    .sidebar {
        width: 150px; background: #0a0a0a; border-right: 1px solid #333;
        display: flex; flex-direction: column;
    }
    .sidebar button {
        padding: 15px; text-align: left; background: none; border: none; color: #666; cursor: pointer;
        font-family: 'Space Mono'; border-left: 3px solid transparent; transition: all 0.2s;
    }
    .sidebar button:hover { background: #111; color: #fff; }
    .sidebar button.active { background: #111; color: var(--accent-color); border-left-color: var(--accent-color); }

    .main-content { flex: 1; padding: 20px; overflow-y: auto; }

    .section { display: flex; flex-direction: column; gap: 15px; }
    .section h3 { margin: 0; font-size: 0.9rem; color: #888; font-family: 'VT323'; letter-spacing: 2px; }

    .admin-input {
        background: #111; border: 1px solid #333; color: #fff; padding: 10px; font-family: 'Space Mono';
        transition: border 0.2s;
    }
    .admin-input:focus { outline: none; border-color: var(--accent-color); }

    .action-btn {
        background: var(--accent-color); color: #000; font-weight: bold; border: none; padding: 10px; cursor: pointer;
        font-family: 'Space Mono'; margin-top: 10px;
    }
    .action-btn:hover { opacity: 0.9; }

    .docs-view { background: #111; padding: 10px; border: 1px solid #333; white-space: pre-wrap; font-size: 0.8rem; }

    .divider { border: 0; border-top: 1px dashed #333; margin: 20px 0; }
    .item { display: flex; justify-content: space-between; background: #111; padding: 5px 10px; }
    .sm-btn { background: #333; color: #fff; border: none; cursor: pointer; font-size: 0.7rem; padding: 2px 5px; }
    .sm-btn:hover { background: red; }
</style>
