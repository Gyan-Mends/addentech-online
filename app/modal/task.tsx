import { Schema } from "mongoose";
import { comment } from "postcss";
import { TaskInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const TaskSchema = new mongoose.Schema(
    {
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
            ref: "registration",
            required: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        comments: [
            {
                createdBy: {
                    type: Schema.Types.ObjectId,
                    ref: "registration", // User reference
                    required: true,
                },
                comment: {
                    type: String,
                    required: true,
                }, createdAt: {
                    type: Date,
                    default: Date.now,
                },

            }
        ],
        assignment: [
            {
                team: {
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
                lead: {
                    type: Schema.Types.ObjectId,
                    ref: "registration", // User assigned to task
                },
                assignee: {
                    type: Schema.Types.ObjectId,
                    ref: "registration", // User assigned to task
                },
                assignedBy: {
                    type: Schema.Types.ObjectId,
                    ref: "registration", // User who assigned the task
                },
                comments: [
                    {
                        createdBy: {
                            type: Schema.Types.ObjectId,
                            ref: "registration", // User reference
                            required: true,
                        },
                        comment: {
                            type: String,
                            required: true,
                        }, createdAt: {
                            type: Date,
                            default: Date.now,
                        },

                    }
                ],
                dueDate: {
                    type: Date,
                    default: Date.now,
                },
                assignedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

let Task: mongoose.Model<TaskInterface>;

try {
    Task = mongoose.model<TaskInterface>("task");
} catch (error) {
    Task = mongoose.model<TaskInterface>("task", TaskSchema);
}

export default Task;
