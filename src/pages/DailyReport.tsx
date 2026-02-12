import { useState, useMemo, useEffect } from 'react';
import { useStudents } from '@/context/StudentContext';
import { useRole } from '@/context/RoleContext';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Smartphone,
  CreditCard,
  Building,
  Banknote,
  Download,
} from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';
import { toast } from 'sonner';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DailyReport() {
  const { students } = useStudents();
  const { hasPermission } = useRole();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth())
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear())
  );

  const [backendStats, setBackendStats] = useState({
    newAdmissions: 0,
    recoveryCount: 0,
    drops: 0,
    totalCollection: 0,
    jazzCash: 0,
    easyPaisa: 0,
    bankTransfer: 0,
    cash: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const monthName = MONTHS[parseInt(selectedMonth)];
        const response = await api.get(`/students/daily-report`, {
          params: { month: monthName, year: selectedYear }
        });
        setBackendStats(response.data);
      } catch (error) {
        console.error("Error fetching daily report:", error);
      }
    };
    fetchStats();
  }, [selectedMonth, selectedYear, students]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const dailyData = useMemo(() => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data: Record<string, {
      date: string;
      displayDate: string;
      newAdmissions: number;
      recovery: number;
      drop: number;
      totalPayment: number;
      jazzCash: number;
      easypaisa: number;
      bank: number;
      cash: number;
    }> = {};

    // 1. Initialize empty days for the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dd = String(day).padStart(2, '0');
      const mm = String(month + 1).padStart(2, '0');
      const yyyy = String(year);

      const customDateKey = `${dd}-${mm}-${yyyy}`;
      const isoDate = `${yyyy}-${mm}-${dd}`;

      data[customDateKey] = {
        date: customDateKey,
        displayDate: isoDate,
        newAdmissions: 0,
        recovery: 0,
        drop: 0,
        totalPayment: 0,
        jazzCash: 0,
        easypaisa: 0,
        bank: 0,
        cash: 0,
      };
    }

    // 2. Map students to dates (Enhanced Logic)
    students.forEach(student => {
      let studentDate = student.date || student.lastPaidDate;
      if (!studentDate) return;

      let lookupKey = studentDate;

      // ✅ FIX: Normalize ISO (yyyy-mm-dd) to Custom (dd-mm-yyyy)
      // Agar date 2026-02-12 hai, to isay 12-02-2026 banayein lookup ke liye
      if (studentDate.includes('-') && studentDate.split('-')[0].length === 4) {
        const [y, m, d] = studentDate.split('-');
        lookupKey = `${d}-${m}-${y}`;
      }

      if (data[lookupKey]) {
        const amount = Number(student.feeReceived) || 0;

        if (student.status === 'NEW') data[lookupKey].newAdmissions++;
        if (student.status === 'RECOVERY') data[lookupKey].recovery++;
        if (student.status === 'DROP') data[lookupKey].drop++;

        data[lookupKey].totalPayment += amount;

        const method = student.method?.toLowerCase() || '';
        if (method === 'jazzcash') data[lookupKey].jazzCash += amount;
        if (method === 'easypaisa') data[lookupKey].easypaisa += amount;
        if (method === 'bank transfer' || method === 'bank') data[lookupKey].bank += amount;
        if (method === 'cash') data[lookupKey].cash += amount;
      }
    });

    return Object.values(data).sort((a, b) => a.displayDate.localeCompare(b.displayDate));
  }, [students, selectedMonth, selectedYear]);

  const monthlyTotals = useMemo(() => {
    return dailyData.reduce((acc, day) => ({
      newAdmissions: acc.newAdmissions + day.newAdmissions,
      recovery: acc.recovery + day.recovery,
      drop: acc.drop + day.drop,
      totalPayment: acc.totalPayment + day.totalPayment,
      jazzCash: acc.jazzCash + day.jazzCash,
      easypaisa: acc.easypaisa + day.easypaisa,
      bank: acc.bank + day.bank,
      cash: acc.cash + day.cash,
    }), {
      newAdmissions: 0, recovery: 0, drop: 0, totalPayment: 0,
      jazzCash: 0, easypaisa: 0, bank: 0, cash: 0,
    });
  }, [dailyData]);

  const handleExport = () => {
    const headers = ['Date', 'New Admissions', 'Recovery', 'Drop', 'Total Payment', 'JazzCash', 'Easypaisa', 'Bank', 'Cash'];
    const rows = dailyData.map(d => [
      d.date, d.newAdmissions, d.recovery, d.drop, d.totalPayment,
      d.jazzCash, d.easypaisa, d.bank, d.cash
    ]);
    rows.push(['Total', monthlyTotals.newAdmissions, monthlyTotals.recovery, monthlyTotals.drop,
      monthlyTotals.totalPayment, monthlyTotals.jazzCash, monthlyTotals.easypaisa, monthlyTotals.bank, monthlyTotals.cash]);

    const csv = [headers, ...rows].map(row => row.join('\t')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-report-${MONTHS[parseInt(selectedMonth)]}-${selectedYear}.xls`;
    link.click();
    toast.success('Report exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header mb-1">Daily Report</h1>
          <p className="text-sm text-muted-foreground">
            View daily admissions, recovery, and payment breakdown
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={index} value={String(index)}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="New Admissions" value={backendStats.newAdmissions} icon={<Users className="w-5 h-5 text-primary" />} variant="primary" />
        <StatCard title="Recovery" value={backendStats.recoveryCount} icon={<TrendingUp className="w-5 h-5 text-success" />} variant="success" />
        <StatCard title="Drops" value={backendStats.drops} icon={<TrendingDown className="w-5 h-5 text-destructive" />} variant="destructive" />
        <StatCard title="Total Collection" value={formatCurrency(backendStats.totalCollection)} icon={<DollarSign className="w-5 h-5 text-accent" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="JazzCash" value={formatCurrency(backendStats.jazzCash)} icon={<Smartphone className="w-5 h-5 text-warning" />} />
        <StatCard title="Easypaisa" value={formatCurrency(backendStats.easyPaisa)} icon={<CreditCard className="w-5 h-5 text-success" />} />
        <StatCard title="Bank Transfer" value={formatCurrency(backendStats.bankTransfer)} icon={<Building className="w-5 h-5 text-primary" />} />
        <StatCard title="Cash" value={formatCurrency(backendStats.cash)} icon={<Banknote className="w-5 h-5 text-accent" />} />
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="section-header mb-0">
            {MONTHS[parseInt(selectedMonth)]} {selectedYear} - Daily Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th className="text-center">New Admissions</th>
                <th className="text-center">Recovery</th>
                <th className="text-center">Drop</th>
                <th className="text-right">Total Payment</th>
                <th className="text-right">JazzCash</th>
                <th className="text-right">Easypaisa</th>
                <th className="text-right">Bank</th>
                <th className="text-right">Cash</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map(day => {
                const hasData = day.newAdmissions > 0 || day.recovery > 0 || day.drop > 0 || day.totalPayment > 0;
                return (
                  <tr key={day.date} className={!hasData ? 'opacity-50' : ''}>
                    <td className="font-medium text-nowrap">
                      {new Date(day.displayDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="text-center">
                      {day.newAdmissions > 0 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">{day.newAdmissions}</span>
                      )}
                    </td>
                    <td className="text-center">
                      {day.recovery > 0 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/10 text-success text-xs font-medium">{day.recovery}</span>
                      )}
                    </td>
                    <td className="text-center">
                      {day.drop > 0 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-destructive/10 text-destructive text-xs font-medium">{day.drop}</span>
                      )}
                    </td>
                    <td className="text-right font-medium">{day.totalPayment > 0 ? formatCurrency(day.totalPayment) : '-'}</td>
                    <td className="text-right text-sm">{day.jazzCash > 0 ? formatCurrency(day.jazzCash) : '-'}</td>
                    <td className="text-right text-sm">{day.easypaisa > 0 ? formatCurrency(day.easypaisa) : '-'}</td>
                    <td className="text-right text-sm">{day.bank > 0 ? formatCurrency(day.bank) : '-'}</td>
                    <td className="text-right text-sm">{day.cash > 0 ? formatCurrency(day.cash) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 font-semibold border-t">
                <td>Total</td>
                <td className="text-center">{monthlyTotals.newAdmissions}</td>
                <td className="text-center">{monthlyTotals.recovery}</td>
                <td className="text-center">{monthlyTotals.drop}</td>
                <td className="text-right">{formatCurrency(monthlyTotals.totalPayment)}</td>
                <td className="text-right">{formatCurrency(monthlyTotals.jazzCash)}</td>
                <td className="text-right">{formatCurrency(monthlyTotals.easypaisa)}</td>
                <td className="text-right">{formatCurrency(monthlyTotals.bank)}</td>
                <td className="text-right">{formatCurrency(monthlyTotals.cash)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}