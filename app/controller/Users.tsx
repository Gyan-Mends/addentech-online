import { json, redirect } from "@remix-run/node"
import Registration from "~/modal/registration"
import { commitSession, getSession } from "~/session"
import bcrypt from 'bcryptjs'; // Import bcrypt


class UsersController {
    async CreateUser({
        firstName,
        middleName,
        lastName,
        email,
        admin,
        password,
        phone,
        role,
        intent,
        position,
        department,
        base64Image,
        bio,
    }: {
          firstName: string;
          middleName: string;
          lastName: string;
          email: string;
          admin: string;
          password: string;
          phone: string;
          role: string;
          intent: string;
          position: string;
          department: string;
          base64Image: string;
          bio?: string;
      }) {
        try {
            if (intent === "create") {
              // Check if user exists by email or phone
              const UserCheck = await Registration.findOne({ email });
              const phoneNumberCheck = await Registration.findOne({ phone });

              if (UserCheck) {
                  return json({
                  message: "User with this email already exists",
                  success: false,
                  status: 409,
              });
            } else if (phoneNumberCheck) {
                return json({
                  message: "Phone number already exists",
                  success: false,
                  status: 409,
              });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10); // Hashing password

                const user = new Registration({
                    firstName,
                    middleName,
                    lastName,
                    email,
                    admin,
                    password: hashedPassword,
                    phone,
                    role,
                    position,
                    department,
                  image: base64Image,
                  bio,
              });

                // Save user details
                const saveUserDetails = await user.save();

                if (saveUserDetails) {
                    return json({
                        message: "User created successfully",
                        success: true,
                    status: 201,
                });
              } else {
                  return json({
                      message: "Unable to create user",
                      success: false,
                    status: 500,
                });
                }
            }
          } else {
              return json({
                message: "Invalid intent",
                success: false,
                status: 400,
            });
          }
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
              status: 500,
          });
        }
    }


    async DeleteUser(
        {
            id,
        }: {
            id: string,
        }
    ) {

            const deleteUser = await Registration.findByIdAndDelete(id);
            if (deleteUser) {
                return json({
                    message: "User delete successfully",
                    success: true,
                    status: 500,
                })
            } else {
                return json({
                    message: "Unable to delete user",
                    success: false,
                    status: 500
                })
            }
    }

    async UpdateUser({
        firstName,
        middleName,
        lastName,
        email,
        admin,
        phone,
        role,
        id,
        position,
        department,
        base64Image,
        bio,
    }: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    admin: string;
    phone: string;
    role: string;
    id: string;
    position?: string;
    department?: string;
    base64Image?: string;
    bio?: string;
}) {
      try {
          // Find the user to update
          const existingUser = await Registration.findById(id);

          if (!existingUser) {
              return json({
                  message: "User not found. Unable to update.",
                  success: false,
                  status: 404,
              });
        }

        // Update the image only if a new one is provided
        const updatedImage = base64Image ? base64Image : existingUser.image;

        // Prepare update payload
        const updatePayload: Record<string, any> = {
            firstName,
            lastName,
            email,
            phone,
            role,
            admin,
            middleName,
            position,
            department,
            image: updatedImage,
            bio,
        };

        // Remove undefined values from the payload
        Object.keys(updatePayload).forEach((key) => {
            if (updatePayload[key] === undefined) {
                delete updatePayload[key];
            }
        });

        // Perform the update
        const updatedUser = await Registration.findByIdAndUpdate(id, updatePayload, { new: true });

        if (updatedUser) {
            return json({
                message: "User updated successfully",
                success: true,
                status: 200,
                data: updatedUser, // Return updated user for confirmation
            });
        } else {
            return json({
                message: "Unable to update this record.",
                success: false,
                status: 500,
            });
        }
    } catch (error: any) {
        return json({
            message: error.message || "An error occurred while updating the user.",
            success: false,
            status: 500,
        });
      }
  }



    async logout(intent: string) {
        if (intent === "logout") {
            const session = await getSession();

            return redirect("/", {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            });
        }
    }

    async FetchUsers({
        request,
        page = 1,
        search_term,
        limit = 7,
    }: {
        request?: Request;
            page?: number;
        search_term?: string;
        limit?: number;
        }) {
        const skipCount = (page - 1) * (limit); 

        const searchFilter = search_term
            ? {
                $or: [
                    {
                        firstName: {
                            $regex: new RegExp(
                                search_term
                                    .split(" ")
                                    .map((term) => `(?=.*${term})`)
                                    .join(""),
                                "i"
                            ),
                        },
                    },
                    {
                        lastName: {
                            $regex: new RegExp(
                                search_term
                                    .split(" ")
                                    .map((term) => `(?=.*${term})`)
                                    .join(""),
                                "i"
                            ),
                        },
                    },
                    {
                        email: {
                            $regex: new RegExp(
                                search_term
                                    .split(" ")
                                    .map((term) => `(?=.*${term})`)
                                    .join(""),
                                "i"
                            ),
                        },
                    },
                    {
                        phone: {
                            $regex: new RegExp(
                                search_term
                                    .split(" ")
                                    .map((term) => `(?=.*${term})`)
                                    .join(""),
                                "i"
                            ),
                        },
                    },
                ],
            }
            : {};

        try {
            // Get session and user information if request is provided
            const session = request ? await getSession(request.headers.get("Cookie")) : null;
            const token = session?.get("email");
            const user = token ? await Registration.findOne({ email: token }) : null;

            // Get total employee count and calculate total pages       
            const totalEmployeeCount = await Registration.countDocuments(searchFilter).exec();
            const totalPages = Math.ceil(totalEmployeeCount / (limit || 9));

            // Find users with pagination and search filter
            const users = await Registration.find(searchFilter)
                .populate("department")
                .skip(skipCount)
                .limit(limit || 9)
                .exec()
                ;

            return { user, users, totalPages };
        } catch (error: any) {
            return {
                message: error.message,
                success: false,
                status: 500
            };
        }
    }

}


const usersController = new UsersController
export default usersController