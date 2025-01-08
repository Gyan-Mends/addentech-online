import React, { useState, useEffect } from "react";
import { Button, Input, Textarea, TableRow, TableCell, Tooltip, Skeleton } from "@nextui-org/react";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import PlusIcon from "~/components/icons/PlusIcon";
import { SearchIcon } from "~/components/icons/SearchIcon";
import CreateModal from "~/components/modal/createModal";
import EditModal from "~/components/modal/EditModal";
import { CategoryColumns } from "~/components/table/columns";
import CustomTable from "~/components/table/table";
import { errorToast, successToast } from "~/components/toast";
import AdminLayout from "~/layout/adminLayout";
import ViewModal from "~/components/modal/viewModal";
import ConfirmModal from "~/components/modal/confirmModal";
import { EditIcon } from "~/components/icons/EditIcon";
import { DeleteIcon } from "~/components/icons/DeleteIcon";
import { getSession } from "~/session";
import BackIcon from "~/components/icons/BackIcon";
import NewCustomTable from "~/components/table/newTable";
import { CategoryInterface, DepartmentInterface } from "~/interface/interface";
import category from "~/controller/categoryController";
import usersController from "~/controller/Users";
import department from "~/controller/departments";

type SessionData = {
    sessionId: {
        _id: string;
    };
};

