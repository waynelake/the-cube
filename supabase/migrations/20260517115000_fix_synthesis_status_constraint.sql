-- Fix synthesis_status constraint to allow 'generating' value
-- Drop the old constraint
ALTER TABLE sessions
DROP CONSTRAINT IF EXISTS sessions_synthesis_status_check;

-- Add new constraint that allows all three values
ALTER TABLE sessions
ADD CONSTRAINT sessions_synthesis_status_check
CHECK (synthesis_status IN ('pending', 'generating', 'complete'));
