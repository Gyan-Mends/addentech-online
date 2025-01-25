import mongoose, { Schema, Document } from "mongoose";
import { MemoInterface } from "~/interface/interface";



const MemoSchema: Schema = new mongoose.Schema(
    {
        refNumber: {
            type: String,
            require: true,
            unique: true

        },
        fromDepartment: {
            ref: "departments",
            require: true,
            type: Schema.Types.ObjectId,

        },
        fromName: {
            ref: "registration",
            require: true,
            type: Schema.Types.ObjectId,

        },
        memoDate: {
            type: Date,
            require: true

        },
        toDepartment: {
            ref: "departments",
            require: true,
            type: Schema.Types.ObjectId,
        },
        toName: {
            ref: "registration",
            require: true,
            type: Schema.Types.ObjectId,

        },
        subject: {
            type: String,
            require: true

        },
        memoType: {
            type: String,
            require: true

        },
        dueDate: {
            type: Date
        },
        frequency: {
            type: String

        },
        remark: {
            type: String
        },
        ccDepartment: {
            ref: "departments",
            require: true,
            type: Schema.Types.ObjectId,

        },
        ccName: {
            ref: "registration",
            require: true,
            type: Schema.Types.ObjectId,
        },
        image: {
            type: String
        },
        emailCheck: {
            type: Boolean,
            require: true

        },
        createdAt: {
            type: Date,
            default: Date.now

        },
        updatedAt: {
            type: Date

        },

    },
    { timestamps: true }
);

let Memo: mongoose.Model<MemoInterface>;

try {
    Memo = mongoose.model<MemoInterface>("memo")
} catch (error) {
    Memo = mongoose.model<MemoInterface>("memo", MemoSchema)

}

export default Memo