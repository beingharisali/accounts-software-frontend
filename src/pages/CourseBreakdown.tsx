import { useState, useMemo } from 'react';
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
import { Users, DollarSign, TrendingUp, Search, Download, Calendar, Clock, MapPin } from 'lucide-react';
import { exportStudentsToExcel, formatCurrency } from '@/lib/helpers';
import { toast } from 'sonner';

export default function CourseBreakdown() {
  const { students } = useStudents();
  const { batches } = useBatches();
  const { hasPermission } = useRole();
  const [selectedCourse, setSelectedCourse] = useState<string>('Digital Marketing');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const courseStudents = useMemo(() => {
    return students.filter(s => s.course === selectedCourse);
  }, [students, selectedCourse]);

  const courseBatches = useMemo(() => {
    return batches.filter(b => b.course === selectedCourse);
  }, [batches, selectedCourse]);

  const availableBatches = useMemo(() => {
    const batchSet = new Set(courseStudents.map(s => s.batch));
    return Array.from(batchSet).sort();
  }, [courseStudents]);

  const filteredStudents = useMemo(() => {
    return courseStudents
      .filter(student => {
        const matchesSearch = 
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.number.includes(searchTerm) ||
          student.cnic.includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
        const matchesBatch = batchFilter === 'all' || student.batch === batchFilter;
        
        return matchesSearch && matchesStatus && matchesBatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [courseStudents, searchTerm, statusFilter, batchFilter]);

  // Group students by batch
  const studentsByBatch = useMemo(() => {
    const grouped: Record<string, typeof filteredStudents> = {};
    filteredStudents.forEach(student => {
      if (!grouped[student.batch]) {
        grouped[student.batch] = [];
      }
      grouped[student.batch].push(student);
    });
    return grouped;
  }, [filteredStudents]);

  const stats = useMemo(() => {
    return {
      total: courseStudents.length,
      fullPaid: courseStudents.filter(s => s.status === 'FULL PAID').length,
      pending: courseStudents.filter(s => s.status === 'NEW' || s.status === 'RECOVERY').length,
      drop: courseStudents.filter(s => s.status === 'DROP').length,
      freeze: courseStudents.filter(s => s.status === 'FREEZE').length,
      totalRevenue: courseStudents.reduce((sum, s) => sum + s.feeReceived, 0),
      pendingAmount: courseStudents.reduce((sum, s) => sum + s.pending, 0),
    };
  }, [courseStudents]);

  const getBatchInfo = (batchNumber: string) => {
    return batches.find(b => b.batchNumber === batchNumber);
  };

  const getBatchStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/15 text-success';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'freeze':
        return 'bg-warning/15 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleExport = () => {
    exportStudentsToExcel(filteredStudents, `${selectedCourse.toLowerCase().replace(' ', '-')}-students`);
    toast.success('Data exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header mb-1">Course Breakdown</h1>
          <p className="text-sm text-muted-foreground">
            View student data by course with batch-wise grouping
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
              <SelectItem value="Website Development">Website Development</SelectItem>
            </SelectContent>
          </Select>
          {hasPermission('canExport') && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.total}
          icon={<Users className="w-5 h-5 text-primary" />}
          variant="primary"
        />
        <StatCard
          title="Full Paid"
          value={stats.fullPaid}
          icon={<DollarSign className="w-5 h-5 text-success" />}
          variant="success"
        />
        <StatCard
          title="Revenue Collected"
          value={formatCurrency(stats.totalRevenue)}
          icon={<TrendingUp className="w-5 h-5 text-accent" />}
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(stats.pendingAmount)}
          variant="warning"
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
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { status: 'NEW', count: courseStudents.filter(s => s.status === 'NEW').length },
          { status: 'RECOVERY', count: courseStudents.filter(s => s.status === 'RECOVERY').length },
          { status: 'FULL PAID', count: stats.fullPaid },
          { status: 'DROP', count: stats.drop },
          { status: 'FREEZE', count: stats.freeze },
        ].map(item => (
          <button
            key={item.status}
            onClick={() => setStatusFilter(statusFilter === item.status ? 'all' : item.status)}
            className={`p-4 rounded-lg border transition-all ${
              statusFilter === item.status 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-card hover:bg-muted/50'
            }`}
          >
            <StatusBadge status={item.status} />
            <p className="text-2xl font-bold mt-2">{item.count}</p>
          </button>
        ))}
      </div>

      {/* Batch-wise Student Tables */}
      {Object.entries(studentsByBatch).map(([batchNumber, batchStudents]) => {
        const batchInfo = getBatchInfo(batchNumber);
        const batchRevenue = batchStudents.reduce((sum, s) => sum + s.feeReceived, 0);
        const batchPending = batchStudents.reduce((sum, s) => sum + s.pending, 0);
        
        return (
          <div key={batchNumber} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Batch Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-semibold text-lg">{batchNumber}</h2>
                    {batchInfo && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getBatchStatusColor(batchInfo.status)}`}>
                        {batchInfo.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {batchInfo && (
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {batchInfo.trainerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {batchInfo.days}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {batchInfo.timing}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {batchInfo.room}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-xs text-muted-foreground">Students</p>
                    <p className="font-bold">{batchStudents.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Collected</p>
                    <p className="font-bold text-success">{formatCurrency(batchRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="font-bold text-warning">{formatCurrency(batchPending)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto scrollbar-thin">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Number</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th className="text-right">Total Fee</th>
                    <th className="text-right">Received</th>
                    <th className="text-right">Pending</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {batchStudents.map(student => (
                    <tr key={student.id}>
                      <td className="font-medium whitespace-nowrap">{student.date}</td>
                      <td className="font-medium">{student.name}</td>
                      <td className="whitespace-nowrap">{student.number}</td>
                      <td>{student.email}</td>
                      <td><StatusBadge status={student.status} /></td>
                      <td className="text-right">{formatCurrency(student.totalPayment)}</td>
                      <td className="text-right text-success font-medium">
                        {formatCurrency(student.feeReceived)}
                      </td>
                      <td className="text-right text-warning font-medium">
                        {formatCurrency(student.pending)}
                      </td>
                      <td>{student.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {filteredStudents.length === 0 && (
        <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
          <p className="text-muted-foreground">
            No students found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
}
