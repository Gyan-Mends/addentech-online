"use client"
import PublicLayout from "~/layout/PublicLayout"
import { Twitter, Linkedin, Facebook, Instagram, ArrowRight, Sparkles } from "lucide-react"
import { Link, useLoaderData } from "@remix-run/react"
import { json, type LoaderFunction } from "@remix-run/node"
import usersController from "~/controller/Users"
import type { RegistrationInterface } from "~/interface/interface"
import { motion } from "framer-motion"
import { Chip } from "@nextui-org/react"
import ScrollAnimation from "~/components/animation"

const Team = () => {
    const { users } = useLoaderData<{
        users: RegistrationInterface[]
    }>()

    const socialLinks = {
        twitter: Twitter,
        linkedin: Linkedin,
        facebook: Facebook,
        instagram: Instagram,
    }

    const fadeInUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    }

    return (
        <PublicLayout>
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
                            
                                <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-pink-500">
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
        </PublicLayout>
    )
}

export default Team

export const loader: LoaderFunction = async ({ request }) => {
    const { user, users, totalPages } = await usersController.FetchUsers({
        request,
    })

    return json({ user, users, totalPages })
}

// Enhanced Team Member component with the new styling
function EnhancedTeamMember({ name, role, img, socials }) {
    return (
        <div className="border border-white/10  overflow-hidden group hover:border-pink-500/30 transition-all duration-300 h-full rounded-lg shadow-lg">

            <div className="aspect-[6/7] overflow-hidden">
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
