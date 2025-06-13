import { Button, Select, SelectItem, TableCell, TableRow, User } from "@nextui-org/react"
import { ActionFunction, json, LinksFunction, LoaderFunction, MetaFunction, } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react"
import { Plus, Upload } from "lucide-react"
import { log } from "node:console"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import { DeleteIcon } from "~/components/icons/DeleteIcon"
import { EditIcon } from "~/components/icons/EditIcon"
import { FileUploader } from "~/components/icons/uploader"
import ConfirmModal from "~/components/modal/confirmModal"
import Drawer from "~/components/modal/drawer"
import { BlogColumns } from "~/components/table/columns"
import NewCustomTable from "~/components/table/newTable"
import { errorToast, successToast } from "~/components/toast"
import CustomInput from "~/components/ui/CustomInput"
import blog from "~/controller/blog"
import category from "~/controller/categoryController"
import usersController from "~/controller/Users"
import { BlogInterface, CategoryInterface, RegistrationInterface } from "~/interface/interface"
import AdminLayout from "~/layout/adminLayout"
import { getSession } from "~/session"
export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" }];
};

const Users = () => {
    const [isCreateModalOpened, setIsCreateModalOpened] = useState(false)
    const [base64Image, setBase64Image] = useState<any>()
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false)
    const [isEditModalOpened, setIsEditModalOpened] = useState(false)
    const [dataValue, setDataValue] = useState<BlogInterface>()
    const submit = useSubmit()
    const navigate = useNavigate()
    const actionData = useActionData()
    const [content, setContent] = useState("");
    const navigation = useNavigation()
    const [categoryValue, setCategoryValue] = useState("")
    const {
        user,
        blogs,
        totalPages,
        categories
    } = useLoaderData<{
        user: { _id: string },
        blogs: BlogInterface[],
        totalPages: number,
        categories: CategoryInterface[]
    }>()

    const handleCreateModalClosed = () => {
        setIsCreateModalOpened(false)
    }

    const handleConfirmModalClosed = () => {
        setIsConfirmModalOpened(false)
    }
    const handleEditModalClosed = () => {
        setIsEditModalOpened(false)
    }


    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
        }
        return text;
    };
    const ReactQuill = typeof window === "object" ? require("react-quill") : () => false
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    useEffect(() => {
        // Set the initial content from dataValue.description
        if (dataValue?.description) {
            setContent(dataValue.description);
        }
    }, [dataValue]);

    useEffect(() => {
        // Set the initial content from dataValue.description
        if (dataValue?.category) {
            setCategoryValue(dataValue.category._id);
        }
    }, [dataValue]);


    useEffect(() => {
        if (dataValue?.image) {
            setBase64Image(dataValue.image); // Set the image from the database as the initial value
        }
    }, [dataValue]);


    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message)
                setIsCreateModalOpened(false)
                setIsConfirmModalOpened(false)
                setIsEditModalOpened(false)
            } else {
                errorToast(actionData.message)
            }
        }
    }, [actionData])


    return (
        <AdminLayout>
            <div className="space-y-6 !text-white">
                <Toaster position="top-right" />
                
                {/* Header */}
                <div className="bg-color-dark-2 border border-white/10 p-6 rounded-xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Blog Management</h1>
                            <p className="text-gray-300 mt-1">Create and manage blog posts</p>
                        </div>
                        <Button className="border text-white border-white/20 px-4 py-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                            setIsCreateModalOpened(true)
                        }}>
                            <Plus />
                            Create Blog
                        </Button>
                    </div>
                </div>
                
                {/* Table */}
                <div className="bg-color-dark-2 border border-white/10 rounded-xl p-6">
                    <NewCustomTable
                        columns={BlogColumns}
                        loadingState={navigation.state === "loading" ? "loading" : "idle"}
                        totalPages={totalPages}
                        page={1}
                        setPage={(page) => (
                            navigate(`?page=${page}`)
                        )}>
                        {blogs?.map((blog: BlogInterface, index: number) => (
                            <TableRow key={index}>
                                <TableCell className="text-xs">
                                    <p className="!text-xs">
                                        <User
                                            avatarProps={{ radius: "sm", src: blog?.image }}
                                            name={
                                                <p className="font-nunito text-xs">
                                                    {truncateText(blog?.name, 10)}
                                                </p>
                                            }
                                        />
                                    </p>
                                </TableCell>
                                <TableCell className="text-xs">{blog.category?.name}</TableCell>
                                <TableCell className="text-xs">{blog._id}</TableCell>
                                <TableCell>
                                    <div dangerouslySetInnerHTML={{ __html: truncateText(blog.description, 15) }} />
                                </TableCell>
                                <TableCell className="relative flex items-center gap-4 text-primary">
                                    <button onClick={() => {

                                        setIsEditModalOpened(true)
                                        setDataValue(blog)
                                    }}>
                                        <EditIcon className="text-primary" />
                                    </button>
                                    <button onClick={() => {
                                        setIsConfirmModalOpened(true)
                                        setDataValue(blog)
                                    }}>
                                        <DeleteIcon className="text-danger" />
                                    </button>

                                </TableCell>
                            </TableRow>
                        ))}
                    </NewCustomTable>
                </div>
            </div>

            {/* confirm modal */}
            {/* confirm modal */}
            <ConfirmModal header="Confirm Delete" content="Are you sure to delete user?" isOpen={isConfirmModalOpened} onOpenChange={handleConfirmModalClosed}>
                <div className="flex gap-4">
                    <Button color="success" variant="flat" className="font-montserrat font-semibold" size="sm" onPress={handleConfirmModalClosed}>
                        No
                    </Button>
                    <Button color="danger" variant="flat" className="font-montserrat font-semibold " size="sm" onClick={() => {
                        setIsConfirmModalOpened(false)
                        if (dataValue) {
                            submit({
                                intent: "delete",
                                id: dataValue?._id
                            }, {
                                method: "post"
                            })
                        }
                    }} >
                        Yes
                    </Button>
                </div>
            </ConfirmModal>


            {dataValue && (
                <Drawer isDrawerOpened={isEditModalOpened} handleDrawerClosed={handleEditModalClosed} title="Edit Blog">
                    <Form method="post" className="flex flex-col gap-4 p-4">
                        <CustomInput
                            label="Name"
                            isRequired
                            isClearable
                            defaultValue={dataValue?.name}
                            name="name"
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />

                        <div className="">
                            <Select
                                label="Category"
                                labelPlacement="outside"
                                selectedKeys={categoryValue ? [categoryValue] : []}
                                onSelectionChange={(keys) => {
                                    const selectedKey = Array.from(keys)[0];
                                    if (selectedKey) {
                                        setCategoryValue(selectedKey as string);
                                    }
                                }}
                                placeholder=" "
                                isRequired
                                name="category"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] focus-bg-white bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-[#333]  border border-black/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full"
                                }}
                            >
                                {categories.map((cat) => (
                                    <SelectItem key={cat._id} value={cat._id}>
                                        {cat?.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <label htmlFor="" className="font-nunito">Subject</label>
                            <input type="hidden" name="description" value={content} />
                            <ReactQuill
                                value={content} // Bind editor content to state
                                onChange={setContent} // Update state on change
                                modules={modules}
                                className="md:!h-[30vh] mt-2 font-nunito rounded w-full mb-12 !font-nunito"
                            />
                        </div>



                        <div className="lg:mt-10  ">
                            <input name="base64Image" value={base64Image} type="hidden" />
                            <label className="font-nunito block text-sm !text-black" htmlFor="image">
                                Image
                            </label>
                            <div className="relative inline-block w-40 h-40 border-2 border-dashed border-gray-400 rounded-xl dark:border-white/30 mt-2">
                                {/* The file input */}
                                <input
                                    name="image"
                                    id="image"
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setBase64Image(reader.result as string); // Update state with new image data
                                            };
                                            reader.readAsDataURL(file); // Convert file to base64
                                        }
                                    }}
                                />
                                {/* Display the default image or the uploaded image */}
                                {base64Image ? (
                                    <img
                                        src={base64Image}
                                        alt="Preview"
                                        className="absolute inset-0 w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                        <Upload className="h-14 w-14 text-gray-400" />
                                    </span>
                                )}
                            </div>
                        </div>
                        <input hidden name="admin" value={user?._id} type="" />
                        <input name="intent" value="update" type="hidden" />
                        <input name="base64Image" value={base64Image} type="hidden" />
                        <input hidden name="id" value={dataValue?._id} type="text" />


                        <div className="flex gap-6 mt-6">
                            <button className="font-montserrat w-40 bg-pink-500 text-white h-10 rounded-lg">Upload blog</button>
                        </div>
                    </Form>
                </Drawer>
            )}

            {/* Create Modal */}


            <Drawer isDrawerOpened={isCreateModalOpened} handleDrawerClosed={handleCreateModalClosed} title="Create New Blog" fullscreen={true}>
                <Form method="post" className="flex flex-col gap-4 p-4 lg:px-80">
                   <div className="grid grid-cols-2 gap-4 w-full">
                   <CustomInput
                        label="Title"
                        isRequired
                        isClearable
                        name="name"
                        placeholder=" "
                        type="text"
                        labelPlacement="outside"
                    />

                    <div className="">
                        <Select
                            label="Category"
                            labelPlacement="outside"
                            placeholder="Select a category"
                            isRequired
                            name="category"
                            classNames={{
                                label: "font-nunito text-sm text-default-100",
                                popoverContent: "z-[1000] focus:bg-white bg-white shadow-lg",
                                trigger: "bg-white shadow-sm border border-gray-300 hover:border-primary focus:border-primary",
                            }}
                        >
                            {
                                categories.map((category: CategoryInterface) => (
                                    <SelectItem key={category._id} value={category._id}>
                                        {category.name}
                                    </SelectItem>
                                ))
                            }
                        </Select>

                    </div>
                   </div>

                    <div>
                        <label htmlFor="" className="font-nunito">Subject</label>
                        <input type="hidden" name="description" value={content} />
                        <ReactQuill
                            value={content}
                            onChange={setContent}

                            modules={modules}
                            className='md:!h-[40vh] mt-2 font-nunito  w-full mb-12 !font-nunito !rounded'
                        />
                    </div>



                    <div className="mt-14 ">
                        <label className="font-nunito block text-sm" htmlFor="">Image</label>
                        <div className="relative inline-block w-40 h-40 border-2 border-dashed border-gray-600 rounded-xl dark:border-white/30 mt-2">
                            <input
                                name="image"
                                required
                                placeholder=" "
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                type="file"
                                onChange={(event: any) => {
                                    const file = event.target.files[0];
                                    if (file) {
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                            setBase64Image(reader.result)
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }}
                            />
                            {base64Image ? (
                                <img
                                    src={base64Image}
                                    alt="Preview"
                                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                    <FileUploader className="h-20 w-20 text-white" />
                                </span>
                            )}
                        </div>
                    </div>

                    <input hidden name="admin" value={user?._id} type="" />
                    <input name="intent" value="create" type="hidden" />
                    <input name="base64Image" value={base64Image} type="hidden" />

                    <div className="flex gap-6 mt-6">
                        <button className="font-montserrat w-40 bg-pink-500 text-white h-10 rounded-lg">Upload blog</button>
                    </div>
                </Form>
            </Drawer>
        </AdminLayout>
    )
}

