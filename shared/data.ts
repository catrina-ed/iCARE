import type {
  User, CareRecipient, Medication, Dose, Appointment,
  CareLogEntry, Alert, ShoppingItem, CareTask
} from './types';

// Care recipient
export const GAIL: CareRecipient = {
  id: 'gail',
  name: 'Gail Hayes',
  nickname: 'Gail',
  age: 78,
  pronouns: 'she/her',
  conditions: ['High blood pressure', 'Type 2 diabetes', 'Atrial fibrillation'],
  allergies: ['Penicillin', 'Sulfa drugs'],
  bloodType: 'A+',
  primaryCareProvider: 'Dr. R. Patel, MD · Primary Care',
  specialist: 'Dr. A. Williams, MD · Cardiology',
  pharmacy: 'Neighborhood Pharmacy · (773) 555-0142',
  insurance: 'Medicare Advantage · #MA-001-555-7777',
};

// Family & care team
export const USERS: Record<string, User> = {
  trina: {
    id: 'trina',
    name: 'Trina P.',
    fullName: 'Trina Patton',
    role: 'admin',
    relationship: 'Daughter',
    initials: 'TP',
    email: 'trina@family.local',
  },
  markyaah: {
    id: 'markyaah',
    name: 'Markyaah B.',
    fullName: 'Markyaah Bell',
    role: 'co-caretaker',
    relationship: 'PA / Family',
    initials: 'MB',
  },
  destiny: {
    id: 'destiny',
    name: 'Destiny H.',
    fullName: 'Destiny Hayes-Wright',
    role: 'co-caretaker',
    relationship: 'PA / Family',
    initials: 'DH',
  },
  catina: {
    id: 'catina',
    name: 'Catina',
    fullName: 'Catina, CNA',
    role: 'professional',
    relationship: 'Caregiver',
    initials: 'CA',
  },
  darren: {
    id: 'darren',
    name: 'Darren',
    fullName: 'Darren, CNA',
    role: 'professional',
    relationship: 'Caregiver',
    initials: 'DA',
  },
};

// Medications
export const MEDICATIONS: Medication[] = [
  {
    id: 'met',
    name: 'Metformin',
    dose: '500 mg',
    form: 'tablet',
    instructions: 'Take with food',
    prescribedBy: 'Dr. Patel',
    pharmacy: 'Neighborhood Pharmacy',
    refillDue: 9,
    stock: 18,
  },
  {
    id: 'lis',
    name: 'Lisinopril',
    dose: '10 mg',
    form: 'tablet',
    instructions: 'Once daily',
    prescribedBy: 'Dr. Williams',
    pharmacy: 'Neighborhood Pharmacy',
    refillDue: 22,
    stock: 44,
  },
  {
    id: 'fur',
    name: 'Furosemide',
    dose: '40 mg',
    form: 'tablet',
    instructions: 'Morning with breakfast',
    prescribedBy: 'Dr. Williams',
    pharmacy: 'Neighborhood Pharmacy',
    refillDue: 6,
    stock: 12,
    lowStock: true,
  },
  {
    id: 'asp',
    name: 'Aspirin',
    dose: '81 mg',
    form: 'tablet',
    instructions: 'Once daily',
    prescribedBy: 'Dr. Patel',
    pharmacy: 'Neighborhood Pharmacy',
    refillDue: 30,
    stock: 60,
  },
  {
    id: 'mem',
    name: 'Memantine',
    dose: '10 mg',
    form: 'tablet',
    instructions: 'Twice daily',
    prescribedBy: 'Dr. Patel',
    pharmacy: 'Neighborhood Pharmacy',
    refillDue: 14,
    stock: 28,
  },
  {
    id: 'mv',
    name: 'Daily Vitamin',
    dose: '1 gummy',
    form: 'gummy',
    instructions: 'With food',
    prescribedBy: 'OTC',
    pharmacy: 'Neighborhood Pharmacy',
    refillDue: 40,
    stock: 80,
  },
  {
    id: 'ato',
    name: 'Atorvastatin',
    dose: '20 mg',
    form: 'tablet',
    instructions: 'Evening',
    prescribedBy: 'Dr. Williams',
    pharmacy: 'Neighborhood Pharmacy',
    refillDue: 11,
    stock: 22,
  },
];

