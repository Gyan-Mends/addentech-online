import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import Task from "~/modal/task";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const departmentId = url.searchParams.get("department");
    const taskId = url.searchParams.get("id");
    
    if (taskId) {
      const task = await Task.findById(taskId)
        .populate("department", "name")
        .populate("createdBy", "firstName lastName email")
        .populate("comments.createdBy", "firstName lastName email")
        .populate("assignment.lead", "firstName lastName email")
        .populate("assignment.assignee", "firstName lastName email");
        
      if (!task) {
        return json({
          success: false,
          message: "Task not found",
          status: 404,
        });
      }
      
      return json({
        success: true,
        data: task,
        message: "Task retrieved successfully",
      });
    } 
    
    if (departmentId) {
      const tasks = await Task.find({ department: departmentId })
        .populate("department", "name")
        .populate("createdBy", "firstName lastName email")
        .sort({ createdAt: -1 });
        
      return json({
        success: true,
        data: tasks,
        message: "Department tasks retrieved successfully",
      });
    }
    
    // Get all tasks
    const tasks = await Task.find()
      .populate("department", "name")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });
      
    return json({
      success: true,
      data: tasks,
      message: "All tasks retrieved successfully",
    });
  } catch (error: any) {
    return json({
      success: false,
      message: error.message,
      status: 500,
    });
  }
};
