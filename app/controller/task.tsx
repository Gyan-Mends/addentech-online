import { json } from "@remix-run/node";
import Registration from "~/modal/registration";
import Task from "~/modal/task";
import Departments from "~/modal/department";
import { getSession } from "~/session";

// Role-based access control helper functions

// Check if user can create tasks for a specific department
const canCreateTaskForDepartment = (user: any, departmentId: string) => {
    if (!user) return false;
    
    // Admin and managers can create tasks for any department
    if (user.role === "admin" || user.role === "manager") return true;
    
    // Department heads can only create tasks for their own department
    if (user.role === "head" && user.department.toString() === departmentId) return true;
    
    return false;
};

// Check if user can assign tasks to a specific user
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

// Check if user can comment on a task
const canCommentOnTask = (user: any, task: any) => {
    if (!user || !task) return false;
    
    // Admin and managers can comment on any task
    if (user.role === "admin" || user.role === "manager") return true;
    
    // Department heads can comment on tasks in their department
    if (user.role === "head" && user.department.toString() === task.department.toString()) return true;
    
    // Any user assigned to the task can comment
    if (task.assignment && task.assignment.length > 0) {
        const isAssignee = task.assignment.some((assignment: any) => 
            assignment.assignee && assignment.assignee.toString() === user._id.toString());
        if (isAssignee) return true;
    }
    
    // Creator of the task can comment
    if (task.createdBy.toString() === user._id.toString()) return true;
    
    return false;
};

// Define valid task status types to ensure type safety
type TaskStatus = 'Unclaimed' | 'Approved' | 'Assigned' | 'In Progress' | 'On Hold' | 
                 'Under Review' | 'Completed' | 'Rejected' | 'Cancelled' | 'Closed';

// Valid task status transitions with proper typing
const TASK_STATUS_TRANSITIONS: Record<TaskStatus, string[]> = {
    "Unclaimed": ["In Progress", "Approved"],
    "Approved": ["Assigned", "In Progress", "Completed"],
    "Assigned": ["In Progress", "On Hold"],
    "In Progress": ["On Hold", "Under Review", "Completed"],
    "On Hold": ["In Progress", "Cancelled"],
    "Under Review": ["In Progress", "Completed", "Rejected"],
    "Completed": ["Closed"],
    "Rejected": ["In Progress"],
    "Cancelled": [],
    "Closed": []
};

// Check if status transition is valid
const isValidStatusTransition = (currentStatus: string, newStatus: string) => {
    if (!currentStatus || !TASK_STATUS_TRANSITIONS[currentStatus as TaskStatus]) return false;
    return TASK_STATUS_TRANSITIONS[currentStatus as TaskStatus].includes(newStatus);
};

class TaskController {
    async CreateTask({
        title,
        description,
        department,
        priority,
        dueDate,
        status,
        createdBy,
        intent,
        user,
        assignee
    }: {
        title: string;
        description: string;
        department: string;
        createdBy: string;
        priority: string;
        dueDate: string;
        status: string;
        intent: string;
        user: any;
        assignee?: string[];
    }) {
        try {
            if (intent === "create") {
                // Check if user has permission to create task for this department
                if (!canCreateTaskForDepartment(user, department)) {
                    return json({
                        message: 'You do not have permission to create tasks for this department',
                        success: false,
                        status: 403
                    });
                }
                
                // Check if a task with the same name already exists
                const taskCheck = await Task.findOne({ title });

                if (taskCheck) {
                    return json({
                        message: "Task with this name already exists",
                        success: false,
                        status: 400,
                    });
                }

                // Create task data
                const taskData: any = {
                    createdBy,
                    title,
                    description,
                    priority: priority || 'Medium',
                    department,
                    dueDate,
                    status: status || 'Unclaimed',
                    assignment: []
                };
                
                // Handle assignees if provided
                if (assignee && assignee.length > 0) {
                    // Check if user can assign tasks to these users
                    for (const assigneeId of assignee) {
                        const canAssign = await canAssignTaskToUser(user, department, assigneeId);
                        if (!canAssign) {
                            return json({
                                message: 'You do not have permission to assign tasks to one or more of the selected users',
                                success: false,
                                status: 403
                            });
                        }
                    }
                    
                    taskData.assignment = assignee.map(a => ({
                        assignee: a,
                        assignedAt: new Date(),
                        status: 'Assigned'
                    }));
                    taskData.status = 'Assigned';
                }

                // Create new task
                const task = new Task(taskData);

                // Save task details
                const saveTaskDetails = await task.save();

                if (saveTaskDetails) {
                    // Fetch the created task with populated references
                    const createdTask = await Task.findById(task._id)
                        .populate('department')
                        .populate('createdBy')
                        .populate({
                            path: 'assignment',
                            populate: {
                                path: 'assignee',
                                model: 'registration'
                            }
                        })
                        .populate({
                            path: 'comments',
                            populate: {
                                path: 'createdBy',
                                model: 'registration'
                            }
                        });
                        
                    return json({
                        message: "Task created successfully",
                        task: createdTask,
                        success: true,
                        status: 200,
                    });
                }

                return json({
                    message: "Unable to create task",
                    success: false,
                    status: 500,
                });
            }

            return json({
                message: "Invalid intent",
                success: false,
                status: 400,
            });
        } catch (error: any) {
            console.log(error);
            return json({
                message: error.message,
                success: false,
                status: 500,
            });
        }
    }

