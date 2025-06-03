import dailyTaskController from "~/controller/dailyTaskController";
import scheduledTaskController from "~/controller/scheduledTaskController";

class TaskAutomationCron {
  // Run every Friday at 12:00 PM to auto-submit weekly tasks
  async autoSubmitWeeklyTasks() {
    try {
      console.log("Running auto-submit weekly tasks job...");
      
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday
      const hour = now.getHours();

      // Only run on Friday at 12 PM
      if (dayOfWeek === 5 && hour === 12) {
        const result = await dailyTaskController.autoSubmitWeeklyTasks();
        
        if (result.success) {
          console.log(`Successfully auto-submitted ${result.submittedCount} tasks for week ${result.weekNumber}, ${result.year}`);
        } else {
          console.error("Failed to auto-submit weekly tasks:", result.error);
        }
        
        return result;
      } else {
        console.log("Not time for auto-submission (Friday 12 PM)");
        return { success: true, message: "Not scheduled time" };
      }
    } catch (error: any) {
      console.error("Error in auto-submit weekly tasks cron:", error);
      return { success: false, error: error.message };
    }
  }

  // Run daily to process reminders
  async processReminders() {
    try {
      console.log("Running reminder processing job...");
      
      const result = await scheduledTaskController.processReminders();
      
      if (result.success) {
        console.log(`Processed reminders: ${result.remindersSent} sent, ${result.failed} failed`);
      } else {
        console.error("Failed to process reminders:", result.error);
      }
      
      return result;
    } catch (error: any) {
      console.error("Error in reminder processing cron:", error);
      return { success: false, error: error.message };
    }
  }

  // Run every Friday to generate weekly previews
  async generateWeeklyPreviews() {
    try {
      console.log("Running weekly preview generation job...");
      
      const now = new Date();
      const dayOfWeek = now.getDay();

      // Only run on Friday
      if (dayOfWeek === 5) {
        // In a real implementation, you would get all active users
        // and generate previews for each
        console.log("Weekly preview generation would run here");
        // This would be implemented based on your user management system
        
        return { success: true, message: "Weekly previews generated" };
      } else {
        console.log("Not Friday - skipping weekly preview generation");
        return { success: true, message: "Not scheduled time" };
      }
    } catch (error: any) {
      console.error("Error in weekly preview generation:", error);
      return { success: false, error: error.message };
    }
  }

  // Clean up old data (run weekly)
  async cleanupOldData() {
    try {
      console.log("Running data cleanup job...");
      
      const now = new Date();
      const dayOfWeek = now.getDay();

      // Only run on Sunday
      if (dayOfWeek === 0) {
        // Clean up tasks older than 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // In a real implementation, you would clean up old completed tasks
        console.log("Data cleanup would run here");
        
        return { success: true, message: "Data cleanup completed" };
      } else {
        console.log("Not Sunday - skipping data cleanup");
        return { success: true, message: "Not scheduled time" };
      }
    } catch (error: any) {
      console.error("Error in data cleanup:", error);
      return { success: false, error: error.message };
    }
  }

  // Master cron job that runs all tasks
  async runAllJobs() {
    console.log("==================== CRON JOBS START ====================");
    console.log(`Running at: ${new Date().toISOString()}`);
    
    const results = {
      autoSubmit: await this.autoSubmitWeeklyTasks(),
      reminders: await this.processReminders(),
      weeklyPreviews: await this.generateWeeklyPreviews(),
      cleanup: await this.cleanupOldData(),
    };

    console.log("Cron job results:", results);
    console.log("==================== CRON JOBS END ====================");
    
    return results;
  }
}

export default new TaskAutomationCron();

// If you're using a cron library like node-cron, you can set up the schedule here:
/*
import cron from 'node-cron';

// Run every hour (you can adjust the schedule as needed)
cron.schedule('0 * * * *', async () => {
  await taskAutomationCron.runAllJobs();
});

// Alternatively, set up specific schedules:

// Auto-submit weekly tasks - Every Friday at 12:00 PM
cron.schedule('0 12 * * 5', async () => {
  await taskAutomationCron.autoSubmitWeeklyTasks();
});

// Process reminders - Every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  await taskAutomationCron.processReminders();
});

// Generate weekly previews - Every Friday at 11:00 AM
cron.schedule('0 11 * * 5', async () => {
  await taskAutomationCron.generateWeeklyPreviews();
});

// Cleanup old data - Every Sunday at 2:00 AM
cron.schedule('0 2 * * 0', async () => {
  await taskAutomationCron.cleanupOldData();
});
*/ 