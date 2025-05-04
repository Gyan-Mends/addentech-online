"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Chip,
    Tabs,
    Tab,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
} from "@nextui-org/react"
import { Link } from "@remix-run/react"
import CheckedIcon from "~/components/icons/CheckedIcon"
import { ChevronDownIcon } from "~/components/icons/ArrowDown"
import PublicLayout from "~/layout/PublicLayout"
import {
    ArrowRight,
    CheckCircle,
    Code,
    Layers,
    BarChart3,
    Cloud,
    Palette,
    ChevronRight,
    MapPin,
    Phone,
    Mail,
    Star,
    ChevronRightIcon,
    ChevronLeftIcon,
} from "lucide-react"

export default function ServicesPage() {
    const [activeTab, setActiveTab] = useState("all")
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isVisible, setIsVisible] = useState({
        hero: false,
        services: false,
        methodology: false,
        benefits: false,
        testimonials: false,
        comparison: false,
        caseStudies: false,
        faq: false,
    })

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 0.1,
        }

        const sectionRefs = {
            hero: document.getElementById("hero-section"),
            services: document.getElementById("services-section"),
            methodology: document.getElementById("methodology-section"),
            benefits: document.getElementById("benefits-section"),
            testimonials: document.getElementById("testimonials-section"),
            comparison: document.getElementById("comparison-section"),
            caseStudies: document.getElementById("case-studies-section"),
            faq: document.getElementById("faq-section"),
        }

        const observers = {}

        Object.entries(sectionRefs).forEach(([key, ref]) => {
            if (ref) {
                observers[key] = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setIsVisible((prev) => ({ ...prev, [key]: true }))
                        }
                    })
                }, observerOptions)

                observers[key].observe(ref)
            }
        })

        return () => {
            Object.values(observers).forEach((observer) => {
                observer.disconnect()
            })
        }
    }, [])

    const services = [
        {
            id: "digital-marketing",
            category: "marketing",
            title: "Digital Marketing & Consultation",
            description:
                "Maximize digital presence with expert SEO, social media strategies, email campaigns, and performance analytics. We help you reach and engage your audience.",
            icon: <BarChart3 className="h-10 w-10 text-blue-500" />,
            features: [
                "Search Engine Optimization (SEO)",
                "Social Media Marketing",
                "Email Marketing Campaigns",
                "Content Strategy & Creation",
                "Performance Analytics & Reporting",
            ],
            benefits: ["Increased online visibility", "Higher conversion rates", "Better ROI on marketing spend"],
        },
        {
            id: "design-development",
            category: "development",
            title: "Design & Development",
            description:
                "Innovative website design and development tailored to your business needs. We create intuitive and visually appealing sites that drive results.",
            icon: <Code className="h-10 w-10 text-blue-500" />,
            features: [
                "Responsive Website Design",
                "Custom Web Applications",
                "E-commerce Solutions",
                "UI/UX Design",
                "Mobile App Development",
            ],
            benefits: ["Improved user experience", "Faster loading times", "Cross-platform compatibility"],
        },
        {
            id: "it-services",
            category: "it",
            title: "IT Services",
            description:
                "Support and management of IT systems, including business software, networks, and security. We ensure your technology infrastructure is robust and efficient.",
            icon: <Layers className="h-10 w-10 text-blue-500" />,
            features: [
                "IT Infrastructure Management",
                "Network Security Solutions",
                "Business Software Implementation",
                "Technical Support & Maintenance",
                "Data Backup & Recovery",
            ],
            benefits: ["Reduced downtime", "Enhanced security", "Optimized IT costs"],
        },
        {
            id: "brand-design",
            category: "design",
            title: "Brand & Product Design",
            description:
                "Creating strong brand identities through thoughtful design of logos, packaging, and overall brand aesthetics. We help your brand connect with customers.",
            icon: <Palette className="h-10 w-10 text-blue-500" />,
            features: [
                "Logo & Identity Design",
                "Brand Strategy Development",
                "Packaging Design",
                "Marketing Materials",
                "Brand Guidelines Creation",
            ],
            benefits: ["Consistent brand identity", "Increased brand recognition", "Stronger customer loyalty"],
        },
        {
            id: "cloud-services",
            category: "it",
            title: "Cloud Services",
            description:
                "Robust cloud services providing scalable computing resources and secure data storage solutions. We enable flexibility and efficiency in your operations.",
            icon: <Cloud className="h-10 w-10 text-blue-500" />,
            features: [
                "Cloud Migration & Strategy",
                "Infrastructure as a Service (IaaS)",
                "Platform as a Service (PaaS)",
                "Software as a Service (SaaS)",
                "Cloud Security & Compliance",
            ],
            benefits: ["Scalable resources", "Reduced infrastructure costs", "Improved accessibility"],
        },
    ]

    const testimonials = [
        {
            quote:
                "DennisLaw transformed our digital presence completely. Their strategic approach to our website redesign and digital marketing efforts resulted in a 200% increase in qualified leads within just three months.",
            author: "Sarah Johnson",
            role: "Marketing Director, TechSolutions Inc.",
            rating: 5,
            image: "/placeholder.svg?height=100&width=100",
        },
        {
            quote:
                "The cloud migration services provided by DennisLaw were exceptional. Their team managed the entire process seamlessly, with zero downtime, and we've seen a 40% reduction in our IT infrastructure costs.",
            author: "Michael Chen",
            role: "CTO, FinanceHub",
            rating: 5,
            image: "/placeholder.svg?height=100&width=100",
        },
        {
            quote:
                "Working with DennisLaw on our brand redesign was a game-changer. Their creative team captured our vision perfectly and delivered a cohesive brand identity that has significantly improved our market recognition.",
            author: "Emily Rodriguez",
            role: "CEO, Innovate Retail",
            rating: 5,
            image: "/placeholder.svg?height=100&width=100",
        },
    ]

    const filteredServices = activeTab === "all" ? services : services.filter((service) => service.category === activeTab)

    const fadeInUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    }


    const [activeTestimonial, setActiveTestimonial] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        if (isPaused) return

        const interval = setInterval(() => {
            setActiveTestimonial((current) => (current + 1) % testimonials.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [testimonials.length, isPaused])

    const goToPrevious = () => {
        setActiveTestimonial((current) => (current - 1 + testimonials.length) % testimonials.length)
        setIsPaused(true)
        setTimeout(() => setIsPaused(false), 10000)
    }

    const goToNext = () => {
        setActiveTestimonial((current) => (current + 1) % testimonials.length)
        setIsPaused(true)
        setTimeout(() => setIsPaused(false), 10000)
    }

    const goToSlide = (index) => {
        setActiveTestimonial(index)
        setIsPaused(true)
        setTimeout(() => setIsPaused(false), 10000)
    }

    return (


        <PublicLayout >
            {/* Hero Section */}
            <section
                id="hero-section"
                className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-br from-black to-gray-900"
            >
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div
                        className="max-w-3xl mx-auto"
                        initial="hidden"
                        animate={isVisible.hero ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                    >
                        <Chip className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/20 font-nunito text-lg p-2" variant="bordered" size="sm">
                            Our Services
                        </Chip>
                        <h1 className="text-4xl md:text-5xl font-montserrat lg:text-6xl font-bold leading-tight tracking-tighter mb-6">
                            Here is How We Can{" "}
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                                Help Your Business
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-[800px] font-nunito">Comprehensive Services Tailored to Your Needs</p>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <Link to="/contact">
                                <Button variant="bordered" className="border-blue-500/50 font-nunito hover:border-blue-500 text-blue-500">
                                    Contact Us{<ArrowRight className="h-4 w-4" />}
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
            </section>

            {/* Services Grid Section */}
            <section id="services-section" className="py-16 bg-black lg:px-[90px]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-3xl mx-auto text-center mb-12"
                        initial="hidden"
                        animate={isVisible.services ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 font-montserrat">Our Professional Services</h2>
                        <p className="text-gray-400 mb-8 font-nunito">
                            We offer a comprehensive range of services to help your business thrive in the digital age.
                        </p>
                        <Tabs
                            aria-label="Service categories"
                            selectedKey={activeTab}
                            onSelectionChange={setActiveTab}
                            className="justify-center font-nunito bg-gradient-to-br from-blue-900/20 to-blue-900/5 px-4 rounded"
                            variant="underlined"
                            color="primary"
                        >
                            <Tab key="all" title="All" />
                            <Tab key="marketing" title="Marketing" />
                            <Tab key="development" title="Development" />
                            <Tab key="it" title="IT" />
                            <Tab key="design" title="Design" />
                            <Tab key="custom" title="Custom" />
                        </Tabs>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial="hidden"
                                animate={isVisible.services ? "visible" : "hidden"}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 0.6, delay: index * 0.1 },
                                    },
                                }}
                            >
                                <ServiceCard service={service} />
                            </motion.div>
                        ))}

                        {activeTab === "all" && (
                            <motion.div
                                initial="hidden"
                                animate={isVisible.services ? "visible" : "hidden"}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 0.6, delay: filteredServices.length * 0.1 },
                                    },
                                }}
                            >
                                <Card className="border border-blue-900/40 bg-gradient-to-br from-blue-900/20 to-blue-900/5 h-full">
                                    <CardBody className="flex items-center justify-center text-center p-6">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">Need a Custom Solution?</h3>
                                            <p className="text-gray-400 mb-4">Contact us to discuss your specific requirements</p>
                                            <Link to="/contact">
                                                <Button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                                    endContent=""
                                                >
                                                    Get in Touch
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>

            {/* Service Details Section */}
            <section className="py-16 bg-gradient-to-br from-black to-gray-900 relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div
                        className="max-w-3xl mx-auto text-center mb-12"
                        initial="hidden"
                        animate={isVisible.benefits ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                    >
                        <Chip className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/20" variant="bordered" size="sm">
                            Service Spotlight
                        </Chip>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Digital Marketing Excellence</h2>
                        <p className="text-gray-400">
                            Our digital marketing services are designed to increase your online visibility and drive measurable
                            results for your business.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            className="relative"
                            initial="hidden"
                            animate={isVisible.benefits ? "visible" : "hidden"}
                            variants={{
                                hidden: { opacity: 0, scale: 0.9 },
                                visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
                            }}
                        >
                            <div className="aspect-video rounded-2xl overflow-hidden">
                                <img
                                    src="/placeholder.svg?height=400&width=600"
                                    alt="Digital marketing dashboard"
                                    width={600}
                                    height={400}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <motion.div
                                className="absolute -bottom-6 -right-6 h-32 w-32 rounded-2xl border border-blue-900/40 bg-black/90 p-4 backdrop-blur"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isVisible.benefits ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <div className="h-full w-full rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <div className="text-3xl font-bold">3x</div>
                                        <div className="text-xs">ROI Average</div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="space-y-6"
                            initial="hidden"
                            animate={isVisible.benefits ? "visible" : "hidden"}
                            variants={fadeInUpVariants}
                        >
                            <h3 className="text-2xl font-bold">Comprehensive Digital Marketing Solutions</h3>
                            <p className="text-gray-400">
                                Our data-driven approach to digital marketing ensures that every dollar you spend is optimized for
                                maximum return on investment.
                            </p>
                            <div className="space-y-4">
                                {[
                                    {
                                        text: "Search Engine Optimization to improve organic rankings",
                                        icon: <CheckedIcon className="h-5 w-5 text-blue-500" />,
                                    },
                                    {
                                        text: "Pay-Per-Click advertising with conversion tracking",
                                        icon: <CheckedIcon className="h-5 w-5 text-blue-500" />,
                                    },
                                    {
                                        text: "Social Media Marketing across all major platforms",
                                        icon: <CheckedIcon className="h-5 w-5 text-blue-500" />,
                                    },
                                    {
                                        text: "Email Marketing campaigns with A/B testing",
                                        icon: <CheckedIcon className="h-5 w-5 text-blue-500" />,
                                    },
                                    {
                                        text: "Content Marketing strategy and implementation",
                                        icon: <CheckedIcon className="h-5 w-5 text-blue-500" />,
                                    },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-start gap-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={isVisible.benefits ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4, delay: i * 0.1 }}
                                    >
                                        <div className="mt-1">{item.icon}</div>
                                        <p>{item.text}</p>
                                    </motion.div>
                                ))}
                            </div>
                            <Button
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                endContent={<CheckedIcon className="h-4 w-4" />}
                            >
                                Learn More About Digital Marketing
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Methodology Section */}
            <section id="methodology-section" className="py-16 bg-black relative overflow-hidden lg:px-[90px]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div
                        className="max-w-3xl mx-auto text-center mb-16"
                        initial="hidden"
                        animate={isVisible.methodology ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                    >
                        <Chip className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/20 font-montserrat" variant="bordered" size="sm">
                            Our Process
                        </Chip>
                        <h2 className="text-3xl md:text-3xl font-bold mb-6 font-montserrat">Our Methodology Guarantees Your Success</h2>
                        <p className="text-gray-400 font-nunito">
                            We follow a proven methodology to ensure your project is delivered on time, within budget, and exceeds
                            your expectations.
                        </p>
                    </motion.div>

                    {/* Wave Visualization */}
                    <motion.div
                        className="relative h-32 mb-12"
                        initial={{ opacity: 0 }}
                        animate={isVisible.methodology ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="absolute inset-0">
                            <svg viewBox="0 0 1200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <path
                                    d="M0,100 C150,180 350,0 500,100 C650,200 750,0 900,100 C1050,200 1150,0 1200,100 V200 H0 V100Z"
                                    className="fill-blue-500/10"
                                />
                                <motion.path
                                    d="M0,100 C150,180 350,0 500,100 C650,200 750,0 900,100 C1050,200 1150,0 1200,100"
                                    className="stroke-blue-500 stroke-2 fill-none"
                                    initial={{ pathLength: 0 }}
                                    animate={isVisible.methodology ? { pathLength: 1 } : { pathLength: 0 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                            </svg>
                        </div>
                    </motion.div>

                    {/* Process Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {[
                            {
                                number: "01",
                                title: "Discover",
                                description:
                                    "We begin by understanding your needs, goals, and target audience through market research and competitor analysis. This helps us gather precise requirements to define the project scope effectively.",
                            },
                            {
                                number: "02",
                                title: "Planning",
                                description:
                                    "A detailed project plan is crafted, outlining tasks, timelines, resources, and milestones to ensure a clear roadmap for successful project execution.",
                            },
                            {
                                number: "03",
                                title: "Design & Development",
                                description:
                                    "Our team creates visual elements while developers build the functionality. This stage brings your vision to life with user-friendly solutions.",
                            },
                            {
                                number: "04",
                                title: "Testing",
                                description:
                                    "Once the development phase is complete, rigorous testing is conducted to ensure the product or service functions as intended and meets quality standards.",
                            },
                            {
                                number: "05",
                                title: "Project Delivery",
                                description:
                                    "Upon successful testing and any necessary revisions, the final product or service is delivered to you. This may include launching a website, or implementing a marketing campaign.",
                            },
                        ].map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial="hidden"
                                animate={isVisible.methodology ? "visible" : "hidden"}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 0.6, delay: index * 0.1 },
                                    },
                                }}
                            >
                                <ProcessStep step={step} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials-section" className="py-16 bg-gradient-to-br from-black to-gray-900 lg:px-[75px]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-3xl mx-auto text-center mb-12"
                        initial="hidden"
                        animate={isVisible.testimonials ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                    >
                        <Chip className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/20 font-nunito" variant="bordered" size="sm">
                            Client Testimonials
                        </Chip>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 font-nunito">What Our Clients Say About Our Services</h2>
                        <p className="text-gray-400 font-montserrat">
                            Don't just take our word for it. Here's what our clients have to say about working with us.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate={isVisible.testimonials ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                        className="relative"
                    >
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
                            >
                                {testimonials.map((testimonial, index) => (
                                    <div key={index} className="w-full flex-shrink-0 px-4">
                                        <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black h-full">
                                            <CardBody className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                                                        <img
                                                            src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                                                            alt={testimonial.author}
                                                            width={100}
                                                            height={100}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 font-nunito">
                                                        <div className="flex mb-2">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                ""
                                                            ))}
                                                        </div>
                                                        <p className="text-lg italic mb-4">"{testimonial.quote}"</p>
                                                        <div>
                                                            <p className="font-medium">{testimonial.author}</p>
                                                            <p className="text-sm text-gray-400">{testimonial.role}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center mt-8">
                            <div className="flex gap-2">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`h-2 rounded-full transition-all ${index === activeTestimonial ? "w-8 bg-blue-500" : "w-2 bg-gray-600"
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button
                            isIconOnly
                            variant="bordered"
                            className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 border-blue-900/40 hover:bg-black/70 hover:border-blue-500/50 hidden md:flex"
                            onClick={goToPrevious}
                            aria-label="Previous testimonial"
                        >
                            <ChevronRightIcon className="h-4 w-4 rotate-180" />
                        </Button>

                        <Button
                            isIconOnly
                            variant="bordered"
                            className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 border-blue-900/40 hover:bg-black/70 hover:border-blue-500/50 hidden md:flex"
                            onClick={goToNext}
                            aria-label="Next testimonial"
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </motion.div>
                    </div>
            </section>

            {/* Case Studies Preview */}
            <section id="case-studies-section" className="py-16 bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-3xl mx-auto text-center mb-12"
                        initial="hidden"
                        animate={isVisible.caseStudies ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                    >
                        <Chip className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/20" variant="bordered" size="sm">
                            Success Stories
                        </Chip>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">See Our Services in Action</h2>
                        <p className="text-gray-400">
                            Explore how our services have helped businesses like yours achieve their goals and drive growth.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "E-commerce Transformation",
                                category: "Digital Marketing & Development",
                                image: "/placeholder.svg?height=400&width=600",
                                result: "250% increase in online sales",
                                client: "Fashion Retailer",
                            },
                            {
                                title: "Financial Services Rebrand",
                                category: "Brand & Product Design",
                                image: "/placeholder.svg?height=400&width=600",
                                result: "35% increase in brand recognition",
                                client: "Investment Firm",
                            },
                            {
                                title: "Healthcare IT Infrastructure",
                                category: "IT Services & Cloud Solutions",
                                image: "/placeholder.svg?height=400&width=600",
                                result: "99.9% system uptime achieved",
                                client: "Medical Center",
                            },
                        ].map((study, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                animate={isVisible.caseStudies ? "visible" : "hidden"}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 0.6, delay: index * 0.1 },
                                    },
                                }}
                            >
                                <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden group hover:border-blue-500/50 transition-all">
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={study.image || "/placeholder.svg"}
                                            alt={study.title}
                                            width={600}
                                            height={400}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <CardHeader className="pb-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm text-blue-500">{study.category}</div>
                                            <Chip size="sm" variant="bordered" className="text-xs border-blue-500/20">
                                                {study.client}
                                            </Chip>
                                        </div>
                                        <h3 className="text-xl font-semibold group-hover:text-blue-500 transition-colors">
                                            {study.title}
                                        </h3>
                                    </CardHeader>
                                    <CardFooter className="pb-4">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="text-sm text-gray-400">
                                                Result: <span className="text-white">{study.result}</span>
                                            </div>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="group-hover:text-blue-500"
                                                endContent={<ChevronDownIcon className="h-4 w-4" />}
                                            >
                                                View Case Study
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="mt-8 text-center"
                        initial="hidden"
                        animate={isVisible.caseStudies ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                    >
                        <Button
                            variant="bordered"
                            className="border-blue-500/50 hover:border-blue-500 text-blue-500"
                            endContent=""
                        >
                            View All Case Studies
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq-section" className="py-16 bg-gradient-to-br from-black to-gray-900 font-nunito">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-3xl mx-auto text-center mb-12"
                        initial="hidden"
                        animate={isVisible.faq ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                    >
                        <Chip className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/20" variant="bordered" size="sm">
                            FAQ
                        </Chip>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">Frequently Asked Questions</h2>
                        <p className="text-gray-400">
                            Find answers to common questions about our services and how we can help your business.
                        </p>
                    </motion.div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            {
                                question: "What industries do you specialize in?",
                                answer:
                                    "We have experience working with clients across various industries including legal, healthcare, finance, e-commerce, education, and technology. Our team adapts our approach to meet the specific needs of each industry.",
                            },
                            {
                                question: "How long does a typical project take to complete?",
                                answer:
                                    "Project timelines vary depending on scope and complexity. A simple website might take 4-6 weeks, while a comprehensive digital transformation project could take several months. We provide detailed timelines during our planning phase.",
                            },
                            {
                                question: "Do you offer ongoing support after project completion?",
                                answer:
                                    "Yes, we offer various support and maintenance packages to ensure your solution continues to perform optimally. These can include regular updates, performance monitoring, security patches, and technical support.",
                            },
                            {
                                question: "How do you handle project pricing?",
                                answer:
                                    "We offer transparent pricing based on project requirements. Depending on the nature of the work, we may use fixed-price quotes, hourly rates, or retainer models. We provide detailed proposals so you know exactly what you're paying for.",
                            },
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                animate={isVisible.faq ? "visible" : "hidden"}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 0.6, delay: index * 0.1 },
                                    },
                                }}
                            >
                                <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black hover:border-blue-500/50 transition-colors">
                                    <CardHeader>
                                        <h3 className="text-xl font-semibold">{faq.question}</h3>
                                    </CardHeader>
                                    <CardBody>
                                        <p className="text-gray-400">{faq.answer}</p>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="mt-8 text-center"
                        initial="hidden"
                        animate={isVisible.faq ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                    >
                        <p className="text-gray-400 mb-4">Still have questions? We're here to help.</p>
                        <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            endContent=""
                        >
                            Contact Our Support Team
                        </Button>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>



    )
}

