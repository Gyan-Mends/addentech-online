import { useState } from "react";
import { Link, useLoaderData } from "@remix-run/react";  // Import Link from Remix
import PublicLayout from "~/components/PublicLayout";
import boss from "~/components/images/670ca86e3679607f0324d7e6_Team Image 6-p-500.jpg";
import jl from "~/components/images/JL.png";
import testimonial from "~/components/images/670c83518128ff5c009e4a93_Testimonail Image 3-p-500.webp";
import blog from "~/controller/blog";
import { getSession } from "~/session";
import { json, LoaderFunction } from "@remix-run/node";
import { BlogInterface } from "~/interface/interface";

const Blog = () => {
    const { blogs, totalPages } = useLoaderData<{
        blogs: BlogInterface[],
        totalPages: number
    }>();


    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleCategoryChange = (e: any) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1);
    };

    return (
        <PublicLayout>
            <div className="mt-20 lg:px-80 px-4">
                <p className="font-montserrat font-bold text-4xl dark:text-white text-center">News & Articles</p>
                <p className="dark:text-white text-center mt-4 font-nunito">Stay informed with the latest updates...</p>
            </div>

            <div className="lg:px-40 px-4 flex flex-col gap-10">
                <div className="mt-40 flex flex-wrap justify-between gap-6">
                    <div className="flex justify-center mb-6 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:max-w-lg px-4 py-2 border dark:border-white/20 border-black/20 dark:text-white rounded-lg focus:outline-none dark:bg-[#0b0e13] font-nunito"
                        />
                    </div>

                    <div className="flex justify-center mb-6 w-full md:w-auto">
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="w-full md:max-w-lg px-4 py-2 border dark:border-white/20 border-black/20 dark:text-white rounded-lg focus:outline-none dark:bg-[#0b0e13] font-nunito"
                        >
                            <option value="All">All Categories</option>
                            <option value="Tech">Tech</option>
                            <option value="JavaScript">JavaScript</option>
                            <option value="AI">AI</option>
                            <option value="Cloud">Cloud</option>
                        </select>
                    </div>
                </div>

                {blogs.map((blog: BlogInterface, index: number) => (
                    <div
                        key={index}
                        className={`w-full h-auto border dark:border-white/30 border-black/30 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-6`}
                    >
                        <div className="h-full overflow-hidden group">
                            <img
                                src={blog?.image}
                                alt={blog?.title}
                                className="w-full h-80 object-cover rounded-l-2xl transition-transform duration-300 ease-in-out group-hover:scale-105"
                            />
                        </div>
                        <div className="p-6 flex flex-col justify-center gap-4">
                            <p className="text-sm text-[#05ECF2] font-nunito text-xl">{blog?.category}</p>
                            <h2 className="text-2xl font-bold dark:text-white font-montserrat">{blog?.title}</h2>
                            {/* <p className="text-sm text-gray-400 font-nunito">{blog?.description}</p> */}
                            <div className="flex justify-between items-center">
                                <p className="text-gray-500">{blog?.company}</p>
                                <p className="text-gray-500">{blog?.date}</p>
                            </div>
                            {/* <Link
                                to={`/blog/${blog?.id}`} // Link to the detailed blog page
                                className="text-[#F2059F] font-nunito text-sm mt-4"
                            >
                                View more details
                            </Link> */}
                        </div>
                    </div>
                ))}

                {totalPages > 1 && (
                    <div className="flex justify-center gap-4 mt-6">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg ${currentPage === 1
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-500 dark:text-white"
                                }`}
                        >
                            Previous
                        </button>
                        <p className="text-gray-600">
                            Page {currentPage} of {totalPages}
                        </p>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-500 dark:text-white"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                )}

                {blogs.length === 0 && (
                    <div className="text-center text-gray-500">No blogs found for "{searchQuery}" in "{selectedCategory}" category.</div>
                )}
            </div>
        </PublicLayout>
    );
};

export default Blog;


export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") || "";

    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");

    // Fetch blogs with pagination and search filters
    const { blogs, totalPages } = await blog.getBlogs({
        request,
        page,
        search_term,
    });

    return json({
        blogs, totalPages
    })



}