export default Users

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const base64Image = formData.get("base64Image") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const admin = formData.get("admin") as string;
    const intent = formData.get("intent") as string;
    const id = formData.get("id") as string;
    console.log(id);
    console.log(admin);


    switch (intent) {
        case "create":
            const user = await blog.BlogAdd({
                name,
                base64Image,
                category,
                description,
                admin
            })
            return user

        case "delete":
            const deleteUser = await blog.DeleteBlog({
                intent,
                id
            })
            return deleteUser

        case "update":
            const updateUser = await blog.UpdateCat({
                name,
                base64Image,
                category,
                description,
                admin,
                id
            })
            return updateUser
        case "logout":
            const logout = await usersController.logout(intent)
            return logout
        default:
            return json({
                message: "Bad request",
                success: false,
                status: 400
            })
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") as string;

    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");
    // if (!token) {
    //     return redirect("/")
    // }
    const { user, blogs, totalPages } = await blog.getBlogs({
        request,
        page,
        search_term
    });

    const { categories } = await category.getCategories({ request, page, search_term })

    return json({ user, blogs, totalPages, categories });
}

export const meta: MetaFunction = () => {
    return [
        { title: "Sales | Point of Sale" },
        {
            name: "description",
            content: ".",
        },
        {
            name: "author",
            content: "MendsGyan",
        },
        { name: "og:title", content: "Point of Sale" },
        {
            name: "og:description",
            content: "",
        },
        {
            name: "og:image",
            content:
                "https://res.cloudinary.com/app-deity/image/upload/v1701282976/qfdbysyu0wqeugtcq9wq.jpg",
        },
        { name: "og:url", content: "https://marry-right.vercel.app" },
        {
            name: "keywords",
            content:
                "point of sales in Ghana, online shops, sales, e-commerce",
        },
    ];
};