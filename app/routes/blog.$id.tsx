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
import { Link, useParams } from "@remix-run/react"
import PublicLayout from "~/layout/PublicLayout"

export default function BlogDetailPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const params = useParams()
    const slug = params.slug

    // This would normally come from a database or API
    const blogPost = {
        slug: slug,
        title:
            slug === "rapid-growth-of-it"
                ? "The rapid growth of IT"
                : "Persons who shall lose their positions as a new Ghanaian...",
        content: `
      <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">The Evolution of Technology</h2>

      <p class="mb-4">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

      <p class="mb-4">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>

      <blockquote class="border-l-4 border-blue-500 pl-4 italic my-6 text-gray-400">
        "The advance of technology is based on making it fit in so that you don't really even notice it, so it's part of everyday life."
        <cite class="block text-sm mt-2 text-gray-500">- Bill Gates</cite>
      </blockquote>

      <h2 class="text-2xl font-bold mt-8 mb-4">Impact on Business</h2>

      <p class="mb-4">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>

      <p class="mb-4">Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Looking to the Future</h2>

      <p class="mb-4">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>

      <p class="mb-4">Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.</p>
    `,
        date: slug === "rapid-growth-of-it" ? "January 7, 2025" : "January 9, 2025",
        author: {
            name: "Dennis Law",
            avatar: "/placeholder.svg?height=100&width=100",
            role: "Technology Analyst",
        },
        image: "https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg",
        category: slug === "rapid-growth-of-it" ? "Technology" : "Business",
        readTime: "5 min read",
    }

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
                            {blogPost.category}
                        </Chip>

                        <h1 className="font-montserrat text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tighter mb-6">
                            {blogPost.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-400">
                            <div className="flex items-center">
                                <Calendar size={16} className="mr-2 text-blue-500" />
                                {blogPost.date}
                            </div>
                            <div className="flex items-center">
                                <User size={16} className="mr-2 text-blue-500" />
                                {blogPost.author.name}
                            </div>
                            <div className="flex items-center">
                                <Tag size={16} className="mr-2 text-blue-500" />
                                {blogPost.readTime}
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
                                src={blogPost.image || "/placeholder.svg"}
                                alt={blogPost.title}
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
                                    <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
                                </article>

                                {/* Tags */}
                                <div className="mt-8 flex flex-wrap gap-2">
                                    {["Technology", "IT", "Digital Transformation", "Business"].map((tag) => (
                                        <Chip key={tag} size="sm" className="bg-gray-800 text-gray-300">
                                            {tag}
                                        </Chip>
                                    ))}
                                </div>

                                {/* Author Bio */}
                                <div className="mt-12 p-6 bg-gray-900/30 rounded-xl border border-blue-900/20">
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
                                </div>

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
                                        {relatedPosts.slice(0, 2).map((post) => (
                                            <Link to={`/blog/${post.slug}`} key={post.id}>
                                                <div className="group flex gap-4 items-start">
                                                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={post.image || "/placeholder.svg"}
                                                            alt={post.title}
                                                            width={64}
                                                            height={64}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium group-hover:text-blue-500 transition-colors line-clamp-2">
                                                            {post.title}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 mt-1">{post.date}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    <Divider className="my-6 bg-gray-800" />

                                    <h3 className="text-lg font-semibold mb-4">Categories</h3>
                                    <div className="space-y-2">
                                        {["Technology", "Business", "Digital", "Legal", "Marketing"].map((category) => (
                                            <Link to="#" key={category}>
                                                <div className="flex justify-between items-center py-2 hover:text-blue-500 transition-colors">
                                                    <span>{category}</span>
                                                    <span className="text-sm text-gray-500">12</span>
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
                            {relatedPosts.map((post) => (
                                <Link to={`/blog/${post.slug}`} key={post.id}>
                                    <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden group hover:border-blue-500/50 transition-all h-full">
                                        <CardHeader className="p-0">
                                            <div className="aspect-video w-full overflow-hidden">
                                                <img
                                                    src={post.image || "/placeholder.svg"}
                                                    alt={post.title}
                                                    width={400}
                                                    height={225}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardBody className="p-4">
                                            <p className="text-xs text-gray-400 mb-1">{post.date}</p>
                                            <h3 className="text-base font-semibold mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-400 text-xs line-clamp-2">{post.excerpt}</p>
                                        </CardBody>
                                        <CardFooter className="pt-0 pb-3 px-4">
                                            <Chip size="sm" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                {post.category}
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
