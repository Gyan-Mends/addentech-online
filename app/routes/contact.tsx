import { Button, Card, Input, Textarea } from "@nextui-org/react"
import { Link } from "@remix-run/react"
import { CheckCircle, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import axios from "axios"
import ScrollAnimation from "~/components/animation"
import { errorToast, successToast } from "~/components/toast"
import PublicLayout from "~/layout/PublicLayout"



const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        number: "",
        company: "",
        description: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("firstName", formData.firstName);
            formDataToSend.append("middleName", formData.middleName);
            formDataToSend.append("lastName", formData.lastName);
            formDataToSend.append("number", formData.number);
            formDataToSend.append("company", formData.company);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("intent", "create");

            const response = await axios.post("/api/contacts", formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                successToast(response.data.message);
                // Reset form
                setFormData({
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    number: "",
                    company: "",
                    description: ""
                });
            } else {
                errorToast(response.data.message);
            }
        } catch (error: any) {
            errorToast(error.response?.data?.message || "Failed to send message");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PublicLayout>
            <div>
                <Toaster position="top-right" />

                <main className="flex-1 ">
                    {/* Hero Section */}
                    <section className="py-12 md:py-20 lg:px-[125px]">
                        <div className="container">
                            <div className="grid gap-8 lg:grid-cols-2 items-center">
                                <div className="space-y-6">
                                    <ScrollAnimation>
                                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter font-montserrat">
                                        Ready to Take Your Business To That{" "}
                                            <span className="text-pink-500">
                                            GIGANTIC
                                        </span>{" "}
                                        New Level?
                                    </h1>
                                    </ScrollAnimation>
                                    <ScrollAnimation delay={0.2}>
                                        <p className="text-lg text-gray-400 max-w-[600px] font-nunito">
                                        Elevate your business to extraordinary heights with innovative solutions tailored for growth and
                                        success
                                    </p>
                                    </ScrollAnimation>
                                    <ScrollAnimation delay={0.3}>
                                        <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-pink-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium font-nunito">24/7 Customer Support</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                                                    <CheckCircle className="h-5 w-5 text-pink-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium font-nunito">Guaranteed Results</p>
                                            </div>
                                        </div>
                                    </div>
                                    </ScrollAnimation>
                                    <ScrollAnimation delay={0.4}>
                                        <div className="relative mt-8 overflow-hidden rounded-xl border ">
                                        <img
                                                src="https://res.cloudinary.com/djlnjjzvt/image/upload/v1747077587/e1_gfxcqi.avif"
                                            alt="Customer support team"
                                            width={600}
                                            height={300}
                                                className="w-full lg:h-[100vh] object-cover"
                                            />
                                        <div className="absolute bottom-0 left-0 p-4">
                                                <p className="text-lg font-medium font-montserrat bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-white">Expert Team Ready to Help</p>
                                                <p className="text-sm text-white font-nunito">Our dedicated professionals are available around the clock</p>
                                        </div>
                                    </div>
                                    </ScrollAnimation>
                                </div>

                                <div>
                                    <ScrollAnimation delay={0.5}>
                                        <Card className="border border-black/20  backdrop-blur  lg:p-10">
                                        <div className="pb-2 flex flex-col gap-2 mb-4">
                                            <p className="text-xl font-montserrat">Get in Touch</p>
                                                <p className="font-nunito text-default-600">Fill out the form below to contact our team</p>
                                        </div>
                                        <div>
                                            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                                                <div className="flex gap-4">
                                                    <Input
                                                        name="firstName"
                                                        label="First Name"
                                                        placeholder=" Mends"
                                                        labelPlacement="outside"
                                                        className="h-10"
                                                        value={formData.firstName}
                                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                        classNames={{
                                                            inputWrapper: " flex-grow w-full border border-black/10 rounded-md ",
                                                            label: "!dark:text-white font-nunito text-md",
                                                        }}
                                                    />
                                                    <Input
                                                        name="middleName"
                                                        label="Middle Name"
                                                        placeholder="Gyan "
                                                        labelPlacement="outside"
                                                        className="h-10"
                                                        value={formData.middleName}
                                                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                                                        classNames={{
                                                            inputWrapper: " flex-grow w-full border border-black/10 rounded-md ",
                                                            label: "!dark:text-white font-nunito text-md",
                                                        }}
                                                    />
                                                </div>

                                                <Input
                                                    name="lastName"
                                                    label="Last Name"
                                                    placeholder="Last name"
                                                    labelPlacement="outside"
                                                    className="h-10"
                                                    value={formData.lastName}
                                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                    classNames={{
                                                        inputWrapper: " flex-grow w-full border border-black/10 rounded-md ",
                                                        label: "!dark:text-white font-nunito text-md",
                                                    }}
                                                />

                                                <div className="flex gap-4">
                                                    <Input
                                                        name="number"
                                                        label="Phone Number"
                                                        placeholder=" 0593125184"
                                                        labelPlacement="outside"
                                                        className="h-10"
                                                        value={formData.number}
                                                        onChange={(e) => handleInputChange('number', e.target.value)}
                                                        classNames={{
                                                            inputWrapper: " flex-grow w-full border border-black/10 rounded-md ",
                                                            label: "!dark:text-white font-nunito text-md",
                                                        }}
                                                    />
                                                    <Input
                                                        name="company"
                                                        label="Company"
                                                        placeholder="Addentech "
                                                        labelPlacement="outside"
                                                        className="h-10"
                                                        value={formData.company}
                                                        onChange={(e) => handleInputChange('company', e.target.value)}
                                                        classNames={{
                                                            inputWrapper: " flex-grow w-full border border-black/10 rounded-md ",
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
                                                    value={formData.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    classNames={{
                                                        inputWrapper: "resize-y flex-grow w-full border !h-48 border-black/10 hover:bg-[#0b0e13] focus:bg-[#0b0e13]",
                                                        label: "!dark:text-white font-nunito text-md",

                                                    }}
                                                />

                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="h-10 w-40 rounded-lg text-lg font-montserrat bg-pink-500 text-white  hover:transition hover:duration-500 hover:dark:text-white disabled:opacity-50"
                                                >
                                                    {isSubmitting ? "Submitting..." : "Submit"}
                                                </button>
                                            </form>
                                        </div>

                                    </Card>
                                    </ScrollAnimation>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Office Location Section */}
                    <section className="py-16  lg:p-[125px]">
                        <div className="container">
                            <ScrollAnimation>
                                <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">Visit Our Office And Start Your Journey</h2>
                                <p className="text-gray-600 max-w-2xl mx-auto font-nunito">
                                    Our headquarters is conveniently located in the heart of the city. Stop by for a consultation or
                                    schedule a virtual meeting.
                                </p>
                            </div>
                            </ScrollAnimation>

                            <ScrollAnimation>
                                <div className="overflow-hidden rounded-xl border border-black/20">
                                <div className="aspect-[16/9] md:aspect-[21/9] w-full relative">
                                    <iframe className="w-full h-full   rounded-2xl " src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d7940.721604991315!2d-0.1566921298999994!3d5.660847350500148!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sgh!4v1746271544705!5m2!1sen!2sgh" width="600" height="450" loading="lazy" ></iframe>
                                    <div className="absolute top-4 left-4 bg-white backdrop-blur-sm p-3 rounded-lg border border-black/20">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-pink-500 flex items-center justify-center text-white font-bold">
                                                A
                                            </div>
                                            <span className="text-sm font-bold">ADDENTECH HEADQUARTERS</span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <Link to="https://maps.app.goo.gl/HsRiYfuHCk8X23iAA">
                                            <Button size="sm" className="bg-blue-500 backdrop-blur-sm border-blue-900/50">
                                                Get Directions
                                            </Button>
                                        </Link>


                                    </div>
                                </div>
                            </div>
                            </ScrollAnimation>
                        </div>
                    </section>


                </main>
            </div>
        </PublicLayout>

    )
}

export default Contact