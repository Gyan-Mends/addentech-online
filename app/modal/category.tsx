import { Schema } from "mongoose";
import { CategoryInterface } from "~/interfaces/interface";
import mongoose from "~/mongoose.server";

const CategorySchema = new mongoose.Schema({
    name: {
        require: true,
        type: String,
    },
    description: {
        require: true,
        type: String,
    },
    seller: {
        ref: "registration",
        require: true,
        type: Schema.Types.ObjectId,
    },
})

let Category: mongoose.Model<CategoryInterface>

try {
    Category = mongoose.model<CategoryInterface>("category")
} catch (error) {
    Category = mongoose.model<CategoryInterface>("category", CategorySchema)

}

export default Category