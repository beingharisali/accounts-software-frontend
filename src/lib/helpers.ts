import { Student } from "@/types/student";

/**
 * Calculate days since admission
 */
export function getDaysSinceAdmission(admissionDate: string): number {
  const admission = new Date(admissionDate);
  const today = new Date();
  const diffTime = today.getTime() - admission.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format days since admission as a readable string
 */
export function formatDaysSinceAdmission(days: number): string {
  if (days < 0) return "Future";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 60) return "1 month";
  const months = Math.floor(days / 30);
  return `${months} months`;
}

/**
 * Export data to CSV file
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  headers?: string[],
) {
  if (data.length === 0) return;

  const keys = headers || Object.keys(data[0]);
  const csvHeaders = keys.join(",");

  const csvRows = data.map((row) =>
    keys
      .map((key) => {
        const value = row[key];
        // Escape commas and quotes
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      })
      .join(","),
  );

  const csv = [csvHeaders, ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export students data to Excel-compatible CSV
 */
export function exportStudentsToExcel(
  students: Student[],
  filename: string = "students",
) {
  const headers = [
    "Date",
    "Status",
    "Name",
    "Course",
    "Batch",
    "Number",
    "Email",
    "Address",
    "CNIC",
    "Total Payment",
    "Fee Received",
    "Pending",
    "1st Install Due",
    "2nd Install Due",
    "3rd Install Due",
    "Method",
    "Payment ID",
    "Receipt ID",
    "CSR Name",
    "Officer",
    "Branch",
  ];

  const rows = students.map((s) => [
    s.date,
    s.status,
    s.name,
    s.course,
    s.batch,
    s.number,
    s.email,
    s.address,
    s.cnic,
    s.totalPayment,
    s.feeReceived,
    s.pending,
    s.firstInstalDueDate,
    s.secondInstalDueDate,
    s.thirdInstalDueDate,
    s.method,
    s.paymentId,
    s.receiptId,
    s.csrName,
    s.officer,
    s.branch,
  ]);

  const csv = [headers, ...rows].map((row) => row.join("\t")).join("\n");
  const blob = new Blob([csv], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate WhatsApp message link
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  // Clean phone number - remove spaces, dashes, etc.
  let cleanPhone = phone.replace(/[^0-9+]/g, "");

  // Convert Pakistani format (03xx) to international format (92xx)
  if (cleanPhone.startsWith("03")) {
    cleanPhone = "92" + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith("+92")) {
    cleanPhone = cleanPhone.substring(1);
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Generate recovery reminder message
 */
export function generateRecoveryMessage(student: Student): string {
  const dueDate =
    student.secondInstalDueDate || student.firstInstalDueDate || "soon";
  return `Dear ${student.name},

This is a friendly reminder from Software regarding your pending fee payment.

Course: ${student.course}
Batch: ${student.batch}
Pending Amount: Rs ${student.pending.toLocaleString()}
Due Date: ${dueDate}

Please clear your dues at your earliest convenience.

Thank you for choosing Softwares!
Accounts Team`;
}

/**
 * Format currency in PKR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}
