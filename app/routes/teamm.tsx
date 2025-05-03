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

            <div style={{
                backgroundImage: `url("https://cdn.prod.website-files.com/66614d9079739759bbd5e68e/668d0c2f28f1313d27252c3d_service-shape-bg-2.svg")`,
                backgroundPosition: '50%',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '500px',
                position: 'relative',
            }} className="lg:grid lg:grid-cols-4 gap-10 lg:mt-40 ">
                {users.slice(0, 4).map((member, index) => (
                    <div
                        data-aos="zoom-in"
                        key={index}
                        className={`w-full h-[50vh] rounded-2xl ${index === 1 || index === 3 ? 'mt-20' : 'mt-40 lg:mt-0'}`}
                    >
                        <div className="h-[50vh] overflow-hidden rounded-2xl relative group">
                            {/* Image */}
                            <img
                                className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                                src={member.image}
                                alt={member.name}
                            />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                          {/* Name */}
                          <p className="text-white font-nunito text-lg">{member.firstName + " " + member.middleName + " " + member.lastName}</p>
                          <p className="text-white font-nunito text-lg">{member.phone}</p>
                      </div>
                  </div>
              </div>
          ))}



            </div>


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


