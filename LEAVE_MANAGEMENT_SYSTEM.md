# Leave Management System

## Overview

The Leave Management System is a comprehensive solution for managing employee leave applications, approvals, and tracking within your organization. It provides a streamlined workflow for employees to submit leave requests and for managers/administrators to review and approve them.

## Features

### 🎯 Core Features
- **Employee Leave Application**: Easy-to-use form for submitting leave requests
- **Admin Dashboard**: Comprehensive overview of all leave applications
- **Approval Workflow**: Multi-level approval system with comments
- **Real-time Statistics**: Dashboard with key metrics and insights
- **Filtering & Search**: Advanced filtering by status, type, department, etc.
- **CSV Export**: Export leave data for reporting and analysis
- **Detailed Views**: Complete application details with timeline

### 📊 Leave Types Supported
- Annual Leave
- Sick Leave
- Maternity Leave
- Paternity Leave
- Emergency Leave
- Bereavement Leave
- Personal Leave
- Study Leave

### 🔐 Role-Based Access
- **Employees**: Submit and view their own applications
- **Managers**: Approve/reject department applications
- **Administrators**: Full system access and management

## System Architecture

### Backend Components

#### 1. Leave Controller (`app/controller/leave.tsx`)
Handles all leave-related business logic:
- Create new leave applications
- Retrieve leaves with filtering
- Update leave status (approve/reject)
- Calculate statistics
- Export functionality

#### 2. API Routes
- `app/routes/api.leaves.tsx` - Main CRUD operations
- `app/routes/api.leaves.export.tsx` - CSV export functionality

#### 3. Database Schema
MongoDB schema with the following key fields:
```typescript
{
  employee: ObjectId,
  leaveType: String,
  startDate: Date,
  endDate: Date,
  totalDays: Number,
  reason: String,
  status: String, // pending, approved, rejected
  priority: String, // low, normal, high, urgent
  approvalWorkflow: Array,
  department: ObjectId,
  submissionDate: Date,
  lastModified: Date
}
```

### Frontend Components

#### 1. Admin Dashboard (`app/routes/admin.leave-management.tsx`)
- Statistics cards showing key metrics
- Filterable table of all applications
- Approval/rejection modal
- Export functionality

#### 2. Employee Application Form (`app/routes/employee-leave-application.tsx`)
- User-friendly form with validation
- Date picker with business logic
- Automatic calculation of leave days
- Leave policy information

#### 3. Leave Detail View (`app/routes/admin.leave.$id.tsx`)
- Complete application details
- Approval timeline
- Comments and history

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Remix.js application setup

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   Ensure MongoDB is running and accessible. The system will automatically create the necessary collections.

3. **Environment Variables**
   Set up your environment variables for database connection and session management.

4. **Run the Application**
   ```bash
   npm run dev
   ```

## Usage Guide

### For Employees

#### Submitting a Leave Application
1. Navigate to `/employee-leave-application`
2. Fill in the required details:
   - Leave type
   - Start and end dates
   - Reason for leave
   - Priority level
3. Review the calculated total days
4. Submit the application

#### Viewing Applications
- Access your applications through the dashboard
- Track approval status and comments

### For Administrators

#### Managing Applications
1. Go to `/admin/leave-management`
2. View dashboard statistics
3. Use filters to find specific applications
4. Click "View" to see detailed information
5. Approve or reject pending applications

#### Approval Process
1. Click "Approve" or "Reject" on pending applications
2. Add comments explaining the decision
3. Submit the approval/rejection

#### Exporting Data
- Use the "Export CSV" button to download leave data
- Apply filters before exporting for specific datasets

## API Endpoints

### GET `/api/leaves`
Retrieve leave applications with optional filters:
- `status`: Filter by approval status
- `leaveType`: Filter by leave type
- `department`: Filter by department
- `page`: Pagination
- `limit`: Results per page

### POST `/api/leaves`
Create a new leave application or update existing ones:
- Set `_method=POST` for creation
- Set `_method=PUT` for status updates
- Set `_method=DELETE` for cancellation

### GET `/api/leaves/export`
Export leave data as CSV with optional filters.

## Statistics & Metrics

The dashboard provides real-time statistics:
- **Total Applications**: All submitted applications
- **Pending Approvals**: Applications awaiting approval
- **Approved This Month**: Monthly approval count
- **Rejected This Month**: Monthly rejection count
- **Upcoming Leaves**: Approved future leaves
- **On Leave Today**: Current active leaves

## Customization

### Adding New Leave Types
1. Update the enum in the database schema
2. Add the new type to the frontend select options
3. Update validation rules if needed

### Modifying Approval Workflow
1. Adjust the `approvalWorkflow` schema
2. Update the approval logic in the controller
3. Modify the frontend approval interface

### Custom Reporting
1. Extend the export functionality
2. Add new statistical calculations
3. Create custom dashboard widgets

## Security Features

- **Authentication**: Session-based user authentication
- **Authorization**: Role-based access control
- **Data Validation**: Input validation on both client and server
- **Audit Trail**: Complete history of all actions

## Performance Considerations

- **Pagination**: Large datasets are paginated for performance
- **Indexing**: Database indexes on frequently queried fields
- **Caching**: Consider implementing caching for statistics
- **Lazy Loading**: Components load data as needed

## Troubleshooting

### Common Issues

1. **Applications Not Showing**
   - Check database connection
   - Verify user permissions
   - Check filter settings

2. **Export Not Working**
   - Ensure proper authentication
   - Check server logs for errors
   - Verify CSV generation logic

3. **Approval Actions Failing**
   - Check user roles and permissions
   - Verify API endpoint accessibility
   - Review error messages in console

### Debug Mode
Enable debug logging by setting appropriate environment variables.

## Future Enhancements

### Planned Features
- **Email Notifications**: Automatic notifications for status changes
- **Calendar Integration**: Sync with calendar applications
- **Mobile App**: Dedicated mobile application
- **Advanced Reporting**: More detailed analytics and reports
- **Bulk Operations**: Approve/reject multiple applications
- **Leave Balance Tracking**: Track remaining leave days
- **Holiday Calendar**: Integration with company holidays

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: PWA capabilities for offline access
- **API Rate Limiting**: Implement rate limiting for API endpoints
- **Advanced Caching**: Redis integration for better performance

## Support & Maintenance

### Regular Maintenance
- Monitor database performance
- Review and update leave policies
- Check for security updates
- Backup data regularly

### Support Channels
- Technical documentation
- User training materials
- Administrator guides
- Developer API documentation

## Contributing

When contributing to the leave management system:
1. Follow the existing code structure
2. Add appropriate tests
3. Update documentation
4. Follow security best practices
5. Test thoroughly before deployment

## License

This leave management system is part of the larger application suite. Please refer to the main application license for terms and conditions. 