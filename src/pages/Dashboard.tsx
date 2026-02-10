import { useStudents } from '@/context/StudentContext';
import { useRole } from '@/context/RoleContext';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  ArrowRight,
  CalendarCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/helpers';
import { useMemo } from 'react';

export default function Dashboard() {
  const { students } = useStudents();
  const { currentUser, hasPermission } = useRole();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayStudents = students.filter(s => s.date === today);
    
    return {
      totalStudents: students.length,
      totalPayment: students.reduce((sum, s) => sum + s.feeReceived, 0),
      pendingAmount: students.reduce((sum, s) => sum + s.pending, 0),
      newAdmissions: students.filter(s => s.status === 'NEW').length,
      recoveryCount: students.filter(s => s.status === 'RECOVERY').length,
      dropCount: students.filter(s => s.status === 'DROP').length,
      fullPaidCount: students.filter(s => s.status === 'FULL PAID').length,
      todayAdmissions: todayStudents.filter(s => s.status === 'NEW').length,
      todayCollection: todayStudents.reduce((sum, s) => sum + s.feeReceived, 0),
    };
  }, [students]);

  const recentStudents = [...students]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header mb-0">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {currentUser?.name}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Today's Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-sm">Today's Admissions</p>
              <p className="text-3xl font-bold mt-1">{stats.todayAdmissions}</p>
            </div>
            <CalendarCheck className="w-10 h-10 text-primary-foreground/50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-success to-success/80 rounded-xl p-6 text-success-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success-foreground/80 text-sm">Today's Collection</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.todayCollection)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-success-foreground/50" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users className="w-5 h-5 text-primary" />}
          variant="primary"
        />
        <StatCard
          title="Total Collection"
          value={formatCurrency(stats.totalPayment)}
          icon={<DollarSign className="w-5 h-5 text-success" />}
          variant="success"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(stats.pendingAmount)}
          icon={<AlertCircle className="w-5 h-5 text-warning" />}
          variant="warning"
        />
        <StatCard
          title="Recovery Cases"
          value={stats.recoveryCount}
          icon={<TrendingUp className="w-5 h-5 text-accent" />}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Status Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">New Admissions</span>
              <StatusBadge status="NEW" />
              <span className="font-semibold">{stats.newAdmissions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Full Paid</span>
              <StatusBadge status="FULL PAID" />
              <span className="font-semibold">{stats.fullPaidCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Recovery</span>
              <StatusBadge status="RECOVERY" />
              <span className="font-semibold">{stats.recoveryCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dropped</span>
              <StatusBadge status="DROP" />
              <span className="font-semibold">{stats.dropCount}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Course Distribution</h3>
          <div className="space-y-3">
            {['Digital Marketing', 'Website Development'].map(course => {
              const count = students.filter(s => s.course === course).length;
              const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
              return (
                <div key={course}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{course}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="stat-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {hasPermission('canAdd') && (
              <Link 
                to="/sheet-update" 
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-sm font-medium">Add New Entries</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {hasPermission('canViewAllReports') && (
              <Link 
                to="/daily-report" 
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-sm font-medium">View Daily Report</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link 
              to="/recovery" 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <span className="text-sm font-medium">Check Recovery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/schedule" 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <span className="text-sm font-medium">View Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="section-header mb-0">Recent Entries</h2>
          <Link to="/master-entry" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Course</th>
                <th>Status</th>
                <th>Fee Received</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map(student => (
                <tr key={student.id}>
                  <td className="font-medium">{student.date}</td>
                  <td>{student.name}</td>
                  <td>{student.course}</td>
                  <td><StatusBadge status={student.status} /></td>
                  <td className="text-success font-medium">
                    {formatCurrency(student.feeReceived)}
                  </td>
                  <td className="text-warning font-medium">
                    {formatCurrency(student.pending)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
