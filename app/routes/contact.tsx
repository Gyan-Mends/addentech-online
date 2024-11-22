import { Button, Input, Textarea } from "@nextui-org/react";
import { Form } from "@remix-run/react";
import LocationIcon from "~/components/Icons/icons/locationIcon";
import PublicLayout from "~/components/PublicLayout";
import service from "~/components/images/670c834d0c2d2d95eac92c3c_Contact Image.webp"

const Contact = () => {
    return (
        <PublicLayout>
            <div className="mt-6 lg:mt-20 lg:grid lg:grid-cols-2 gap-10">
                <div className="flex flex-col gap-6 px-4">
                    <p className="text-white font-nunito font-bold text-5xl">
                        Ready to Take Your Business To That GIGANTIC New Level?
                    </p>
                    <p className="font-nounito text-white">
                        Elevate your business to extraordinary heights with innovative solutions tailored for growth and success
                    </p>
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center  gap-4">
                            <LocationIcon className="text-[#05ECF2] h-6 w-6 hover:text-[#F2059F] hover:transition hover:duration-500" />
                        </div>
                        <div>
                            <p className="text-primary-100 font-nunito">24/7 Customer Support</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center  gap-4">
                            <LocationIcon className="text-[#05ECF2] h-6 w-6 hover:text-[#F2059F] hover:transition hover:duration-500" />
                        </div>
                        <div>
                            <p className="text-primary-100 font-nunito">24/7 Customer Support</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center  gap-4">
                            <LocationIcon className="text-[#05ECF2] h-6 w-6 hover:text-[#F2059F] hover:transition hover:duration-500" />
                        </div>
                        <div>
                            <p className="text-primary-100 font-nunito">24/7 Customer Support</p>
                        </div>
                    </div>
                    <div>
                        <img className="rounded-xl" src={service} alt="" />
                    </div>
                </div>
                <div className="flex bg-[rgb(14,17,22)] shadow-lg mt-20 lg:mt-0 h-full rounded-2xl border border-white/30 px-8 py-8">
                    <Form className="w-full flex flex-col gap-8">
                        <div className="flex gap-4">
                            <Input
                                label="First Name"
                                placeholder=" Mends"
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: "flex-grow w-full border border-white/5 bg-[#0b0e13] hover:bg-[#0b0e13] focus:bg-[#0b0e13] h-12",
                                    label: "!text-white font-nunito text-md",
                                }}
                            />
                            <Input
                                label="Last Name"
                                placeholder="Gyan "
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: "flex-grow w-full border border-white/5 bg-[#0b0e13] hover:bg-[#0b0e13] focus:bg-[#0b0e13] h-12",
                                    label: "!text-white font-nunito text-md",
                                }}
                            />
                        </div>

                        <Input
                            label="Last Name"
                            placeholder="addentech@example.com "
                            labelPlacement="outside"
                            classNames={{
                                inputWrapper: "flex-grow w-full border border-white/5 bg-[#0b0e13] hover:bg-[#0b0e13] focus:bg-[#0b0e13] h-12",
                                label: "!text-white font-nunito text-md",
                            }}
                        />

                        <div className="flex gap-4">
                            <Input
                                label="Phone Number"
                                placeholder=" 0593125184"
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: "flex-grow w-full border border-white/5 bg-[#0b0e13] hover:bg-[#0b0e13] focus:bg-[#0b0e13] h-12",
                                    label: "!text-white font-nunito text-md",
                                }}
                            />
                            <Input
                                label="Company"
                                placeholder="Addentech "
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: "flex-grow w-full border border-white/5 bg-[#0b0e13] hover:bg-[#0b0e13] focus:bg-[#0b0e13] h-12",
                                    label: "!text-white font-nunito text-md",
                                }}
                            />
                        </div>

                        <Textarea
                            label="Leave Us a Message"
                            labelPlacement="outside"
                            placeholder=" Let's get in touch "
                            maxRows={8}
                            classNames={{
                                inputWrapper: "resize-y flex-grow w-full border !h-48 border-white/5 bg-[#0b0e13] hover:bg-[#0b0e13] focus:bg-[#0b0e13]",
                                label: "!text-white font-nunito text-md",

                            }}
                        />



                        <Button
                            className="h-10 text-lg font-montserrat bg-[#05ECF2]  hover:bg-[#F2059F] hover:transition hover:duration-500 hover:text-white"
                        >
                            Submit
                        </Button>
                    </Form>
                </div>
            </div>
            <div className="mt-20 flex flex-col gap-10">
                <div>
                    <p className="text-white text-center font-montserrat text-4xl font-bold">Visit Our Office And Start</p>
                    <p className="text-white text-center font-montserrat text-4xl font-bold">Your Journey </p>
                </div>

                <div className="w-full h-[80vh]  rounded-2xl ">
                    <iframe className="w-full h-full   rounded-2xl " src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d65306297.13799456!2d-0.23402!3d5.6448691!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf99bfdf00ed27%3A0xb4dd07decbb7c003!2sAddens%20Technology%20Limited!5e1!3m2!1sen!2sgh!4v1732232234566!5m2!1sen!2sgh"></iframe>
                </div>
            </div>
        </PublicLayout>

    );
}

export default Contact