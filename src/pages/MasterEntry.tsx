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
        const matchesSearch = 
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.number.includes(searchTerm) ||
          student.cnic.includes(searchTerm) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
        const matchesCourse = courseFilter === 'all' || student.course === courseFilter;
        
        return matchesSearch && matchesStatus && matchesCourse;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [students, searchTerm, statusFilter, courseFilter]);

  const handleExport = () => {
    exportStudentsToExcel(filteredStudents, 'master-entry');
    toast.success('Data exported successfully');
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setEditForm({ ...student });
  };

  const handleSaveEdit = () => {
    if (editingStudent && editForm) {
      updateStudent(editingStudent.id, editForm);
      setEditingStudent(null);
      setEditForm({});
      toast.success('Student updated successfully');
    }
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    toast.success('Student deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header mb-1">Master Entry Sheet</h1>
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
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, number, CNIC, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="RECOVERY">Recovery</SelectItem>
            <SelectItem value="FULL PAID">Full Paid</SelectItem>
            <SelectItem value="DROP">Drop</SelectItem>
            <SelectItem value="FREEZE">Freeze</SelectItem>
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[180px]">
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
      <div className="text-sm text-muted-foreground">
        Showing {filteredStudents.length} of {students.length} entries
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="data-table min-w-[2000px]">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Name</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Number</th>
                <th>Email</th>
                <th>Address</th>
                <th>CNIC</th>
                <th className="text-right">Total</th>
                <th className="text-right">Received</th>
                <th className="text-right">Pending</th>
                <th>1st Due</th>
                <th>2nd Due</th>
                <th>3rd Due</th>
                <th>Method</th>
                <th>Payment ID</th>
                <th>Receipt ID</th>
                <th>CSR</th>
                <th>Officer</th>
                <th>Branch</th>
                {(hasPermission('canEdit') || hasPermission('canDelete')) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td className="font-medium whitespace-nowrap">{student.date}</td>
                  <td><StatusBadge status={student.status} /></td>
                  <td className="font-medium">{student.name}</td>
                  <td>{student.course}</td>
                  <td>{student.batch}</td>
                  <td className="whitespace-nowrap">{student.number}</td>
                  <td>{student.email}</td>
                  <td className="max-w-[150px] truncate" title={student.address}>
                    {student.address}
                  </td>
                  <td className="whitespace-nowrap">{student.cnic}</td>
                  <td className="text-right font-medium">{formatCurrency(student.totalPayment)}</td>
                  <td className="text-right text-success font-medium">
                    {formatCurrency(student.feeReceived)}
                  </td>
                  <td className="text-right text-warning font-medium">
                    {formatCurrency(student.pending)}
                  </td>
                  <td className="whitespace-nowrap">{student.firstInstalDueDate}</td>
                  <td className="whitespace-nowrap">{student.secondInstalDueDate}</td>
                  <td className="whitespace-nowrap">{student.thirdInstalDueDate}</td>
                  <td>{student.method}</td>
                  <td>{student.paymentId}</td>
                  <td>{student.receiptId}</td>
                  <td>{student.csrName}</td>
                  <td>{student.officer}</td>
                  <td>{student.branch}</td>
                  {(hasPermission('canEdit') || hasPermission('canDelete')) && (
                    <td>
                      <div className="flex items-center gap-1">
                        {hasPermission('canEdit') && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleEdit(student)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Student - {student.name}</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div>
                                  <label className="text-sm font-medium">Name</label>
                                  <Input
                                    value={editForm.name || ''}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <Select 
                                    value={editForm.status} 
                                    onValueChange={(value) => setEditForm({...editForm, status: value as Student['status']})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {STATUS_OPTIONS.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Phone</label>
                                  <Input
                                    value={editForm.number || ''}
                                    onChange={(e) => setEditForm({...editForm, number: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <Input
                                    value={editForm.email || ''}
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium">Address</label>
                                  <Input
                                    value={editForm.address || ''}
                                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Total Payment</label>
                                  <Input
                                    type="number"
                                    value={editForm.totalPayment || 0}
                                    onChange={(e) => setEditForm({...editForm, totalPayment: parseFloat(e.target.value) || 0})}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Fee Received</label>
                                  <Input
                                    type="number"
                                    value={editForm.feeReceived || 0}
                                    onChange={(e) => {
                                      const received = parseFloat(e.target.value) || 0;
                                      setEditForm({
                                        ...editForm, 
                                        feeReceived: received,
                                        pending: (editForm.totalPayment || 0) - received
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Payment Method</label>
                                  <Select 
                                    value={editForm.method} 
                                    onValueChange={(value) => setEditForm({...editForm, method: value as Student['method']})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PAYMENT_METHODS.map(method => (
                                        <SelectItem key={method} value={method}>{method}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Payment ID</label>
                                  <Input
                                    value={editForm.paymentId || ''}
                                    onChange={(e) => setEditForm({...editForm, paymentId: e.target.value})}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleSaveEdit}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        {hasPermission('canDelete') && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {student.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(student.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
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
          <div className="p-8 text-center text-muted-foreground">
            No entries found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}
