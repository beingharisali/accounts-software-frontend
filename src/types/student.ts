export interface Student {
  id: string;
  date: string;
  status: 'NEW' | 'RECOVERY' | 'DROP' | 'FREEZE' | 'FULL PAID';
  name: string;
  course: string;
  batch: string;
  number: string;
  email: string;
  address: string;
  cnic: string;
  totalPayment: number;
  feeReceived: number;
  pending: number;
  firstInstalDueDate: string;
  secondInstalDueDate: string;
  thirdInstalDueDate: string;
  method: 'JazzCash' | 'Easypaisa' | 'Bank' | 'Cash';
  paymentId: string;
  receiptId: string;
  csrName: string;
  officer: string;
  branch: string;
  // Recovery tracking fields
  lastPaidDate?: string;
  recoveryDate?: string;
  comment?: string;
}

export interface DailyReport {
  date: string;
  newAdmissions: number;
  recovery: number;
  drop: number;
  totalPayment: number;
  jazzCash: number;
  easypaisa: number;
  bank: number;
  cash: number;
}

export interface PaymentRecord {
  date: string;
  amount: number;
  method: string;
  receiptId: string;
}

export const COURSES = [
  'Digital Marketing',
  'Website Development',
] as const;

export const STATUS_OPTIONS = [
  'NEW',
  'RECOVERY', 
  'DROP',
  'FREEZE',
  'FULL PAID',
] as const;

export const PAYMENT_METHODS = [
  'JazzCash',
  'Easypaisa',
  'Bank',
  'Cash',
] as const;

export const COLUMNS = [
  'Date',
  'Status',
  'Name',
  'Course',
  'Batch',
  'Number',
  'Email',
  'Address',
  'CNIC #',
  'Total Payment',
  'Fee Received',
  'Pending',
  '1st Instal Due Date',
  '2nd Instal Due Date',
  '3rd Instal Due Date',
  'Method',
  'Payment ID',
  'Receipt ID',
  'CSR Name',
  'Officer',
  'Branch',
] as const;
