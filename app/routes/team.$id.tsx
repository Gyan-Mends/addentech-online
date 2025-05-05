"use client"

import { useState, useEffect } from "react"
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Button,
    Card,
    CardBody,
    Chip,
    Divider,
    Breadcrumbs,
    BreadcrumbItem,
    Tabs,
    Tab,
    Progress,
} from "@nextui-org/react"
import { MapPin, Phone, Mail, Linkedin, Twitter, ArrowLeft, Calendar, Briefcase, GraduationCap, Award, FileText, Users, MessageSquare, ChevronRight } from 'lucide-react'
import { Link, useLoaderData, useParams } from "@remix-run/react"
import PublicLayout from "~/layout/PublicLayout"
import { json, LoaderFunction } from "@remix-run/node"
import Registration from "~/modal/registration"
import { RegistrationInterface } from "~/interface/interface"

export default function TeamMemberDetailPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const params = useParams()
    const slug = params.slug as string
    const { userDetail
        , related,
        // recentPosts
    } = useLoaderData<{
        userDetail: RegistrationInterface;
        related: RegistrationInterface[];
        // recentPosts: any[];
    }>();

    // This would normally come from a database or API
    const teamMembers = {
        "sarah-johnson": {
            name: "Sarah Johnson",
            role: "Chief Legal Technology Officer",
            img: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
            email: "sarah.johnson@dennislaw.com",
            phone: "+233-30-291-4988",
            location: "Accra, Ghana",
            bio: "Sarah Johnson is a pioneering force in legal technology with over 15 years of experience bridging the gap between law and innovation. As Chief Legal Technology Officer at DennisLaw, she leads strategic technology initiatives that transform how legal services are delivered to clients worldwide.",
            longBio: "Sarah began her career as a corporate attorney before recognizing the transformative potential of technology in the legal sector. Her unique background combines legal expertise with technical knowledge, allowing her to develop solutions that address the specific challenges faced by modern legal practitioners.\n\nUnder her leadership, DennisLaw has implemented cutting-edge AI-powered contract analysis tools, automated compliance systems, and client-facing portals that have significantly improved service delivery and client satisfaction.\n\nSarah is a frequent speaker at legal technology conferences and has published numerous articles on the intersection of law and technology. She holds a J.D. from Harvard Law School and a B.S. in Computer Science from MIT.",
            education: [
                {
                    degree: "Juris Doctor (J.D.)",
                    institution: "Harvard Law School",
                    year: "2008",
                },
                {
                    degree: "B.S. in Computer Science",
                    institution: "Massachusetts Institute of Technology",
                    year: "2005",
                },
            ],
            experience: [
                {
                    position: "Chief Legal Technology Officer",
                    company: "DennisLaw",
                    period: "2018 - Present",
                    description: "Leading all technology initiatives and digital transformation efforts across the firm.",
                },

            ],
            expertise: [
                { skill: "Legal Technology Implementation", level: 95 },
                { skill: "AI in Legal Practice", level: 90 },
                { skill: "Digital Transformation Strategy", level: 85 },
                { skill: "Legal Project Management", level: 80 },
                { skill: "Contract Automation", level: 90 },
            ],

            projects: [
                {
                    name: "AI-Powered Contract Analysis System",
                    description: "Led the development and implementation of an AI system that reduced contract review time by 70%.",
                },
                {
                    name: "Client Portal Platform",
                    description: "Spearheaded the creation of a secure client portal that improved client satisfaction by 45%.",
                },
                {
                    name: "Automated Compliance Framework",
                    description: "Developed a system that ensures regulatory compliance across multiple jurisdictions.",
                },
            ],
            socialMedia: {
                linkedin: "https://linkedin.com/in/sarah-johnson",
                twitter: "https://twitter.com/sarahjohnson",
            },
        },
        "michael-chen": {
            name: "Michael Chen",
            role: "Head of Software Development",
            img: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
            email: "michael.chen@dennislaw.com",
            phone: "+233-30-291-4989",
            location: "Accra, Ghana",
            bio: "Michael Chen is an accomplished software development leader with extensive experience in building legal technology solutions. At DennisLaw, he oversees all aspects of software development, from architecture to deployment.",
            longBio: "Michael brings over 12 years of software development expertise to DennisLaw, with a special focus on creating secure, scalable applications for the legal industry. His technical leadership has been instrumental in developing DennisLaw's proprietary legal management platform that serves clients across Africa and beyond.\n\nPrior to joining DennisLaw, Michael led development teams at several technology companies, where he honed his skills in agile methodologies and team leadership. His approach combines technical excellence with a deep understanding of user needs, resulting in intuitive software that solves real-world legal challenges.\n\nMichael holds a Master's degree in Computer Science from Stanford University and is certified in multiple programming languages and cloud platforms.",
            education: [
                {
                    degree: "M.S. in Computer Science",
                    institution: "Stanford University",
                    year: "2011",
                },
                {
                    degree: "B.S. in Software Engineering",
                    institution: "University of California, Berkeley",
                    year: "2009",
                },
            ],
            experience: [
                {
                    position: "Head of Software Development",
                    company: "DennisLaw",
                    period: "2019 - Present",
                    description: "Leading the development team in creating innovative legal technology solutions.",
                },
                {
                    position: "Senior Software Architect",
                    company: "LegalTech Solutions",
                    period: "2015 - 2019",
                    description: "Designed and implemented secure, scalable legal software platforms.",
                },
                {
                    position: "Software Developer",
                    company: "Tech Innovations Inc.",
                    period: "2011 - 2015",
                    description: "Developed web and mobile applications for various industries.",
                },
            ],
            expertise: [
                { skill: "Full-Stack Development", level: 95 },
                { skill: "Cloud Architecture", level: 90 },
                { skill: "DevOps & CI/CD", level: 85 },
                { skill: "Database Design", level: 90 },
                { skill: "API Development", level: 95 },
            ],
            publications: [
                {
                    title: "Secure API Design for Legal Applications",
                    publisher: "Journal of Software Engineering",
                    year: "2023",
                },
                {
                    title: "Cloud Migration Strategies for Legal Firms",
                    publisher: "Tech in Law Review",
                    year: "2022",
                },
            ],
            awards: [
                {
                    title: "Best Legal Technology Solution",
                    organization: "African Technology Awards",
                    year: "2023",
                },
            ],
            projects: [
                {
                    name: "LegalCase Management Platform",
                    description: "Architected and developed a comprehensive case management system used by over 500 attorneys.",
                },
                {
                    name: "Secure Document Exchange System",
                    description: "Built an end-to-end encrypted document sharing platform for sensitive legal documents.",
                },
                {
                    name: "Mobile Legal Assistant App",
                    description: "Led the development of a mobile application that provides legal professionals with on-the-go access to resources.",
                },
            ],
            socialMedia: {
                linkedin: "https://linkedin.com/in/michael-chen",
                twitter: "https://twitter.com/michaelchen",
            },
        },
        "aisha-patel": {
            name: "Aisha Patel",
            role: "Legal AI Specialist",
            img: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
            email: "aisha.patel@dennislaw.com",
            phone: "+233-30-291-4990",
            location: "Accra, Ghana",
            bio: "Aisha Patel is a pioneering Legal AI Specialist who combines her legal background with expertise in artificial intelligence to develop innovative solutions for legal challenges.",
            longBio: "Aisha specializes in applying machine learning and natural language processing techniques to legal documents and processes. Her work at DennisLaw has revolutionized how the firm handles document review, legal research, and predictive analytics for case outcomes.\n\nWith a background in both law and computer science, Aisha bridges the gap between legal requirements and technical implementation. She leads a team of data scientists and legal analysts who continuously improve DennisLaw's AI capabilities and develop new applications for artificial intelligence in legal practice.\n\nAisha frequently contributes to academic research on AI ethics in legal applications and has developed frameworks for responsible AI use in the legal sector. She holds a J.D. from Columbia Law School and a Master's in Artificial Intelligence from Carnegie Mellon University.",
            education: [
                {
                    degree: "J.D.",
                    institution: "Columbia Law School",
                    year: "2014",
                },
                {
                    degree: "M.S. in Artificial Intelligence",
                    institution: "Carnegie Mellon University",
                    year: "2016",
                },
                {
                    degree: "B.A. in Computer Science",
                    institution: "University of Pennsylvania",
                    year: "2011",
                },
            ],
            experience: [
                {
                    position: "Legal AI Specialist",
                    company: "DennisLaw",
                    period: "2020 - Present",
                    description: "Developing and implementing AI solutions for legal document analysis and predictive analytics.",
                },
                {
                    position: "AI Research Scientist",
                    company: "Legal Innovation Lab",
                    period: "2016 - 2020",
                    description: "Conducted research on applications of machine learning in legal contexts.",
                },
                {
                    position: "Legal Associate",
                    company: "Global Law Partners",
                    period: "2014 - 2016",
                    description: "Practiced corporate law with a focus on technology companies and intellectual property.",
                },
            ],
            expertise: [
                { skill: "Machine Learning", level: 95 },
                { skill: "Natural Language Processing", level: 90 },
                { skill: "Legal Document Analysis", level: 95 },
                { skill: "Predictive Analytics", level: 85 },
                { skill: "AI Ethics", level: 90 },
            ],
            publications: [
                {
                    title: "Ethical Considerations in Legal AI",
                    publisher: "AI & Law Journal",
                    year: "2023",
                },
                {
                    title: "Machine Learning Approaches to Contract Analysis",
                    publisher: "Computational Legal Studies",
                    year: "2022",
                },
                {
                    title: "Predictive Justice: The Role of AI in Case Outcome Prediction",
                    publisher: "Journal of Law and Technology",
                    year: "2021",
                },
            ],
            awards: [
                {
                    title: "AI Innovation in Legal Practice Award",
                    organization: "International Legal Technology Association",
                    year: "2023",
                },
                {
                    title: "Women in Legal Tech Leadership Award",
                    organization: "Women in Legal Technology Forum",
                    year: "2022",
                },
            ],
            projects: [
                {
                    name: "Legal Document Classification System",
                    description: "Developed an AI system that automatically classifies legal documents with 95% accuracy.",
                },
                {
                    name: "Precedent Analysis Tool",
                    description: "Created a machine learning model that identifies relevant case precedents based on case facts.",
                },
                {
                    name: "Ethical AI Framework for Legal Applications",
                    description: "Established guidelines and technical safeguards for responsible AI use in legal practice.",
                },
            ],
            socialMedia: {
                linkedin: "https://linkedin.com/in/aisha-patel",
                twitter: "https://twitter.com/aishapatel",
            },
        },
    }

    const member = teamMembers[slug] || teamMembers["sarah-johnson"]

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
        { name: "Team", path: "/team" },
        { name: "About", path: "/about" },
        { name: "Blog", path: "/blog" },
        { name: "Pricing", path: "/pricing" },
    ]

    return (
        <PublicLayout >


            {/* Team Member Hero Section */}
            <section className="py-12 bg-gradient-to-br from-black to-gray-900 relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-1/3">
                            <div className="aspect-square overflow-hidden rounded-xl border border-blue-900/40 bg-gradient-to-br from-gray-900 to-black">
                                <img
                                    src={userDetail.image || "/placeholder.svg"}
                                    alt={userDetail.firstName + " " + userDetail.middleName + " " + userDetail.lastName}
                                    width={600}
                                    height={600}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-2/3">

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tighter mb-4">
                                {userDetail.firstName + " " + userDetail.middleName + " " + userDetail.lastName}
                            </h1>
                            <div className="mb-6">
                                <Chip className="bg-blue-500/10 text-blue-500 border-blue-500/20" variant="bordered">
                                    {userDetail.role}
                                </Chip>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: userDetail.bio }} />
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex items-center text-gray-400">
                                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                                    <span>{userDetail.email}</span>
                                </div>
                                <div className="flex items-center text-gray-400">
                                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                                    <span>{userDetail.phone}</span>
                                </div>

                            </div>
                            <div className="flex gap-3">
                                <Button
                                    as={Link}
                                    to={member.socialMedia.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    isIconOnly
                                    variant="flat"
                                    className="bg-blue-900/20 text-blue-500"
                                >
                                    <Linkedin size={18} />
                                </Button>
                                <Button
                                    as={Link}
                                    to={member.socialMedia.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    isIconOnly
                                    variant="flat"
                                    className="bg-blue-900/20 text-blue-500"
                                >
                                    <Twitter size={18} />
                                </Button>
                                <Link to="/contact">
                                    <Button className="bg-blue-500 hover:bg-blue-600 text-white ml-2">Contact {member.name.split(" ")[0]}</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Member Details Section */}
            <section className="py-12 bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Tabs aria-label="Team member details" color="primary" variant="underlined" className="mb-8">
                        <Tab key="about" title="About">
                            <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black">
                                <CardBody className="p-6">
                                    <h2 className="text-2xl font-bold mb-4">About                                 {userDetail.firstName + " " + userDetail.middleName + " " + userDetail.lastName}
                                    </h2>
                                    <div className="space-y-4">
                                        <div dangerouslySetInnerHTML={{ __html: userDetail.bio }} />

                                    </div>
                                </CardBody>
                            </Card>
                        </Tab>
                        <Tab key="experience" title="Experience & Education">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black">
                                    <CardBody className="p-6">
                                        <div className="flex items-center mb-4">
                                            <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
                                            <h2 className="text-xl font-bold">Professional Experience</h2>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="relative pl-6 border-l border-blue-900/40">
                                                    <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-blue-500"></div>
                                                <h3 className="text-lg font-semibold">{userDetail.institution}</h3>
                                                <div className="flex items-center text-blue-500 text-sm mb-1">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                    <span>{userDetail.dateCompletedInstitution}</span>
                                                    </div>
                                                <p className="text-gray-400 mb-1">{userDetail.institution}</p>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

                                <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black">
                                    <CardBody className="p-6">
                                        <div className="flex items-center mb-4">
                                            <GraduationCap className="h-5 w-5 text-blue-500 mr-2" />
                                            <h2 className="text-xl font-bold">Education</h2>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="relative pl-6 border-l border-blue-900/40">
                                                    <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-blue-500"></div>
                                                <h3 className="text-lg font-semibold">{userDetail.institutionName}</h3>
                                                <p className="text-gray-400 mb-1">{userDetail.program}</p>
                                                    <div className="flex items-center text-blue-500 text-sm">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                    <span>{userDetail.dateCompletedProgram}</span>
                                                    </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        </Tab>


                    </Tabs>
                </div>
            </section>

            {/* Other Team Members Section */}
            <section className="py-12 bg-gradient-to-br from-black to-gray-900 relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <h2 className="text-2xl font-bold mb-8">Meet Other Team Members</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {related?.map((otherMember, key) => (
                            <Link to={`/team/${key}`} key={key}>
                                <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden group hover:border-blue-500/50 transition-all">
                                    <div className="aspect-square overflow-hidden">
                                        <img
                                            src={otherMember.image || "/placeholder.svg"}
                                            alt={`${otherMember.firstName} ${otherMember.middleName} ${otherMember.lastName}`}
                                            width={300}
                                            height={300}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <CardBody className="p-4">
                                        <h3 className="font-bold text-lg group-hover:text-blue-500 transition-colors">{otherMember.firstName} {otherMember.middleName} {otherMember.lastName}</h3>
                                        <p className="text-gray-400 text-sm mb-3">{otherMember.role}</p>
                                        <Link to={`/team/${otherMember._id}`} key={otherMember._id}>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="p-0 group-hover:text-blue-500"
                                                endContent={<ChevronRight className="h-4 w-4" />}
                                            >
                                                View Profile
                                            </Button>
                                        </Link>
                                    </CardBody>
                                </Card>
                            </Link>
                        ))}

                    </div>
                </div>
            </section>

        </PublicLayout>
    )
}


export const loader: LoaderFunction = async ({ request, params }) => {
    const { id } = params;

    if (!id) {
        throw new Response("Task ID not provided", { status: 400 });
    }

    try {
        const userDetail = await Registration.findById(id);

        if (!userDetail) {
            throw new Error("Blog not found");
        }

        // Find related blogs with the same category, excluding the current blog
        const related = await Registration.find({
            _id: { $ne: userDetail._id }, // Exclude the current blog
        }).limit(3);



        return json({
            userDetail, id,
            related,
            // recentPosts
        });
    } catch (error) {
        console.error("Error fetching task details:", error);
        throw new Response("Internal Server Error", { status: 500 });
    }
};
