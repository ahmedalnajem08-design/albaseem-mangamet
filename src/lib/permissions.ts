// نظام الصلاحيات

export const PERMISSIONS_LIST = [
  { id: 'viewCustomersAndCities', label: 'ظهور قسم الزبائن والمدن' },
  { id: 'addCustomer', label: 'إضافة زبون' },
  { id: 'deleteCustomer', label: 'حذف زبون' },
  { id: 'editCustomer', label: 'تعديل زبون' },
  { id: 'viewReports', label: 'الدخول لتقارير الزبائن' },
  { id: 'addReport', label: 'إضافة تقرير للزبائن' },
  { id: 'deleteReport', label: 'حذف تقرير' },
  { id: 'addCity', label: 'إضافة مدينة' },
  { id: 'deleteCity', label: 'حذف مدينة' },
  { id: 'viewTasksSection', label: 'ظهور قسم المهام' },
  { id: 'addTask', label: 'إضافة مهمة' },
  { id: 'deleteTask', label: 'حذف مهمة' },
  { id: 'delayTask', label: 'تأجيل مهمة' },
  { id: 'cancelTask', label: 'إلغاء مهمة' },
  { id: 'viewWhatsappSection', label: 'اظهار قسم الواتساب' },
  { id: 'connectWhatsapp', label: 'ربط حساب واتساب' },
  { id: 'disconnectWhatsapp', label: 'إلغاء ربط واتساب' },
  { id: 'viewRemindersSection', label: 'ظهور قسم التذكيرات' },
  { id: 'addReminder', label: 'إضافة تذكير' },
  { id: 'deleteReminder', label: 'حذف تذكير' },
  { id: 'viewAllReminders', label: 'رؤية جميع التذكيرات' },
  { id: 'viewNotesSection', label: 'ظهور قسم الملاحظات' },
  { id: 'addNote', label: 'إضافة ملاحظة' },
  { id: 'deleteNote', label: 'حذف ملاحظة' },
  { id: 'viewSettings', label: 'الدخول إلى الإعدادات' },
  { id: 'addUser', label: 'إضافة مستخدم' },
  { id: 'deleteUser', label: 'حذف مستخدم' },
  { id: 'editUser', label: 'تعديل على مستخدم' },
  { id: 'makeBackup', label: 'عمل نسخة احتياطية' },
  { id: 'restoreBackup', label: 'رفع نسخة احتياطية' },
  { id: 'importCustomers', label: 'استيراد زبائن' },
];

export const ALL_PERMISSIONS = PERMISSIONS_LIST.map(p => p.id);

export const getUserPermissions = (user: { permissions: string[]; role: 'manager' | 'employee' } | null) => {
  if (!user) return {};
  
  const hasPerm = (perm: string) => user.permissions.includes(perm);
  
  return {
    viewCustomersAndCities: hasPerm('viewCustomersAndCities'),
    addCustomer: hasPerm('addCustomer'),
    deleteCustomer: hasPerm('deleteCustomer'),
    editCustomer: hasPerm('editCustomer'),
    viewReports: hasPerm('viewReports'),
    addReport: hasPerm('addReport'),
    deleteReport: hasPerm('deleteReport'),
    addCity: hasPerm('addCity'),
    deleteCity: hasPerm('deleteCity'),
    editAdminNote: user.role === 'manager',
    viewTasksSection: hasPerm('viewTasksSection'),
    addTask: hasPerm('addTask'),
    deleteTask: hasPerm('deleteTask'),
    delayTask: hasPerm('delayTask'),
    cancelTask: hasPerm('cancelTask'),
    viewWhatsappSection: hasPerm('viewWhatsappSection'),
    manageWhatsappConnection: user.role === 'manager',
    connectWhatsapp: hasPerm('connectWhatsapp'),
    disconnectWhatsapp: hasPerm('disconnectWhatsapp'),
    viewRemindersSection: hasPerm('viewRemindersSection'),
    addReminder: hasPerm('addReminder'),
    deleteReminder: hasPerm('deleteReminder'),
    viewAllReminders: hasPerm('viewAllReminders'),
    viewNotesSection: hasPerm('viewNotesSection'),
    addNote: hasPerm('addNote'),
    deleteNote: hasPerm('deleteNote'),
    viewSettings: hasPerm('viewSettings'),
    addUser: hasPerm('addUser'),
    deleteUser: hasPerm('deleteUser'),
    editUser: hasPerm('editUser'),
    makeBackup: hasPerm('makeBackup'),
    restoreBackup: hasPerm('restoreBackup'),
    importCustomers: hasPerm('importCustomers'),
  };
};
