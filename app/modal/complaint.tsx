import { Schema } from "mongoose";
import { ComplaintInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const ComplaintSchema = new mongoose.Schema({
    description: {
        require: true,
        type: String,
    },
    attachment: {
        require: true,
        type: String,
    },
    unique_id: {
        require: true,
        type: String,
        unique: true
    },
    status: {
        require: true,
        enum: ["New", "Under Review", "Resolved"],
        default: "New"
    },

})

let Complaint: mongoose.Model<ComplaintInterface>

try {
    Complaint = mongoose.model<ComplaintInterface>("complaint")
} catch (error) {
    Complaint = mongoose.model<ComplaintInterface>("complaint", ComplaintSchema)

}

export default Complaint