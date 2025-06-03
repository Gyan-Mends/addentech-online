import mongoose from "mongoose";

const weeklyUpdateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    tasksCompleted: {
      type: String,
      required: true,
    },
    challengesFaced: {
      type: String,
      default: "",
    },
    nextWeekPlans: {
      type: String,
      required: true,
    },
    additionalNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "reviewed"],
      default: "draft",
    },
    reviewerComments: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

// Ensure that each user can only have one weekly update per week per year
weeklyUpdateSchema.index({ user: 1, weekNumber: 1, year: 1 }, { unique: true });

// Export the model or create it if it doesn't exist yet
const WeeklyUpdate = mongoose.models.WeeklyUpdate || mongoose.model("WeeklyUpdate", weeklyUpdateSchema);

export default WeeklyUpdate;
