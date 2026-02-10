import { useState, useMemo, useEffect } from 'react';
import { useStudents } from '@/context/StudentContext';
import { useBatches } from '@/context/BatchContext';
import { useRole } from '@/context/RoleContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatCard } from '@/components/common/StatCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Download,
  Calendar,
  Clock,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { exportStudentsToExcel, formatCurrency } from '@/lib/helpers';
import { toast } from 'sonner';

export default function CourseBreakdown() {
  const { students } = useStudents();
  const { batches } = useBatches();
  const { hasPermission } = useRole();

  const availableCourses = useMemo(() => {
    const list = students.map((s: any) => s.course).filter(Boolean);
    return Array.from(new Set(list)) as string[];
  }, [students]);


  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (availableCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(availableCourses[0]);
    }
  }, [availableCourses, selectedCourse]);

  const courseStudents = useMemo(() => {
    if (!selectedCourse) return [];
    return students.filter((s: any) =>
      s.course?.toString().trim().toLowerCase() === selectedCourse.toLowerCase().trim()
    );
  }, [students, selectedCourse]);

  const availableBatches = useMemo(() => {
    const batchSet = new Set(courseStudents.map((s: any) => s.batch).filter(Boolean));
    return Array.from(batchSet).sort();
  }, [courseStudents]);

  // 4. Final Filtering Logic
  const filteredStudents = useMemo(() => {
    return courseStudents
      .filter((student: any) => {
        const name = student.name?.toLowerCase() || '';
        const roll = (student.rollNumber || student.rollNo || '').toLowerCase();
        const phone = student.phone || student.number || '';

        const matchesSearch = !searchTerm ||
          name.includes(searchTerm.toLowerCase()) ||
          roll.includes(searchTerm.toLowerCase()) ||
          phone.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
        const matchesBatch = batchFilter === 'all' || student.batch === batchFilter;

        return matchesSearch && matchesStatus && matchesBatch;
      })
      .sort((a: any, b: any) => {
        const dateA = a.date ? new Date(a.date.split('-').reverse().join('-')).getTime() : 0;
        const dateB = b.date ? new Date(b.date.split('-').reverse().join('-')).getTime() : 0;
        return dateB - dateA;
      });
  }, [courseStudents, searchTerm, statusFilter, batchFilter]);

  // 5. Grouping by Batch
  const studentsByBatch = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredStudents.forEach((student: any) => {
      const bKey = student.batch || 'Unassigned';
      if (!grouped[bKey]) grouped[bKey] = [];
      grouped[bKey].push(student);
    });
    return grouped;
  }, [filteredStudents]);

  // 6. Overall Course Stats
  const stats = useMemo(() => {
    const totalRevenue = courseStudents.reduce((sum, s: any) => sum + (Number(s.feeReceived) || 0), 0);
    const totalPending = courseStudents.reduce((sum, s: any) => {
      const total = Number(s.totalFee || s.totalPayment) || 0;
      const received = Number(s.feeReceived) || 0;
      return sum + (total - received);
    }, 0);

    return {
      total: courseStudents.length,
      fullPaid: courseStudents.filter((s: any) => s.status === 'FULL PAID').length,
      drop: courseStudents.filter((s: any) => s.status === 'DROP').length,
      freeze: courseStudents.filter((s: any) => s.status === 'FREEZE').length,
      newCount: courseStudents.filter((s: any) => s.status === 'NEW').length,
      recoveryCount: courseStudents.filter((s: any) => s.status === 'RECOVERY').length,
      totalRevenue,
      totalPending,
    };
  }, [courseStudents]);

  const getBatchInfo = (batchNumber: string) => {
    return batches.find(b => b.batchNumber === batchNumber);
  };

  const getBatchStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-success/15 text-success';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'freeze': return 'bg-warning/15 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportStudentsToExcel(filteredStudents, `${selectedCourse.replace(/\s+/g, '-')}-Report`);
    toast.success('Report exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header mb-1">Course Breakdown</h1>
          <p className="text-sm text-muted-foreground">Detailed view for {selectedCourse || "Loading..."}</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {availableCourses.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasPermission('canExport') && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          )}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.total} icon={<Users className="w-5 h-5 text-primary" />} variant="primary" />
        <StatCard title="Full Paid" value={stats.fullPaid} icon={<DollarSign className="w-5 h-5 text-success" />} variant="success" />
        <StatCard title="Revenue Collected" value={formatCurrency(stats.totalRevenue)} icon={<TrendingUp className="w-5 h-5 text-accent" />} />
        <StatCard title="Pending Amount" value={formatCurrency(stats.totalPending)} icon={<AlertCircle className="w-5 h-5 text-warning" />} variant="warning" />
      </div>

      {/* Status Filter Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { status: 'NEW', count: stats.newCount },
          { status: 'RECOVERY', count: stats.recoveryCount },
          { status: 'FULL PAID', count: stats.fullPaid },
          { status: 'DROP', count: stats.drop },
          { status: 'FREEZE', count: stats.freeze },
        ].map(item => (
          <button
            key={item.status}
            onClick={() => setStatusFilter(statusFilter === item.status ? 'all' : item.status)}
            className={`p-4 rounded-lg border text-left transition-all ${statusFilter === item.status ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:bg-muted/50'}`}
          >
            <StatusBadge status={item.status} />
            <p className="text-2xl font-bold mt-2">{item.count}</p>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-xl border border-border">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Batch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {availableBatches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Batch-wise Data Rendering */}
      {Object.keys(studentsByBatch).length > 0 ? (
        Object.entries(studentsByBatch).map(([batchNumber, batchStudents]) => {
          const batchInfo = getBatchInfo(batchNumber);
          const bRevenue = batchStudents.reduce((sum, s: any) => sum + (Number(s.feeReceived) || 0), 0);
          const bPending = batchStudents.reduce((sum, s: any) => {
            const total = Number(s.totalFee || s.totalPayment) || 0;
            return sum + (total - (Number(s.feeReceived) || 0));
          }, 0);

          return (
            <div key={batchNumber} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-6">
              <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-bold text-lg">{batchNumber}</h2>
                    {batchInfo && (
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${getBatchStatusColor(batchInfo.status)}`}>
                        {batchInfo.status}
                      </span>
                    )}
                  </div>
                  {batchInfo && (
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {batchInfo.trainerName}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {batchInfo.days}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {batchInfo.timing}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Revenue</p>
                    <p className="font-bold text-success text-sm">{formatCurrency(bRevenue)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Pending</p>
                    <p className="font-bold text-warning text-sm">{formatCurrency(bPending)}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Student Details</th>
                      <th>Status</th>
                      <th className="text-right">Fee</th>
                      <th className="text-right">Paid</th>
                      <th className="text-right">Balance</th>
                      <th>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchStudents.map((student: any) => {
                      const totalAmt = Number(student.totalFee || student.totalPayment || 0);
                      const paidAmt = Number(student.feeReceived || 0);
                      const balanceAmt = totalAmt - paidAmt;

                      return (
                        <tr key={student._id || student.id}>
                          <td className="text-xs whitespace-nowrap">{student.date}</td>
                          <td>
                            <div className="font-semibold text-sm">{student.name}</div>
                            <div className="text-[10px] text-muted-foreground">{student.rollNumber || student.rollNo || student.phone || student.number}</div>
                          </td>
                          <td><StatusBadge status={student.status} /></td>
                          <td className="text-right">{formatCurrency(totalAmt)}</td>
                          <td className="text-right font-bold text-success">{formatCurrency(paidAmt)}</td>
                          <td className="text-right font-bold text-destructive">{formatCurrency(balanceAmt)}</td>
                          <td className="capitalize text-xs">{student.method || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-card rounded-xl border border-dashed border-border p-20 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No Students Found</h3>
          <p className="text-muted-foreground text-sm">Try changing your filters or selecting a different course.</p>
        </div>
      )}
    </div>
  );
}