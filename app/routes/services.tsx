import { image } from "@nextui-org/react";
import CodingIcon from "~/components/Icons/icons/coding";
import NetworkIcon from "~/components/Icons/icons/network";
import PublicLayout from "~/components/PublicLayout";
import lineImage from "~/components/images/work-process-line.png"


const Services = () => {


    return (
        <PublicLayout>
            <div className="mt-40">
                <p className="font-nunito text-white text-xl font-bold text-[#F2059F]">Here is How We Can Help Your Business</p>
                <p className="font-nunito text-white text-4xl font-bold mt-8">Comprehensive Services Tailored </p>
                <p className="font-nunito text-white text-4xl font-bold">
                    to Your Needs
                </p>
                <div className="lg:grid lg:grid-cols-3 gap-8 mt-20">
                    <div className=" w-full h-[25vh] border border-white/5 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
                        <div className="w-full flex  items-center justify-center">
                            <div className="h-12 bg-[#0b0e13] w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border border-white/5">
                                <NetworkIcon className="text-[#05ECF2] h-8 w-8 " />
                            </div>
                        </div>
                        <p className="text-white font-nunito font-bold text-xl mt-4">
                            Digital Marketing & Consultation
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Maximize digital presence with expert SEO, social media strategies, email campaigns, and performance analytics. We help you reach and engage your audience.            </p>
                    </div>

                    <div className=" w-full h-[25vh] border border-white/5 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
                        <div className="w-full flex  items-center justify-center">
                            <div className="h-12 bg-[#0b0e13] w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border border-white/5">
                                <CodingIcon className="text-[#05ECF2] h-8 w-8 " />
                            </div>
                        </div>
                        <p className="text-white font-nunito font-bold text-xl mt-4">
                            Design & Development
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Innovative website design and development, tailored to your business needs. We create intuitive and visually appealing sites that drive results.</p>
                    </div>

                    <div className=" w-full h-[25vh] border border-white/5 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
                        <div className="w-full flex  items-center justify-center">
                            <div className="h-12 bg-[#0b0e13] w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border border-white/5">
                                <CodingIcon className="text-[#05ECF2] h-8 w-8 " />
                            </div>
                        </div>
                        <p className="text-white font-nunito font-bold text-xl mt-4">
                            Design & Development
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Innovative website design and development, tailored to your business needs. We create intuitive and visually appealing sites that drive results.</p>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-2 gap-16 mt-20">

                    <div className=" w-full h-[25vh] border border-white/5 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
                        <div className="w-full flex  items-center justify-center">
                            <div className="h-12 bg-[#0b0e13] w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border border-white/5">
                                <CodingIcon className="text-[#05ECF2] h-8 w-8 " />
                            </div>
                        </div>
                        <p className="text-white font-nunito font-bold text-xl mt-4">
                            Design & Development
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Innovative website design and development, tailored to your business needs. We create intuitive and visually appealing sites that drive results.</p>
                    </div>

                    <div className=" w-full h-[25vh] border border-white/5 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
                        <div className="w-full flex  items-center justify-center">
                            <div className="h-12 bg-[#0b0e13] w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border border-white/5">
                                <CodingIcon className="text-[#05ECF2] h-8 w-8 " />
                            </div>
                        </div>
                        <p className="text-white font-nunito font-bold text-xl mt-4">
                            Design & Development
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Innovative website design and development, tailored to your business needs. We create intuitive and visually appealing sites that drive results.</p>
                    </div>
                </div>
            </div>


            <div className="mt-40">
                <p className="font-nunito text-white text-4xl font-bold mt-8">Our Methodology Guarantees
                </p>
                <p className="font-nunito text-white text-4xl font-bold">
                    Your Success
                </p>
                <img src={lineImage} className=" mt-5" alt="" />
                <div className="lg:grid lg:grid-cols-5 gap-4 mt-20">
                    <div className=" w-full h-full border pb-6 border-white/30 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
                        <p className="text-white font-nunito font-bold text-xl mt-4">
                            Discover
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            We begin by understanding your needs, goals, and target audience through market research and competitor analysis. This helps us gather precise requirements to define the project scope effectively.          </p>
                    </div>

                    <div className=" w-full h-full border border-white/30 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

                        <p className="text-white font-nunito font-bold text-xl mt-4">
                            Planning
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            A detailed project plan is crafted, outlining tasks, timelines, resources, and milestones to ensure a clear roadmap for successful project execution.</p>
                    </div>

                    <div className=" w-full h-full border border-white/30 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

                        <p className="text-white font-nunito font-bold text-xl mt-4">
                            Design & Development            </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Our designers create visual elements while developers build the functionality. This stage brings your vision to life with innovative and user-friendly solutions</p>
                    </div>

                    <div className=" w-full h-full border border-white/30 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

                        <p className="text-white font-nunito font-bold text-xl mt-4">
                            Testing
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Once the development phase is complete, rigorous testing is conducted to ensure the product or service functions as intended and meets quality standards.</p>
                    </div>

                    <div className=" w-full h-full border border-white/30 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

                        <p className="text-white font-nunito font-bold text-xl mt-4">
                            Project Delivery
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Upon successful testing and any necessary revisions, the final product or service is delivered to you. This may include deployment, launching a website, or implementing a marketing campaign.</p>
                    </div>
                </div>


            </div>



        </PublicLayout>
    );
}

export default Services