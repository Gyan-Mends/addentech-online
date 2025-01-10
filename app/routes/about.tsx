import PublicLayout from "~/components/PublicLayout";
import img1 from "~/components/images/670c834d3d0efc689418842a_About Hero Image 1.webp"
import img2 from "~/components/images/670c834d7374160efd4760fd_About Hero Image 2.webp"
import img3 from "~/components/images/670c834d20d4b38fdba25602_About Hero Image 3.webp"
import img4 from "~/components/images/VR-1-e1713171654663-qmqn1osak8od6cf9p0zdekvgfd93n6fuetrfnv5lxc.png"
import img5 from "~/components/images/about-five2.jpg"
import img6 from "~/components/images/about-five1.jpg"
import boss from "~/components/images/670ca86e3679607f0324d7e6_Team Image 6-p-500.jpg"
import jl from "~/components/images/JL.png"
import testimonial from "~/components/images/670c83518128ff5c009e4a93_Testimonail Image 3-p-500.webp"
import dl from "~/components/images/Dennislaw-Logo.svg"
import mr from "~/components/images/mr-logo.png"
import news from "~/components/images/DL-News-Logo.png"


import { json, Link, useLoaderData } from "@remix-run/react";
import { Button } from "@nextui-org/react";
// import EmailIcon from "~/components/Icons/icons/emailIcon";
// import StarIcon from "~/components/Icons/icons/starIcon";
import { useState } from "react";
import EmailIcon from "~/components/icons/EmailIcon";
import usersController from "~/controller/Users";
import { getSession } from "~/session";
import { LoaderFunction } from "@remix-run/node";
import { RegistrationInterface } from "~/interface/interface";

