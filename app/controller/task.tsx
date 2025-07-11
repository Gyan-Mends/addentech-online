import { json } from "@remix-run/node";
import mongoose from 'mongoose';
import Task, { TaskInterface } from '~/modal/task';
import Registration from '~/modal/registration';
import TaskActivity from '~/modal/taskActivity';
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

            // Log task creation activity
            await this.logActivity(
                newTask._id.toString(),
                creatorEmail,
                'created',
                `Task "${taskData.title}" created`,
                undefined,
                JSON.stringify({
                    title: taskData.title,
                    priority: taskData.priority,
                    dueDate: taskData.dueDate,
                    category: taskData.category
                }),
                {
                    priority: taskData.priority,
                    estimatedHours: taskData.estimatedHours
                }
            );

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
                        // 1. Tasks assigned to them (assignedTo is an array)
                        // 2. Tasks created by them
                        // 3. All tasks in their department (department-wide visibility)
                        query.$or = [
                            { assignedTo: { $in: [user._id] } },
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
                // assignedTo is an array field, so use $in for proper querying
                query.assignedTo = { $in: [assignedTo] };
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
                .populate('assignedTo', 'firstName lastName email role')
                .populate('department', 'name')
                .populate('parentTask', 'title')
                .populate('assignmentHistory.assignedBy', 'firstName lastName email role')
                .populate('assignmentHistory.assignedTo', 'firstName lastName email role')
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
                            { assignedTo: { $in: [user._id] } },
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
                .populate('assignmentHistory.assignedBy', 'firstName lastName email role')
                .populate('assignmentHistory.assignedTo', 'firstName lastName email role')
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

            // Log task update activity
            const changeDescriptions = [];
            if (updateData.title) changeDescriptions.push(`title updated`);
            if (updateData.description) changeDescriptions.push(`description updated`);
            if (updateData.priority) changeDescriptions.push(`priority changed to ${updateData.priority}`);
            if (updateData.dueDate) changeDescriptions.push(`due date updated`);
            if (updateData.status) changeDescriptions.push(`status changed to ${updateData.status}`);

            if (changeDescriptions.length > 0) {
                await this.logActivity(
                    id,
                    userEmail,
                    updateData.status ? 'status_changed' : 'updated',
                    `Task updated: ${changeDescriptions.join(', ')}`,
                    undefined,
                    JSON.stringify(updateData),
                    {
                        priority: updateData.priority,
                        estimatedHours: updateData.estimatedHours
                    }
                );
            }

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

            // Log comment activity
            await this.logActivity(
                taskId,
                userEmail,
                'commented',
                `${parentCommentId ? 'Replied to comment' : 'Added comment'}: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
                undefined,
                message
            );

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

            // Log time entry activity
            await this.logActivity(
                taskId,
                userEmail,
                'time_logged',
                `Logged ${hours} hours${description ? ` - ${description}` : ''}`,
                undefined,
                hours.toString(),
                {
                    timeLogged: hours
                }
            );

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
                    { assignedTo: { $in: [user._id] } },
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

    // Hierarchical task assignment - preserves assignment chain
    static async assignTaskHierarchically(
        taskId: string,
        newAssigneeId: string,
        assignedByUserId: string,
        instructions: string = ''
    ): Promise<{ success: boolean; task?: TaskInterface; message: string }> {
        try {
            console.log('🔄 Starting hierarchical assignment:');
            console.log('- Task ID:', taskId);
            console.log('- New Assignee ID:', newAssigneeId);
            console.log('- Assigned By User ID (email):', assignedByUserId);
            console.log('- Instructions:', instructions);

            const [task, assignedByUser, newAssignee] = await Promise.all([
                Task.findById(taskId),
                Registration.findOne({ email: assignedByUserId }),
                Registration.findById(newAssigneeId)
            ]);

            console.log('📋 Database lookup results:');
            console.log('- Task found:', !!task, task ? task.title : 'N/A');
            console.log('- Assigned by user found:', !!assignedByUser, assignedByUser ? `${assignedByUser.firstName} ${assignedByUser.lastName}` : 'N/A');
            console.log('- New assignee found:', !!newAssignee, newAssignee ? `${newAssignee.firstName} ${newAssignee.lastName}` : 'N/A');

            if (!task) {
                return { success: false, message: "Task not found" };
            }

            if (!assignedByUser) {
                return { success: false, message: "Assigning user not found" };
            }

            if (!newAssignee) {
                return { success: false, message: "Assignee not found" };
            }

            // Determine assignment level
            const assignmentLevel = (assignedByUser.role === 'admin' || assignedByUser.role === 'manager') 
                ? 'initial' 
                : 'delegation';

            // For hierarchical assignment:
            // - If it's an initial assignment (admin/manager to HOD), replace assignedTo
            // - If it's a delegation (HOD to member), add to assignedTo and keep the chain
            let updatedAssignedTo;
            
            if (assignmentLevel === 'initial') {
                // Admin/Manager assigning to HOD - replace the assignment
                updatedAssignedTo = [newAssigneeId];
            } else {
                // HOD delegating to member - preserve the chain but ensure HOD is included
                const currentAssignees = task.assignedTo || [];
                const assignedByUserId_obj = assignedByUser._id.toString();
                
                // Add the assigning user (HOD) if not already in the list
                if (!currentAssignees.some(id => id.toString() === assignedByUserId_obj)) {
                    currentAssignees.push(assignedByUser._id);
                }
                
                // Add the new assignee if not already in the list
                if (!currentAssignees.some(id => id.toString() === newAssigneeId)) {
                    currentAssignees.push(newAssigneeId);
                }
                
                updatedAssignedTo = currentAssignees;
            }

            // Create assignment history entry
            const assignmentHistoryEntry = {
                assignedBy: assignedByUser._id,
                assignedTo: newAssignee._id,
                assignedAt: new Date(),
                assignmentLevel,
                instructions
            };

            // Update the task
            const updatedTask = await Task.findByIdAndUpdate(
                taskId,
                {
                    assignedTo: updatedAssignedTo,
                    lastModifiedBy: assignedByUser._id,
                    $push: { assignmentHistory: assignmentHistoryEntry },
                    updatedAt: new Date()
                },
                { new: true }
            ).populate([
                { path: 'createdBy', select: 'firstName lastName email role' },
                { path: 'assignedTo', select: 'firstName lastName email role' },
                { path: 'department', select: 'name' },
                { path: 'assignmentHistory.assignedBy', select: 'firstName lastName email role' },
                { path: 'assignmentHistory.assignedTo', select: 'firstName lastName email role' }
            ]);

            // Log assignment activity
            await this.logActivity(
                taskId,
                assignedByUserId,
                assignmentLevel === 'initial' ? 'assigned' : 'delegated',
                `Task ${assignmentLevel === 'initial' ? 'assigned' : 'delegated'} to ${newAssignee.firstName} ${newAssignee.lastName}`,
                undefined,
                `${newAssignee.firstName} ${newAssignee.lastName}`,
                {
                    assignedTo: [newAssignee._id],
                    assignedBy: assignedByUser._id,
                    assignmentLevel,
                    instructions
                }
            );

            return {
                success: true,
                task: updatedTask?.toObject(),
                message: `Task successfully assigned to ${newAssignee.firstName} ${newAssignee.lastName}`
            };

        } catch (error) {
            console.error('Error in hierarchical task assignment:', error);
            return { success: false, message: "Failed to assign task" };
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

    // Activity logging helper method
    static async logActivity(
        taskId: string,
        userEmail: string,
        activityType: string,
        description: string,
        previousValue?: string,
        newValue?: string,
        metadata?: any
    ): Promise<void> {
        try {
            const [user, task] = await Promise.all([
                Registration.findOne({ email: userEmail }),
                Task.findById(taskId)
            ]);

            if (!user || !task) return;

            await TaskActivity.create({
                taskId,
                userId: user._id,
                department: task.department,
                activityType,
                activityDescription: description,
                previousValue,
                newValue,
                metadata,
                timestamp: new Date()
            });

            console.log(`📊 Activity logged: ${description} by ${user.firstName} ${user.lastName}`);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }
}

// Export as both named and default export for compatibility
export default TaskController; 