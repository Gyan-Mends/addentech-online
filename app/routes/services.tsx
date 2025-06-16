"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button, Card, CardBody, CardHeader, CardFooter, Chip, Tabs, Tab } from "@nextui-org/react"
import { Link } from "@remix-run/react"
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
    Star,
    ArrowUpRight,
    Sparkles,
} from "lucide-react"
import ScrollAnimation from "~/components/animation"

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
            icon: <BarChart3 className="h-10 w-10 text-pink-400" />,
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
            icon: <Code className="h-10 w-10 text-pink-400" />,
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
            icon: <Layers className="h-10 w-10 text-pink-400" />,
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
            icon: <Palette className="h-10 w-10 text-pink-400" />,
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
            icon: <Cloud className="h-10 w-10 text-pink-400" />,
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


    const FAQs = [
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
    ];

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

    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <PublicLayout>
           <div className="overflow-x-hidden">
             {/* Hero Section */}
             <section
                id="hero-section"
                className="relative overflow-hidden lg:py-24 py-16 md:py-32"
                style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Background overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-600/20"></div>
                
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full filter blur-3xl animate-blob"></div>
                    <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-fuchsia-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="max-w-3xl mx-auto flex flex-col gap-6"
                        initial="hidden"
                        animate={isVisible.hero ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                    >
                       
                        <h1 className="text-4xl md:text-5xl font-montserrat font-bold lg:text-6xl leading-tight tracking-tight mb-6 text-white drop-shadow-lg">
                            Here is How We Can{" "}
                            <span className="text-pink-400">
                                Help Your Business
                            </span>
                        </h1>
                        <p className="text-xl text-white/90 max-w-[800px] leading-relaxed drop-shadow-md">
                            Comprehensive services tailored to your needs, designed to elevate your business in the digital landscape.
                        </p>
                        {/* <div className="flex flex-wrap gap-4 mt-8">
                            <Link to="/">
                            <Button
                                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium px-6 py-6 rounded-lg shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all duration-300"
                                endContent={<ArrowUpRight className="h-4 w-4 ml-1" />}
                                    size="lg"
                            >
                                Get Started
                            </Button>
                            </Link>
                            <Link to="/contact">
                            <Button
                                    className="border-pink-500/30  font-medium px-6 py-6 rounded-lg  hover:border-pink-500/50 transition-all duration-300"
                                endContent={<ArrowRight className="h-4 w-4 ml-1" />}
                                size="lg"

                            >
                                Contact Us
                            </Button>
                            </Link>
                        </div> */}
                    </motion.div>
                </div>
            </section>

            {/* Services Grid Section */}
            <section id="services-section" className="py-20 bg-gray-100  lg:px-[90px]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-3xl mx-auto text-center mb-16"
                        initial="hidden"
                        animate={isVisible.services ? "visible" : "hidden"}
                        variants={fadeInUpVariants}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Our Professional Services
                        </h2>
                        <p className=" text-lg mb-10 max-w-2xl mx-auto">
                            We offer a comprehensive range of services to help your business thrive in the digital age.
                        </p>
                        <div className=" p-1 !text-black bg-white shadow-md rounded-full backdrop-blur-sm border border-white/5 mb-8 max-w-xl mx-auto">
                            <Tabs
                                aria-label="Service categories"
                                selectedKey={activeTab}
                                onSelectionChange={setActiveTab}
                                className="justify-center w-full"
                                variant="solid"
                                color="default"

                                classNames={{
                                    tabList: "gap-2 w-full rounded-full bg-white  p-1",
                                    cursor: "bg-default-600 text-black rounded-full",
                                    tab: "rounded-full  px-4 py-2 text-sm font-medium data-[selected=true]:text-pink-400",
                                    tabContent: "group-data-[selected=true]:text-white",
                                }}
                            >
                                <Tab key="all" title="All" />
                                <Tab key="marketing" title="Marketing" />
                                <Tab key="development" title="Development" />
                                <Tab key="it" title="IT" />
                                <Tab key="design" title="Design" />
                            </Tabs>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    </div>
                </div>
            </section>

            {/* Methodology Section */}
            <section
                id="methodology-section"
                className="py-20  relative overflow-hidden"
            >
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-fuchsia-500/10 rounded-full filter blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <ScrollAnimation>
                        <motion.div
                            className="max-w-3xl mx-auto text-center mb-16"
                            initial="hidden"
                            animate={isVisible.methodology ? "visible" : "hidden"}
                            variants={fadeInUpVariants}
                        >
                            <div className="inline-flex mb-4">
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Our Methodology Guarantees Your Success
                            </h2>
                            <p className="text-lg max-w-2xl mx-auto">
                                We follow a proven methodology to ensure your project is delivered on time, within budget, and exceeds
                                your expectations.
                            </p>
                        </motion.div>
                    </ScrollAnimation>

                    {/* Wave Visualization */}
                    <ScrollAnimation>
                        <motion.div
                            className="relative h-40 mb-16"
                            initial={{ opacity: 0 }}
                            animate={isVisible.methodology ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <div className="absolute inset-0 ">
                                <svg viewBox="0 0 1200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                    <defs>
                                        <linearGradient className="" id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2" />
                                            <stop offset="50%" stopColor="#d946ef" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#c026d3" stopOpacity="0.2" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M0,100 C150,180 350,0 500,100 C650,200 750,0 900,100 C1050,200 1150,0 1200,100 V200 H0 V100Z"
                                        fill="url(#waveGradient)"
                                    />
                                    <motion.path
                                        d="M0,100 C150,180 350,0 500,100 C650,200 750,0 900,100 C1050,200 1150,0 1200,100"
                                        fill="none"
                                        stroke="url(#waveGradient)"
                                        strokeWidth="3"
                                        initial={{ pathLength: 0 }}
                                        animate={isVisible.methodology ? { pathLength: 1 } : { pathLength: 0 }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                    />

                                    {/* Animated dots along the path */}
                                    <motion.circle
                                        cx="0"
                                        cy="100"
                                        r="8"
                                        fill="#ec4899"
                                        initial={{ opacity: 0 }}
                                        animate={
                                            isVisible.methodology
                                                ? {
                                                    opacity: [0, 1, 0],
                                                    cx: [0, 300, 600, 900, 1200],
                                                    cy: [100, 30, 100, 30, 100],
                                                }
                                                : { opacity: 0 }
                                        }
                                        transition={{
                                            duration: 4,
                                            repeat: Number.POSITIVE_INFINITY,
                                            repeatType: "loop",
                                            ease: "linear",
                                            times: [0, 0.25, 0.5, 0.75, 1],
                                        }}
                                    />
                                </svg>
                            </div>
                        </motion.div>
                    </ScrollAnimation>

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


            {/* FAQ Section */}
            <section id="faq-section" className="py-20 relative">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full filter blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div className="max-w-3xl mx-auto text-center mb-16">

                        <h2 className="text-3xl md:text-4xl font-bold mb-6 ">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto">
                            Find answers to common questions about our services and how we can help your business.
                        </p>
                    </motion.div>

                    <div className="max-w-3xl mx-auto space-y-5">
                        {FAQs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                animate="visible"
                                className="border border-black/20 rounded-lg bg-white hover:border-pink-500/30 transition-all duration-300 group overflow-hidden shadow-sm"
                            >
                                <div
                                    className="px-6 py-5 flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-pink-400 font-medium">{index + 1}</span>
                                        </div>
                                        <h3 className="text-xl font-semibold">{faq.question}</h3>
                                    </div>
                                    <span>{openIndex === index ? "-" : "+"}</span>
                                </div>
                                {openIndex === index && (
                                    <div className="px-6 pb-6">
                                        <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <motion.div className="mt-12 flex flex-col justify-center items-center gap-2">
                        <p className=" mb-6 text-lg">
                            Still have questions? We're here to help.
                        </p>
                        <Link className="flex items-center gap-2 text-pink-500 hover:text-pink-600 transition-colors duration-300" to="/contact">
                            Contact Our Support Team <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                    </motion.div>
                </div>
            </section>
           </div>
        </PublicLayout>
    )
}

// Helper Components
function ServiceCard({ service }) {
    return (
        <ScrollAnimation>
            <Card className="border border-black/10 shadow-md overflow-hidden group hover:border-pink-500/30 transition-all duration-300 h-full hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                <CardBody className="p-6">
                    <div className="mb-6 transform group-hover:scale-105 transition-transform duration-300">
                        <div className="w-14 h-14 rounded-full bg-pink-500/10 flex items-center justify-center">{service.icon}</div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3  transition-colors duration-300">
                        {service.title}
                    </h3>
                    <p className="text-gray-500 mb-6">{service.description}</p>

                    {service.features.length > 0 && (
                        <div className="mt-auto">
                            <div className="h-px w-full bg-pink-900/20 mb-5"></div>
                            <h4 className="text-sm font-medium mb-3 ">Key Features:</h4>
                            <ul className="space-y-2.5">
                                {service.features.slice(0, 3).map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <CheckCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-400">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {service.benefits.length > 0 && (
                                <div className="mt-5">
                                    <h4 className="text-sm font-medium mb-3 ">Benefits:</h4>
                                    <ul className="space-y-2.5">
                                        {service.benefits.slice(0, 2).map((benefit, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm">
                                                <CheckCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-400">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </CardBody>

                <CardFooter className="pt-0 pb-5 px-6">
                    <Button
                        className="w-full text-gray-600 border  border-white/10 hover:border-gray-600/40 transition-all duration-300 "
                        variant="bordered"
                        endContent={<ArrowRight className="h-4 w-4 ml-1" />}
                        as={Link}
                        href={`/services/${service.id}`}
                    >
                        Learn More
                    </Button>
                </CardFooter>
            </Card>
        </ScrollAnimation>
    )
}

function ProcessStep({ step }) {
    return (
        <ScrollAnimation>
            <Card className="border border-black/10  overflow-hidden shadow-md relative group hover:border-pink-500/30 transition-all duration-300 h-full hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-pink-500 to-fuchsia-600 group-hover:w-full transition-all duration-700"></div>


                <CardBody className="p-6">
                    <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-fuchsia-500 bg-clip-text text-transparent mb-4 group-hover:from-pink-300 group-hover:to-fuchsia-400 transition-all duration-300">
                        {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-3   transition-colors duration-300">
                        {step.title}
                    </h3>
                    <p className="text-gray-400">{step.description}</p>
                </CardBody>
            </Card>
        </ScrollAnimation>
    )
}