    async AssignTask({
        id,
        team,
        lead,
        assignee,
        description,
        priority,
        dueDate,
        status,
        createdBy,
        user
    }: {
        id: string;
        team: string;
        lead: string;
        assignee: string;
        description: string;
        priority: string;
        dueDate: string;
        status: string;
        createdBy: string;
        user: any;
    }) {
        try {
            // Check if the task exists
            const task = await Task.findById(id).populate('department');

            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404, // Not Found
                });
            }
            
            // Check if user has permission to assign tasks for this department
            const departmentId = typeof task.department === 'string' 
                ? task.department 
                : (task.department && typeof task.department === 'object' && task.department._id) 
                ? task.department._id.toString() 
                : '';
                
            if (!canCreateTaskForDepartment(user, departmentId)) {
                return json({
                    message: "You do not have permission to assign tasks for this department",
                    success: false,
                    status: 403
                });
            }
            
            // Check if user can assign to the specified assignee
            const canAssign = await canAssignTaskToUser(user, departmentId, assignee);
            if (!canAssign) {
                return json({
                    message: "You do not have permission to assign tasks to this user",
                    success: false,
                    status: 403
                });
            }

            // Validate the task status
            if (task.status !== "Approved") {
                return json({
                    message: "Task cannot be assigned because it is not Approved",
                    success: false,
                    status: 400, // Bad Request
                });
            }

            // Update task with assignment details
            const assign = await Task.findByIdAndUpdate(
                id,
                {
                    $push: {
                        assignment: {
                            lead,
                            description,
                            team,
                            priority,
                            dueDate,
                            status,
                            createdBy,
                            assignee,
                        },
                    },
                },
                { new: true }
            );
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
                status: 500,
            });
        }
    }

    async assignmentComment({
        AssignmentId,
        id,
        comment,
        createdBy,
        user
    }: {
        AssignmentId: string
        id: string;
        comment: string;
        createdBy: string;
        user: any;
    }) {
        try {
            // Find the task by ID with proper typecasting
            const task = await Task.findById(id).populate('department').populate('createdBy');

            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404,
                });
            }
            
            // Check if user has permission to comment on this task
            if (!canCommentOnTask(user, task)) {
                return json({
                    message: "You do not have permission to comment on this task",
                    success: false,
                    status: 403
                });
            }

            // Ensure task has assignment property and type cast appropriately
            const taskWithAssignments = task as any;
            
            // Find the assignment by ID within the task
            const assignmentIndex = taskWithAssignments.assignment ? 
                taskWithAssignments.assignment.findIndex(
                    (assignment: any) => assignment._id.toString() === AssignmentId
                ) : -1;

            if (assignmentIndex === -1) {
                return json({
                    message: "Assignment not found",
                    success: false,
                    status: 404,
                });
            }
            
            // Check if user is assigned to this assignment or has admin/manager role
            const isAssignee = taskWithAssignments.assignment[assignmentIndex].assignee &&
                taskWithAssignments.assignment[assignmentIndex].assignee.toString() === user._id.toString();
                
            if (!isAssignee && user.role !== 'admin' && user.role !== 'manager' && 
                !(user.role === 'head' && user.department.toString() === task.department.toString())) {
                return json({
                    message: "You do not have permission to comment on this assignment",
                    success: false,
                    status: 403
                });
            }

            // Add comment to the assignment using type casting to avoid errors
            taskWithAssignments.assignment[assignmentIndex].comments = 
                taskWithAssignments.assignment[assignmentIndex].comments || [];
                
            taskWithAssignments.assignment[assignmentIndex].comments.push({
                comment,
                createdBy,
                createdAt: new Date(),
            });

            // Save the updated task
            const updatedTask = await taskWithAssignments.save();
            
            // Fetch the updated task with populated references
            const populatedTask = await Task.findById(taskWithAssignments._id)
                .populate('department')
                .populate('createdBy')
                .populate({
                    path: 'assignment.assignee',
                    model: 'registration'
                })
                .populate({
                    path: 'assignment.comments.createdBy',
                    model: 'registration',
                    select: 'firstName lastName image'
                });

            if (populatedTask) {
                return json({
                    message: "Comment added to assignment successfully",
                    task: populatedTask,
                    success: true,
                    status: 200,
                });
            }

            return json({
                message: "Unable to add comment to assignment",
                success: false,
                status: 500,
            });
        } catch (error: any) {
            console.log(error);
            return json({
                message: error.message,
                success: false,
                status: 500,
            });
        }
    }

    async FetchTasks({
        request,
        page,
        search_term,
        limit = 7,
        departmentFilter,
        user: providedUser
    }: {
        request?: Request;
        page: number;
        search_term?: string;
        limit?: number;
        departmentFilter?: string;
        user?: any;
    } = { page: 1 }) {
        // Calculate the number of documents to skip
        const skipCount = (page - 1) * limit;

        // Create a search filter based on the search term
        const searchFilter: any = {};
        if (search_term) {
            searchFilter.$or = [
                { title: { $regex: search_term, $options: "i" } },
                { description: { $regex: search_term, $options: "i" } },
            ];
        }

        try {
            // Determine the current user - either from the provided user parameter or from the session
            let user = providedUser;
            
            if (!user && request) {
                const session = await getSession(request.headers.get("Cookie"));
                const token = session?.get("email");
                if (token) {
                    user = await Registration.findOne({ email: token });
                }
            }
            
            if (!user) {
                return json({
                    message: "User not authenticated",
                    success: false,
                    status: 401
                });
            }
            
            // Apply role-based filtering
            let taskQuery: any = {};
            
            // Admin and manager can see all tasks (optionally filtered by department)
            if (user.role === "admin" || user.role === "manager") {
                if (departmentFilter) {
                    taskQuery.department = departmentFilter;
                }
            }
            // Department head can only see their department's tasks
            else if (user.role === "head") {
                taskQuery.department = user.department;
            }
            // Staff can only see tasks they're assigned to or created
            else {
                taskQuery.$or = [
                    { createdBy: user._id },
                    { "assignment.assignee": user._id }
                ];
            }
            
            // Combine search filter with role-based filter
            const combinedFilter = { ...taskQuery, ...searchFilter };

            // Count total tasks based on the user's permissions
            const taskCount = await Task.countDocuments(combinedFilter).exec();
            const totalPages = Math.ceil(taskCount / limit);

            // Fetch tasks based on the combined filter
            const filteredTasks = await Task.find(combinedFilter)
                .skip(skipCount)
                .limit(limit)
                .sort({ createdAt: -1 }) // Sort by most recent first
                .populate("department")
                .populate("createdBy")
                .populate({
                    path: "assignment",
                    populate: {
                        path: "assignee",
                        model: "registration",
                        select: "firstName lastName email image role department"
                    }
                })
                .populate({
                    path: "comments",
                    populate: {
                        path: "createdBy",
                        model: "registration",
                        select: "firstName lastName image"
                    }
                })
                .exec();
                
            // Get task counts by status for statistics
            const totalUnclaimed = await Task.countDocuments({ ...combinedFilter, status: "Unclaimed" });
            const totalApproved = await Task.countDocuments({ ...combinedFilter, status: "Approved" });
            const totalInProgress = await Task.countDocuments({ ...combinedFilter, status: "In Progress" });
            const totalUnderReview = await Task.countDocuments({ ...combinedFilter, status: "Under Review" });
            const totalCompleted = await Task.countDocuments({ ...combinedFilter, status: "Completed" });
            const totalRejected = await Task.countDocuments({ ...combinedFilter, status: "Rejected" });
            const totalClosed = await Task.countDocuments({ ...combinedFilter, status: "Closed" });
            
            // Get department staff if user is a department head
            let departmentStaff: any[] = [];
            if (user.role === "head") {
                departmentStaff = await Registration.find(
                    { department: user.department, role: "staff" },
                    "_id firstName lastName email image"
                );
            }

            return json({
                tasks: filteredTasks,
                user: {
                    id: user._id,
                    role: user.role,
                    department: user.department
                },
                departmentStaff: departmentStaff || [],
                totals: {
                    unclaimed: totalUnclaimed,
                    approved: totalApproved,
                    inProgress: totalInProgress,
                    underReview: totalUnderReview,
                    completed: totalCompleted,
                    rejected: totalRejected,
                    closed: totalClosed,
                    pages: {
                        totalPages,
                        page,
                    },
                    taskCount,
                },
                success: true,
                status: 200
            });
        } catch (error: any) {
            console.error("Error Fetching Tasks:", error.message);

            return json({
                message: error.message,
                success: false,
                status: 500,
            });
        }
    }

    async UpdateProjectkStatus({
        status,
        id,
    }: {
        id: string,
        status: string
    }) {
        try {
            // Validate status against schema enum values
            const validStatuses = ["Unclaimed", "Approved"];
            if (!validStatuses.includes(status)) {
                return json({
                    message: "Invalid status value. Allowed values are 'Unclaimed' and 'Approved'.",
                    success: false,
                    status: 400, // Bad Request
                });
            }

            const updateUser = await Task.findByIdAndUpdate(
                id,
                { status },
                { new: true } // Return the updated document
            );

            if (updateUser) {
                return json({
                    message: "Task Status Updated Successfully",
                    success: true,
                    status: 200, // Success
                });
            } else {
                return json({
                    message: "Unable to update this record",
                    success: false,
                    status: 404, // Not Found
                });
            }
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
                status: 500, // Internal Server Error
            });
        }
    }

    async UpdateTaskkStatus({
        status,
        id,
    }: {
        id: string,
        status: string
    }) {
        try {
            const updateUser = await Task.findByIdAndUpdate(
                id,
                { status },
                { new: true } // Return the updated document
            );

            if (updateUser) {
                return json({
                    message: "Task Status Updated Successfully",
                    success: true,
                    status: 200, // Success
                });
            } else {
                return json({
                    message: "Unable to update this record",
                    success: false,
                    status: 404, // Not Found
                });
            }
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
                status: 500, // Internal Server Error
            });
        }
    }

    async UpdatePriority({
        priority,
        id,
    }: {
        id: string,
        priority: string
    }) {
        try {
            const updateUser = await Task.findByIdAndUpdate(
                id,
                { priority },
                { new: true } // Return the updated document
            );

            if (updateUser) {
                return json({
                    message: "Task Status Updated Successfully",
                    success: true,
                    status: 200, // Success
                });
            } else {
                return json({
                    message: "Unable to update this record",
                    success: false,
                    status: 404, // Not Found
                });
            }
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
                status: 500, // Internal Server Error
            });
        }
    }

    async DeleteProject({
        id,
    }: {
        id: string,
    }) {
        const deleteUser = await Task.findByIdAndDelete(id);
        if (deleteUser) {
            return json({
                message: "Project delete successfully",
                success: true,
                status: 500,
            })
        } else {
            return json({
                message: "Unable to delete project",
                success: false,
                status: 500
            })
        }
    }

    // New methods to support the task management feature

    // Get a single task by ID
    async GetSingleTask(taskId: string) {
        try {
            const task = await Task.findById(taskId)
                .populate("department", "name")
                .populate("createdBy", "firstName lastName email")
                .populate("comments.createdBy", "firstName lastName email")
                .populate("assignment.lead", "firstName lastName email")
                .populate("assignment.assignee", "firstName lastName email");

            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404,
                });
            }

            return json({
                message: "Task retrieved successfully",
                success: true,
                status: 200,
                data: task,
            });
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
                status: 500,
            });
        }
    }

    // Get tasks by department
    async GetTasksByDepartment(departmentId: string) {
        try {
            const tasks = await Task.find({ department: departmentId })
                .populate("department", "name")
                .populate("createdBy", "firstName lastName email")
                .sort({ createdAt: -1 });

            return json({
                message: "Department tasks retrieved successfully",
                success: true,
                status: 200,
                data: tasks,
            });
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
                status: 500,
            });
        }
    }

    // Get all tasks
    async GetAllTasks() {
        try {
            const tasks = await Task.find()
                .populate("department", "name")
                .populate("createdBy", "firstName lastName email")
                .sort({ createdAt: -1 });

            return json({
                message: "All tasks retrieved successfully",
                success: true,
                status: 200,
                data: tasks,
            });
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
                status: 500,
            });
        }
    }
}

const taskController = new TaskController();
export default taskController;
