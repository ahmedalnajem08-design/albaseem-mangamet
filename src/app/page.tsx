'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, MapPin, Phone, MessageCircle, Search, Plus, 
  Trash2, Edit, FileText, ChevronRight, AlertTriangle, User, Calendar,
  Briefcase, CheckCircle, Clock, XCircle, List, Repeat, CalendarDays,
  LayoutDashboard, Bell, StickyNote, Settings, Menu, Image as ImageIcon, Send, QrCode, Smartphone, RefreshCw,
  Download, Upload, FileSpreadsheet, Lock, Shield, Database, Instagram, LogOut, Wifi, WifiOff, Save, Cloud, CloudOff,
  GripVertical
} from 'lucide-react';

// --- بيانات افتراضية (Mock Data) ---
const INITIAL_CITIES = [
  { id: 'city_1', name: 'بغداد' },
  { id: 'city_2', name: 'النجف الأشرف' },
  { id: 'city_3', name: 'البصرة' },
];

const INITIAL_CUSTOMERS = [
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

const PERMISSIONS_LIST = [
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
const ALL_PERMS = PERMISSIONS_LIST.map(p => p.id);

const INITIAL_EMPLOYEES = [
  { id: 'emp_1', name: 'مدير النظام', phone: '07700000000', password: '123', role: 'manager', permissions: ALL_PERMS },
  { id: 'emp_2', name: 'أحمد علي (موظف)', phone: '07700000001', password: '123', role: 'employee', permissions: ['viewCustomersAndCities', 'viewTasksSection'] },
  { id: 'emp_3', name: 'سارة محمد (موظف)', phone: '07700000002', password: '123', role: 'employee', permissions: ['viewCustomersAndCities'] },
];

const INITIAL_TASKS = [
  { id: 't_1', employeeId: 'emp_1', title: 'مراجعة حسابات الشهر', details: 'مراجعة كاملة مع قسم الحسابات', date: new Date().toISOString().split('T')[0], isFullDay: true, status: 'active' },
  { id: 't_2', employeeId: 'emp_2', title: 'زيارة عميل مهم', details: 'زيارة شركة الأفق', date: '2023-10-01', isFullDay: false, startTime: '10:00', endTime: '12:00', status: 'active' },
];

const INITIAL_RECURRING_TASKS = [
  { id: 'rt_1', employeeId: 'emp_2', title: 'اجتماع الصباح', details: 'اجتماع يومي لفريق المبيعات', daysOfWeek: ['0', '1', '2', '3', '4'], isFullDay: false, startTime: '08:00', endTime: '09:00' }
];

const INITIAL_REMINDERS = [
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

const INITIAL_NOTES = [
  { id: 'note_1', content: 'يجب التأكد من تحديث أرقام هواتف الزبائن في محافظة البصرة بشكل دوري.', author: 'مدير النظام', date: '2023-11-01' },
  { id: 'note_2', content: 'تم تأجيل اجتماع المبيعات الأسبوع القادم إلى يوم الخميس بدلاً من الأربعاء.', author: 'أحمد علي (موظف)', date: '2023-11-02' }
];

// Helper functions for localStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const saved = localStorage.getItem(`albaseem_${key}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
  }
  return defaultValue;
};

const saveToStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`albaseem_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

export default function Home() {
  // --- Auth States ---
  const [currentUser, setCurrentUser] = useState(null);
  const CURRENT_USER = currentUser;

  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // --- States ---
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const EMPLOYEES = employeesList;

  // --- Dynamic Permissions ---
  const hasPerm = (perm: string) => CURRENT_USER?.permissions?.includes(perm);
  const USER_PERMISSIONS = CURRENT_USER ? {
    viewCustomersAndCities: hasPerm('viewCustomersAndCities'),
    addCustomer: hasPerm('addCustomer'),
    deleteCustomer: hasPerm('deleteCustomer'),
    editCustomer: hasPerm('editCustomer'),
    viewReports: hasPerm('viewReports'),
    addReport: hasPerm('addReport'),
    deleteReport: hasPerm('deleteReport'),
    addCity: hasPerm('addCity'),
    deleteCity: hasPerm('deleteCity'),
    editAdminNote: CURRENT_USER.role === 'manager',
    viewTasksSection: hasPerm('viewTasksSection'),
    addTask: hasPerm('addTask'),
    deleteTask: hasPerm('deleteTask'),
    delayTask: hasPerm('delayTask'),
    cancelTask: hasPerm('cancelTask'),
    viewWhatsappSection: hasPerm('viewWhatsappSection'),
    manageWhatsappConnection: CURRENT_USER.role === 'manager',
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
  } : {};

  const [appSection, setAppSection] = useState('dashboard');
  const [tasksSubSection, setTasksSubSection] = useState('myTasks');
  const [whatsappSubSection, setWhatsappSubSection] = useState('send');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('customers');
  const [cities, setCities] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  // Navigation States
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityViewMode, setCityViewMode] = useState(false);
  const [customerOrder, setCustomerOrder] = useState<Record<string, string[]>>({});
  const [draggedCustomer, setDraggedCustomer] = useState<string | null>(null);

  // Search States
  const [customerSearch, setCustomerSearch] = useState('');
  const [cityCustomerSearch, setCityCustomerSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');

  // Modals States
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [deleteCityTransfer, setDeleteCityTransfer] = useState(null);

  // Tasks States
  const [tasks, setTasks] = useState<any[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<any[]>([]);
  const [selectedTaskEmployee, setSelectedTaskEmployee] = useState(null); 
  const [taskActiveTab, setTaskActiveTab] = useState('active');
  const [taskDateFilter, setTaskDateFilter] = useState(new Date().toISOString().split('T')[0]);
  
  // Tasks Modals
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskActionModal, setTaskActionModal] = useState(null);

  // Global Admin Note (Mock)
  const [adminNote, setAdminNote] = useState('يرجى التأكد من تحديث بيانات الزبون بشكل دوري والتواصل معه أسبوعياً.');

  // --- WhatsApp & Settings States ---
  const [waStatus, setWaStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [waPhone, setWaPhone] = useState('');
  const [waQrCode, setWaQrCode] = useState('');
  const [waQrTimer, setWaQrTimer] = useState(20);
  const [waLoading, setWaLoading] = useState(false);
  const [waServerUrl, setWaServerUrl] = useState('https://albaseem-whatsapp-production.up.railway.app');
  const [waPollingInterval, setWaPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Send Message States
  const [waTargetType, setWaTargetType] = useState('all');
  const [waSelectedCity, setWaSelectedCity] = useState('');
  const [waSpecificCustomers, setWaSpecificCustomers] = useState<string[]>([]);
  const [waCustomerSearch, setWaCustomerSearch] = useState('');
  const [waSpecificEmployees, setWaSpecificEmployees] = useState<string[]>([]);
  const [waMessageText, setWaMessageText] = useState('');
  const [waMessageImage, setWaMessageImage] = useState<File | null>(null);
  
  const [scheduledMessages, setScheduledMessages] = useState<any[]>(() => loadFromStorage('scheduledMessages', []));
  const [sendLogs, setSendLogs] = useState<Array<{id: string; targetName: string; phone: string; status: string; error: string}>>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // --- Settings States ---
  const [settingsTab, setSettingsTab] = useState('users');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [lastBackup, setLastBackup] = useState({ time: '2023-11-01 10:30 AM', user: 'مدير النظام' });
  const [waMessageDelay, setWaMessageDelay] = useState(5);
  const [importCityId, setImportCityId] = useState('');

  // --- Reminders States ---
  const [reminders, setReminders] = useState<any[]>([]);
  const [remindersTab, setRemindersTab] = useState('today');
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [reminderCompletionModal, setReminderCompletionModal] = useState(null);

  // --- Notes States ---
  const [notes, setNotes] = useState<any[]>([]);
  const [noteSearch, setNoteSearch] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  // --- Load data from API on mount ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load employees
        const empRes = await fetch('/api/employees');
        const empData = await empRes.json();
        if (empData.success) {
          setEmployeesList(empData.data);
        }

        // Load cities
        const citiesRes = await fetch('/api/cities');
        const citiesData = await citiesRes.json();
        if (citiesData.success) {
          setCities(citiesData.data);
        }

        // Load customers
        const custRes = await fetch('/api/customers');
        const custData = await custRes.json();
        if (custData.success) {
          setCustomers(custData.data);
        }

        // Load tasks
        const tasksRes = await fetch('/api/tasks');
        const tasksData = await tasksRes.json();
        if (tasksData.success) {
          setTasks(tasksData.data);
        }

        // Load reminders
        const remRes = await fetch('/api/reminders');
        const remData = await remRes.json();
        if (remData.success) {
          setReminders(remData.data);
        }

        // Load notes
        const notesRes = await fetch('/api/notes');
        const notesData = await notesRes.json();
        if (notesData.success) {
          setNotes(notesData.data);
        }
        
        // Load customer order from localStorage
        loadCustomerOrder();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Load customer order from localStorage
  const loadCustomerOrder = () => {
    if (typeof window === 'undefined' || !CURRENT_USER) return;
    try {
      const saved = localStorage.getItem(`albaseem_customer_order_${CURRENT_USER.id}`);
      if (saved) {
        setCustomerOrder(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading customer order:', e);
    }
  };
  
  // Save customer order to localStorage
  const saveCustomerOrder = (cityId: string, orderedIds: string[]) => {
    if (typeof window === 'undefined' || !CURRENT_USER) return;
    try {
      const newOrder = { ...customerOrder, [cityId]: orderedIds };
      setCustomerOrder(newOrder);
      localStorage.setItem(`albaseem_customer_order_${CURRENT_USER.id}`, JSON.stringify(newOrder));
    } catch (e) {
      console.error('Error saving customer order:', e);
    }
  };
  
  // Get ordered customers for a city
  const getOrderedCustomers = (cityId: string) => {
    const cityCustomers = customers.filter(c => c.cityIds.includes(cityId));
    const order = customerOrder[cityId];
    
    if (!order || order.length === 0) {
      return cityCustomers;
    }
    
    // Sort by saved order, then append any new customers not in order
    const ordered: any[] = [];
    const addedIds = new Set();
    
    // Add customers in saved order
    order.forEach(id => {
      const customer = cityCustomers.find(c => c.id === id);
      if (customer) {
        ordered.push(customer);
        addedIds.add(id);
      }
    });
    
    // Add any new customers not in the saved order
    cityCustomers.forEach(c => {
      if (!addedIds.has(c.id)) {
        ordered.push(c);
      }
    });
    
    return ordered;
  };
  
  // Drag and drop handlers
  const handleDragStart = (customerId: string) => {
    setDraggedCustomer(customerId);
  };
  
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
  };
  
  const handleDrop = (targetId: string) => {
    if (!draggedCustomer || draggedCustomer === targetId) {
      setDraggedCustomer(null);
      return;
    }
    
    if (!selectedCity) return;
    
    const currentOrder = customerOrder[selectedCity.id] || cityFilteredCustomers.map(c => c.id);
    const draggedIndex = currentOrder.indexOf(draggedCustomer);
    const targetIndex = currentOrder.indexOf(targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedCustomer(null);
      return;
    }
    
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCustomer);
    
    saveCustomerOrder(selectedCity.id, newOrder);
    setDraggedCustomer(null);
  };

  // --- Login Handler ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCurrentUser(result.user);
        setLoginError('');
        setLoginPhone('');
        setLoginPassword('');
      } else {
        setLoginError(result.error || 'رقم الهاتف أو كلمة المرور غير صحيحة.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('حدث خطأ أثناء تسجيل الدخول');
    }
  };

  // QR Code timer countdown
  useEffect(() => {
    let countdown: NodeJS.Timeout | null = null;
    if (waStatus === 'connecting' && waQrCode) {
      countdown = setInterval(() => {
        setWaQrTimer((prev) => {
          if (prev <= 1) {
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdown) clearInterval(countdown);
    };
  }, [waStatus, waQrCode]);

  // --- Handlers ---
  
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const selectedCityIds = formData.getAll('cityIds');
    
    if (selectedCityIds.length === 0) {
      alert("الرجاء اختيار مدينة واحدة على الأقل");
      return;
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          locationLink: formData.get('locationLink'),
          cityIds: selectedCityIds
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh customers list
        const custRes = await fetch('/api/customers');
        const custData = await custRes.json();
        if (custData.success) {
          setCustomers(custData.data);
        }
        setIsAddCustomerOpen(false);
      } else {
        alert('خطأ: ' + (result.error || 'فشل إضافة الزبون'));
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('حدث خطأ أثناء إضافة الزبون');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if(window.confirm('هل أنت متأكد من حذف هذا الزبون؟')) {
      try {
        const response = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
          setCustomers(customers.filter(c => c.id !== id));
          if(selectedCustomer?.id === id) setSelectedCustomer(null);
        } else {
          alert('خطأ: ' + (result.error || 'فشل حذف الزبون'));
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('حدث خطأ أثناء حذف الزبون');
      }
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = new FormData(e.target as HTMLFormElement).get('name');
    if (name) {
      try {
        const response = await fetch('/api/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setCities([...cities, result.data]);
          setIsAddCityOpen(false);
        } else {
          alert('خطأ: ' + (result.error || 'فشل إضافة المدينة'));
        }
      } catch (error) {
        console.error('Error adding city:', error);
        alert('حدث خطأ أثناء إضافة المدينة');
      }
    }
  };

  const handleDeleteCityRequest = async (cityId: string) => {
    const affectedCustomers = customers.filter(c => c.cityIds.includes(cityId));
    
    if (affectedCustomers.length > 0) {
      setDeleteCityTransfer({ cityId, affectedCustomers });
    } else {
      if(window.confirm('هل أنت متأكد من حذف هذه المدينة؟')) {
        try {
          const response = await fetch(`/api/cities?id=${cityId}`, { method: 'DELETE' });
          const result = await response.json();
          
          if (result.success) {
            setCities(cities.filter(c => c.id !== cityId));
          } else {
            alert('خطأ: ' + (result.error || 'فشل حذف المدينة'));
          }
        } catch (error) {
          console.error('Error deleting city:', error);
          alert('حدث خطأ أثناء حذف المدينة');
        }
      }
    }
  };

  const handleTransferAndDeleteCity = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCityId = new FormData(e.target as HTMLFormElement).get('newCityId');
    const oldCityId = deleteCityTransfer.cityId;

    // Transfer customers to new city via API
    for (const cust of deleteCityTransfer.affectedCustomers) {
      let newCityIds = cust.cityIds.filter((id: string) => id !== oldCityId);
      if (!newCityIds.includes(newCityId)) {
        newCityIds.push(newCityId as string);
      }
      
      await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cust.id, cityIds: newCityIds })
      });
    }

    // Delete old city
    await fetch(`/api/cities?id=${oldCityId}`, { method: 'DELETE' });

    // Refresh data
    const [custRes, citiesRes] = await Promise.all([
      fetch('/api/customers'),
      fetch('/api/cities')
    ]);
    const custData = await custRes.json();
    const citiesData = await citiesRes.json();
    
    if (custData.success) setCustomers(custData.data);
    if (citiesData.success) setCities(citiesData.data);
    
    setDeleteCityTransfer(null);
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          title: formData.get('title'),
          content: formData.get('content'),
          author: CURRENT_USER?.name || 'مستخدم'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh customers to get updated reports
        const custRes = await fetch('/api/customers');
        const custData = await custRes.json();
        if (custData.success) {
          setCustomers(custData.data);
          const updated = custData.data.find((c: any) => c.id === selectedCustomer.id);
          if (updated) setSelectedCustomer(updated);
        }
        setIsAddReportOpen(false);
      } else {
        alert('خطأ: ' + (result.error || 'فشل إضافة التقرير'));
      }
    } catch (error) {
      console.error('Error adding report:', error);
      alert('حدث خطأ أثناء إضافة التقرير');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if(window.confirm('هل أنت متأكد من حذف التقرير؟')) {
      try {
        const response = await fetch(`/api/reports?id=${reportId}&customerId=${selectedCustomer.id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
          // Refresh customers
          const custRes = await fetch('/api/customers');
          const custData = await custRes.json();
          if (custData.success) {
            setCustomers(custData.data);
            const updated = custData.data.find((c: any) => c.id === selectedCustomer.id);
            if (updated) setSelectedCustomer(updated);
          }
        } else {
          alert('خطأ: ' + (result.error || 'فشل حذف التقرير'));
        }
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('حدث خطأ أثناء حذف التقرير');
      }
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('title');
    const details = formData.get('details');
    const isRecurring = formData.get('isRecurring') === 'on';
    const isFullDay = formData.get('isFullDay') === 'on';
    const employeeId = formData.get('employeeId') || CURRENT_USER?.id;
    const date = formData.get('date');
    
    if (isRecurring) {
      const daysOfWeek = formData.getAll('daysOfWeek');
      if (daysOfWeek.length === 0) return alert('الرجاء اختيار يوم واحد على الأقل للمهمة المتكررة');
      const newRT = {
        id: `rt_${Date.now()}`, employeeId, title, details, daysOfWeek,
        isFullDay, startTime: formData.get('startTime'), endTime: formData.get('endTime')
      };
      setRecurringTasks([...recurringTasks, newRT]);
    } else {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            title,
            details,
            date,
            isFullDay,
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime')
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Refresh tasks
          const tasksRes = await fetch('/api/tasks');
          const tasksData = await tasksRes.json();
          if (tasksData.success) {
            setTasks(tasksData.data);
          }
        } else {
          alert('خطأ: ' + (result.error || 'فشل إضافة المهمة'));
        }
      } catch (error) {
        console.error('Error adding task:', error);
        alert('حدث خطأ أثناء إضافة المهمة');
      }
    }
    setIsAddTaskOpen(false);
  };

  const handleTaskAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const { type, task } = taskActionModal;
    
    let updatedTask = { ...task };
    const isVirtual = task.isVirtual;
    
    if (type === 'complete') {
      updatedTask.status = 'completed';
      updatedTask.completionDetails = formData.get('completionDetails');
    } else if (type === 'delay') {
      updatedTask.status = 'delayed';
      updatedTask.delayReason = formData.get('delayReason');
      updatedTask.date = formData.get('newDate');
      updatedTask.startTime = formData.get('newStartTime');
      updatedTask.endTime = formData.get('newEndTime');
      updatedTask.isFullDay = formData.get('isFullDay') === 'on';
    } else if (type === 'cancel') {
      updatedTask.status = 'canceled';
      updatedTask.cancelReason = formData.get('cancelReason');
      updatedTask.canceledBy = CURRENT_USER?.name;
    } else if (type === 'reschedule') {
      updatedTask.status = 'active';
      updatedTask.date = formData.get('newDate');
      updatedTask.startTime = formData.get('newStartTime');
      updatedTask.endTime = formData.get('newEndTime');
      updatedTask.isFullDay = formData.get('isFullDay') === 'on';
    }

    try {
      if (isVirtual) {
        delete updatedTask.isVirtual;
        delete updatedTask.daysOfWeek;
        // Create new task from virtual recurring task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: updatedTask.employeeId,
            title: updatedTask.title,
            details: updatedTask.details,
            date: updatedTask.date,
            isFullDay: updatedTask.isFullDay,
            startTime: updatedTask.startTime,
            endTime: updatedTask.endTime,
            status: updatedTask.status,
            completionDetails: updatedTask.completionDetails,
            delayReason: updatedTask.delayReason,
            cancelReason: updatedTask.cancelReason,
            canceledBy: updatedTask.canceledBy
          })
        });
        const result = await response.json();
        if (result.success) {
          const tasksRes = await fetch('/api/tasks');
          const tasksData = await tasksRes.json();
          if (tasksData.success) setTasks(tasksData.data);
        }
      } else {
        // Update existing task
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: task.id,
            status: updatedTask.status,
            completionDetails: updatedTask.completionDetails,
            delayReason: updatedTask.delayReason,
            cancelReason: updatedTask.cancelReason,
            canceledBy: updatedTask.canceledBy,
            date: updatedTask.date,
            startTime: updatedTask.startTime,
            endTime: updatedTask.endTime,
            isFullDay: updatedTask.isFullDay
          })
        });
        const result = await response.json();
        if (result.success) {
          const tasksRes = await fetch('/api/tasks');
          const tasksData = await tasksRes.json();
          if (tasksData.success) setTasks(tasksData.data);
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('حدث خطأ أثناء تحديث المهمة');
    }
    setTaskActionModal(null);
  };

  const handleDeleteRecurringTask = (id: string) => {
     if(window.confirm('هل أنت متأكد من إلغاء تكرار هذه المهمة؟')) {
        setRecurringTasks(recurringTasks.filter(rt => rt.id !== id));
     }
  };

  const handleConnectWhatsapp = async () => {
    await connectToWaServer();
  };
  
  const connectToWaServer = async () => {
    setWaLoading(true);
    setWaStatus('connecting');
    
    try {
      // Check status via main API
      const statusRes = await fetch('/api/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' })
      });
      const statusData = await statusRes.json();
      
      if (statusData.ready) {
        // Already connected
        setWaStatus('connected');
        setWaPhone('');
        setWaQrCode('');
        setWaLoading(false);
        return;
      }
      
      // Get QR Code directly from Railway
      const qrRes = await fetch('https://albaseem-whatsapp-production.up.railway.app/api/qr');
      const qrData = await qrRes.json();
      
      if (qrData.qr) {
        setWaQrCode(qrData.qr);
        // Start polling for connection
        startWaPolling();
      } else {
        // Wait and retry
        setTimeout(() => connectToWaServer(), 3000);
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('فشل الاتصال بالسيرفر. تأكد من أن السيرفر يعمل.');
      setWaStatus('disconnected');
    }
    
    setWaLoading(false);
  };
  
  const startWaPolling = () => {
    // Clear existing interval
    if (waPollingInterval) {
      clearInterval(waPollingInterval);
    }
    
    // Poll every 2 seconds via main API
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status' })
        });
        const data = await res.json();
        
        if (data.ready) {
          setWaStatus('connected');
          setWaPhone('');
          setWaQrCode('');
          clearInterval(interval);
        } else if (data.status === 'qr') {
          // Get updated QR
          const qrRes = await fetch('https://albaseem-whatsapp-production.up.railway.app/api/qr');
          const qrData = await qrRes.json();
          if (qrData.qr) setWaQrCode(qrData.qr);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
    
    setWaPollingInterval(interval);
  };
  
  // Auto-connect to WhatsApp server on mount
  useEffect(() => {
    // Check connection status via main API
    fetch('/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status' })
    })
      .then(res => res.json())
      .then(data => {
        console.log('WhatsApp server status:', data);
        if (data.ready) {
          setWaStatus('connected');
        }
      })
      .catch(err => console.error('Failed to connect to WhatsApp server:', err));
  }, []);
  
  const handleDisconnectWhatsapp = async () => {
    if(window.confirm('هل أنت متأكد من إلغاء ربط الحساب الحالي؟')) {
      if (waPollingInterval) {
        clearInterval(waPollingInterval);
      }
      
      try {
        await fetch('https://albaseem-whatsapp-production.up.railway.app/api/logout', { method: 'POST' });
      } catch (error) {
        console.error('Disconnect error:', error);
      }
      
      setWaStatus('disconnected');
      setWaPhone('');
      setWaQrCode('');
    }
  };
  
  const handleSimulateScan = () => {
    // This is now handled by polling
  };
  
  // تنسيق رقم الهاتف للواتساب (إضافة رمز الدولة العراقي)
  const formatPhoneForWhatsApp = (phone: string): string => {
    if (!phone) return '';
    
    // إزالة جميع الأحرف غير الرقمية
    let cleaned = phone.replace(/\D/g, '');
    
    // إذا كان الرقم يبدأ بـ 0 (رقم عراقي محلي)
    if (cleaned.startsWith('0')) {
      cleaned = '964' + cleaned.substring(1);
    }
    
    // إذا كان الرقم يبدأ بـ 964 بالفعل
    if (cleaned.startsWith('964')) {
      return cleaned;
    }
    
    // إذا كان الرقم لا يبدأ بـ 0 أو 964، نضيف 964
    if (!cleaned.startsWith('964') && cleaned.length === 10) {
      cleaned = '964' + cleaned;
    }
    
    return cleaned;
  };

  const sendWhatsappMessage = async (phone: string, message: string) => {
    console.log('sendWhatsappMessage called:', { phone, message, waStatus });
    
    if (waStatus !== 'connected') {
      throw new Error('الواتساب غير متصل');
    }
    
    // تنسيق الرقم للواتساب
    const formattedPhone = formatPhoneForWhatsApp(phone);
    console.log(`Sending to ${formattedPhone} (original: ${phone})`);
    
    try {
      // Use Next.js API route to avoid CORS issues
      const response = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formattedPhone, 
          message,
          serverUrl: waServerUrl 
        })
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'فشل الإرسال');
      }
      
      return result;
    } catch (error: any) {
      console.error('sendWhatsappMessage error:', error);
      throw error;
    }
  };

  const executeSendWhatsapp = async (isScheduled = false, scheduleDate = null) => {
    // تحقق من وجود رسالة
    if (!waMessageText && !waMessageImage) {
      alert('الرجاء كتابة رسالة');
      return;
    }
    
    // تحقق من الاتصال
    if (waStatus !== 'connected') {
      alert('الواتساب غير متصل. تأكد من الاتصال أولاً.');
      return;
    }
    
    // جمع المستلمين
    let targets: any[] = [];

    if (waTargetType === 'all') {
      targets = customers.map(c => ({ id: c.id, name: c.name, phone: c.phone }));
    } else if (waTargetType === 'city') {
      if (!waSelectedCity) {
        alert('الرجاء اختيار المدينة');
        return;
      }
      targets = customers.filter(c => c.cityIds.includes(waSelectedCity)).map(c => ({ id: c.id, name: c.name, phone: c.phone }));
    } else if (waTargetType === 'specific_customers') {
      if (waSpecificCustomers.length === 0) {
        alert('الرجاء اختيار زبون واحد على الأقل');
        return;
      }
      targets = customers.filter(c => waSpecificCustomers.includes(c.id)).map(c => ({ id: c.id, name: c.name, phone: c.phone }));
    }

    if (targets.length === 0) {
      alert('لا يوجد مستلمين');
      return;
    }

    // تأكيد الإرسال
    const confirmMsg = `سيتم إرسال الرسالة إلى ${targets.length} مستلم\nهل تريد المتابعة؟`;
    if (!window.confirm(confirmMsg)) return;

    // إرسال الرسائل
    const logs: Array<{id: string; targetName: string; phone: string; status: string; error: string}> = [];
    
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      
      // تنسيق الرقم
      let phone = target.phone.replace(/\D/g, '');
      if (phone.startsWith('0')) {
        phone = '964' + phone.substring(1);
      }
      
      try {
        // إرسال مباشرة إلى Railway (CORS مدعوم)
        const response = await fetch('https://albaseem-whatsapp-production.up.railway.app/api/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phone: phone, 
            message: waMessageText 
          })
        });
        
        const result = await response.json();
        console.log('Railway result:', result);
        
        if (result.success) {
          logs.push({
            id: `log_${Date.now()}_${target.id}`,
            targetName: target.name,
            phone: phone,
            status: 'success',
            error: ''
          });
        } else {
          logs.push({
            id: `log_${Date.now()}_${target.id}`,
            targetName: target.name,
            phone: phone,
            status: 'failed',
            error: result.error || result.message || 'فشل الإرسال'
          });
        }
      } catch (err: any) {
        console.error('Send error:', err);
        // Fallback: فتح واتساب ويب
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(waMessageText)}`;
        logs.push({
          id: `log_${Date.now()}_${target.id}`,
          targetName: target.name,
          phone: phone,
          status: 'fallback',
          error: `سيتم فتح واتساب ويب - ${err.message}`
        });
        window.open(whatsappUrl, '_blank');
      }
      
      // تأخير بين الرسائل
      if (i < targets.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    
    setSendLogs(logs);
    
    // عرض النتيجة
    const successCount = logs.filter(l => l.status === 'success').length;
    const failCount = logs.filter(l => l.status === 'failed').length;
    
    if (failCount === 0) {
      alert(`✅ تم إرسال ${successCount} رسالة بنجاح!`);
    } else if (successCount === 0) {
      alert(`❌ فشل إرسال جميع الرسائل (${failCount})\nالسبب: ${logs[0]?.error}`);
    } else {
      alert(`تم إرسال ${successCount} نجح و ${failCount} فشل`);
    }
    
    setWaMessageText('');
  };

  const handleCancelScheduledMsg = (id: string) => {
    if(window.confirm('هل أنت متأكد من إلغاء هذه الرسالة المجدولة؟')) {
      setScheduledMessages(scheduledMessages.filter(m => m.id !== id));
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('title');
    const details = formData.get('details');
    const employeeIds = formData.getAll('employeeIds');
    const isFullDay = formData.get('isFullDay') === 'on';
    const completionType = formData.get('completionType'); 
    const date = formData.get('date');
    
    if (employeeIds.length === 0) return alert('الرجاء اختيار موظف واحد على الأقل.');

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          details,
          employeeIds,
          date,
          isFullDay,
          startTime: formData.get('startTime'),
          endTime: formData.get('endTime'),
          completionType
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh reminders
        const remRes = await fetch('/api/reminders');
        const remData = await remRes.json();
        if (remData.success) {
          setReminders(remData.data);
        }
        setIsAddReminderOpen(false);
        alert('تم إضافة التذكير بنجاح');
      } else {
        alert('خطأ: ' + (result.error || 'فشل إضافة التذكير'));
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      alert('حدث خطأ أثناء إضافة التذكير');
    }
  };

  const handleCompleteReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    const details = new FormData(e.target as HTMLFormElement).get('completionDetails');
    const { reminder } = reminderCompletionModal;

    try {
      const response = await fetch('/api/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminderId: reminder.id,
          employeeId: CURRENT_USER?.id,
          details
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh reminders
        const remRes = await fetch('/api/reminders');
        const remData = await remRes.json();
        if (remData.success) {
          setReminders(remData.data);
        }
      } else {
        alert('خطأ: ' + (result.error || 'فشل إكمال التذكير'));
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
      alert('حدث خطأ أثناء إكمال التذكير');
    }
    
    setReminderCompletionModal(null);
  };

  const handleDeleteReminder = async (id: string) => {
    if(window.confirm('هل أنت متأكد من حذف هذا التذكير؟')) {
      try {
        const response = await fetch(`/api/reminders?id=${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
          setReminders(reminders.filter(r => r.id !== id));
        } else {
          alert('خطأ: ' + (result.error || 'فشل حذف التذكير'));
        }
      } catch (error) {
        console.error('Error deleting reminder:', error);
        alert('حدث خطأ أثناء حذف التذكير');
      }
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNoteText,
          author: CURRENT_USER?.name
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh notes
        const notesRes = await fetch('/api/notes');
        const notesData = await notesRes.json();
        if (notesData.success) {
          setNotes(notesData.data);
        }
        setNewNoteText('');
      } else {
        alert('خطأ: ' + (result.error || 'فشل إضافة الملاحظة'));
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('حدث خطأ أثناء إضافة الملاحظة');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if(window.confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
      try {
        const response = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
          setNotes(notes.filter(n => n.id !== id));
        } else {
          alert('خطأ: ' + (result.error || 'فشل حذف الملاحظة'));
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('حدث خطأ أثناء حذف الملاحظة');
      }
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const selectedPerms = formData.getAll('permissions');
    
    const userData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      password: formData.get('password'),
      role: formData.get('role'),
      permissions: selectedPerms
    };

    try {
      if (editingUser) {
        const response = await fetch('/api/employees', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: (editingUser as any).id, ...userData })
        });
        const result = await response.json();
        if (result.success) {
          const empRes = await fetch('/api/employees');
          const empData = await empRes.json();
          if (empData.success) setEmployeesList(empData.data);
        } else {
          alert('خطأ: ' + (result.error || 'فشل تحديث المستخدم'));
        }
      } else {
        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const result = await response.json();
        if (result.success) {
          const empRes = await fetch('/api/employees');
          const empData = await empRes.json();
          if (empData.success) setEmployeesList(empData.data);
        } else {
          alert('خطأ: ' + (result.error || 'فشل إضافة المستخدم'));
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('حدث خطأ أثناء حفظ المستخدم');
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (id: string) => {
    if(window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        const response = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
          setEmployeesList(employeesList.filter((emp: any) => emp.id !== id));
        } else {
          alert('خطأ: ' + (result.error || 'فشل حذف المستخدم'));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('حدث خطأ أثناء حذف المستخدم');
      }
    }
  };

  const handleMakeBackup = () => {
    // Create backup JSON
    const backup = {
      cities,
      customers,
      employees: employeesList,
      tasks,
      recurringTasks,
      reminders,
      notes,
      scheduledMessages,
      backupDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `albaseem_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setLastBackup({ time: new Date().toLocaleString(), user: CURRENT_USER?.name || 'مجهول' });
    alert('تم تنزيل النسخة الاحتياطية بنجاح.');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        
        if (backup.cities) setCities(backup.cities);
        if (backup.customers) setCustomers(backup.customers);
        if (backup.employees) setEmployeesList(backup.employees);
        if (backup.tasks) setTasks(backup.tasks);
        if (backup.recurringTasks) setRecurringTasks(backup.recurringTasks);
        if (backup.reminders) setReminders(backup.reminders);
        if (backup.notes) setNotes(backup.notes);
        if (backup.scheduledMessages) setScheduledMessages(backup.scheduledMessages);
        
        alert('تم استعادة النسخة الاحتياطية بنجاح!');
      } catch (error) {
        alert('خطأ في قراءة الملف. تأكد من أن الملف نسخة احتياطية صالحة.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportCustomers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCityId) return alert('الرجاء اختيار المدينة أولاً.');
    
    const fileInput = document.getElementById('importFile') as HTMLInputElement;
    if (!fileInput?.files?.length) return alert('الرجاء اختيار ملف إكسل أو CSV.');

    const file = fileInput.files[0];
    
    // Check file type
    const fileName = file.name.toLowerCase();
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const isValidFile = validTypes.some(ext => fileName.endsWith(ext));
    
    if (!isValidFile) {
      alert('يرجى اختيار ملف Excel (.xlsx, .xls) أو CSV');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('cityId', importCityId);

      const response = await fetch('/api/customers/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Refresh customers list
        const custRes = await fetch('/api/customers');
        const custData = await custRes.json();
        if (custData.success) {
          setCustomers(custData.data);
        }
        
        // Show detailed result
        let message = result.message;
        if (result.details?.failed > 0) {
          message += `\n\nالأخطاء:\n${result.details.errors.slice(0, 10).join('\n')}`;
          if (result.details.errors.length > 10) {
            message += `\n... و ${result.details.errors.length - 10} خطأ آخر`;
          }
        }
        alert(message);
      } else {
        alert('خطأ: ' + (result.error || 'فشل الاستيراد') + (result.hint ? '\n' + result.hint : ''));
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('خطأ في قراءة الملف. تأكد من صيغة الملف.');
    }
    
    setImportCityId('');
    fileInput.value = '';
  };

  // --- Derived Data ---
  const getProcessedTasksForEmployee = (empId: string, filterDate: string) => {
    if (!empId) return [];
    const today = new Date().toISOString().split('T')[0];
    const concreteTasks = tasks.filter(t => t.employeeId === empId);
    
    const virtualTasks: any[] = [];
    if (filterDate) {
      const dayOfWeek = new Date(filterDate).getDay().toString();
      const empRecurring = recurringTasks.filter(rt => rt.employeeId === empId && rt.daysOfWeek.includes(dayOfWeek));
      
      empRecurring.forEach(rt => {
         const exists = concreteTasks.some(ct => ct.title === rt.title && ct.date === filterDate);
         if (!exists) {
            virtualTasks.push({ ...rt, date: filterDate, status: 'active', isVirtual: true });
         }
      });
    }
    
    const allEmpTasks = [...concreteTasks, ...virtualTasks];
    allEmpTasks.forEach(t => {
       if (t.status === 'active' && t.date < today) {
          t.status = 'pending';
       }
    });

    return allEmpTasks;
  };

  const currentDashboardTasks = selectedTaskEmployee 
    ? getProcessedTasksForEmployee(selectedTaskEmployee.id, taskDateFilter)
    : (CURRENT_USER ? getProcessedTasksForEmployee(CURRENT_USER.id, taskDateFilter) : []);

  const filteredDashboardTasks = currentDashboardTasks.filter(t => {
    if (taskActiveTab === 'all') return true;
    if (taskActiveTab === 'active') return t.status === 'active' && t.date === taskDateFilter;
    if (taskActiveTab === 'completed') return t.status === 'completed' && t.date === taskDateFilter;
    return t.status === taskActiveTab;
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.includes(customerSearch) || 
      c.phone.includes(customerSearch) || 
      c.address.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const cityFilteredCustomers = useMemo(() => {
    if (!selectedCity) return [];
    const cityCustomers = getOrderedCustomers(selectedCity.id);
    return cityCustomers.filter(c => 
      c.name.includes(cityCustomerSearch) || 
      c.phone.includes(cityCustomerSearch) || 
      c.address.includes(cityCustomerSearch)
    );
  }, [customers, selectedCity, cityCustomerSearch, customerOrder]);

  const filteredNotes = useMemo(() => {
    if (!noteSearch.trim()) return notes;
    return notes.filter(n => n.content.includes(noteSearch));
  }, [notes, noteSearch]);


  // --- Components ---
  const CustomerCard = ({ customer }: { customer: any }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div 
          className="cursor-pointer flex-1"
          onClick={() => setSelectedCustomer(customer)}
        >
          <h3 className="text-lg font-bold text-gray-800">{customer.name}</h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <MapPin size={14} /> {customer.address}
          </p>
        </div>
        {USER_PERMISSIONS.deleteCustomer && (
          <button onClick={() => handleDeleteCustomer(customer.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
            <Trash2 size={18} />
          </button>
        )}
      </div>
      
      <div className="flex gap-2 border-t pt-3 mt-2">
        <a href={`tel:${customer.phone}`} className="flex-1 flex justify-center items-center gap-2 bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition">
          <Phone size={16} /> <span className="text-sm font-medium">اتصال</span>
        </a>
        <a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition">
          <MessageCircle size={16} /> <span className="text-sm font-medium">واتساب</span>
        </a>
        {customer.locationLink && (
          <a href={customer.locationLink} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-gray-50 text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition">
            <MapPin size={16} /> <span className="text-sm font-medium">الموقع</span>
          </a>
        )}
      </div>
    </div>
  );

  // --- Render logic ---

  if (!CURRENT_USER) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative z-10">
          <div className="p-10 flex flex-col items-center text-center border-b border-white/10">
            <h1 className="text-5xl font-black tracking-widest text-white mb-2 font-mono" style={{ fontFamily: "'Courier New', Courier, monospace", textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              AL-<span className="text-red-500">B</span>ASEEM<br/>
            </h1>
            <span className="text-xl text-slate-400 tracking-widest uppercase font-bold mt-1" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
              General Trading
            </span>
          </div>
          
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm font-bold text-center animate-in fade-in">{loginError}</div>}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">رقم الهاتف</label>
              <input 
                type="tel" 
                required 
                placeholder="077XXXXXXXX"
                className="w-full p-4 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-left placeholder:text-slate-600" 
                dir="ltr"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">كلمة المرور</label>
              <input 
                type="password" 
                required 
                placeholder="••••••"
                className="w-full p-4 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-left placeholder:text-slate-600" 
                dir="ltr"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition shadow-lg shadow-red-600/20">
              تسجيل الدخول
            </button>
          </form>
        </div>

        <div className="mt-12 text-center space-y-6 relative z-10">
          <div className="text-slate-500 text-sm font-mono font-bold leading-relaxed tracking-wider">
            <p className="text-slate-400 mb-1">@2025 FOR AL-BASEEM</p>
            <p>General Trading</p>
            <p className="mt-4">BY AHMED AL NAJEM</p>
            <p>Zainab HADED</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://wa.me/9647762788088" target="_blank" rel="noreferrer" className="bg-[#25D366] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-green-900/20">
              <MessageCircle size={18}/> +9647762788088
            </a>
            <a href="https://instagram.com/9.cas" target="_blank" rel="noreferrer" className="bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-pink-900/20">
              <Instagram size={18}/> 9.CAS
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!USER_PERMISSIONS.viewCustomersAndCities && !USER_PERMISSIONS.viewTasksSection && !USER_PERMISSIONS.viewSettings) {
    return <div className="p-10 text-center text-red-500 font-bold">عذراً، لا تملك أي صلاحيات الدخول للنظام.</div>;
  }

  const SIDEBAR_ITEMS = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20}/> },
    { id: 'crm', label: 'الزبائن والمدن', icon: <Users size={20}/> },
    { id: 'tasks', label: 'مهام الموظفين', icon: <Briefcase size={20}/> },
    { id: 'whatsapp', label: 'قسم الواتساب', icon: <MessageCircle size={20}/> },
    { id: 'reminders', label: 'التذكيرات', icon: <Bell size={20}/> },
    { id: 'notes', label: 'الملاحظات', icon: <StickyNote size={20}/> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings size={20}/> },
  ];

  const renderWhatsappSection = () => {
    if (!USER_PERMISSIONS.viewWhatsappSection) {
      return <div className="p-10 text-center text-red-500 font-bold">عذراً، لا تملك صلاحية الدخول لهذا القسم.</div>;
    }

    return (
      <div className="animate-in fade-in">
        <div className="flex gap-2 bg-gray-200 p-1 rounded-xl mb-6 max-w-fit overflow-x-auto">
          <button 
            className={`px-6 py-2 rounded-lg font-bold transition whitespace-nowrap ${whatsappSubSection === 'send' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600 hover:bg-gray-300'}`}
            onClick={() => setWhatsappSubSection('send')}
          >
            إرسال رسالة
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-bold transition whitespace-nowrap ${whatsappSubSection === 'connection' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600 hover:bg-gray-300'}`}
            onClick={() => setWhatsappSubSection('connection')}
          >
            الاتصال
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-bold transition whitespace-nowrap ${whatsappSubSection === 'scheduled' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600 hover:bg-gray-300'}`}
            onClick={() => setWhatsappSubSection('scheduled')}
          >
            الرسائل المجدولة
          </button>
        </div>

        {/* Connection Tab */}
        {whatsappSubSection === 'connection' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Smartphone className="text-green-500"/> ربط حساب الواتساب
              </h3>
              
              {/* Server URL Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">رابط الخادم</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="https://your-server.onrender.com"
                    value={waServerUrl}
                    onChange={(e) => setWaServerUrl(e.target.value)}
                    className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-left"
                    dir="ltr"
                  />
                  <button 
                    onClick={() => {
                      localStorage.setItem('waServerUrl', waServerUrl);
                      connectToWaServer(waServerUrl);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition flex items-center gap-2"
                  >
                    <RefreshCw size={18}/> اتصال
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              <div className={`p-4 rounded-xl mb-6 ${
                waStatus === 'connected' ? 'bg-green-50 border border-green-200' :
                waStatus === 'connecting' ? 'bg-blue-50 border border-blue-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  {waStatus === 'connected' ? (
                    <>
                      <Wifi className="text-green-500" size={24}/>
                      <div>
                        <p className="font-bold text-green-700">متصل بالواتساب ✓</p>
                        <p className="text-sm text-green-600">يمكنك الآن إرسال الرسائل</p>
                      </div>
                    </>
                  ) : waStatus === 'connecting' ? (
                    <>
                      <div className="animate-spin"><RefreshCw className="text-blue-500" size={24}/></div>
                      <div>
                        <p className="font-bold text-blue-700">جاري الاتصال...</p>
                        <p className="text-sm text-blue-600">انتظر ظهور QR Code</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <WifiOff className="text-red-500" size={24}/>
                      <div>
                        <p className="font-bold text-red-700">غير متصل</p>
                        <p className="text-sm text-red-600">أدخل رابط الخادم واضغط اتصال</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* QR Code Display */}
              {waStatus === 'connecting' && waQrCode && (
                <div className="text-center mb-6">
                  <p className="text-gray-600 mb-4">امسح هذا الكود بواسطة تطبيق الواتساب على هاتفك:</p>
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border">
                    <img src={waQrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                  </div>
                  <ol className="text-sm text-gray-500 mt-4 text-right max-w-xs mx-auto space-y-1">
                    <li>1. افتح تطبيق الواتساب</li>
                    <li>2. اذهب للإعدادات &gt; الأجهزة المرتبطة</li>
                    <li>3. اضغط "ربط جهاز"</li>
                    <li>4. امسح الكود أعلاه</li>
                  </ol>
                </div>
              )}

              {/* Disconnect Button */}
              {waStatus === 'connected' && (
                <button 
                  onClick={handleDisconnectWhatsapp}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <LogOut size={20}/> إلغاء ربط الحساب
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4">📌 تعليمات الإعداد</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-bold mb-2">الخطوة 1: نشر الخادم</h4>
                  <p className="text-sm text-gray-600 mb-2">انشر خادم الواتساب على Render.com مجاناً من:</p>
                  <a href="https://github.com/ahmedalnajem08-design/albaseem-whatsapp" target="_blank" rel="noreferrer" className="text-blue-500 text-sm underline">GitHub Repository</a>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-bold mb-2">الخطوة 2: الحصول على الرابط</h4>
                  <p className="text-sm text-gray-600 mb-2">بعد النشر على Render، ستحصل على رابط مثل:</p>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">https://albaseem-whatsapp.onrender.com</code>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-bold mb-2">الخطوة 3: ربط الحساب</h4>
                  <p className="text-sm text-gray-600">أدخل الرابط أعلاه واضغط "اتصال" ثم امسح QR Code</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {whatsappSubSection === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {waStatus !== 'connected' && (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200 flex items-center gap-3 font-bold shadow-sm">
                  <AlertTriangle size={24} className="text-yellow-600"/>
                  تنبيه: الواتساب غير متصل. يرجى ربط الحساب من قسم الإعدادات لتتمكن من الإرسال الفعلي، (حالياً في وضع المحاكاة).
                </div>
              )}

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageCircle className="text-green-500"/> محتوى الرسالة</h3>
                
                <textarea 
                  value={waMessageText}
                  onChange={(e) => setWaMessageText(e.target.value)}
                  placeholder="اكتب رسالتك هنا..." 
                  rows={5} 
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none mb-4 bg-gray-50"
                ></textarea>

                <div className="flex items-center gap-4 mb-6">
                  <label className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl cursor-pointer transition flex-1 border border-dashed border-gray-300">
                    <ImageIcon size={20} className="text-green-600"/>
                    <span className="font-bold">{waMessageImage ? 'تم إرفاق صورة' : 'إرفاق صورة (اختياري)'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setWaMessageImage(e.target.files?.[0] || null)} />
                  </label>
                  {waMessageImage && (
                    <button onClick={() => setWaMessageImage(null)} className="text-red-500 hover:bg-red-50 p-3 rounded-xl transition"><Trash2 size={20}/></button>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button onClick={() => executeSendWhatsapp(false)} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition shadow-sm flex items-center justify-center gap-2">
                    <Send size={20}/> إرسال الآن
                  </button>
                  <button onClick={() => {
                    // إرسال مباشر عبر فتح WhatsApp Web
                    if (!waMessageText) {
                      alert('الرجاء كتابة رسالة');
                      return;
                    }
                    
                    let targets: any[] = [];
                    if (waTargetType === 'all') {
                      targets = customers;
                    } else if (waTargetType === 'city' && waSelectedCity) {
                      targets = customers.filter(c => c.cityIds.includes(waSelectedCity));
                    } else if (waTargetType === 'specific_customers') {
                      targets = customers.filter(c => waSpecificCustomers.includes(c.id));
                    }
                    
                    if (targets.length === 0) {
                      alert('لا يوجد مستلمين');
                      return;
                    }
                    
                    // فتح WhatsApp للأول
                    const first = targets[0];
                    let phone = first.phone.replace(/\D/g, '');
                    if (phone.startsWith('0')) phone = '964' + phone.substring(1);
                    
                    const url = `https://wa.me/${phone}?text=${encodeURIComponent(waMessageText)}`;
                    window.open(url, '_blank');
                    
                    alert(`سيتم فتح WhatsApp للمرسل الأول: ${first.name}\nلإرسال للباقي، استخدم زر "إرسال الآن" بعد قليل`);
                  }} className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition shadow-sm flex items-center justify-center gap-2">
                    <MessageCircle size={20}/> فتح واتساب
                  </button>
                </div>
              </div>

              {sendLogs.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><List className="text-gray-500"/> سجل الإرسال الأخير</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {sendLogs.map(log => (
                      <div key={log.id} className={`p-3 rounded-lg border flex items-center justify-between ${log.status === 'success' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="font-bold text-gray-800 flex flex-col">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-500"/> {log.targetName}
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{log.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.status === 'success' ? (
                            <span className="text-green-600 flex items-center gap-1 text-sm font-bold"><CheckCircle size={16}/> تم الإرسال</span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1 text-sm font-bold"><XCircle size={16}/> فشل ({log.error})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-max">
               <h3 className="text-lg font-bold mb-4">إرسال إلى:</h3>
               <div className="space-y-3 mb-6">
                 {[
                   { id: 'all', label: 'جميع الزبائن' },
                   { id: 'city', label: 'حسب المدينة' },
                   { id: 'specific_customers', label: 'زبائن محددين' },
                   { id: 'employees', label: 'موظفين محددين' },
                 ].map(opt => (
                   <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
                     <input 
                       type="radio" 
                       name="targetType" 
                       value={opt.id} 
                       checked={waTargetType === opt.id} 
                       onChange={() => setWaTargetType(opt.id)}
                       className="w-4 h-4 text-green-600"
                     />
                     <span className="font-medium">{opt.label}</span>
                   </label>
                 ))}
               </div>

               {waTargetType === 'city' && (
                 <select 
                   value={waSelectedCity} 
                   onChange={(e) => setWaSelectedCity(e.target.value)}
                   className="w-full p-3 border rounded-xl mb-4"
                 >
                   <option value="">اختر المدينة</option>
                   {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               )}

               {waTargetType === 'specific_customers' && (
                 <div className="mb-4">
                   <input 
                     type="text"
                     placeholder="بحث عن زبون..."
                     value={waCustomerSearch}
                     onChange={(e) => setWaCustomerSearch(e.target.value)}
                     className="w-full p-2 border rounded-lg mb-2 text-sm"
                   />
                   <div className="max-h-40 overflow-y-auto border rounded-lg">
                     {customers
                       .filter(c => c.name.includes(waCustomerSearch) || c.phone.includes(waCustomerSearch))
                       .map(c => (
                         <label key={c.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                           <input 
                             type="checkbox" 
                             checked={waSpecificCustomers.includes(c.id)}
                             onChange={(e) => {
                               if (e.target.checked) {
                                 setWaSpecificCustomers([...waSpecificCustomers, c.id]);
                               } else {
                                 setWaSpecificCustomers(waSpecificCustomers.filter(id => id !== c.id));
                               }
                             }}
                           />
                           <span className="text-sm">{c.name}</span>
                         </label>
                       ))}
                   </div>
                 </div>
               )}

               {waTargetType === 'employees' && (
                 <div className="max-h-40 overflow-y-auto border rounded-lg mb-4">
                   {EMPLOYEES.map(e => (
                     <label key={e.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                       <input 
                         type="checkbox" 
                         checked={waSpecificEmployees.includes(e.id)}
                         onChange={(ev) => {
                           if (ev.target.checked) {
                             setWaSpecificEmployees([...waSpecificEmployees, e.id]);
                           } else {
                             setWaSpecificEmployees(waSpecificEmployees.filter(id => id !== e.id));
                           }
                         }}
                       />
                       <span className="text-sm">{e.name}</span>
                     </label>
                   ))}
                 </div>
               )}
             </div>
          </div>
        )}

        {whatsappSubSection === 'scheduled' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">الرسائل المجدولة</h3>
            {scheduledMessages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد رسائل مجدولة</p>
            ) : (
              <div className="space-y-3">
                {scheduledMessages.map(msg => (
                  <div key={msg.id} className="border rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{msg.text.substring(0, 50)}...</p>
                      <p className="text-sm text-gray-500">{msg.targetLabel} • {new Date(msg.scheduleDate).toLocaleString('ar')}</p>
                    </div>
                    <button onClick={() => handleCancelScheduledMsg(msg.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-40">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-red-600">AL-BASEEM</h1>
        <button onClick={() => { setCurrentUser(null); }} className="p-2 hover:bg-gray-100 rounded-lg text-red-500">
          <LogOut size={20} />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 right-0 z-50 w-64 bg-white border-l shadow-lg lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b hidden lg:block">
            <h1 className="text-2xl font-black text-red-600">AL-BASEEM</h1>
            <p className="text-sm text-gray-500 mt-1">نظام إدارة الشركة</p>
          </div>
          
          <nav className="p-4 space-y-1">
            {SIDEBAR_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { setAppSection(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  appSection === item.id 
                    ? 'bg-red-50 text-red-600 font-bold' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t hidden lg:block">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-red-600"/>
              </div>
              <div>
                <p className="font-bold text-sm">{CURRENT_USER?.name}</p>
                <p className="text-xs text-gray-500">{CURRENT_USER?.role === 'manager' ? 'مدير' : 'موظف'}</p>
              </div>
            </div>
            <button 
              onClick={() => { setCurrentUser(null); }}
              className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2 rounded-lg transition"
            >
              <LogOut size={18}/> تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-screen">
          {/* Dashboard */}
          {appSection === 'dashboard' && (
            <div className="animate-in fade-in">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">مرحباً، {CURRENT_USER?.name} 👋</h2>
                <p className="text-gray-500">إليك نظرة عامة على نظام إدارة البسيم</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="text-blue-500" size={24}/>
                    <span className="text-gray-500 text-sm">الزبائن</span>
                  </div>
                  <p className="text-3xl font-bold">{customers.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="text-green-500" size={24}/>
                    <span className="text-gray-500 text-sm">المدن</span>
                  </div>
                  <p className="text-3xl font-bold">{cities.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="text-orange-500" size={24}/>
                    <span className="text-gray-500 text-sm">المهام</span>
                  </div>
                  <p className="text-3xl font-bold">{tasks.filter(t => t.status === 'active').length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className="text-purple-500" size={24}/>
                    <span className="text-gray-500 text-sm">التذكيرات</span>
                  </div>
                  <p className="text-3xl font-bold">{reminders.length}</p>
                </div>
              </div>

              {/* Today's Tasks */}
              <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">مهام اليوم</h3>
                  <span className="text-sm text-gray-500">{new Date().toLocaleDateString('ar')}</span>
                </div>
                <div className="space-y-3">
                  {filteredDashboardTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'active' ? 'bg-green-500' :
                        task.status === 'completed' ? 'bg-blue-500' :
                        task.status === 'delayed' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500">{task.details}</p>
                      </div>
                      <span className="text-sm text-gray-400">{task.startTime || 'طوال اليوم'}</span>
                    </div>
                  ))}
                  {filteredDashboardTasks.length === 0 && (
                    <p className="text-center text-gray-400 py-4">لا توجد مهام لليوم</p>
                  )}
                </div>
              </div>

              {/* Admin Note */}
              {USER_PERMISSIONS.editAdminNote && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-yellow-600"/> ملاحظة المدير
                  </h3>
                  <textarea 
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full bg-transparent border-none outline-none resize-none text-yellow-800"
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}

          {/* CRM Section */}
          {appSection === 'crm' && USER_PERMISSIONS.viewCustomersAndCities && (
            <div className="animate-in fade-in">
              {/* Tabs */}
              <div className="flex gap-2 bg-gray-200 p-1 rounded-xl mb-6 max-w-fit">
                <button 
                  className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'customers' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setActiveTab('customers')}
                >
                  الزبائن
                </button>
                <button 
                  className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'cities' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setActiveTab('cities')}
                >
                  المدن
                </button>
              </div>

              {/* Customers Tab */}
              {activeTab === 'customers' && (
                <div>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                      <input 
                        type="text"
                        placeholder="بحث عن زبون..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full pr-10 p-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    {USER_PERMISSIONS.addCustomer && (
                      <button 
                        onClick={() => setIsAddCustomerOpen(true)}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition"
                      >
                        <Plus size={20}/> إضافة زبون
                      </button>
                    )}
                  </div>

                  {/* Customer Detail View */}
                  {selectedCustomer ? (
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                      <button 
                        onClick={() => setSelectedCustomer(null)}
                        className="mb-4 text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        <ChevronRight size={20}/> العودة للقائمة
                      </button>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <h2 className="text-2xl font-bold mb-2">{selectedCustomer.name}</h2>
                          <div className="space-y-2 text-gray-600 mb-6">
                            <p className="flex items-center gap-2"><Phone size={16}/> {selectedCustomer.phone}</p>
                            <p className="flex items-center gap-2"><MapPin size={16}/> {selectedCustomer.address}</p>
                            {selectedCustomer.locationLink && (
                              <a href={selectedCustomer.locationLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                                <MapPin size={16}/> عرض الموقع على الخريطة
                              </a>
                            )}
                          </div>

                          {/* Reports Section */}
                          <div className="border-t pt-6">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-bold">التقارير</h3>
                              {USER_PERMISSIONS.addReport && (
                                <button 
                                  onClick={() => setIsAddReportOpen(true)}
                                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold"
                                >
                                  <Plus size={18}/> إضافة تقرير
                                </button>
                              )}
                            </div>

                            <div className="relative mb-4">
                              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                              <input 
                                type="text"
                                placeholder="بحث في التقارير..."
                                value={reportSearch}
                                onChange={(e) => setReportSearch(e.target.value)}
                                className="w-full pr-10 p-2 border rounded-lg text-sm"
                              />
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {selectedCustomer.reports
                                .filter(r => r.title.includes(reportSearch) || r.content.includes(reportSearch))
                                .map(report => (
                                  <div key={report.id} className="bg-gray-50 p-4 rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-bold">{report.title}</h4>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">{report.date}</span>
                                        {USER_PERMISSIONS.deleteReport && (
                                          <button onClick={() => handleDeleteReport(report.id)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                                            <Trash2 size={14}/>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{report.content}</p>
                                    <p className="text-xs text-gray-400 mt-2">بواسطة: {report.author}</p>
                                  </div>
                                ))}
                              {selectedCustomer.reports.length === 0 && (
                                <p className="text-center text-gray-400 py-8">لا توجد تقارير</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-bold mb-3">المدن المرتبطة</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCustomer.cityIds.map((cityId: string) => {
                              const city = cities.find(c => c.id === cityId);
                              return city ? (
                                <span key={cityId} className="bg-white px-3 py-1 rounded-full text-sm border">
                                  {city.name}
                                </span>
                              ) : null;
                            })}
                          </div>

                          <div className="mt-6 flex gap-2">
                            <a href={`tel:${selectedCustomer.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition">
                              <Phone size={18}/> اتصال
                            </a>
                            <a href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition">
                              <MessageCircle size={18}/> واتساب
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCustomers.map(customer => (
                        <CustomerCard key={customer.id} customer={customer} />
                      ))}
                      {filteredCustomers.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                          لا يوجد زبائن
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Cities Tab */}
              {activeTab === 'cities' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">المدن</h3>
                    {USER_PERMISSIONS.addCity && (
                      <button 
                        onClick={() => setIsAddCityOpen(true)}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition"
                      >
                        <Plus size={20}/> إضافة مدينة
                      </button>
                    )}
                  </div>

                  {/* City Customers Full Page View */}
                  {cityViewMode && selectedCity && (
                    <div className="animate-in fade-in">
                      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => { setCityViewMode(false); setSelectedCity(null); setCityCustomerSearch(''); }}
                            className="text-gray-400 hover:text-gray-600 p-2"
                          >
                            <ChevronRight size={24} className="rotate-180"/>
                          </button>
                          <h2 className="text-2xl font-bold">زبائن {selectedCity.name}</h2>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            {cityFilteredCustomers.length} زبون
                          </span>
                          <button 
                            onClick={() => {
                              if (window.confirm('هل تريد إعادة تعيين ترتيب الزبائن إلى الوضع الافتراضي؟')) {
                                saveCustomerOrder(selectedCity.id, []);
                              }
                            }}
                            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <RefreshCw size={14}/> إعادة تعيين الترتيب
                          </button>
                        </div>
                      </div>

                      {/* Search */}
                      <div className="relative mb-6 max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input 
                          type="text"
                          placeholder="بحث في الزبائن..."
                          value={cityCustomerSearch}
                          onChange={(e) => setCityCustomerSearch(e.target.value)}
                          className="w-full pr-10 p-3 border rounded-xl"
                        />
                      </div>

                      {/* Drag instruction */}
                      <p className="text-sm text-gray-500 mb-4">
                        💡 اسحب وأفلت بطاقات الزبائن لإعادة ترتيبها (الترتيب خاص بك)
                      </p>

                      {/* Customers List with Drag and Drop */}
                      <div className="space-y-3">
                        {cityFilteredCustomers.map((customer, index) => (
                          <div 
                            key={customer.id}
                            draggable
                            onDragStart={() => handleDragStart(customer.id)}
                            onDragOver={(e) => handleDragOver(e, customer.id)}
                            onDrop={() => handleDrop(customer.id)}
                            className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition cursor-move ${
                              draggedCustomer === customer.id ? 'opacity-50 border-red-300' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                                <GripVertical size={20}/>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold">{customer.name}</h4>
                                <p className="text-sm text-gray-500">{customer.phone}</p>
                                <p className="text-xs text-gray-400">{customer.address}</p>
                              </div>
                              <div className="flex gap-2">
                                <a 
                                  href={`tel:${customer.phone}`} 
                                  className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100"
                                >
                                  <Phone size={18}/>
                                </a>
                                <a 
                                  href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} 
                                  target="_blank"
                                  className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100"
                                >
                                  <MessageCircle size={18}/>
                                </a>
                                <button
                                  onClick={() => {
                                    setCityViewMode(false);
                                    setSelectedCity(null);
                                    setSelectedCustomer(customer);
                                  }}
                                  className="bg-gray-50 text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                                >
                                  <ChevronRight size={18}/>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {cityFilteredCustomers.length === 0 && (
                          <p className="text-center py-8 text-gray-400">لا يوجد زبائن في هذه المدينة</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cities Grid */}
                  {!cityViewMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cities.map(city => (
                        <div 
                          key={city.id} 
                          className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition cursor-pointer"
                          onClick={() => {
                            setSelectedCity(city);
                            setCityViewMode(true);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-bold">{city.name}</h4>
                              <p className="text-sm text-gray-500">
                                {customers.filter(c => c.cityIds.includes(city.id)).length} زبون
                              </p>
                            </div>
                            {USER_PERMISSIONS.deleteCity && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteCityRequest(city.id); }}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                              >
                                <Trash2 size={18}/>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tasks Section */}
          {appSection === 'tasks' && USER_PERMISSIONS.viewTasksSection && (
            <div className="animate-in fade-in">
              <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">مهام الموظفين</h2>
                {USER_PERMISSIONS.addTask && (
                  <button 
                    onClick={() => setIsAddTaskOpen(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition"
                  >
                    <Plus size={20}/> إضافة مهمة
                  </button>
                )}
              </div>

              {/* Task Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                  { id: 'active', label: 'النشطة' },
                  { id: 'pending', label: 'المعلقة' },
                  { id: 'completed', label: 'المكتملة' },
                  { id: 'delayed', label: 'المؤجلة' },
                  { id: 'canceled', label: 'الملغاة' },
                  { id: 'all', label: 'الكل' },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setTaskActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
                      taskActiveTab === tab.id ? 'bg-red-600 text-white' : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-4 mb-6">
                <label className="font-medium">التاريخ:</label>
                <input 
                  type="date" 
                  value={taskDateFilter}
                  onChange={(e) => setTaskDateFilter(e.target.value)}
                  className="border rounded-lg p-2"
                />
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {filteredDashboardTasks.map(task => (
                  <div key={task.id} className={`bg-white p-4 rounded-xl border shadow-sm ${task.isVirtual ? 'border-dashed border-blue-300' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">{task.title}</h4>
                          {task.isVirtual && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">متكررة</span>}
                        </div>
                        <p className="text-sm text-gray-500">{task.details}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Calendar size={12}/> {task.date}</span>
                          {!task.isFullDay && task.startTime && (
                            <span className="flex items-center gap-1"><Clock size={12}/> {task.startTime} - {task.endTime}</span>
                          )}
                          <span className={`px-2 py-0.5 rounded ${
                            task.status === 'active' ? 'bg-green-100 text-green-600' :
                            task.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            task.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                            task.status === 'delayed' ? 'bg-orange-100 text-orange-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {task.status === 'active' ? 'نشطة' :
                             task.status === 'pending' ? 'معلقة' :
                             task.status === 'completed' ? 'مكتملة' :
                             task.status === 'delayed' ? 'مؤجلة' : 'ملغاة'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {task.status === 'active' && (
                          <>
                            {USER_PERMISSIONS.addTask && (
                              <button 
                                onClick={() => setTaskActionModal({ type: 'complete', task })}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="إكمال"
                              >
                                <CheckCircle size={18}/>
                              </button>
                            )}
                            {USER_PERMISSIONS.delayTask && (
                              <button 
                                onClick={() => setTaskActionModal({ type: 'delay', task })}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                title="تأجيل"
                              >
                                <Clock size={18}/>
                              </button>
                            )}
                          </>
                        )}
                        {task.status === 'delayed' && (
                          <button 
                            onClick={() => setTaskActionModal({ type: 'reschedule', task })}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="إعادة جدولة"
                          >
                            <RefreshCw size={18}/>
                          </button>
                        )}
                        {(task.status === 'active' || task.status === 'pending') && USER_PERMISSIONS.cancelTask && (
                          <button 
                            onClick={() => setTaskActionModal({ type: 'cancel', task })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="إلغاء"
                          >
                            <XCircle size={18}/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredDashboardTasks.length === 0 && (
                  <div className="text-center py-12 text-gray-400">لا توجد مهام</div>
                )}
              </div>
            </div>
          )}

          {/* WhatsApp Section */}
          {appSection === 'whatsapp' && renderWhatsappSection()}

          {/* Reminders Section */}
          {appSection === 'reminders' && USER_PERMISSIONS.viewRemindersSection && (
            <div className="animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">التذكيرات</h2>
                {USER_PERMISSIONS.addReminder && (
                  <button 
                    onClick={() => setIsAddReminderOpen(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition"
                  >
                    <Plus size={20}/> إضافة تذكير
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reminders.map(reminder => (
                  <div key={reminder.id} className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold">{reminder.title}</h4>
                      {USER_PERMISSIONS.deleteReminder && (
                        <button 
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{reminder.details}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={12}/> {reminder.date}
                      {!reminder.isFullDay && reminder.startTime && (
                        <span>• {reminder.startTime} - {reminder.endTime}</span>
                      )}
                    </div>
                    <button 
                      onClick={() => setReminderCompletionModal({ reminder })}
                      className="mt-3 w-full py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition text-sm"
                    >
                      إكمال التذكير
                    </button>
                  </div>
                ))}
                {reminders.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400">لا توجد تذكيرات</div>
                )}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {appSection === 'notes' && USER_PERMISSIONS.viewNotesSection && (
            <div className="animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">الملاحظات</h2>
                {USER_PERMISSIONS.addNote && (
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input 
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="اكتب ملاحظة جديدة..."
                      className="border rounded-xl p-3 w-64"
                    />
                    <button type="submit" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition">
                      <Plus size={20}/>
                    </button>
                  </form>
                )}
              </div>

              <div className="relative mb-6">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                <input 
                  type="text"
                  placeholder="بحث في الملاحظات..."
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="w-full pr-10 p-3 border rounded-xl"
                />
              </div>

              <div className="space-y-3">
                {filteredNotes.map(note => (
                  <div key={note.id} className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-800">{note.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>{note.author}</span>
                          <span>{note.date}</span>
                        </div>
                      </div>
                      {USER_PERMISSIONS.deleteNote && (
                        <button 
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded"
                        >
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredNotes.length === 0 && (
                  <div className="text-center py-12 text-gray-400">لا توجد ملاحظات</div>
                )}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {appSection === 'settings' && USER_PERMISSIONS.viewSettings && (
            <div className="animate-in fade-in">
              <h2 className="text-2xl font-bold mb-6">الإعدادات</h2>

              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setSettingsTab('users')}
                  className={`px-6 py-2 rounded-lg font-bold transition ${settingsTab === 'users' ? 'bg-red-600 text-white' : 'bg-white border'}`}
                >
                  المستخدمين
                </button>
                <button 
                  onClick={() => setSettingsTab('backup')}
                  className={`px-6 py-2 rounded-lg font-bold transition ${settingsTab === 'backup' ? 'bg-red-600 text-white' : 'bg-white border'}`}
                >
                  النسخ الاحتياطي
                </button>
                <button 
                  onClick={() => setSettingsTab('import')}
                  className={`px-6 py-2 rounded-lg font-bold transition ${settingsTab === 'import' ? 'bg-red-600 text-white' : 'bg-white border'}`}
                >
                  استيراد البيانات
                </button>
                <button 
                  onClick={() => setSettingsTab('whatsapp')}
                  className={`px-6 py-2 rounded-lg font-bold transition ${settingsTab === 'whatsapp' ? 'bg-red-600 text-white' : 'bg-white border'}`}
                >
                  واتساب
                </button>
              </div>

              {/* Users Tab */}
              {settingsTab === 'users' && (
                <div className="bg-white rounded-2xl border p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">المستخدمين</h3>
                    {USER_PERMISSIONS.addUser && (
                      <button 
                        onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
                      >
                        <Plus size={18}/> إضافة مستخدم
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-right font-medium text-gray-500">الاسم</th>
                          <th className="p-3 text-right font-medium text-gray-500">الهاتف</th>
                          <th className="p-3 text-right font-medium text-gray-500">الدور</th>
                          <th className="p-3 text-right font-medium text-gray-500">الصلاحيات</th>
                          <th className="p-3 text-right font-medium text-gray-500">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {EMPLOYEES.map(emp => (
                          <tr key={emp.id} className="border-t">
                            <td className="p-3 font-medium">{emp.name}</td>
                            <td className="p-3 text-gray-500" dir="ltr">{emp.phone}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-sm ${emp.role === 'manager' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {emp.role === 'manager' ? 'مدير' : 'موظف'}
                              </span>
                            </td>
                            <td className="p-3 text-gray-500">{emp.permissions.length} صلاحية</td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                {USER_PERMISSIONS.editUser && (
                                  <button 
                                    onClick={() => { setEditingUser(emp); setIsUserModalOpen(true); }}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                                  >
                                    <Edit size={16}/>
                                  </button>
                                )}
                                {USER_PERMISSIONS.deleteUser && emp.id !== CURRENT_USER?.id && (
                                  <button 
                                    onClick={() => handleDeleteUser(emp.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 size={16}/>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Backup Tab */}
              {settingsTab === 'backup' && (
                <div className="bg-white rounded-2xl border p-6">
                  <h3 className="text-lg font-bold mb-4">النسخ الاحتياطي</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <p className="text-sm text-gray-500">آخر نسخة احتياطية:</p>
                    <p className="font-bold">{lastBackup.time} بواسطة {lastBackup.user}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {USER_PERMISSIONS.makeBackup && (
                      <button 
                        onClick={handleMakeBackup}
                        className="flex items-center justify-center gap-3 bg-green-50 text-green-600 p-6 rounded-xl border border-green-200 hover:bg-green-100 transition"
                      >
                        <Download size={24}/>
                        <div className="text-right">
                          <p className="font-bold">تنزيل نسخة احتياطية</p>
                          <p className="text-sm text-green-500">حفظ جميع البيانات</p>
                        </div>
                      </button>
                    )}
                    {USER_PERMISSIONS.restoreBackup && (
                      <label className="flex items-center justify-center gap-3 bg-blue-50 text-blue-600 p-6 rounded-xl border border-blue-200 hover:bg-blue-100 transition cursor-pointer">
                        <Upload size={24}/>
                        <div className="text-right">
                          <p className="font-bold">استعادة نسخة احتياطية</p>
                          <p className="text-sm text-blue-500">رفع ملف النسخة</p>
                        </div>
                        <input type="file" accept=".json" className="hidden" onChange={handleRestoreBackup} />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Import Tab */}
              {settingsTab === 'import' && (
                <div className="bg-white rounded-2xl border p-6">
                  <h3 className="text-lg font-bold mb-4">استيراد الزبائن من ملف</h3>
                  
                  <form onSubmit={handleImportCustomers} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">اختر المدينة:</label>
                      <select 
                        value={importCityId}
                        onChange={(e) => setImportCityId(e.target.value)}
                        className="w-full border rounded-xl p-3"
                      >
                        <option value="">-- اختر المدينة --</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">ملف Excel أو CSV:</label>
                      <p className="text-xs text-gray-500 mb-2">الأعمدة المطلوبة: الاسم، الرقم، العنوان (اختياري)، الموقع (اختياري)</p>
                      <input 
                        type="file" 
                        id="importFile"
                        accept=".xlsx,.xls,.csv"
                        className="w-full border rounded-xl p-3"
                      />
                    </div>
                    <button type="submit" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition">
                      استيراد
                    </button>
                  </form>
                </div>
              )}

              {/* WhatsApp Tab */}
              {settingsTab === 'whatsapp' && (
                <div className="bg-white rounded-2xl border p-6">
                  <h3 className="text-lg font-bold mb-4">إعدادات واتساب</h3>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      waStatus === 'connected' ? 'bg-green-100 text-green-600' :
                      waStatus === 'connecting' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {waStatus === 'connected' ? <Wifi size={18}/> : <WifiOff size={18}/>}
                      {waStatus === 'connected' ? 'متصل' : waStatus === 'connecting' ? 'جاري الاتصال...' : 'غير متصل'}
                    </div>
                    {waPhone && <span className="text-gray-500">{waPhone}</span>}
                  </div>

                  {waStatus === 'connecting' && waQrCode && (
                    <div className="bg-gray-50 p-6 rounded-xl mb-6 text-center">
                      <p className="text-sm text-gray-500 mb-2">امسح رمز QR بواسطة واتساب</p>
                      <div className="bg-white p-4 rounded-xl inline-block border mb-2">
                        <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                          QR Code
                          <br/>
                          (وضع المحاكاة)
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">يتجدد خلال {waQrTimer} ثانية</p>
                      <button 
                        onClick={handleSimulateScan}
                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition"
                      >
                        محاكاة المسح (للاختبار)
                      </button>
                    </div>
                  )}

                  <div className="flex gap-4">
                    {waStatus === 'disconnected' && USER_PERMISSIONS.connectWhatsapp && (
                      <button 
                        onClick={handleConnectWhatsapp}
                        disabled={waLoading}
                        className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition disabled:opacity-50"
                      >
                        {waLoading ? <RefreshCw size={20} className="animate-spin"/> : <QrCode size={20}/>}
                        ربط واتساب
                      </button>
                    )}
                    {waStatus === 'connected' && USER_PERMISSIONS.disconnectWhatsapp && (
                      <button 
                        onClick={handleDisconnectWhatsapp}
                        className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition"
                      >
                        <XCircle size={20}/> إلغاء الربط
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">إضافة زبون جديد</h3>
              <button onClick={() => setIsAddCustomerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24}/>
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم *</label>
                <input name="name" required className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف *</label>
                <input name="phone" required className="w-full border rounded-xl p-3" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">العنوان *</label>
                <input name="address" required className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رابط الموقع</label>
                <input name="locationLink" type="url" className="w-full border rounded-xl p-3" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المدن *</label>
                <div className="grid grid-cols-2 gap-2 border rounded-xl p-3 max-h-40 overflow-y-auto">
                  {cities.map(city => (
                    <label key={city.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="cityIds" value={city.id} className="rounded" />
                      <span>{city.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                إضافة الزبون
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add City Modal */}
      {isAddCityOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">إضافة مدينة جديدة</h3>
              <button onClick={() => setIsAddCityOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24}/>
              </button>
            </div>
            <form onSubmit={handleAddCity} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المدينة *</label>
                <input name="name" required className="w-full border rounded-xl p-3" />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                إضافة المدينة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Report Modal */}
      {isAddReportOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">إضافة تقرير جديد</h3>
              <button onClick={() => setIsAddReportOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24}/>
              </button>
            </div>
            <form onSubmit={handleAddReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">عنوان التقرير *</label>
                <input name="title" required className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">محتوى التقرير *</label>
                <textarea name="content" required rows={4} className="w-full border rounded-xl p-3 resize-none" />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                إضافة التقرير
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">إضافة مهمة جديدة</h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24}/>
              </button>
            </div>
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">عنوان المهمة *</label>
                <input name="title" required className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التفاصيل</label>
                <textarea name="details" rows={2} className="w-full border rounded-xl p-3 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الموظف</label>
                <select name="employeeId" className="w-full border rounded-xl p-3">
                  <option value="">أنا</option>
                  {EMPLOYEES.filter(e => e.id !== CURRENT_USER?.id).map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isRecurring" className="rounded" />
                  <span className="text-sm font-medium">مهمة متكررة</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التاريخ</label>
                <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isFullDay" defaultChecked className="rounded" />
                  <span className="text-sm font-medium">طوال اليوم</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">وقت البداية</label>
                  <input name="startTime" type="time" className="w-full border rounded-xl p-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">وقت النهاية</label>
                  <input name="endTime" type="time" className="w-full border rounded-xl p-3" />
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                إضافة المهمة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Task Action Modal */}
      {taskActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {taskActionModal.type === 'complete' ? 'إكمال المهمة' :
                 taskActionModal.type === 'delay' ? 'تأجيل المهمة' :
                 taskActionModal.type === 'cancel' ? 'إلغاء المهمة' : 'إعادة جدولة'}
              </h3>
              <button onClick={() => setTaskActionModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24}/>
              </button>
            </div>
            <form onSubmit={handleTaskAction} className="p-6 space-y-4">
              {taskActionModal.type === 'complete' && (
                <div>
                  <label className="block text-sm font-medium mb-1">تفاصيل الإكمال</label>
                  <textarea name="completionDetails" rows={3} className="w-full border rounded-xl p-3 resize-none" />
                </div>
              )}
              {taskActionModal.type === 'delay' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">سبب التأجيل</label>
                    <input name="delayReason" className="w-full border rounded-xl p-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">التاريخ الجديد *</label>
                    <input name="newDate" type="date" required className="w-full border rounded-xl p-3" />
                  </div>
                </>
              )}
              {taskActionModal.type === 'cancel' && (
                <div>
                  <label className="block text-sm font-medium mb-1">سبب الإلغاء</label>
                  <input name="cancelReason" className="w-full border rounded-xl p-3" />
                </div>
              )}
              {taskActionModal.type === 'reschedule' && (
                <div>
                  <label className="block text-sm font-medium mb-1">التاريخ الجديد *</label>
                  <input name="newDate" type="date" required className="w-full border rounded-xl p-3" />
                </div>
              )}
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                تأكيد
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {isAddReminderOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">إضافة تذكير جديد</h3>
              <button onClick={() => setIsAddReminderOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24}/>
              </button>
            </div>
            <form onSubmit={handleAddReminder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العنوان *</label>
                <input name="title" required className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التفاصيل</label>
                <textarea name="details" rows={2} className="w-full border rounded-xl p-3 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التاريخ *</label>
                <input name="date" type="date" required className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الموظفين *</label>
                <div className="grid grid-cols-2 gap-2 border rounded-xl p-3 max-h-32 overflow-y-auto">
                  {EMPLOYEES.map(emp => (
                    <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="employeeIds" value={emp.id} className="rounded" />
                      <span className="text-sm">{emp.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isFullDay" defaultChecked className="rounded" />
                  <span className="text-sm font-medium">طوال اليوم</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">وقت البداية</label>
                  <input name="startTime" type="time" className="w-full border rounded-xl p-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">وقت النهاية</label>
                  <input name="endTime" type="time" className="w-full border rounded-xl p-3" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نوع الإكمال</label>
                <select name="completionType" className="w-full border rounded-xl p-3">
                  <option value="single">يكفي إكمال واحد</option>
                  <option value="all">يجب إكمال جميع الموظفين</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                إضافة التذكير
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Completion Modal */}
      {reminderCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">إكمال التذكير</h3>
              <button onClick={() => setReminderCompletionModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24}/>
              </button>
            </div>
            <form onSubmit={handleCompleteReminder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">تفاصيل الإكمال</label>
                <textarea name="completionDetails" rows={3} className="w-full border rounded-xl p-3 resize-none" />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
                تأكيد الإكمال
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete City Transfer Modal */}
      {deleteCityTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">نقل الزبائن</h3>
              <button onClick={() => setDeleteCityTransfer(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24}/>
              </button>
            </div>
            <form onSubmit={handleTransferAndDeleteCity} className="p-6 space-y-4">
              <p className="text-gray-600">
                يوجد {deleteCityTransfer.affectedCustomers.length} زبون في هذه المدينة.
                اختر المدينة الجديدة لنقلهم إليها:
              </p>
              <select name="newCityId" required className="w-full border rounded-xl p-3">
                <option value="">-- اختر المدينة --</option>
                {cities.filter(c => c.id !== deleteCityTransfer.cityId).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                نقل وحذف المدينة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h3>
              <button onClick={() => { setIsUserModalOpen(false); setEditingUser(null); }} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24}/>
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم *</label>
                <input name="name" required defaultValue={(editingUser as any)?.name} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف *</label>
                <input name="phone" required defaultValue={(editingUser as any)?.phone} className="w-full border rounded-xl p-3" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">كلمة المرور *</label>
                <input name="password" required defaultValue={(editingUser as any)?.password} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الدور *</label>
                <select name="role" required defaultValue={(editingUser as any)?.role || 'employee'} className="w-full border rounded-xl p-3">
                  <option value="employee">موظف</option>
                  <option value="manager">مدير</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الصلاحيات</label>
                <div className="grid grid-cols-2 gap-2 border rounded-xl p-3 max-h-48 overflow-y-auto">
                  {PERMISSIONS_LIST.map(perm => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="permissions" 
                        value={perm.id} 
                        defaultChecked={(editingUser as any)?.permissions?.includes(perm.id)}
                        className="rounded" 
                      />
                      <span className="text-sm">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                {editingUser ? 'حفظ التغييرات' : 'إضافة المستخدم'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">جدولة الرسالة</h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24}/>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">تاريخ ووقت الإرسال *</label>
                <input type="datetime-local" id="scheduleDate" className="w-full border rounded-xl p-3" />
              </div>
              <button 
                onClick={() => {
                  const input = document.getElementById('scheduleDate') as HTMLInputElement;
                  if (input?.value) {
                    executeSendWhatsapp(true, input.value);
                  }
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                تأكيد الجدولة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
