import { Link, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";

import PublicLayout from "~/components/PublicLayout";
import jl from "~/components/images/JL.png"
import testimonial from "~/components/images/670c83518128ff5c009e4a93_Testimonail Image 3-p-500.webp"
import dl from "~/components/images/Dennislaw-Logo.svg"
import mr from "~/components/images/mr-logo.png"
import news from "~/components/images/DL-News-Logo.png"
import img5 from "~/components/images/about-five2.jpg"
import img6 from "~/components/images/about-five1.jpg"
import lineImage from "~/components/images/work-process-line.png"
import { Button, User } from "@nextui-org/react";
// import Support from "~/components/Icons/icons/Support";
import logo from "~/components/images/logo.png"
import EmailIcon from "~/components/icons/EmailIcon";
import StarIcon from "~/components/icons/StarIcon";
import NetworkIcon from "~/components/icons/NetworkIcon";
import { json, LoaderFunction } from "@remix-run/node";
import { getSession } from "~/session";
import usersController from "~/controller/Users";
import { BlogInterface, RegistrationInterface } from "~/interface/interface";
import Users from "./admin.users";
import blog from "~/controller/blog";
// import AWS from "~/components/Icons/icons/AWS";

const Index = () => {

    const {
        // user,
        users,
        blogs
    } = useLoaderData<{
        // user: { _id: string },
        users: RegistrationInterface[],
        blogs: BlogInterface[]
    }>()

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
        }
        return text;
    };


    return (
        <PublicLayout>

            {/* Team Section */}
            <div className="lg:flex justify-between lg:mt-40 mt-20">
                <div data-aos="fade-right" className="">
                    <p className="font-montserrat text-4xl font-bold dark:text-white">Meet Our Dedicated Experts Behind
                    </p>
                    <p className="font-montserrat text-4xl font-bold dark:text-white"> Addentech  Success
                    </p>
                </div>

            </div>
            <div className="lg:grid lg:grid-cols-3 gap-10  ">
                {users.map((member, index) => (
                    <div data-aos="zoom-in" key={index} className="w-full h-[60vh] border border-black/10 dark:border-white/5 rounded-2xl mt-40 lg:mt-40">
                        <div className="w-full flex items-center justify-between px-10  h-28  rounded-tr-2xl rounded-tl-2xl">
                            <div>
                                <p className="font-nunito text-lg dark:text-white font-bold">{member?.firstName + " " + member?.middleName + " " + member?.lastName}</p>
                                <p className="font-nunito text-md dark:text-white">{member.position}</p>
                            </div>
                            <div>
                                <Link to="">
                                    <EmailIcon className="h-6 w-6 text-[#05ECF2]" />
                                </Link>
                            </div>
                        </div>
                        <div className="h-[60vh] overflow-hidden rounded-bl-2xl rounded-br-2xl">
                            <img
                                className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                                src={member.image}
                                alt={member.name}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Testimonials Section */}

        </PublicLayout>
    );
};

export default Index;


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


