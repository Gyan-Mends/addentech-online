import { json } from "@remix-run/node";
import mongoose from 'mongoose';
import { LeaveInterface, RegistrationInterface, DepartmentInterface } from '~/interface/interface';
import Registration from '~/modal/registration';
import Department from '~/modal/department';

// MongoDB Schemas
const leaveSchema = new mongoose.Schema<LeaveInterface>({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'registration', required: true },
    leaveType: { 
        type: String, 
        required: true,
        enum: ['annual', 'sick', 'maternity', 'paternity', 'emergency', 'bereavement', 'personal', 'study']
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { 
        type: String, 
        required: true, 
        default: 'pending',
        enum: ['pending', 'approved', 'rejected', 'cancelled']
    },
    priority: { 
        type: String, 
        required: true, 
        default: 'normal',
        enum: ['low', 'normal', 'high', 'urgent']
    },
    approvalWorkflow: [{
        approver: { type: mongoose.Schema.Types.ObjectId, ref: 'registration' },
        approverRole: { type: String },
        status: { 
            type: String, 
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        comments: { type: String },
        actionDate: { type: Date },
        order: { type: Number, required: true }
    }],
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'departments', required: true },
    submissionDate: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    // Email reminder fields
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: { type: Date },
    // Document support
    documents: [{
        filename: { type: String },
        originalName: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        uploadDate: { type: Date, default: Date.now }
    }],
    // Balance tracking
    balanceUsed: { type: Number, default: 0 },
    // Enhanced workflow
    currentApprovalLevel: { type: Number, default: 1 },
    needsEscalation: { type: Boolean, default: false },
    escalationReason: { type: String },
    // Conflict detection
    hasConflicts: { type: Boolean, default: false },
    conflictDetails: [{ type: String }]
}, { timestamps: true });

// Ensure the model is only compiled once and connects to the correct collection
const Leave = mongoose.models.Leave || mongoose.model<LeaveInterface>('Leave', leaveSchema, 'leaves');

export class LeaveController {
    
    // Create a new leave application
    static async createLeave(leaveData: Partial<LeaveInterface>): Promise<LeaveInterface> {
        try {
            // If employee is provided as email, find the user first
            let employeeId = leaveData.employee;
            if (typeof leaveData.employee === 'string' && leaveData.employee.includes('@')) {
                // Find user by email using the Registration model
                const user = await Registration.findOne({ email: leaveData.employee });
                if (user) {
                    employeeId = user._id;
                    // Use user's department if not provided
                    if (!leaveData.department) {
                        leaveData.department = user.department;
                    }
                } else {
                    throw new Error('User not found');
                }
            }

            // Calculate total days
            const startDate = new Date(leaveData.startDate!);
            const endDate = new Date(leaveData.endDate!);
            const timeDiff = endDate.getTime() - startDate.getTime();
            const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

            const newLeave = new Leave({
                ...leaveData,
                employee: employeeId,
                totalDays,
                submissionDate: new Date(),
                lastModified: new Date()
            });

            await newLeave.save();
            
            // Populate employee and department data
            await newLeave.populate('employee', 'firstName lastName email department');
            await newLeave.populate('department', 'name');
            
            return newLeave.toObject();
        } catch (error) {
            console.error('Error creating leave:', error);
            throw new Error('Failed to create leave application');
        }
    }

