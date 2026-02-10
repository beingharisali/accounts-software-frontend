import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Student } from '@/types/student';

interface StudentContextType {
  students: Student[];
  addStudents: (newStudents: Student[]) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

// Sample data for demonstration
const sampleStudents: Student[] = [
  {
    id: '1',
    date: '2024-01-15',
    status: 'NEW',
    name: 'Ahmed Khan',
    course: 'Digital Marketing',
    batch: 'DM-2024-01',
    number: '03001234567',
    email: 'ahmed@email.com',
    address: 'Lahore, Pakistan',
    cnic: '35201-1234567-1',
    totalPayment: 50000,
    feeReceived: 25000,
    pending: 25000,
    firstInstalDueDate: '2024-01-15',
    secondInstalDueDate: '2024-02-15',
    thirdInstalDueDate: '2024-03-15',
    method: 'JazzCash',
    paymentId: 'JZ123456',
    receiptId: 'RCP001',
    csrName: 'Ali Raza',
    officer: 'M. Hassan',
    branch: 'Lahore Main',
  },
  {
    id: '2',
    date: '2024-01-16',
    status: 'FULL PAID',
    name: 'Sara Ali',
    course: 'Website Development',
    batch: 'WD-2024-01',
    number: '03009876543',
    email: 'sara@email.com',
    address: 'Karachi, Pakistan',
    cnic: '42101-9876543-2',
    totalPayment: 60000,
    feeReceived: 60000,
    pending: 0,
    firstInstalDueDate: '2024-01-16',
    secondInstalDueDate: '',
    thirdInstalDueDate: '',
    method: 'Bank',
    paymentId: 'BNK789012',
    receiptId: 'RCP002',
    csrName: 'Fatima Noor',
    officer: 'K. Ahmed',
    branch: 'Karachi DHA',
  },
  {
    id: '3',
    date: '2024-01-17',
    status: 'RECOVERY',
    name: 'Usman Malik',
    course: 'Digital Marketing',
    batch: 'DM-2024-01',
    number: '03211234567',
    email: 'usman@email.com',
    address: 'Islamabad, Pakistan',
    cnic: '61101-5678901-3',
    totalPayment: 50000,
    feeReceived: 15000,
    pending: 35000,
    firstInstalDueDate: '2024-01-17',
    secondInstalDueDate: '2024-02-17',
    thirdInstalDueDate: '2024-03-17',
    method: 'Easypaisa',
    paymentId: 'EP456789',
    receiptId: 'RCP003',
    csrName: 'Zainab Shah',
    officer: 'A. Khan',
    branch: 'Islamabad F-7',
  },
  {
    id: '4',
    date: '2024-01-18',
    status: 'DROP',
    name: 'Ayesha Tariq',
    course: 'Website Development',
    batch: 'WD-2024-01',
    number: '03331234567',
    email: 'ayesha@email.com',
    address: 'Multan, Pakistan',
    cnic: '36302-2345678-4',
    totalPayment: 60000,
    feeReceived: 20000,
    pending: 40000,
    firstInstalDueDate: '2024-01-18',
    secondInstalDueDate: '2024-02-18',
    thirdInstalDueDate: '2024-03-18',
    method: 'Cash',
    paymentId: 'CSH001',
    receiptId: 'RCP004',
    csrName: 'Bilal Ahmed',
    officer: 'S. Malik',
    branch: 'Multan Cantt',
  },
  {
    id: '5',
    date: '2024-01-19',
    status: 'FREEZE',
    name: 'Hassan Raza',
    course: 'Digital Marketing',
    batch: 'DM-2024-02',
    number: '03451234567',
    email: 'hassan@email.com',
    address: 'Faisalabad, Pakistan',
    cnic: '33100-3456789-5',
    totalPayment: 50000,
    feeReceived: 30000,
    pending: 20000,
    firstInstalDueDate: '2024-01-19',
    secondInstalDueDate: '2024-02-19',
    thirdInstalDueDate: '2024-03-19',
    method: 'JazzCash',
    paymentId: 'JZ789012',
    receiptId: 'RCP005',
    csrName: 'Nadia Khan',
    officer: 'R. Ali',
    branch: 'Faisalabad D-Ground',
  },
];

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(sampleStudents);

  const addStudents = (newStudents: Student[]) => {
    setStudents(prev => {
      const updatedStudents = [...prev];
      const today = new Date().toISOString().split('T')[0];
      
      newStudents.forEach(newStudent => {
        if (newStudent.status === 'RECOVERY') {
          // Find existing student with same CNIC and batch
          const existingIndex = updatedStudents.findIndex(
            s => s.cnic === newStudent.cnic && s.batch === newStudent.batch
          );
          
          if (existingIndex !== -1) {
            // Update existing student's payment
            const existing = updatedStudents[existingIndex];
            const newFeeReceived = existing.feeReceived + newStudent.feeReceived;
            const newPending = existing.totalPayment - newFeeReceived;
            
            updatedStudents[existingIndex] = {
              ...existing,
              feeReceived: newFeeReceived,
              pending: Math.max(0, newPending),
              status: newPending <= 0 ? 'FULL PAID' : 'RECOVERY',
              // Update payment info with latest recovery
              method: newStudent.method,
              paymentId: newStudent.paymentId,
              receiptId: newStudent.receiptId,
              lastPaidDate: today,
            };
          } else {
            // No matching student found, add as new
            updatedStudents.push({
              ...newStudent,
              lastPaidDate: today,
            });
          }
        } else {
          // For non-RECOVERY entries, add as new student
          updatedStudents.push({
            ...newStudent,
            lastPaidDate: newStudent.feeReceived > 0 ? today : undefined,
          });
        }
      });
      
      return updatedStudents;
    });
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === id ? { ...student, ...data } : student
      )
    );
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  return (
    <StudentContext.Provider value={{ students, addStudents, updateStudent, deleteStudent }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
}
