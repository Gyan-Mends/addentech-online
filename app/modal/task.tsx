import { Schema } from "mongoose";
import { comment } from "postcss";
import { TaskInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            require: true,
        },
        description: {
            type: String,
            require: true,
        },
        status: {
            type: String,
            enum: ["Unclaimed", "Approved"],
            require: true,
            default: "Unclaimed",
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            require: true,
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: "departments",
            require: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "registration",
            require: true,
        },
        dueDate: {
            type: Date,
            require: true,
        },
        comments: [
            {
                createdBy: {
                    type: Schema.Types.ObjectId,
                    ref: "registration", // User reference
                    require: true,
                },
                comment: {
                    type: String,
                    require: true,
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
                    require: true,
                },
                description: {
                    type: String,
                    require: true,
                },
                status: {
                    type: String,
                    enum: ["Pending", "Onhold", "Inprogress", "Needs Approval", "Completed"],
                    require: true,
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
                            require: true,
                        },
                        comment: {
                            type: String,
                            require: true,
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
