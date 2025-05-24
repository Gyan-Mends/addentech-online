import { useState } from "react"
import {
    Button,
    Input,
    Select,
    SelectItem,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Chip,
} from "@nextui-org/react"
import { ArrowRight, Calendar, Search, User } from "lucide-react"
import PublicLayout from "~/layout/PublicLayout"
import { Link, useLoaderData } from "@remix-run/react"
import { json, LoaderFunction } from "@remix-run/node"
import blog from "~/controller/blog"
import { BlogInterface, CategoryInterface } from "~/interface/interface"
import ScrollAnimation from "~/components/animation"
import category from "~/controller/categoryController"


export default function BlogPage() {
 const {
        blogs,
        categories
    } = useLoaderData<{
        blogs: BlogInterface[],
        categories: CategoryInterface[]
    }>()  
    
    console.log(blogs);
    
    const [searchQuery, setSearchQuery] = useState("");

    

    const filteredArticles = blogs.filter(
        (article) =>
            article.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
        }
        return text;
    };

    

    return (


        <PublicLayout>
           <main className="flex-1">
                <div className="bg-gray-50 py-12 md:py-10 flex flex-col justify-center items-center">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                     
                            <h1 className="text-3xl font-bold text-center tracking-tight text-gray-900 md:text-4xl">
                                Articles
                            </h1>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                                Insights, news, and resources on corporate governance,
                                financial management, and business administration
                            </p>
                    </div>
                </div>

                <section className="py-12 md:py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-12 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                              
                                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                                        Latest Articles
                                    </h2>

                                <div className=" mt-10 lg:grid lg:grid-cols-2 gap-10">
                                    {blogs.map((article, index) => (
                                       
                                            <Link to={`/blog/${article._id}`}>
                                                <div className="group">
                                                    <div className="mb-4 h-80 w-full rounded-lg bg-gray-200">
                                                        <img className="rounded-lg h-full w-full" src={article.image} alt="" /></div>
                                                    <div className="">
                                                        <span className="text-sm font-medium text-pink-500">
                                                            {article.category.name}
                                                        </span>
                                                        <h3 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-pink-500">
                                                            {article.name}
                                                        </h3>
                                                        <p className="mt-3 text-gray-600">
                                                        <div dangerouslySetInnerHTML={{ __html: truncateText(article.description, 15) }} />
                                                        </p>
                                                        <div className="mt-4 flex items-center text-sm text-gray-500">
                                                            <div className="flex items-center">
                                                                <Calendar className="mr-1 h-4 w-4" />
                                                                <span>{new Date(article.createdAt).toLocaleDateString("en-US", {
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                })}</span>
                                                            </div>
                                                            <span className="mx-2">•</span>
                                                            <div className="flex items-center">
                                                                <User className="mr-1 h-4 w-4" />
                                                                {/* <span>{article.admin}</span> */}
                                                            </div>
                                                            <span className="mx-2">•</span>
                                                            <span>5 min read</span>
                                                        </div>
                                                        <Link to={`/blog/${article._id}`} className="!mt-8">
                                                            <span className="inline-flex items-center !mt-4 text-sm font-medium text-pink-500 group-hover:text-pink-600">
                                                                Read more
                                                                <ArrowRight className="ml-1 h-4 w-4" />
                                                            </span>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </Link>
                                    ))}
                                </div>

                                <div className="mt-10 flex justify-center">
                                    <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                        Load more articles
                                    </button>
                                </div>
                            </div>

                            <div className="mt-12 lg:mt-20">
                                <div className="sticky top-24 space-y-10">
                                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Search
                                        </h3>
                                        <div className="mt-4 relative">
                                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search articles..."
                                                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Categories
                                        </h3>
                                        {categories.map((category) => (
                                            <Link
                                                key={category._id}
                                                to={`/blog/category/${category._id}`}
                                                className="mt-4 block text-sm font-medium text-gray-900 hover:text-pink-500"
                                            >
                                                {category.name}
                                            </Link>
                                        ))}
                                    </div>



                                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Newsletter
                                        </h3>
                                        <p className="mt-4 text-gray-600">
                                            Subscribe to our newsletter for the latest updates and
                                            insights.
                                        </p>
                                        <form className="mt-4">
                                            <input
                                                type="email"
                                                placeholder="Your email address"
                                                className="w-full rounded-md border border-gray-300 py-2 px-4 text-gray-900 placeholder:text-gray-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                                            />
                                            <button
                                                type="submit"
                                                className="mt-4 w-full rounded-md bg-pink-500 py-2 px-4 text-white hover:bg-pink-600"
                                            >
                                                Subscribe
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    )
}

export const loader: LoaderFunction = async ({ request }) => {
    const { blogs } = await blog.getBlogs({
        request,
    });
    const { categories } = await category.getCategories({
        request,
    });

    return json({
        blogs,
        categories,
    });
};