// Today's doses (morning scenario)
export const TODAYS_DOSES_MORNING: Dose[] = [
  { id: 'd1', medicationId: 'met', time: '08:00', status: 'given', confirmedBy: 'catina', confirmedAt: '08:02' },
  { id: 'd2', medicationId: 'lis', time: '08:00', status: 'given', confirmedBy: 'catina', confirmedAt: '08:02' },
  { id: 'd3', medicationId: 'fur', time: '08:00', status: 'given', confirmedBy: 'catina', confirmedAt: '08:03' },
  { id: 'd4', medicationId: 'asp', time: '08:00', status: 'given', confirmedBy: 'catina', confirmedAt: '08:04' },
  { id: 'd5', medicationId: 'mem', time: '09:00', status: 'given', confirmedBy: 'catina', confirmedAt: '09:05' },
  { id: 'd6', medicationId: 'mv', time: '13:00', status: 'given', confirmedBy: 'catina', confirmedAt: '13:02' },
  { id: 'd7', medicationId: 'met', time: '18:00', status: 'upcoming' },
  { id: 'd8', medicationId: 'mem', time: '18:00', status: 'upcoming' },
  { id: 'd9', medicationId: 'ato', time: '21:00', status: 'upcoming' },
];

// Today's doses (evening scenario with missed dose)
export const TODAYS_DOSES_EVENING_ALERT: Dose[] = [
  { id: 'd1', medicationId: 'met', time: '08:00', status: 'given', confirmedBy: 'catina', confirmedAt: '08:02' },
  { id: 'd2', medicationId: 'lis', time: '08:00', status: 'given', confirmedBy: 'catina', confirmedAt: '08:02' },
  { id: 'd3', medicationId: 'fur', time: '08:00', status: 'given', confirmedBy: 'catina', confirmedAt: '08:03' },
  { id: 'd4', medicationId: 'asp', time: '08:00', status: 'given', confirmedBy: 'catina', confirmedAt: '08:04' },
  { id: 'd5', medicationId: 'mem', time: '09:00', status: 'given', confirmedBy: 'catina', confirmedAt: '09:05' },
  { id: 'd6', medicationId: 'mv', time: '13:00', status: 'missed', notes: '32 min past window' },
  { id: 'd7', medicationId: 'met', time: '18:00', status: 'given', confirmedBy: 'trina', confirmedAt: '18:15' },
  { id: 'd8', medicationId: 'mem', time: '18:00', status: 'due' },
  { id: 'd9', medicationId: 'ato', time: '21:00', status: 'upcoming' },
];

// Appointments this week
export const APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    title: 'Cardiology follow-up',
    provider: 'Dr. Aisha Williams',
    date: '2026-08-27',
    startTime: '10:30',
    endTime: '11:15',
    location: 'UChicago Heart Clinic',
    type: 'medical',
    assignedTo: 'trina',
    prepNotes: 'Bring BP log and sodium diary',
    color: '#E8614F',
  },
  {
    id: 'a2',
    title: 'Home health check',
    provider: 'Nurse Kemi',
    date: '2026-08-28',
    startTime: '14:00',
    endTime: '14:45',
    location: 'Home visit',
    type: 'medical',
    assignedTo: 'catina',
    prepNotes: 'Have vitals and weight records ready',
    color: '#D4A855',
  },
  {
    id: 'a3',
    title: 'Physical therapy',
    provider: 'Marisol Rivera, DPT',
    date: '2026-08-29',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Rehab @ 87th & Stony',
    type: 'therapy',
    assignedTo: 'catina',
    prepNotes: 'Comfortable shoes',
    color: '#5FA878',
  },
  {
    id: 'a4',
    title: 'Caseworker check-in',
    provider: 'Jasmine R.',
    date: '2026-08-30',
    startTime: '11:00',
    endTime: '11:45',
    location: 'Phone',
    type: 'casework',
    assignedTo: 'markyaah',
    prepNotes: 'Quarterly care plan review',
    color: '#8B6B9E',
  },
];

// Care log entries
export const CARE_LOG: CareLogEntry[] = [
  {
    id: 'c1',
    timestamp: '2026-06-05T07:15:00',
    author: 'catina',
    tag: 'general',
    text: 'Slept well, woke at 6:30. Had coffee and oatmeal with banana. Good mood, hummed along to the radio.',
    confidential: false,
  },
  {
    id: 'c2',
    timestamp: '2026-06-05T09:10:00',
    author: 'catina',
    tag: 'meds',
    text: 'Morning meds taken without fuss. Needed to split one of them with applesauce.',
    confidential: false,
  },
  {
    id: 'c3',
    timestamp: '2026-06-05T11:40:00',
    author: 'catina',
    tag: 'general',
    text: 'All good today — we played cards together for a while. No issues.',
    confidential: false,
  },
  {
    id: 'c4',
    timestamp: '2026-06-05T11:48:00',
    author: 'catina',
    tag: 'mood',
    text: 'Seemed a little disoriented this morning — asked twice about Dad. Mood lifted by lunchtime. Letting Trina know.',
    confidential: true,
  },
  {
    id: 'c5',
    timestamp: '2026-06-05T12:30:00',
    author: 'catina',
    tag: 'nutrition',
    text: 'Lunch: half a turkey sandwich, cucumber slices, ginger tea. Ate about 60%.',
    confidential: false,
  },
  {
    id: 'c6',
    timestamp: '2026-06-05T14:10:00',
    author: 'catina',
    tag: 'mobility',
    text: 'Walked to mailbox and back. About 12 minutes, no cane needed today.',
    confidential: false,
  },
];

