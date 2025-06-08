// Report Export Utilities
export class ReportExporter {
  
  // Export staff report to CSV
  static exportStaffReportToCSV(report: any, period: string, year: number) {
    const headers = [
      'Report Type',
      'Employee Name',
      'Email', 
      'Role',
      'Department',
      'Period',
      'Year',
      'Total Activities',
      'Total Hours',
      'Completed Tasks',
      'Total Assigned Tasks'
    ];

    const data = [
      'Staff Report',
      report.user.name,
      report.user.email,
      report.user.role.replace('_', ' ').toUpperCase(),
      report.user.department || 'N/A',
      period,
      year.toString(),
      report.summary.totalActivities.toString(),
      report.summary.totalHours.toFixed(1),
      (report.summary.completedTasks || 0).toString(),
      (report.summary.totalAssignedTasks || 0).toString()
    ];

    let csvContent = headers.join(',') + '\n';
    csvContent += data.map(field => `"${field}"`).join(',') + '\n\n';

    // Add period breakdown
    if (report.periodBreakdown && Object.keys(report.periodBreakdown).length > 0) {
      csvContent += 'Period Breakdown\n';
      csvContent += 'Period,Activities,Hours,Tasks\n';
      
      Object.entries(report.periodBreakdown).forEach(([periodName, periodData]: [string, any]) => {
        csvContent += `"${periodName}",${periodData.totalActivities},${periodData.totalHours.toFixed(1)},${periodData.assignedTasks || 0}\n`;
      });
    }

    // Add task status breakdown
    if (report.summary.taskStatusBreakdown && Object.keys(report.summary.taskStatusBreakdown).length > 0) {
      csvContent += '\nTask Status Breakdown\n';
      csvContent += 'Status,Count\n';
      
      Object.entries(report.summary.taskStatusBreakdown).forEach(([status, count]: [string, any]) => {
        csvContent += `"${status.replace('_', ' ').toUpperCase()}",${count}\n`;
      });
    }

    this.downloadCSV(csvContent, `${report.user.name.replace(/\s+/g, '_')}_${period}_report_${year}.csv`);
  }

  // Export department report to CSV
  static exportDepartmentReportToCSV(report: any, period: string, year: number) {
    const headers = [
      'Report Type',
      'Department',
      'Period',
      'Year',
      'Total Activities',
      'Total Hours',
      'Completed Tasks',
      'Total Assigned Tasks'
    ];

    const data = [
      'Department Report',
      report.department,
      period,
      year.toString(),
      report.summary.totalActivities.toString(),
      report.summary.totalHours.toFixed(1),
      (report.summary.completedTasks || 0).toString(),
      (report.summary.totalAssignedTasks || 0).toString()
    ];

    let csvContent = headers.join(',') + '\n';
    csvContent += data.map(field => `"${field}"`).join(',') + '\n\n';

    // Add period breakdown
    if (report.periodBreakdown && Object.keys(report.periodBreakdown).length > 0) {
      csvContent += 'Period Breakdown\n';
      csvContent += 'Period,Activities,Hours,Tasks\n';
      
      Object.entries(report.periodBreakdown).forEach(([periodName, periodData]: [string, any]) => {
        csvContent += `"${periodName}",${periodData.totalActivities},${periodData.totalHours.toFixed(1)},${periodData.assignedTasks || 0}\n`;
      });
    }

    // Add activity breakdown
    if (report.summary.activityBreakdown && report.summary.activityBreakdown.length > 0) {
      csvContent += '\nActivity Breakdown\n';
      csvContent += 'Activity Type,Count,Hours\n';
      
      report.summary.activityBreakdown.forEach((activity: any) => {
        csvContent += `"${activity._id.replace('_', ' ').toUpperCase()}",${activity.count},${activity.totalHours || 0}\n`;
      });
    }

    // Add task status breakdown
    if (report.summary.taskStatusBreakdown && Object.keys(report.summary.taskStatusBreakdown).length > 0) {
      csvContent += '\nTask Status Breakdown\n';
      csvContent += 'Status,Count\n';
      
      Object.entries(report.summary.taskStatusBreakdown).forEach(([status, count]: [string, any]) => {
        csvContent += `"${status.replace('_', ' ').toUpperCase()}",${count}\n`;
      });
    }

    this.downloadCSV(csvContent, `${report.department.replace(/\s+/g, '_')}_department_${period}_report_${year}.csv`);
  }

