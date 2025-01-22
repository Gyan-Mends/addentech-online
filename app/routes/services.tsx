import { image } from "@nextui-org/react";
// import AWS from "~/components/Icons/icons/AWS";
// import Support from "~/components/Icons/icons/Support";
// import CodingIcon from "~/components/Icons/icons/coding";
// import NetworkIcon from "~/components/Icons/icons/network";
import PublicLayout from "~/components/PublicLayout";
import lineImage from "~/components/images/work-process-line.png"
import logo from "~/components/images/logo.png"
import NetworkIcon from "~/components/icons/NetworkIcon";
import { HoverEffect } from "~/components/acternity/card";



const Services = () => {
    const projects = [
        {
            title: "Digital Marketing & Consultation",
            description:
                "Maximize digital presence with expert SEO, social media strategies, email campaigns, and performance analytics. We help you reach and engage your audience.",
            link: "https://stripe.com",
        },
        {
            title: "Design & Development",
            description:
                "Innovative website design and development, tailored to your business needs. We create intuitive and visually appealing sites that drive results.",
            link: "https://netflix.com",
        },
        {
            title: "IT Services",
            description:
                "Support and management of IT systems, including hardware, software, networks, and security. We ensure your technology infrastructure is robust and efficient.",
            link: "https://google.com",
        },
        {
            title: "Brand & Product Design",
            description:
                "Creating strong brand identities through thoughtful design of logos, packaging, and overall brand aesthetics. We help your brand connect with customers.",
            link: "https://meta.com",
        },
        {
            title: "Cloud Services",
            description:
                "Robust cloud services providing scalable computing resources and secure data storage solutions. We enable flexibility and efficiency in your operations.",
            link: "https://amazon.com",
        },

    ];

    return (
        <PublicLayout>
            <div style={{
                backgroundImage: `url("https://cdn.prod.website-files.com/66614d9079739759bbd5e68e/668d0c2f28f1313d27252c3d_service-shape-bg-2.svg")`,
                backgroundPosition: '100%',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '500px',
                position: 'relative',
            }} className="lg:mt-40 mt-20">
                <div data-aos="fade-right">
                    <p className="font-nunito dark:text-white text-xl font-bold text-[#F2059F]">Here is How We Can Help Your Business</p>
                    <p className="font-nunito dark:text-white text-4xl font-bold mt-8">Comprehensive Services Tailored </p>
                    <p className="font-nunito dark:text-white text-4xl font-bold">
                        to Your Needs
                    </p>
                </div>
                <HoverEffect items={projects} />

            </div>


            <div style={{
                backgroundImage: `url("https://cdn.prod.website-files.com/66614d9079739759bbd5e68e/668d0c2f28f1313d27252c3d_service-shape-bg-2.svg")`,
                backgroundPosition: '100%',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '500px',
                position: 'relative',
            }} className="mt-40">
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