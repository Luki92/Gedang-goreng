<script>
  import { editorStore } from '$lib/stores/editorStore.svelte';
  
  let { onInsert, onSave, disabled = false } = $props();
  
  const formatButtons = [
    { label: 'H1', tag: 'h1', icon: 'H₁' },
    { label: 'H2', tag: 'h2', icon: 'H₂' },
    { label: 'H3', tag: 'h3', icon: 'H₃' },
    { label: 'Bold', tag: 'b', icon: 'B' },
    { label: 'Italic', tag: 'i', icon: 'I' },
    { label: 'Underline', tag: 'u', icon: 'U' },
    { label: 'Link', tag: 'link', icon: '🔗' },
  ];
  
  const insertButtons = [
    { label: 'Image', tag: 'img', icon: '🖼️' },
    { label: 'Video', tag: 'video', icon: '🎬' },
    { label: 'Audio', tag: 'audio', icon: '🔊' },
    { label: 'Code', tag: 'code', icon: '</>' },
    { label: 'Quote', tag: 'quote', icon: '💬' },
    { label: 'List', tag: 'list', icon: '≡' },
  ];
  
  function handleFormat(tag) {
    if (disabled) return;
    onInsert?.(`[[${tag}]]Selected Text[[/${tag}]]`);
  }
  
  function handleInsert(tag) {
    if (disabled) return;
    
    if (tag === 'img') {
      const url = prompt('Enter image URL:');
      if (url) onInsert?.(`[[img src="${url}" alt="Image"]]`);
    } else if (tag === 'video') {
      const url = prompt('Enter video URL:');
      if (url) onInsert?.(`[[video src="${url}"]]`);
    } else if (tag === 'audio') {
      const url = prompt('Enter audio URL:');
      if (url) onInsert?.(`[[audio src="${url}"]]`);
    } else if (tag === 'link') {
      const url = prompt('Enter URL:');
      if (url) onInsert?.(`[[link href="${url}"]]Link Text[[/link]]`);
    } else if (tag === 'code') {
      onInsert?.(`[[code lang="javascript"]]\n// Your code here\n[[/code]]`);
    } else if (tag === 'quote') {
      onInsert?.(`[[quote]]Your quote here[[/quote]]`);
    } else if (tag === 'list') {
      onInsert?.(`* List item 1\n* List item 2\n* List item 3`);
    }
  }
  
  function handleSave() {
    if (disabled) return;
    onSave?.();
  }
  
  let showMetadata = $state(false);
  let metadataAuthor = $state(editorStore.currentFile?.metadata?.author || 'Admin');
  let metadataDate = $state(editorStore.currentFile?.metadata?.date || new Date().toISOString().split('T')[0]);
  let metadataTags = $state(editorStore.currentFile?.metadata?.tags?.join(', ') || '');
  
  function updateMetadata() {
    const tags = metadataTags.split(',').map(t => t.trim()).filter(Boolean);
    editorStore.updateCurrentMetadata({
      author: metadataAuthor,
      date: metadataDate,
      tags
    });
    showMetadata = false;
  }
</script>

