# AddenTech Online - System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [User Management](#user-management)
4. [Admin Dashboard](#admin-dashboard)
5. [Task Management System](#task-management-system)
6. [Leave Management System](#leave-management-system)
7. [Department Management](#department-management)
8. [Attendance System](#attendance-system)
9. [Reporting System](#reporting-system)
10. [Blog Management](#blog-management)
11. [Contact Management](#contact-management)
12. [Memorandum System](#memorandum-system)
13. [API Endpoints](#api-endpoints)
14. [Installation & Setup](#installation--setup)
15. [Configuration](#configuration)
16. [Troubleshooting](#troubleshooting)

## System Overview

AddenTech Online is a comprehensive business management system built with **Remix** (React framework), **TypeScript**, **MongoDB**, and **Tailwind CSS**. The system provides a complete suite of tools for modern business operations including employee management, task tracking, leave management, reporting, and internal communications.

### Key Features
- **Role-based Access Control** - Admin, Manager, Staff, Department Head roles
- **Comprehensive Task Management** - Advanced project tracking with dependencies, risk management, and collaboration
- **Leave Management** - Multi-level approval workflows with automated notifications
- **Real-time Reporting** - Staff productivity, department analytics, and custom reports
- **Internal Communications** - Memorandum system with email integration
- **Content Management** - Blog system with categories and search
- **Attendance Tracking** - Employee attendance with reporting capabilities
- **Department Organization** - Hierarchical department structure with role-based permissions

## Architecture

### Technology Stack
- **Frontend**: React (via Remix), TypeScript, Tailwind CSS, NextUI
- **Backend**: Node.js, Remix Server-side rendering
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom session-based authentication
- **Email**: Nodemailer with SMTP support
- **PDF Generation**: jsPDF with autoTable
- **Charts**: Chart.js for analytics
- **UI Components**: NextUI, Lucide React icons, Framer Motion

### Project Structure
```
app/
├── components/          # Reusable UI components
├── interface/          # TypeScript interfaces
├── layout/            # Layout components
├── routes/            # Remix routes (pages)
├── services/          # Business logic services
├── utils/             # Utility functions
├── controller/        # Data controllers
├── modal/             # Modal components
└── types/             # Type definitions
```

## User Management

### User Roles & Permissions
1. **Admin** - Full system access, user management, system configuration
2. **Manager** - Department oversight, advanced reporting, staff management
3. **Department Head** - Department-specific management, approve leave requests
4. **Staff** - Basic access, task management, leave applications

### User Profile Features
- Personal information management
- Work mode tracking (Remote/Office/Hybrid)
- Educational background
- Department assignment
- Role-based permissions matrix
- Last login tracking
- Profile image upload

### Authentication System
- Secure login with bcrypt password hashing
- Session-based authentication
- Automatic logout on inactivity
- Password change functionality
- Role-based route protection

## Admin Dashboard

### Navigation Structure
The admin dashboard features a hierarchical navigation system:

#### Main Navigation
- **Dashboard** - System overview and statistics
- **User Management** - Employee and user administration
- **Task Management** - Project and task coordination
- **Leave Management** - Leave request processing
- **Department Management** - Organizational structure
- **Reporting** - Analytics and business intelligence
- **Content Management** - Blog and communication tools

### Dashboard Features
- **Real-time Statistics** - Active users, pending tasks, leave requests
- **Quick Actions** - Common administrative tasks
- **Recent Activity** - System activity feed
- **Performance Metrics** - Key performance indicators
- **Notifications** - System alerts and reminders

## Task Management System

### Comprehensive Task Framework
The task management system includes advanced project management capabilities:

#### Task Categories
- **Strategic Initiatives** - Long-term organizational goals
- **Operational Tasks** - Day-to-day business operations
- **Project Work** - Specific project deliverables
- **Administrative Tasks** - Internal process management
- **Emergency/Urgent Items** - Critical issue resolution

#### Priority Matrix (P1-P4)
- **Critical (P1)** - Immediate attention required
- **High (P2)** - Important with deadline pressure
- **Medium (P3)** - Standard priority items
- **Low (P4)** - Nice-to-have improvements

#### Task Status Workflow
- **Not Started** - Task created but not begun
- **In Progress** - Active work in progress
- **Under Review** - Awaiting approval or feedback
- **Completed** - Task finished successfully
- **Blocked** - Waiting for external dependencies
- **On Hold** - Temporarily paused
- **Cancelled** - Task no longer required

### Advanced Task Features

#### Collaboration System
- **Task Ownership** - Primary assignee responsibility
- **Collaborators** - Multiple team members with defined roles
  - Contributor - Active work participation
  - Reviewer - Quality assurance and approval
  - Stakeholder - Business interest representation
  - Observer - Information visibility only

#### Time Management
- **Due Date Tracking** - Deadline management with alerts
- **Time Investment Estimation** - Resource planning
- **Actual Time Tracking** - Performance measurement
- **Time Units** - Flexible (hours/days/weeks)

#### Dependencies & Risk Management
- **Task Dependencies** - Inter-task relationships
  - Blocks - This task prevents others
  - Blocked By - This task waits for others
  - Related To - Informational relationships
- **Risk Assessment** - Comprehensive risk management
  - Risk identification and categorization
  - Probability and impact assessment
  - Mitigation strategies
  - Risk status tracking

#### Progress Tracking
- **Success Criteria** - Measurable completion standards
- **Progress Updates** - Regular status communications
- **Milestone Tracking** - Key achievement markers
- **Blocker Management** - Impediment identification and resolution

#### Resource Management
- **Required Resources** - Tool and asset planning
- **Budget Tracking** - Cost estimation and monitoring
- **Approval Workflows** - Multi-level task approval
- **Stakeholder Management** - External party coordination

### Task Templates
- **Reusable Templates** - Standardized task structures
- **Template Library** - Organizational best practices
- **Usage Analytics** - Template effectiveness tracking

## Leave Management System

### Leave Types & Policies
- **Annual Leave** - Yearly vacation entitlement
- **Sick Leave** - Medical absence coverage
- **Maternity/Paternity Leave** - Family care provisions
- **Emergency Leave** - Unexpected absence needs
- **Custom Leave Types** - Organization-specific categories

### Multi-Level Approval Workflow
The system supports configurable approval chains:
1. **Direct Supervisor** - Immediate manager approval
2. **Department Head** - Department-level authorization
3. **HR Review** - Policy compliance verification
4. **Final Approval** - Executive level for extended leaves

### Leave Features
- **Leave Balance Tracking** - Real-time entitlement calculation
- **Calendar Integration** - Visual leave planning
- **Conflict Detection** - Team availability management
- **Email Notifications** - Automated workflow communications
- **Leave History** - Complete audit trail
- **Bulk Leave Processing** - Efficient administrative tools

### Leave Policies Management
- **Policy Configuration** - Flexible rule definition
- **Entitlement Calculation** - Automatic balance updates
- **Carryover Rules** - Year-end balance management
- **Blackout Periods** - Restricted leave dates
- **Department-Specific Rules** - Customized policies

## Department Management

### Organizational Structure
- **Hierarchical Departments** - Multi-level organization
- **Department Heads** - Leadership assignment
- **Staff Assignment** - Employee department mapping
- **Cross-Department Collaboration** - Inter-departmental projects

### Department Features
- **Department Analytics** - Performance metrics
- **Resource Allocation** - Budget and staff planning
- **Workflow Management** - Department-specific processes
- **Communication Tools** - Internal messaging systems

## Attendance System

### Attendance Tracking
- **Time In/Out Logging** - Work hour recording
- **Location Tracking** - Remote/office work modes
- **Overtime Calculation** - Extended hours management
- **Break Time Tracking** - Rest period monitoring

### Attendance Reporting
- **Individual Reports** - Personal attendance history
- **Department Summary** - Team attendance analysis
- **Trend Analysis** - Attendance pattern identification
- **Export Capabilities** - CSV and PDF reports

### Search & Filtering
- **Username Search** - Employee lookup functionality
- **Date Range Filtering** - Custom period selection
- **Department Filtering** - Team-specific views
- **Status Filtering** - Present/absent/late categories

## Reporting System

### Report Categories

#### Staff Reports
- **Individual Performance** - Personal productivity metrics
- **Team Collaboration** - Interaction analysis
- **Task Completion Rates** - Efficiency measurements
- **Time Utilization** - Work hour optimization

#### Department Reports
- **Department Analytics** - Team performance overview
- **Resource Utilization** - Asset and staff efficiency
- **Budget Analysis** - Financial performance tracking
- **Project Portfolio** - Department project status

#### Productivity Dashboard
- **Real-time Metrics** - Live performance indicators
- **Trend Analysis** - Historical performance patterns
- **Comparative Analysis** - Cross-department benchmarking
- **Goal Tracking** - Objective achievement monitoring

### Export Capabilities
- **PDF Reports** - Professional document generation
- **CSV Export** - Data analysis compatibility
- **JSON Export** - API integration support
- **Print-friendly Formats** - Hard copy reporting

### Custom Reporting
- **Report Builder** - Drag-and-drop report creation
- **Custom Filters** - Flexible data selection
- **Scheduled Reports** - Automated report delivery
- **Report Templates** - Standardized formats

## Blog Management

### Content Management System
- **Article Creation** - Rich text editor with formatting
- **Category Management** - Content organization
- **Image Upload** - Visual content support
- **SEO Optimization** - Search engine friendly URLs

### Blog Features
- **Article Search** - Full-text search functionality
- **Category Filtering** - Content discovery
- **Comments System** - Reader engagement
- **Social Sharing** - Content promotion tools

### Newsletter System
- **Email Subscription** - Reader engagement
- **Automated Notifications** - New content alerts
- **Subscriber Management** - Mailing list administration
- **Email Templates** - Professional communication

## Contact Management

### Contact Database
- **Contact Information** - Personal and business details
- **Company Association** - Business relationship tracking
- **Communication History** - Interaction logging
- **Follow-up Reminders** - Relationship management

### Contact Features
- **Search & Filter** - Quick contact lookup
- **Import/Export** - Data portability
- **Duplicate Detection** - Data quality management
- **Contact Categories** - Relationship classification

## Memorandum System

### Internal Communications
- **Official Memos** - Formal business communications
- **Department Routing** - Hierarchical distribution
- **CC Distribution** - Additional recipient inclusion
- **Email Integration** - Automatic email notifications

### Memo Features
- **Template System** - Standardized formats
- **Approval Workflow** - Management oversight
- **Attachment Support** - Document inclusion
- **Tracking System** - Delivery confirmation

### Access Control
- **Role-based Visibility** - Appropriate access levels
- **Department Filtering** - Relevant content display
- **Confidentiality Levels** - Information security
- **Audit Trail** - Complete access logging

## API Endpoints

### User Management APIs
- `POST /api/user/profile` - User profile updates
- `POST /api/user/update-work-mode` - Work mode changes

### Task Management APIs
- `GET /api/tasks` - Task data retrieval
- `GET /api/tasks/stats` - Task statistics
- `GET /api/tasks/recent` - Recent task updates

### Leave Management APIs
- `GET /api/leaves` - Leave data retrieval
- `POST /api/leaves` - Leave request submission
- `GET /api/leaves/export` - Leave data export

### Department APIs
- `GET /api/departments` - Department data retrieval

### Reporting APIs
- `GET /api/monthly-reports` - Monthly report data

## Installation & Setup

### Prerequisites
- **Node.js** - Version 18.0.0 or higher
- **MongoDB** - Database server
- **NPM/Yarn** - Package manager

### Installation Steps
```bash
# Clone the repository
git clone <repository-url>
cd addentech-online

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Database Setup
```bash
# Ensure MongoDB is running
mongod

# The application will automatically create collections
# Sample data can be populated through the admin interface
```

## Configuration

### Environment Variables
```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/addentech

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application Settings
NODE_ENV=production
SESSION_SECRET=your-session-secret
```

### Email Configuration
The system supports multiple email providers:

#### Gmail Setup
1. Enable 2-factor authentication
2. Generate app-specific password
3. Use app password in SMTP_PASSWORD

#### Other Providers
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Custom SMTP**: Provider-specific settings

### Security Configuration
- **Session Management** - Secure session handling
- **Password Hashing** - bcrypt implementation
- **Role-based Access** - Permission matrix enforcement
- **Data Validation** - Input sanitization and validation

## Troubleshooting

### Common Issues

#### Database Connection
- **Issue**: MongoDB connection failed
- **Solution**: Verify MongoDB is running and DATABASE_URL is correct

#### Email Not Sending
- **Issue**: SMTP authentication failed
- **Solution**: Check email credentials and provider settings

#### Build Errors
- **Issue**: TypeScript compilation errors
- **Solution**: Run `npm run typecheck` to identify issues

#### Permission Denied
- **Issue**: User cannot access certain features
- **Solution**: Verify user role and permissions matrix

### Performance Optimization
- **Database Indexing** - Optimize query performance
- **Image Optimization** - Compress uploaded images
- **Caching Strategy** - Implement appropriate caching
- **Bundle Optimization** - Minimize JavaScript bundles

### Monitoring & Logging
- **Error Tracking** - Implement error monitoring
- **Performance Metrics** - Monitor system performance
- **User Analytics** - Track user engagement
- **System Health** - Monitor server resources

## Support & Maintenance

### Regular Maintenance
- **Database Backups** - Regular data protection
- **Security Updates** - Keep dependencies current
- **Performance Monitoring** - System health checks
- **User Feedback** - Continuous improvement

### System Updates
- **Feature Rollouts** - Gradual feature deployment
- **Bug Fixes** - Issue resolution process
- **Security Patches** - Immediate security updates
- **Database Migrations** - Schema update procedures

---

*This documentation covers the comprehensive AddenTech Online system as implemented. For additional support or customization requests, please contact the development team.*