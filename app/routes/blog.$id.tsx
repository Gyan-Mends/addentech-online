import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import PublicLayout from "~/components/PublicLayout";
import blog from "~/controller/blog";
import { BlogInterface } from "~/interface/interface";

const BlogDetail = () => {
    const { blog } = useLoaderData<{ blog: BlogInterface }>();

    return (
        <PublicLayout>
            <div className="mt-20 lg:px-80 px-4">
                <p className="font-montserrat font-bold text-4xl dark:text-white text-center">{blog.name}</p>
                <p className="dark:text-gray-400 text-center mt-4 font-nunito">{blog.category.name}</p>
            </div>
            <div className="lg:px-40 px-4 mt-10">
                <img
                    src={blog.image}
                    alt={blog.name}
                    className="w-full h-96 object-cover rounded-lg"
                />
                <p className="dark:text-white text-justify mt-6 font-nunito">{blog.description}</p>
                <div className="mt-6">
                    <p className="text-gray-500">Uploaded By: {blog.admin?.firstName}</p>
                    <p className="text-gray-500">Published At: {blog.createdAt}</p>
                </div>
            </div>
        </PublicLayout>
    );
};

export default BlogDetail;

export const loader: LoaderFunction = async ({ params }) => {
    const { id } = params;

    if (!id) {
        throw new Response("Not Found", { status: 404 });
    }

    const blogDetail = await blog.getBlogs({ id });

    if (!blogDetail) {
        throw new Response("Blog not found", { status: 404 });
    }

    return json({ blog: blogDetail });
};