const Category = () => {
    const { departments, user, totalPages } = useLoaderData<{ departments: DepartmentInterface[], user: { user: string }, totalPages: number | any }>()
    const actionData = useActionData<any>()
    const [rowsPerPage, setRowsPerPage] = useState(13);
    const submit = useSubmit()
    const [editModalOpened, setEditModalOpened] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<CategoryInterface>();
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

    const handleCreateModalOpened = () => {
        setCreateModalOpened(false)
    }




    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message)
            } else {
                errorToast(actionData.message)
            }
        }
    }, [actionData])

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setIsLoading(true)
        }, 1000)

        return () => clearTimeout(timeOut)
    }, [])

    return (
        <AdminLayout pageName="Departments">
            <div className="flex z-0 mt-6 justify-between gap-2 overflow-y-hidden">
                <Toaster position="top-right" />
                <div className="flex items-center justify-center gap-2">
                    {/* back */}
                    {/* back */}
                    <Button size="sm" onClick={() => {
                        navigate(-1)
                    }} color="primary" className="font-nunito text-sm  border-b-white dark:border-primary  dark:text-white dark:bg-[#333]">
                        <BackIcon className="h-[20px] w-[20px] dark:text-[#05ECF2]" /><p >Back</p>
                    </Button>
                </div>
                <div className="flex gap-4">
                    {/* search */}
                    {/* search */}
                    <Input
                        size="sm"
                        placeholder="Search user..."
                        startContent={<SearchIcon className="" />}
                        onValueChange={(value) => {
                            const timeoutId = setTimeout(() => {
                                navigate(`?search_term=${value}`);
                            }, 100);
                            return () => clearTimeout(timeoutId);
                        }} classNames={{
                            inputWrapper: "bg-white shadow-sm text-sm font-nunito dark:bg-[#333] border border-white/5 ",
                        }}
                    />
                    {/* button to add new user */}
                    {/* button to add new user */}
                    <Button size="sm"
                        variant="flat"
                        onClick={() => {
                            setCreateModalOpened(true)
                        }}
                        className="font-nunito dark:bg-[#333]  text-sm px-8">
                        <PlusIcon className="" /> New Department
                    </Button>
                </div>
            </div>

            <div className="">
                <NewCustomTable
                    columns={CategoryColumns}
                    loadingState={navigation.state === "loading" ? "loading" : "idle"}
                    totalPages={totalPages}
                    page={1}
                    setPage={(page) => (
                        navigate(`?page=${page}`)
                    )}>
                    {departments.map((categories: DepartmentInterface, index: number) => (
                        <TableRow key={index}>
                            <TableCell>{categories.name}</TableCell>
                            <TableCell>{categories.description}</TableCell>
                            <TableCell className="relative flex items-center gap-4">
                                <Button size="sm" color="success" variant="flat" onClick={() => {
                                    setEditModalOpened(true)
                                    setSelectedCategory(categories)

                                }}>
                                    <EditIcon /> Edit
                                </Button >
                                <Button size="sm" color="danger" variant="flat" onClick={() => {
                                    setSelectedCategory(categories)
                                    setConfirmModalOpened(true)
                                }}>
                                    <DeleteIcon /> Delete
                                </Button>

                            </TableCell>
                        </TableRow>
                    ))}
                </NewCustomTable>
            </div>

            <EditModal
                className="dark:bg-slate-950 bg-gray-200"
                modalTitle="Edit Department"
                isOpen={editModalOpened}
                onOpenChange={handleEditModalClose}
            >
                {(onClose) => (
                    <Form method="post">
                        <Input
                            label="Name"
                            name="name"
                            defaultValue={selectedCategory?.name}
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                            classNames={{
                                label: "font-nunito text-sm text-default-100",
                                inputWrapper: "bg-white shadow-sm dark:bg-[#333] border border-white/30 focus:bg-[#333] "
                            }}
                        />
                        <input name="seller" value={user?._id} type="hidden" />
                        <input name="intent" value="update" type="hidden" />
                        <input name="id" value={selectedCategory?._id} type="hidden" />

                        <Textarea
                            autoFocus
                            label="Department description"
                            labelPlacement="outside"
                            placeholder=" "
                            name="description"
                            className="mt-4 font-nunito text-sm"
                            defaultValue={selectedCategory?.description}
                            classNames={{
                                label: "font-nunito text-sm text-default-100",
                                inputWrapper: "bg-white shadow-sm dark:bg-[#333] border border-white/30 focus:bg-[#333] "
                            }}
                        />


                        <div className="flex justify-end gap-2 mt-10 font-nunito">
                            <Button color="danger" onPress={onClose}>
                                Close
                            </Button>
                            <button type="submit" className="text-white bg-primary-400 rounded-xl font-nunito px-4">
                                Submit
                            </button>
                        </div>
                    </Form>
                )}
            </EditModal>


            <ViewModal className="" modalTitle="Category Dateails" isOpen={viewModalOpened} onOpenChange={handleViewModalClosed}>
                <div >
                    <p className="font-nunito text-md">Category Name</p>
                    <p>{selectedCategory?.name}</p>

                    <p className="font-nunito text-md mt-6">Department Description</p>
                    <p>{selectedCategory?.description}</p>

                </div>
            </ViewModal>

            <ConfirmModal className="dark:bg-slate-950 bg-gray-200"
                content="Are you sure to delete department" header="Comfirm Delete" isOpen={confirmModalOpened} onOpenChange={handleConfirmModalClosed}>
                <div className="flex gap-4">
                    <Button size="sm" color="danger" className="font-montserrat font-semibold" onPress={handleConfirmModalClosed}>
                        No
                    </Button>
                    <Button size="sm" color="primary" className="font-montserrat font-semibold" onClick={() => {
                        if (selectedCategory) {
                            submit({
                                intent: "delete",
                                id: selectedCategory?._id

                            }, {
                                method: "post"
                            })
                        }
                    }} >
                        Yes
                    </Button>
                </div>
            </ConfirmModal>

            <CreateModal
                className=" bg-gray-200"
                modalTitle="Add new Department"
                isOpen={createModalOpened}
                onOpenChange={handleCreateModalOpened}
            >
                {(onClose) => (
                    <Form method="post">
                        <Input
                            label="Name"
                            name="name"
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                            classNames={{
                                label: "font-nunito text-sm text-default-100",
                                inputWrapper: "bg-white shadow-sm dark:bg-[#333] border border-white/30 focus:bg-[#333] "
                            }}
                        />
                        <input hidden name="seller" value={user?._id} type="" />
                        <input hidden name="intent" value="create" type="" />

                        <Textarea
                            autoFocus
                            label="Department description"
                            labelPlacement="outside"
                            placeholder=" "
                            name="description"
                            className="mt-4 font-nunito text-sm"
                            classNames={{
                                label: "font-nunito text-sm text-default-100",
                                inputWrapper: "bg-white shadow-sm dark:bg-[#333] border border-white/30 focus:bg-[#333] "
                            }}
                        />

                        <div className="flex justify-end gap-2 mt-10 font-nunito">
                            <Button color="danger" onPress={onClose}>
                                Close
                            </Button>
                            <button type="submit" className=" text-white bg-primary-400 rounded-xl font-nunito px-4">
                                Submit
                            </button>
                        </div>
                    </Form>
                )}
            </CreateModal>

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

    const { departments, user, totalPages } = await department.getDepartments({ request, page, search_term })
    return { departments, user, totalPages }
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
                const categories = await department.CategoryAdd(request, name, description, seller, intent, id);
                return categories;

            case "delete":
                const deleteCat = await department.DeleteCat(intent, id)
                return deleteCat
            case "update":
                const updateCat = await department.UpdateCat({
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
