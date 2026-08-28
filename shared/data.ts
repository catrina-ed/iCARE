import type {
  User, CareRecipient, Medication, Dose, Appointment,
  CareLogEntry, Alert, ShoppingItem, CareTask
} from './types';

// Demo dates are relative to whenever the app is opened, so the sample day is
// always "today" rather than slowly ageing into a stale week.
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** YYYY-MM-DD, `offset` days from today. Local, not UTC. */
const day = (offset: number): string => {
  const d = startOfToday();
  d.setDate(d.getDate() + offset);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** ISO timestamp at HH:MM, `offset` days from today. */
const at = (offset: number, hhmm: string): string => `${day(offset)}T${hhmm}:00`;

// Care recipient
export const GAIL: CareRecipient = {
  id: 'gail',
  name: 'Gail',
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

// Family & care team.
//
// First names only. The people in this circle are real; surnames are not
// published, and initials are taken from the first name rather than from a
// surname so they carry nothing extra.
export const USERS: Record<string, User> = {
  trina: {
    id: 'trina',
    name: 'Trina',
    role: 'master-admin',
    relationship: 'Daughter',
    initials: 'TR',
    email: 'trina@family.local',
  },
  markyaah: {
    id: 'markyaah',
    name: 'Markyaah',
    role: 'pa',
    relationship: 'PA / Family',
    initials: 'MA',
  },
  destiny: {
    id: 'destiny',
    name: 'Destiny',
    role: 'pa',
    relationship: 'PA / Family',
    initials: 'DE',
  },
  catina: {
    id: 'catina',
    name: 'Catina',
    role: 'family',
    relationship: 'Family',
    initials: 'CA',
  },
  gail: {
    id: 'gail',
    name: 'Gail',
    role: 'recipient',
    relationship: 'Mom',
    initials: 'GA',
  },
  darren: {
    id: 'darren',
    name: 'Darren',
    role: 'family',
    relationship: 'Family',
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
    date: day(0),
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
    date: day(1),
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
    date: day(2),
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
    date: day(3),
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
    id: 'c7',
    timestamp: at(0, '18:20'),
    author: 'trina',
    tag: 'health',
    text: 'Spoke with Dr. Williams about the swelling in her ankles. She wants us tracking weight every morning before breakfast, same scale each time.',
    confidential: false,
  },
  {
    id: 'c8',
    timestamp: at(0, '17:05'),
    author: 'trina',
    tag: 'mood',
    text: 'Mom asked me again whether she is a burden. Third time this month. I want to raise it with Dr. Williams privately before saying anything to the wider team.',
    confidential: true,
  },
  {
    id: 'c9',
    timestamp: at(0, '15:30'),
    author: 'markyaah',
    tag: 'mobility',
    text: 'Walked to the corner and back, no cane. Slower on the way home but steady. She was proud of it.',
    confidential: false,
  },
  {
    id: 'c10',
    timestamp: at(0, '13:15'),
    author: 'destiny',
    tag: 'nutrition',
    text: 'Ate about half of lunch. Said the soup was too salty. Made her a yogurt with berries after and she finished that.',
    confidential: false,
  },
  {
    id: 'c11',
    timestamp: at(0, '12:40'),
    author: 'markyaah',
    tag: 'general',
    text: 'She mentioned money worries again while we were folding laundry. Flagging for Trina only, did not want to put it in the open log.',
    confidential: true,
  },
  {
    id: 'c1',
    timestamp: at(0, '07:15'),
    author: 'catina',
    tag: 'general',
    text: 'Slept well, woke at 6:30. Had coffee and oatmeal with banana. Good mood, hummed along to the radio.',
    confidential: false,
  },
  {
    id: 'c2',
    timestamp: at(0, '09:10'),
    author: 'catina',
    tag: 'meds',
    text: 'Morning meds taken without fuss. Needed to split one of them with applesauce.',
    confidential: false,
  },
  {
    id: 'c3',
    timestamp: at(0, '11:40'),
    author: 'catina',
    tag: 'general',
    text: 'All good today — we played cards together for a while. No issues.',
    confidential: false,
  },
  {
    id: 'c4',
    timestamp: at(0, '11:48'),
    author: 'catina',
    tag: 'mood',
    text: 'Seemed a little disoriented this morning — asked twice about Dad. Mood lifted by lunchtime. Letting Trina know.',
    confidential: true,
  },
  {
    id: 'c5',
    timestamp: at(0, '12:30'),
    author: 'catina',
    tag: 'nutrition',
    text: 'Lunch: half a turkey sandwich, cucumber slices, ginger tea. Ate about 60%.',
    confidential: false,
  },
  {
    id: 'c6',
    timestamp: at(0, '14:10'),
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
    timestamp: at(0, '13:32'),
  },
  {
    id: 'al2',
    type: 'supplies',
    severity: 'warn',
    title: 'Furosemide running low',
    subtitle: '6 days remaining · refill at pharmacy',
    relatedId: 'fur',
    timestamp: at(0, '13:30'),
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
    timestamp: at(0, '19:00'),
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
    timestamp: at(0, '18:18'),
  },
  {
    id: 'al5',
    type: 'bills',
    severity: 'warn',
    title: 'Comfort Keepers invoice overdue',
    subtitle: '$420 · due Jun 3 · assigned Markyaah',
    timestamp: at(0, '18:00'),
  },
  {
    id: 'al6',
    type: 'handoff',
    severity: 'info',
    title: 'Catina finished handoff at 6:02 PM',
    subtitle: '3 items flagged for Trina',
    timestamp: at(0, '18:02'),
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
  { id: 't1', title: 'Morning wash-up and dressing', category: 'personal-care', dueTime: '08:00', assignedTo: 'catina', done: true, completedBy: 'catina', completedAt: at(0, '08:15'), recurring: true },
  { id: 't2', title: 'Blood pressure check', category: 'medical', dueTime: '09:00', assignedTo: 'catina', done: true, completedBy: 'catina', completedAt: at(0, '09:05'), recurring: true },
  { id: 't3', title: 'Short walk in the garden', category: 'personal-care', dueTime: '11:00', assignedTo: 'markyaah', done: false, recurring: true },
  { id: 't4', title: 'Change bed linens', category: 'household', dueTime: '13:00', assignedTo: 'destiny', done: false },
  { id: 't5', title: 'Pick up refill from pharmacy', category: 'errand', dueTime: '15:00', assignedTo: 'trina', done: false },
  { id: 't6', title: 'Call with Aunt Rose', category: 'social', dueTime: '17:00', assignedTo: 'trina', done: false, recurring: true },
  { id: 't7', title: 'Evening tidy of the kitchen', category: 'household', dueTime: '19:00', assignedTo: 'destiny', done: false, recurring: true },
];
