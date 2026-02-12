import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Student } from '@/types/student';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRole } from "@/context/RoleContext"; // RoleContext import kiya

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
  const { currentUser } = useRole(); // Check karne ke liye ke user login hai ya nahi

  // 1. Backend se data fetch karna
  const fetchStudents = async () => {
    // Agar token nahi hai toh request bhejne ka faida nahi (401 se bachne ke liye)
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await api.get('/students/all');
      const mappedData = response.data.map((s: any) => ({
        ...s,
        id: s._id || s.id,
      }));
      setStudents(mappedData);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      // Agar error 401 hai toh toast na dikhayein kyunki login process chal rahi hogi
      if (error.response?.status !== 401) {
        toast.error("Server se data load nahi ho saka.");
      }
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    if (currentUser) {
      fetchStudents();
    } else {
      setStudents([]); // Logout par data clear
    }
  }, [currentUser]);

  // 2. Add Students (Bulk)
  const addStudents = async (newStudents: Student[]) => {
    setIsLoading(true);
    try {
      await api.post('/students/bulk-add', newStudents);
      await fetchStudents();
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

  // 3. Update Student
  const updateStudent = async (id: string, data: Partial<Student>) => {
    try {
      await api.put(`/students/update/${id}`, data);
      setStudents(prev =>
        prev.map(student => student.id === id ? { ...student, ...data } : student)
      );
      toast.success("Record update ho gaya");
    } catch (error: any) {
      console.error("Update Error:", error);
      toast.error(error.response?.data?.message || "Update fail ho gaya");
    }
  };

  // 4. Delete Student
  const deleteStudent = async (id: string) => {
    try {
      await api.delete(`/students/delete/${id}`);
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