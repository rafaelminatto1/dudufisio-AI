-- Migration: Create calendar_links table
-- Description: Tabela para armazenar links de calendário gerados para appointments

-- Create calendar_links table
CREATE TABLE IF NOT EXISTS calendar_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Links gerados (Edge Function)
  universal_link TEXT NOT NULL,
  google_link TEXT,
  outlook_link TEXT,
  yahoo_link TEXT,
  apple_ics_link TEXT,
  
  -- Metadados
  event_title TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  sent_via TEXT[] DEFAULT '{}',
  link_accessed BOOLEAN DEFAULT false,
  accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(appointment_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calendar_links_appointment ON calendar_links(appointment_id);
CREATE INDEX IF NOT EXISTS idx_calendar_links_patient ON calendar_links(patient_id);
CREATE INDEX IF NOT EXISTS idx_calendar_links_event_date ON calendar_links(event_date);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_calendar_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calendar_links_updated_at
  BEFORE UPDATE ON calendar_links
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_links_updated_at();

-- Enable Row Level Security
ALTER TABLE calendar_links ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow authenticated users to read calendar links
CREATE POLICY "Allow authenticated users to read calendar links"
  ON calendar_links
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert calendar links
CREATE POLICY "Allow authenticated users to insert calendar links"
  ON calendar_links
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update calendar links
CREATE POLICY "Allow authenticated users to update calendar links"
  ON calendar_links
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete calendar links
CREATE POLICY "Allow authenticated users to delete calendar links"
  ON calendar_links
  FOR DELETE
  TO authenticated
  USING (true);

-- Allow anonymous access to read calendar links (for public .ics downloads)
CREATE POLICY "Allow anonymous to read calendar links"
  ON calendar_links
  FOR SELECT
  TO anon
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE calendar_links IS 'Armazena links de calendário gerados para appointments';
COMMENT ON COLUMN calendar_links.universal_link IS 'Link .ics universal (Edge Function)';
COMMENT ON COLUMN calendar_links.google_link IS 'Link direto para Google Calendar';
COMMENT ON COLUMN calendar_links.apple_ics_link IS 'Link .ics para Apple Calendar';
COMMENT ON COLUMN calendar_links.sent_via IS 'Array de canais pelos quais o link foi enviado';
COMMENT ON COLUMN calendar_links.link_accessed IS 'Indica se o link foi acessado pelo paciente';
COMMENT ON COLUMN calendar_links.access_count IS 'Contador de acessos ao link';

