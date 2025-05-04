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
    Input,
    Select,
    SelectItem,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Switch,
    Chip,
} from "@nextui-org/react"
import { Search, MapPin, Phone, Mail } from "lucide-react"
import PublicLayout from "~/layout/PublicLayout"
import { Link } from "@remix-run/react"

export default function BlogPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const blogPosts = [
        {
            id: 1,
            slug: "rapid-growth-of-it",
            title: "The rapid growth of IT",
            excerpt: "Exploring the exponential growth of information technology in modern business...",
            date: "January 7, 2025",
            image: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
            category: "Technology",
        },
        {
            id: 2,
            slug: "persons-who-shall-lose-positions",
            title: "Persons who shall lose their positions as a new Ghanaian...",
            excerpt: "An analysis of the changing employment landscape in Ghana's evolving economy...",
            date: "January 9, 2025",
            image: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
            category: "Business",
        },
        {
            id: 3,
            slug: "digital-transformation-strategies",
            title: "Digital Transformation Strategies for 2025",
            excerpt: "Key strategies businesses should adopt to stay competitive in the digital age...",
            date: "January 12, 2025",
            image: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
            category: "Digital",
        },
        {
            id: 4,
            slug: "ai-in-legal-practice",
            title: "The Impact of AI on Legal Practice",
            excerpt: "How artificial intelligence is revolutionizing the legal industry...",
            date: "January 15, 2025",
            image: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
            category: "Technology",
        },
    ]

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "technology", label: "Technology" },
        { value: "business", label: "Business" },
        { value: "digital", label: "Digital" },
        { value: "legal", label: "Legal" },
    ]

    const filteredPosts = blogPosts.filter(
        (post) =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (


        <PublicLayout>
            {/* Hero Section */}
            <section className="py-20 md:py-28 bg-gradient-to-br from-black to-gray-900 relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-6">
                            News & Articles
                        </h1>
                        <p className="text-xl text-gray-400 font-nunito">Stay informed with the latest updates...</p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
            </section>

            {/* Search and Filter Section */}
            <section className="py-12 bg-black font-nuito lg:px-[90px]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <Input
                                type="text"
                                placeholder="Search articles..."
                                startContent={<Search className="text-gray-400" size={18} />}
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                classNames={{
                                    base: "bg-gray-900/50 border-blue-900/40 rounded-lg",
                                    inputWrapper: "bg-transparent hover:bg-gray-900/80 focus-within:bg-gray-900/80",
                                }}
                            />
                        </div>
                        <div className="w-full md:w-1/3 lg:w-1/4">
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
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="py-12 bg-black font-nunito lg:px-[90px]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post) => (
                            <Link to={`/blog/${post.slug}`} key={post.id}>
                                <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden group hover:border-blue-500/50 transition-all h-full">
                                    <CardHeader className="p-0">
                                        <div className="aspect-video w-full overflow-hidden">
                                            <img
                                                src={post.image || "/placeholder.svg"}
                                                alt={post.title}
                                                width={600}
                                                height={400}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardBody className="p-6">
                                        <p className="text-sm text-gray-400 mb-2">{post.date}</p>
                                        <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-500 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm line-clamp-3">{post.excerpt}</p>
                                    </CardBody>
                                    <CardFooter className="pt-0 pb-4 px-6">
                                        <Chip size="sm" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                            {post.category}
                                        </Chip>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-blue-900/40 bg-gradient-to-r from-blue-950/50 to-gray-900/50 p-8 md:p-12 relative overflow-hidden">
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
                                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">Contact us</Button>
                                <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">Learn More</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>


    )
}