const About = () => {
    const {
        // user,
        users,
    } = useLoaderData<{
        // user: { _id: string },
        users: RegistrationInterface[],
    }>()
    const testimonials = [
        {
            id: 1,
            stars: 5,
            text: "This CRM has transformed our sales process! Our team's productivity has skyrocketed, and we’ve closed more deals than ever before. The intuitive interface made onboarding a breeze.",
            author: "Johnathan Doe",
            position: "CEO at Addentech",
            image: testimonial,
        },
        {
            id: 2,
            stars: 5,
            text: "The best investment we’ve made! Managing customer interactions has never been easier. The insights we get are invaluable.",
            author: "Sarah Lee",
            position: "Marketing Manager at MarketPro",
            image: testimonial,
        },
        {
            id: 3,
            stars: 5,
            text: "A fantastic tool that has streamlined our workflows and increased our team's efficiency. Highly recommend it!",
            author: "Michael Smith",
            position: "Sales Lead at InnovateX",
            image: img1,
        },
    ];

    const team = [
        {
            name: "Micheal Brown",
            position: "Sales Director",
            image: img5, // Real online image for team
        },
        {
            name: "Jane Doe",
            position: "Marketing Manager",
            image: img6, // Real online image for team
        },
        {
            name: "Alex Smith",
            position: "Operations Lead",
            image: img5,
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSliding, setIsSliding] = useState(false);

    const handleNext = () => {
        if (isSliding) return;
        setIsSliding(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
            setIsSliding(false);
        }, 500); // Adjust timeout to match animation duration
    };

    const handlePrev = () => {
        if (isSliding) return;
        setIsSliding(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
            setIsSliding(false);
        }, 500); // Adjust timeout to match animation duration
    };
    return (
        <PublicLayout>
            <div data-aos="fade-down">
            <div className="flex flex-col gap-4 mt-10 transition duration-500">
                <p className="font-montserrat font-bold text-4xl text-center dark:text-white">
                    Transforming The Legal Landscape
                </p>
                <p className="font-montserrat font-bold text-4xl text-center dark:text-white">
                    With Technology
                </p>
            </div>
            <div className="mt-10">
                <p className="font-nunito text-md text-center dark:text-white">
                    Providing our customers with quality legal
                </p>
                <p className="font-nunito text-md text-center dark:text-white">
                    technology services and develop excellent
                </p>
                <p className="font-nunito text-md text-center dark:text-white">
                    products at fair and competitive prices.
                </p>
            </div>
            </div>
            <div data-aos="fade-up" className="mt-10 lg:grid lg:grid-cols-4 ">
                <img src={img1} className="rounded-xl transition-transform duration-500 ease-in-out hover:scale-105  w-full" alt="" />
                <img className="col-span-2 lg:mt-14 rounded-xl transition-transform duration-500 ease-in-out hover:scale-105 lg:mt-0 mt-8" src={img2} alt="" />
                <img src={img3} className="lg:mt-0 mt-8 rounded-xl transition-transform duration-500 ease-in-out hover:scale-105 w-full" alt="" />
            </div>

            <div className="lg:grid lg:grid-cols-2 mt-20 h-[60vh] lg:flex items-center gap-20">
                <div data-aos="fade-right" className="flex flex-col gap-4">
                    <p className="font-montserrat text-4xl font-bold dark:text-white">Learn More About Our Company Statistics</p>
                    <p className="dark:text-white">Discover key insights and data about our company, showcasing our growth, performance, and achievements.</p>
                </div>
                <div data-aos="fade-left" className="grid grid-cols-2 gap-10 mt-10 lg:mt-0">
                    <div className=" flex flex-col gap-10">
                        <div className="w-full h-40 rounded-xl border border-black/10 dark:border-white/30  flex flex-col px-10 justify-center">
                            <p className="font-nunito text-4xl dark:text-white font-bold">21+</p>
                            <p className="font-nunito text-lg dark:text-white ">Project Completed</p>
                        </div>
                        <div className="w-full h-40 rounded-xl border border-black/10 dark:border-white/30  flex flex-col px-10 justify-center">
                            <p className="font-nunito text-4xl dark:text-white font-bold">98%</p>
                            <p className="font-nunito text-lg dark:text-white ">Happy Clients</p>
                        </div>
                    </div>
                    <div>
                        <div className="w-full h-full rounded-xl border border-black/10 dark:border-white/30 gap-4 flex flex-col px-10 justify-center">
                            <p className="font-nunito text-4xl dark:text-white font-bold">5+</p>
                            <p className="font-nunito text-lg dark:text-white ">Years Of Experience in Legal Tech Solutions</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:grid lg:grid-cols-2 lg:flex items-center mt-40">
                <div data-aos="fade-right" className="flex flex-col gap-4">
                    <p className="font-nunito text-4xl dark:text-white font-bold">Our Vission</p>
                    <p className="font-nunito text-lg dark:text-white ">To transform the legal landscape with technology</p>
                    <p className="font-nunito text-lg dark:text-white ">Revolutionizing the legal industry through innovative technology, making processes smarter, faster, and more accessible.</p>
                </div>
                <div data-aos="fade-left" className="">
                    <img className="transition-transform duration-500 ease-in-out hover:scale-105" src={img4} alt="" />
                </div>
            </div>

            <div data-aos="zoom-in" className="lg:px-60 lg:py-20 mt-10 lg:mt-10">
                <div className="h-80 border border-black/10 dark:border-white/30 rounded-2xl py-10" >
                    <p className="font-nunito text-4xl dark:text-white font-bold text-center">Our Mission</p>
                    <p className="font-nunito text-md text-center dark:text-white mt-10">
                        Providing our customers with quality legal
                    </p>
                    <p className="font-nunito text-md text-center dark:text-white">
                        technology services and develop excellent
                    </p>
                    <p className="font-nunito text-md text-center dark:text-white">
                        products at fair and competitive prices.
                    </p>

                    <div className="flex justify-center items-center gap-4 mt-6 lg:mt-10">
                        <Link to="/contact">
                            <Button
                                className="bg-[#05ECF2] font-nunito text-lg  hover:transition hover:duration-500  hover:-translate-y-2 "
                            >
                                Contact us
                            </Button>
                        </Link>
                        <Link to="/about">
                            <Button
                                color="default"
                                className="font-nunito bg-[#F2059F] text-lg hover:transition hover:duration-500  hover:-translate-y-2  dark:text-white"
                            >
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="lg:grid lg:grid-cols-2 mt-20 h-full lg:flex items-center gap-20">
                <div className="">
                    <img data-aos="fade-right" className="rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105" src={img6} alt="" />
                    <img data-aos="fade-up" className="lg:ml-60 lg:-mt-60 rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 mt-8" src={img5} alt="" />
                </div>
                <div data-aos="fade-left" className="flex flex-col gap-4 mt-10">
                    <p className="font-montserrat text-4xl font-bold dark:text-white">Know More About Us</p>
                    <p className="dark:text-white">Adden Technology Company Limited (Addentech) is a leading, highly innovative software house, and technology provider, established to provide legal technology solutions to law firms, legal departments of institutions and government. We started as DennisLaw but to go beyond our mandate, we changed the name to Addens Technology Limited, embracing a wider range of legal technology products and projects. Addentech, being customer oriented, offers differentiated legal technology solutions. The legal technologies we provide makes legal services more affordable and easily accessible. We help our customers by developing innovative solutions and a relaxed working environment.</p>
                </div>
            </div>

            {/* Team Section */}
            <div className="lg:flex justify-between lg:mt-40 mt-20">
                <div className="" data-aos="fade-down">
                    <p className="font-montserrat text-4xl font-bold dark:text-white">Meet Our Dedicated Experts Behind
                    </p>
                    <p className="font-montserrat text-4xl font-bold dark:text-white"> Addentech  Success
                    </p>
                </div>
                <div className="" data-aos="fade-down">
                    <Link to="/team">
                        <Button
                            color="default"
                            className="font-nunito bg-[#F2059F] mt-8 lg:mt-0 text-lg hover:transition hover:duration-500  hover:-translate-y-2  text-white"
                        >
                            See all our team members
                        </Button></Link>
                </div>
            </div> 
            <div className="lg:grid lg:grid-cols-3 gap-10 lg:mt-40 ">
                {users.slice(0, 3).map((member, index) => (
                    <div data-aos="zoom-in" key={index} className="w-full h-[60vh] border border-black/10 dark:border-white/5 rounded-2xl mt-40 lg:mt-0">
                        <div className="w-full flex items-center justify-between px-10  h-28  rounded-tr-2xl rounded-tl-2xl">
                            <div>
                                <p className="font-nunito text-lg dark:text-white">{member?.firstName + " " + member?.middleName + " " + member?.lastName}</p>
                                <p className="font-nunito text-md dark:text-white">{member.position}</p>
                            </div>
                            <div>
                                <Link to="">
                                    <EmailIcon className="h-6 w-6 text-[#05ECF2]" />
                                </Link>
                            </div>
                        </div>
                        <div className="h-[60vh] overflow-hidden rounded-bl-2xl rounded-br-2xl">
                            <img
                                className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                                src={member.image}
                                alt={member.name}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-60">
                <div data-aos="fade-right" >
                    <p className="font-nunito dark:text-white text-2xl font-bold text-[#F2059F]">Why Choose us</p>
                <p className="font-nunito dark:text-white text-4xl font-bold mt-8">Top-Notch Software Development and</p>
                <p className="font-nunito dark:text-white text-4xl font-bold">
                    Digital Transformation
                </p>
                </div>
                <div className="lg:grid lg:grid-cols-3 gap-8 mt-10">
                    <Link to="https://www.justicelocator.com/" >
                        <div data-aos="fade-right" className=" w-full  h-[80vh] border dark:border-white/10 border-black/20  shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105">
                            <div className="mt-10 px-4">
                                <img src={jl} alt="" />
                                <p className="font-nunito  text-xl font-bold text-[#05ECF2]">Justice Locator</p>
                                <p className="font-nunito dark:text-white mt-4">Justice Locator App provides users with the location of the courts in Ghana and helps users to navigate to the court with ease. The App also provides information on cases to be heard in the court and serves as a case tracker showing all the dates that the case came on. </p>
                            </div>
                        </div>
                    </Link>

                    <div className="flex flex-col gap-10 mt-10 lg:mt-0 pb-10 lg:pb-0">
                        <Link className="lg:h-full h-80" to="https://dennislawgh.com">
                            <div data-aos="fade-down" className="transition-transform duration-500 ease-in-out hover:scale-105 w-full h-full flex items-center justify-center px-2 border dark:border-white/10 border-black/20 rounded-2xl">
                                <img src={dl} alt="" />
                            </div>
                        </Link>

                        <Link to="https://dennislawgh.com">
                            <div data-aos="fade-up" className="transition-transform duration-500 ease-in-out hover:scale-105 w-full py-2 h-full flex items-center justify-center px-2 border dark:border-white/10 border-black/20 rounded-2xl">
                                <img src={mr} alt="" />
                            </div>
                        </Link>
                    </div>

                    <Link to="https://dennislawnews.com/" >
                        <div data-aos="fade-left" className="transition-transform duration-500 ease-in-out hover:scale-105 w-full h-[80vh] border dark:border-white/10 border-black/20 shadow-md rounded-2xl">
                            <img src={news} alt="" className="rounded-tr-2xl rounded-tl-2xl h-60" />
                            <div className="mt-10 px-4">
                                <p className="font-nunito  text-xl font-bold text-[#05ECF2]">Denis Law News</p>
                                <p className="font-nunito dark:text-white mt-4">Denis Law News is an online news platform that provides up-to-date coverage of legal, national, and international events. With a focus on accuracy, impartiality, and relevance,  insightful articles, and in-depth analysis across a wide range of topics including politics, business, leagl, sports, technology, and more. Denis Law News aims to keep its audience well-informed with timely updates and a commitment to journalistic excellence. Whether you're looking for the latest headlines or comprehensive features, Denis Law News is a trusted source for news and information. </p>
                            </div>
                        </div>
                    </Link>

                </div>
            </div>

            <div className="mt-40 overflow-hidden relative">
                <div data-aos="fade-right">
                    <p className="dark:text-white font-montserrat text-4xl font-bold">Client experiences that</p>
                    <p className="dark:text-white font-montserrat text-4xl font-bold">inspire confidence</p>
                </div>

                <div className="mt-20 flex items-center relative">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                    >
                        {testimonials.map((testimonial, index) => (
                            <div key={testimonial.id} data-aos="fade-left" className="min-w-full flex flex-col lg:flex-row gap-10">
                                <div className="pr-10 lg:w-2/3 " >
                                    <div className="flex gap-2">
                                        {/* {Array.from({ length: testimonial.stars }).map((_, i) => (
                                            <StarIco key={i} className="h-6 w-6 text-[#05ECF2]" />
                                        ))} */}
                                    </div>

                                    <p className="text-nunito text-2xl dark:text-white mt-10">{testimonial.text}</p>
                                    <p className="text-nunito text-xl dark:text-white mt-10">
                                        {testimonial.author} -{" "}
                                        <span className="text-sm">{testimonial.position}</span>
                                    </p>

                                    {/* Navigation Buttons */}
                                    <div className="flex gap-4 mt-10">
                                        <button
                                            className="bg-[#05ECF2] text-black px-4 py-2 rounded-md hover:bg-[#03c1c7]"
                                            onClick={handlePrev}
                                        >
                                            Previous
                                        </button>
                                        <button
                                            className="bg-[#05ECF2] text-black px-4 py-2 rounded-md hover:bg-[#03c1c7]"
                                            onClick={handleNext}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <img src={testimonial.image} alt="testimonial" className="rounded-lg w-[30vw] h-[60vh] transition-transform duration-500 ease-in-out hover:scale-105" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


            </div>



        </PublicLayout>
    );
}

export default About

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") as string;

    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");
    // if (!token) {
    //     return redirect("/")
    // }
    const { user, users, totalPages } = await usersController.FetchUsers({
        request,
        page,
        search_term
    });


    return json({ user, users, totalPages });
}
