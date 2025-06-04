import ScheduledTask from "~/modal/scheduledTask";
import Registration from "~/modal/registration";
import { json } from "@remix-run/node";

class ScheduledTaskController {
  // Create a new scheduled task
  async createScheduledTask(formData: any) {
    try {
      const {
        user,
        department,
        title,
        description,
        dueDate,
        priority = "medium",
        category = "other",
        estimatedHours = 0,
        notes = "",
        reminderSettings = {
          enableReminders: true,
          daysBefore: 1,
          onDueDate: true,
        },
      } = formData;

      const newTask = new ScheduledTask({
        user,
        department,
        title: title.trim(),
        description,
        dueDate: new Date(dueDate),
        priority,
        category,
        estimatedHours,
        notes,
        reminderSettings,
        status: "scheduled",
      });

      const savedTask = await newTask.save();

      return json({
        message: "Scheduled task created successfully",
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

  // Update a scheduled task
  async updateScheduledTask(formData: any) {
    try {
      const { taskId, userId, ...updateData } = formData;

      const task = await ScheduledTask.findById(taskId);
      if (!task) {
        return json({
          message: "Scheduled task not found",
          success: false,
          status: 404,
        });
      }

      // Check if user can edit
      if (task.user.toString() !== userId) {
        return json({
          message: "You cannot edit this task",
          success: false,
          status: 403,
        });
      }

      // Update allowed fields
      const allowedUpdates = [
        'title', 'description', 'dueDate', 'priority', 
        'category', 'estimatedHours', 'notes', 'reminderSettings'
      ];
      
      const updates: any = {};
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          if (field === 'dueDate') {
            updates[field] = new Date(updateData[field]);
          } else {
            updates[field] = updateData[field];
          }
        }
      });

      const updatedTask = await ScheduledTask.findByIdAndUpdate(
        taskId,
        updates,
        { new: true }
      ).populate("user", "firstName lastName email");

      return json({
        message: "Scheduled task updated successfully",
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

  // Delete a scheduled task
  async deleteScheduledTask(formData: any) {
    try {
      const { taskId, userId } = formData;

      const task = await ScheduledTask.findById(taskId);
      if (!task) {
        return json({
          message: "Scheduled task not found",
          success: false,
          status: 404,
        });
      }

      // Check if user can delete
      if (task.user.toString() !== userId) {
        return json({
          message: "You cannot delete this task",
          success: false,
          status: 403,
        });
      }

      await ScheduledTask.findByIdAndDelete(taskId);

      return json({
        message: "Scheduled task deleted successfully",
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

  // Get scheduled tasks for a user
  async getUserScheduledTasks(userId: string, filters: any = {}) {
    try {
      const {
        status = "scheduled",
        priority,
        category,
        dueDateFrom,
        dueDateTo,
        page = 1,
        limit = 50,
      } = filters;

      const query: any = { user: userId };

      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (category) query.category = category;

      if (dueDateFrom && dueDateTo) {
        query.dueDate = {
          $gte: new Date(dueDateFrom),
          $lte: new Date(dueDateTo),
        };
      } else if (dueDateFrom) {
        query.dueDate = { $gte: new Date(dueDateFrom) };
      } else if (dueDateTo) {
        query.dueDate = { $lte: new Date(dueDateTo) };
      }

      const tasks = await ScheduledTask.find(query)
        .populate("department", "name")
        .populate("dailyTaskId", "title status")
        .sort({ dueDate: 1, priority: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await ScheduledTask.countDocuments(query);

      // Mark overdue tasks
      const now = new Date();
      const tasksWithOverdueStatus = tasks.map(task => {
        const taskObj = task.toObject();
        if (task.status === "scheduled" && new Date(task.dueDate) < now) {
          taskObj.isOverdue = true;
        }
        return taskObj;
      });

      return json({
        message: "Scheduled tasks retrieved successfully",
        success: true,
        status: 200,
        data: {
          tasks: tasksWithOverdueStatus,
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

  // Get upcoming tasks (next 7 days)
  async getUpcomingTasks(userId: string) {
    try {
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      const tasks = await ScheduledTask.find({
        user: userId,
        status: "scheduled",
        dueDate: {
          $gte: now,
          $lte: nextWeek,
        },
      })
      .populate("department", "name")
      .sort({ dueDate: 1, priority: -1 });

      return json({
        message: "Upcoming tasks retrieved successfully",
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

  // Get overdue tasks
  async getOverdueTasks(userId: string) {
    try {
      const now = new Date();

      const tasks = await ScheduledTask.find({
        user: userId,
        status: "scheduled",
        dueDate: { $lt: now },
      })
      .populate("department", "name")
      .sort({ dueDate: 1 });

      // Update status to overdue
      await ScheduledTask.updateMany(
        {
          user: userId,
          status: "scheduled",
          dueDate: { $lt: now },
        },
        { status: "overdue" }
      );

      return json({
        message: "Overdue tasks retrieved successfully",
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

  // Process reminders (called by cron job)
  async processReminders() {
    try {
      const tasksNeedingReminders = await ScheduledTask.find({
        status: "scheduled",
        "reminderSettings.enableReminders": true,
      }).populate("user", "firstName lastName email");

      const remindersSent = [];
      const failedReminders = [];

      for (const task of tasksNeedingReminders) {
        const reminderInfo = task.shouldSendReminder();
        
        if (reminderInfo) {
          try {
            // Send email reminder (you would implement this with your email service)
            const emailSent = await this.sendReminderEmail(task, reminderInfo);
            
            if (emailSent) {
              // Add to reminder history
              task.reminderHistory.push({
                sentAt: new Date(),
                type: reminderInfo.type,
                status: "sent",
              });
              
              await task.save();
              remindersSent.push({
                taskId: task._id,
                userId: task.user._id,
                type: reminderInfo.type,
              });
            } else {
              failedReminders.push({
                taskId: task._id,
                error: "Email send failed",
              });
            }
          } catch (error: any) {
            task.reminderHistory.push({
              sentAt: new Date(),
              type: reminderInfo.type,
              status: "failed",
              error: error.message,
            });
            
            await task.save();
            failedReminders.push({
              taskId: task._id,
              error: error.message,
            });
          }
        }
      }

      console.log(`Sent ${remindersSent.length} reminders, ${failedReminders.length} failed`);

      return {
        success: true,
        remindersSent: remindersSent.length,
        failed: failedReminders.length,
        details: {
          sent: remindersSent,
          failed: failedReminders,
        },
      };
    } catch (error: any) {
      console.error("Error processing reminders:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Send reminder email (placeholder - implement with your email service)
  private async sendReminderEmail(task: any, reminderInfo: any): Promise<boolean> {
    try {
      // This is a placeholder. You would implement this with your email service
      // like Nodemailer, SendGrid, etc.
      
      const user = task.user;
      const subject = this.getReminderSubject(task, reminderInfo);
      const content = this.getReminderContent(task, reminderInfo);

      console.log(`Sending ${reminderInfo.type} reminder to ${user.email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${content}`);

      // Simulate email sending
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 100);
      });
    } catch (error) {
      console.error("Error sending reminder email:", error);
      return false;
    }
  }

  private getReminderSubject(task: any, reminderInfo: any): string {
    switch (reminderInfo.type) {
      case "advance_reminder":
        return `Reminder: Task "${task.title}" is due in ${reminderInfo.daysBefore} day(s)`;
      case "due_date_reminder":
        return `Reminder: Task "${task.title}" is due today`;
      case "overdue_reminder":
        return `Overdue: Task "${task.title}" was due on ${task.dueDate.toDateString()}`;
      default:
        return `Task Reminder: ${task.title}`;
    }
  }

  private getReminderContent(task: any, reminderInfo: any): string {
    const user = task.user;
    const dueDate = task.dueDate.toDateString();
    
    let content = `Hello ${user.firstName},\n\n`;
    
    switch (reminderInfo.type) {
      case "advance_reminder":
        content += `This is a reminder that your task "${task.title}" is due in ${reminderInfo.daysBefore} day(s) on ${dueDate}.\n\n`;
        break;
      case "due_date_reminder":
        content += `This is a reminder that your task "${task.title}" is due today (${dueDate}).\n\n`;
        break;
      case "overdue_reminder":
        content += `Your task "${task.title}" was due on ${dueDate} and is now overdue.\n\n`;
        break;
    }
    
    content += `Task Details:\n`;
    content += `Description: ${task.description}\n`;
    content += `Priority: ${task.priority.toUpperCase()}\n`;
    content += `Category: ${task.category}\n`;
    
    if (task.estimatedHours > 0) {
      content += `Estimated Hours: ${task.estimatedHours}\n`;
    }
    
    content += `\nPlease log in to your dashboard to manage this task.\n\n`;
    content += `Best regards,\nTask Management System`;
    
    return content;
  }

  // Get analytics for scheduled tasks
  async getScheduledTaskAnalytics(userId: string) {
    try {
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);

      const tasks = await ScheduledTask.find({ user: userId });

      const analytics = {
        totalTasks: tasks.length,
        scheduled: tasks.filter(t => t.status === "scheduled").length,
        overdue: tasks.filter(t => t.status === "overdue").length,
        completed: tasks.filter(t => t.status === "completed").length,
        cancelled: tasks.filter(t => t.status === "cancelled").length,
        movedToDaily: tasks.filter(t => t.status === "moved_to_daily").length,
        dueThisWeek: tasks.filter(t => 
          t.status === "scheduled" && 
          new Date(t.dueDate) >= now && 
          new Date(t.dueDate) <= nextWeek
        ).length,
        dueThisMonth: tasks.filter(t => 
          t.status === "scheduled" && 
          new Date(t.dueDate) >= now && 
          new Date(t.dueDate) <= nextMonth
        ).length,
        tasksByPriority: {},
        tasksByCategory: {},
      };

      // Group by priority and category
      tasks.forEach(task => {
        if (!analytics.tasksByPriority[task.priority]) {
          analytics.tasksByPriority[task.priority] = 0;
        }
        analytics.tasksByPriority[task.priority]++;

        if (!analytics.tasksByCategory[task.category]) {
          analytics.tasksByCategory[task.category] = 0;
        }
        analytics.tasksByCategory[task.category]++;
      });

      return json({
        message: "Scheduled task analytics retrieved successfully",
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

export default new ScheduledTaskController(); 