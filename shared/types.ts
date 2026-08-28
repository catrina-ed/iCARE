// iCare shared types

/**
 * Who someone is in the care circle.
 *
 * `master-admin` is the circle's owner: the only role that can grant or revoke
 * admin. `admin` is capped — see ADMIN_LIMIT — because seeing confidential
 * notes should be a deliberate, small grant rather than something that spreads.
 */
export type UserRole = 'master-admin' | 'admin' | 'pa' | 'family' | 'recipient';

/** Total number of people who may hold admin, the master admin included. */
export const ADMIN_LIMIT = 2;

export interface User {
  id: string;
  name: string;
  fullName: string;
  role: UserRole;
  relationship: string;
  initials: string;
  avatar?: string;
  email?: string;
}

export interface CareRecipient {
  id: string;
  name: string;
  nickname: string;
  age: number;
  pronouns: string;
  conditions: string[];
  allergies: string[];
  bloodType: string;
  primaryCareProvider: string;
  specialist?: string;
  pharmacy: string;
  insurance: string;
}

export type MedicationForm = 'tablet' | 'capsule' | 'liquid' | 'gummy' | 'patch';

export interface Medication {
  id: string;
  name: string;
  dose: string;
  form: MedicationForm;
  instructions: string;
  prescribedBy: string;
  pharmacy: string;
  refillDue: number; // days
  stock: number;
  lowStock?: boolean;
}

export type DoseStatus = 'given' | 'upcoming' | 'due' | 'missed' | 'skipped';

export interface Dose {
  id: string;
  medicationId: string;
  time: string; // HH:MM
  status: DoseStatus;
  confirmedBy?: string;
  confirmedAt?: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  title: string;
  provider: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  type: 'medical' | 'therapy' | 'casework' | 'social';
  assignedTo: string; // userId
  prepNotes?: string;
  postNotes?: string;
  color?: string;
}

export type CareLogTag = 'general' | 'meds' | 'health' | 'mood' | 'nutrition' | 'mobility' | 'sleep';

export interface CareLogEntry {
  id: string;
  timestamp: string; // ISO
  author: string; // userId
  tag: CareLogTag;
  text: string;
  confidential: boolean;
  attachments?: string[]; // URLs
}

export interface Alert {
  id: string;
  type: 'meds' | 'appointment' | 'supplies' | 'bills' | 'handoff';
  severity: 'info' | 'warn' | 'danger';
  title: string;
  subtitle?: string;
  relatedId?: string;
  timestamp: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: 'groceries' | 'toiletries' | 'medical' | 'household';
  status: 'needed' | 'assigned' | 'purchased';
  assignedTo?: string; // userId
  notes?: string;
  recurring?: boolean;
  recurringInterval?: number; // days
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: 'medical' | 'copay' | 'insurance' | 'care' | 'utilities';
  status: 'upcoming' | 'paid' | 'overdue';
  assignedTo: string; // userId
  paidBy?: string; // userId
  paidAt?: string; // ISO
}

export interface DailyHandoff {
  id: string;
  date: string; // YYYY-MM-DD
  fromUser: string; // userId
  toUser: string; // userId
  completedAt?: string; // ISO
  items: string[]; // what was flagged
  notes?: string;
}

export type CareTaskCategory = 'personal-care' | 'household' | 'medical' | 'errand' | 'social';

export interface CareTask {
  id: string;
  title: string;
  category: CareTaskCategory;
  dueTime?: string; // HH:MM
  assignedTo?: string; // userId
  done: boolean;
  completedBy?: string; // userId
  completedAt?: string; // ISO
  notes?: string;
  recurring?: boolean;
}
