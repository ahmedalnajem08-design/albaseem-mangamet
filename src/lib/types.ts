// أنواع البيانات الأساسية للنظام

export interface City {
  id: string;
  name: string;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  locationLink?: string;
  cityIds: string[];
  reports: Report[];
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: 'manager' | 'employee';
  permissions: string[];
}

export interface Task {
  id: string;
  employeeId: string;
  title: string;
  details: string;
  date: string;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
  status: 'active' | 'completed' | 'delayed' | 'canceled' | 'pending';
  completionDetails?: string;
  delayReason?: string;
  cancelReason?: string;
  canceledBy?: string;
  isVirtual?: boolean;
  daysOfWeek?: string[];
}

export interface RecurringTask {
  id: string;
  employeeId: string;
  title: string;
  details: string;
  daysOfWeek: string[];
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
}

export interface ReminderCompletion {
  employeeId: string;
  details: string;
  date: string;
}

export interface Reminder {
  id: string;
  title: string;
  details: string;
  employeeIds: string[];
  date: string;
  isFullDay: boolean;
  startTime: string;
  endTime: string;
  completionType: 'single' | 'all';
  completions: ReminderCompletion[];
}

export interface Note {
  id: string;
  content: string;
  author: string;
  date: string;
}

export interface ScheduledMessage {
  id: string;
  text: string;
  hasImage: boolean;
  targetLabel: string;
  targets: Array<{ id: string; name: string; phone: string; type: string }>;
  scheduleDate: string;
  createdAt: string;
}

export interface SendLog {
  id: string;
  targetName: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface Permission {
  id: string;
  label: string;
}

export type WhatsappStatus = 'disconnected' | 'connecting' | 'connected';

export type AppSection = 'dashboard' | 'crm' | 'tasks' | 'whatsapp' | 'reminders' | 'notes' | 'settings';

export type TasksSubSection = 'myTasks' | 'employeeTasks' | 'recurringTasks';

export type WhatsappSubSection = 'send' | 'scheduled';

export type SettingsTab = 'users' | 'backup' | 'whatsapp' | 'import';

export type RemindersTab = 'today' | 'active' | 'completed' | 'pending' | 'all';

export type TaskActiveTab = 'active' | 'completed' | 'delayed' | 'pending' | 'canceled' | 'all';