<div class="toolbar-container">
  <div class="toolbar-section">
    <div class="toolbar-group">
      <span class="toolbar-label">Format:</span>
      {#each formatButtons as btn}
        <button 
          class="toolbar-btn" 
          title={btn.label}
          onclick={() => handleFormat(btn.tag)}
          {disabled}
        >
          {btn.icon}
        </button>
      {/each}
    </div>
    
    <div class="toolbar-divider"></div>
    
    <div class="toolbar-group">
      <span class="toolbar-label">Insert:</span>
      {#each insertButtons as btn}
        <button 
          class="toolbar-btn" 
          title={btn.label}
          onclick={() => handleInsert(btn.tag)}
          {disabled}
        >
          {btn.icon}
        </button>
      {/each}
    </div>
    
    <div class="toolbar-divider"></div>
    
    <div class="toolbar-group">
      <button 
        class="toolbar-btn" 
        title="Document Settings"
        onclick={() => showMetadata = !showMetadata}
        {disabled}
      >
        ⚙️
      </button>
      <button 
        class="toolbar-btn toolbar-btn-primary" 
        title="Save"
        onclick={handleSave}
        disabled={disabled || editorStore.isSaving}
      >
        {editorStore.isSaving ? '💾...' : '💾 Save'}
      </button>
      <button 
        class="toolbar-btn toolbar-btn-accent" 
        title="Toggle Preview"
        onclick={() => editorStore.togglePreview()}
        {disabled}
      >
        {editorStore.previewOpen ? '📝 Edit' : '👁️ Preview'}
      </button>
    </div>
  </div>
  
  {#if showMetadata}
    <div class="metadata-panel">
      <h4>Document Settings</h4>
      <div class="metadata-field">
        <label>Author:</label>
        <input type="text" bind:value={metadataAuthor} />
      </div>
      <div class="metadata-field">
        <label>Date:</label>
        <input type="date" bind:value={metadataDate} />
      </div>
      <div class="metadata-field">
        <label>Tags (comma-separated):</label>
        <input type="text" bind:value={metadataTags} placeholder="tutorial, guide, intro" />
      </div>
      <div class="metadata-actions">
        <button class="metadata-btn" onclick={updateMetadata}>Apply</button>
        <button class="metadata-btn" onclick={() => showMetadata = false}>Cancel</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .toolbar-container {
    background: rgba(15, 15, 25, 0.9);
    border: 1px solid #333;
    border-radius: 6px;
    padding: 8px;
    margin-bottom: 12px;
    backdrop-filter: blur(10px);
  }
  
  .toolbar-section {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .toolbar-label {
    font-size: 0.7rem;
    color: #888;
    margin-right: 4px;
    font-family: 'VT323', monospace;
  }
  
  .toolbar-btn {
    background: rgba(30, 30, 45, 0.8);
    border: 1px solid #444;
    color: #ccc;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    font-family: 'VT323', monospace;
    transition: all 0.2s;
    min-width: 32px;
  }
  
  .toolbar-btn:hover:not(:disabled) {
    background: rgba(40, 40, 60, 0.9);
    border-color: #5555ff;
    color: #fff;
  }
  
  .toolbar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .toolbar-btn-primary {
    background: rgba(50, 50, 120, 0.8);
    border-color: #5555ff;
  }
  
  .toolbar-btn-primary:hover:not(:disabled) {
    background: rgba(70, 70, 150, 0.9);
  }
  
  .toolbar-btn-accent {
    background: rgba(120, 50, 50, 0.8);
    border-color: #ff5555;
  }
  
  .toolbar-btn-accent:hover:not(:disabled) {
    background: rgba(150, 70, 70, 0.9);
  }
  
  .toolbar-divider {
    width: 1px;
    height: 24px;
    background: #333;
    margin: 0 4px;
  }
  
  .metadata-panel {
    margin-top: 12px;
    padding: 12px;
    background: rgba(20, 20, 30, 0.9);
    border: 1px solid #444;
    border-radius: 4px;
  }
  
  .metadata-panel h4 {
    margin: 0 0 12px 0;
    font-size: 0.8rem;
    color: #5555ff;
    font-family: 'VT323', monospace;
  }
  
  .metadata-field {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .metadata-field label {
    font-size: 0.7rem;
    color: #888;
    min-width: 80px;
    font-family: 'VT323', monospace;
  }
  
  .metadata-field input {
    flex: 1;
    background: rgba(10, 10, 15, 0.8);
    border: 1px solid #333;
    color: #ccc;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-family: 'VT323', monospace;
  }
  
  .metadata-field input:focus {
    outline: none;
    border-color: #5555ff;
  }
  
  .metadata-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    justify-content: flex-end;
  }
  
  .metadata-btn {
    background: rgba(50, 50, 120, 0.8);
    border: 1px solid #5555ff;
    color: #ccc;
    padding: 6px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    font-family: 'VT323', monospace;
    transition: all 0.2s;
  }
  
  .metadata-btn:hover {
    background: rgba(70, 70, 150, 0.9);
    color: #fff;
  }
</style>
