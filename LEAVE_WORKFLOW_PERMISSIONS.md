# Leave Management Role-Based Workflow

## Overview
The leave management system implements a comprehensive role-based access control system that defines what each user role can do with leave applications.

## User Roles and Permissions

### 1. Staff
**Permissions:**
- ✅ Apply for leave
- ✅ View their own leave applications  
- ✅ Edit their own leave applications (if no admin/manager action taken)
- ✅ Delete their own leave applications (if no admin/manager action taken)
- ❌ Cannot view other employees' leaves
- ❌ Cannot approve/reject any leaves

**Business Rules:**
- Once an admin or manager takes any action (approve/reject) on a staff member's leave, the staff can only view the application
- Staff can only see their own leave applications in the dashboard
- Staff can create new leave applications

### 2. Department Head
**Permissions:**
- ✅ View all leave applications in their department
- ✅ Approve/reject leave applications in their department  
- ✅ View leave statistics for their department
- ❌ Cannot edit/delete other employees' leaves
- ❌ Cannot view leaves from other departments
- ❌ Cannot create leave applications through admin dashboard

**Business Rules:**
- Department heads see only leaves from employees in their department
- Can approve or reject pending leaves in their department
- Cannot modify leave applications directly, only approve/reject

### 3. Manager
**Permissions:**
- ✅ Full access to all leave applications
- ✅ View all departments' leaves
- ✅ Approve/reject any leave application
- ✅ Edit/delete any leave application
- ✅ Create leave applications
- ✅ View all leave statistics

**Business Rules:**
- Managers have complete control over the leave management system
- Can override any previous decisions
- Can perform all CRUD operations on leave applications

### 4. Admin
**Permissions:**
- ✅ Full access to all leave applications (same as Manager)
- ✅ View all departments' leaves
- ✅ Approve/reject any leave application
- ✅ Edit/delete any leave application  
- ✅ Create leave applications
- ✅ View all leave statistics
- ✅ Export leave data

**Business Rules:**
- Admins have the highest level of access
- Can perform all operations in the system
- Can manage all aspects of leave management

## UI Behavior by Role

### Dashboard View
- **Staff**: See only their own leaves with edit/delete buttons (if no admin action)
- **Department Head**: See all department leaves with approve/reject buttons
- **Manager/Admin**: See all leaves with full action buttons

### Leave Application Form
- **Staff/Manager/Admin**: Can access the "New Leave Application" button
- **Department Head**: Cannot create new applications (view-only access)

### Action Buttons
- **View**: Available to all roles
- **Approve/Reject**: Available to Department Heads (own dept), Managers, Admins
- **Edit/Delete**: Available to Staff (own leaves, no admin action), Managers, Admins

## Implementation Details

### LeaveController Methods
- `getLeaves()` - Includes role-based filtering
- `canUserModifyLeave()` - Checks edit/delete permissions
- `canUserApproveLeave()` - Checks approval permissions
- `updateLeaveStatus()` - Handles approval workflow

### Permission Checks
The system checks permissions at multiple levels:
1. **Controller Level**: Database queries filtered by role
2. **UI Level**: Conditional rendering of buttons and actions
3. **Route Level**: Access control in loaders and actions

### Approval Workflow
1. Staff submits leave application (status: pending)
2. Department Head or Manager/Admin can approve/reject
3. Once approved/rejected, staff can only view (no modifications)
4. Approval history is tracked with approver details

## Security Features
- Session-based authentication required
- Role validation on every action
- Database-level permission checks
- Audit trail for all leave modifications
- User lookup by email for security

This role-based system ensures that users can only access and modify data appropriate to their role while maintaining a complete audit trail of all leave management activities. 