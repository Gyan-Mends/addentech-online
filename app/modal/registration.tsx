import { RegistrationInterface } from "~/interface/interface";
import mongoose from "~/mongoose.server";

const RegistrationSchema = new mongoose.Schema({
  firstName: {
    require: true,
    type: String,
  },
  middleName: {
    require: true,
    type: String,
  },
  lastName: {
    require: true,
    type: String,
  },
  email: {
    require: true,
    type: String,
  },
  password: {
    require: true,
    type: String,
  },
  phone: {
    require: true,
    type: String,
  },
  role: {
    require: true,
    type: String,
  },
  admin: {
    require: true,
    type: String,
  },
  image: {
    require: true,
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