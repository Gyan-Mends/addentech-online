import React, { useState, useEffect } from "react";
import { Button, Input, Textarea, TableRow, TableCell, Tooltip, Skeleton } from "@nextui-org/react";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { CategoryColumns } from "~/components/table/columns";
import AdminLayout from "~/layout/adminLayout";
import ConfirmModal from "~/components/modal/confirmModal";
import { EditIcon } from "~/components/icons/EditIcon";
import { DeleteIcon } from "~/components/icons/DeleteIcon";
import { getSession } from "~/session";
import NewCustomTable from "~/components/table/newTable";
import { CategoryInterface, DepartmentInterface } from "~/interface/interface";
import usersController from "~/controller/Users";
import department from "~/controller/departments";
import CloseIcon from "~/components/icons/CloseIcon";
import CustomInput from "~/components/ui/CustomInput";


const Category = () => {
    const { departments, user, totalPages } = useLoaderData<{ departments: DepartmentInterface[], user: { user: string }, totalPages: number | any }>()
    const submit = useSubmit()
    const [editDrawerOpened, setEditDrawerOpened] = useState(false)
    const [dataValue, setDataValue] = useState<CategoryInterface>();
    const [createModalOpened, setCreateModalOpened] = useState(false)
    const [confirmModalOpened, setConfirmModalOpened] = useState(false)
    const navigate = useNavigate()
    const navigation = useNavigation()

    const handleCreateModalOpened = () => {
        setCreateModalOpened(true)
    }


    const handleDrawerModalClose = () => {
        setEditDrawerOpened(false);
    };

    const handleConfirmModalClosed = () => {
        setConfirmModalOpened(false)
    }

    const handleCreateModalClosed = () => {
        setCreateModalOpened(false)
    }


    return (
        <AdminLayout redirect="/admin/departments" redirectDelay={1000} handleOnClick={handleCreateModalOpened} buttonName="Create Department" pageName="Departments">

            <div className="">
                <NewCustomTable
                    columns={CategoryColumns}
                    loadingState={navigation.state === "loading" ? "loading" : "idle"}
                    totalPages={totalPages}
                    page={1}
                    setPage={(page) => (
                        navigate(`?page=${page}`)
                    )}>
                    {departments.map((dept: DepartmentInterface, index: number) => (
                        <TableRow key={index}>
                            <TableCell>{dept.name}</TableCell>
                            <TableCell>{dept.description}</TableCell>
                            <TableCell className="relative flex items-center gap-4">
                                <Button size="sm" color="success" variant="flat" onClick={() => {
                                    setEditDrawerOpened(true)
                                    setDataValue(dept)

                                }}>
                                    <EditIcon /> Edit
                                </Button >
                                <Button size="sm" color="danger" variant="flat" onClick={() => {
                                    setDataValue(dept)
                                    setConfirmModalOpened(true)
                                }}>
                                    <DeleteIcon /> Delete
                                </Button>

                            </TableCell>
                        </TableRow>
                    ))}
                </NewCustomTable>
            </div>

            <ConfirmModal className="dark:bg-slate-950 bg-gray-200"
                content="Are you sure to delete department" header="Comfirm Delete" isOpen={confirmModalOpened} onOpenChange={handleConfirmModalClosed}>
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

            {dataValue && (
                <div
                    className={`w-[20vw] flex flex-col gap-6 h-[100vh] bg-default-50 overflow-y-scroll border dark:border-white/10 fixed top-0 right-0 z-10 transition-all duration-500 ease-in-out p-6 ${editDrawerOpened ? "transform-none opacity-100" : "translate-x-full opacity-0"
                        }`}
                >
                    <div className="flex justify-between gap-10">
                        <p className="font-nunito">Edit Department Details</p>
                        <button
                            onClick={() => {
                                handleDrawerModalClose();
                            }}
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <hr className="border border-default-400" />

                    <Form method="post">
                        <Input
                            label="Name"
                            name="name"
                            defaultValue={dataValue?.name}
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                            classNames={{
                                label: "font-nunito text-sm text-default-100",
                                inputWrapper: "bg-white shadow-sm dark:bg-[#333] border border-white/30 focus:bg-[#333]",
                            }}
                        />
                        <input name="seller" value={user?._id} type="hidden" />
                        <input name="intent" value="update" type="hidden" />
                        <input name="id" value={dataValue?._id} type="hidden" />

                        <Textarea
                            autoFocus
                            label="Department description"
                            labelPlacement="outside"
                            placeholder=" "
                            name="description"
                            className="mt-4 font-nunito text-sm"
                            defaultValue={dataValue?.description}
                            classNames={{
                                label: "font-nunito text-sm text-default-100",
                                inputWrapper: "bg-white shadow-sm dark:bg-[#333] border border-white/30 focus:bg-[#333]",
                            }}
                        />

                        <button
                            type="submit"
                            className="mt-10 h-10 text-white bg-primary-400 rounded-xl font-nunito px-4"
                        >
                            Update
                        </button>
                    </Form>
                </div>
            )}



            <div
                className={`w-[20vw] flex flex-col gap-6 h-[100vh] bg-default-50 overflow-y-scroll border dark:border-white/10  fixed top-0 right-0 z-10 transition-transform duration-500 p-6 ${createModalOpened ? "transform-none" : "translate-x-full"}`}
            >
                <div className="flex justify-between gap-10 ">
                    <p className="font-nunito">Create a new Deprtment</p>
                    <button
                        onClick={() => {
                            handleCreateModalClosed()
                        }}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>
                <hr className=" border border-default-400 " />

                <Form method="post">
                    <CustomInput
                        label="Name"
                        name="name"
                        placeholder=" "
                        type="text"
                        labelPlacement="outside"
                    />
                    <input hidden name="admin" value={user?._id} type="" />
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
                            inputWrapper: "dark:bg-default-50 shadow-sm   border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full"
                        }}
                    />

                    <button onClick={() => {
                    }} type="submit" className="mt-10 h-10 text-white bg-primary-400 rounded-xl font-nunito px-4">
                        Submit
                    </button>
                    </Form>
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

    const { departments, totalPages } = await department.getDepartments({ request, page, search_term })
    const { user } = await usersController.FetchUsers({ request, page, search_term })
    return { departments, user, totalPages }
};

export const action: ActionFunction = async ({ request }) => {
    try {
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const admin = formData.get("admin") as string;
        const description = formData.get("description") as string;
        const id = formData.get("id") as string;
        const intent = formData.get("intent") as string;



        switch (intent) {
            case 'create':
                const categories = await department.CategoryAdd(request, name, description, admin, intent, id);
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
