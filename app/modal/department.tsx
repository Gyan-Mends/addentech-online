import { Schema } from "mongoose";
import { DepartmentInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const DepartmentSchema = new mongoose.Schema({
    name: {
        require: true,
        type: String,
    },
    description: {
        require: true,
        type: String,
    },
    admin: {
        ref: "registration",
        require: true,
        type: Schema.Types.ObjectId,
    },
})

let Departments: mongoose.Model<DepartmentInterface>

try {
    Departments = mongoose.model<DepartmentInterface>("departments")
} catch (error) {
    Departments = mongoose.model<DepartmentInterface>("departments", DepartmentSchema)

}

export default Departments