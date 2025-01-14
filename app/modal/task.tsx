import { Schema } from "mongoose";
import { TaskInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["unclaimed", "assigned"],
        required: true,
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true,
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: "departments",
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

let Task: mongoose.Model<TaskInterface>;

try {
    Task = mongoose.model<TaskInterface>("task");
} catch (error) {
    Task = mongoose.model<TaskInterface>("task", TaskSchema);
}

export default Task;