  // Export tasks to CSV
  static exportTasksToCSV(tasks: any[], filename: string) {
    const headers = ['Title', 'Status', 'Priority', 'Due Date', 'Assigned To', 'Created By', 'Department'];
    
    let csvContent = headers.join(',') + '\n';
    
    tasks.forEach(task => {
      const row = [
        `"${task.title || ''}"`,
        `"${task.status || ''}"`,
        `"${task.priority || ''}"`,
        `"${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}"`,
        `"${task.assignedTo ? task.assignedTo.map((user: any) => `${user.firstName} ${user.lastName}`).join('; ') : ''}"`,
        `"${task.createdBy ? `${task.createdBy.firstName} ${task.createdBy.lastName}` : ''}"`,
        `"${task.department ? task.department.name : ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    this.downloadCSV(csvContent, filename);
  }

  // Export report to JSON
  static exportReportToJSON(report: any, period: string, year: number, type: 'staff' | 'department') {
    const exportData = {
      exportType: `${type}_report`,
      exportDate: new Date().toISOString(),
      period,
      year,
      ...report
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const filename = type === 'staff' 
      ? `${report.user.name.replace(/\s+/g, '_')}_${period}_report_${year}.json`
      : `${report.department.replace(/\s+/g, '_')}_department_${period}_report_${year}.json`;

    this.downloadJSON(jsonContent, filename);
  }

  // Helper method to download CSV
  private static downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, filename);
  }

  // Helper method to download JSON
  private static downloadJSON(content: string, filename: string) {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
    this.downloadBlob(blob, filename);
  }

  // Helper method to download blob
  private static downloadBlob(blob: Blob, filename: string) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate printable HTML report
  static generatePrintableHTML(report: any, period: string, year: number, type: 'staff' | 'department'): string {
    const title = type === 'staff' 
      ? `${period.charAt(0).toUpperCase() + period.slice(1)} Staff Report - ${report.user.name}`
      : `${period.charAt(0).toUpperCase() + period.slice(1)} Department Report - ${report.department}`;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
          h2 { color: #666; margin-top: 30px; }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .period-item { margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    `;

    if (type === 'staff') {
      html += `
        <div class="summary">
          <h2>Employee Information</h2>
          <p><strong>Name:</strong> ${report.user.name}</p>
          <p><strong>Email:</strong> ${report.user.email}</p>
          <p><strong>Role:</strong> ${report.user.role.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Department:</strong> ${report.user.department || 'N/A'}</p>
        </div>
      `;
    } else {
      html += `
        <div class="summary">
          <h2>Department Information</h2>
          <p><strong>Department:</strong> ${report.department}</p>
        </div>
      `;
    }

    // Summary table
    html += `
      <h2>Summary</h2>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Activities</td><td>${report.summary.totalActivities}</td></tr>
        <tr><td>Total Hours Logged</td><td>${report.summary.totalHours.toFixed(1)}h</td></tr>
        <tr><td>Tasks Completed</td><td>${report.summary.completedTasks || 0}</td></tr>
        <tr><td>Total Assigned Tasks</td><td>${report.summary.totalAssignedTasks || 0}</td></tr>
      </table>
    `;

    // Task status breakdown
    if (report.summary.taskStatusBreakdown && Object.keys(report.summary.taskStatusBreakdown).length > 0) {
      html += `
        <h2>Task Status Breakdown</h2>
        <table>
          <tr><th>Status</th><th>Count</th></tr>
      `;
      Object.entries(report.summary.taskStatusBreakdown).forEach(([status, count]: [string, any]) => {
        html += `<tr><td>${status.replace('_', ' ').toUpperCase()}</td><td>${count}</td></tr>`;
      });
      html += '</table>';
    }

    // Period breakdown
    if (report.periodBreakdown && Object.keys(report.periodBreakdown).length > 0) {
      html += `<h2>${period.charAt(0).toUpperCase() + period.slice(1)} Breakdown</h2>`;
      Object.entries(report.periodBreakdown).forEach(([periodName, data]: [string, any]) => {
        html += `
          <div class="period-item">
            <h3>${periodName}</h3>
            <p><strong>Activities:</strong> ${data.totalActivities} | <strong>Hours:</strong> ${data.totalHours.toFixed(1)}h | <strong>Tasks:</strong> ${data.assignedTasks || 0}</p>
          </div>
        `;
      });
    }

    html += `
        <div class="no-print" style="margin-top: 30px;">
          <button onclick="window.print()">Print Report</button>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  // Open printable version in new window
  static openPrintableReport(report: any, period: string, year: number, type: 'staff' | 'department') {
    const html = this.generatePrintableHTML(report, period, year, type);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  }
} 