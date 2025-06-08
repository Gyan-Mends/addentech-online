// Report Export Utilities
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class ReportExporter {
  
  // Export staff report to PDF
  static exportStaffReportToPDF(report: any, period: string, year: number) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.capitalizeFirst(period)} Staff Report - ${year}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Employee Info
    doc.setFontSize(16);
    doc.text(`Employee: ${report.user.name}`, 20, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Email: ${report.user.email}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Role: ${report.user.role.replace('_', ' ').toUpperCase()}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Department: ${report.user.department || 'N/A'}`, 20, yPosition);
    yPosition += 15;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, yPosition);
    yPosition += 10;

    const summaryData = [
      ['Total Activities', report.summary.totalActivities.toString()],
      ['Total Hours Logged', report.summary.totalHours.toFixed(1) + 'h'],
      ['Tasks Completed', (report.summary.completedTasks || 0).toString()],
      ['Total Assigned Tasks', (report.summary.totalAssignedTasks || 0).toString()]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Task Status Breakdown
    if (report.summary.taskStatusBreakdown && Object.keys(report.summary.taskStatusBreakdown).length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Task Status Breakdown', 20, yPosition);
      yPosition += 10;

      const statusData = Object.entries(report.summary.taskStatusBreakdown).map(([status, count]: [string, any]) => [
        status.replace('_', ' ').toUpperCase(),
        count.toString()
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Status', 'Count']],
        body: statusData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [52, 152, 219] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Period Breakdown
    if (report.periodBreakdown && Object.keys(report.periodBreakdown).length > 0) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${this.capitalizeFirst(period)} Performance`, 20, yPosition);
      yPosition += 10;

      const periodData = Object.entries(report.periodBreakdown).map(([periodName, data]: [string, any]) => [
        periodName,
        data.totalActivities.toString(),
        data.totalHours.toFixed(1) + 'h',
        (data.assignedTasks || 0).toString()
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Period', 'Activities', 'Hours', 'Tasks']],
        body: periodData,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [46, 204, 113] }
      });
    }

    // Add timestamp
    const timestamp = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on: ${timestamp}`, 20, doc.internal.pageSize.height - 10);

    // Save the PDF
    const filename = `${report.user.name.replace(/\s+/g, '_')}_${period}_report_${year}.pdf`;
    doc.save(filename);
  }

  // Export staff report to CSV
  static exportStaffReportToCSV(report: any, period: string, year: number) {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Employee Name', report.user.name],
      ['Email', report.user.email],
      ['Role', report.user.role.replace('_', ' ').toUpperCase()],
      ['Department', report.user.department || 'N/A'],
      ['Report Period', this.capitalizeFirst(period)],
      ['Report Year', year.toString()],
      ['Total Activities', report.summary.totalActivities.toString()],
      ['Total Hours Logged', report.summary.totalHours.toFixed(1) + 'h'],
      ['Tasks Completed', (report.summary.completedTasks || 0).toString()],
      ['Total Assigned Tasks', (report.summary.totalAssignedTasks || 0).toString()]
    ];

    // Add task status breakdown
    if (report.summary.taskStatusBreakdown && Object.keys(report.summary.taskStatusBreakdown).length > 0) {
      rows.push(['', '']); // Empty row for separation
      rows.push(['Task Status Breakdown', '']);
      Object.entries(report.summary.taskStatusBreakdown).forEach(([status, count]: [string, any]) => {
        rows.push([status.replace('_', ' ').toUpperCase(), count.toString()]);
      });
    }

    // Add period breakdown
    if (report.periodBreakdown && Object.keys(report.periodBreakdown).length > 0) {
      rows.push(['', '']); // Empty row for separation
      rows.push(['Period Breakdown', '']);
      rows.push(['Period', 'Activities', 'Hours', 'Tasks']);
      Object.entries(report.periodBreakdown).forEach(([periodName, data]: [string, any]) => {
        rows.push([
          periodName,
          data.totalActivities.toString(),
          data.totalHours.toFixed(1) + 'h',
          (data.assignedTasks || 0).toString()
        ]);
      });
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.user.name.replace(/\s+/g, '_')}_${period}_report_${year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export department report to PDF
  static exportDepartmentReportToPDF(report: any, period: string, year: number) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.capitalizeFirst(period)} Department Report - ${year}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Department Info
    doc.setFontSize(16);
    doc.text(`Department: ${report.department}`, 20, yPosition);
    yPosition += 15;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, yPosition);
    yPosition += 10;

    const summaryData = [
      ['Total Activities', report.summary.totalActivities.toString()],
      ['Total Hours Logged', report.summary.totalHours.toFixed(1) + 'h'],
      ['Tasks Completed', (report.summary.completedTasks || 0).toString()],
      ['Total Assigned Tasks', (report.summary.totalAssignedTasks || 0).toString()]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Task Status Breakdown
    if (report.summary.taskStatusBreakdown && Object.keys(report.summary.taskStatusBreakdown).length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Task Status Breakdown', 20, yPosition);
      yPosition += 10;

      const statusData = Object.entries(report.summary.taskStatusBreakdown).map(([status, count]: [string, any]) => [
        status.replace('_', ' ').toUpperCase(),
        count.toString()
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Status', 'Count']],
        body: statusData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [52, 152, 219] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Activity Breakdown
    if (report.summary.activityBreakdown && report.summary.activityBreakdown.length > 0) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Activity Breakdown', 20, yPosition);
      yPosition += 10;

      const activityData = report.summary.activityBreakdown.map((activity: any) => [
        activity._id.replace('_', ' ').toUpperCase(),
        activity.count.toString(),
        activity.totalHours ? activity.totalHours.toFixed(1) + 'h' : '0h'
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Activity Type', 'Count', 'Hours']],
        body: activityData,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [155, 89, 182] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Period Breakdown
    if (report.periodBreakdown && Object.keys(report.periodBreakdown).length > 0) {
      // Check if we need a new page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${this.capitalizeFirst(period)} Performance`, 20, yPosition);
      yPosition += 10;

      const periodData = Object.entries(report.periodBreakdown).map(([periodName, data]: [string, any]) => [
        periodName,
        data.totalActivities.toString(),
        data.totalHours.toFixed(1) + 'h',
        (data.assignedTasks || 0).toString()
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Period', 'Activities', 'Hours', 'Tasks']],
        body: periodData,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [46, 204, 113] }
      });
    }

    // Add timestamp
    const timestamp = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on: ${timestamp}`, 20, doc.internal.pageSize.height - 10);

    // Save the PDF
    const filename = `${report.department.replace(/\s+/g, '_')}_department_${period}_report_${year}.pdf`;
    doc.save(filename);
  }

  // Export department report to CSV
  static exportDepartmentReportToCSV(report: any, period: string, year: number) {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Department', report.department],
      ['Report Period', this.capitalizeFirst(period)],
      ['Report Year', year.toString()],
      ['Total Activities', report.summary.totalActivities.toString()],
      ['Total Hours Logged', report.summary.totalHours.toFixed(1) + 'h'],
      ['Tasks Completed', (report.summary.completedTasks || 0).toString()],
      ['Total Assigned Tasks', (report.summary.totalAssignedTasks || 0).toString()]
    ];

    // Add task status breakdown
    if (report.summary.taskStatusBreakdown && Object.keys(report.summary.taskStatusBreakdown).length > 0) {
      rows.push(['', '']); // Empty row for separation
      rows.push(['Task Status Breakdown', '']);
      Object.entries(report.summary.taskStatusBreakdown).forEach(([status, count]: [string, any]) => {
        rows.push([status.replace('_', ' ').toUpperCase(), count.toString()]);
      });
    }

    // Add activity breakdown
    if (report.summary.activityBreakdown && report.summary.activityBreakdown.length > 0) {
      rows.push(['', '']); // Empty row for separation
      rows.push(['Activity Breakdown', '']);
      rows.push(['Activity Type', 'Count', 'Total Hours']);
      report.summary.activityBreakdown.forEach((activity: any) => {
        rows.push([
          activity._id.replace('_', ' ').toUpperCase(),
          activity.count.toString(),
          activity.totalHours ? activity.totalHours.toFixed(1) + 'h' : '0h'
        ]);
      });
    }

    // Add period breakdown
    if (report.periodBreakdown && Object.keys(report.periodBreakdown).length > 0) {
      rows.push(['', '']); // Empty row for separation
      rows.push(['Period Breakdown', '']);
      rows.push(['Period', 'Activities', 'Hours', 'Tasks']);
      Object.entries(report.periodBreakdown).forEach(([periodName, data]: [string, any]) => {
        rows.push([
          periodName,
          data.totalActivities.toString(),
          data.totalHours.toFixed(1) + 'h',
          (data.assignedTasks || 0).toString()
        ]);
      });
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.department.replace(/\s+/g, '_')}_department_${period}_report_${year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export report to JSON
  static exportReportToJSON(report: any, period: string, year: number, type: 'staff' | 'department') {
    const jsonData = {
      reportType: type,
      period,
      year,
      generatedAt: new Date().toISOString(),
      data: report
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const filename = type === 'staff' 
      ? `${report.user.name.replace(/\s+/g, '_')}_${period}_report_${year}.json`
      : `${report.department.replace(/\s+/g, '_')}_department_${period}_report_${year}.json`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Open printable report in new window
  static openPrintableReport(report: any, period: string, year: number, type: 'staff' | 'department') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the report');
      return;
    }

    const htmlContent = this.generatePrintableHTML(report, period, year, type);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }

  // Generate HTML for printable report
  private static generatePrintableHTML(report: any, period: string, year: number, type: 'staff' | 'department'): string {
    const title = type === 'staff' 
      ? `${this.capitalizeFirst(period)} Staff Report - ${year}`
      : `${this.capitalizeFirst(period)} Department Report - ${year}`;

    const headerInfo = type === 'staff' 
      ? `
        <div class="header-info">
          <h2>Employee Information</h2>
          <p><strong>Name:</strong> ${report.user.name}</p>
          <p><strong>Email:</strong> ${report.user.email}</p>
          <p><strong>Role:</strong> ${report.user.role.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Department:</strong> ${report.user.department || 'N/A'}</p>
        </div>
      `
      : `
        <div class="header-info">
          <h2>Department Information</h2>
          <p><strong>Department:</strong> ${report.department}</p>
        </div>
      `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header-info {
              margin: 20px 0;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .summary-section {
              margin: 30px 0;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin: 20px 0;
            }
            .summary-card {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              text-align: center;
              border: 1px solid #ddd;
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              color: #333;
              font-size: 24px;
            }
            .summary-card p {
              margin: 0;
              color: #666;
            }
            .breakdown-section {
              margin: 30px 0;
            }
            .breakdown-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .breakdown-table th,
            .breakdown-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .breakdown-table th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
          </div>

          ${headerInfo}

          <div class="summary-section">
            <h2>Summary</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <h3>${report.summary.totalActivities}</h3>
                <p>Total Activities</p>
              </div>
              <div class="summary-card">
                <h3>${report.summary.totalHours.toFixed(1)}h</h3>
                <p>Hours Logged</p>
              </div>
              <div class="summary-card">
                <h3>${report.summary.completedTasks || 0}</h3>
                <p>Tasks Completed</p>
              </div>
              <div class="summary-card">
                <h3>${report.summary.totalAssignedTasks || 0}</h3>
                <p>Assigned Tasks</p>
              </div>
            </div>
          </div>

          ${report.summary.taskStatusBreakdown && Object.keys(report.summary.taskStatusBreakdown).length > 0 ? `
          <div class="breakdown-section">
            <h2>Task Status Breakdown</h2>
            <table class="breakdown-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(report.summary.taskStatusBreakdown).map(([status, count]: [string, any]) => `
                  <tr>
                    <td>${status.replace('_', ' ').toUpperCase()}</td>
                    <td>${count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${report.summary.activityBreakdown && report.summary.activityBreakdown.length > 0 ? `
          <div class="breakdown-section">
            <h2>Activity Breakdown</h2>
            <table class="breakdown-table">
              <thead>
                <tr>
                  <th>Activity Type</th>
                  <th>Count</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                ${report.summary.activityBreakdown.map((activity: any) => `
                  <tr>
                    <td>${activity._id.replace('_', ' ').toUpperCase()}</td>
                    <td>${activity.count}</td>
                    <td>${activity.totalHours ? activity.totalHours.toFixed(1) + 'h' : '0h'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${report.periodBreakdown && Object.keys(report.periodBreakdown).length > 0 ? `
          <div class="breakdown-section">
            <h2>${this.capitalizeFirst(period)} Performance</h2>
            <table class="breakdown-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Activities</th>
                  <th>Hours</th>
                  <th>Tasks</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(report.periodBreakdown).map(([periodName, data]: [string, any]) => `
                  <tr>
                    <td>${periodName}</td>
                    <td>${data.totalActivities}</td>
                    <td>${data.totalHours.toFixed(1)}h</td>
                    <td>${data.assignedTasks || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
  }

  // Export assigned tasks to CSV
  static exportTasksToCSV(tasks: any[], filename: string) {
    const headers = ['Title', 'Status', 'Priority', 'Due Date', 'Assigned To', 'Created By', 'Department'];
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        `"${task.title}"`,
        task.status,
        task.priority,
        new Date(task.dueDate).toLocaleDateString(),
        task.assignedTo ? task.assignedTo.map((user: any) => `${user.firstName} ${user.lastName}`).join('; ') : '',
        task.createdBy ? `${task.createdBy.firstName} ${task.createdBy.lastName}` : '',
        task.department ? task.department.name : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Helper method to capitalize first letter
  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Export activity breakdown to Excel-compatible CSV
  static exportActivityBreakdownToCSV(activityBreakdown: any[], filename: string) {
    const headers = ['Activity Type', 'Count', 'Total Hours'];
    const csvContent = [
      headers.join(','),
      ...activityBreakdown.map(activity => [
        `"${activity._id.replace('_', ' ').toUpperCase()}"`,
        activity.count.toString(),
        (activity.totalHours || 0).toFixed(1)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
} 