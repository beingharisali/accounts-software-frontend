import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Student } from '@/types/student';
import axios from 'axios';
import { toast } from 'sonner';

// Backend Base URL
const API_URL = 'http://localhost:5000/api/students';

interface StudentContextType {
  students: Student[];
  fetchStudents: () => Promise<void>;
  addStudents: (newStudents: Student[]) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);

  // 1. Backend se data fetch karna aur id map karna
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/all`);
      // MongoDB ki _id ko frontend ki id field mein map kar rahay hain
      const mappedData = response.data.map((s: any) => ({
        ...s,
        id: s._id,
      }));
      setStudents(mappedData);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Server se data load nahi ho saka");
    }
  };

  // Initial load par data mangwao
  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. Add Students (Backend logic handles RECOVERY/CNIC checks)
  const addStudents = async (newStudents: Student[]) => {
    try {
      await axios.post(`${API_URL}/bulk-add`, newStudents);
      await fetchStudents(); // List refresh karo
      toast.success(`${newStudents.length} entries successfully saved!`);
    } catch (error: any) {
      console.error("Add Error:", error);
      toast.error(error.response?.data?.message || "Data save karne mein masla hua");
      throw error;
    }
  };

  // 3. Update Student (Database update)
  const updateStudent = async (id: string, data: Partial<Student>) => {
    try {
      // Backend ko _id bhejni hai (jo frontend mein id ke naam se hai)
      await axios.put(`${API_URL}/update/${id}`, data);
      await fetchStudents(); // Refresh data
      toast.success("Record update ho gaya");
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Update fail ho gaya");
    }
  };

  // 4. Delete Student (Database removal)
  const deleteStudent = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/delete/${id}`);
      // UI se foran remove kar do
      setStudents(prev => prev.filter(student => (student as any).id !== id));
      toast.success("Entry delete kar di gayi");
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Delete fail ho gaya");
    }
  };

  return (
    <StudentContext.Provider value={{
      students,
      fetchStudents,
      addStudents,
      updateStudent,
      deleteStudent
    }}>
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