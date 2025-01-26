import { Schema } from "mongoose";
import { RegistrationInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const RegistrationSchema = new mongoose.Schema({
  firstName: {
    required: true,
    type: String,
  },
  middleName: {
    required: true,
    type: String,
  },
  lastName: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  phone: {
    required: true,
    type: String,
  },
  role: {
    required: true,
    type: String,
  },
  admin: {
    required: true,
    type: String,
  },
  position: {
    required: true,
    type: String,
  },
  department: {
    ref: "departments",
    required: true,
    type: Schema.Types.ObjectId,
  },
  image: {
    required: true,
    type: String,
  },
}, {
  timestamps: true
})

let Registration: mongoose.Model<RegistrationInterface>

try {
  Registration = mongoose.model<RegistrationInterface>("registration")
} catch (error) {
  Registration = mongoose.model<RegistrationInterface>("registration", RegistrationSchema)

}

export default Registration