// Alerts
export const ALERTS_MORNING_CALM: Alert[] = [];

export const ALERTS_MORNING_ALERT: Alert[] = [
  {
    id: 'al1',
    type: 'meds',
    severity: 'danger',
    title: '1:00 PM dose — missed',
    subtitle: 'No dose logged · 32 min past window',
    relatedId: 'mv',
    timestamp: '2026-06-05T13:32:00',
  },
  {
    id: 'al2',
    type: 'supplies',
    severity: 'warn',
    title: 'Furosemide running low',
    subtitle: '6 days remaining · refill at pharmacy',
    relatedId: 'fur',
    timestamp: '2026-06-05T13:30:00',
  },
];

export const ALERTS_EVENING_CALM: Alert[] = [
  {
    id: 'al3',
    type: 'meds',
    severity: 'warn',
    title: '9:00 PM dose coming up',
    subtitle: 'In 2 hours · assigned to Trina',
    relatedId: 'ato',
    timestamp: '2026-06-05T19:00:00',
  },
];

export const ALERTS_EVENING_ALERT: Alert[] = [
  {
    id: 'al4',
    type: 'meds',
    severity: 'danger',
    title: '6:00 PM dose — due 18 min ago',
    subtitle: 'Trina is on shift · tap to log',
    relatedId: 'mem',
    timestamp: '2026-06-05T18:18:00',
  },
  {
    id: 'al5',
    type: 'bills',
    severity: 'warn',
    title: 'Comfort Keepers invoice overdue',
    subtitle: '$420 · due Jun 3 · assigned Markyaah',
    timestamp: '2026-06-05T18:00:00',
  },
  {
    id: 'al6',
    type: 'handoff',
    severity: 'info',
    title: 'Catina finished handoff at 6:02 PM',
    subtitle: '3 items flagged for Trina',
    timestamp: '2026-06-05T18:02:00',
  },
];

// Shopping list
export const SHOPPING_ITEMS: ShoppingItem[] = [
  { id: 's1', name: 'Ensure nutrition shakes', category: 'groceries', status: 'needed', recurring: true, recurringInterval: 14 },
  { id: 's2', name: 'Greek yogurt', category: 'groceries', status: 'needed' },
  { id: 's3', name: 'Berries (blueberries)', category: 'groceries', status: 'assigned', assignedTo: 'trina' },
  { id: 's4', name: 'Facial tissues', category: 'household', status: 'needed' },
  { id: 's5', name: 'Gentle soap', category: 'toiletries', status: 'purchased' },
  { id: 's6', name: 'Incontinence supplies', category: 'medical', status: 'needed' },
];

// Today's care tasks
export const CARE_TASKS: CareTask[] = [
  { id: 't1', title: 'Morning wash-up and dressing', category: 'personal-care', dueTime: '08:00', assignedTo: 'catina', done: true, completedBy: 'catina', completedAt: '2026-08-27T08:15:00', recurring: true },
  { id: 't2', title: 'Blood pressure check', category: 'medical', dueTime: '09:00', assignedTo: 'catina', done: true, completedBy: 'catina', completedAt: '2026-08-27T09:05:00', recurring: true },
  { id: 't3', title: 'Short walk in the garden', category: 'personal-care', dueTime: '11:00', assignedTo: 'markyaah', done: false, recurring: true },
  { id: 't4', title: 'Change bed linens', category: 'household', dueTime: '13:00', assignedTo: 'destiny', done: false },
  { id: 't5', title: 'Pick up refill from pharmacy', category: 'errand', dueTime: '15:00', assignedTo: 'trina', done: false },
  { id: 't6', title: 'Call with Aunt Rose', category: 'social', dueTime: '17:00', assignedTo: 'trina', done: false, recurring: true },
  { id: 't7', title: 'Evening tidy of the kitchen', category: 'household', dueTime: '19:00', assignedTo: 'destiny', done: false, recurring: true },
];
