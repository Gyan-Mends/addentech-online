import { useState, useEffect } from "react";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import PublicLayout from "~/components/PublicLayout";
import { getSession } from "~/session";
import { json, LoaderFunction } from "@remix-run/node";
import { BlogInterface, CategoryInterface } from "~/interface/interface";
import { SearchIcon } from "~/components/icons/SearchIcon";
import { Input } from "@nextui-org/react";
import blog from "~/controller/blog";
import category from "~/controller/categoryController";

const Blog = () => {
    const { blogs, totalPages, categories } = useLoaderData<{
        blogs: BlogInterface[];
        totalPages: number;
        categories: CategoryInterface[];
    }>();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const navigate = useNavigate();

    // Sync currentPage with URL query parameter
    useEffect(() => {
        const url = new URL(window.location.href);
        const page = parseInt(url.searchParams.get("page") as string) || 1;
        setCurrentPage(page);
    }, []);

    const handlePrev = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            navigate(`?page=${newPage}&search_term=${searchQuery}&category=${selectedCategory}`);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            navigate(`?page=${newPage}&search_term=${searchQuery}&category=${selectedCategory}`);
        }
    };

    const handleCategoryChange = (e: any) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);
        setCurrentPage(1);
        navigate(`?page=1&search_term=${searchQuery}&category=${newCategory}`);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
        navigate(`?page=1&search_term=${value}&category=${selectedCategory}`);
    };

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
        }
        return text;
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
                        <Input
                            size="sm"
                            placeholder="Search articles..."
                            startContent={<SearchIcon />}
                            onValueChange={handleSearchChange}
                            classNames={{
                                inputWrapper: "bg-white shadow-sm text-sm font-nunito dark:bg-[#333] border border-white/5",
                            }}
                        />
                    </div>

                    <div className="flex justify-center mb-6 w-full md:w-auto">
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="w-full md:max-w-lg px-4 py-2 border dark:border-white/20 border-black/20 dark:text-white rounded-lg focus:outline-none dark:bg-[#0b0e13] font-nunito"
                        >
                            <option value="All">All Categories</option>
                            {categories.map((cat: CategoryInterface, index: number) => (
                                <option key={index} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-3 gap-4 mt-20">
                    {blogs.slice(0, 3).map((blog: BlogInterface, index: number) => (
                        <Link to={`/blog/${blog._id}`}>
                            <div data-aos="fade-in" data-aos-duration="100000" className="mt-4  bg-neutral  border rounded-xl dark:border-white/30 border-black/10">
                                <img className="h-60 w-full  rounded-tl-xl rounded-tr-xl" src={blog.image} alt="" />
                                <div className="px-4 pb-4">
                                    <span className="flex gap-8 mt-4 ">
                                        <p className="font-nunito text-gray-600"> {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}</p>
                                        <p className="font-nunito text-gray-600">{blog.admin?.firstName}</p>
                                    </span>
                                    <p className="mt-4 font-nunito font-bold text-xl">{truncateText(blog?.name, 10)}
                                    </p>


                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

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
                    <div className="text-center text-gray-500">
                        No blogs found for "{searchQuery}" in "{selectedCategory}" category.
                    </div>
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
    const cat = url.searchParams.get("category") || "All";

    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");

    const { blogs, totalPages } = await blog.getBlogs({
        request,
        page,
        search_term,
        cat,
    });
    const { categories } = await category.getCategories({ request });

    return json({
        blogs,
        totalPages,
        categories,
    });
};
