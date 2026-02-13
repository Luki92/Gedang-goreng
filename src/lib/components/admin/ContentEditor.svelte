<script>
  import { editorStore } from '$lib/stores/editorStore.svelte';
  import EditorToolbar from './EditorToolbar.svelte';
  import FileManager from './FileManager.svelte';
  import PreviewWindow from './PreviewWindow.svelte';
  import WindowFrame from '$lib/components/WindowFrame.svelte';
  
  let textareaEl = $state(null);
  let autoSaveTimeout = $state(null);
  
  // Auto-save after 2 seconds of inactivity
  function handleContentChange(e) {
    const newContent = e.target.value;
    editorStore.updateCurrentContent(newContent);
    
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set new auto-save timeout
    autoSaveTimeout = setTimeout(() => {
      handleSave();
    }, 2000);
  }
  
  async function handleSave() {
    if (!editorStore.currentFile) return;
    
    try {
      await editorStore.saveFile(editorStore.currentFile.id, {
        content: editorStore.currentFile.content,
        title: editorStore.currentFile.title,
        metadata: editorStore.currentFile.metadata
      });
    } catch (err) {
      console.error('[v0] Save error:', err);
    }
  }
  
  function handleInsert(text) {
    if (!textareaEl) return;
    
    const start = textareaEl.selectionStart;
    const end = textareaEl.selectionEnd;
    const currentContent = editorStore.currentFile?.content || '';
    
    // Replace selected text or insert at cursor
    const beforeSelection = currentContent.substring(0, start);
    const selectedText = currentContent.substring(start, end);
    const afterSelection = currentContent.substring(end);
    
    let newText = text;
    if (text.includes('Selected Text') && selectedText) {
      newText = text.replace('Selected Text', selectedText);
    }
    
    const newContent = beforeSelection + newText + afterSelection;
    editorStore.updateCurrentContent(newContent);
    
    // Move cursor to end of inserted text
    setTimeout(() => {
      textareaEl.focus();
      const newPosition = start + newText.length;
      textareaEl.setSelectionRange(newPosition, newPosition);
    }, 0);
  }
  
  function handleTitleChange(e) {
    if (editorStore.currentFile) {
      editorStore.currentFile.title = e.target.value;
    }
  }
</script>

