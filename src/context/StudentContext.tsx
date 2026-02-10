import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Student } from '@/types/student';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api/students';

interface StudentContextType {
  students: Student[];
  isLoading: boolean;
  fetchStudents: () => Promise<void>;
  addStudents: (newStudents: Student[]) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1. Backend se data fetch karna
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/all`);
      const mappedData = response.data.map((s: any) => ({
        ...s,
        id: s._id || s.id,
      }));
      setStudents(mappedData);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Server se data load nahi ho saka. Connection check karein.");
    } finally {
      setIsLoading(false);
    }
  };

  // Page load hote hi data fetch karein
  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. Add Students (Bulk)
  const addStudents = async (newStudents: Student[]) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/bulk-add`, newStudents);
      await fetchStudents(); // Refresh complete list
      toast.success(`${newStudents.length} entries successfully saved!`);
    } catch (error: any) {
      console.error("Add Error:", error);
      const message = error.response?.data?.message || "Data save karne mein masla hua";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Update Student (Database update)
  const updateStudent = async (id: string, data: Partial<Student>) => {
    try {
      // Backend expects the MongoDB _id (which we stored as id)
      await axios.put(`${API_URL}/update/${id}`, data);

      // Optimistic Update: Local state ko turant update karein taaki UI fast lage
      setStudents(prev =>
        prev.map(student => student.id === id ? { ...student, ...data } : student)
      );

      toast.success("Record update ho gaya");
    } catch (error: any) {
      console.error("Update Error:", error);
      toast.error(error.response?.data?.message || "Update fail ho gaya");
    }
  };

  // 4. Delete Student (Database removal)
  const deleteStudent = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/delete/${id}`);

      // UI se foran remove karein
      setStudents(prev => prev.filter(student => student.id !== id));
      toast.success("Entry delete kar di gayi");
    } catch (error: any) {
      console.error("Delete Error:", error);
      toast.error(error.response?.data?.message || "Delete fail ho gaya");
    }
  };

  return (
    <StudentContext.Provider value={{
      students,
      isLoading,
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