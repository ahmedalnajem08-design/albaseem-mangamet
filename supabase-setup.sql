-- ============================================
-- AL-BASEEM System - Supabase Database Schema
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
-- CUSTOMER_CITIES TABLE
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
-- REMINDER_EMPLOYEES TABLE
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
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_date ON scheduled_messages(schedule_date);
CREATE INDEX IF NOT EXISTS idx_send_logs_created ON send_logs(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================
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

CREATE POLICY "Allow all" ON employees FOR ALL USING (true);
CREATE POLICY "Allow all" ON cities FOR ALL USING (true);
CREATE POLICY "Allow all" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all" ON customer_cities FOR ALL USING (true);
CREATE POLICY "Allow all" ON reports FOR ALL USING (true);
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all" ON recurring_tasks FOR ALL USING (true);
CREATE POLICY "Allow all" ON reminders FOR ALL USING (true);
CREATE POLICY "Allow all" ON reminder_employees FOR ALL USING (true);
CREATE POLICY "Allow all" ON reminder_completions FOR ALL USING (true);
CREATE POLICY "Allow all" ON notes FOR ALL USING (true);
CREATE POLICY "Allow all" ON scheduled_messages FOR ALL USING (true);
CREATE POLICY "Allow all" ON send_logs FOR ALL USING (true);
CREATE POLICY "Allow all" ON whatsapp_config FOR ALL USING (true);

-- ============================================
-- DEFAULT DATA
-- ============================================
INSERT INTO employees (name, phone, password, role, permissions) VALUES
(
    'مدير النظام',
    '07700000000',
    '123',
    'manager',
    ARRAY['viewCustomersAndCities', 'addCustomer', 'deleteCustomer', 'editCustomer',
        'viewReports', 'addReport', 'deleteReport', 'addCity', 'deleteCity',
        'viewTasksSection', 'addTask', 'deleteTask', 'delayTask', 'cancelTask',
        'viewWhatsappSection', 'connectWhatsapp', 'disconnectWhatsapp',
        'viewRemindersSection', 'addReminder', 'deleteReminder', 'viewAllReminders',
        'viewNotesSection', 'addNote', 'deleteNote', 'viewSettings',
        'addUser', 'deleteUser', 'editUser', 'makeBackup', 'restoreBackup', 'importCustomers']
) ON CONFLICT (phone) DO NOTHING;

INSERT INTO cities (name) VALUES
    ('بغداد'),
    ('النجف الأشرف'),
    ('البصرة')
ON CONFLICT DO NOTHING;
