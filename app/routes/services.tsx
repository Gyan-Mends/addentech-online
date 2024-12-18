import { image } from "@nextui-org/react";
// import AWS from "~/components/Icons/icons/AWS";
// import Support from "~/components/Icons/icons/Support";
// import CodingIcon from "~/components/Icons/icons/coding";
// import NetworkIcon from "~/components/Icons/icons/network";
import PublicLayout from "~/components/PublicLayout";
import lineImage from "~/components/images/work-process-line.png"
import logo from "~/components/images/logo.png"
import NetworkIcon from "~/components/icons/NetworkIcon";



const Services = () => {


    return (
        <PublicLayout>
            <div className="lg:mt-40 mt-20">
                <div data-aos="fade-right">
                    <p className="font-nunito dark:text-white text-xl font-bold text-[#F2059F]">Here is How We Can Help Your Business</p>
                    <p className="font-nunito dark:text-white text-4xl font-bold mt-8">Comprehensive Services Tailored </p>
                    <p className="font-nunito dark:text-white text-4xl font-bold">
                        to Your Needs
                    </p>
                </div>
                <div data-aos="fade-down" className="lg:grid lg:grid-cols-3 gap-8 mt-20">
                    <div className=" w-full h-full  border dark:border-white/5 border-black/20 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
                        <div className="w-full flex  items-center justify-center">
                            <div className="h-12 dark:bg-[#0b0e13] bg-white w-12 flex items-center justify-center rounded-full -mt-6 shadow-sm border dark:border-white/5 border-black/10">
                                <NetworkIcon className="text-[#05ECF2] h-8 w-8 " />
                            </div>
                        </div>
                        <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                            Digital Marketing & Consultation
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Maximize digital presence with expert SEO, social media strategies, email campaigns, and performance analytics. We help you reach and engage your audience.            </p>
                    </div>

                    <div className=" w-full h-[25vh] mt-10 lg:mt-0 border dark:border-white/5 border-black/20 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
                        <div className="w-full flex  items-center justify-center">
                            <div className="h-12 dark:bg-[#0b0e13] bg-white w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border dark:border-white/5 border-black/10">
                                {/* <CodingIcon className="text-[#05ECF2] h-8 w-8 " /> */}
                            </div>
                        </div>
                        <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                            Design & Development
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Innovative website design and development, tailored to your business needs. We create intuitive and visually appealing sites that drive results.</p>
                    </div>

                    <div className=" w-full mt-10 lg:mt-0  h-[25vh] border dark:border-white/5 border-black/20  shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
                        <div className="w-full flex  items-center justify-center">
                            <div className="h-12 dark:bg-[#0b0e13] bg-white w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border dark:border-white/5 border-black/10">
                                {/* <Support className="text-[#05ECF2] h-8 w-8 " /> */}
                            </div>
                        </div>
                        <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                            IT Services
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Support and management of IT systems, including hardware, software, networks, and security. We ensure your technology infrastructure is robust and efficient.</p>
                    </div>
                </div>

                <div data-aos="fade-up" className="lg:grid lg:grid-cols-2 gap-16 mt-16">

                    <div className=" w-full h-[25vh] border dark:border-white/5 border-black/20 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
                        <div className="w-full flex  items-center justify-center">
                            <div className="h-12 dark:bg-[#0b0e13] bg-white w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border dark:border-white/5 border-black/10">
                                <img src={logo} className=" bg-[#05ECF2] h-8 w-8 " alt="" />
                            </div>
                        </div>
                        <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                            Brand & Product Design
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Creating strong brand identities through thoughtful design of logos, packaging, and overall brand aesthetics. We help your brand connect with customers.


                        </p>
                    </div>

                    <div className=" w-full h-[25vh] border  dark:border-white/5 border-black/20 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10 lg:mt-0 mt-16">
                        <div className="w-full flex  items-center justify-center">
                            <div className="h-12 dark:bg-[#0b0e13] bg-white w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border dark:border-white/5 border-black/10">
                                {/* <AWS className="text-[#05ECF2] h-8 w-8 " /> */}
                            </div>
                        </div>
                        <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                            Cloud Services
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Robust cloud services providing scalable computing resources and secure data storage solutions. We enable flexibility and efficiency in your operations.</p>
                    </div>
                </div>
            </div>


            <div className="mt-40">
                <div data-aos="fade-right">
                    <p className="font-nunito dark:text-white text-4xl font-bold mt-8">Our Methodology Guarantees
                    </p>
                    <p className="font-nunito dark:text-white text-4xl font-bold">
                        Your Success
                    </p>
                    <img src={lineImage} className=" mt-5" alt="" />
                </div>
                <div className="lg:grid lg:grid-cols-5 gap-4 mt-20">
                    <div data-aos="fade-right" className=" w-full h-full border pb-6 dark:border-white/30 border-black/10 mt-8 lg:mt-0 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
                        <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                            Discover
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            We begin by understanding your needs, goals, and target audience through market research and competitor analysis. This helps us gather precise requirements to define the project scope effectively.          </p>
                    </div>

                    <div data-aos="fade-right" className=" w-full h-full border dark:border-white/30 border-black/10 mt-8 lg:mt-0 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

                        <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                            Planning
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            A detailed project plan is crafted, outlining tasks, timelines, resources, and milestones to ensure a clear roadmap for successful project execution.</p>
                    </div>

                    <div data-aos="fade-down" className=" w-full h-full border dark:border-white/30 border-black/10 mt-8 lg:mt-0shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

                        <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                            Design & Development            </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Our designers create visual elements while developers build the functionality. This stage brings your vision to life with innovative and user-friendly solutions</p>
                    </div>

                    <div data-aos="fade-left" className=" w-full h-full border dark:border-white/30 border-black/10 mt-8 lg:mt-0 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

                        <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                            Testing
                        </p>
                        <p className=" font-nunito text-gray-400  mt-4">
                            Once the development phase is complete, rigorous testing is conducted to ensure the product or service functions as intended and meets quality standards.</p>
                    </div>

                    <div data-aos="fade-left" className=" w-full h-full border dark:border-white/30 border-black/10 mt-8 lg:mt-0 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

                        <p className="dark:text-white font-nunito font-bold text-xl mt-4">
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