// Helper Components
function ServiceCard({ service }) {
    return (
        <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden group hover:border-blue-500/50 transition-all duration-300 h-full">
            <div className="pb-2 lg:px-4">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                <h3 className="text-xl font-semibold group-hover:text-blue-500 transition-colors">{service.title}</h3>
            </div>
            <CardBody className="py-2 font-nunito">
                <p className="text-gray-400 mb-4">{service.description}</p>

                {service.features.length > 0 && (
                    <div className="mt-auto">
                        <div className="h-px w-full bg-blue-900/20 mb-4"></div>
                        <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                        <ul className="space-y-2">
                            {service.features.slice(0, 3).map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-400">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {service.benefits.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Benefits:</h4>
                                <ul className="space-y-2">
                                    {service.benefits.slice(0, 2).map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-400">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardBody>

        </Card>
    )
}

function ProcessStep({ step }) {
    return (
        <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden relative group hover:border-blue-500/50 transition-all duration-300 h-full ">
            <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-700"></div>
            <div className="pb-2 flex text-xl flex-col lg:px-4 font-montserrat">
                <div className="text-4xl font-bold text-blue-500/30 mb-2 group-hover:text-blue-500/50 transition-colors">
                    {step.number}
                </div>
                <h3 className="text-xl font-semibold group-hover:text-blue-500 transition-colors">
                    {step.title}
                </h3>
            </div>
            <CardBody>
                <p className="text-sm text-gray-400 font-nunito">{step.description}</p>
            </CardBody>
        </Card>
    );
}

