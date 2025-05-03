import { TeamMember } from "~/components/team"
import PublicLayout from "~/layout/PublicLayout"

const Team = () => {
    return (
        <PublicLayout>
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
        </PublicLayout>
    )
}

export default Team