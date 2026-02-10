import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Batch } from '@/types/batch';

interface BatchContextType {
  batches: Batch[];
  addBatch: (batch: Batch) => void;
  updateBatch: (id: string, data: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
}

const BatchContext = createContext<BatchContextType | undefined>(undefined);

// Sample batches
const sampleBatches: Batch[] = [
  {
    id: '1',
    batchNumber: 'DM-2024-01',
    course: 'Digital Marketing',
    trainerName: 'Mr. Imran Ali',
    days: 'Mon, Wed, Fri',
    timing: '10:00 AM - 12:00 PM',
    startDate: '2024-01-15',
    status: 'active',
    room: 'Room A',
  },
  {
    id: '2',
    batchNumber: 'DM-2024-02',
    course: 'Digital Marketing',
    trainerName: 'Mr. Imran Ali',
    days: 'Tue, Thu, Sat',
    timing: '2:00 PM - 4:00 PM',
    startDate: '2024-01-19',
    status: 'active',
    room: 'Room B',
  },
  {
    id: '3',
    batchNumber: 'WD-2024-01',
    course: 'Website Development',
    trainerName: 'Ms. Ayesha Khan',
    days: 'Mon, Wed, Fri',
    timing: '2:00 PM - 4:00 PM',
    startDate: '2024-01-16',
    status: 'active',
    room: 'Lab 1',
  },
  {
    id: '4',
    batchNumber: 'WD-2024-02',
    course: 'Website Development',
    trainerName: 'Mr. Bilal Ahmed',
    days: 'Tue, Thu, Sat',
    timing: '10:00 AM - 12:00 PM',
    startDate: '2024-01-18',
    status: 'completed',
    room: 'Lab 2',
  },
];

export function BatchProvider({ children }: { children: ReactNode }) {
  const [batches, setBatches] = useState<Batch[]>(sampleBatches);

  const addBatch = (batch: Batch) => {
    setBatches(prev => [...prev, batch]);
  };

  const updateBatch = (id: string, data: Partial<Batch>) => {
    setBatches(prev =>
      prev.map(batch =>
        batch.id === id ? { ...batch, ...data } : batch
      )
    );
  };

  const deleteBatch = (id: string) => {
    setBatches(prev => prev.filter(batch => batch.id !== id));
  };

  return (
    <BatchContext.Provider value={{ batches, addBatch, updateBatch, deleteBatch }}>
      {children}
    </BatchContext.Provider>
  );
}

export function useBatches() {
  const context = useContext(BatchContext);
  if (context === undefined) {
    throw new Error('useBatches must be used within a BatchProvider');
  }
  return context;
}