<WindowFrame title="✏️ Content Editor" width="95vw" height="90vh">
  <div class="editor-container">
    <div class="editor-sidebar">
      <FileManager />
    </div>
    
    <div class="editor-main">
      {#if editorStore.currentFile}
        <div class="editor-header">
          <div class="editor-file-info">
            <input 
              type="text"
              class="title-input"
              value={editorStore.currentFile.title}
              oninput={handleTitleChange}
              placeholder="Document Title"
            />
            <div class="editor-filename">
              📄 {editorStore.currentFile.filename}
            </div>
          </div>
          {#if editorStore.isSaving}
            <div class="save-indicator">💾 Saving...</div>
          {:else}
            <div class="save-indicator saved">✓ Saved</div>
          {/if}
        </div>
        
        <EditorToolbar 
          onInsert={handleInsert}
          onSave={handleSave}
          disabled={!editorStore.currentFile}
        />
        
        <div class="editor-pane">
          <textarea
            bind:this={textareaEl}
            class="editor-textarea"
            value={editorStore.currentFile.content}
            oninput={handleContentChange}
            placeholder="Start writing your content here...

Use LukiScript formatting:
[[h1]]Heading 1[[/h1]]
[[h2]]Heading 2[[/h2]]
[[b]]Bold text[[/b]]
[[i]]Italic text[[/i]]
[[link href='url']]Link text[[/link]]
[[img src='url' alt='description']]

* Bullet point lists
* Another item
"
            spellcheck="false"
          ></textarea>
          
          <div class="editor-stats">
            <span>Lines: {editorStore.currentFile.content.split('\n').length}</span>
            <span>Characters: {editorStore.currentFile.content.length}</span>
            <span>Words: {editorStore.currentFile.content.split(/\s+/).filter(Boolean).length}</span>
          </div>
        </div>
      {:else}
        <div class="editor-empty">
          <div class="empty-icon">📝</div>
          <h3>No File Selected</h3>
          <p>Select a file from the sidebar to start editing, or create a new one.</p>
        </div>
      {/if}
    </div>
  </div>
  
  <PreviewWindow />
</WindowFrame>

<style>
  .editor-container {
    display: flex;
    height: 100%;
    gap: 16px;
    padding: 16px;
    background: rgba(5, 5, 10, 0.5);
  }
  
  .editor-sidebar {
    width: 300px;
    min-width: 250px;
    max-width: 400px;
    display: flex;
    flex-direction: column;
  }
  
  .editor-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: rgba(15, 15, 25, 0.9);
    border: 1px solid #333;
    border-radius: 6px;
    margin-bottom: 12px;
    backdrop-filter: blur(10px);
  }
  
  .editor-file-info {
    flex: 1;
    min-width: 0;
  }
  
  .title-input {
    width: 100%;
    background: rgba(10, 10, 15, 0.8);
    border: 1px solid #333;
    color: #fff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 1.1rem;
    font-family: 'VT323', monospace;
    margin-bottom: 6px;
  }
  
  .title-input:focus {
    outline: none;
    border-color: #5555ff;
  }
  
  .editor-filename {
    font-size: 0.75rem;
    color: #888;
    font-family: 'VT323', monospace;
  }
  
  .save-indicator {
    font-size: 0.75rem;
    color: #ff9500;
    font-family: 'VT323', monospace;
    padding: 6px 12px;
    background: rgba(255, 149, 0, 0.1);
    border: 1px solid #ff9500;
    border-radius: 4px;
    white-space: nowrap;
  }
  
  .save-indicator.saved {
    color: #00ff00;
    background: rgba(0, 255, 0, 0.1);
    border-color: #00ff00;
  }
  
  .editor-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(10, 10, 15, 0.75);
    border: 1px solid #333;
    border-radius: 6px;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }
  
  .editor-textarea {
    flex: 1;
    background: transparent;
    border: none;
    color: #ccc;
    padding: 20px;
    font-size: 0.9rem;
    font-family: 'Courier New', 'Courier', monospace;
    line-height: 1.6;
    resize: none;
    outline: none;
    tab-size: 2;
  }
  
  .editor-textarea::placeholder {
    color: #555;
  }
  
  /* Scrollbar styling */
  .editor-textarea::-webkit-scrollbar {
    width: 10px;
  }
  
  .editor-textarea::-webkit-scrollbar-track {
    background: rgba(10, 10, 15, 0.5);
  }
  
  .editor-textarea::-webkit-scrollbar-thumb {
    background: rgba(85, 85, 255, 0.5);
    border-radius: 5px;
  }
  
  .editor-textarea::-webkit-scrollbar-thumb:hover {
    background: rgba(85, 85, 255, 0.7);
  }
  
  .editor-stats {
    display: flex;
    gap: 20px;
    padding: 8px 20px;
    background: rgba(15, 15, 25, 0.9);
    border-top: 1px solid #333;
    font-size: 0.7rem;
    color: #666;
    font-family: 'VT323', monospace;
  }
  
  .editor-stats span {
    display: flex;
    align-items: center;
  }
  
  .editor-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(10, 10, 15, 0.75);
    border: 1px solid #333;
    border-radius: 6px;
    padding: 48px;
    text-align: center;
  }
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .editor-empty h3 {
    margin: 0 0 12px 0;
    font-size: 1.2rem;
    color: #5555ff;
    font-family: 'VT323', monospace;
  }
  
  .editor-empty p {
    margin: 0;
    font-size: 0.85rem;
    color: #888;
    font-family: 'VT323', monospace;
    max-width: 400px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 1024px) {
    .editor-container {
      flex-direction: column;
    }
    
    .editor-sidebar {
      width: 100%;
      max-width: none;
      height: 200px;
    }
  }
</style>
