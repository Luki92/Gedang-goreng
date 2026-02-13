import { supabase } from '$lib/supabaseClient';

// Store for managing content files and editor state
class EditorStore {
  files = $state([]);
  currentFile = $state(null);
  isLoading = $state(false);
  isSaving = $state(false);
  error = $state(null);
  previewOpen = $state(false);

  async loadFiles() {
    this.isLoading = true;
    this.error = null;
    try {
      const { data, error } = await supabase
        .from('content_files')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      this.files = data || [];
    } catch (err) {
      this.error = err.message;
      console.error('[v0] Error loading files:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async loadFile(id) {
    this.isLoading = true;
    this.error = null;
    try {
      const { data, error } = await supabase
        .from('content_files')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      this.currentFile = data;
    } catch (err) {
      this.error = err.message;
      console.error('[v0] Error loading file:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async createFile(filename, title = 'Untitled') {
    this.isSaving = true;
    this.error = null;
    try {
      const { data, error } = await supabase
        .from('content_files')
        .insert({
          filename: filename.endsWith('.luki') ? filename : `${filename}.luki`,
          title,
          content: '',
          metadata: { author: 'Admin', date: new Date().toISOString().split('T')[0], tags: [] }
        })
        .select()
        .single();
      
      if (error) throw error;
      this.files = [data, ...this.files];
      this.currentFile = data;
      return data;
    } catch (err) {
      this.error = err.message;
      console.error('[v0] Error creating file:', err);
      throw err;
    } finally {
      this.isSaving = false;
    }
  }

  async saveFile(id, updates) {
    this.isSaving = true;
    this.error = null;
    try {
      const { data, error } = await supabase
        .from('content_files')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      this.currentFile = data;
      this.files = this.files.map(f => f.id === id ? data : f);
      return data;
    } catch (err) {
      this.error = err.message;
      console.error('[v0] Error saving file:', err);
      throw err;
    } finally {
      this.isSaving = false;
    }
  }

  async deleteFile(id) {
    this.error = null;
    try {
      const { error } = await supabase
        .from('content_files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      this.files = this.files.filter(f => f.id !== id);
      if (this.currentFile?.id === id) {
        this.currentFile = null;
      }
    } catch (err) {
      this.error = err.message;
      console.error('[v0] Error deleting file:', err);
      throw err;
    }
  }

  updateCurrentContent(content) {
    if (this.currentFile) {
      this.currentFile = { ...this.currentFile, content };
    }
  }

  updateCurrentMetadata(metadata) {
    if (this.currentFile) {
      this.currentFile = { ...this.currentFile, metadata: { ...this.currentFile.metadata, ...metadata } };
    }
  }

  togglePreview() {
    this.previewOpen = !this.previewOpen;
  }

  setCurrentFile(file) {
    this.currentFile = file;
  }
}

export const editorStore = new EditorStore();
