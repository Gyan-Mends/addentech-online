import { json } from "@remix-run/node";
import Registration from "~/modal/registration";
import Task from "~/modal/task";
import Departments from "~/modal/department";
import { getSession } from "~/session";
import nodemailer from "nodemailer";

// =============================================
// TASK MANAGEMENT SYSTEM FRAMEWORK CONTROLLER
// =============================================

// Role-based access control helper functions
const canCreateTaskForDepartment = (user: any, departmentId: string) => {
    if (!user) return false;
    
    // Admin and managers can create tasks for any department
    if (user.role === "admin" || user.role === "manager") return true;
    
    // Department heads can only create tasks for their own department
    if ((user.role === "head" || user.role === "department_head") && user.department.toString() === departmentId) return true;
    
    return false;
};

const canAssignTaskToUser = async (currentUser: any, taskDepartmentId: string, assigneeId: string) => {
    if (!currentUser) return false;
    
    // Admin and managers can assign tasks to any user
    if (currentUser.role === "admin" || currentUser.role === "manager") return true;
    
    // For department heads, check if assignee belongs to their department
    if (currentUser.role === "head") {
        if (currentUser.department.toString() !== taskDepartmentId) return false;
        
        // Find the assignee user
        const assignee = await Registration.findById(assigneeId);
        if (!assignee) return false;
        
        // Check if assignee is in the same department
        return assignee.department.toString() === currentUser.department.toString();
    }
    
    return false;
};

const canModifyTask = (user: any, task: any) => {
    if (!user || !task) return false;
    
    // Admin and managers can modify any task
    if (user.role === "admin" || user.role === "manager") return true;
    
    // Department heads can modify tasks in their department
    if ((user.role === "head" || user.role === "department_head") && user.department.toString() === task.department.toString()) return true;
    
    // Task owner can modify their task
    if (task.assignedOwner && task.assignedOwner.toString() === user._id.toString()) return true;
    
    // Task creator can modify their task
    if (task.createdBy.toString() === user._id.toString()) return true;
    
    return false;
};

// Valid task status transitions
const TASK_STATUS_TRANSITIONS: Record<string, string[]> = {
    "Not Started": ["In Progress", "Blocked", "Cancelled"],
    "In Progress": ["Under Review", "Completed", "Blocked", "On Hold"],
    "Under Review": ["In Progress", "Completed", "Blocked"],
    "Completed": [],
    "Blocked": ["Not Started", "In Progress", "Cancelled"],
    "On Hold": ["In Progress", "Cancelled"],
    "Cancelled": []
};

const isValidStatusTransition = (currentStatus: string, newStatus: string) => {
    if (!currentStatus || !TASK_STATUS_TRANSITIONS[currentStatus]) return false;
    return TASK_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
};

// Email notification setup
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

class TaskController {
    
    // =============================================
    // STAGE 1: Task Creation and Planning
    // =============================================
    
