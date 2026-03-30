-- ============================================
-- REMINDER_COMPLETIONS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Create reminder_completions table
CREATE TABLE IF NOT EXISTS reminder_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    details TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE reminder_completions DISABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reminder_completions_reminder ON reminder_completions(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_completions_employee ON reminder_completions(employee_id);
