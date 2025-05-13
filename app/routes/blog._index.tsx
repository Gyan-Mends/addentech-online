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
import { Search } from "lucide-react"
import PublicLayout from "~/layout/PublicLayout"
import { Link, useLoaderData } from "@remix-run/react"
import { json, LoaderFunction } from "@remix-run/node"
import blog from "~/controller/blog"
import { BlogInterface } from "~/interface/interface"
import ScrollAnimation from "~/components/animation"

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const { blogs } = useLoaderData<{
        blogs: BlogInterface[];
    }>();

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
        }
        return text;
    };


    return (


        <PublicLayout>
            {/* Hero Section */}
            <section className="py-20 md:py-28 bg-gray-100 relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
                <ScrollAnimation>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-3xl mx-auto text-center">
                            <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                            News & Articles
                        </h1>
                        <p className="text-xl text-gray-400 font-nunito">Stay informed with the latest updates...</p>
                    </div>
                </div>
                </ScrollAnimation>
            </section>

            {/* Search and Filter Section */}
            <section className="py-12  font-nuito lg:px-[90px]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <Input
                                type="text"
                                placeholder="Search articles..."
                                startContent={<Search className="text-pink-500" size={18} />}
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                classNames={{
                                    base: "bg-gray-900/50 border-blue-900/40 rounded-lg",
                                    inputWrapper: "bg-white hover:bg-gray-900/80 shadow-sm focus-within:bg-gray-900/80",
                                }}
                            />
                        </div>
                        {/* <div className="w-full md:w-1/3 lg:w-1/4">
                            <Select
                                placeholder="All Categories"
                                className="bg-gray-900/50 border-blue-900/40 rounded-lg"
                                classNames={{
                                    trigger: "bg-transparent hover:bg-gray-900/80 focus-within:bg-gray-900/80",
                                    listbox: "bg-gray-900 border-blue-900/40",
                                }}
                                items={categories}
                            >
                                {(category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                        {category.label}
                                    </SelectItem>
                                )}
                            </Select>
                        </div> */}
                    </div>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="py-12  font-nunito lg:px-[90px]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((post) => (
                            <Link to={`/blog/${post._id}`} key={post._id}>
                                <Card className="border-blue-900/40  overflow-hidden group hover:border-blue-500/50 transition-all h-full">
                                    <CardHeader className="p-0">
                                        <div className="aspect-video w-full overflow-hidden">
                                            <img
                                                src={post.image}
                                                alt={post.name}
                                                width={600}
                                                height={400}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardBody className="p-6">
                                        <p className="font-nunito text-default-300 mb-2"> {new Date(post?.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}</p>
                                        <h3 className="text-xl font-semibold mb-3 transition-colors line-clamp-2">
                                            {post.name}
                                        </h3>
                                        <div
                                            className="text-gray-400 text-sm line-clamp-3"
                                            dangerouslySetInnerHTML={{ __html: truncateText(post?.description, 10) }}
                                        ></div>

                                    </CardBody>
                                    <CardFooter className="pt-0 pb-4 px-6">
                                        <Chip size="sm" className="bg-blue-pink/10 text-pink-500 border-blue-pink/20">
                                            {post.category.name}
                                        </Chip>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-black/20 bg-white shadow-md p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>
                        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">Transform your business with us effortlessly</h2>
                                <p className="text-gray-400 max-w-2xl">
                                    Ready to take your business to the next level? Our team of experts is here to help you achieve your
                                    goals.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">Contact us</Button>
                                <Button className=" ">Learn More</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
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
