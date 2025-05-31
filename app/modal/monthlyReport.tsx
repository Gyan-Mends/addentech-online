import { Schema } from "mongoose";
import mongoose from "~/mongoose.server";

interface MonthlyReportInterface {
  _id: string;
  department: string;
  month: number;
  year: number;
  type: string;
  subscriptionPackage: string;
  numberOfFirms: number;
  numberOfUsers: number;
  amount: number;
  createdBy: string;
  status: string;
  notes: string;
}

const MonthlyReportSchema = new mongoose.Schema(
  {
    department: {
      type: Schema.Types.ObjectId,
      ref: "departments",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    subscriptionPackage: {
      type: String,
      required: true,
    },
    numberOfFirms: {
      type: Number,
      required: true,
    },
    numberOfUsers: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "registration",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },
    notes: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

// Add a compound index to prevent duplicate reports for the same department/month/year
MonthlyReportSchema.index(
  { department: 1, month: 1, year: 1, type: 1 },
  { unique: true }
);

let MonthlyReport: mongoose.Model<MonthlyReportInterface>;

try {
  MonthlyReport = mongoose.model<MonthlyReportInterface>("monthlyReport");
} catch (error) {
  MonthlyReport = mongoose.model<MonthlyReportInterface>("monthlyReport", MonthlyReportSchema);
}

export default MonthlyReport;
