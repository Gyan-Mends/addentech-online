import mongoose, { Schema, Document } from "mongoose";

export interface IMemo extends Document {
    refNumber: string;
    fromDepartment: string;
    fromName: string;
    memoDate: Date;
    toDepartment: string;
    toName: string;
    subject: string;
    memoType: string;
    dueDate?: Date;
    frequency?: string;
    remark?: string;
    ccDepartment?: string;
    ccName?: string;
    image?: string; // Path or URL of the uploaded file
    emailCheck: boolean;
    createdAt: Date;
    updatedAt?: Date;
    status?: string;
}

const MemoSchema: Schema = new Schema<IMemo>(
    {
        refNumber: { type: String, required: true, unique: true },
        fromDepartment: { type: String, required: true },
        fromName: { type: String, required: true },
        memoDate: { type: Date, required: true },
        toDepartment: { type: String, required: true },
        toName: { type: String, required: true },
        subject: { type: String, required: true },
        memoType: { type: String, required: true },
        dueDate: { type: Date },
        frequency: { type: String },
        remark: { type: String },
        ccDepartment: { type: String },
        ccName: { type: String },
        image: { type: String },
        emailCheck: { type: Boolean, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date },
        status: { type: String, enum: ["draft", "sent", "archived"], default: "draft" },
    },
    { timestamps: true }
);

const Memo = mongoose.model<IMemo>("Memo", MemoSchema);

export default Memo;
