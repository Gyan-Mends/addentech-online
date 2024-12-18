import { Schema } from "mongoose";
import category from "~/controller/categoryController";
import { BlogInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const BlogSchema = new mongoose.Schema({
    name: {
        require: true,
        type: String,
    },
    description: {
        require: true,
        type: String,
    },
    image: {
        require: true,
        type: String,
    },
    category: {
        ref: "category",
        require: true,
        type: Schema.Types.ObjectId,
    },
    admin: {
        ref: "registration",
        require: true,
        type: Schema.Types.ObjectId,
    },
}, {
    timestamps: true
})

let Blog: mongoose.Model<BlogInterface>

try {
    Blog = mongoose.model<BlogInterface>("blog")
} catch (error) {
    Blog = mongoose.model<BlogInterface>("blog", BlogSchema)

}

export default Blog