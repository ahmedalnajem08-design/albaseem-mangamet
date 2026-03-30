-- ============================================
-- AL-BASEEM System - Supabase Database Tables
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
-- DISABLE RLS (Allow all operations)
-- ============================================
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE cities DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_cities DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default manager
INSERT INTO employees (name, phone, password, role, permissions) VALUES
('مدير النظام', '07700000000', '123', 'manager', ARRAY[
    'viewCustomersAndCities', 'addCustomer', 'deleteCustomer', 'editCustomer',
    'viewReports', 'addReport', 'deleteReport', 'addCity', 'deleteCity',
    'viewTasksSection', 'addTask', 'deleteTask', 'delayTask', 'cancelTask',
    'viewWhatsappSection', 'connectWhatsapp', 'disconnectWhatsapp',
    'viewRemindersSection', 'addReminder', 'deleteReminder', 'viewAllReminders',
    'viewNotesSection', 'addNote', 'deleteNote', 'viewSettings',
    'addUser', 'deleteUser', 'editUser', 'makeBackup', 'restoreBackup', 'importCustomers'
]) ON CONFLICT (phone) DO NOTHING;

-- Insert default cities
INSERT INTO cities (name) VALUES
('بغداد'),
('النجف الأشرف'),
('البصرة')
ON CONFLICT DO NOTHING;

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
CREATE INDEX IF NOT EXISTS idx_reminder_completions_reminder ON reminder_completions(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_completions_employee ON reminder_completions(employee_id);
