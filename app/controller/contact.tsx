import { json } from "@remix-run/node"
import Contact from "~/modal/contact"

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
}

const contactController = new ContactController
export default contactController