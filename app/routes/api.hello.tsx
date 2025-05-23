import { ActionFunction, json } from "@remix-run/node";
import { Contact } from "~/modal/contact";
export const action: ActionFunction = async ({ request }) => {

  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    if (!name || !email || !message) {
      return json({ error: "All fields are required" }, { status: 400 });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    return json({ success: true, message: "Message saved successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error saving contact:", error);
    return json({ error: "Failed to save the message" }, { status: 500 });
  }
};