import mongoose from "~/mongoose.server";

const dailyTaskSchema = new mongoose.Schema(
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
    date: {
      type: Date,
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
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    actualHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    category: {
      type: String,
      enum: ["development", "meeting", "documentation", "testing", "bug_fix", "client_work", "administrative", "training", "other"],
      default: "other",
    },
    notes: {
      type: String,
      default: "",
    },
    challenges: {
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
    // Weekly submission tracking
    weekNumber: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    weeklySubmissionStatus: {
      type: String,
      enum: ["draft", "auto_submitted", "manually_submitted"],
      default: "draft",
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    // Approval tracking
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "registration",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
dailyTaskSchema.index({ user: 1, date: 1 });
dailyTaskSchema.index({ department: 1, date: 1 });
dailyTaskSchema.index({ weekNumber: 1, year: 1 });
dailyTaskSchema.index({ status: 1 });
dailyTaskSchema.index({ weeklySubmissionStatus: 1 });

// Helper method to get week number from date
dailyTaskSchema.statics.getWeekNumber = function(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
};

let DailyTask: mongoose.Model<any>;

try {
  DailyTask = mongoose.model<any>("DailyTask");
} catch (error) {
  DailyTask = mongoose.model<any>("DailyTask", dailyTaskSchema);
}

export default DailyTask; 