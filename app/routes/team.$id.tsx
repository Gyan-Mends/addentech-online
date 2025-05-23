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
import ScrollAnimation from "~/components/animation"

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



    return (
        <PublicLayout >


            {/* Team Member Hero Section */}
            <section className="py-12  relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-1/3">
                            <div className="aspect-square overflow-hidden rounded-xl  hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                                <ScrollAnimation>
                                    <img
                                    src={userDetail.image || "/placeholder.svg"}
                                    alt={userDetail.firstName + " " + userDetail.middleName + " " + userDetail.lastName}
                                    width={600}
                                    height={600}
                                    className="h-full w-full object-cover"
                                />
                                </ScrollAnimation>
                            </div>
                        </div>
                        <ScrollAnimation className="w-full">
                            <div className="w-full md:w-2/3">

                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tighter mb-4">
                                {userDetail.firstName + " " + userDetail.middleName + " " + userDetail.lastName}
                            </h1>
                            <div className="mb-6">
                                    <Chip className=" " variant="bordered">
                                    {userDetail.role}
                                </Chip>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: userDetail.bio }} />
                            <div className="flex flex-wrap gap-4 mb-6 mt-4">
                                <div className="flex items-center text-gray-400">
                                        <Mail className="h-4 w-4 mr-2 text-pink-500" />
                                    <span>{userDetail.email}</span>
                                </div>
                                <div className="flex items-center text-gray-400">
                                        <Phone className="h-4 w-4 mr-2 text-pink-500" />
                                    <span>{userDetail.phone}</span>
                                </div>

                            </div>
                            {/* <div className="flex gap-3">
                                <Button
                                    as={Link}
                                    // to={member.socialMedia.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    isIconOnly
                                    variant="flat"
                                        className="bg-pink-900/20 "
                                >
                                        <Linkedin size={18} className="text-pink-500" />
                                </Button>
                                <Button
                                    as={Link}
                                    // to={member.socialMedia.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    isIconOnly
                                    variant="flat"
                                        className="bg-pink-900/20 text-pink-500"
                                >
                                    <Twitter size={18} />
                                </Button>
                                <Link to="/contact">
                                        <Button className="   ml-2">Contact {member.name.split(" ")[0]}</Button>
                                </Link>
                            </div> */}
                        </div>
                        </ScrollAnimation>
                    </div>
                </div>
            </section>

            {/* Team Member Details Section */}
            <section className="py-12 bg-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Tabs aria-label="Team member details" variant="underlined" className="mb-8 bg-white rounded-lg shadow-sm">
                        <Tab key="about" title="About">
                            <Card className="border-blue-900/40 bg-white">
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
                                <Card className=" bg-white ">
                                    <CardBody className="p-6">
                                        <div className="flex items-center mb-4">
                                            <Briefcase className="h-5 w-5 text-pink-500 mr-2" />
                                            <h2 className="text-xl font-bold">Professional Experience</h2>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="relative pl-6 border-l border-blue-900/40">
                                                <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-pink-500"></div>
                                                <h3 className="text-lg font-semibold">{userDetail.institution}</h3>
                                                <div className="flex items-center text-blue-500 text-sm mb-1">
                                                    <Calendar className="h-3 w-3 mr-1 text-pink-500" />
                                                    <span>{userDetail.dateCompletedInstitution}</span>
                                                    </div>
                                                <p className="text-gray-400 mb-1">{userDetail.institution}</p>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

                                <Card className="bg-white to-black">
                                    <CardBody className="p-6">
                                        <div className="flex items-center mb-4">
                                            <GraduationCap className="h-5 w-5 text-pink-500 mr-2" />
                                            <h2 className="text-xl font-bold">Education</h2>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="relative pl-6 border-l border-blue-900/40">
                                                <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-pink-500"></div>
                                                <h3 className="text-lg font-semibold">{userDetail.institutionName}</h3>
                                                <p className="mb-1">{userDetail.program}</p>
                                                <div className="flex items-center text-pink-500 text-sm">
                                                    <Calendar className="h-3 w-3 mr-1 text-pink-500" />
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
            <section className="py-12  relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <h2 className="text-2xl font-bold mb-8">Related Team Members</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {related?.map((otherMember, key) => (
                            <ScrollAnimation>
                                <Link to={`/team/${key}`} key={key}>
                                    <Card className="border-blue-900/40  overflow-hidden group hover:border-blue-500/50 transition-all">
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
                                            <h3 className="font-bold text-lg group-hover:text-pink-500 transition-colors">{otherMember.firstName} {otherMember.middleName} {otherMember.lastName}</h3>
                                        <p className="text-gray-400 text-sm mb-3">{otherMember.role}</p>
                                        <Link to={`/team/${otherMember._id}`} key={otherMember._id}>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                    className="p-0 group-hover:text-pink-500"
                                                endContent={<ChevronRight className="h-4 w-4" />}
                                            >
                                                View Profile
                                            </Button>
                                        </Link>
                                    </CardBody>
                                </Card>
                            </Link>
                            </ScrollAnimation>
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
