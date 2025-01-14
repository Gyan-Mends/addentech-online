import { json } from "@remix-run/node";
import Task from "~/modal/task";

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
                        status: 500,
                    });
                } else {
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
                    } else {
                        return json({
                            message: "Unable to create task",
                            success: false,
                            status: 500,
                        });
                    }
                }
            } else {
                return json({
                    message: "Wrong intent",
                    success: false,
                    status: 400,
                });
            }
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
                status: 500,
            });
        }
    }

}

const taskController = new TaskController
export default taskController