import { useState } from "react"
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Switch,
    Chip,
    Avatar,
    Divider,
    Breadcrumbs,
    BreadcrumbItem,
} from "@nextui-org/react"
import {
    Calendar,
    User,
    Tag,
    Share2,
    Facebook,
    Twitter,
    Linkedin,
    Link2,
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
} from "lucide-react"
import { Link, useLoaderData, useParams } from "@remix-run/react"
import PublicLayout from "~/layout/PublicLayout"
import Blog from "~/modal/blog"
import { json, LoaderFunction } from "@remix-run/node"
import { CategoryInterface, TaskInterface } from "~/interface/interface"
import category from "~/controller/categoryController"

export default function BlogDetailPage() {

    const { blogDetail, related, recentPosts } = useLoaderData<{
        blogDetail: any;
        related: any[];
        recentPosts: any[];
    }>();
    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
        }
        return text;
    };


    const relatedPosts = [
        {
            id: 1,
            slug: "digital-transformation-strategies",
            title: "Digital Transformation Strategies for 2025",
            excerpt: "Key strategies businesses should adopt to stay competitive in the digital age...",
            date: "January 12, 2025",
            image: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
            category: "Digital",
        },
        {
            id: 2,
            slug: "ai-in-legal-practice",
            title: "The Impact of AI on Legal Practice",
            excerpt: "How artificial intelligence is revolutionizing the legal industry...",
            date: "January 15, 2025",
            image: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
            category: "Technology",
        },
        {
            id: 3,
            slug: "cloud-computing-trends",
            title: "Cloud Computing Trends to Watch in 2025",
            excerpt: "The latest developments in cloud technology and how they affect businesses...",
            date: "January 18, 2025",
            image: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
            category: "Technology",
        },
    ]

    return (


        <PublicLayout >
            {/* Article Header */}
            <section className="py-12 bg-gradient-to-br from-black to-gray-900 relative font-nunito">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-4xl mx-auto">

                        <Chip size="sm" className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/20">
                            {blogDetail.category.name}
                        </Chip>

                        <h1 className="font-montserrat text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tighter mb-6">
                            {truncateText(blogDetail?.name, 10)}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-400">
                            <div className="flex items-center">
                                <Calendar size={16} className="mr-2 text-blue-500" />
                                {new Date(blogDetail?.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                            <div className="flex items-center">
                                <User size={16} className="mr-2 text-blue-500" />
                                Dennis Law
                            </div>
                            <div className="flex items-center">
                                <Tag size={16} className="mr-2 text-blue-500" />
                                5 min read
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Image */}
            <section className="py-8 bg-black font-nunito">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="aspect-[16/9] rounded-xl overflow-hidden">
                            <img
                                src={blogDetail.image || "/placeholder.svg"}
                                alt={blogDetail.title}
                                width={1200}
                                height={675}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <section className="py-12 bg-black font-nunito">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Main Content */}
                            <div className="w-full md:w-3/4">
                                <article className="prose prose-invert prose-blue max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: blogDetail.description }} />
                                </article>

                                {/* Tags */}
                                {/* <div className="mt-8 flex flex-wrap gap-2">
                                    {cat.map((tag) => (
                                        <Chip key={tag} size="sm" className="bg-gray-800 text-gray-300">
                                            {tag}
                                        </Chip>
                                    ))}
                                </div> */}

                                {/* Author Bio */}
                                {/* <div className="mt-12 p-6 bg-gray-900/30 rounded-xl border border-blue-900/20">
                                    <div className="flex items-start gap-4">
                                        <Avatar src={blogPost.author.avatar} className="w-16 h-16" alt={blogPost.author.name} />
                                        <div>
                                            <h3 className="text-lg font-semibold">{blogPost.author.name}</h3>
                                            <p className="text-gray-400 text-sm mb-3">{blogPost.author.role}</p>
                                            <p className="text-gray-400">
                                                Technology analyst and consultant with over 10 years of experience in digital transformation
                                                and IT strategy.
                                            </p>
                                        </div>
                                    </div>
                                </div> */}

                                {/* Share */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <Share2 size={18} className="mr-2 text-blue-500" />
                                        Share this article
                                    </h3>
                                    <div className="flex gap-3">
                                        <Button isIconOnly variant="flat" className="bg-blue-900/20 text-blue-500">
                                            <Facebook size={18} />
                                        </Button>
                                        <Button isIconOnly variant="flat" className="bg-blue-900/20 text-blue-500">
                                            <Twitter size={18} />
                                        </Button>
                                        <Button isIconOnly variant="flat" className="bg-blue-900/20 text-blue-500">
                                            <Linkedin size={18} />
                                        </Button>
                                        <Button isIconOnly variant="flat" className="bg-blue-900/20 text-blue-500">
                                            <Link2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="w-full md:w-1/4">
                                <div className="sticky top-24">
                                    <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
                                    <div className="space-y-4 flex flex-col gap-4">
                                        {recentPosts.map((post) => (
                                            <Link to={`/blog/${post._id}`} key={post._id}>
                                                <div className="group flex gap-4 items-start">
                                                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={post.image || "/placeholder.svg"}
                                                            alt={post.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium group-hover:text-blue-500 transition-colors line-clamp-2">
                                                            {post.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(post.createdAt).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Articles */}
            <section className="py-12 bg-gradient-to-br from-black to-gray-900 font-nunito">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {related.map((post) => (
                                <Link to={`/blog/${post._id}`} key={post._id}>
                                    <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden group hover:border-blue-500/50 transition-all h-full">
                                        <CardHeader className="p-0">
                                            <div className="aspect-video w-full overflow-hidden">
                                                <img
                                                    src={post.image || "/placeholder.svg"}
                                                    alt={post.name}
                                                    width={400}
                                                    height={225}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardBody className="p-4">
                                            <p className="text-xs text-gray-400 mb-1">{new Date(post?.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}</p>
                                            <h3 className="text-base font-semibold mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
                                                {truncateText(post?.name, 10)}
                                            </h3>
                                            <p className="text-default-400" dangerouslySetInnerHTML={{ __html: truncateText(post.description, 6) }} />
                                        </CardBody>
                                        <CardFooter className="pt-0 pb-3 px-4">
                                            <Chip size="sm" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                {post.category.name}
                                            </Chip>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}

        </PublicLayout>
    )
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const { id } = params;

    if (!id) {
        throw new Response("Task ID not provided", { status: 400 });
    }

    try {
        const blogDetail = await Blog.findById(id).populate("category");

        if (!blogDetail) {
            throw new Error("Blog not found");
        }

        // Find related blogs with the same category, excluding the current blog
        const related = await Blog.find({
            category: blogDetail.category._id, // Match the category ID
            _id: { $ne: blogDetail._id }, // Exclude the current blog
        }).populate("category").limit(3);
        const recentPosts = await Blog.find({}).sort({ createdAt: -1 }).limit(5);



        return json({
            blogDetail, id, related, recentPosts
        });
    } catch (error) {
        console.error("Error fetching task details:", error);
        throw new Response("Internal Server Error", { status: 500 });
    }
};
