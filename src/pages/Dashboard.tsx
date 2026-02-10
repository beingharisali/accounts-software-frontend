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
    // Local date handling for accuracy
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const todayStudents = students.filter(s => s.date === today);

    return {
      totalStudents: students.length,
      totalPayment: students.reduce((sum, s) => sum + (Number(s.feeReceived) || 0), 0),
      pendingAmount: students.reduce((sum, s) => sum + (Number(s.pending) || 0), 0),
      newAdmissions: students.filter(s => s.status === 'NEW').length,
      recoveryCount: students.filter(s => s.status === 'RECOVERY').length,
      dropCount: students.filter(s => s.status === 'DROP').length,
      fullPaidCount: students.filter(s => s.status === 'FULL PAID').length,
      todayAdmissions: todayStudents.filter(s => s.status === 'NEW').length,
      todayCollection: todayStudents.reduce((sum, s) => sum + (Number(s.feeReceived) || 0), 0),
    };
  }, [students]);

  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [students]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-0">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{currentUser?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg border text-sm font-medium text-muted-foreground">
          <CalendarCheck className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Today's High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg shadow-indigo-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Today's New Admissions</p>
              <p className="text-4xl font-extrabold mt-1">{stats.todayAdmissions}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Today's Collection</p>
              <p className="text-4xl font-extrabold mt-1">{formatCurrency(stats.todayCollection)}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users className="w-5 h-5" />}
          variant="primary"
        />
        <StatCard
          title="Total Collection"
          value={formatCurrency(stats.totalPayment)}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(stats.pendingAmount)}
          icon={<AlertCircle className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="Recovery Cases"
          value={stats.recoveryCount}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-card p-5 rounded-xl border shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Status Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'New Admissions', status: 'NEW', count: stats.newAdmissions },
              { label: 'Full Paid', status: 'FULL PAID', count: stats.fullPaidCount },
              { label: 'Recovery', status: 'RECOVERY', count: stats.recoveryCount },
              { label: 'Dropped Students', status: 'DROP', count: stats.dropCount },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between group">
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                <div className="flex items-center gap-4">
                  <StatusBadge status={item.status as any} />
                  <span className="font-bold text-sm w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Progress Bars */}
        <div className="bg-card p-5 rounded-xl border shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Course Distribution</h3>
          <div className="space-y-6">
            {['Digital Marketing', 'Website Development'].map((course, index) => {
              const count = students.filter(s => s.course === course).length;
              const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
              const colors = index === 0 ? 'bg-indigo-500' : 'bg-orange-500';

              return (
                <div key={course}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold">{course}</span>
                    <span className="text-muted-foreground font-mono">{count}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Access Actions */}
        <div className="bg-card p-5 rounded-xl border shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h3>
          <div className="grid gap-2">
            {hasPermission('canAdd') && (
              <Link
                to="/sheet-update"
                className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all group border border-indigo-100"
              >
                <span className="text-sm font-bold">New Admission</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link
              to="/recovery"
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border"
            >
              <span className="text-sm font-medium">Recovery Management</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/daily-report"
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border"
            >
              <span className="text-sm font-medium">Daily Financial Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Entries Section */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Recent Transactions</h2>
          <Link to="/master-entry" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            VIEW ALL ENTRIES <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 text-right font-semibold">Received</th>
                <th className="p-4 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentStudents.length > 0 ? (
                recentStudents.map(student => (
                  <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 text-muted-foreground">{student.date}</td>
                    <td className="p-4 font-bold text-foreground">{student.name}</td>
                    <td className="p-4"><StatusBadge status={student.status} /></td>
                    <td className="p-4 text-right text-emerald-600 font-bold">{formatCurrency(student.feeReceived)}</td>
                    <td className="p-4 text-right text-orange-600 font-bold">{formatCurrency(student.pending)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                    No recent data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}