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
import { Button, } from "@nextui-org/react";
// import EmailIcon from "~/components/Icons/icons/emailIcon";
// import StarIcon from "~/components/Icons/icons/starIcon";
import { useState } from "react";
import EmailIcon from "~/components/icons/EmailIcon";
import usersController from "~/controller/Users";
import { getSession } from "~/session";
import { LoaderFunction } from "@remix-run/node";
import { RegistrationInterface } from "~/interface/interface";
import { CardBody, CardContainer, CardItem } from "~/components/acternity/3d";
import { AnimatedTestimonials } from "~/components/acternity/carosel";

const About = () => {
    const {
        // user,
        users,
    } = useLoaderData<{
        // user: { _id: string },
        users: RegistrationInterface[],
    }>()
    const testimonial = [
        {
            quote:
                "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
            name: "Sarah Chen",
            designation: "Product Manager at TechFlow",
            src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            quote:
                "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
            name: "Michael Rodriguez",
            designation: "CTO at InnovateSphere",
            src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            quote:
                "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
            name: "Emily Watson",
            designation: "Operations Director at CloudScale",
            src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            quote:
                "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
            name: "James Kim",
            designation: "Engineering Lead at DataPro",
            src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            quote:
                "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
            name: "Lisa Thompson",
            designation: "VP of Technology at FutureNet",
            src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
            <div className="">
                <div data-aos="fade-down">
                    <div className="flex flex-col gap-4 mt-40 transition duration-500">
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

                <div style={{
                    backgroundImage: `url("https://cdn.prod.website-files.com/66614d9079739759bbd5e68e/668d0c2f28f1313d27252c3d_service-shape-bg-2.svg")`,
                    backgroundPosition: '100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '500px',
                    position: 'relative',
                }} className="lg:grid lg:grid-cols-2 mt-20 h-[60vh] lg:flex items-center gap-20">
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

                <div style={{
                    backgroundImage: `url("https://cdn.prod.website-files.com/66614d9079739759bbd5e68e/668d0c2f28f1313d27252c3d_service-shape-bg-2.svg")`,
                    backgroundPosition: '100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '500px',
                    position: 'relative',
                }} className="lg:grid lg:grid-cols-2 lg:flex items-center mt-40">
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

                <div style={{
                    backgroundImage: `url("https://cdn.prod.website-files.com/66614d9079739759bbd5e68e/668d0c2f28f1313d27252c3d_service-shape-bg-2.svg")`,
                    backgroundPosition: '100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '500px',
                    position: 'relative',
                }} className="lg:grid lg:grid-cols-2 mt-20 h-full lg:flex items-center gap-20">
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
                <div style={{
                    backgroundImage: `url("https://cdn.prod.website-files.com/66614d9079739759bbd5e68e/668d0c2f28f1313d27252c3d_service-shape-bg-2.svg")`,
                    backgroundPosition: '100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '500px',
                    position: 'relative',
                }} className="lg:grid lg:grid-cols-4 gap-10 lg:mt-40 ">
                    {users.slice(0, 4).map((member, index) => (
                        <div
                            data-aos="zoom-in"
                            key={index}
                            className={`w-full h-[50vh] rounded-2xl ${index === 1 || index === 3 ? 'mt-20' : 'mt-40 lg:mt-0'}`}
                        >
                            <div className="h-[50vh] overflow-hidden rounded-2xl relative group">
                                {/* Image */}
                                <img
                                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                                    src={member.image}
                                    alt={member.name}
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                                    {/* Name */}
                                    <p className="text-white font-nunito text-lg">{member.firstName + " " + member.middleName + " " + member.lastName}</p>
                                    <p className="text-white font-nunito text-lg">{member.phone}</p>
                                </div>
                        </div>
                    </div>
                ))}
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
                }} className="mt-60">
                    <div data-aos="fade-right" >
                        <p className="font-nunito dark:text-white text-2xl font-bold text-[#F2059F]">Why Choose us</p>
                        <p className="font-nunito dark:text-white text-4xl font-bold mt-8">Top-Notch Software Development and</p>
                        <p className="font-nunito dark:text-white text-4xl font-bold">
                            Digital Transformation
                        </p>
                    </div>
                    <div className="lg:grid lg:grid-cols-2 gap-10 mt-10">
                        <div>
                            <Link to="https://www.justicelocator.com/" >
                                <CardContainer className="inter-var">
                                    <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                                        <CardItem
                                            translateZ="50"
                                            className="text-xl font-bold text-neutral-600 dark:text-white"
                                        >
                                            Justice Locator
                                        </CardItem>
                                        <CardItem
                                            as="p"
                                            translateZ="60"
                                            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                                        >
                                            Hover over this card to unleash the power of CSS perspective
                                        </CardItem>
                                        <CardItem
                                            translateZ="100"
                                            rotateX={20}
                                            rotateZ={-10}
                                            className="w-full mt-4"
                                        >
                                            <img
                                                src={jl}
                                                className="h-80 w-full  rounded-xl group-hover/card:shadow-xl"
                                                alt="thumbnail"
                                            />
                                        </CardItem>

                                    </CardBody>
                                </CardContainer>
                            </Link>
                        </div>
                        <div>
                            <Link to="https://www.justicelocator.com/" >
                                <CardContainer className="inter-var">
                                    <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                                        <CardItem
                                            translateZ="50"
                                            className="text-xl font-bold text-neutral-600 dark:text-white"
                                        >
                                            Justice Locator
                                        </CardItem>
                                        <CardItem
                                            as="p"
                                            translateZ="60"
                                            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                                        >
                                            Hover over this card to unleash the power of CSS perspective
                                        </CardItem>
                                        <CardItem
                                            translateZ="100"
                                            rotateX={20}
                                            rotateZ={-10}
                                            className="w-full mt-4"
                                        >
                                            <img
                                                src={dl}
                                                className="h-80 w-full  rounded-xl group-hover/card:shadow-xl"
                                                alt="thumbnail"
                                            />
                                        </CardItem>

                                    </CardBody>
                                </CardContainer>
                            </Link>
                        </div>
                    </div>

                    <div className="lg:grid lg:grid-cols-2 gap-10 mt-10">
                        <div>
                            <Link to="https://www.justicelocator.com/" >
                                <CardContainer className="inter-var">
                                    <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                                        <CardItem
                                            translateZ="50"
                                            className="text-xl font-bold text-neutral-600 dark:text-white"
                                        >
                                            Justice Locator
                                        </CardItem>
                                        <CardItem
                                            as="p"
                                            translateZ="60"
                                            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                                        >
                                            Hover over this card to unleash the power of CSS perspective
                                        </CardItem>
                                        <CardItem
                                            translateZ="100"
                                            rotateX={20}
                                            rotateZ={-10}
                                            className="w-full mt-4"
                                        >
                                            <img
                                                src={mr}
                                                className="h-80 w-full  rounded-xl group-hover/card:shadow-xl"
                                                alt="thumbnail"
                                            />
                                        </CardItem>

                                    </CardBody>
                                </CardContainer>
                            </Link>
                        </div>
                        <div>
                            <Link to="https://www.justicelocator.com/" >
                                <CardContainer className="inter-var">
                                    <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                                        <CardItem
                                            translateZ="50"
                                            className="text-xl font-bold text-neutral-600 dark:text-white"
                                        >
                                            Justice Locator
                                        </CardItem>
                                        <CardItem
                                            as="p"
                                            translateZ="60"
                                            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                                        >
                                            Hover over this card to unleash the power of CSS perspective
                                        </CardItem>
                                        <CardItem
                                            translateZ="100"
                                            rotateX={20}
                                            rotateZ={-10}
                                            className="w-full mt-4 h-80"
                                        >
                                            <img
                                                src={news}
                                                className="h-60 w-full  rounded-xl group-hover/card:shadow-xl"
                                                alt="thumbnail"
                                            />
                                        </CardItem>

                                    </CardBody>
                                </CardContainer>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-40 overflow-hidden relative">
                    <div data-aos="fade-right">
                        <p className="dark:text-white font-montserrat text-4xl font-bold">Client experiences that</p>
                        <p className="dark:text-white font-montserrat text-4xl font-bold">inspire confidence</p>
                    </div>

                    <AnimatedTestimonials testimonials={testimonial} />
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
