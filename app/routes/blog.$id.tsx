import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import PublicLayout from "~/components/PublicLayout";
import Blog from "~/modal/blog";
import { getSession } from "~/session";
import { BlogInterface } from "~/interface/interface";
import FacebookIcon from "~/components/icons/FacebookIcon";
import InstagramIcon from "~/components/icons/InstagramIcon";
import InIcon from "~/components/icons/InIcon";
import XIcon from "~/components/icons/XIcon";
import YouTubeIcon from "~/components/icons/YoutubeIcon";

const BlogDetail = () => {
    const { BlogDetail } = useLoaderData<{ BlogDetail: BlogInterface }>();

    return (
        <PublicLayout>
            <div className="mt-20 px-4">
                <p className="font-montserrat font-bold text-4xl dark:text-white">
                    {BlogDetail?.name || "No title available"}
                </p>

                <div className="flex mt-8 gap-4">
                    {[FacebookIcon, InstagramIcon, InIcon, XIcon, YouTubeIcon].map((Icon, index) => (
                        <div
                            key={index}
                            className="dark:bg-[rgb(14,17,22)] h-10 flex gap-2 items-center justify-center rounded-md py-1 px-1 border dark:border-white/30 border-black/10"
                        >
                            <Icon className="text-[#05ECF2] h-6 w-6 hover:text-[#F2059F]" />
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-between">
                    <p className="text-gray-500 font-bold text-md font-nunito">
                        Uploaded By: {BlogDetail?.admin?.firstName || "Unknown"}
                    </p>
                    <p className="text-gray-500 font-bold text-md font-nunito">
                        Published At: {new Date(BlogDetail.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                    <p className="text-gray-500 font-bold text-md font-nunito">
                        {BlogDetail?.category?.name || "Uncategorized"}
                    </p>
                </div>
            </div>

            <div className="px-4 mt-10">
                <div className="lg:px-40">
                    <img
                        src={BlogDetail?.image || "/default-image.png"}
                        alt={BlogDetail?.name || "Blog image"}
                        className="w-full h-96 object-cover rounded-lg"
                    />
                </div>

                <div className="dark:text-white text-justify text-md mt-6 font-nunito leading-relaxed space-y-4">
                    {BlogDetail?.description
                        ? BlogDetail.description.split("\n").map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))
                        : "No description available."}
                </div>
            </div>
        </PublicLayout>
    );
};

export default BlogDetail;

export const loader: LoaderFunction = async ({ request, params }) => {
    const { id } = params;

    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");

    if (!id) {
        throw new Response("Blog ID not provided", { status: 400 });
    }

    try {
        const BlogDetail = await Blog.findById(id)
            .populate("admin")
            .populate("category");

        if (!BlogDetail) {
            throw new Response("Blog not found", { status: 404 });
        }

        return json({
            BlogDetail,
        });
    } catch (error) {
        console.error("Error fetching blog details:", error);
        throw new Response("Internal Server Error", { status: 500 });
    }
};
