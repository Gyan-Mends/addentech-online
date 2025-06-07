import { json } from "@remix-run/node";
import mongoose from 'mongoose';
import { LeaveInterface, RegistrationInterface, DepartmentInterface } from '~/interface/interface';

// MongoDB Schemas
const leaveSchema = new mongoose.Schema<LeaveInterface>({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
        approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    submissionDate: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure the model is only compiled once
const Leave = mongoose.models.Leave || mongoose.model<LeaveInterface>('Leave', leaveSchema);

export class LeaveController {
    
    // Create a new leave application
    static async createLeave(leaveData: Partial<LeaveInterface>): Promise<LeaveInterface> {
        try {
            // Calculate total days
            const startDate = new Date(leaveData.startDate!);
            const endDate = new Date(leaveData.endDate!);
            const timeDiff = endDate.getTime() - startDate.getTime();
            const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

            const newLeave = new Leave({
                ...leaveData,
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

    // Get all leaves with filters
    static async getLeaves(filters: {
        status?: string;
        leaveType?: string;
        department?: string;
        employee?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    } = {}): Promise<{ leaves: LeaveInterface[], total: number, stats: any }> {
        try {
            const {
                status = 'all',
                leaveType = 'all',
                department = 'all',
                employee,
                startDate,
                endDate,
                page = 1,
                limit = 10
            } = filters;

            // Build query
            const query: any = { isActive: true };
            
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

            // Get total count
            const total = await Leave.countDocuments(query);

            // Get leaves with pagination
            const leaves = await Leave.find(query)
                .populate('employee', 'firstName lastName email image position')
                .populate('department', 'name')
                .populate('approvalWorkflow.approver', 'firstName lastName')
                .sort({ submissionDate: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .lean();

            // Calculate stats
            const stats = await this.calculateLeaveStats();

            return { leaves: leaves as LeaveInterface[], total, stats };
        } catch (error) {
            console.error('Error fetching leaves:', error);
            throw new Error('Failed to fetch leave applications');
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

    // Update leave status (approve/reject)
    static async updateLeaveStatus(
        leaveId: string, 
        status: 'approved' | 'rejected', 
        approverId: string,
        comments?: string
    ): Promise<LeaveInterface> {
        try {
            const leave = await Leave.findById(leaveId);
            if (!leave) {
                throw new Error('Leave application not found');
            }

            // Update leave status
            leave.status = status;
            leave.lastModified = new Date();
            leave.modifiedBy = new mongoose.Types.ObjectId(approverId);

            // Update approval workflow
            const currentApproval = leave.approvalWorkflow.find(
                approval => approval.status === 'pending'
            );
            
            if (currentApproval) {
                currentApproval.status = status === 'approved' ? 'approved' : 'rejected';
                currentApproval.comments = comments || '';
                currentApproval.actionDate = new Date();
                currentApproval.approver = new mongoose.Types.ObjectId(approverId);
            }

            await leave.save();
            
            // Populate and return
            await leave.populate('employee', 'firstName lastName email');
            await leave.populate('department', 'name');
            
            return leave.toObject();
        } catch (error) {
            console.error('Error updating leave status:', error);
            throw new Error('Failed to update leave status');
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
} 