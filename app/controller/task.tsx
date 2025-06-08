import { json } from "@remix-run/node";
import mongoose from 'mongoose';
import Task, { TaskInterface } from '~/modal/task';
import Registration from '~/modal/registration';
import Departments from '~/modal/department';

export class TaskController {
    
    // Create a new task
    static async createTask(taskData: Partial<TaskInterface>, creatorEmail: string): Promise<{ success: boolean; task?: TaskInterface; message: string }> {
        try {
            // Find the creator
            const creator = await Registration.findOne({ email: creatorEmail });
            if (!creator) {
                return { success: false, message: "Creator not found" };
            }

            // Validate required fields
            if (!taskData.title || !taskData.description || !taskData.dueDate) {
                return { success: false, message: "Title, description, and due date are required" };
            }

            // Set creator and department if not provided
            const newTaskData = {
                ...taskData,
                createdBy: creator._id,
                department: taskData.department || creator.department,
                lastModifiedBy: creator._id
            };

            const newTask = new Task(newTaskData);
            await newTask.save();
            
            // Populate the task for return
            await newTask.populate([
                { path: 'createdBy', select: 'firstName lastName email' },
                { path: 'assignedTo', select: 'firstName lastName email' },
                { path: 'department', select: 'name' }
            ]);

            return { 
                success: true, 
                task: newTask.toObject(),
                message: "Task created successfully" 
            };
        } catch (error) {
            console.error('Error creating task:', error);
            return { success: false, message: "Failed to create task" };
        }
    }

    // Get tasks with filtering and role-based access
    static async getTasks(filters: {
        status?: string;
        priority?: string;
        category?: string;
        department?: string;
        assignedTo?: string;
        createdBy?: string;
        dueDateStart?: string;
        dueDateEnd?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        userEmail?: string;
        userRole?: string;
        userDepartment?: string;
    } = {}): Promise<{ tasks: TaskInterface[], total: number, stats: any }> {
        try {
            const {
                status = 'all',
                priority = 'all',
                category = 'all',
                department = 'all',
                assignedTo,
                createdBy,
                dueDateStart,
                dueDateEnd,
                search,
                page = 1,
                limit = 10,
                sortBy = 'dueDate',
                sortOrder = 'asc',
                userEmail,
                userRole,
                userDepartment
            } = filters;

            // Build base query
            const query: any = { isActive: true };

            // Role-based access control
            if (userRole && userEmail) {
                const user = await Registration.findOne({ email: userEmail });
                if (user) {
                    if (userRole === 'staff') {
                        // Staff can see:
                        // 1. Tasks assigned to them
                        // 2. Tasks created by them
                        // 3. All tasks in their department (department-wide visibility)
                        query.$or = [
                            { assignedTo: user._id },
                            { createdBy: user._id },
                            { department: user.department }
                        ];
                    } else if (userRole === 'department_head') {
                        // Department heads can see tasks in their department
                        query.department = user.department;
                    }
                    // Admin and Manager can see all tasks (no additional filtering)
                }
            }

            // Apply filters
            if (status && status !== 'all') {
                query.status = status;
            }

            if (priority && priority !== 'all') {
                query.priority = priority;
            }

            if (category && category !== 'all') {
                query.category = category;
            }

            if (department && department !== 'all') {
                query.department = department;
            }

            if (assignedTo) {
                query.assignedTo = assignedTo;
            }

            if (createdBy) {
                query.createdBy = createdBy;
            }

            // Date range filtering
            if (dueDateStart || dueDateEnd) {
                query.dueDate = {};
                if (dueDateStart) query.dueDate.$gte = new Date(dueDateStart);
                if (dueDateEnd) query.dueDate.$lte = new Date(dueDateEnd);
            }

            // Search functionality
            if (search && search.trim()) {
                const searchRegex = { $regex: search.trim(), $options: 'i' };
                query.$and = query.$and || [];
                query.$and.push({
                    $or: [
                        { title: searchRegex },
                        { description: searchRegex },
                        { category: searchRegex },
                        { tags: searchRegex }
                    ]
                });
            }

            // Get total count
            const total = await Task.countDocuments(query);

            // Build sort object
            const sortObj: any = {};
            sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Get tasks with pagination
            const tasks = await Task.find(query)
                .populate('createdBy', 'firstName lastName email')
                .populate('assignedTo', 'firstName lastName email')
                .populate('department', 'name')
                .populate('parentTask', 'title')
                .sort(sortObj)
                .limit(limit)
                .skip((page - 1) * limit)
                .lean();

            // Calculate statistics
            const stats = await this.calculateTaskStats(userRole, userEmail, userDepartment);

            return { tasks: tasks as TaskInterface[], total, stats };
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return {
                tasks: [],
                total: 0,
                stats: {
                    totalTasks: 0,
                    activeTasks: 0,
                    completedTasks: 0,
                    overdueTasks: 0,
                    highPriorityTasks: 0,
                    tasksThisWeek: 0
                }
            };
        }
    }

