import React, { useState, useEffect } from "react";
import { Button, Input, Textarea, TableRow, TableCell} from "@nextui-org/react";
import { ActionFunction, LoaderFunction, json,  } from "@remix-run/node";
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
import CustomInput from "~/components/ui/CustomInput";
import { Plus } from "lucide-react";
import Drawer from "~/components/modal/drawer";
import { Toaster } from "react-hot-toast";
import { errorToast, successToast } from "~/components/toast";


const Category = () => {
    const { departments, user, totalPages, currentPage } = useLoaderData<{ departments: DepartmentInterface[], user: { user: string }, totalPages: number | any, currentPage: number }>()
    const submit = useSubmit()
    const [editDrawerOpened, setEditDrawerOpened] = useState(false)
    const [dataValue, setDataValue] = useState<DepartmentInterface>();
    const [createModalOpened, setCreateModalOpened] = useState(false)
    const [confirmModalOpened, setConfirmModalOpened] = useState(false)
    const navigate = useNavigate()
    const navigation = useNavigation()
    const actionData = useActionData<{ message: string, success: boolean, status: number }>()


    const handleEditDrawerModalClose = () => {
        setEditDrawerOpened(false);
    };

    const handleConfirmModalClosed = () => {
        setConfirmModalOpened(false)
    }

    const handleCreateModalClosed = () => {
        setCreateModalOpened(false)
    }

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message)
                setCreateModalOpened(false)
                setConfirmModalOpened(false)
                setEditDrawerOpened(false)
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
                            <h1 className="text-2xl font-bold text-white">Department Management</h1>
                            <p className="text-gray-300 mt-1">Manage organizational departments</p>
                        </div>
                        <Button className="border text-white border-white/20 px-4 py-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                            setCreateModalOpened(true)
                        }}>
                            <Plus />
                            Create Department
                        </Button>
                    </div>
                </div>
                
                {/* Table */}
                    <NewCustomTable
                        columns={CategoryColumns}
                        loadingState={navigation.state === "loading" ? "loading" : "idle"}
                        totalPages={totalPages}
                        page={currentPage}
                        setPage={(page) => (
                            navigate(`?page=${page}`)
                        )}>
                        {departments.map((dept: DepartmentInterface, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{dept.name}</TableCell>
                                <TableCell>{dept.description}</TableCell>
                                <TableCell className="relative flex items-center gap-4">
                                    <button onClick={() => {
                                        setEditDrawerOpened(true)
                                        setDataValue(dept)

                                    }}>
                                        <EditIcon className="text-primary" />
                                    </button >
                                    <button onClick={() => {
                                        setDataValue(dept)
                                        setConfirmModalOpened(true)
                                    }}>
                                        <DeleteIcon className="text-danger" />
                                    </button>

                                </TableCell>
                            </TableRow>
                        ))}
                    </NewCustomTable>

                <ConfirmModal
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
                    <Drawer isDrawerOpened={editDrawerOpened} handleDrawerClosed={handleEditDrawerModalClose} title="Edit Department">
                        <Form method="post" className="p-4">
                            <Input
                                label="Name"
                                name="name"
                                defaultValue={dataValue?.name}
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-nunito text-sm !text-white",
                                    inputWrapper: "bg-dashboard-secondary shadow-sm  border border-white/20 focus:bg-[#333]",
                                }}
                            />
                            <input name="seller" value={user?.user} type="hidden" />
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
                                    label: "font-nunito text-sm !text-white",
                                    inputWrapper: " shadow-sm bg-dashboard-secondary h-[40vh]  border border-white/20 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-pink-500 hover:transition-all hover:duration-300 hover:ease-in-out text-white max-w-full"
                                }}
                            />

                            <button
                                type="submit"
                                className="mt-10 h-10 text-white bg-action-primary rounded-xl font-nunito px-4"
                            >
                                Update
                            </button>
                        </Form>
                    </Drawer>
                )}



                <Drawer isDrawerOpened={createModalOpened} handleDrawerClosed={handleCreateModalClosed} title="Create New Department">
                    <Form method="post" className="p-4">
                        <CustomInput
                            label="Name"
                            name="name"
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />
                        {/* <input hidden name="admin" value={user?.user} type="" /> */}
                        <input hidden name="intent" value="create" type="" />

                        <Textarea
                            autoFocus
                            label="Department description"
                            labelPlacement="outside"
                            placeholder=" "
                            name="description"
                            className="mt-4 font-nunito text-sm"
                            classNames={{
                                label: "font-nunito text-sm !text-white",
                                inputWrapper: " shadow-sm bg-dashboard-secondary  h-[40vh]  border border-white/20 focus:bg-[#333]  focus focus:bg-[#333] hover: hover:transition-all hover:duration-300 hover:ease-in-out max-w-full"
                            }}
                        />

                        <button onClick={() => {
                        }} type="submit" className="mt-10 h-10 text-white bg-pink-500 rounded-xl font-nunito px-4">
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
    // if (!token) {
    //     return redirect("/")
    // }

    const { departments, totalPages } = await department.getDepartments({ request, page, search_term })
    const { user } = await usersController.FetchUsers({ request, page, search_term })
    return { departments, user, totalPages, currentPage: page }
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
                const categories = await department.CategoryAdd(request, name, description,  intent, id);
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
