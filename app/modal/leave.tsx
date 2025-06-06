import { Schema } from "mongoose";
import mongoose from "~/mongoose.server";

// Leave Types Enum
export const LeaveTypes = {
  ANNUAL: 'annual',
  SICK: 'sick',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  EMERGENCY: 'emergency',
  STUDY: 'study',
  COMPASSIONATE: 'compassionate',
  UNPAID: 'unpaid',
  OTHER: 'other'
} as const;

// Leave Status Enum
export const LeaveStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  WITHDRAWN: 'withdrawn'
} as const;

// Leave Priority Enum
export const LeavePriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

const LeaveSchema = new mongoose.Schema({
  // Employee Information
  employee: {
    type: Schema.Types.ObjectId,
    ref: "registration",
    required: true,
    index: true
  },
  
  // Leave Details
  leaveType: {
    type: String,
    enum: Object.values(LeaveTypes),
    required: true,
    index: true
  },
  
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  
  totalDays: {
    type: Number,
    required: true,
    min: 0.5
  },
  
  reason: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Status and Priority
  status: {
    type: String,
    enum: Object.values(LeaveStatus),
    default: LeaveStatus.PENDING,
    index: true
  },
  
  priority: {
    type: String,
    enum: Object.values(LeavePriority),
    default: LeavePriority.MEDIUM
  },
  
  // Approval Workflow
  approvalWorkflow: [{
    approver: {
      type: Schema.Types.ObjectId,
      ref: "registration",
      required: true
    },
    approverRole: {
      type: String,
      enum: ["department_head", "manager", "admin"],
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    comments: {
      type: String,
      maxlength: 500
    },
    actionDate: {
      type: Date
    },
    order: {
      type: Number,
      required: true
    }
  }],
  
  // Current approval level
  currentApprovalLevel: {
    type: Number,
    default: 0
  },
  
  // Final approval details
  finalApprover: {
    type: Schema.Types.ObjectId,
    ref: "registration"
  },
  
  finalApprovalDate: {
    type: Date
  },
  
  finalComments: {
    type: String,
    maxlength: 500
  },
  
  // Supporting Documents
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Emergency Contact (for emergency leaves)
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Handover Details
  handoverTo: {
    type: Schema.Types.ObjectId,
    ref: "registration"
  },
  
  handoverNotes: {
    type: String,
    maxlength: 1000
  },
  
  // Leave Balance Impact
  balanceImpact: {
    leaveType: String,
    daysDeducted: Number,
    remainingBalance: Number
  },
  
  // Metadata
  department: {
    type: Schema.Types.ObjectId,
    ref: "departments",
    required: true,
    index: true
  },
  
  submissionDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  lastModified: {
    type: Date,
    default: Date.now
  },
  
  modifiedBy: {
    type: Schema.Types.ObjectId,
    ref: "registration"
  },
  
  // System fields
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Notification tracking
  notificationsSent: [{
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "registration"
    },
    type: {
      type: String,
      enum: ["submission", "approval_request", "approved", "rejected", "reminder"]
    },
    sentDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
LeaveSchema.index({ employee: 1, startDate: -1 });
LeaveSchema.index({ status: 1, submissionDate: -1 });
LeaveSchema.index({ department: 1, status: 1 });
LeaveSchema.index({ leaveType: 1, startDate: 1 });

// Pre-save middleware to calculate total days and set up approval workflow
LeaveSchema.pre("save", async function(next) {
  const leave = this;
  
  // Calculate total days if dates are provided
  if (leave.startDate && leave.endDate) {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Include both start and end dates
    leave.totalDays = daysDiff;
  }
  
  // Set up approval workflow for new leaves
  if (leave.isNew && leave.status === LeaveStatus.PENDING) {
    try {
      // Get employee details
      const Registration = mongoose.model('registration');
      const employee = await Registration.findById(leave.employee).populate('department');
      
      if (employee) {
        const workflow = [];
        let order = 1;
        
        // Step 1: Department Head approval (if employee is not department head)
        if (employee.role !== 'department_head') {
          const departmentHead = await Registration.findOne({
            department: employee.department,
            role: 'department_head',
            status: 'active'
          });
          
          if (departmentHead) {
            workflow.push({
              approver: departmentHead._id,
              approverRole: 'department_head',
              status: 'pending',
              order: order++
            });
          }
        }
        
        // Step 2: Manager approval (for leaves > 5 days or specific types)
        const needsManagerApproval = 
          leave.totalDays > 5 || 
          [LeaveTypes.MATERNITY, LeaveTypes.PATERNITY, LeaveTypes.STUDY].includes(leave.leaveType as typeof LeaveTypes.MATERNITY | typeof LeaveTypes.PATERNITY | typeof LeaveTypes.STUDY);
          
        if (needsManagerApproval) {
          const manager = await Registration.findOne({
            role: 'manager',
            status: 'active'
          });
          
          if (manager) {
            workflow.push({
              approver: manager._id,
              approverRole: 'manager',
              status: 'pending',
              order: order++
            });
          }
        }
        
        // Step 3: Admin approval (for leaves > 10 days or urgent priority)
        const needsAdminApproval = 
          leave.totalDays > 10 || 
          leave.priority === LeavePriority.URGENT ||
          [LeaveTypes.UNPAID, LeaveTypes.STUDY].includes(leave.leaveType as typeof LeaveTypes.UNPAID | typeof LeaveTypes.STUDY);
          
        if (needsAdminApproval) {
          const admin = await Registration.findOne({
            role: 'admin',
            status: 'active'
          });
          
          if (admin) {
            workflow.push({
              approver: admin._id,
              approverRole: 'admin',
              status: 'pending',
              order: order++
            });
          }
        }
        
        leave.approvalWorkflow = workflow as any;
        leave.currentApprovalLevel = workflow.length > 0 ? 1 : 0;
      }
    } catch (error) {
      console.error('Error setting up approval workflow:', error);
    }
  }
  
  // Update lastModified
  leave.lastModified = new Date();
  
  next();
});

// Instance methods
LeaveSchema.methods.canBeEditedBy = function(userId: string, userRole: string) {
  // Admin can edit any leave
  if (userRole === 'admin') return true;
  
  // Employee can edit their own pending leaves
  if (this.employee.toString() === userId && this.status === LeaveStatus.PENDING) {
    return true;
  }
  
  // Manager can edit leaves in their approval workflow
  if (userRole === 'manager') {
    return this.approvalWorkflow.some((step: any) => 
      step.approver.toString() === userId && step.status === 'pending'
    );
  }
  
  return false;
};

LeaveSchema.methods.canBeViewedBy = function(userId: string, userRole: string, userDepartment?: string) {
  // Admin can view all leaves
  if (userRole === 'admin') return true;
  
  // Employee can view their own leaves
  if (this.employee.toString() === userId) return true;
  
  // Manager can view all leaves
  if (userRole === 'manager') return true;
  
  // Department head can view leaves from their department
  if (userRole === 'department_head' && userDepartment && 
      this.department.toString() === userDepartment) {
    return true;
  }
  
  // Approvers can view leaves in their workflow
  return this.approvalWorkflow.some((step: any) => 
    step.approver.toString() === userId
  );
};

LeaveSchema.methods.getNextApprover = function() {
  const pendingStep = this.approvalWorkflow.find((step: any) => step.status === 'pending');
  return pendingStep ? pendingStep.approver : null;
};

LeaveSchema.methods.approve = async function(approverId: string, comments?: string) {
  const currentStep = this.approvalWorkflow.find((step: any) => 
    step.approver.toString() === approverId && step.status === 'pending'
  );
  
  if (!currentStep) {
    throw new Error('No pending approval found for this user');
  }
  
  currentStep.status = 'approved';
  currentStep.comments = comments;
  currentStep.actionDate = new Date();
  
  // Check if this is the last approval step
  const remainingSteps = this.approvalWorkflow.filter((step: any) => step.status === 'pending');
  
  if (remainingSteps.length === 0) {
    // All approvals complete
    this.status = LeaveStatus.APPROVED;
    this.finalApprover = approverId;
    this.finalApprovalDate = new Date();
    this.finalComments = comments;
  } else {
    // Move to next approval level
    this.currentApprovalLevel += 1;
  }
  
  return this.save();
};

LeaveSchema.methods.reject = async function(approverId: string, comments: string) {
  const currentStep = this.approvalWorkflow.find((step: any) => 
    step.approver.toString() === approverId && step.status === 'pending'
  );
  
  if (!currentStep) {
    throw new Error('No pending approval found for this user');
  }
  
  currentStep.status = 'rejected';
  currentStep.comments = comments;
  currentStep.actionDate = new Date();
  
  this.status = LeaveStatus.REJECTED;
  this.finalApprover = approverId;
  this.finalApprovalDate = new Date();
  this.finalComments = comments;
  
  return this.save();
};

// Static methods
LeaveSchema.statics.getLeaveBalance = async function(employeeId: string, leaveType?: string) {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);
  
  const query: any = {
    employee: employeeId,
    status: LeaveStatus.APPROVED,
    startDate: { $gte: startOfYear, $lte: endOfYear }
  };
  
  if (leaveType) {
    query.leaveType = leaveType;
  }
  
  const leaves = await this.find(query);
  const totalDaysUsed = leaves.reduce((sum: number, leave: any) => sum + leave.totalDays, 0);
  
  // Default annual leave entitlement (can be made configurable)
  const annualEntitlement = 21; // days
  
  return {
    totalEntitlement: annualEntitlement,
    totalUsed: totalDaysUsed,
    remaining: annualEntitlement - totalDaysUsed
  };
};

LeaveSchema.statics.getUpcomingLeaves = async function(departmentId?: string, days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  const query: any = {
    status: LeaveStatus.APPROVED,
    startDate: { $gte: today, $lte: futureDate }
  };
  
  if (departmentId) {
    query.department = departmentId;
  }
  
  return this.find(query)
    .populate('employee', 'firstName lastName email position')
    .populate('department', 'name')
    .sort({ startDate: 1 });
};

const Leave = mongoose.models.leaves || mongoose.model("leaves", LeaveSchema);

export default Leave; 