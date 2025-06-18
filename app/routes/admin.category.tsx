import React, { useState, useEffect } from "react";
import { Button, Input, Textarea, TableRow, TableCell, Tooltip, Skeleton } from "@nextui-org/react";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import { Search, Edit, Trash2, ArrowLeft, X } from "lucide-react";
import CreateModal from "~/components/modal/createModal";
import EditModal from "~/components/modal/EditModal";
import { CategoryColumns } from "~/components/table/columns";
import CustomTable from "~/components/table/table";
import { errorToast, successToast } from "~/components/toast";
import AdminLayout from "~/layout/adminLayout";
import ViewModal from "~/components/modal/viewModal";
import ConfirmModal from "~/components/modal/confirmModal";
import { getSession } from "~/session";
import NewCustomTable from "~/components/table/newTable";
import { CategoryInterface } from "~/interface/interface";
import category from "~/controller/categoryController";
import usersController from "~/controller/Users";
import CustomInput from "~/components/ui/CustomInput";
import { Plus } from "lucide-react";
import Drawer from "~/components/modal/drawer";

type SessionData = {
    sessionId: {
        _id: string;
    };
};

const Category = () => {
    const { categories, user, totalPages } = useLoaderData<{ categories: CategoryInterface[], user: { user: string }, totalPages: number | any }>()
    const actionData = useActionData<any>()
    const [rowsPerPage, setRowsPerPage] = useState(13);
    const submit = useSubmit()
    const [editModalOpened, setEditModalOpened] = useState(false)
    const [dataValue, setDataValue] = useState<CategoryInterface>();
    const [createModalOpened, setCreateModalOpened] = useState(false)
    const [viewModalOpened, setViewModalOpened] = useState(false)
    const [confirmModalOpened, setConfirmModalOpened] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const navigation = useNavigation()



    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
    };
    const handleEditModalClose = () => {
        setEditModalOpened(false);
    };

    const handleViewModalClosed = () => {
        setViewModalOpened(false)
    }

    const handleConfirmModalClosed = () => {
        setConfirmModalOpened(false)
    }

    const handleCreateModalClosed = () => {
        setCreateModalOpened(false)
    }
    const handleClick = () => {
        setCreateModalOpened(true)
    }



    useEffect(() => {
        const timeOut = setTimeout(() => {
            setIsLoading(true)
        }, 1000)

        return () => clearTimeout(timeOut)
    }, [])

    useEffect(() => {
        if (actionData?.success) {
            successToast(actionData?.message)
            setCreateModalOpened(false)
            setEditModalOpened(false)
            setConfirmModalOpened(false)
        }
        if (actionData?.error) {
            errorToast(actionData?.message)
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
                            <h1 className="text-2xl font-bold text-white">Blog Categories</h1>
                            <p className="text-gray-300 mt-1">Manage blog post categories</p>
                        </div>
                        <Button className="border text-white border-white/20 px-4 py-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                            setCreateModalOpened(true)
                        }}>
                            <Plus />
                            Create Category
                        </Button>
                    </div>
                </div>
                
                {/* Table */}
                    <NewCustomTable
                        columns={CategoryColumns}
                        loadingState={navigation.state === "loading" ? "loading" : "idle"}
                        totalPages={totalPages}
                        page={1}
                        setPage={(page) => (
                            navigate(`?page=${page}`)
                        )}>
                        {categories.map((categories: CategoryInterface, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{categories.name}</TableCell>
                                <TableCell>{categories.description}</TableCell>
                                <TableCell className="relative flex items-center gap-4">
                                    <button  onClick={() => {
                                        setEditModalOpened(true)
                                        setDataValue(categories)

                                    }}>
                                        <Edit className="w-4 h-4 text-primary" />
                                    </button >
                                    <button onClick={() => {
                                        setDataValue(categories)
                                        setConfirmModalOpened(true)
                                    }}>
                                        <Trash2 className="w-4 h-4 text-danger" />
                                    </button>

                                </TableCell>
                            </TableRow>
                        ))}
                    </NewCustomTable>

                {dataValue && (
                    <Drawer title="Edit Category" isDrawerOpened={editModalOpened} handleDrawerClosed={handleEditModalClose}>
                        <Form method="post" className="p-4">
                            <CustomInput
                                label="Name"
                                name="name"
                                defaultValue={setDataValue?.name}
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                                
                            />
                            <input name="seller" value={user?._id} type="hidden" />
                            <input name="intent" value="update" type="hidden" />
                            <input name="id" value={dataValue?._id} type="hidden" />
                            <Textarea
                                label="Product description"
                                labelPlacement="outside"
                                placeholder=" "
                                name="description"
                                className="mt-4 font-nunito text-sm"
                                defaultValue={dataValue?.description}
                                classNames={{
                                    label: "font-nunito text-sm !text-white",
                                    inputWrapper: " bg-dashboard-secondary shadow-sm   border border-white/20 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-pink-500  hover:transition-all hover:duration-300 hover:ease-in-out max-w-full"
                                }}
                            />



                            <button onClick={() => {
                            }} type="submit" className="mt-10 h-10 text-white bg-action-primary rounded-xl font-nunito px-4">
                                Update
                            </button>
                        </Form>
                    </Drawer>
                )}


                <ConfirmModal
                    content="Are you sure to delete category" header="Comfirm Delete" isOpen={confirmModalOpened} onOpenChange={handleConfirmModalClosed}>
                    <div className="flex gap-4">
                        <Button size="sm" color="danger" className="font-montserrat font-semibold" onPress={handleConfirmModalClosed}>
                            No
                        </Button>
                        <Button size="sm" color="primary" className="font-montserrat font-semibold" onClick={() => {
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

                <Drawer isDrawerOpened={createModalOpened} handleDrawerClosed={handleCreateModalClosed} title="Create New Category"
                >
                    <Form method="post" className="p-4">
                        <CustomInput
                            label="Name"
                            name="name"
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"

                        />
                        <input hidden name="seller" value={user?._id} type="" />
                        <input hidden name="intent" value="create" type="" />

                        <Textarea
                            autoFocus
                            label="Category description"
                            labelPlacement="outside"
                            placeholder=" "
                            name="description"
                            className="mt-4 font-nunito text-sm"
                            classNames={{
                                label: "font-nunito text-sm !text-white",
                                inputWrapper: " bg-dashboard-secondary shadow-sm   border border-white/20 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-pink-500  hover:transition-all hover:duration-300 hover:ease-in-out max-w-full"
                            }}
                        />


                        <button onClick={() => {
                        }} type="submit" className="mt-10 h-10 text-white bg-action-primary rounded-xl font-nunito px-4">
                            Submit
                        </button>
                    </Form>
                </Drawer>



            </div>
        </AdminLayout>
    );
};

export default Category;

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") as string;

    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");
    if (!token) {
        return redirect("/")
    }

    const { categories, user, totalPages } = await category.getCategories({ request, page, search_term })
    return { categories, user, totalPages }
};

export const action: ActionFunction = async ({ request }) => {
    try {
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const seller = formData.get("seller") as string;
        const description = formData.get("description") as string;
        const id = formData.get("id") as string;
        const intent = formData.get("intent") as string;



        switch (intent) {
            case 'create':
                const categories = await category.CategoryAdd(request, name, description, seller, intent, id);
                return categories;
            case "logout":
                const logout = await usersController.logout(intent)
                return logout
            case "delete":
                const deleteCat = await category.DeleteCat(intent, id)
                return deleteCat
            case "update":
                const updateCat = await category.UpdateCat({
                    intent,
                    id,
                    name,
                    description
                })
                return updateCat
            default:
                break;
        }

    } catch (error: any) {
        return json({ message: error.message, success: false }, { status: 500 });
    }
};
