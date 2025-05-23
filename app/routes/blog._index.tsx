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
import { BlogInterface } from "~/interface/interface"
import ScrollAnimation from "~/components/animation"


export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const articles = [
        {
            image: "https://res.cloudinary.com/djlnjjzvt/image/upload/v1746900373/b2_yzywg9.avif",
            title: "Understanding the New Companies Act of Ghana",
            excerpt:
                "A comprehensive guide to the key changes in the new Companies Act and how they affect businesses in Ghana",
            date: "April 15, 2025",
            author: "John Mensah",
            category: "Corporate Governance",
            readTime: "5 min read",
        },
        {
            image: "https://res.cloudinary.com/djlnjjzvt/image/upload/v1746900683/b3_ov52nd.jpg",
            title: "Tax Compliance for SMEs in Ghana",
            excerpt:
                "Essential tax compliance practices that every small and medium enterprise in Ghana should implement.",
            date: "March 28, 2025",
            author: "By Abena Owusu",
            category: "Tax Administration",
            readTime: "7 min read",
        },
        {
            image: "https://res.cloudinary.com/djlnjjzvt/image/upload/v1746901014/b4_h6fkeq.avif",
            title: "Building Effective Boards for Corporate Success",
            excerpt:
                "How to constitute and manage effective boards that drive corporate success and good governance.",
            date: "February 10, 2025",
            author: "Michael Asante",
            category: "Corporate Governance",
            readTime: "6 min read",
        },
        {
            image: "https://res.cloudinary.com/djlnjjzvt/image/upload/v1746901244/b5_pv9wq0.avif",
            title: "Foreign Investment Opportunities in Ghana",
            excerpt:
                "Exploring the vast investment opportunities available to foreign investors in Ghana's growing economy.",
            date: "January 22, 2025",
            author: " Sarah Johnson",
            category: "Investment",
            readTime: "8 min read",
        },

    ];

    const filteredArticles = articles.filter(
        (article) =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (


        <PublicLayout>
           <main className="flex-1">
                <div className="bg-gray-50 py-12 md:py-10">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                     
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                                Blog
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
                                    {filteredArticles.map((article, index) => (
                                       
                                            <Link to="/404">
                                                <div className="group">
                                                    <div className="mb-4 h-60 w-full rounded-lg bg-gray-200">
                                                        <img className="rounded-lg h-full w-full" src={article.image} alt="" /></div>
                                                    <div className="">
                                                        <span className="text-sm font-medium text-pink-500">
                                                            {article.category}
                                                        </span>
                                                        <h3 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-pink-500">
                                                            {article.title}
                                                        </h3>
                                                        <p className="mt-3 text-gray-600">
                                                            {article.excerpt}
                                                        </p>
                                                        <div className="mt-4 flex items-center text-sm text-gray-500">
                                                            <div className="flex items-center">
                                                                <Calendar className="mr-1 h-4 w-4" />
                                                                <span>{article.date}</span>
                                                            </div>
                                                            <span className="mx-2">•</span>
                                                            <div className="flex items-center">
                                                                <User className="mr-1 h-4 w-4" />
                                                                <span>{article.author}</span>
                                                            </div>
                                                            <span className="mx-2">•</span>
                                                            <span>{article.readTime}</span>
                                                        </div>
                                                        <Link to="/404" className="mt-4">
                                                            <span className="inline-flex items-center text-sm font-medium text-pink-500 group-hover:text-pink-600">
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
                                        <ul className="mt-4 space-y-2">
                                            <li>
                                                <Link
                                                    to="#"
                                                    className="text-gray-600 hover:text-pink-500"
                                                >
                                                    Corporate Governance
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    to="#"
                                                    className="text-gray-600 hover:text-pink-500"
                                                >
                                                    Financial Management
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    to="#"
                                                    className="text-gray-600 hover:text-pink-500"
                                                >
                                                    Compliance
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    to="#"
                                                    className="text-gray-600 hover:text-pink-500"
                                                >
                                                    Business Administration
                                                </Link>
                                            </li>
                                        </ul>
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

    return json({
        blogs,
    });
};
