import { useState, useRef } from 'react';
import { useStudents } from '@/context/StudentContext';
import { useRole } from '@/context/RoleContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Printer, GraduationCap, Download, FileText } from 'lucide-react';
import { Student } from '@/types/student';
import { formatCurrency } from '@/lib/helpers';

export default function PrintReceipt() {
  const { students } = useStudents();
  const { hasPermission } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const searchResults = searchTerm.length >= 2
    ? students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.number.includes(searchTerm) ||
        s.cnic.includes(searchTerm)
      )
    : [];

  const handlePrint = () => {
    if (!receiptRef.current) return;
    
    const printContent = receiptRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${selectedStudent?.name}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
              
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Inter', sans-serif; 
                padding: 20px;
                color: #1a1a2e;
              }
              .receipt {
                max-width: 400px;
                margin: 0 auto;
                border: 2px solid #1a56db;
                border-radius: 12px;
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%);
                color: white;
                padding: 24px;
                text-align: center;
              }
              .logo {
                width: 60px;
                height: 60px;
                background: white;
                border-radius: 12px;
                margin: 0 auto 12px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .company-name {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 4px;
              }
              .tagline {
                font-size: 12px;
                opacity: 0.9;
              }
              .receipt-title {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid rgba(255,255,255,0.2);
                font-size: 14px;
                font-weight: 600;
              }
              .body {
                padding: 24px;
              }
              .section {
                margin-bottom: 20px;
              }
              .section-title {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #6b7280;
                margin-bottom: 8px;
                font-weight: 600;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .label {
                color: #6b7280;
                font-size: 13px;
              }
              .value {
                font-weight: 500;
                font-size: 13px;
              }
              .amount-section {
                background: #f3f4f6;
                border-radius: 8px;
                padding: 16px;
                margin-top: 20px;
              }
              .amount-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
              }
              .amount-row.total {
                border-top: 2px solid #1a56db;
                padding-top: 12px;
                margin-top: 12px;
                margin-bottom: 0;
              }
              .amount-label {
                font-size: 13px;
                color: #374151;
              }
              .amount-value {
                font-weight: 600;
                font-size: 14px;
              }
              .amount-row.total .amount-value {
                color: #1a56db;
                font-size: 18px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 11px;
                color: #6b7280;
              }
              .receipt-id {
                font-family: monospace;
                background: #e5e7eb;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
              }
              @media print {
                body { padding: 0; }
                .receipt { border: 2px solid #1a56db; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  if (!hasPermission('canPrintReceipts')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            You don't have permission to print receipts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header mb-1">Print Receipt</h1>
        <p className="text-sm text-muted-foreground">
          Search for a student and generate a payment receipt
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or CNIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {searchResults.slice(0, 5).map(student => (
              <button
                key={student.id}
                onClick={() => {
                  setSelectedStudent(student);
                  setSearchTerm('');
                }}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-muted-foreground">
                  {student.number} • {student.cnic}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Preview */}
      {selectedStudent && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Receipt */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <div ref={receiptRef}>
              <div className="receipt max-w-sm mx-auto border-2 border-primary rounded-xl overflow-hidden">
                {/* Header */}
                <div className="header bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 text-center">
                  <div className="logo w-14 h-14 bg-card rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="company-name text-xl font-bold">Ideoversity</h2>
                  <p className="tagline text-xs opacity-90">Learn. Grow. Succeed.</p>
                  <div className="receipt-title mt-3 pt-3 border-t border-primary-foreground/20 text-sm font-semibold">
                    PAYMENT RECEIPT
                  </div>
                </div>

                {/* Body */}
                <div className="body p-5 space-y-5">
                  {/* Student Info */}
                  <div className="section">
                    <h4 className="section-title text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                      Student Information
                    </h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Name', value: selectedStudent.name },
                        { label: 'Phone', value: selectedStudent.number },
                        { label: 'CNIC', value: selectedStudent.cnic },
                        { label: 'Email', value: selectedStudent.email },
                        { label: 'Address', value: selectedStudent.address },
                      ].map(item => (
                        <div key={item.label} className="info-row flex justify-between py-1.5 border-b border-border last:border-0">
                          <span className="label text-muted-foreground text-sm">{item.label}</span>
                          <span className="value font-medium text-sm">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="section">
                    <h4 className="section-title text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                      Course Details
                    </h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Course', value: selectedStudent.course },
                        { label: 'Batch', value: selectedStudent.batch },
                      ].map(item => (
                        <div key={item.label} className="info-row flex justify-between py-1.5 border-b border-border last:border-0">
                          <span className="label text-muted-foreground text-sm">{item.label}</span>
                          <span className="value font-medium text-sm">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="amount-section bg-muted/50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="amount-row flex justify-between">
                        <span className="amount-label text-sm text-foreground/70">Total Fee</span>
                        <span className="amount-value font-semibold">{formatCurrency(selectedStudent.totalPayment)}</span>
                      </div>
                      <div className="amount-row flex justify-between">
                        <span className="amount-label text-sm text-foreground/70">Amount Paid</span>
                        <span className="amount-value font-semibold text-success">{formatCurrency(selectedStudent.feeReceived)}</span>
                      </div>
                      <div className="amount-row total flex justify-between border-t-2 border-primary pt-3 mt-3">
                        <span className="amount-label text-sm font-medium">Balance Due</span>
                        <span className="amount-value text-lg font-bold text-primary">{formatCurrency(selectedStudent.pending)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Receipt ID */}
                  <div className="text-center">
                    <span className="receipt-id font-mono bg-muted px-3 py-1 rounded text-xs">
                      Receipt: {selectedStudent.receiptId}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="footer text-center p-4 border-t border-border text-xs text-muted-foreground">
                  <p>Date: {selectedStudent.date}</p>
                  <p className="mt-1">Thank you for choosing Ideoversity!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
              <h3 className="section-header">Receipt Actions</h3>
              <div className="space-y-3">
                <Button onClick={handlePrint} className="w-full">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedStudent(null)}
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
              <h3 className="section-header">Payment History</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{formatCurrency(selectedStudent.feeReceived)}</p>
                      <p className="text-xs text-muted-foreground">{selectedStudent.lastPaidDate || selectedStudent.date}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-success/10 text-success rounded">
                      {selectedStudent.method}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedStudent && (
        <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center">
          <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Search for a Student</h3>
          <p className="text-muted-foreground">
            Enter a name, phone number, or CNIC to find a student and generate their receipt
          </p>
        </div>
      )}
    </div>
  );
}
