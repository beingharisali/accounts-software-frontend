import { useState, useMemo } from 'react';
import { useStudents } from '@/context/StudentContext';
import { useRole } from '@/context/RoleContext';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Users, DollarSign, TrendingDown, TrendingUp, Download, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';
import { toast } from 'sonner';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CHART_COLORS = {
  primary: 'hsl(217, 91%, 45%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 84%, 60%)',
  accent: 'hsl(174, 72%, 40%)',
};

export default function MonthlyReport() {
  const { students } = useStudents();
  const { hasPermission } = useRole();
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const monthlyData = useMemo(() => {
    const year = parseInt(selectedYear);
    
    return MONTHS.map((month, index) => {
      const monthStudents = students.filter(s => {
        const date = new Date(s.date);
        return date.getMonth() === index && date.getFullYear() === year;
      });

      return {
        month: month.substring(0, 3),
        fullMonth: month,
        admissions: monthStudents.filter(s => s.status === 'NEW').length,
        recovery: monthStudents.reduce((sum, s) => sum + s.feeReceived, 0),
        drops: monthStudents.filter(s => s.status === 'DROP').length,
        totalStudents: monthStudents.length,
        pending: monthStudents.reduce((sum, s) => sum + s.pending, 0),
      };
    });
  }, [students, selectedYear]);

  const yearlyTotals = useMemo(() => {
    return monthlyData.reduce((acc, month) => ({
      admissions: acc.admissions + month.admissions,
      recovery: acc.recovery + month.recovery,
      drops: acc.drops + month.drops,
      totalStudents: acc.totalStudents + month.totalStudents,
      pending: acc.pending + month.pending,
    }), { admissions: 0, recovery: 0, drops: 0, totalStudents: 0, pending: 0 });
  }, [monthlyData]);

  const statusDistribution = useMemo(() => {
    const year = parseInt(selectedYear);
    const yearStudents = students.filter(s => new Date(s.date).getFullYear() === year);
    
    return [
      { name: 'Full Paid', value: yearStudents.filter(s => s.status === 'FULL PAID').length, color: CHART_COLORS.success },
      { name: 'New', value: yearStudents.filter(s => s.status === 'NEW').length, color: CHART_COLORS.primary },
      { name: 'Recovery', value: yearStudents.filter(s => s.status === 'RECOVERY').length, color: CHART_COLORS.warning },
      { name: 'Drop', value: yearStudents.filter(s => s.status === 'DROP').length, color: CHART_COLORS.destructive },
      { name: 'Freeze', value: yearStudents.filter(s => s.status === 'FREEZE').length, color: '#9ca3af' },
    ].filter(item => item.value > 0);
  }, [students, selectedYear]);

  const courseDistribution = useMemo(() => {
    const year = parseInt(selectedYear);
    const yearStudents = students.filter(s => new Date(s.date).getFullYear() === year);
    
    return [
      { name: 'Digital Marketing', value: yearStudents.filter(s => s.course === 'Digital Marketing').length, color: CHART_COLORS.primary },
      { name: 'Website Development', value: yearStudents.filter(s => s.course === 'Website Development').length, color: CHART_COLORS.accent },
    ].filter(item => item.value > 0);
  }, [students, selectedYear]);

  const handleExport = () => {
    const headers = ['Month', 'Admissions', 'Revenue', 'Drops', 'Total Students', 'Pending'];
    const rows = monthlyData.map(m => [
      m.fullMonth, m.admissions, m.recovery, m.drops, m.totalStudents, m.pending
    ]);
    rows.push(['Total', yearlyTotals.admissions, yearlyTotals.recovery, yearlyTotals.drops, 
      yearlyTotals.totalStudents, yearlyTotals.pending]);
    
    const csv = [headers, ...rows].map(row => row.join('\t')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monthly-report-${selectedYear}.xls`;
    link.click();
    toast.success('Report exported successfully');
  };

  if (!hasPermission('canViewAllReports')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            You don't have permission to view reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header mb-1">Monthly Report</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive yearly overview with charts and statistics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
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

      {/* Yearly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Admissions"
          value={yearlyTotals.admissions}
          icon={<Users className="w-5 h-5 text-primary" />}
          variant="primary"
        />
        <StatCard
          title="Total Collection"
          value={formatCurrency(yearlyTotals.recovery)}
          icon={<DollarSign className="w-5 h-5 text-success" />}
          variant="success"
        />
        <StatCard
          title="Total Drops"
          value={yearlyTotals.drops}
          icon={<TrendingDown className="w-5 h-5 text-destructive" />}
          variant="destructive"
        />
        <StatCard
          title="Active Students"
          value={yearlyTotals.totalStudents - yearlyTotals.drops}
          icon={<TrendingUp className="w-5 h-5 text-accent" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Admissions Bar Chart */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="section-header">Monthly Admissions</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(label) => {
                    const month = monthlyData.find(m => m.month === label);
                    return month?.fullMonth || label;
                  }}
                />
                <Bar 
                  dataKey="admissions" 
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  name="Admissions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Line Chart */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="section-header">Revenue Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line 
                  type="monotone"
                  dataKey="recovery" 
                  stroke={CHART_COLORS.success}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.success, strokeWidth: 2 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="section-header">Status Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Distribution */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="section-header">Course Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {courseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="section-header mb-0">Monthly Breakdown - {selectedYear}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th className="text-center">Admissions</th>
                <th className="text-right">Revenue</th>
                <th className="text-center">Drops</th>
                <th className="text-center">Total Students</th>
                <th className="text-right">Pending</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(month => (
                <tr key={month.month}>
                  <td className="font-medium">{month.fullMonth}</td>
                  <td className="text-center">
                    {month.admissions > 0 && (
                      <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-primary/10 text-primary text-sm font-medium">
                        {month.admissions}
                      </span>
                    )}
                  </td>
                  <td className="text-right font-medium text-success">
                    {month.recovery > 0 ? formatCurrency(month.recovery) : '-'}
                  </td>
                  <td className="text-center">
                    {month.drops > 0 && (
                      <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-destructive/10 text-destructive text-sm font-medium">
                        {month.drops}
                      </span>
                    )}
                  </td>
                  <td className="text-center">{month.totalStudents || '-'}</td>
                  <td className="text-right font-medium text-warning">
                    {month.pending > 0 ? formatCurrency(month.pending) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 font-semibold">
                <td>Total</td>
                <td className="text-center">{yearlyTotals.admissions}</td>
                <td className="text-right text-success">{formatCurrency(yearlyTotals.recovery)}</td>
                <td className="text-center">{yearlyTotals.drops}</td>
                <td className="text-center">{yearlyTotals.totalStudents}</td>
                <td className="text-right text-warning">{formatCurrency(yearlyTotals.pending)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
