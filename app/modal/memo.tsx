import mongoose, { Schema, Document } from "mongoose";
import { MemoInterface } from "~/interface/interface";



const MemoSchema: Schema = new mongoose.Schema(
    {
        refNumber: {
            type: String,
            required: true,
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
            required: true

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
            required: true

        },
        memoType: {
            type: String,
            required: true

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
            type: String

        },
        ccName: {
            type: String
        },
        image: {
            type: String
        },
        emailCheck: {
            type: Boolean,
            required: true

        },
        createdAt: {
            type: Date,
            default: Date.now

        },
        updatedAt: {
            type: Date

        },
        status: {
            type: String,
            required: true
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