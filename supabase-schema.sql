-- ============================================
-- AL-BASEEM System - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EMPLOYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('manager', 'employee')),
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    location_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMER_CITIES TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS customer_cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, city_id)
);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    details TEXT,
    date DATE NOT NULL,
    is_full_day BOOLEAN DEFAULT TRUE,
    start_time TEXT,
    end_time TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'delayed', 'canceled', 'pending')),
    completion_details TEXT,
    delay_reason TEXT,
    cancel_reason TEXT,
    canceled_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RECURRING_TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recurring_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    details TEXT,
    days_of_week TEXT[] NOT NULL,
    is_full_day BOOLEAN DEFAULT TRUE,
    start_time TEXT,
    end_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REMINDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    details TEXT,
    date DATE NOT NULL,
    is_full_day BOOLEAN DEFAULT TRUE,
    start_time TEXT,
    end_time TEXT,
    completion_type TEXT NOT NULL DEFAULT 'single' CHECK (completion_type IN ('single', 'all')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REMINDER_EMPLOYEES TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS reminder_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reminder_id, employee_id)
);

-- ============================================
-- REMINDER_COMPLETIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reminder_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    details TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCHEDULED_MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    has_image BOOLEAN DEFAULT FALSE,
    target_label TEXT NOT NULL,
    targets JSONB NOT NULL,
    schedule_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'canceled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEND_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS send_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_name TEXT NOT NULL,
    target_phone TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WHATSAPP_CONFIG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    business_account_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customer_cities_customer ON customer_cities(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_cities_city ON customer_cities(city_id);
CREATE INDEX IF NOT EXISTS idx_reports_customer ON reports(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_employee ON tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_employee ON recurring_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(date);
CREATE INDEX IF NOT EXISTS idx_reminder_employees_reminder ON reminder_employees(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_employees_employee ON reminder_employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_reminder_completions_reminder ON reminder_completions(reminder_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_date ON scheduled_messages(schedule_date);
CREATE INDEX IF NOT EXISTS idx_send_logs_created ON send_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE send_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for authenticated users
-- (You can make these more restrictive later)
CREATE POLICY "Allow all for authenticated users" ON employees FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON cities FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON customer_cities FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON reports FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON recurring_tasks FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON reminders FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON reminder_employees FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON reminder_completions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON notes FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON scheduled_messages FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON send_logs FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON whatsapp_config FOR ALL USING (true);

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default manager account
-- Password: 123 (in production, use bcrypt hashed password)
INSERT INTO employees (id, name, phone, password, role, permissions) VALUES
(
    'emp_00000000-0000-0000-0000-000000000001',
    'مدير النظام',
    '07700000000',
    '123',
    'manager',
    ARRAY[
        'viewCustomersAndCities', 'addCustomer', 'deleteCustomer', 'editCustomer',
        'viewReports', 'addReport', 'deleteReport', 'addCity', 'deleteCity',
        'viewTasksSection', 'addTask', 'deleteTask', 'delayTask', 'cancelTask',
        'viewWhatsappSection', 'connectWhatsapp', 'disconnectWhatsapp',
        'viewRemindersSection', 'addReminder', 'deleteReminder', 'viewAllReminders',
        'viewNotesSection', 'addNote', 'deleteNote', 'viewSettings',
        'addUser', 'deleteUser', 'editUser', 'makeBackup', 'restoreBackup', 'importCustomers'
    ]
) ON CONFLICT (phone) DO NOTHING;

-- Insert default cities
INSERT INTO cities (id, name) VALUES
    ('city_00000000-0000-0000-0000-000000000001', 'بغداد'),
    ('city_00000000-0000-0000-0000-000000000002', 'النجف الأشرف'),
    ('city_00000000-0000-0000-0000-000000000003', 'البصرة')
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_config_updated_at BEFORE UPDATE ON whatsapp_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
