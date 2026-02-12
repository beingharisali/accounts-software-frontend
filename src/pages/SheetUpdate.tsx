import { useState, useRef, ClipboardEvent, ChangeEvent } from 'react';
import { useStudents } from '@/context/StudentContext';
import { Button } from '@/components/ui/button';
import { Student, COLUMNS } from '@/types/student';
import { toast } from 'sonner';
import { ClipboardPaste, Upload, Trash2, Save, FileSpreadsheet } from 'lucide-react';
import api from '../lib/api';
import * as XLSX from 'xlsx';

const EMPTY_ROW: Partial<Student> = {
  date: '',
  status: 'NEW',
  name: '',
  course: '',
  batch: '',
  number: '',
  email: '',
  address: '',
  cnic: '',
  totalPayment: 0,
  feeReceived: 0,
  pending: 0,
  firstInstalDueDate: '',
  secondInstalDueDate: '',
  thirdInstalDueDate: '',
  method: 'Cash',
  paymentId: '',
  receiptId: '',
  csrName: '',
  officer: '',
  branch: '',
};

export default function SheetUpdate() {
  const { fetchStudents } = useStudents();
  const [rows, setRows] = useState<Partial<Student>[]>([{ ...EMPTY_ROW }]);
  const tableRef = useRef<HTMLTableElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        const newRows: Partial<Student>[] = data.slice(1).map((cells) => ({
          date: String(cells[0] || ''),
          status: (cells[1] as Student['status']) || 'NEW',
          name: String(cells[2] || ''),
          course: String(cells[3] || ''),
          batch: String(cells[4] || ''),
          number: String(cells[5] || ''),
          email: String(cells[6] || ''),
          address: String(cells[7] || ''),
          cnic: String(cells[8] || ''),
          totalPayment: parseFloat(cells[9]) || 0,
          feeReceived: parseFloat(cells[10]) || 0,
          pending: parseFloat(cells[11]) || 0,
          firstInstalDueDate: String(cells[12] || ''),
          secondInstalDueDate: String(cells[13] || ''),
          thirdInstalDueDate: String(cells[14] || ''),
          method: (cells[15] as Student['method']) || 'Cash',
          paymentId: String(cells[16] || ''),
          receiptId: String(cells[17] || ''),
          csrName: String(cells[18] || ''),
          officer: String(cells[19] || ''),
          branch: String(cells[20] || ''),
        }));

        if (newRows.length > 0) {
          setRows(newRows);
          toast.success(`Imported ${newRows.length} rows from Excel file`);
        }
      } catch (err) {
        toast.error("Error reading Excel file. Please check the format.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  // --- Original Logic: Paste from Clipboard ---
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const lines = pastedText.split('\n').filter(line => line.trim());

    const newRows: Partial<Student>[] = lines.map((line) => {
      const cells = line.split('\t');
      return {
        date: cells[0] || '',
        status: (cells[1] as Student['status']) || 'NEW',
        name: cells[2] || '',
        course: cells[3] || '',
        batch: cells[4] || '',
        number: cells[5] || '',
        email: cells[6] || '',
        address: cells[7] || '',
        cnic: cells[8] || '',
        totalPayment: parseFloat(cells[9]) || 0,
        feeReceived: parseFloat(cells[10]) || 0,
        pending: parseFloat(cells[11]) || 0,
        firstInstalDueDate: cells[12] || '',
        secondInstalDueDate: cells[13] || '',
        thirdInstalDueDate: cells[14] || '',
        method: (cells[15] as Student['method']) || 'Cash',
        paymentId: cells[16] || '',
        receiptId: cells[17] || '',
        csrName: cells[18] || '',
        officer: cells[19] || '',
        branch: cells[20] || '',
      };
    });

    if (newRows.length > 0) {
      setRows(newRows);
      toast.success(`Pasted ${newRows.length} rows from clipboard`);
    }
  };

  const handleCellChange = (rowIndex: number, field: keyof Student, value: string) => {
    setRows(prev => {
      const updated = [...prev];
      if (field === 'totalPayment' || field === 'feeReceived' || field === 'pending') {
        (updated[rowIndex] as any)[field] = parseFloat(value) || 0;
      } else {
        (updated[rowIndex] as any)[field] = value;
      }
      return updated;
    });
  };

  const addRow = () => {
    setRows(prev => [...prev, { ...EMPTY_ROW }]);
  };

  const removeRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setRows([{ ...EMPTY_ROW }]);
    toast.info('Sheet cleared');
  };

  const handleSubmit = async () => {
    const validRows = rows.filter(row => row.name && row.name.trim() !== '');

    if (validRows.length === 0) {
      toast.error('Please add at least one valid entry');
      return;
    }

    const studentsToAdd = validRows.map((row) => ({
      date: row.date || new Date().toISOString().split('T')[0],
      status: row.status || 'NEW',
      name: row.name,
      course: row.course,
      batch: row.batch,
      number: row.number,
      email: row.email,
      address: row.address,
      cnic: row.cnic,
      totalPayment: Number(row.totalPayment),
      feeReceived: Number(row.feeReceived),
      pending: Number(row.pending),
      firstInstalDueDate: row.firstInstalDueDate,
      secondInstalDueDate: row.secondInstalDueDate,
      thirdInstalDueDate: row.thirdInstalDueDate,
      method: row.method,
      paymentId: row.paymentId,
      receiptId: row.receiptId,
      csrName: row.csrName,
      officer: row.officer,
      branch: row.branch,
    }));

    try {
      const response = await api.post('/students/bulk-add', studentsToAdd);
      if (response.status === 201 || response.status === 200) {
        toast.success(`Successfully added ${studentsToAdd.length} entries to Database`);
        setRows([{ ...EMPTY_ROW }]);
        if (fetchStudents) fetchStudents();
      }
    } catch (error: any) {
      console.error("Backend Error:", error);
      toast.error(error.response?.data?.message || 'Error connecting to server');
    }
  };

  const fieldKeys: (keyof Student)[] = [
    'date', 'status', 'name', 'course', 'batch', 'number', 'email', 'address',
    'cnic', 'totalPayment', 'feeReceived', 'pending', 'firstInstalDueDate',
    'secondInstalDueDate', 'thirdInstalDueDate', 'method', 'paymentId',
    'receiptId', 'csrName', 'officer', 'branch'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header mb-1">Sheet Update</h1>
          <p className="text-sm text-muted-foreground">
            Copy from Excel (Ctrl+V) or directly upload an Excel file
          </p>
        </div>
        <div className="flex gap-2">
          {/* ✅ Hidden File Input for Excel */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
          />

          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Import Excel
          </Button>

          <Button variant="outline" onClick={clearAll}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Submit Entries
          </Button>
        </div>
      </div>

      <div
        className="border-2 border-dashed border-border rounded-xl p-6 bg-muted/30 text-center cursor-pointer hover:bg-muted/50 transition-colors"
        onPaste={handlePaste}
        tabIndex={0}
      >
        <ClipboardPaste className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Click here and paste (Ctrl+V) data from Excel</p>
        <p className="text-xs text-muted-foreground mt-1">
          Or use the "Import Excel" button to select a file directly
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table ref={tableRef} className="w-full border-collapse min-w-[2000px]">
            <thead>
              <tr className="bg-table-header">
                <th className="w-10 px-2 py-3 text-xs font-semibold text-muted-foreground">#</th>
                {COLUMNS.map(col => (
                  <th key={col} className="px-2 py-3 text-xs font-semibold text-muted-foreground text-left whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th className="w-10 px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-table-border hover:bg-table-row-hover">
                  <td className="px-2 py-1 text-center text-xs text-muted-foreground">
                    {rowIndex + 1}
                  </td>
                  {fieldKeys.map(field => (
                    <td key={field} className="px-1 py-1">
                      <input
                        type={['totalPayment', 'feeReceived', 'pending'].includes(field) ? 'number' : 'text'}
                        value={(row[field] as string | number) || ''}
                        onChange={(e) => handleCellChange(rowIndex, field, e.target.value)}
                        className="excel-cell w-full min-w-[80px]"
                        placeholder={field}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1">
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={addRow}>
            <Upload className="w-4 h-4 mr-2" />
            Add Row
          </Button>
        </div>
      </div>
    </div>
  );
}