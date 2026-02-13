<script>
  import { editorStore } from '$lib/stores/editorStore.svelte';
  import { onMount } from 'svelte';
  
  let showNewFileDialog = $state(false);
  let newFileName = $state('');
  let newFileTitle = $state('');
  let searchQuery = $state('');
  let deleteConfirmId = $state(null);
  
  onMount(() => {
    editorStore.loadFiles();
  });
  
  $effect(() => {
    // Auto-reload files when they change
    if (editorStore.files.length === 0 && !editorStore.isLoading) {
      editorStore.loadFiles();
    }
  });
  
  const filteredFiles = $derived(
    editorStore.files.filter(file => 
      file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  async function handleCreateFile() {
    if (!newFileName.trim()) return;
    
    try {
      await editorStore.createFile(newFileName, newFileTitle || 'Untitled');
      showNewFileDialog = false;
      newFileName = '';
      newFileTitle = '';
    } catch (err) {
      alert('Error creating file: ' + err.message);
    }
  }
  
  function handleSelectFile(file) {
    editorStore.setCurrentFile(file);
  }
  
  async function handleDeleteFile(id) {
    if (deleteConfirmId !== id) {
      deleteConfirmId = id;
      setTimeout(() => deleteConfirmId = null, 3000);
      return;
    }
    
    try {
      await editorStore.deleteFile(id);
      deleteConfirmId = null;
    } catch (err) {
      alert('Error deleting file: ' + err.message);
    }
  }
  
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
</script>

<div class="file-manager">
  <div class="file-manager-header">
    <h3>📁 Files</h3>
    <button class="btn-new-file" onclick={() => showNewFileDialog = true}>
      + New
    </button>
  </div>
  
  <div class="file-search">
    <input 
      type="text" 
      placeholder="🔍 Search files..."
      bind:value={searchQuery}
    />
  </div>
  
  {#if editorStore.isLoading}
    <div class="file-loading">Loading files...</div>
  {:else if editorStore.error}
    <div class="file-error">Error: {editorStore.error}</div>
  {:else if filteredFiles.length === 0}
    <div class="file-empty">
      {searchQuery ? 'No files match your search' : 'No files yet. Create one!'}
    </div>
  {:else}
    <div class="file-list">
      {#each filteredFiles as file (file.id)}
        <div 
          class="file-item"
          class:active={editorStore.currentFile?.id === file.id}
          onclick={() => handleSelectFile(file)}
        >
          <div class="file-info">
            <div class="file-name">{file.filename}</div>
            <div class="file-title">{file.title}</div>
            <div class="file-meta">
              <span class="file-date">{formatDate(file.updated_at)}</span>
              {#if file.metadata?.tags?.length}
                <span class="file-tags">
                  {file.metadata.tags.slice(0, 2).join(', ')}
                </span>
              {/if}
            </div>
          </div>
          <div class="file-actions">
            <button 
              class="btn-delete"
              onclick={(e) => {
                e.stopPropagation();
                handleDeleteFile(file.id);
              }}
              title={deleteConfirmId === file.id ? 'Click again to confirm' : 'Delete file'}
            >
              {deleteConfirmId === file.id ? '⚠️' : '🗑️'}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showNewFileDialog}
  <div class="dialog-overlay" onclick={() => showNewFileDialog = false}>
    <div class="dialog-content" onclick={(e) => e.stopPropagation()}>
      <h3>Create New File</h3>
      
      <div class="dialog-field">
        <label>Filename:</label>
        <input 
          type="text" 
          bind:value={newFileName}
          placeholder="my-document.luki"
          onkeydown={(e) => e.key === 'Enter' && handleCreateFile()}
        />
      </div>
      
      <div class="dialog-field">
        <label>Title:</label>
        <input 
          type="text" 
          bind:value={newFileTitle}
          placeholder="My Document"
          onkeydown={(e) => e.key === 'Enter' && handleCreateFile()}
        />
      </div>
      
      <div class="dialog-actions">
        <button class="dialog-btn dialog-btn-primary" onclick={handleCreateFile}>
          Create
        </button>
        <button class="dialog-btn" onclick={() => showNewFileDialog = false}>
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .file-manager {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: rgba(10, 10, 15, 0.75);
    border: 1px solid #333;
    border-radius: 6px;
    backdrop-filter: blur(10px);
    overflow: hidden;
  }
  
  .file-manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #333;
    background: rgba(15, 15, 25, 0.9);
  }
  
  .file-manager-header h3 {
    margin: 0;
    font-size: 0.9rem;
    color: #5555ff;
    font-family: 'VT323', monospace;
  }
  
  .btn-new-file {
    background: rgba(50, 50, 120, 0.8);
    border: 1px solid #5555ff;
    color: #ccc;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    font-family: 'VT323', monospace;
    transition: all 0.2s;
  }
  
  .btn-new-file:hover {
    background: rgba(70, 70, 150, 0.9);
    color: #fff;
  }
  
  .file-search {
    padding: 8px 12px;
    border-bottom: 1px solid #333;
  }
  
  .file-search input {
    width: 100%;
    background: rgba(5, 5, 10, 0.8);
    border: 1px solid #333;
    color: #ccc;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-family: 'VT323', monospace;
  }
  
  .file-search input:focus {
    outline: none;
    border-color: #5555ff;
  }
  
  .file-loading, .file-error, .file-empty {
    padding: 24px;
    text-align: center;
    font-size: 0.75rem;
    color: #888;
    font-family: 'VT323', monospace;
  }
  
  .file-error {
    color: #ff5555;
  }
  
  .file-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin-bottom: 6px;
    background: rgba(20, 20, 30, 0.7);
    border: 1px solid #333;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .file-item:hover {
    background: rgba(30, 30, 45, 0.8);
    border-color: #444;
  }
  
  .file-item.active {
    background: rgba(50, 50, 120, 0.6);
    border-color: #5555ff;
  }
  
  .file-info {
    flex: 1;
    min-width: 0;
  }
  
  .file-name {
    font-size: 0.8rem;
    color: #5555ff;
    font-family: 'VT323', monospace;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .file-title {
    font-size: 0.75rem;
    color: #ccc;
    font-family: 'VT323', monospace;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .file-meta {
    display: flex;
    gap: 8px;
    font-size: 0.65rem;
    color: #666;
    font-family: 'VT323', monospace;
  }
  
  .file-tags {
    color: #888;
  }
  
  .file-actions {
    display: flex;
    gap: 4px;
    margin-left: 8px;
  }
  
  .btn-delete {
    background: rgba(120, 50, 50, 0.6);
    border: 1px solid #ff5555;
    color: #ccc;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.2s;
  }
  
  .btn-delete:hover {
    background: rgba(150, 70, 70, 0.8);
  }
  
  /* Dialog Styles */
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
  
  .dialog-content {
    background: rgba(15, 15, 25, 0.95);
    border: 1px solid #5555ff;
    border-radius: 8px;
    padding: 24px;
    min-width: 400px;
    max-width: 90vw;
  }
  
  .dialog-content h3 {
    margin: 0 0 20px 0;
    font-size: 1rem;
    color: #5555ff;
    font-family: 'VT323', monospace;
  }
  
  .dialog-field {
    margin-bottom: 16px;
  }
  
  .dialog-field label {
    display: block;
    font-size: 0.75rem;
    color: #888;
    margin-bottom: 6px;
    font-family: 'VT323', monospace;
  }
  
  .dialog-field input {
    width: 100%;
    background: rgba(10, 10, 15, 0.8);
    border: 1px solid #333;
    color: #ccc;
    padding: 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-family: 'VT323', monospace;
  }
  
  .dialog-field input:focus {
    outline: none;
    border-color: #5555ff;
  }
  
  .dialog-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 24px;
  }
  
  .dialog-btn {
    background: rgba(30, 30, 45, 0.8);
    border: 1px solid #444;
    color: #ccc;
    padding: 8px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    font-family: 'VT323', monospace;
    transition: all 0.2s;
  }
  
  .dialog-btn:hover {
    background: rgba(40, 40, 60, 0.9);
    color: #fff;
  }
  
  .dialog-btn-primary {
    background: rgba(50, 50, 120, 0.8);
    border-color: #5555ff;
  }
  
  .dialog-btn-primary:hover {
    background: rgba(70, 70, 150, 0.9);
  }
</style>
