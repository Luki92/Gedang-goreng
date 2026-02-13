<script>
  import { editorStore } from '$lib/stores/editorStore.svelte';
  import { parser } from '$lib/utils/luki-parser';
  import LukiRenderer from '$lib/components/renderer/LukiRenderer.svelte';
  
  const previewAst = $derived(
    editorStore.currentFile?.content ? parser.parse(editorStore.currentFile.content) : []
  );
</script>

{#if editorStore.previewOpen}
  <div class="preview-overlay" onclick={() => editorStore.togglePreview()}>
    <div class="preview-window" onclick={(e) => e.stopPropagation()}>
      <div class="preview-header">
        <div class="preview-title">
          <span class="preview-icon">👁️</span>
          Preview: {editorStore.currentFile?.title || 'Untitled'}
        </div>
        <button class="preview-close" onclick={() => editorStore.togglePreview()}>
          ✕
        </button>
      </div>
      
      <div class="preview-meta">
        {#if editorStore.currentFile?.metadata}
          <span class="meta-item">
            <strong>Author:</strong> {editorStore.currentFile.metadata.author || 'Unknown'}
          </span>
          <span class="meta-item">
            <strong>Date:</strong> {editorStore.currentFile.metadata.date || 'N/A'}
          </span>
          {#if editorStore.currentFile.metadata.tags?.length}
            <span class="meta-item">
              <strong>Tags:</strong> {editorStore.currentFile.metadata.tags.join(', ')}
            </span>
          {/if}
        {/if}
      </div>
      
      <div class="preview-content">
        <LukiRenderer ast={previewAst} />
      </div>
    </div>
  </div>
{/if}

<style>
  .preview-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(8px);
    padding: 20px;
  }
  
  .preview-window {
    background: rgba(15, 15, 25, 0.98);
    border: 2px solid #5555ff;
    border-radius: 12px;
    max-width: 1200px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(85, 85, 255, 0.3);
  }
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #333;
    background: rgba(20, 20, 30, 0.9);
    border-radius: 12px 12px 0 0;
  }
  
  .preview-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    color: #5555ff;
    font-family: 'VT323', monospace;
  }
  
  .preview-icon {
    font-size: 1.2rem;
  }
  
  .preview-close {
    background: rgba(120, 50, 50, 0.8);
    border: 1px solid #ff5555;
    color: #ccc;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-family: 'VT323', monospace;
    transition: all 0.2s;
  }
  
  .preview-close:hover {
    background: rgba(150, 70, 70, 0.9);
    color: #fff;
  }
  
  .preview-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 12px 20px;
    background: rgba(10, 10, 15, 0.6);
    border-bottom: 1px solid #333;
    font-size: 0.75rem;
    color: #888;
    font-family: 'VT323', monospace;
  }
  
  .meta-item strong {
    color: #5555ff;
  }
  
  .preview-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    font-family: 'VT323', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    color: #ccc;
  }
  
  /* Style the rendered content */
  .preview-content :global(h1) {
    color: #5555ff;
    font-size: 1.8rem;
    margin: 24px 0 16px 0;
    font-family: 'VT323', monospace;
  }
  
  .preview-content :global(h2) {
    color: #5555ff;
    font-size: 1.5rem;
    margin: 20px 0 12px 0;
    font-family: 'VT323', monospace;
  }
  
  .preview-content :global(h3) {
    color: #5555ff;
    font-size: 1.2rem;
    margin: 16px 0 8px 0;
    font-family: 'VT323', monospace;
  }
  
  .preview-content :global(p) {
    margin: 12px 0;
    line-height: 1.6;
  }
  
  .preview-content :global(ul) {
    margin: 12px 0;
    padding-left: 24px;
  }
  
  .preview-content :global(li) {
    margin: 6px 0;
  }
  
  .preview-content :global(a) {
    color: #5555ff;
    text-decoration: none;
    border-bottom: 1px solid #5555ff;
  }
  
  .preview-content :global(a:hover) {
    color: #7777ff;
    border-bottom-color: #7777ff;
  }
  
  .preview-content :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    border: 1px solid #333;
    margin: 16px 0;
  }
  
  .preview-content :global(video) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    border: 1px solid #333;
    margin: 16px 0;
  }
  
  .preview-content :global(blockquote) {
    border-left: 3px solid #5555ff;
    padding-left: 16px;
    margin: 16px 0;
    color: #aaa;
    font-style: italic;
  }
  
  .preview-content :global(code) {
    background: rgba(10, 10, 15, 0.8);
    border: 1px solid #333;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.85em;
    color: #ff5555;
  }
  
  .preview-content :global(pre) {
    background: rgba(10, 10, 15, 0.9);
    border: 1px solid #333;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 16px 0;
  }
  
  .preview-content :global(pre code) {
    background: none;
    border: none;
    padding: 0;
    color: #ccc;
  }
  
  .preview-content :global(strong), .preview-content :global(b) {
    color: #fff;
    font-weight: bold;
  }
  
  .preview-content :global(em), .preview-content :global(i) {
    color: #aaa;
    font-style: italic;
  }
  
  .preview-content :global(u) {
    text-decoration: underline;
  }
  
  /* Scrollbar styling */
  .preview-content::-webkit-scrollbar {
    width: 8px;
  }
  
  .preview-content::-webkit-scrollbar-track {
    background: rgba(10, 10, 15, 0.5);
  }
  
  .preview-content::-webkit-scrollbar-thumb {
    background: rgba(85, 85, 255, 0.5);
    border-radius: 4px;
  }
  
  .preview-content::-webkit-scrollbar-thumb:hover {
    background: rgba(85, 85, 255, 0.7);
  }
</style>