    async CreateTask({
        title,
        description,
        category = "Operational Tasks",
        priority = "Medium (P3)",
        department,
        assignedOwner,
        dueDate,
        estimatedTimeInvestment = { hours: 0, unit: "hours" },
        successCriteria = [],
        requiredResources = [],
        stakeholders = [],
        budgetImplications = {
            estimatedCost: 0,
            actualCost: 0,
            currency: "USD",
            approved: false
        },
        riskFactors = [],
        dependencies = [],
        collaborators = [],
        createdBy,
        user,
        isTemplate = false,
        templateName,
        templateDescription
    }: {
        title: string;
        description: string;
        category?: string;
        priority?: string;
        department: string;
        assignedOwner: string;
        dueDate: string;
        estimatedTimeInvestment?: { hours: number; unit: string };
        successCriteria?: Array<{ criterion: string }>;
        requiredResources?: Array<{ name: string; type: string; status?: string }>;
        stakeholders?: Array<{ name: string; role: string; involvement: string }>;
        budgetImplications?: any;
        riskFactors?: Array<{ risk: string; probability: string; impact: string }>;
        dependencies?: Array<{ taskId: string; type: string; description?: string }>;
        collaborators?: Array<{ user: string; role: string }>;
        createdBy: string;
        user: any;
        isTemplate?: boolean;
        templateName?: string;
        templateDescription?: string;
    }) {
        try {
            // Check permissions
            if (!canCreateTaskForDepartment(user, department)) {
                return json({
                    message: 'You do not have permission to create tasks for this department',
                    success: false,
                    status: 403
                });
            }
            
            // Check if task title already exists
            const existingTask = await Task.findOne({ title, archived: false });
            if (existingTask) {
                return json({
                    message: "Task with this title already exists",
                    success: false,
                    status: 400,
                });
            }
            
            // Validate dependencies
            if (dependencies.length > 0) {
                for (const dep of dependencies) {
                    const dependentTask = await Task.findById(dep.taskId);
                    if (!dependentTask) {
                        return json({
                            message: `Dependent task with ID ${dep.taskId} not found`,
                            success: false,
                            status: 400,
                        });
                    }
                }
            }
            
            // Create task data
            const taskData = {
                title,
                description,
                category,
                priority,
                department,
                assignedOwner,
                createdBy,
                dueDate: new Date(dueDate),
                status: "Not Started",
                estimatedTimeInvestment,
                actualTimeSpent: { hours: 0, unit: "hours" },
                successCriteria: successCriteria.map(sc => ({ 
                    ...sc, 
                    completed: false 
                })),
                requiredResources: requiredResources.map(rr => ({ 
                    ...rr, 
                    status: rr.status || "Available" 
                })),
                stakeholders,
                budgetImplications,
                riskFactors: riskFactors.map(rf => ({ 
                    ...rf, 
                    status: "Identified" 
                })),
                dependencies,
                collaborators: collaborators.map(c => ({ 
                    ...c, 
                    addedAt: new Date() 
                })),
                comments: [],
                progressUpdates: [],
                attachments: [],
                approvalWorkflow: [],
                metrics: {
                    viewCount: 0,
                    editCount: 0,
                    completionScore: 0,
                    qualityScore: 0,
                    stakeholderSatisfaction: 0
                },
                recurrence: {
                    isRecurring: false,
                    interval: 1
                },
                archived: false,
                isTemplate,
                templateName,
                templateDescription,
                usageCount: 0
            };
            
            const task = new Task(taskData);
            const savedTask = await task.save();
            
            // Populate the saved task
            const populatedTask = await Task.findById(savedTask._id)
                .populate('department')
                .populate('createdBy')
                .populate('assignedOwner')
                .populate('collaborators.user')
                .populate('dependencies.taskId');
            
            // Send notification to assigned owner
            await this.sendTaskNotification(populatedTask, 'task_assigned');
            
            return json({
                message: "Task created successfully",
                task: populatedTask,
                success: true,
                status: 201
            });
            
        } catch (error) {
            console.error("Create task error:", error);
            return json({
                message: "Failed to create task",
                success: false,
                status: 500,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    
    // =============================================
    // STAGE 3: Execution and Progress Tracking
    // =============================================
    
    async UpdateTaskProgress({
        taskId,
        update,
        percentComplete,
        milestone,
        blockers = [],
        user
    }: {
        taskId: string;
        update: string;
        percentComplete: number;
        milestone?: string;
        blockers?: Array<{ description: string; severity: string }>;
        user: any;
    }) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404
                });
            }
            
            if (!canModifyTask(user, task)) {
                return json({
                    message: "You don't have permission to update this task",
                    success: false,
                    status: 403
                });
            }
            
            const progressUpdate = {
                createdBy: user._id,
                update,
                percentComplete: Math.max(0, Math.min(100, percentComplete)),
                milestone,
                blockers: blockers.map(b => ({
                    ...b,
                    severity: b.severity || "Medium"
                })),
                createdAt: new Date()
            };
            
            const updatedTask = await Task.findByIdAndUpdate(
                taskId,
                {
                    $push: { progressUpdates: progressUpdate },
                    $inc: { 'metrics.editCount': 1 }
                },
                { new: true }
            ).populate('assignedOwner')
             .populate('createdBy');
            
            return json({
                message: "Task progress updated successfully",
                task: updatedTask,
                success: true
            });
            
        } catch (error) {
            console.error("Update task progress error:", error);
            return json({
                message: "Failed to update task progress",
                success: false,
                status: 500
            });
        }
    }
    
    async UpdateTaskStatus({
        taskId,
        status,
        user,
        comments
    }: {
        taskId: string;
        status: string;
        user: any;
        comments?: string;
    }) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404
                });
            }
            
            if (!canModifyTask(user, task)) {
                return json({
                    message: "You don't have permission to update this task",
                    success: false,
                    status: 403
                });
            }
            
            const updateData: any = { 
                status,
                $inc: { 'metrics.editCount': 1 }
            };
            
            if (status === "Completed") {
                updateData.completedAt = new Date();
            }
            
            const updatedTask = await Task.findByIdAndUpdate(
                taskId,
                updateData,
                { new: true }
            ).populate('assignedOwner')
             .populate('createdBy');
            
            return json({
                message: "Task status updated successfully",
                task: updatedTask,
                success: true
            });
            
        } catch (error) {
            console.error("Update task status error:", error);
            return json({
                message: "Failed to update task status",
                success: false,
                status: 500
            });
        }
    }
    
    // =============================================
    // Comments and Communication
    // =============================================
    
    async addComment({
        taskId,
        comment,
        type = "General",
        visibility = "Public",
        user
    }: {
        taskId: string;
        comment: string;
        type?: string;
        visibility?: string;
        user: any;
    }) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404
                });
            }
            
            const commentData = {
                createdBy: user._id,
                comment,
                type,
                visibility,
                createdAt: new Date(),
                updatedAt: new Date(),
                reactions: []
            };
            
            const updatedTask = await Task.findByIdAndUpdate(
                taskId,
                {
                    $push: { comments: commentData },
                    $inc: { 'metrics.editCount': 1 }
                },
                { new: true }
            ).populate('comments.createdBy');
            
            return json({
                message: "Comment added successfully",
                task: updatedTask,
                success: true
            });
            
        } catch (error) {
            console.error("Add comment error:", error);
            return json({
                message: "Failed to add comment",
                success: false,
                status: 500
            });
        }
    }
    
    // =============================================
    // Task Retrieval and Filtering
    // =============================================
    
    async GetTasksWithFilters({
        user,
        page = 1,
        limit = 20,
        status,
        priority,
        category,
        departmentId,
        assignedTo,
        createdBy,
        dueDateFrom,
        dueDateTo,
        searchTerm,
        includeArchived = false
    }: {
        user: any;
        page?: number;
        limit?: number;
        status?: string;
        priority?: string;
        category?: string;
        departmentId?: string;
        assignedTo?: string;
        createdBy?: string;
        dueDateFrom?: string;
        dueDateTo?: string;
        searchTerm?: string;
        includeArchived?: boolean;
    }) {
        try {
            const query: any = {};
            
            // Base visibility rules
            if (user.role !== "admin" && user.role !== "manager") {
                // Non-admin users can only see tasks from their department or assigned to them
                query.$or = [
                    { department: user.department },
                    { assignedOwner: user._id },
                    { createdBy: user._id },
                    { 'collaborators.user': user._id }
                ];
            }
            
            // Apply filters
            if (status) query.status = status;
            if (priority) query.priority = priority;
            if (category) query.category = category;
            if (departmentId) query.department = departmentId;
            if (assignedTo) query.assignedOwner = assignedTo;
            if (createdBy) query.createdBy = createdBy;
            if (!includeArchived) query.archived = false;
            
            // Date range filter
            if (dueDateFrom || dueDateTo) {
                query.dueDate = {};
                if (dueDateFrom) query.dueDate.$gte = new Date(dueDateFrom);
                if (dueDateTo) query.dueDate.$lte = new Date(dueDateTo);
            }
            
            // Search filter
            if (searchTerm) {
                query.$and = query.$and || [];
                query.$and.push({
                    $or: [
                        { title: { $regex: searchTerm, $options: 'i' } },
                        { description: { $regex: searchTerm, $options: 'i' } }
                    ]
                });
            }
            
            const skip = (page - 1) * limit;
            
            const tasks = await Task.find(query)
                .populate('department')
                .populate('assignedOwner')
                .populate('createdBy')
                .populate('collaborators.user')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            
            const totalTasks = await Task.countDocuments(query);
            
            return json({
                tasks,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalTasks / limit),
                    totalTasks,
                    hasNextPage: page < Math.ceil(totalTasks / limit),
                    hasPrevPage: page > 1
                },
                success: true
            });
            
        } catch (error) {
            console.error("Get tasks with filters error:", error);
            return json({
                message: "Failed to retrieve tasks",
                success: false,
                status: 500
            });
        }
    }
    
    async GetSingleTask(taskId: string, user?: any) {
        try {
            const task = await Task.findById(taskId)
                .populate('department')
                .populate('assignedOwner')
                .populate('createdBy')
                .populate('collaborators.user')
                .populate('dependencies.taskId')
                .populate('comments.createdBy')
                .populate('progressUpdates.createdBy')
                .populate('approvalWorkflow.approver');
            
            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404
                });
            }
            
            // Increment view count
            await Task.findByIdAndUpdate(taskId, {
                $inc: { 'metrics.viewCount': 1 }
            });
            
            return json({
                task,
                success: true
            });
            
        } catch (error) {
            console.error("Get single task error:", error);
            return json({
                message: "Failed to retrieve task",
                success: false,
                status: 500
            });
        }
    }
    
    // =============================================
    // Notification System
    // =============================================
    
    async sendTaskNotification(task: any, notificationType: string) {
        try {
            if (!process.env.SMTP_HOST) return;
            
            const transporter = createTransporter();
            let subject = "";
            let body = "";
            let recipients: string[] = [];
            
            switch (notificationType) {
                case 'task_assigned':
                    subject = `New Task Assigned: ${task.title}`;
                    body = `You have been assigned a new task: ${task.title}\n\nDescription: ${task.description}\n\nDue Date: ${task.dueDate}\n\nPriority: ${task.priority}`;
                    if (task.assignedOwner && task.assignedOwner.email) {
                        recipients.push(task.assignedOwner.email);
                    }
                    break;
                    
                case 'task_assigned_to_department':
                    subject = `New Department Task: ${task.title}`;
                    body = `A new task has been assigned to your department: ${task.title}\n\nDescription: ${task.description}\n\nDue Date: ${task.dueDate}\n\nPriority: ${task.priority}\n\nAs the department head, please review and assign this task to an appropriate team member.`;
                    if (task.assignedOwner && task.assignedOwner.email) {
                        recipients.push(task.assignedOwner.email);
                    }
                    break;
                    
                case 'task_reassigned':
                    subject = `Task Reassigned: ${task.title}`;
                    body = `A task has been reassigned to you: ${task.title}\n\nDescription: ${task.description}\n\nDue Date: ${task.dueDate}\n\nPriority: ${task.priority}`;
                    if (task.assignedOwner && task.assignedOwner.email) {
                        recipients.push(task.assignedOwner.email);
                    }
                    break;
                    
                case 'progress_update':
                    subject = `Task Progress Update: ${task.title}`;
                    body = `Progress has been updated for task: ${task.title}`;
                    // Notify task creator and department head
                    if (task.createdBy && task.createdBy.email) {
                        recipients.push(task.createdBy.email);
                    }
                    // Find department head
                    const deptHead = await Registration.findOne({
                        department: task.department,
                        $or: [{ role: "department_head" }, { role: "head" }]
                    });
                    if (deptHead && deptHead.email) {
                        recipients.push(deptHead.email);
                    }
                    break;
                    
                case 'status_changed':
                    subject = `Task Status Changed: ${task.title}`;
                    body = `Task status has been changed to: ${task.status}`;
                    // Notify task creator, assigned owner, and department head
                    if (task.createdBy && task.createdBy.email) {
                        recipients.push(task.createdBy.email);
                    }
                    if (task.assignedOwner && task.assignedOwner.email) {
                        recipients.push(task.assignedOwner.email);
                    }
                    break;
                    
                case 'task_completed':
                    subject = `Task Completed: ${task.title}`;
                    body = `Task has been completed: ${task.title}`;
                    // Notify task creator and department head
                    if (task.createdBy && task.createdBy.email) {
                        recipients.push(task.createdBy.email);
                    }
                    const deptHeadCompleted = await Registration.findOne({
                        department: task.department,
                        $or: [{ role: "department_head" }, { role: "head" }]
                    });
                    if (deptHeadCompleted && deptHeadCompleted.email) {
                        recipients.push(deptHeadCompleted.email);
                    }
                    break;
            }
            
            // Remove duplicates from recipients
            const uniqueRecipients = [...new Set(recipients)];
            
            // Send emails to all recipients
            for (const email of uniqueRecipients) {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM,
                    to: email,
                    subject,
                    text: body
                });
            }
            
        } catch (error) {
            console.error("Send notification error:", error);
        }
    }
    
    // =============================================
    // Legacy Method Support (for backward compatibility)
    // =============================================
    
    async CreateTask_Legacy(data: any) {
        // Map legacy data to new format
        return this.CreateTask({
            title: data.title,
            description: data.description,
            department: data.department,
            assignedOwner: data.assignedOwner || data.createdBy,
            dueDate: data.dueDate,
            priority: data.priority === "low" ? "Low (P4)" : 
                     data.priority === "medium" ? "Medium (P3)" : 
                     data.priority === "high" ? "High (P2)" : "Medium (P3)",
            category: "Operational Tasks",
            createdBy: data.createdBy,
            user: data.user
        });
    }
    
    async GetAllTasks() {
        return this.GetTasksWithFilters({ user: { role: "admin" } });
    }
    
    async GetTasksByDepartment(departmentId: string) {
        return this.GetTasksWithFilters({ 
            user: { role: "admin" }, 
            departmentId 
        });
    }
    
    // Legacy comment method
    async comment({ id, comment, createdBy }: { id: string; comment: string; createdBy: string; }) {
        return this.addComment({
            taskId: id,
            comment,
            user: { _id: createdBy }
        });
    }
    
    // =============================================
    // ENHANCED WORKFLOW METHODS FOR SPECIFIC REQUIREMENTS
    // =============================================
    
    // Method for Admin/Manager to create task and assign to department
    async CreateTaskForDepartment({
        title,
        description,
        category = "Operational Tasks",
        priority = "Medium (P3)",
        departmentId,
        dueDate,
        estimatedTimeInvestment = { hours: 0, unit: "hours" },
        successCriteria = [],
        requiredResources = [],
        stakeholders = [],
        budgetImplications = {
            estimatedCost: 0,
            actualCost: 0,
            currency: "USD",
            approved: false
        },
        riskFactors = [],
        dependencies = [],
        createdBy,
        user,
        specialInstructions
    }: {
        title: string;
        description: string;
        category?: string;
        priority?: string;
        departmentId: string;
        dueDate: string;
        estimatedTimeInvestment?: { hours: number; unit: string };
        successCriteria?: Array<{ criterion: string }>;
        requiredResources?: Array<{ name: string; type: string; status?: string }>;
        stakeholders?: Array<{ name: string; role: string; involvement: string }>;
        budgetImplications?: any;
        riskFactors?: Array<{ risk: string; probability: string; impact: string }>;
        dependencies?: Array<{ taskId: string; type: string; description?: string }>;
        createdBy: string;
        user: any;
        specialInstructions?: string;
    }) {
        try {
            // Verify user can create tasks for departments (Admin/Manager only)
            if (!user || !["admin", "manager"].includes(user.role)) {
                return json({
                    message: 'Only Admin and Manager can create tasks for departments',
                    success: false,
                    status: 403
                });
            }
            
            // Find department head for assignment notification
            const departmentHead = await Registration.findOne({ 
                department: departmentId, 
                $or: [
                    { role: "department_head" },
                    { role: "head" }
                ]
            });
            
            if (!departmentHead) {
                return json({
                    message: 'No department head found for this department',
                    success: false,
                    status: 400
                });
            }
            
            // Create task assigned to department (initially to HOD for further assignment)
            const taskData = {
                title,
                description,
                category,
                priority,
                department: departmentId,
                assignedOwner: departmentHead._id, // Initially assign to HOD
                createdBy,
                dueDate: new Date(dueDate),
                status: "Not Started",
                estimatedTimeInvestment,
                actualTimeSpent: { hours: 0, unit: "hours" },
                successCriteria: successCriteria.map(sc => ({ 
                    ...sc, 
                    completed: false 
                })),
                requiredResources: requiredResources.map(rr => ({ 
                    ...rr, 
                    status: rr.status || "Available" 
                })),
                stakeholders,
                budgetImplications,
                riskFactors: riskFactors.map(rf => ({ 
                    ...rf, 
                    status: "Identified" 
                })),
                dependencies,
                collaborators: [],
                comments: specialInstructions ? [{
                    createdBy,
                    comment: `Task assigned to department. Special Instructions: ${specialInstructions}`,
                    type: "Status Update",
                    visibility: "Team Only",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    reactions: []
                }] : [],
                progressUpdates: [],
                attachments: [],
                approvalWorkflow: [],
                metrics: {
                    viewCount: 0,
                    editCount: 0,
                    completionScore: 0,
                    qualityScore: 0,
                    stakeholderSatisfaction: 0
                },
                recurrence: {
                    isRecurring: false,
                    interval: 1
                },
                archived: false,
                isTemplate: false,
                usageCount: 0,
                taskAssignmentLevel: "department", // Track assignment level
                departmentAssignmentComplete: false
            };
            
            const task = new Task(taskData);
            const savedTask = await task.save();
            
            // Populate the saved task
            const populatedTask = await Task.findById(savedTask._id)
                .populate('department')
                .populate('createdBy')
                .populate('assignedOwner');
            
            // Send notification to department head
            await this.sendTaskNotification(populatedTask, 'task_assigned_to_department');
            
            return json({
                message: "Task created and assigned to department successfully",
                task: populatedTask,
                success: true,
                status: 201
            });
            
        } catch (error) {
            console.error("Create task for department error:", error);
            return json({
                message: "Failed to create task for department",
                success: false,
                status: 500,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    
    // Method for HOD to assign task to department members
    async AssignTaskToMember({
        taskId,
        assignedMemberId,
        hodInstructions,
        modifyDueDate,
        modifyPriority,
        additionalResources = [],
        user
    }: {
        taskId: string;
        assignedMemberId: string;
        hodInstructions?: string;
        modifyDueDate?: string;
        modifyPriority?: string;
        additionalResources?: Array<{ name: string; type: string; description?: string }>;
        user: any;
    }) {
        try {
            console.log("AssignTaskToMember called:", {
                taskId,
                assignedMemberId,
                userRole: user.role,
                userDepartment: user.department,
                userId: user._id
            });
            
            const task = await Task.findById(taskId).populate('department');
            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404
                });
            }
            
            console.log("Task found:", {
                taskId: task._id,
                taskDepartment: task.department,
                taskDepartmentId: task.department?._id || task.department,
                taskAssignmentLevel: task.taskAssignmentLevel
            });
            
            // Extract department IDs for comparison - handle multiple formats
            const userDeptId = user.department?._id?.toString() || user.department?.toString();
            const taskDeptId = task.department?._id?.toString() || task.department?.toString();
            
            console.log("Department comparison:", {
                userDeptId,
                taskDeptId,
                userDeptObject: user.department,
                taskDeptObject: task.department,
                match: userDeptId === taskDeptId
            });
            
            // Verify user is HOD of the task's department
            if (!user || !["department_head", "head", "manager"].includes(user.role) || 
                userDeptId !== taskDeptId) {
                console.log("Permission denied:", {
                    userRole: user.role,
                    hasValidRole: ["department_head", "head", "manager"].includes(user.role),
                    userDeptId,
                    taskDeptId,
                    deptMatch: userDeptId === taskDeptId
                });
                return json({
                    message: 'Only the department head or manager can assign tasks to members. Check your department assignment.',
                    success: false,
                    status: 403
                });
            }
            
            // Verify assigned member belongs to the same department
            const assignedMember = await Registration.findById(assignedMemberId).populate('department');
            if (!assignedMember) {
                return json({
                    message: 'Assigned member not found',
                    success: false,
                    status: 400
                });
            }
            
            // Extract department IDs for proper comparison
            const assignedMemberDeptId = (assignedMember.department as any)?._id?.toString() || assignedMember.department?.toString();
            const assignTaskDeptId = (task.department as any)?._id?.toString() || task.department?.toString();
            
            console.log("AssignTaskToMember department check:", {
                assignedMemberName: `${assignedMember.firstName} ${assignedMember.lastName}`,
                assignedMemberDept: assignedMember.department,
                assignedMemberDeptId,
                taskDept: task.department,
                assignTaskDeptId,
                match: assignedMemberDeptId === assignTaskDeptId
            });
            
            if (assignedMemberDeptId !== assignTaskDeptId) {
                return json({
                    message: 'Assigned member must belong to the same department',
                    success: false,
                    status: 400
                });
            }
            
            // Update task with new assignment
            const updateData: any = {
                assignedOwner: assignedMemberId,
                departmentAssignmentComplete: true,
                taskAssignmentLevel: "member",
                $inc: { 'metrics.editCount': 1 }
            };
            
            if (modifyDueDate) {
                updateData.dueDate = new Date(modifyDueDate);
            }
            
            if (modifyPriority) {
                updateData.priority = modifyPriority;
            }
            
            if (additionalResources.length > 0) {
                updateData.$push = {
                    requiredResources: { $each: additionalResources.map(r => ({ ...r, status: "Available" })) }
                };
            }
            
            const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true })
                .populate('assignedOwner')
                .populate('createdBy')
                .populate('department');
            
            // Add assignment comment
            if (hodInstructions || modifyDueDate || modifyPriority) {
                const assignmentComment = {
                    createdBy: user._id,
                    comment: `Task assigned to ${assignedMember.firstName} ${assignedMember.lastName}. ${hodInstructions ? `HOD Instructions: ${hodInstructions}` : ''}${modifyDueDate ? ` Due date modified to: ${modifyDueDate}` : ''}${modifyPriority ? ` Priority changed to: ${modifyPriority}` : ''}`,
                    type: "Status Update",
                    visibility: "Team Only",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    reactions: []
                };
                
                await Task.findByIdAndUpdate(taskId, {
                    $push: { comments: assignmentComment }
                });
            }
            
            // Send notification to assigned member
            await this.sendTaskNotification(updatedTask, 'task_assigned');
            
            return json({
                message: "Task assigned to member successfully",
                task: updatedTask,
                success: true
            });
            
        } catch (error) {
            console.error("Assign task to member error:", error);
            return json({
                message: "Failed to assign task to member",
                success: false,
                status: 500
            });
        }
    }
    
    // Enhanced method for HOD to create task directly for department members
    async CreateTaskForMember({
        title,
        description,
        category = "Operational Tasks",
        priority = "Medium (P3)",
        assignedMemberId,
        dueDate,
        estimatedTimeInvestment = { hours: 0, unit: "hours" },
        successCriteria = [],
        requiredResources = [],
        stakeholders = [],
        riskFactors = [],
        user,
        hodInstructions
    }: {
        title: string;
        description: string;
        category?: string;
        priority?: string;
        assignedMemberId: string;
        dueDate: string;
        estimatedTimeInvestment?: { hours: number; unit: string };
        successCriteria?: Array<{ criterion: string }>;
        requiredResources?: Array<{ name: string; type: string; status?: string }>;
        stakeholders?: Array<{ name: string; role: string; involvement: string }>;
        riskFactors?: Array<{ risk: string; probability: string; impact: string }>;
        user: any;
        hodInstructions?: string;
    }) {
        try {
            // Verify user is HOD or manager
            if (!user || !["department_head", "head", "manager"].includes(user.role)) {
                return json({
                    message: 'Only department heads and managers can create tasks for their members',
                    success: false,
                    status: 403
                });
            }
            
            // Verify assigned member belongs to the same department
            const assignedMember = await Registration.findById(assignedMemberId).populate('department');
            if (!assignedMember) {
                return json({
                    message: 'Assigned member not found',
                    success: false,
                    status: 400
                });
            }
            
            // Extract department IDs for comparison
            const assignedMemberDeptId = (assignedMember.department as any)?._id?.toString() || assignedMember.department?.toString();
            const userDeptId = (user.department as any)?._id?.toString() || user.department?.toString();
            
            console.log("CreateTaskForMember department check:", {
                assignedMemberName: `${assignedMember.firstName} ${assignedMember.lastName}`,
                assignedMemberDept: assignedMember.department,
                assignedMemberDeptId,
                userDept: user.department,
                userDeptId,
                match: assignedMemberDeptId === userDeptId
            });
            
            if (assignedMemberDeptId !== userDeptId) {
                return json({
                    message: 'Assigned member must belong to the same department',
                    success: false,
                    status: 400
                });
            }
            
            // Create task directly assigned to member
            const taskData = {
                title,
                description,
                category,
                priority,
                department: user.department,
                assignedOwner: assignedMemberId,
                createdBy: user._id,
                dueDate: new Date(dueDate),
                status: "Not Started",
                estimatedTimeInvestment,
                actualTimeSpent: { hours: 0, unit: "hours" },
                successCriteria: successCriteria.map(sc => ({ 
                    ...sc, 
                    completed: false 
                })),
                requiredResources: requiredResources.map(rr => ({ 
                    ...rr, 
                    status: rr.status || "Available" 
                })),
                stakeholders,
                budgetImplications: {
                    estimatedCost: 0,
                    actualCost: 0,
                    currency: "USD",
                    approved: false
                },
                riskFactors: riskFactors.map(rf => ({ 
                    ...rf, 
                    status: "Identified" 
                })),
                dependencies: [],
                collaborators: [],
                comments: hodInstructions ? [{
                    createdBy: user._id,
                    comment: `Task created by HOD. Instructions: ${hodInstructions}`,
                    type: "Status Update",
                    visibility: "Team Only",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    reactions: []
                }] : [],
                progressUpdates: [],
                attachments: [],
                approvalWorkflow: [],
                metrics: {
                    viewCount: 0,
                    editCount: 0,
                    completionScore: 0,
                    qualityScore: 0,
                    stakeholderSatisfaction: 0
                },
                recurrence: {
                    isRecurring: false,
                    interval: 1
                },
                archived: false,
                isTemplate: false,
                usageCount: 0,
                taskAssignmentLevel: "member",
                departmentAssignmentComplete: true
            };
            
            const task = new Task(taskData);
            const savedTask = await task.save();
            
            // Populate the saved task
            const populatedTask = await Task.findById(savedTask._id)
                .populate('department')
                .populate('createdBy')
                .populate('assignedOwner');
            
            // Send notification to assigned member
            await this.sendTaskNotification(populatedTask, 'task_assigned');
            
            return json({
                message: "Task created and assigned to member successfully",
                task: populatedTask,
                success: true,
                status: 201
            });
            
        } catch (error) {
            console.error("Create task for member error:", error);
            return json({
                message: "Failed to create task for member",
                success: false,
                status: 500,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    
    // Enhanced status update with role-based permissions
    async UpdateTaskStatusWithPermissions({
        taskId,
        status,
        user,
        statusChangeReason
    }: {
        taskId: string;
        status: string;
        user: any;
        statusChangeReason?: string;
    }) {
        try {
            const task = await Task.findById(taskId).populate('assignedOwner').populate('department');
            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404
                });
            }
            
            // Check permissions: Only assigned owner, HOD, admin, or manager can change status
            const canUpdateStatus = 
                task.assignedOwner._id.toString() === user._id.toString() || // Assigned person
                (user.role === "department_head" && user.department.toString() === task.department._id.toString()) || // HOD of department
                ["admin", "manager"].includes(user.role); // Admin or Manager
            
            if (!canUpdateStatus) {
                return json({
                    message: "You don't have permission to update this task status",
                    success: false,
                    status: 403
                });
            }
            
            // Validate status transition
            if (!isValidStatusTransition(task.status, status)) {
                return json({
                    message: `Invalid status transition from ${task.status} to ${status}`,
                    success: false,
                    status: 400
                });
            }
            
            const updateData: any = { 
                status,
                $inc: { 'metrics.editCount': 1 }
            };
            
            if (status === "Completed") {
                updateData.completedAt = new Date();
            }
            
            const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true })
                .populate('assignedOwner')
                .populate('createdBy')
                .populate('department');
            
            // Add status change comment
            const statusComment = {
                createdBy: user._id,
                comment: `Status changed from "${task.status}" to "${status}"${statusChangeReason ? `. Reason: ${statusChangeReason}` : ''}`,
                type: "Status Update",
                visibility: "Public",
                createdAt: new Date(),
                updatedAt: new Date(),
                reactions: []
            };
            
            await Task.findByIdAndUpdate(taskId, {
                $push: { comments: statusComment }
            });
            
            // Send notifications
            await this.sendTaskNotification(updatedTask, 'status_changed');
            
            return json({
                message: "Task status updated successfully",
                task: updatedTask,
                success: true
            });
            
        } catch (error) {
            console.error("Update task status error:", error);
            return json({
                message: "Failed to update task status",
                success: false,
                status: 500
            });
        }
    }
    
    // Enhanced commenting system with replies and security
    async AddCommentWithReply({
        taskId,
        comment,
        type = "General",
        visibility = "Public",
        parentCommentId, // For replies
        mentionedUsers = [], // Array of user IDs to mention
        user
    }: {
        taskId: string;
        comment: string;
        type?: string;
        visibility?: string;
        parentCommentId?: string;
        mentionedUsers?: string[];
        user: any;
    }) {
        try {
            const task = await Task.findById(taskId).populate('assignedOwner').populate('department');
            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404
                });
            }
            
            // Check if user can comment on this task
            const canComment = 
                task.assignedOwner._id.toString() === user._id.toString() || // Assigned person
                task.createdBy.toString() === user._id.toString() || // Task creator
                (user.role === "department_head" && user.department.toString() === task.department._id.toString()) || // HOD of department
                ["admin", "manager"].includes(user.role) || // Admin or Manager
                task.collaborators?.some(c => c.user.toString() === user._id.toString()); // Collaborator
            
            if (!canComment) {
                return json({
                    message: "You don't have permission to comment on this task",
                    success: false,
                    status: 403
                });
            }
            
            // Validate parent comment if this is a reply
            if (parentCommentId) {
                const parentCommentExists = task.comments?.some(c => c._id?.toString() === parentCommentId);
                if (!parentCommentExists) {
                    return json({
                        message: "Parent comment not found",
                        success: false,
                        status: 400
                    });
                }
            }
            
            const commentData = {
                createdBy: user._id,
                comment,
                type,
                visibility,
                parentCommentId: parentCommentId || null,
                mentionedUsers,
                createdAt: new Date(),
                updatedAt: new Date(),
                reactions: []
            };
            
            const updatedTask = await Task.findByIdAndUpdate(
                taskId,
                {
                    $push: { comments: commentData },
                    $inc: { 'metrics.editCount': 1 }
                },
                { new: true }
            ).populate('comments.createdBy').populate('assignedOwner').populate('createdBy');
            
            // Send notifications to mentioned users and task stakeholders
            if (mentionedUsers.length > 0) {
                for (const userId of mentionedUsers) {
                    // Send mention notification
                    await this.sendMentionNotification(updatedTask, userId, comment, user);
                }
            }
            
            // Notify task owner and creator about new comment
            await this.sendCommentNotification(updatedTask, user, comment);
            
            return json({
                message: "Comment added successfully",
                task: updatedTask,
                success: true
            });
            
        } catch (error) {
            console.error("Add comment error:", error);
            return json({
                message: "Failed to add comment",
                success: false,
                status: 500
            });
        }
    }
    
    // Method to get task comments with replies structure
    async GetTaskCommentsWithReplies(taskId: string, user: any) {
        try {
            const task = await Task.findById(taskId)
                .populate('comments.createdBy')
                .populate('assignedOwner')
                .populate('department');
            
            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404
                });
            }
            
            // Check if user can view comments
            const canViewComments = 
                task.assignedOwner._id.toString() === user._id.toString() ||
                task.createdBy.toString() === user._id.toString() ||
                (user.role === "department_head" && user.department.toString() === task.department._id.toString()) ||
                ["admin", "manager"].includes(user.role) ||
                task.collaborators?.some(c => c.user.toString() === user._id.toString());
            
            if (!canViewComments) {
                return json({
                    message: "You don't have permission to view comments on this task",
                    success: false,
                    status: 403
                });
            }
            
            // Filter comments based on visibility and user role
            let visibleComments = task.comments || [];
            
            if (user.role !== "admin" && user.role !== "manager") {
                visibleComments = visibleComments.filter(comment => {
                    if (comment.visibility === "Public") return true;
                    if (comment.visibility === "Team Only" && 
                        (user.department.toString() === task.department._id.toString() || 
                         task.collaborators?.some(c => c.user.toString() === user._id.toString()))) return true;
                    if (comment.visibility === "Private" && comment.createdBy.toString() === user._id.toString()) return true;
                    return false;
                });
            }
            
            // Organize comments into threaded structure
            const mainComments = visibleComments.filter(comment => !comment.parentCommentId);
            const replies = visibleComments.filter(comment => comment.parentCommentId);
            
            const commentsWithReplies = mainComments.map(comment => ({
                ...comment.toObject(),
                replies: replies.filter(reply => reply.parentCommentId?.toString() === comment._id?.toString())
            }));
            
            return json({
                comments: commentsWithReplies,
                success: true
            });
            
        } catch (error) {
            console.error("Get task comments error:", error);
            return json({
                message: "Failed to retrieve comments",
                success: false,
                status: 500
            });
        }
    }
    
    // Enhanced notification methods
    async sendMentionNotification(task: any, mentionedUserId: string, comment: string, mentioner: any) {
        try {
            const mentionedUser = await Registration.findById(mentionedUserId);
            if (!mentionedUser || !mentionedUser.email) return;
            
            if (!process.env.SMTP_HOST) return;
            
            const transporter = createTransporter();
            const subject = `You were mentioned in task: ${task.title}`;
            const body = `You were mentioned by ${mentioner.firstName} ${mentioner.lastName} in task "${task.title}".\n\nComment: ${comment}\n\nView task: [Task Link]`;
            
            await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: mentionedUser.email,
                subject,
                text: body
            });
            
        } catch (error) {
            console.error("Send mention notification error:", error);
        }
    }
    
    async sendCommentNotification(task: any, commenter: any, comment: string) {
        try {
            if (!process.env.SMTP_HOST) return;
            
            const transporter = createTransporter();
            const subject = `New comment on task: ${task.title}`;
            const body = `${commenter.firstName} ${commenter.lastName} commented on task "${task.title}".\n\nComment: ${comment}\n\nView task: [Task Link]`;
            
            // Notify task owner and creator
            const notifyUsers = [task.assignedOwner, task.createdBy].filter(user => 
                user && user.email && user._id.toString() !== commenter._id.toString()
            );
            
            for (const user of notifyUsers) {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM,
                    to: user.email,
                    subject,
                    text: body
                });
            }
            
        } catch (error) {
            console.error("Send comment notification error:", error);
        }
    }
    
    // Method to get tasks based on user role and department
    async GetTasksByUserRole(user: any, filters: any = {}) {
        try {
            let query: any = { archived: false };
            
            // Role-based filtering
            switch (user.role) {
                case "admin":
                case "manager":
                    // Can see all tasks
                    break;
                case "department_head":
                    // Can see all tasks in their department
                    query.department = user.department;
                    break;
                case "staff":
                default:
                    // Can only see tasks assigned to them or in their department
                    query.$or = [
                        { assignedOwner: user._id },
                        { 'collaborators.user': user._id },
                        { createdBy: user._id }
                    ];
                    break;
            }
            
            // Apply additional filters
            Object.assign(query, filters);
            
            const tasks = await Task.find(query)
                .populate('department')
                .populate('assignedOwner')
                .populate('createdBy')
                .populate('collaborators.user')
                .sort({ createdAt: -1 });
            
            return json({
                tasks,
                success: true
            });
            
        } catch (error) {
            console.error("Get tasks by user role error:", error);
            return json({
                message: "Failed to retrieve tasks",
                success: false,
                status: 500
            });
        }
    }
    
    // Update existing task
    async UpdateTask({
        taskId,
        title,
        description,
        category,
        priority,
        dueDate,
        user
    }: {
        taskId: string;
        title: string;
        description: string;
        category?: string;
        priority?: string;
        dueDate?: string;
        user: any;
    }) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404
                });
            }
            
            // Check permissions - only creator or admin can edit
            const canEdit = 
                task.createdBy.toString() === user._id.toString() ||
                ["admin"].includes(user.role);
            
            if (!canEdit) {
                return json({
                    message: "Only the task creator can edit this task",
                    success: false,
                    status: 403
                });
            }
            
            // Update task data
            const updateData: any = {
                title,
                description,
                $inc: { 'metrics.editCount': 1 }
            };
            
            if (category) updateData.category = category;
            if (priority) updateData.priority = priority;
            if (dueDate) updateData.dueDate = new Date(dueDate);
            
            const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true })
                .populate('department')
                .populate('assignedOwner')
                .populate('createdBy');
            
            // Add update comment
            const updateComment = {
                createdBy: user._id,
                comment: `Task updated by ${user.firstName} ${user.lastName}`,
                type: "Status Update",
                visibility: "Team Only",
                createdAt: new Date(),
                updatedAt: new Date(),
                reactions: []
            };
            
            await Task.findByIdAndUpdate(taskId, {
                $push: { comments: updateComment }
            });
            
            return json({
                message: "Task updated successfully",
                task: updatedTask,
                success: true
            });
            
        } catch (error) {
            console.error("Update task error:", error);
            return json({
                message: "Failed to update task",
                success: false,
                status: 500
            });
        }
    }
    
    // Delete task (archive it)
    async DeleteTask({
        taskId,
        deleteReason,
        user
    }: {
        taskId: string;
        deleteReason?: string;
        user: any;
    }) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404
                });
            }
            
            // Check permissions - only creator or admin can delete
            const canDelete = 
                task.createdBy.toString() === user._id.toString() ||
                ["admin"].includes(user.role);
            
            if (!canDelete) {
                return json({
                    message: "Only the task creator can delete this task",
                    success: false,
                    status: 403
                });
            }
            
            // Archive the task instead of deleting
            const updateData = {
                archived: true,
                archivedAt: new Date(),
                archivedBy: user._id,
                $inc: { 'metrics.editCount': 1 }
            };
            
            const archivedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
            
            // Add deletion comment
            const deleteComment = {
                createdBy: user._id,
                comment: `Task archived by ${user.firstName} ${user.lastName}${deleteReason ? `. Reason: ${deleteReason}` : ''}`,
                type: "Status Update",
                visibility: "Team Only",
                createdAt: new Date(),
                updatedAt: new Date(),
                reactions: []
            };
            
            await Task.findByIdAndUpdate(taskId, {
                $push: { comments: deleteComment }
            });
            
            return json({
                message: "Task archived successfully",
                task: archivedTask,
                success: true
            });
            
        } catch (error) {
            console.error("Delete task error:", error);
            return json({
                message: "Failed to archive task",
                success: false,
                status: 500
            });
        }
    }
}

const taskController = new TaskController();
export default taskController; 