    // Get all leaves with filters and role-based access
    static async getLeaves(filters: {
        status?: string;
        leaveType?: string;
        department?: string;
        employee?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
        userEmail?: string;
        userRole?: string;
        userDepartment?: string;
    } = {}): Promise<{ leaves: LeaveInterface[], total: number, stats: any }> {
        try {
            console.log("=== LeaveController.getLeaves START ===");
            console.log("Input filters:", filters);
            
            const {
                status = 'all',
                leaveType = 'all',
                department = 'all',
                employee,
                startDate,
                endDate,
                page = 1,
                limit = 10,
                userEmail,
                userRole,
                userDepartment
            } = filters;
            
            console.log("Destructured filters:", { status, leaveType, department, employee, startDate, endDate, page, limit, userEmail, userRole, userDepartment });

            // Build query
            console.log("Building query...");
            const query: any = { isActive: true };
            console.log("Base query:", query);
            
            // Apply role-based filtering
            console.log("Applying role-based filtering...");
            if (userRole && userEmail) {
                console.log("User has role:", userRole);
                if (userRole === 'staff') {
                    // Staff can only see their own leaves
                    console.log("Finding staff user by email:", userEmail);
                    const user = await Registration.findOne({ email: userEmail });
                    if (user) {
                        console.log("Staff user found, setting employee filter:", user._id);
                        query.employee = user._id;
                    } else {
                        console.log("Staff user not found!");
                    }
                } else if (userRole === 'department_head' && userDepartment) {
                    // Department heads can see leaves from their department
                    console.log("Setting department filter for dept head:", userDepartment);
                    query.department = userDepartment;
                }
                // Admin and manager can see all leaves (no additional filtering)
                console.log("Role-based filtering applied. Final query:", query);
            } else {
                console.log("No role-based filtering applied");
            }
            
            if (status && status !== 'all') {
                query.status = status;
            }
            
            if (leaveType && leaveType !== 'all') {
                query.leaveType = leaveType;
            }
            
            if (department && department !== 'all') {
                query.department = department;
            }
            
            if (employee) {
                query.employee = employee;
            }
            
            if (startDate || endDate) {
                query.startDate = {};
                if (startDate) query.startDate.$gte = new Date(startDate);
                if (endDate) query.startDate.$lte = new Date(endDate);
            }

            console.log("Checking if Leave model exists...");
            console.log("Leave model:", Leave);
            console.log("Department model:", Department);
            
            // Get total count
            console.log("Getting total count with query:", query);
            const total = await Leave.countDocuments(query);
            console.log("Total documents found:", total);

            // Get leaves with pagination
            console.log("Querying leaves with pagination...");
            console.log("Query parameters:", { query, limit, skip: (page - 1) * limit });
            
            const leaves = await Leave.find(query)
                .populate('employee', 'firstName lastName email image position department')
                .populate('department', 'name')
                .sort({ submissionDate: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .lean();
                
            console.log("Leaves found:", leaves?.length || 0);
            if (leaves && leaves.length > 0) {
                console.log("First leave sample:", leaves[0]);
            }

            // Calculate stats
            console.log("Calculating stats...");
            const stats = await this.calculateLeaveStats();
            console.log("Stats calculated:", stats);
            
            console.log("=== LeaveController.getLeaves SUCCESS ===");
            return { leaves: leaves as any[], total, stats };
        } catch (error) {
            console.error('=== LeaveController.getLeaves ERROR ===');
            console.error('Error fetching leaves:', error);
            console.error('Error stack:', error.stack);
            console.error('Error details:', error.message);
            
            // Return safe data instead of throwing
            return {
                leaves: [],
                total: 0,
                stats: {
                    totalApplications: 0,
                    pendingApprovals: 0,
                    approvedThisMonth: 0,
                    rejectedThisMonth: 0,
                    upcomingLeaves: 0,
                    onLeaveToday: 0
                }
            };
        }
    }

    // Get a single leave by ID
    static async getLeaveById(id: string): Promise<LeaveInterface | null> {
        try {
            const leave = await Leave.findById(id)
                .populate('employee', 'firstName lastName email image position')
                .populate('department', 'name')
                .populate('approvalWorkflow.approver', 'firstName lastName')
                .lean();

            return leave as LeaveInterface;
        } catch (error) {
            console.error('Error fetching leave:', error);
            throw new Error('Failed to fetch leave application');
        }
    }

    // Update leave status (approve/reject) - following admin.users.tsx pattern
    static async updateLeaveStatus({
        leaveId,
        status,
        comments,
        approverEmail
    }: {
        leaveId: string;
        status: 'approved' | 'rejected';
        comments?: string;
        approverEmail: string;
    }) {
        try {
            console.log('=== updateLeaveStatus called ===');
            console.log('Updating leave status:', { leaveId, status, comments, approverEmail });
            
            // Find the approver by email
            const approver = await Registration.findOne({ email: approverEmail });
            if (!approver) {
                return {
                    success: false,
                    message: "Approver not found",
                    status: 404
                };
            }

            const leave = await Leave.findById(leaveId);
            if (!leave) {
                return {
                    success: false,
                    message: "Leave application not found",
                    status: 404
                };
            }

            // Update leave status
            leave.status = status;
            leave.lastModified = new Date();
            leave.modifiedBy = approver._id;

            // Update approval workflow
            const currentApproval = leave.approvalWorkflow.find(
                (approval: any) => approval.status === 'pending'
            );
            
            if (currentApproval) {
                currentApproval.status = status === 'approved' ? 'approved' : 'rejected';
                currentApproval.comments = comments || '';
                currentApproval.actionDate = new Date();
                currentApproval.approver = approver._id;
            } else {
                // Add new approval workflow entry
                leave.approvalWorkflow.push({
                    approver: approver._id,
                    approverRole: approver.role,
                    status: status === 'approved' ? 'approved' : 'rejected',
                    comments: comments || '',
                    actionDate: new Date(),
                    order: 1
                } as any);
            }

            await leave.save();
            
            return {
                success: true,
                message: `Leave application ${status} successfully`,
                status: 200
            };
        } catch (error) {
            console.error('Error updating leave status:', error);
            return {
                success: false,
                message: "Failed to update leave status",
                status: 500
            };
        }
    }

    // Calculate leave statistics
    static async calculateLeaveStats(): Promise<any> {
        try {
            const currentDate = new Date();
            const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

            const [
                totalApplications,
                pendingApprovals,
                approvedThisMonth,
                rejectedThisMonth,
                upcomingLeaves,
                onLeaveToday
            ] = await Promise.all([
                Leave.countDocuments({ isActive: true }),
                Leave.countDocuments({ status: 'pending', isActive: true }),
                Leave.countDocuments({ 
                    status: 'approved', 
                    submissionDate: { $gte: currentMonth, $lt: nextMonth },
                    isActive: true 
                }),
                Leave.countDocuments({ 
                    status: 'rejected', 
                    submissionDate: { $gte: currentMonth, $lt: nextMonth },
                    isActive: true 
                }),
                Leave.countDocuments({ 
                    status: 'approved', 
                    startDate: { $gt: currentDate },
                    isActive: true 
                }),
                Leave.countDocuments({ 
                    status: 'approved', 
                    startDate: { $lte: currentDate },
                    endDate: { $gte: currentDate },
                    isActive: true 
                })
            ]);

            return {
                totalApplications,
                pendingApprovals,
                approvedThisMonth,
                rejectedThisMonth,
                upcomingLeaves,
                onLeaveToday
            };
        } catch (error) {
            console.error('Error calculating stats:', error);
            return {};
        }
    }

    // Delete/Cancel a leave application
    static async deleteLeave(leaveId: string, userId: string): Promise<boolean> {
        try {
            const leave = await Leave.findById(leaveId);
            if (!leave) {
                throw new Error('Leave application not found');
            }

            // Soft delete
            leave.isActive = false;
            leave.lastModified = new Date();
            leave.modifiedBy = new mongoose.Types.ObjectId(userId);
            
            await leave.save();
            return true;
        } catch (error) {
            console.error('Error deleting leave:', error);
            throw new Error('Failed to delete leave application');
        }
    }

    // Get leaves for a specific employee
    static async getEmployeeLeaves(employeeId: string): Promise<LeaveInterface[]> {
        try {
            const leaves = await Leave.find({ 
                employee: employeeId, 
                isActive: true 
            })
            .populate('department', 'name')
            .populate('approvalWorkflow.approver', 'firstName lastName')
            .sort({ submissionDate: -1 })
            .lean();

            return leaves as LeaveInterface[];
        } catch (error) {
            console.error('Error fetching employee leaves:', error);
            throw new Error('Failed to fetch employee leaves');
        }
    }

    // Get department leaves (for department heads)
    static async getDepartmentLeaves(departmentId: string): Promise<LeaveInterface[]> {
        try {
            const leaves = await Leave.find({ 
                department: departmentId, 
                isActive: true 
            })
            .populate('employee', 'firstName lastName email image position')
            .populate('department', 'name')
            .populate('approvalWorkflow.approver', 'firstName lastName')
            .sort({ submissionDate: -1 })
            .lean();

            return leaves as LeaveInterface[];
        } catch (error) {
            console.error('Error fetching department leaves:', error);
            throw new Error('Failed to fetch department leaves');
        }
    }

    // Export leaves to CSV
    static async exportLeavesToCSV(filters: any = {}): Promise<string> {
        try {
            const { leaves } = await this.getLeaves({ ...filters, limit: 1000 });
            
            const csvHeaders = [
                'Employee Name',
                'Department',
                'Leave Type',
                'Start Date',
                'End Date',
                'Total Days',
                'Status',
                'Priority',
                'Submission Date',
                'Reason'
            ];

            const csvRows = leaves.map((leave: any) => [
                `${leave.employee.firstName} ${leave.employee.lastName}`,
                leave.department.name,
                leave.leaveType,
                new Date(leave.startDate).toLocaleDateString(),
                new Date(leave.endDate).toLocaleDateString(),
                leave.totalDays,
                leave.status,
                leave.priority,
                new Date(leave.submissionDate).toLocaleDateString(),
                leave.reason
            ]);

            const csvContent = [csvHeaders, ...csvRows]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n');

            return csvContent;
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            throw new Error('Failed to export leaves to CSV');
        }
    }

    // Check if user can edit/delete a leave application
    static async canUserModifyLeave(leaveId: string, userEmail: string): Promise<boolean> {
        try {
            const user = await Registration.findOne({ email: userEmail });
            if (!user) return false;

            const leave = await Leave.findById(leaveId);
            if (!leave) return false;

            // Admin and manager can always modify
            if (user.role === 'admin' || user.role === 'manager') {
                return true;
            }

            // Staff can only modify their own leaves if no admin/manager action has been taken
            if (user.role === 'staff') {
                // Check if it's their leave
                if (leave.employee.toString() !== user._id.toString()) {
                    return false;
                }
                
                // Check if any admin/manager has taken action
                const hasAdminAction = leave.approvalWorkflow.some((approval: any) => 
                    approval.status !== 'pending' && 
                    approval.approver && 
                    ['admin', 'manager'].includes(approval.approverRole)
                );
                
                return !hasAdminAction;
            }

            // Department head can only view, not modify (unless it's approval/rejection)
            return false;
        } catch (error) {
            console.error('Error checking user permissions:', error);
            return false;
        }
    }

    // Check if user can approve/reject a leave
    static async canUserApproveLeave(leaveId: string, userEmail: string): Promise<boolean> {
        try {
            const user = await Registration.findOne({ email: userEmail });
            if (!user) return false;

            const leave = await Leave.findById(leaveId);
            if (!leave) return false;

            // Admin and manager can always approve/reject
            if (user.role === 'admin' || user.role === 'manager') {
                return true;
            }

            // Department head can approve/reject leaves in their department
            if (user.role === 'department_head') {
                return leave.department.toString() === user.department.toString();
            }

            // Staff cannot approve/reject
            return false;
        } catch (error) {
            console.error('Error checking approval permissions:', error);
            return false;
        }
    }
} 