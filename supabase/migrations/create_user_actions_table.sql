-- Migration: Create user_actions table for AI Dashboard tracking
-- Description: Tracks all user interactions with the AI Dashboard (calls, WhatsApp, emails, etc.)
-- Created: 2025-11-06

-- Create user_actions table
CREATE TABLE IF NOT EXISTS public.user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('call', 'whatsapp', 'email', 'generate_plan', 'view_details')),
  target_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON public.user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_type ON public.user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_target_id ON public.user_actions(target_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON public.user_actions(created_at DESC);

-- Add comment to table
COMMENT ON TABLE public.user_actions IS 'Tracks user interactions with AI Dashboard features for analytics and auditing';

-- Add comments to columns
COMMENT ON COLUMN public.user_actions.user_id IS 'Reference to the user who performed the action';
COMMENT ON COLUMN public.user_actions.action_type IS 'Type of action: call, whatsapp, email, generate_plan, or view_details';
COMMENT ON COLUMN public.user_actions.target_id IS 'ID of the target entity (patient_id, plan_id, etc.)';
COMMENT ON COLUMN public.user_actions.metadata IS 'Additional data about the action (patient name, phone, etc.)';

-- Enable Row Level Security
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only view their own actions
CREATE POLICY "Users can view their own actions"
  ON public.user_actions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own actions
CREATE POLICY "Users can insert their own actions"
  ON public.user_actions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Admins can view all actions
CREATE POLICY "Admins can view all actions"
  ON public.user_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT, INSERT ON public.user_actions TO authenticated;
GRANT ALL ON public.user_actions TO service_role;