    // Calculate task statistics with role-based filtering
    static async calculateTaskStats(userRole?: string, userEmail?: string, userDepartment?: string): Promise<any> {
        try {
            let matchQuery: any = { isActive: true };

            // Apply role-based filtering to stats
            if (userRole && userEmail) {
                const user = await Registration.findOne({ email: userEmail });
                if (user) {
                    if (userRole === 'staff') {
                        // Staff stats should include all department tasks (matching the getTasks logic)
                        matchQuery.$or = [
                            { assignedTo: user._id },
                            { createdBy: user._id },
                            { department: user.department }
                        ];
                    } else if (userRole === 'department_head') {
                        matchQuery.department = user.department;
                    }
                }
            }

            const currentDate = new Date();
            const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
            const weekEnd = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));

            const [
                totalTasks,
                activeTasks,
                completedTasks,
                overdueTasks,
                highPriorityTasks,
                tasksThisWeek
            ] = await Promise.all([
                Task.countDocuments(matchQuery),
                Task.countDocuments({ ...matchQuery, status: { $ne: 'completed' } }),
                Task.countDocuments({ ...matchQuery, status: 'completed' }),
                Task.countDocuments({ 
                    ...matchQuery, 
                    status: { $ne: 'completed' },
                    dueDate: { $lt: new Date() } 
                }),
                Task.countDocuments({ ...matchQuery, priority: 'high' }),
                Task.countDocuments({ 
                    ...matchQuery,
                    dueDate: { $gte: weekStart, $lte: weekEnd }
                })
            ]);

