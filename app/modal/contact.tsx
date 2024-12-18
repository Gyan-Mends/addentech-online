import { Schema } from "mongoose";
import category from "~/controller/categoryController";
import { BlogInterface, ContactInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const ContacSchema = new mongoose.Schema({
    firstName: {
        require: true,
        type: String,
    },
    middleName: {
        require: false,
        type: String,
    },
    lastName: {
        require: true,
        type: String,
    },
    number: {
        require: true,
        type: String,
    },
    comapny: {
        require: false,
        type: String,
    },
    description: {
        require: true,
        type: String,
    },

}, {
    timestamps: true
})

let Contact: mongoose.Model<ContactInterface>

try {
    Contact = mongoose.model<ContactInterface>("contact")
} catch (error) {
    Contact = mongoose.model<ContactInterface>("contact", ContacSchema)

}

export default Contact