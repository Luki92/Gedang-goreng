<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';

    let activeTab = $state('writing'); // 'writing' | 'image'
    let works = $state([]);
    let loading = $state(true);
    let error = $state(null);

    // Mock Data Fallback (Used if DB is empty/disconnected)
    const MOCK_DATA = [
        { type: 'writing', title: 'The Psychology of Pixel Art', date: '2024.01', content: 'Analyzing why low-res makes us feel high-emotion...' },
        { type: 'image', title: 'Void Walker Concept', date: '2023.12', src: '/placeholder_void.png', caption: 'Character design draft for Project Nebula.' },
        { type: 'writing', title: 'Cybernetics & Soul', date: '2023.11', content: 'Can a machine pray? Reflections on automated theology.' }
    ];

    onMount(async () => {
        try {
            // Restore Supabase Integration
            const { data, error: err } = await supabase.from('works').select('*');

            if (err) throw err;

            if (data && data.length > 0) {
                works = data;
            } else {
                console.log("Vault: No data in DB, using mock fallback.");
                works = MOCK_DATA;
            }
        } catch (e) {
            console.error("Vault Error:", e.message);
            error = e.message;
            works = MOCK_DATA; // graceful degradation
        } finally {
            loading = false;
        }
    });

    let filteredWorks = $derived(works.filter(w => w.type === activeTab));
</script>

<div class="vault-container">
    <div class="tabs">
        <button
            class="tab-btn"
            class:active={activeTab === 'writing'}
            onclick={() => activeTab = 'writing'}
        >
            WRITING
        </button>
        <button
            class="tab-btn"
            class:active={activeTab === 'image'}
            onclick={() => activeTab = 'image'}
        >
            IMAGES
        </button>
    </div>

    <div class="list">
        {#if loading}
            <div class="loading-state">> CONNECTING TO ARCHIVE DATABASE...</div>
        {:else if filteredWorks.length === 0}
             <div class="empty-state">NO DATA FOUND IN ARCHIVE.</div>
        {:else}
            {#each filteredWorks as work}
                <div class="work-item">
                    <div class="work-meta">
                        <span class="tag">[{work.type ? work.type.toUpperCase() : 'UNKNOWN'}]</span>
                        <span class="date">{work.date || '----.--'}</span>
                    </div>
                    <h3 class="work-title">{work.title}</h3>

                    {#if work.type === 'writing'}
                        <p class="work-snippet">{work.content}</p>
                    {:else}
                        <div class="img-placeholder">
                            <span class="text-xs text-gray-500">IMG: {work.title}</span>
                        </div>
                        {#if work.caption}
                            <p class="caption"> // {work.caption}</p>
                        {/if}
                    {/if}
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .vault-container {
        height: 100%; display: flex; flex-direction: column;
        background: rgba(10,10,15,0.5);
    }

    .tabs {
        display: flex; gap: 1px;
        background: rgba(255,255,255,0.1);
        padding-bottom: 1px;
    }

    .tab-btn {
        flex: 1; padding: 12px;
        background: rgba(0,0,0,0.5);
        color: #666; font-family: 'Space Mono', monospace;
        border: none; cursor: pointer;
        transition: all 0.2s;
        border-bottom: 2px solid transparent;
    }
    .tab-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .tab-btn.active { color: #fff; border-bottom: 2px solid var(--accent-color); background: rgba(255,255,255,0.02); }

    .list {
        flex: 1; overflow-y: auto; padding: 1.5rem;
        display: flex; flex-direction: column; gap: 1.5rem;
    }

    .work-item {
        border: 1px solid #333; padding: 1rem;
        transition: all 0.2s; background: rgba(0,0,0,0.2);
    }
    .work-item:hover { border-color: #666; transform: translateX(5px); background: rgba(255,255,255,0.02); }

    .work-meta {
        display: flex; justify-content: space-between;
        font-size: 0.7rem; color: var(--accent-color);
        margin-bottom: 0.5rem; font-family: 'VT323';
    }

    .work-title { font-size: 1.1rem; color: #eee; margin: 0 0 0.5rem 0; font-weight: normal; }

    .work-snippet { font-size: 0.85rem; color: #888; line-height: 1.4; margin: 0; }

    .img-placeholder {
        width: 100%; height: 120px; background: #111;
        display: flex; align-items: center; justify-content: center;
        border: 1px dashed #333; margin-bottom: 0.5rem;
    }

    .caption { font-size: 0.75rem; color: #555; font-style: italic; margin: 0; }

    .empty-state { padding: 2rem; text-align: center; color: #444; font-family: 'VT323'; }
    .loading-state { padding: 2rem; text-align: center; color: var(--accent-color); font-family: 'VT323'; animation: blink 1s infinite; }
    @keyframes blink { 50% { opacity: 0.5; } }
</style>
