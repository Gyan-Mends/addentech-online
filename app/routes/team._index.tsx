import { TeamMember } from "~/components/team";
import PublicLayout from "~/layout/PublicLayout";
import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";
import usersController from "~/controller/Users";
import { RegistrationInterface } from "~/interface/interface";

const Team = () => {
    const {
        users
    } = useLoaderData<{
        // user: { _id: string },
        users: RegistrationInterface[],
    }>()
    const socialLinks = {
        twitter: Twitter,
        linkedin: Linkedin,
        facebook: Facebook,
        instagram: Instagram,
    };


    return (
        <PublicLayout>
            <section className="py-16 bg-gradient-to-br from-black to-gray-900 lg:px-[125px] px-4">
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
                            <div className="bg-blue-500/10 text-blue-500 w-28 p-1 font-monstserrat m-auto text-center rounded hover:bg-blue-500/20">
                                Our Team
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold font-montserrat">
                                Meet Our Dedicated Experts Behind Addentech Success
                            </h2>
                            <p className="text-muted-foreground font-nunito">
                                Our team combines deep legal knowledge with technical expertise to create solutions that truly address the
                                needs of modern legal practice.
                            </p>
                        </div>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {users.map((member, i) => (
                            <Link to={`/team/${member._id}`} key={member._id}>

                                <TeamMember
                                    key={i}
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
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default Team;

export const loader: LoaderFunction = async ({ request }) => {
    const { user, users, totalPages } = await usersController.FetchUsers({
        request,

    });

    return json({ user, users, totalPages });
}
