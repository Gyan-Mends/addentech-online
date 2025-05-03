import { Badge, Button } from "@nextui-org/react"
import { Link } from "@remix-run/react"
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


const About = () => {
    return (
        <PublicLayout>
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-br from-black to-gray-900 lg:px-[125px]">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
                    <div className="container relative">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <h1 className="text-4xl font-montserrat md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-6">
                                Transforming The Legal Landscape With{" "}
                                <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                                    Technology
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-[800px] mx-auto font-nunito">
                                Providing innovative legal tech solutions that streamline workflows, enhance client experiences, and
                                revolutionize the practice of law.
                        </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white font-montserrat">
                                    Get Started
                                    {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
                                </Button>
                                <Button className="font-montserrat">Learn More</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="aspect-[4/3] overflow-hidden rounded-lg">
                                <img
                                    src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                    alt="Legal technology workspace"
                                    width={600}
                                    height={400}
                                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="aspect-[4/3] overflow-hidden rounded-lg">
                                <img
                                    src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                    alt="Legal team collaboration"
                                    width={600}
                                    height={400}
                                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="aspect-[4/3] overflow-hidden rounded-lg">
                                <img
                                    src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                    alt="Legal professionals with technology"
                                    width={600}
                                    height={400}
                                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-black lg:px-[125px]">
                    <div className="container ">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-montserrat">Learn More About Our Company Statistics</h2>
                            <p className="text-muted-foreground font-nunito">
                                Our track record speaks for itself. We've helped numerous law firms transform their practice with
                                cutting-edge technology.
                            </p>
                        </div>

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
                <section className="py-16 bg-gradient-to-br from-black to-gray-900 lg:px-[125px]">
                    <div className="container">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="bg-blue-500/10 w-28 m-auto text-center p-1 rounded text-blue-500 hover:bg-blue-500/20 font-montserrat">Our Vision</div>
                                <h2 className="text-3xl md:text-4xl font-bold font-montserrat">To transform the legal landscape with innovation</h2>
                                <p className="text-muted-foreground font-nunito">
                                    We envision a future where legal services are more accessible, efficient, and effective through the
                                    strategic application of technology, creating a more just and equitable legal system for all.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        "Revolutionizing legal practice with cutting-edge technology solutions",
                                        "Making legal services more accessible and affordable",
                                        "Empowering attorneys to focus on high-value work",
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <CheckedIcon className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <p className="font-nunito">{item}</p>
                                        </div>
                                    ))}
                                </div>
                        </div>
                            <div className="relative">
                                <div className="aspect-square rounded-2xl overflow-hidden">
                                    <img
                                        src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                        alt="Legal innovation concept"
                                        width={600}
                                        height={600}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-2xl border border-blue-900/40 bg-background/90 p-4 backdrop-blur">
                                    <div className="h-full w-full rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                                        <div className="text-white text-center">
                                            <div className="text-3xl font-bold">10x</div>
                                            <div className="text-xs">Efficiency Boost</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-16 bg-black">
                    <div className="container">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="bg-blue-500/10 text-blue-500 w-28 text-center rounded p-1 hover:bg-blue-500/20 mb-4 m-auto font-montserrat">Our Mission</div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-montserrat">
                                Delivering innovative solutions that empower legal professionals to excel in a digital world
                            </h2>
                            <p className="text-muted-foreground mb-8 font-nunito">
                                We are committed to developing cutting-edge technology that addresses the unique challenges faced by
                                legal professionals, enabling them to serve their clients more effectively.
                        </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/service">
                                    <Button className="bg-blue-500 hover:bg-blue-600 text-white font-montserrat" >Our Services</Button>

                                </Link>
                                <Link to="/contact">
                                    <Button className="border-blue-500/50 hover:border-blue-500 text-blue-500 font-montserrat">
                                        Contact Us
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-16 bg-gradient-to-br from-black to-gray-900 lg:px-[125px]">
                    <div className="container">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="aspect-[3/4] overflow-hidden rounded-lg">
                                    <img
                                        src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                        alt="Team member"
                                        width={300}
                                        height={400}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="aspect-[3/4] overflow-hidden rounded-lg mt-8">
                                    <img
                                        src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                        alt="Team member"
                                        width={300}
                                        height={400}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-blue-500/10 text-blue-500 w-28 p-1 font-monstserrat m-auto text-center rounded hover:bg-blue-500/20">Our Team</div>
                                <h2 className="text-3xl md:text-4xl font-bold font-montserrat">Meet Our Dedicated Experts Behind Addentech Success</h2>
                                <p className="text-muted-foreground font-nunito">
                                    Our team combines deep legal knowledge with technical expertise to create solutions that truly address
                                    the needs of modern legal practice.
                                </p>
                                <Link to="team">
                                    <Button className="bg-blue-500 hover:bg-blue-600 text-white font-montserrat">
                                        Meet The Team
                                        {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    name: "Sarah Johnson",
                                    role: "Chief Legal Technology Officer",
                                    img: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                },
                                {
                                    name: "Michael Chen",
                                    role: "Head of Software Development",
                                    img: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
                                },
                                {
                                    name: "Aisha Patel",
                                    role: "Legal AI Specialist",
                                    img: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
                                },
                            ].map((member, i) => (
                                <TeamMember key={i} name={member.name} role={member.role} img={member.img} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Us Section */}
                <section className="py-16 bg-black lg:px-[125px]">
                    <div className="container">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6 font-nunito">
                                <div className="bg-blue-500/10 text-blue-500 m-auto p-1 text-center rounded w-28 hover:bg-blue-500/20">About Us</div>
                                <h2 className="text-3xl md:text-4xl font-bold">Know More About Us</h2>
                                <p className="text-muted-foreground">
                                    DennisLaw is a pioneering legal technology company founded in 2018 with a mission to transform how
                                    legal services are delivered. Our team combines decades of legal expertise with cutting-edge technical
                                    knowledge to create solutions that address the unique challenges faced by modern law firms.
                                </p>
                                <p className="text-muted-foreground">
                                    We believe that technology should enhance, not replace, the human elements of legal practice. Our
                                    solutions are designed to handle routine tasks and data management, freeing attorneys to focus on the
                                    strategic, creative, and interpersonal aspects of their work where they add the most value.
                                </p>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                    Learn More
                                    {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
                                </Button>
                            </div>
                            <div className="relative">
                                <div className="aspect-video rounded-lg overflow-hidden">
                                    <img
                                        src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                        alt="Our company"
                                        width={600}
                                        height={400}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="py-16 bg-gradient-to-br from-black to-gray-900">
                    <div className="container">
                        <div className="max-w-3xl  mx-auto text-center mb-12">
                            <div className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 mb-4 w-40 p-1 m-auto text-center rounded font-montserrat  text-center">Why Choose Us</div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Top-Notch Software Development and Digital Transformation
                            </h2>
                            <p className="text-muted-foreground">
                                We combine legal expertise with technical excellence to deliver solutions that truly address the needs
                                of modern legal practice.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-20">
                            {[
                                {
                                    title: "Justice Locator",
                                    description: "Legal advice on the go",
                                    image: jl,
                                    type: "mobile",
                                },
                                {
                                    title: "DennisLaw",
                                    description: "AI-powered legal assistant",
                                    image: dl,
                                    type: "brand",
                                },
                                {
                                    title: "MarryRight",
                                    description: "Family law simplified",
                                    image: mr,
                                    type: "app",
                                },
                                {
                                    title: "Legal News",
                                    description: "Stay updated on legal trends",
                                    image: news,
                                    type: "news",
                                },
                            ].map((product, i) => (
                                < CardContainer
                                    key={i}
                                    className="inter-var group overflow-hidden border-500/40  backdrop-blur transition-all hover:border-border hover:bg-background/80 "
                                >
                                    <CardBody className=" relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-20 sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                                        <CardItem translateZ="50"
                                            className="text-xl  text-neutral-600 dark:text-white">
                                            <p className="text-md font-nunito font-bold">{product.title}</p>
                                            <p className="text-sm font-nunito">{product.description}</p>
                                        </CardItem>

                                        <div className="mt-2 mb-10 aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        </div>

                                        <Button
                                            variant="flat"
                                            size="sm"
                                            className="w-full group-hover:bg-pink-500/10 group-hover:text-pink-500 font-montserrat"
                                        >
                                            Explore Product
                                            {/* <ChevronRight className="ml-2 h-4 w-4" /> */}
                                        </Button>
                                    </CardBody>

                                </CardContainer>

                            ))}
                        </div>

                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-16 bg-black lg:px-[125px] font-nunito">
                    <div className="container">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <div className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 mb-4 w-40 p-1 m-auto text-center rounded font-montserrat  text-center">Testimonials</div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">Client experiences that inspire confidence</h2>
                            <p className="text-muted-foreground">
                                Hear what our clients have to say about their experience working with us.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <TestimonialCard
                                quote="Our visibility and performance have been dramatically improved by the innovative solutions from the DennisLaw team."
                                author="Lisa Thompson"
                                role="Managing Partner, Thompson Legal"
                                img="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                            />
                        </div>

                        <div className="flex justify-center mt-8">
                            <div className="flex gap-2">
                                {[0, 1, 2].map((i) => (
                                    <button
                                        key={i}
                                        className={`h-2 rounded-full ${i === 0 ? "w-8 bg-blue-500" : "w-2 bg-gray-600"}`}
                                        aria-label={`Go to slide ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    )
}

export default About