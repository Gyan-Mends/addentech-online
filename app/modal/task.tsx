import { Schema } from "mongoose";
import { comment } from "postcss";
import { TaskInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const TaskSchema = new mongoose.Schema(
    {
        // Essential Task Elements
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        
        // Task Categories
        category: {
            type: String,
            enum: ["Strategic Initiatives", "Operational Tasks", "Project Work", "Administrative Tasks", "Emergency/Urgent Items"],
            required: true,
            default: "Operational Tasks"
        },
        
        // Priority Matrix (P1-P4)
        priority: {
            type: String,
            enum: ["Critical (P1)", "High (P2)", "Medium (P3)", "Low (P4)"],
            required: true,
            default: "Medium (P3)"
        },
        
        // Enhanced Status with Workflow Stages
        status: {
            type: String,
            enum: ["Not Started", "In Progress", "Under Review", "Completed", "Blocked", "On Hold", "Cancelled"],
            required: true,
            default: "Not Started",
        },
        
        // Assignment and Ownership
        assignedOwner: {
            type: Schema.Types.ObjectId,
            ref: "registration",
            required: true,
        },
        
        // Collaborators (additional team members involved)
        collaborators: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: "registration"
            },
            role: {
                type: String,
                enum: ["Contributor", "Reviewer", "Stakeholder", "Observer"],
                default: "Contributor"
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }],
        
        department: {
            type: Schema.Types.ObjectId,
            ref: "departments",
            required: true,
        },
        
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "registration",
            required: true,
        },
        
        // Time Management
        dueDate: {
            type: Date,
            required: true,
        },
        
        estimatedTimeInvestment: {
            hours: {
                type: Number,
                min: 0,
                default: 0
            },
            unit: {
                type: String,
                enum: ["hours", "days", "weeks"],
                default: "hours"
            }
        },
        
        actualTimeSpent: {
            hours: {
                type: Number,
                min: 0,
                default: 0
            },
            unit: {
                type: String,
                enum: ["hours", "days", "weeks"],
                default: "hours"
            }
        },
        
        // Dependencies
        dependencies: [{
            taskId: {
                type: Schema.Types.ObjectId,
                ref: "task"
            },
            type: {
                type: String,
                enum: ["Blocks", "Blocked By", "Related To"],
                default: "Blocks"
            },
            description: String
        }],
        
        // Success Criteria
        successCriteria: [{
            criterion: {
                type: String,
                required: true
            },
            completed: {
                type: Boolean,
                default: false
            },
            completedAt: Date,
            completedBy: {
                type: Schema.Types.ObjectId,
                ref: "registration"
            }
        }],
        
        // Required Resources/Tools
        requiredResources: [{
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ["Tool", "Software", "Hardware", "Budget", "Personnel", "Other"],
                default: "Other"
            },
            description: String,
            status: {
                type: String,
                enum: ["Available", "Requested", "Approved", "Denied"],
                default: "Available"
            }
        }],
        
        // Client/Stakeholder Information
        stakeholders: [{
            name: String,
            role: String,
            email: String,
            department: String,
            involvement: {
                type: String,
                enum: ["Primary", "Secondary", "Informed"],
                default: "Secondary"
            }
        }],
        
        // Budget Implications
        budgetImplications: {
            estimatedCost: {
                type: Number,
                min: 0,
                default: 0
            },
            actualCost: {
                type: Number,
                min: 0,
                default: 0
            },
            currency: {
                type: String,
                default: "USD"
            },
            budgetCategory: String,
            approved: {
                type: Boolean,
                default: false
            }
        },
        
        // Risk Factors
        riskFactors: [{
            risk: {
                type: String,
                required: true
            },
            probability: {
                type: String,
                enum: ["Low", "Medium", "High"],
                default: "Medium"
            },
            impact: {
                type: String,
                enum: ["Low", "Medium", "High"],
                default: "Medium"
            },
            mitigation: String,
            status: {
                type: String,
                enum: ["Identified", "Mitigated", "Accepted", "Resolved"],
                default: "Identified"
            }
        }],
        
        // Progress Notes/Updates
        progressUpdates: [{
            createdBy: {
                type: Schema.Types.ObjectId,
                ref: "registration",
                required: true,
            },
            update: {
                type: String,
                required: true,
            },
            percentComplete: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            },
            milestone: {
                type: String
            },
            blockers: [{
                description: String,
                severity: {
                    type: String,
                    enum: ["Low", "Medium", "High", "Critical"],
                    default: "Medium"
                },
                resolvedAt: Date,
                resolvedBy: {
                    type: Schema.Types.ObjectId,
                    ref: "registration"
                }
            }],
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        
        // Enhanced Comments System with Replies Support
        comments: [{
            createdBy: {
                type: Schema.Types.ObjectId,
                ref: "registration",
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                enum: ["General", "Status Update", "Escalation", "Resolution", "Feedback"],
                default: "General"
            },
            visibility: {
                type: String,
                enum: ["Public", "Team Only", "Stakeholders Only", "Private"],
                default: "Public"
            },
            parentCommentId: {
                type: Schema.Types.ObjectId,
                ref: "task",
                default: null
            },
            mentionedUsers: [{
                type: Schema.Types.ObjectId,
                ref: "registration"
            }],
            createdAt: {
                type: Date,
                default: Date.now,
            },
            updatedAt: {
                type: Date,
                default: Date.now,
            },
            reactions: [{
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "registration"
                },
                type: {
                    type: String,
                    enum: ["like", "helpful", "concern", "approved"],
                    default: "like"
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }]
        }],
        
        // File Attachments/References
        attachments: [{
            filename: {
                type: String,
                required: true
            },
            originalName: String,
            mimeType: String,
            size: Number,
            url: String,
            uploadedBy: {
                type: Schema.Types.ObjectId,
                ref: "registration"
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            },
            description: String,
            category: {
                type: String,
                enum: ["Document", "Image", "Specification", "Reference", "Template", "Other"],
                default: "Document"
            }
        }],
        
        // Workflow and Approval
        approvalWorkflow: [{
            approver: {
                type: Schema.Types.ObjectId,
                ref: "registration",
                required: true
            },
            level: {
                type: Number,
                default: 1
            },
            status: {
                type: String,
                enum: ["Pending", "Approved", "Rejected", "Skipped"],
                default: "Pending"
            },
            approvedAt: Date,
            comments: String,
            required: {
                type: Boolean,
                default: true
            }
        }],
        
        // Performance Metrics
        metrics: {
            viewCount: {
                type: Number,
                default: 0
            },
            editCount: {
                type: Number,
                default: 0
            },
            completionScore: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            },
            qualityScore: {
                type: Number,
                min: 0,
                max: 10,
                default: 0
            },
            stakeholderSatisfaction: {
                type: Number,
                min: 0,
                max: 10,
                default: 0
            }
        },
        
        // Recurrence (for recurring tasks)
        recurrence: {
            isRecurring: {
                type: Boolean,
                default: false
            },
            frequency: {
                type: String,
                enum: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"],
            },
            interval: {
                type: Number,
                default: 1
            },
            endDate: Date,
            nextDueDate: Date,
            parentTaskId: {
                type: Schema.Types.ObjectId,
                ref: "task"
            }
        },
        
        // Archive and Closure
        archived: {
            type: Boolean,
            default: false
        },
        
        archivedAt: Date,
        
        archivedBy: {
            type: Schema.Types.ObjectId,
            ref: "registration"
        },
        
        completedAt: Date,
        
        lessonsLearned: String,
        
        // Task Templates
        isTemplate: {
            type: Boolean,
            default: false
        },
        
        templateName: String,
        
        templateDescription: String,
        
        usageCount: {
            type: Number,
            default: 0
        },
        
        // Enhanced Workflow Fields
        taskAssignmentLevel: {
            type: String,
            enum: ["department", "member"],
            default: "member"
        },
        
        departmentAssignmentComplete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

// Add indexes for better performance
TaskSchema.index({ status: 1, priority: 1 });
TaskSchema.index({ assignedOwner: 1, status: 1 });
TaskSchema.index({ department: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ category: 1 });
TaskSchema.index({ createdAt: -1 });

// Add middleware for calculating completion score
TaskSchema.pre('save', function(next) {
    if (this.successCriteria && this.successCriteria.length > 0) {
        const completedCriteria = this.successCriteria.filter(c => c.completed).length;
        if (this.metrics) {
            this.metrics.completionScore = Math.round((completedCriteria / this.successCriteria.length) * 100);
        }
    }
    next();
});

let Task: mongoose.Model<TaskInterface>;

try {
    Task = mongoose.model<TaskInterface>("task");
} catch (error) {
    Task = mongoose.model<TaskInterface>("task", TaskSchema);
}

export default Task;
