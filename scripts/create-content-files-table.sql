-- Create content_files table for admin content editor
CREATE TABLE IF NOT EXISTS content_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on filename for faster lookups
CREATE INDEX IF NOT EXISTS idx_content_files_filename ON content_files(filename);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_content_files_updated_at ON content_files(updated_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_content_files_updated_at ON content_files;
CREATE TRIGGER update_content_files_updated_at
  BEFORE UPDATE ON content_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample content files
INSERT INTO content_files (filename, title, content, metadata) VALUES
  ('welcome.luki', 'Welcome Page', '[[h1]]Welcome to the Content Editor[[/h1]]

This is a sample document created with the LukiScript editor.

[[h2]]Features[[/h2]]
* Full-featured rich text editing
* Media insertion support
* Real-time preview
* File management

[[h2]]Getting Started[[/h2]]
Click the "New File" button to create a new document, or select an existing file from the list to edit it.', 
  '{"author": "Admin", "date": "2026-02-13", "tags": ["welcome", "tutorial"]}'),
  
  ('about.luki', 'About Us', '[[h1]]About Our Platform[[/h1]]

We are building an amazing content management system.

[[h2]]Mission[[/h2]]
Our mission is to provide the best content editing experience.', 
  '{"author": "Admin", "date": "2026-02-13", "tags": ["about"]}')
ON CONFLICT (filename) DO NOTHING;
