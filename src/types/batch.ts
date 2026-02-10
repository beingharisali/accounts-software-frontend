export interface Batch {
  id: string;
  batchNumber: string;
  course: 'Digital Marketing' | 'Website Development';
  trainerName: string;
  days: string; // e.g., "Mon, Wed, Fri"
  timing: string; // e.g., "10:00 AM - 12:00 PM"
  startDate: string;
  status: 'active' | 'completed' | 'freeze';
  room: string;
}

export const ROOMS = [
  'Room A',
  'Room B',
  'Room C',
  'Lab 1',
  'Lab 2',
] as const;

export const DAYS_OPTIONS = [
  'Mon, Wed, Fri',
  'Tue, Thu, Sat',
  'Mon to Fri',
  'Sat, Sun',
  'Daily',
] as const;

export const BATCH_STATUS = [
  'active',
  'completed',
  'freeze',
] as const;
