import { Button, Input, Textarea } from "@nextui-org/react";
import { Form, Link, useActionData } from "@remix-run/react";
// import LocationIcon from "~/components/Icons/icons/locationIcon";
import PublicLayout from "~/components/PublicLayout";
import service from "~/components/images/670c834d0c2d2d95eac92c3c_Contact Image.webp"
import { ActionFunction, json } from "@remix-run/node";
import contactController from "~/controller/contact";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { errorToast, successToast } from "~/components/toast";
import img5 from "~/components/images/668c2173193fa0089dc32016_image-bg.jpg"


const Contact = () => {
    const actionData = useActionData<any>()

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message)
            } else {
                errorToast(actionData.message)
            }
        }
    }, [actionData])
    return (
        <PublicLayout>

            <div className="mt-6 lg:mt-40 lg:grid lg:grid-cols-2 gap-10">
                <Toaster position="top-right" />
                <div data-aos="fade-right" className="flex flex-col gap-6 px-4">
                    <p className="dark:text-white font-nunito font-bold text-5xl">
                        Ready to Take Your Business To That GIGANTIC New Level?
                    </p>
                    <p className="font-nounito dark:text-white">
                        Elevate your business to extraordinary heights with innovative solutions tailored for growth and success
                    </p>
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center  gap-4">
                            {/* <LocationIcon className="text-[#05ECF2] h-6 w-6 hover:text-[#F2059F] hover:transition hover:duration-500" /> */}
                        </div>
                        <div>
                            <p className=" font-nunito">24/7 Customer Support</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center  gap-4">
                            {/* <LocationIcon className="text-[#05ECF2] h-6 w-6 hover:text-[#F2059F] hover:transition hover:duration-500" /> */}
                        </div>
                        <div>
                            <p className=" font-nunito">24/7 Customer Support</p>
                        </div>
                    </div>

                    <div>
                        <img className="rounded-xl" src={service} alt="" />
                    </div>
                </div>
                <div data-aos="fade-left" className="flex border border-black/10 shadow-sm mt-20 lg:mt-0 h-full rounded-2xl border dark:border-white/30 border-black/20  px-8 py-8">
                    <Form method="post" className="w-full flex flex-col gap-8">
                        <div className="flex gap-4">
                            <Input
                                name="firstName"
                                label="First Name"
                                placeholder=" Mends"
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: "flex-grow w-full border border-white/5 hover:bg-[#0b0e13] focus:bg-[#0b0e13] h-12",
                                    label: "!dark:text-white font-nunito text-md",
                                }}
                            />
                            <Input
                                name="middleName"
                                label="Last Name"
                                placeholder="Gyan "
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: "flex-grow w-full border border-white/5  hover:bg-[#0b0e13] focus:bg-[#0b0e13] h-12",
                                    label: "!dark:text-white font-nunito text-md",
                                }}
                            />
                        </div>

                        <Input
                            name="lastName"
                            label="Last Name"
                            placeholder="addentech@example.com "
                            labelPlacement="outside"
                            classNames={{
                                inputWrapper: "flex-grow w-full border border-white/5  hover:bg-[#0b0e13] focus:bg-[#0b0e13] h-12",
                                label: "!dark:text-white font-nunito text-md",
                            }}
                        />

                        <div className="flex gap-4">
                            <Input
                                name="number"
                                label="Phone Number"
                                placeholder=" 0593125184"
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: "flex-grow w-full border border-white/5  hover:bg-[#0b0e13] focus:bg-[#0b0e13] h-12",
                                    label: "!dark:text-white font-nunito text-md",
                                }}
                            />
                            <Input
                                name="company"
                                label="Company"
                                placeholder="Addentech "
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: "flex-grow w-full border border-white/5  hover:bg-[#0b0e13] focus:bg-[#0b0e13] h-12",
                                    label: "!dark:text-white font-nunito text-md",
                                }}
                            />
                        </div>

                        <Textarea
                            name="description"
                            label="Leave Us a Message"
                            labelPlacement="outside"
                            placeholder=" Let's get in touch "
                            maxRows={8}
                            classNames={{
                                inputWrapper: "resize-y flex-grow w-full border !h-48 border-white/5  hover:bg-[#0b0e13] focus:bg-[#0b0e13]",
                                label: "!dark:text-white font-nunito text-md",

                            }}
                        />

                        <input type="text" hidden value="create" name="intent" />


                        <button
                            className="h-10 rounded-lg text-lg font-montserrat bg-primary  hover:transition hover:duration-500 hover:dark:text-white"
                        >
                            Submit
                        </button>
                    </Form>
                </div>
            </div>
            <div className="mt-20 flex flex-col gap-10">
                <div data-aos="fade-down">
                    <p className="dark:text-white text-center font-montserrat text-4xl font-bold">Visit Our Office And Start</p>
                    <p className="dark:text-white text-center font-montserrat text-4xl font-bold">Your Journey </p>
                </div>

                <div data-aos="zoom-in" className="w-full h-[80vh]  rounded-2xl ">
                    <iframe className="w-full h-full   rounded-2xl " src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d65306297.13799456!2d-0.23402!3d5.6448691!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf99bfdf00ed27%3A0xb4dd07decbb7c003!2sAddens%20Technology%20Limited!5e1!3m2!1sen!2sgh!4v1732232234566!5m2!1sen!2sgh"></iframe>
                </div>
            </div>
        </PublicLayout>

    );
}

export default Contact

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const middleName = formData.get("middleName") as string;
    const number = formData.get("number") as string;
    const company = formData.get("company") as string;
    const description = formData.get("description") as string;
    const intent = formData.get("intent") as string;


    switch (intent) {
        case "create":
            const user = await contactController.Create({
                firstName,
                middleName,
                lastName,
                number,
                company,
                description,

            })
            return user

        default:
            return json({
                message: "Bad request",
                success: false,
                status: 400
            })
    }
}