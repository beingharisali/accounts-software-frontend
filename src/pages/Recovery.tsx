import { useState, useMemo } from 'react';
import { useStudents } from '@/context/StudentContext';
import { useBatches } from '@/context/BatchContext';
import { useRole } from '@/context/RoleContext';
import { StatCard } from '@/components/common/StatCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dialog';
import { 
  Search, 
  Users, 
  DollarSign, 
  AlertCircle, 
  Calendar,
  MessageCircle,
  Download,
  Clock,
  Edit,
} from 'lucide-react';
import { getDaysSinceAdmission, formatDaysSinceAdmission, generateWhatsAppLink, generateRecoveryMessage, exportStudentsToExcel, formatCurrency } from '@/lib/helpers';
import { toast } from 'sonner';

export default function Recovery() {
  const { students, updateStudent } = useStudents();
  const { batches } = useBatches();
  const { hasPermission } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRecoveryDate, setEditRecoveryDate] = useState('');

  // Filter out DROP and FREEZE students - only show those with pending balance
  const recoveryStudents = useMemo(() => {
    return students
      .filter(s => 
        s.status !== 'DROP' && 
        s.status !== 'FREEZE' && 
        s.pending > 0
      )
      .filter(student => {
        const matchesSearch = 
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.number.includes(searchTerm) ||
          student.cnic.includes(searchTerm);
        
        const matchesCourse = courseFilter === 'all' || student.course === courseFilter;
        const matchesBatch = batchFilter === 'all' || student.batch === batchFilter;
        
        return matchesSearch && matchesCourse && matchesBatch;
      })
      .sort((a, b) => b.pending - a.pending);
  }, [students, searchTerm, courseFilter, batchFilter]);

  // Group students by batch
  const studentsByBatch = useMemo(() => {
    const grouped: Record<string, typeof recoveryStudents> = {};
    recoveryStudents.forEach(student => {
      if (!grouped[student.batch]) {
        grouped[student.batch] = [];
      }
      grouped[student.batch].push(student);
    });
    return grouped;
  }, [recoveryStudents]);

  const availableBatches = useMemo(() => {
    const batchSet = new Set(students.filter(s => s.pending > 0).map(s => s.batch));
    return Array.from(batchSet).sort();
  }, [students]);

  const stats = useMemo(() => {
    return {
      totalRecoveries: recoveryStudents.length,
      totalPending: recoveryStudents.reduce((sum, s) => sum + s.pending, 0),
      totalCollected: recoveryStudents.reduce((sum, s) => sum + s.feeReceived, 0),
      avgPending: recoveryStudents.length > 0 
        ? recoveryStudents.reduce((sum, s) => sum + s.pending, 0) / recoveryStudents.length 
        : 0,
    };
  }, [recoveryStudents]);

  const getBatchInfo = (batchNumber: string) => {
    return batches.find(b => b.batchNumber === batchNumber);
  };

  const getNextDueDate = (student: typeof students[0]) => {
    const today = new Date();
    const dates = [
      student.firstInstalDueDate,
      student.secondInstalDueDate,
      student.thirdInstalDueDate,
    ].filter(Boolean);

    for (const dateStr of dates) {
      const date = new Date(dateStr);
      if (date >= today) {
        return dateStr;
      }
    }
    return dates[dates.length - 1] || '-';
  };

  const isOverdue = (student: typeof students[0]) => {
    const today = new Date();
    const dates = [
      student.firstInstalDueDate,
      student.secondInstalDueDate,
      student.thirdInstalDueDate,
    ].filter(Boolean);

    if (dates.length === 0) return false;
    
    const latestDue = new Date(dates[dates.length - 1]);
    return latestDue < today && student.pending > 0;
  };

  const handleWhatsAppReminder = (student: typeof students[0]) => {
    const message = generateRecoveryMessage(student);
    const link = generateWhatsAppLink(student.number, message);
    window.open(link, '_blank');
    toast.success(`Opening WhatsApp for ${student.name}`);
  };

  const handleExport = () => {
    exportStudentsToExcel(recoveryStudents, 'recovery-list');
    toast.success('Recovery list exported successfully');
  };

  const handleSaveEdit = (studentId: string) => {
    updateStudent(studentId, {
      comment: editComment,
      recoveryDate: editRecoveryDate,
    });
    setEditingStudent(null);
    setEditComment('');
    setEditRecoveryDate('');
    toast.success('Student updated successfully');
  };

  const openEditDialog = (student: typeof students[0]) => {
    setEditingStudent(student.id);
    setEditComment(student.comment || '');
    setEditRecoveryDate(student.recoveryDate || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header mb-1">Recovery Management</h1>
          <p className="text-sm text-muted-foreground">
            Track pending payments and recovery status (excludes dropped and frozen students)
          </p>
        </div>
        {hasPermission('canExport') && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Recoveries"
          value={stats.totalRecoveries}
          icon={<Users className="w-5 h-5 text-primary" />}
          variant="primary"
        />
        <StatCard
          title="Total Pending"
          value={formatCurrency(stats.totalPending)}
          icon={<AlertCircle className="w-5 h-5 text-warning" />}
          variant="warning"
        />
        <StatCard
          title="Already Collected"
          value={formatCurrency(stats.totalCollected)}
          icon={<DollarSign className="w-5 h-5 text-success" />}
          variant="success"
        />
        <StatCard
          title="Avg. Pending"
          value={formatCurrency(stats.avgPending)}
          icon={<Calendar className="w-5 h-5 text-accent" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, number, or CNIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
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
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {availableBatches.map(batch => (
              <SelectItem key={batch} value={batch}>{batch}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Recovery Table - Grouped by Batch */}
      {Object.entries(studentsByBatch).map(([batchNumber, batchStudents]) => {
        const batchInfo = getBatchInfo(batchNumber);
        const batchPending = batchStudents.reduce((sum, s) => sum + s.pending, 0);
        
        return (
          <div key={batchNumber} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Batch Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{batchNumber}</h2>
                  {batchInfo && (
                    <p className="text-sm text-muted-foreground">
                      {batchInfo.trainerName} • {batchInfo.days} • {batchInfo.timing} • {batchInfo.room}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Pending</p>
                  <p className="text-lg font-bold text-warning">{formatCurrency(batchPending)}</p>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto scrollbar-thin">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Number</th>
                    <th>CNIC</th>
                    <th>Days</th>
                    <th className="text-right">Total Fee</th>
                    <th className="text-right">Paid</th>
                    <th className="text-right">Balance</th>
                    <th>Last Paid</th>
                    <th>Recovery Date</th>
                    <th>Comment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batchStudents.map(student => {
                    const overdue = isOverdue(student);
                    const daysSince = getDaysSinceAdmission(student.date);
                    
                    return (
                      <tr key={student.id} className={overdue ? 'bg-destructive/5' : ''}>
                        <td className="font-medium">{student.name}</td>
                        <td className="whitespace-nowrap">{student.number}</td>
                        <td className="whitespace-nowrap">{student.cnic}</td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{formatDaysSinceAdmission(daysSince)}</span>
                          </div>
                        </td>
                        <td className="text-right">{formatCurrency(student.totalPayment)}</td>
                        <td className="text-right text-success font-medium">
                          {formatCurrency(student.feeReceived)}
                        </td>
                        <td className="text-right text-warning font-bold">
                          {formatCurrency(student.pending)}
                        </td>
                        <td className="whitespace-nowrap text-sm">
                          {student.lastPaidDate || student.date}
                        </td>
                        <td className="whitespace-nowrap text-sm">
                          {student.recoveryDate || '-'}
                        </td>
                        <td className="max-w-[150px]">
                          {student.comment ? (
                            <span className="text-xs text-muted-foreground truncate block" title={student.comment}>
                              {student.comment}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td>
                          {overdue ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/15 text-destructive">
                              Overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/15 text-warning">
                              Pending
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            {hasPermission('canSendReminders') && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleWhatsAppReminder(student)}
                                title="Send WhatsApp Reminder"
                              >
                                <MessageCircle className="w-4 h-4 text-success" />
                              </Button>
                            )}
                            {hasPermission('canEdit') && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => openEditDialog(student)}
                                    title="Edit Recovery Info"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Recovery Info - {student.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 pt-4">
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Recovery Date</label>
                                      <Input
                                        type="date"
                                        value={editRecoveryDate}
                                        onChange={(e) => setEditRecoveryDate(e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Comment</label>
                                      <Textarea
                                        placeholder="Add a comment about this recovery..."
                                        value={editComment}
                                        onChange={(e) => setEditComment(e.target.value)}
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button onClick={() => handleSaveEdit(student.id)} className="flex-1">
                                        Save Changes
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {recoveryStudents.length === 0 && (
        <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pending Recoveries</h3>
          <p className="text-muted-foreground">
            All students have cleared their dues or no matching records found
          </p>
        </div>
      )}

      {/* Summary by Course */}
      <div className="grid md:grid-cols-2 gap-4">
        {['Digital Marketing', 'Website Development'].map(course => {
          const courseRecoveries = recoveryStudents.filter(s => s.course === course);
          const coursePending = courseRecoveries.reduce((sum, s) => sum + s.pending, 0);
          const overdueCount = courseRecoveries.filter(s => isOverdue(s)).length;
          
          return (
            <div key={course} className="bg-card rounded-xl border border-border shadow-sm p-5">
              <h3 className="font-semibold mb-3">{course}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-xl font-bold">{courseRecoveries.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold text-warning">{formatCurrency(coursePending)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-xl font-bold text-destructive">{overdueCount}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
