import { json } from "@remix-run/node";
import Registration from "~/modal/registration";
import Task from "~/modal/task";
import { getSession } from "~/session";

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
    }: {
        title: string;
        description: string;
        department: string;
        createdBy: string;
        priority: string;
        dueDate: string;
        status: string;
        intent: string;
    }) {
        try {
            if (intent === "create") {
                // Check if a task with the same name already exists
                const taskCheck = await Task.findOne({ title });

                if (taskCheck) {
                    return json({
                        message: "Task with this name already exists",
                        success: false,
                        status: 400,
                    });
                }

                // Create new task
                const task = new Task({
                    createdBy,
                    title,
                    description,
                    priority,
                    department,
                    dueDate,
                    status,
                });

                // Save task details
                const saveTaskDetails = await task.save();

                if (saveTaskDetails) {
                    return json({
                        message: "Task created successfully",
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
    }) {
        try {
            // Check if the task exists and has the required priority
            const task = await Task.findById(id);

            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404, // Not Found
                });
            }

            // Validate the priority
            if (task.status !== "Approved") {
                return json({
                    message: "Task cannot be assigned because is not Approved",
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

            if (assign) {
                return json({
                    message: "Task assigned successfully",
                    success: true,
                    status: 200,
                });
            }

            return json({
                message: "Unable to assign task",
                success: false,
                status: 500,
            });
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
                status: 500,
            });
        }
    }

    async comment({
        id,
        comment,
        createdBy,
    }: {
        id: string;
        comment: string
        createdBy: string;
    }) {
        try {
            // Update task with assignment details
            const comments = await Task.findByIdAndUpdate(
                id,
                {
                    $push: {
                        comments: {
                            comment,
                            createdBy,
                        },
                    },
                },
                { new: true }
            );

            if (comments) {
                return json({
                    message: "comment created successfully",
                    success: true,
                    status: 200,
                });
            }

            return json({
                message: "Unable to create comment",
                success: false,
                status: 500,
            });
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
    }: {
        AssignmentId: string
        id: string;
        comment: string;
        createdBy: string;
    }) {
        try {
            // Find the task by ID
            const task = await Task.findById(id);

            if (!task) {
                return json({
                    message: "Task not found",
                    success: false,
                    status: 404,
                });
            }

            // Find the assignment by ID within the task
            const assignmentIndex = task.assignment.findIndex(
                (assignment: any) => assignment._id.toString() === AssignmentId
            );

            if (assignmentIndex === -1) {
                return json({
                    message: "Assignment not found",
                    success: false,
                    status: 404,
                });
            }

            // Add comment to the assignment
            task.assignment[assignmentIndex].comments.push({
                comment,
                createdBy,
                createdAt: new Date(),
            });

            // Save the updated task
            const updatedTask = await task.save();

            if (updatedTask) {
                return json({
                    message: "Comment added to assignment successfully",
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
    }: {
        request?: Request;
        page: number;
        search_term?: string;
        limit?: number;
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
            const session = request
                ? await getSession(request.headers.get("Cookie"))
                : null;
            const token = session?.get("email");
            const user = token
                ? await Registration.findOne({ email: token })
                : null;

            const selectByDepartment = await Registration.find({
                department: user?.department,
            });

            const taskCount = await Task.countDocuments(searchFilter).exec();
            const totalPages = Math.ceil(taskCount / limit);

            const staffTasks = await Task.find({ department: user?.department }, searchFilter)
                .skip(skipCount)
                .limit(limit)
                .populate("department")
                .populate("comments")
                .populate({
                    path: "comments.createdBy",
                    select: "firstName middleName image lastName",
                })
                .populate("createdBy")
                .exec();
                
            const hodTasks = await Task.find({ department: user?.department }, searchFilter)
                .skip(skipCount)
                .limit(limit)
                .populate("department")
                .populate("comments")
                .populate({
                    path: "comments.createdBy",
                    select: "firstName middleName image lastName",
                })
                .populate("createdBy")
                .exec();

            const tasks = await Task.find(searchFilter)
                .skip(skipCount)
                .limit(limit)
                .populate("department")
                .populate("comments")
                .populate({
                    path: "comments.createdBy",
                    select: "firstName middleName image lastName",
                })
                .populate("createdBy")
                .exec();

            return {
                user,
                tasks,
                selectByDepartment,
                totalPages,
                hodTasks,
                staffTasks
            };
        } catch (error: any) {
            console.error("Error Fetching Tasks:", error.message);

            return {
                message: error.message,
                success: false,
                status: 500,
            };
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
