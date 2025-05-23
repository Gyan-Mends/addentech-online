import { json } from "@remix-run/node"
import { Contact } from "~/modal/contact"

class ContactController {
    async Create({

        firstName,
        lastName,
        middleName,
        number,
        company,
        description
    }: {
        firstName: string
        lastName: string
        middleName: string
        number: string
        company: string
        description: string
    }) {
        const newConatact = new Contact({
            firstName,
            lastName,
            middleName,
            number,
            company,
            description
        })

        const response = await newConatact.save()
        if (response) {
            return json({ message: "Message sent successfully", success: true });
        } else {
            return json({ message: "Message not sent ", success: true });

        }
    }

    async getContacts({
        request,
        page,
        search_term,
        limit = 9
    }: {
        request: Request,
        page: number;
        search_term: string;
        limit?: number;
    }) {
        const skipCount = (page - 1) * limit;

        // Define the search filter only once
        const searchFilter = search_term
            ? {
                $or: [
                    {
                        name: {
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


            // Get total employee count and calculate total pages       
            const totalContact = await Contact.countDocuments(searchFilter).exec();
            const totalPages = Math.ceil(totalContact / limit);

            // Find users with pagination and search filter
            const contacts = await Contact.find(searchFilter)
                .skip(skipCount)
                .limit(limit)
                .exec();



            return { contacts, totalPages };
        } catch (error: any) {
            return {
                message: error.message,
                success: false,
                status: 500
            };
        }
    }

    async DeleteCat(id: string) {
        // Delete Logic

        const deleteCategory = await Contact.findByIdAndDelete(id);
        if (deleteCategory) {
            return json({ message: "Contact deleted successfully", success: true }, { status: 200 });
        } else {
            return json({ message: "Contact not found", success: false }, { status: 404 });
        }

    }
}



const contactController = new ContactController
export default contactController