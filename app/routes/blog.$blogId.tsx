// routes/blog/$blogId.tsx
import { useParams } from "@remix-run/react";
import PublicLayout from "~/components/PublicLayout";

const BlogDetail = () => {
    const { blogId } = useParams();
    const blog = {
        id: blogId,
        title: "Rethinking Server-Timing As A Critical Monitoring Tool",
        description: "Complete detailed content of the blog goes here...",
        content: "This is the full blog content. You can add HTML or markdown...",
        category: "Tech",
    };

    const relatedBlogs = [
        {
            title: "Understanding JavaScript Closures",
            category: "JavaScript",
        },
        {
            title: "Exploring AI in Modern Web Development",
            category: "AI",
        },
        // Additional related blogs
    ];

    return (
        <PublicLayout>
            <div className="mt-20 lg:px-80 px-4">
                <p className="font-montserrat font-bold text-4xl text-white text-center">{blog.title}</p>
                <p className="text-white text-center mt-4 font-nunito">{blog.category}</p>
            </div>

            <div className="lg:px-40 px-4 mt-10">
                <p className="text-white">{blog.content}</p>
                <div className="mt-6">
                    <p className="text-white font-bold">Related Blogs</p>
                    <div className="flex gap-4 mt-4">
                        {relatedBlogs.map((relatedBlog, index) => (
                            <div key={index} className="bg-[#1c1e22] text-white px-4 py-2 rounded-lg">
                                {relatedBlog.title}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default BlogDetail;
