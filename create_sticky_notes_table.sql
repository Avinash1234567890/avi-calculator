-- SQL to create sticky_notes table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS sticky_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'New Note',
  content TEXT NOT NULL DEFAULT 'Click to edit...',
  color TEXT NOT NULL DEFAULT '#FFE066',
  position JSONB NOT NULL DEFAULT '{"x": 100, "y": 100}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own sticky notes
CREATE POLICY "Users can view own sticky notes" ON sticky_notes
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own sticky notes  
CREATE POLICY "Users can insert own sticky notes" ON sticky_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own sticky notes
CREATE POLICY "Users can update own sticky notes" ON sticky_notes  
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own sticky notes
CREATE POLICY "Users can delete own sticky notes" ON sticky_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_sticky_notes_updated_at 
  BEFORE UPDATE ON sticky_notes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