            return {
                totalTasks,
                activeTasks,
                completedTasks,
                overdueTasks,
                highPriorityTasks,
                tasksThisWeek
            };
        } catch (error) {
            console.error('Error calculating task stats:', error);
            return {
                totalTasks: 0,
                activeTasks: 0,
                completedTasks: 0,
                overdueTasks: 0,
                highPriorityTasks: 0,
                tasksThisWeek: 0
            };
        }
    }

    // Get a single task by ID
    static async getTaskById(id: string, userEmail?: string): Promise<TaskInterface | null> {
        try {
            const task = await Task.findById(id)
                .populate('createdBy', 'firstName lastName email')
                .populate('assignedTo', 'firstName lastName email')
                .populate('department', 'name')
                .populate('parentTask', 'title')
                .populate('dependencies', 'title status')
                .populate('comments.user', 'firstName lastName email')
                .populate('timeEntries.user', 'firstName lastName email')
                .lean();

            if (!task) return null;

            // Role-based access check
            if (userEmail) {
                const user = await Registration.findOne({ email: userEmail });
                if (user) {
                    if (user.role === 'staff') {
                        // Staff can access tasks:
                        // 1. Assigned to them
                        // 2. Created by them
                        // 3. In their department (department-wide visibility)
                        const isAssigned = task.assignedTo.some((assignee: any) => 
                            assignee._id.toString() === user._id.toString());
                        const isCreator = task.createdBy._id.toString() === user._id.toString();
                        const isDepartmentTask = task.department._id.toString() === user.department.toString();
                        
                        if (!isAssigned && !isCreator && !isDepartmentTask) return null;
                    } else if (user.role === 'department_head') {
                        // Department head can access all tasks in their department
                        const isDepartmentTask = task.department._id.toString() === user.department.toString();
                        
                        if (!isDepartmentTask) return null;
                    }
                    // Admin and Manager can access all tasks (no restriction)
                }
            }

            return task as TaskInterface;
        } catch (error) {
            console.error('Error fetching task:', error);
            return null;
        }
    }

    // Update task
    static async updateTask(
        id: string, 
        updateData: Partial<TaskInterface>, 
        userEmail: string
    ): Promise<{ success: boolean; task?: TaskInterface; message: string }> {
        try {
            const user = await Registration.findOne({ email: userEmail });
            if (!user) {
                return { success: false, message: "User not found" };
            }

            const task = await Task.findById(id);
            if (!task) {
                return { success: false, message: "Task not found" };
            }

            // Role-based update permissions
            const canUpdate = this.canUserUpdateTask(task, user);
            if (!canUpdate) {
                return { success: false, message: "You don't have permission to update this task" };
            }

            // Update task
            const updatedTask = await Task.findByIdAndUpdate(
                id,
                { 
                    ...updateData, 
                    lastModifiedBy: user._id,
                    updatedAt: new Date()
                },
                { new: true }
            ).populate([
                { path: 'createdBy', select: 'firstName lastName email' },
                { path: 'assignedTo', select: 'firstName lastName email' },
                { path: 'department', select: 'name' }
            ]);

            return { 
                success: true, 
                task: updatedTask?.toObject(),
                message: "Task updated successfully" 
            };
        } catch (error) {
            console.error('Error updating task:', error);
            return { success: false, message: "Failed to update task" };
        }
    }

    // Add comment to task with threading support
    static async addComment(
        taskId: string, 
        message: string, 
        userEmail: string,
        mentions: string[] = [],
        parentCommentId?: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const user = await Registration.findOne({ email: userEmail });
            if (!user) {
                return { success: false, message: "User not found" };
            }

            const task = await Task.findById(taskId);
            if (!task) {
                return { success: false, message: "Task not found" };
            }

            // Check if user has permission to comment
            const canComment = await this.canUserComment(task, user);
            if (!canComment) {
                return { success: false, message: "You don't have permission to comment on this task" };
            }

            // Process mentions
            const mentionedUsers = mentions.length > 0 
                ? await Registration.find({ email: { $in: mentions } })
                : [];

            const comment = {
                user: user._id,
                message,
                timestamp: new Date(),
                mentions: mentionedUsers.map(u => u._id),
                parentComment: parentCommentId || null,
                replies: []
            };

            // If it's a reply, add to parent comment's replies
            if (parentCommentId) {
                const parentComment = task.comments.id(parentCommentId);
                if (parentComment) {
                    parentComment.replies = parentComment.replies || [];
                    parentComment.replies.push(comment as any);
                } else {
                    return { success: false, message: "Parent comment not found" };
                }
            } else {
                // Add as top-level comment
                task.comments.push(comment as any);
            }

            await task.save();

            return { success: true, message: "Comment added successfully" };
        } catch (error) {
            console.error('Error adding comment:', error);
            return { success: false, message: "Failed to add comment" };
        }
    }

    // Check if user can comment on task
    private static async canUserComment(task: any, user: any): Promise<boolean> {
        // Admin and Manager can comment on any task
        if (user.role === 'admin' || user.role === 'manager') {
            return true;
        }
        
        // Department head can comment on tasks in their department
        if (user.role === 'department_head' && 
            task.department.toString() === user.department.toString()) {
            return true;
        }
        
        // Staff can comment on tasks:
        // 1. Assigned to them
        // 2. Created by them  
        // 3. In their department (department-wide visibility)
        if (user.role === 'staff') {
            const isAssigned = task.assignedTo.some((assignee: any) => 
                assignee.toString() === user._id.toString());
            const isCreator = task.createdBy.toString() === user._id.toString();
            const isDepartmentMember = task.department.toString() === user.department.toString();
            
            return isAssigned || isCreator || isDepartmentMember;
        }
        
        return false;
    }

    // Add time entry
    static async addTimeEntry(
        taskId: string,
        hours: number,
        description: string,
        userEmail: string,
        date: Date = new Date()
    ): Promise<{ success: boolean; message: string }> {
        try {
            const user = await Registration.findOne({ email: userEmail });
            if (!user) {
                return { success: false, message: "User not found" };
            }

            const task = await Task.findById(taskId);
            if (!task) {
                return { success: false, message: "Task not found" };
            }

            const timeEntry = {
                user: user._id,
                hours,
                date,
                description
            };

            task.timeEntries.push(timeEntry as any);
            task.actualHours = (task.actualHours || 0) + hours;
            await task.save();

            return { success: true, message: "Time entry added successfully" };
        } catch (error) {
            console.error('Error adding time entry:', error);
            return { success: false, message: "Failed to add time entry" };
        }
    }

    // Check if user can update task
    private static canUserUpdateTask(task: any, user: any): boolean {
        // Admin and Manager can update any task
        if (user.role === 'admin' || user.role === 'manager') {
            return true;
        }
        
        // Department head can update certain aspects of department tasks
        if (user.role === 'department_head' && 
            task.department.toString() === user.department.toString()) {
            // Department heads can always update status and assignment for their department tasks
            // This method is used for general updates - specific permissions are handled elsewhere
            return true;
        }
        
        // Staff can update tasks assigned to them or created by them
        if (user.role === 'staff') {
            const isAssigned = task.assignedTo.some((assignee: any) => 
                assignee.toString() === user._id.toString()
            );
            const isCreator = task.createdBy.toString() === user._id.toString();
            return isAssigned || isCreator;
        }
        
        return false;
    }

    // Check if user can change task status (more permissive than full edit)
    static canUserChangeStatus(task: any, user: any): boolean {
        // Admin and Manager can change any task status
        if (user.role === 'admin' || user.role === 'manager') {
            return true;
        }
        
        // Department head can change status of tasks in their department
        if (user.role === 'department_head' && 
            task.department.toString() === user.department.toString()) {
            return true;
        }
        
        // Staff can change status only if task is assigned to them
        if (user.role === 'staff') {
            return task.assignedTo.some((assignee: any) => 
                assignee.toString() === user._id.toString());
        }
        
        return false;
    }

    // Check if user can assign tasks to department members
    static canUserAssignTasks(task: any, user: any): boolean {
        // Admin and Manager can assign any task
        if (user.role === 'admin' || user.role === 'manager') {
            return true;
        }
        
        // Department head can assign tasks in their department
        if (user.role === 'department_head' && 
            task.department.toString() === user.department.toString()) {
            return true;
        }
        
        return false;
    }

    // Get user's dashboard data
    static async getDashboardData(userEmail: string): Promise<any> {
        try {
            const user = await Registration.findOne({ email: userEmail });
            if (!user) {
                return { error: "User not found" };
            }

            const stats = await this.calculateTaskStats(user.role, userEmail, user.department);
            
            // Get recent tasks based on role
            let recentTasksQuery: any = { isActive: true };
            
            if (user.role === 'staff') {
                recentTasksQuery.$or = [
                    { assignedTo: user._id },
                    { createdBy: user._id }
                ];
            } else if (user.role === 'department_head') {
                recentTasksQuery.department = user.department;
            }

            const recentTasks = await Task.find(recentTasksQuery)
                .populate('assignedTo', 'firstName lastName')
                .populate('createdBy', 'firstName lastName')
                .sort({ updatedAt: -1 })
                .limit(5)
                .lean();

            // Get upcoming deadlines
            const upcomingDeadlines = await Task.find({
                ...recentTasksQuery,
                status: { $ne: 'completed' },
                dueDate: { 
                    $gte: new Date(), 
                    $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
                }
            })
                .populate('assignedTo', 'firstName lastName')
                .sort({ dueDate: 1 })
                .limit(5)
                .lean();

            return {
                stats,
                recentTasks,
                upcomingDeadlines,
                user: {
                    name: `${user.firstName} ${user.lastName}`,
                    role: user.role,
                    department: user.department
                }
            };
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            return { error: "Failed to load dashboard data" };
        }
    }

    // Legacy methods for compatibility with existing routes
    static async CreateTaskForDepartment(data: any) {
        try {
            const taskData = {
                title: data.title,
                description: data.description,
                category: data.category || 'Operational Tasks',
                priority: data.priority || 'medium',
                department: data.departmentId,
                dueDate: new Date(data.dueDate),
                tags: data.specialInstructions ? [data.specialInstructions] : [],
                approvalRequired: false,
                isRecurring: false
            };

            return await this.createTask(taskData, data.user.email);
        } catch (error) {
            console.error('Error in CreateTaskForDepartment:', error);
            return { success: false, message: "Failed to create task for department" };
        }
    }

    static async CreateTaskForMember(data: any) {
        try {
            const taskData = {
                title: data.title,
                description: data.description,
                category: data.category || 'Operational Tasks',
                priority: data.priority || 'medium',
                department: data.user.department,
                assignedTo: [data.assignedMemberId],
                dueDate: new Date(data.dueDate),
                tags: data.hodInstructions ? [data.hodInstructions] : [],
                approvalRequired: false,
                isRecurring: false
            };

            return await this.createTask(taskData, data.user.email);
        } catch (error) {
            console.error('Error in CreateTaskForMember:', error);
            return { success: false, message: "Failed to create task for member" };
        }
    }

    static async UpdateTaskStatusWithPermissions(data: any) {
        try {
            return await this.updateTask(data.taskId, { status: data.status }, data.user.email);
        } catch (error) {
            console.error('Error in UpdateTaskStatusWithPermissions:', error);
            return { success: false, message: "Failed to update task status" };
        }
    }

    static async AddCommentWithReply(data: any) {
        try {
            return await this.addComment(data.taskId, data.comment, data.user.email);
        } catch (error) {
            console.error('Error in AddCommentWithReply:', error);
            return { success: false, message: "Failed to add comment" };
        }
    }

    static async UpdateTask(data: any) {
        try {
            const updateData = {
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined
            };

            return await this.updateTask(data.taskId, updateData, data.user.email);
        } catch (error) {
            console.error('Error in UpdateTask:', error);
            return { success: false, message: "Failed to update task" };
        }
    }

    static async DeleteTask(data: any) {
        try {
            const result = await this.updateTask(data.taskId, { isActive: false }, data.user.email);
            return { 
                success: result.success, 
                message: result.success ? "Task deleted successfully" : result.message 
            };
        } catch (error) {
            console.error('Error in DeleteTask:', error);
            return { success: false, message: "Failed to delete task" };
        }
    }

    static async AssignTaskToMember(data: any) {
        try {
            const updateData = {
                assignedTo: [data.assignedMemberId],
                tags: data.hodInstructions ? [data.hodInstructions] : undefined,
                priority: data.modifyPriority || undefined,
                dueDate: data.modifyDueDate ? new Date(data.modifyDueDate) : undefined
            };

            return await this.updateTask(data.taskId, updateData, data.user.email);
        } catch (error) {
            console.error('Error in AssignTaskToMember:', error);
            return { success: false, message: "Failed to assign task" };
        }
    }
}

// Export as both named and default export for compatibility
export default TaskController; 