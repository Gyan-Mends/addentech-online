import mongoose from "~/mongoose.server";

const scheduledTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "registration",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["development", "meeting", "documentation", "testing", "bug_fix", "client_work", "administrative", "training", "other"],
      default: "other",
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["scheduled", "moved_to_daily", "completed", "cancelled", "overdue"],
      default: "scheduled",
    },
    reminderSettings: {
      enableReminders: {
        type: Boolean,
        default: true,
      },
      daysBefore: {
        type: Number,
        default: 1, // Send reminder 1 day before
      },
      onDueDate: {
        type: Boolean,
        default: true,
      },
    },
    reminderHistory: [{
      sentAt: {
        type: Date,
        required: true,
      },
      type: {
        type: String,
        enum: ["advance_reminder", "due_date_reminder", "overdue_reminder"],
        required: true,
      },
      status: {
        type: String,
        enum: ["sent", "failed"],
        required: true,
      },
      error: String,
    }],
    notes: {
      type: String,
      default: "",
    },
    attachments: [{
      filename: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      }
    }],
    // When moved to daily tasks
    dailyTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyTask",
      default: null,
    },
    movedToDailyAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
scheduledTaskSchema.index({ user: 1, dueDate: 1 });
scheduledTaskSchema.index({ department: 1, dueDate: 1 });
scheduledTaskSchema.index({ status: 1 });
scheduledTaskSchema.index({ dueDate: 1, status: 1 });
scheduledTaskSchema.index({ "reminderSettings.enableReminders": 1, status: 1 });

// Method to check if task is overdue
scheduledTaskSchema.methods.isOverdue = function() {
  return new Date() > this.dueDate && this.status === "scheduled";
};

// Method to check if reminder should be sent
scheduledTaskSchema.methods.shouldSendReminder = function() {
  if (!this.reminderSettings.enableReminders || this.status !== "scheduled") {
    return false;
  }
  
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  
  // Check if advance reminder should be sent
  const daysBefore = this.reminderSettings.daysBefore;
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);
  
  // Check if we've already sent reminders
  const sentAdvanceReminder = this.reminderHistory.some(
    (r: any) => r.type === "advance_reminder" && r.status === "sent"
  );
  const sentDueDateReminder = this.reminderHistory.some(
    (r: any) => r.type === "due_date_reminder" && r.status === "sent"
  );
  
  // Should send advance reminder?
  if (!sentAdvanceReminder && now >= reminderDate && now < dueDate) {
    return { type: "advance_reminder", daysBefore };
  }
  
  // Should send due date reminder?
  if (!sentDueDateReminder && this.reminderSettings.onDueDate && 
      now.toDateString() === dueDate.toDateString()) {
    return { type: "due_date_reminder" };
  }
  
  // Should send overdue reminder?
  if (now > dueDate) {
    const lastOverdueReminder = this.reminderHistory
      .filter((r: any) => r.type === "overdue_reminder" && r.status === "sent")
      .sort((a: any, b: any) => b.sentAt - a.sentAt)[0];
    
    // Send overdue reminder every 3 days
    if (!lastOverdueReminder || 
        (now.getTime() - lastOverdueReminder.sentAt.getTime()) > (3 * 24 * 60 * 60 * 1000)) {
      return { type: "overdue_reminder" };
    }
  }
  
  return false;
};

let ScheduledTask: mongoose.Model<any>;

try {
  ScheduledTask = mongoose.model<any>("ScheduledTask");
} catch (error) {
  ScheduledTask = mongoose.model<any>("ScheduledTask", scheduledTaskSchema);
}

export default ScheduledTask; 