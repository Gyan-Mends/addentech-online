import DailyTask from "~/modal/dailyTask";
import ScheduledTask from "~/modal/scheduledTask";
import Registration from "~/modal/registration";
import { json } from "@remix-run/node";

class DailyTaskController {
  // Helper method to get week info
  getWeekInfo(date = new Date()) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    
    // Get Monday to Friday of the week
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);
    
    return {
      weekNumber,
      year: date.getFullYear(),
      startDate: monday,
      endDate: friday,
    };
  }

  // Create a new daily task
  async createTask(formData: any) {
    try {
      const {
        user,
        department,
        date,
        title,
        description,
        priority = "medium",
        estimatedHours = 0,
        category = "other",
        notes = "",
      } = formData;

      const taskDate = new Date(date);
      const weekInfo = this.getWeekInfo(taskDate);

      const newTask = new DailyTask({
        user,
        department,
        date: taskDate,
        title: title.trim(),
        description,
        priority,
        estimatedHours,
        category,
        notes,
        weekNumber: weekInfo.weekNumber,
        year: weekInfo.year,
        status: "pending",
      });

      const savedTask = await newTask.save();

      return json({
        message: "Daily task created successfully",
        success: true,
        status: 201,
        data: savedTask,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  // Update a daily task
  async updateTask(formData: any) {
    try {
      const { taskId, userId, ...updateData } = formData;

      const task = await DailyTask.findById(taskId);
      if (!task) {
        return json({
          message: "Task not found",
          success: false,
          status: 404,
        });
      }

      // Check if user can edit (only drafts by owner or department head)
      if (task.weeklySubmissionStatus !== "draft" || task.user.toString() !== userId) {
        return json({
          message: "You cannot edit this task",
          success: false,
          status: 403,
        });
      }

      // Update allowed fields
      const allowedUpdates = [
        'title', 'description', 'priority', 'estimatedHours', 
        'actualHours', 'status', 'category', 'notes', 'challenges'
      ];
      
      const updates: any = {};
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      const updatedTask = await DailyTask.findByIdAndUpdate(
        taskId,
        updates,
        { new: true }
      ).populate("user", "firstName lastName email");

      return json({
        message: "Task updated successfully",
        success: true,
        status: 200,
        data: updatedTask,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  // Delete a daily task
  async deleteTask(formData: any) {
    try {
      const { taskId, userId } = formData;

      const task = await DailyTask.findById(taskId);
      if (!task) {
        return json({
          message: "Task not found",
          success: false,
          status: 404,
        });
      }

      // Check if user can delete (only drafts by owner)
      if (task.weeklySubmissionStatus !== "draft" || task.user.toString() !== userId) {
        return json({
          message: "You cannot delete this task",
          success: false,
          status: 403,
        });
      }

      await DailyTask.findByIdAndDelete(taskId);

      return json({
        message: "Task deleted successfully",
        success: true,
        status: 200,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  // Get tasks for a user
  async getUserTasks(userId: string, filters: any = {}) {
    try {
      const {
        startDate,
        endDate,
        status,
        category,
        weeklySubmissionStatus = "draft",
        page = 1,
        limit = 50,
      } = filters;

      const query: any = { user: userId };

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      if (status) query.status = status;
      if (category) query.category = category;
      if (weeklySubmissionStatus) query.weeklySubmissionStatus = weeklySubmissionStatus;

      const tasks = await DailyTask.find(query)
        .populate("department", "name")
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await DailyTask.countDocuments(query);

      return json({
        message: "Tasks retrieved successfully",
        success: true,
        status: 200,
        data: {
          tasks,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  // Get tasks for a department (for department heads and managers)
  async getDepartmentTasks(departmentId: string, filters: any = {}) {
    try {
      const {
        startDate,
        endDate,
        status,
        weeklySubmissionStatus,
        page = 1,
        limit = 100,
      } = filters;

      const query: any = { department: departmentId };

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      if (status) query.status = status;
      if (weeklySubmissionStatus) query.weeklySubmissionStatus = weeklySubmissionStatus;

      const tasks = await DailyTask.find(query)
        .populate("user", "firstName lastName email")
        .populate("department", "name")
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await DailyTask.countDocuments(query);

      return json({
        message: "Department tasks retrieved successfully",
        success: true,
        status: 200,
        data: {
          tasks,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  // Get weekly preview for a user
  async getWeeklyPreview(userId: string, weekNumber?: number, year?: number) {
    try {
      const now = new Date();
      const weekInfo = this.getWeekInfo(now);
      
      const targetWeek = weekNumber || weekInfo.weekNumber;
      const targetYear = year || weekInfo.year;

      const tasks = await DailyTask.find({
        user: userId,
        weekNumber: targetWeek,
        year: targetYear,
      })
      .populate("department", "name")
      .sort({ date: 1, createdAt: 1 });

      // Group tasks by day
      const tasksByDay: any = {};
      tasks.forEach(task => {
        const dateKey = task.date.toISOString().split('T')[0];
        if (!tasksByDay[dateKey]) {
          tasksByDay[dateKey] = [];
        }
        tasksByDay[dateKey].push(task);
      });

      // Calculate summary
      const summary = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === "completed").length,
        pendingTasks: tasks.filter(t => t.status === "pending").length,
        inProgressTasks: tasks.filter(t => t.status === "in_progress").length,
        totalEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
        totalActualHours: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
        weeklySubmissionStatus: tasks.length > 0 ? tasks[0].weeklySubmissionStatus : "draft",
      };

      return json({
        message: "Weekly preview retrieved successfully",
        success: true,
        status: 200,
        data: {
          weekNumber: targetWeek,
          year: targetYear,
          tasksByDay,
          tasks,
          summary,
        },
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  // Auto-submit weekly tasks (called by cron job on Friday at 12 PM)
  async autoSubmitWeeklyTasks() {
    try {
      const now = new Date();
      const weekInfo = this.getWeekInfo(now);

      // Find all draft tasks for current week
      const tasksToSubmit = await DailyTask.find({
        weekNumber: weekInfo.weekNumber,
        year: weekInfo.year,
        weeklySubmissionStatus: "draft",
      });

      // Update all tasks to auto_submitted
      const result = await DailyTask.updateMany(
        {
          weekNumber: weekInfo.weekNumber,
          year: weekInfo.year,
          weeklySubmissionStatus: "draft",
        },
        {
          weeklySubmissionStatus: "auto_submitted",
          submittedAt: now,
        }
      );

      // Log the auto-submission
      console.log(`Auto-submitted ${result.modifiedCount} tasks for week ${weekInfo.weekNumber}, ${weekInfo.year}`);

      return {
        success: true,
        submittedCount: result.modifiedCount,
        weekNumber: weekInfo.weekNumber,
        year: weekInfo.year,
      };
    } catch (error: any) {
      console.error("Error in auto-submit weekly tasks:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Manual weekly submission
  async submitWeeklyTasks(userId: string, weekNumber?: number, year?: number) {
    try {
      const now = new Date();
      const weekInfo = this.getWeekInfo(now);
      
      const targetWeek = weekNumber || weekInfo.weekNumber;
      const targetYear = year || weekInfo.year;

      // Update user's tasks for the week
      const result = await DailyTask.updateMany(
        {
          user: userId,
          weekNumber: targetWeek,
          year: targetYear,
          weeklySubmissionStatus: "draft",
        },
        {
          weeklySubmissionStatus: "manually_submitted",
          submittedAt: now,
        }
      );

      return json({
        message: `Weekly tasks submitted successfully (${result.modifiedCount} tasks)`,
        success: true,
        status: 200,
        data: {
          submittedCount: result.modifiedCount,
          weekNumber: targetWeek,
          year: targetYear,
        },
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  // Create task from scheduled task
  async createFromScheduledTask(scheduledTaskId: string, targetDate: string) {
    try {
      const scheduledTask = await ScheduledTask.findById(scheduledTaskId);
      if (!scheduledTask) {
        return json({
          message: "Scheduled task not found",
          success: false,
          status: 404,
        });
      }

      const taskDate = new Date(targetDate);
      const weekInfo = this.getWeekInfo(taskDate);

      const dailyTask = new DailyTask({
        user: scheduledTask.user,
        department: scheduledTask.department,
        date: taskDate,
        title: scheduledTask.title,
        description: scheduledTask.description,
        priority: scheduledTask.priority,
        estimatedHours: scheduledTask.estimatedHours,
        category: scheduledTask.category,
        notes: scheduledTask.notes,
        weekNumber: weekInfo.weekNumber,
        year: weekInfo.year,
        status: "pending",
      });

      const savedTask = await dailyTask.save();

      // Update scheduled task
      await ScheduledTask.findByIdAndUpdate(scheduledTaskId, {
        status: "moved_to_daily",
        dailyTaskId: savedTask._id,
        movedToDailyAt: new Date(),
      });

      return json({
        message: "Task moved to daily tasks successfully",
        success: true,
        status: 201,
        data: savedTask,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  // Get analytics for dashboard
  async getTaskAnalytics(userId: string, departmentId?: string, timeRange = "week") {
    try {
      const now = new Date();
      let startDate: Date;
      let endDate = new Date(now);

      switch (timeRange) {
        case "week":
          const weekInfo = this.getWeekInfo(now);
          startDate = weekInfo.startDate;
          endDate = weekInfo.endDate;
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
          break;
        default:
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
      }

      const query: any = {
        date: { $gte: startDate, $lte: endDate },
      };

      if (departmentId) {
        query.department = departmentId;
      } else {
        query.user = userId;
      }

      const tasks = await DailyTask.find(query);

      const analytics = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === "completed").length,
        pendingTasks: tasks.filter(t => t.status === "pending").length,
        inProgressTasks: tasks.filter(t => t.status === "in_progress").length,
        cancelledTasks: tasks.filter(t => t.status === "cancelled").length,
        totalEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
        totalActualHours: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
        productivityRate: 0,
        tasksByCategory: {},
        tasksByPriority: {},
        tasksByStatus: {},
        dailyBreakdown: {},
      };

      // Calculate productivity rate
      if (analytics.totalEstimatedHours > 0) {
        analytics.productivityRate = Math.round(
          (analytics.totalActualHours / analytics.totalEstimatedHours) * 100
        );
      }

      // Group by category, priority, status
      tasks.forEach(task => {
        // By category
        if (!analytics.tasksByCategory[task.category]) {
          analytics.tasksByCategory[task.category] = 0;
        }
        analytics.tasksByCategory[task.category]++;

        // By priority
        if (!analytics.tasksByPriority[task.priority]) {
          analytics.tasksByPriority[task.priority] = 0;
        }
        analytics.tasksByPriority[task.priority]++;

        // By status
        if (!analytics.tasksByStatus[task.status]) {
          analytics.tasksByStatus[task.status] = 0;
        }
        analytics.tasksByStatus[task.status]++;

        // Daily breakdown
        const dateKey = task.date.toISOString().split('T')[0];
        if (!analytics.dailyBreakdown[dateKey]) {
          analytics.dailyBreakdown[dateKey] = 0;
        }
        analytics.dailyBreakdown[dateKey]++;
      });

      return json({
        message: "Analytics retrieved successfully",
        success: true,
        status: 200,
        data: analytics,
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

const dailyTaskController = new DailyTaskController();

export default dailyTaskController;
