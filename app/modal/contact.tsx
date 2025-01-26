import { Schema } from "mongoose";
import category from "~/controller/categoryController";
import { BlogInterface, ContactInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const ContacSchema = new mongoose.Schema({
    firstName: {
        required: true,
        type: String,
    },
    middleName: {
        required: false,
        type: String,
    },
    lastName: {
        required: true,
        type: String,
    },
    number: {
        required: true,
        type: String,
    },
    comapny: {
        required: false,
        type: String,
    },
    description: {
        required: true,
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