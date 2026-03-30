// البيانات الافتراضية للنظام

import { City, Customer, Employee, Task, RecurringTask, Reminder, Note } from './types';
import { ALL_PERMISSIONS } from './permissions';

export const INITIAL_CITIES: City[] = [
  { id: 'city_1', name: 'بغداد' },
  { id: 'city_2', name: 'النجف الأشرف' },
  { id: 'city_3', name: 'البصرة' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'أحمد محمود',
    phone: '07701234567',
    address: 'حي الجامعة، شارع الربيع',
    locationLink: 'https://maps.google.com/?q=33.3152,44.3661',
    cityIds: ['city_1'],
    reports: [
      { id: 'rep_1', title: 'زيارة أولى', content: 'تمت زيارة الزبون والاتفاق على المبادئ الأولية.', author: 'موظف المبيعات', date: '2023-10-25' },
    ]
  },
  {
    id: 'cust_2',
    name: 'شركة الأفق المحدودة',
    phone: '+9647809876543',
    address: 'المدينة القديمة، قرب المرقد',
    locationLink: 'https://maps.google.com/?q=31.9959,44.3146',
    cityIds: ['city_2', 'city_1'],
    reports: []
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp_1', name: 'مدير النظام', phone: '07700000000', password: '123', role: 'manager', permissions: ALL_PERMISSIONS },
  { id: 'emp_2', name: 'أحمد علي (موظف)', phone: '07700000001', password: '123', role: 'employee', permissions: ['viewCustomersAndCities', 'viewTasksSection'] },
  { id: 'emp_3', name: 'سارة محمد (موظف)', phone: '07700000002', password: '123', role: 'employee', permissions: ['viewCustomersAndCities'] },
];

export const INITIAL_TASKS: Task[] = [
  { id: 't_1', employeeId: 'emp_1', title: 'مراجعة حسابات الشهر', details: 'مراجعة كاملة مع قسم الحسابات', date: new Date().toISOString().split('T')[0], isFullDay: true, status: 'active' },
  { id: 't_2', employeeId: 'emp_2', title: 'زيارة عميل مهم', details: 'زيارة شركة الأفق', date: '2023-10-01', isFullDay: false, startTime: '10:00', endTime: '12:00', status: 'active' },
];

export const INITIAL_RECURRING_TASKS: RecurringTask[] = [
  { id: 'rt_1', employeeId: 'emp_2', title: 'اجتماع الصباح', details: 'اجتماع يومي لفريق المبيعات', daysOfWeek: ['0', '1', '2', '3', '4'], isFullDay: false, startTime: '08:00', endTime: '09:00' }
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem_1',
    title: 'تجديد اشتراك الإنترنت',
    details: 'يرجى التأكد من تجديد اشتراك الشركة قبل انقطاع الخدمة.',
    employeeIds: ['emp_1', 'emp_2'],
    date: new Date().toISOString().split('T')[0],
    isFullDay: true,
    startTime: '',
    endTime: '',
    completionType: 'single',
    completions: []
  }
];

export const INITIAL_NOTES: Note[] = [
  { id: 'note_1', content: 'يجب التأكد من تحديث أرقام هواتف الزبائن في محافظة البصرة بشكل دوري.', author: 'مدير النظام', date: '2023-11-01' },
  { id: 'note_2', content: 'تم تأجيل اجتماع المبيعات الأسبوع القادم إلى يوم الخميس بدلاً من الأربعاء.', author: 'أحمد علي (موظف)', date: '2023-11-02' }
];
