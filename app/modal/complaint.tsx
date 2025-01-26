import { Schema } from "mongoose";
import { ComplaintInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const ComplaintSchema = new mongoose.Schema({
    description: {
        required: true, // Fixed `require` to `required`
        type: String,
    },
    attachment: {
        required: true, // Fixed `require` to `required`
        type: String,
    },
    unique_id: {
        required: true, // Fixed `require` to `required`
        type: String,
        unique: true,
    },
    status: {
        type: String, // Added `type` to ensure it's a string
        enum: ["New", "Under Review", "Resolved"],
        default: "New",
        required: true, // Added `required` if this field is mandatory
    },
});

let Complaint: mongoose.Model<ComplaintInterface>;

try {
    Complaint = mongoose.model<ComplaintInterface>("complaint");
} catch (error) {
    Complaint = mongoose.model<ComplaintInterface>("complaint", ComplaintSchema);
}

export default Complaint;
