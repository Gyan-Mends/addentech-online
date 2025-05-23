import { Badge, Button, Chip } from "@nextui-org/react"
import { Link, useLoaderData } from "@remix-run/react"
import { CardBody, CardContainer, CardItem } from "~/components/acternity/3d"
import { StatCard } from "~/components/card"
import CheckedIcon from "~/components/icons/CheckedIcon"
import { ProductCard } from "~/components/produt"
import { TeamMember } from "~/components/team"
import { TestimonialCard } from "~/components/testimonial"
import PublicLayout from "~/layout/PublicLayout"
import jl from "../components/images/JL.png"
import dl from "~/components/images/Dennislaw-Logo.svg"
import mr from "~/components/images/mr-logo.png"
import news from "~/components/images/DL-News-Logo.png"
import { json, LoaderFunction } from "@remix-run/node"
import usersController from "~/controller/Users"
import { RegistrationInterface } from "~/interface/interface"
import ScrollAnimation from "~/components/animation"
import { motion } from "framer-motion"
import { Twitter, Linkedin, Facebook, Instagram, ArrowRight, Sparkles } from "lucide-react"




const About = () => {
    const {
        users
    } = useLoaderData<{
        // user: { _id: string },
        users: RegistrationInterface[],
    }>()

    const fadeInUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    }
    const socialLinks = {
        twitter: Twitter,
        linkedin: Linkedin,
        facebook: Facebook,
        instagram: Instagram,
    }
    return (
        <PublicLayout>
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-10 md:py-28  lg:px-[125px]">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
                    <div className="container relative">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <ScrollAnimation>
                                <h1 className="text-4xl font-montserrat md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-6">
                                    <span className="text-pink-500">Transforming </span>The Legal Landscape With{" "}
                                    <span className="text-pink-500">
                                        Technology
                                    </span>
                                </h1>
                            </ScrollAnimation>
                            <ScrollAnimation delay={0.3}>
                                <p className="text-xl text-muted-foreground max-w-[800px] mx-auto font-nunito">
                                    Providing innovative legal tech solutions that streamline workflows, enhance client experiences, and
                                    revolutionize the practice of law.
                                </p>
                            </ScrollAnimation>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-gray-100 lg:px-[125px]">
                    <div className="container ">
                        <ScrollAnimation>
                            <div className="max-w-3xl mx-auto text-center mb-12">
                                <h2 className="text-2xl md:text-3xl">Learn More About Our Company Statistics</h2>
                            </div>
                        </ScrollAnimation>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
                            <StatCard value="21+" label="Projects Completed" icon="" />
                            <StatCard
                                value="5+"
                                label="Years Of Experience In Legal Tech Solutions"
                                icon=""
                            />
                            <StatCard value="96%" label="Happy Clients" icon="" />
                        </div>
                    </div>
                </section>

                {/* Vision Section */}
                <section className="py-16  lg:px-[125px]">
                    <div className="container">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <ScrollAnimation>
                                    <h2 className="text-3xl md:text-4xl font-bold font-montserrat" >To transform the legal landscape with innovation</h2>
                                </ScrollAnimation>
                                <ScrollAnimation delay={0.2}>
                                    <p className="text-muted-foreground font-nunito">
                                        We envision a future where legal services are more accessible, efficient, and effective through the
                                        strategic application of technology, creating a more just and equitable legal system for all.
                                    </p>
                                </ScrollAnimation>
                                <div className="space-y-4">
                                    {[
                                        "Revolutionizing legal practice with cutting-edge technology solutions",
                                        "Making legal services more accessible and affordable",
                                        "Empowering attorneys to focus on high-value work",
                                    ].map((item, i) => (
                                        <ScrollAnimation delay={0.3}>
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    <CheckedIcon className="h-5 w-5 text-pink-500" />
                                                </div>
                                                <p className="font-nunito">{item}</p>
                                            </div>
                                        </ScrollAnimation>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <ScrollAnimation>
                                    <div className="aspect-square rounded-2xl overflow-hidden  hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                                        <img
                                            src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                            alt="Legal innovation concept"
                                            width={600}
                                            height={600}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </ScrollAnimation>
                                <ScrollAnimation delay={0.2}>
                                    <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-2xl border border-black/20 bg-background/90 p-4 backdrop-blur hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                                        <div className="h-full w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center">
                                            <div className="text-white text-center">
                                                <div className="text-3xl font-bold">10x</div>
                                                <div className="text-xs">Efficiency Boost</div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollAnimation>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-16 bg-gray-100">
                    <div className="container">
                        <div className="max-w-3xl mx-auto text-center">
                            <ScrollAnimation>
                                <div className="bg-pink-500/10 text-pink-500 w-28 text-center rounded p-1 hover:bg-pink-500/20 mb-4 m-auto font-montserrat">Our Mission</div>
                                <h2 className="text-3xl md:text-4xl font-semibold mb-6 font-montserrat">
                                    To provide our customers with quality legal technology services and develope excellents at a fair and competitive price                                </h2>
                            </ScrollAnimation>
                            

                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-20 relative overflow-hidden lg:px-[125px] px-4">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full filter blur-3xl animate-blob"></div>
                        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-fuchsia-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="container relative z-10">
                        <motion.div
                            className="grid md:grid-cols-2 gap-12 items-center"
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUpVariants}
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <ScrollAnimation>
                                    <div className="aspect-[3/4]  overflow-hidden rounded-lg shadow-xl  transform transition-transform duration-500  hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                                        <img
                                            src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                            alt="Team member"
                                            width={300}
                                            height={400}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </ScrollAnimation>
                                <ScrollAnimation delay={0.3}>
                                    <div className="aspect-[3/4] overflow-hidden rounded-lg mt-8 shadow-xl   transform transition-transform duration-500  hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                                        <img
                                            src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                            alt="Team member"
                                            width={300}
                                            height={400}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </ScrollAnimation>
                            </div>
                            <ScrollAnimation>
                                <div className="space-y-6">
                                   
                                    <h2 className="text-3xl md:text-4xl font-bold font-montserrat ">
                                        Meet Our Dedicated Experts Behind Addentech Success
                                    </h2>
                                    <p className=" text-lg leading-relaxed font-nunito">
                                        Our team combines deep legal knowledge with technical expertise to create solutions that truly address
                                        the needs of modern legal practice.
                                    </p>
                                </div>
                            </ScrollAnimation>
                        </motion.div>

                        <motion.div
                            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1,
                                        delayChildren: 0.3,
                                    },
                                },
                            }}
                        >
                            {users.map((member, i) => (
                                <ScrollAnimation>
                                    <motion.div key={member._id} variants={fadeInUpVariants}>
                                        <Link
                                            to={`/team/${member._id}`}
                                            className="block h-full transition-transform duration-300 hover:translate-y-[-8px]"
                                        >
                                            <EnhancedTeamMember
                                                name={member.firstName + " " + member.middleName + " " + member.lastName}
                                                role={member.position}
                                                img={member.image}
                                                socials={[
                                                    { platform: "linkedin", url: "https://linkedin.com/in/johndoe" },
                                                    { platform: "twitter", url: "https://twitter.com/johndoe" },
                                                    { platform: "mail", url: "mailto:john.doe@example.com" },
                                                ]}
                                            />
                                        </Link>
                                    </motion.div>
                                </ScrollAnimation>
                            ))}
                        </motion.div>

                        <motion.div
                            className="mt-16 text-center"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        delay: 0.6,
                                        duration: 0.6,
                                    },
                                },
                            }}
                        >
                            <Link
                                to="/careers"
                                className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-medium transition-colors duration-300"
                            >
                                <span>Join Our Team</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* About Us Section */}
                <section className="py-16 bg-gray-100 lg:px-[125px]">
                    <div className="container">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6 font-nunito">
                                <ScrollAnimation>
                                    <h2 className="text-3xl md:text-4xl font-bold">Know More About Us</h2>
                                </ScrollAnimation>
                                <ScrollAnimation delay={0.2}>
                                    <p className="text-muted-foreground">
                                        DennisLaw is a pioneering legal technology company founded in 2018 with a mission to transform how
                                        legal services are delivered. Our team combines decades of legal expertise with cutting-edge technical
                                        knowledge to create solutions that address the unique challenges faced by modern law firms.
                                    </p>
                                </ScrollAnimation>
                                <ScrollAnimation delay={0.3}>
                                    <p className="text-muted-foreground">
                                        We believe that technology should enhance, not replace, the human elements of legal practice. Our
                                        solutions are designed to handle routine tasks and data management, freeing attorneys to focus on the
                                        strategic, creative, and interpersonal aspects of their work where they add the most value.
                                    </p>
                                </ScrollAnimation>
                               
                            </div>
                            <div className="relative">
                                <ScrollAnimation>
                                    <div className="aspect-video rounded-lg overflow-hidden hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                                        <img
                                            src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                            alt="Our company"
                                            width={600}
                                            height={400}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </ScrollAnimation>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <ProductCard className="lg:py-20 bg-white py-10 shadow-t-gray-100 lg:px-[35px] px-4" />

              
            </main>
        </PublicLayout>
    )
}
function EnhancedTeamMember({ name, role, img, socials }: { name: string; role: string; img: string; socials: { platform: string; url: string }[] }) {
    return (
        <div className="border border-white/10  overflow-hidden group hover:border-pink-500/30 transition-all duration-300 h-full rounded-lg shadow-lg">
            <div className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-pink-500 to-fuchsia-600 group-hover:w-full transition-all duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="aspect-[3/4] overflow-hidden">
                <img
                    src={img || "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            <div className="p-6">
                <h3 className="text-xl font-semibold mb-1   transition-colors duration-300">
                    {name}
                </h3>
                <p className=" mb-4">{role}</p>

                <div className="flex gap-3">
                    {socials.map((social, index) => {
                        const SocialIcon =
                            social.platform === "twitter"
                                ? Twitter
                                : social.platform === "linkedin"
                                    ? Linkedin
                                    : social.platform === "facebook"
                                        ? Facebook
                                        : Instagram

                        return (
                            <a
                                key={index}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center   transition-all duration-300"
                            >
                                <SocialIcon className="h-4 w-4 text-pink-500" />
                            </a>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}



export default About

export const loader: LoaderFunction = async ({ request }) => {
    const { user, users, totalPages } = await usersController.FetchUsers({
        request,
        limit: 3,

    });

    return json({ user, users, totalPages });
}