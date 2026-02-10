import { useState, useMemo } from 'react';
import { useStudents } from '@/context/StudentContext';
import { useRole } from '@/context/RoleContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Download, Edit, Trash2 } from 'lucide-react';
import { exportStudentsToExcel, formatCurrency } from '@/lib/helpers';
import { toast } from 'sonner';
import { Student, STATUS_OPTIONS, PAYMENT_METHODS } from '@/types/student';

export default function MasterEntry() {
  const { students, updateStudent, deleteStudent } = useStudents();
  const { hasPermission } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<Partial<Student>>({});

  const filteredStudents = useMemo(() => {
    return students
      .filter(student => {
        // Safe access to strings to prevent crashes if data is missing
        const name = student.name?.toLowerCase() || '';
        const number = student.number || '';
        const cnic = student.cnic || '';
        const email = student.email?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();

        const matchesSearch =
          name.includes(search) ||
          number.includes(search) ||
          cnic.includes(search) ||
          email.includes(search);

        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
        const matchesCourse = courseFilter === 'all' || student.course === courseFilter;

        return matchesSearch && matchesStatus && matchesCourse;
      })
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
  }, [students, searchTerm, statusFilter, courseFilter]);

  const handleExport = () => {
    exportStudentsToExcel(filteredStudents, 'master-entry');
    toast.success('Data exported successfully');
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setEditForm({ ...student });
  };

  const handleSaveEdit = async () => {
    if (editingStudent && editForm) {
      try {
        // Ensure numeric fields are correctly typed
        const finalData = {
          ...editForm,
          totalPayment: Number(editForm.totalPayment) || 0,
          feeReceived: Number(editForm.feeReceived) || 0,
          pending: Number(editForm.pending) || 0,
        };

        await updateStudent(editingStudent.id, finalData);
        setEditingStudent(null);
        setEditForm({});
        toast.success('Student updated successfully');
      } catch (error) {
        toast.error('Failed to update student');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id);
      toast.success('Student deleted successfully');
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header mb-1 text-2xl font-bold">Master Entry Sheet</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all entries sorted by date
          </p>
        </div>
        {hasPermission('canExport') && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-muted/20 p-4 rounded-lg border">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, number, CNIC, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
            <SelectItem value="Website Development">Website Development</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm font-medium">
        Showing <span className="text-primary">{filteredStudents.length}</span> of {students.length} entries
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="data-table min-w-[2000px] w-full text-left">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Name</th>
                <th className="p-3">Course</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Number</th>
                <th className="p-3">Email</th>
                <th className="p-3">Address</th>
                <th className="p-3">CNIC</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">Received</th>
                <th className="p-3 text-right">Pending</th>
                <th className="p-3">1st Due</th>
                <th className="p-3">2nd Due</th>
                <th className="p-3">3rd Due</th>
                <th className="p-3">Method</th>
                <th className="p-3">Payment ID</th>
                <th className="p-3">Receipt ID</th>
                <th className="p-3">CSR</th>
                <th className="p-3">Officer</th>
                <th className="p-3">Branch</th>
                {(hasPermission('canEdit') || hasPermission('canDelete')) && <th className="p-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 whitespace-nowrap">{student.date}</td>
                  <td className="p-3"><StatusBadge status={student.status} /></td>
                  <td className="p-3 font-medium">{student.name}</td>
                  <td className="p-3">{student.course}</td>
                  <td className="p-3">{student.batch}</td>
                  <td className="p-3 whitespace-nowrap">{student.number}</td>
                  <td className="p-3">{student.email}</td>
                  <td className="p-3 max-w-[150px] truncate" title={student.address}>{student.address}</td>
                  <td className="p-3 whitespace-nowrap">{student.cnic}</td>
                  <td className="p-3 text-right">{formatCurrency(student.totalPayment)}</td>
                  <td className="p-3 text-right text-success font-medium">{formatCurrency(student.feeReceived)}</td>
                  <td className="p-3 text-right text-warning font-medium">{formatCurrency(student.pending)}</td>
                  <td className="p-3 whitespace-nowrap">{student.firstInstalDueDate}</td>
                  <td className="p-3 whitespace-nowrap">{student.secondInstalDueDate}</td>
                  <td className="p-3 whitespace-nowrap">{student.thirdInstalDueDate}</td>
                  <td className="p-3">{student.method}</td>
                  <td className="p-3">{student.paymentId}</td>
                  <td className="p-3">{student.receiptId}</td>
                  <td className="p-3">{student.csrName}</td>
                  <td className="p-3">{student.officer}</td>
                  <td className="p-3">{student.branch}</td>
                  {(hasPermission('canEdit') || hasPermission('canDelete')) && (
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {hasPermission('canEdit') && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(student)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Student - {student.name}</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Name</label>
                                  <Input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Status</label>
                                  <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as any })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Phone</label>
                                  <Input value={editForm.number || ''} onChange={(e) => setEditForm({ ...editForm, number: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Email</label>
                                  <Input value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                                </div>
                                <div className="col-span-2 space-y-1">
                                  <label className="text-sm font-medium">Address</label>
                                  <Input value={editForm.address || ''} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Total Payment</label>
                                  <Input type="number" value={editForm.totalPayment || 0} onChange={(e) => setEditForm({ ...editForm, totalPayment: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Fee Received</label>
                                  <Input type="number" value={editForm.feeReceived || 0} onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setEditForm({ ...editForm, feeReceived: val, pending: (Number(editForm.totalPayment) || 0) - val });
                                  }} />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Payment Method</label>
                                  <Select value={editForm.method} onValueChange={(v) => setEditForm({ ...editForm, method: v as any })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Payment ID</label>
                                  <Input value={editForm.paymentId || ''} onChange={(e) => setEditForm({ ...editForm, paymentId: e.target.value })} />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleSaveEdit} className="w-full">Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        {hasPermission('canDelete') && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Student Record?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {student.name}? This action is permanent.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(student.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <div className="p-12 text-center text-muted-foreground bg-muted/5">
            No entries found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}