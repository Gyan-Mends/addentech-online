import React, { useState, useEffect } from "react";
import { Button, Input, Textarea, TableRow, TableCell, Tooltip, Skeleton } from "@nextui-org/react";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { Toaster } from "react-hot-toast";

import { CategoryColumns, ContactColumns } from "~/components/table/columns";

import AdminLayout from "~/layout/adminLayout";
import ConfirmModal from "~/components/modal/confirmModal";
import { EditIcon } from "~/components/icons/EditIcon";
import { DeleteIcon } from "~/components/icons/DeleteIcon";
import { getSession } from "~/session";
import NewCustomTable from "~/components/table/newTable";
import { CategoryInterface, ContactInterface } from "~/interface/interface";
import category from "~/controller/categoryController";
import usersController from "~/controller/Users";
import contactController from "~/controller/contact";


type SessionData = {
    sessionId: {
        _id: string;
    };
};

const Category = () => {
    const { contacts, totalPages } = useLoaderData<{ contacts: ContactInterface[], user: { user: string }, totalPages: number | any }>()
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

    return (
        <AdminLayout>
            <div className="space-y-6 !text-white">
                <Toaster position="top-right" />
                
                {/* Header */}
                <div className="bg-color-dark-2 border border-white/10 p-6 rounded-xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
                            <p className="text-gray-300 mt-1">Manage customer inquiries and messages</p>
                        </div>
                    </div>
                </div>
                
                {/* Table */}
                <div className="bg-color-dark-2 border border-white/10 rounded-xl p-6">
                    <NewCustomTable
                        columns={ContactColumns}
                        loadingState={navigation.state === "loading" ? "loading" : "idle"}
                        totalPages={totalPages}
                        page={1}
                        setPage={(page) => (
                            navigate(`?page=${page}`)
                        )}>
                        {contacts.map((contact: ContactInterface, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{contact.firstName}</TableCell>
                                <TableCell>{contact.middleName}</TableCell>
                                <TableCell>{contact.lastName}</TableCell>
                                <TableCell>{contact.number}</TableCell>
                                <TableCell>{contact.description}</TableCell>
                                <TableCell className="relative flex items-center gap-4">

                                    <button onClick={() => {
                                        setDataValue(contact)
                                        setConfirmModalOpened(true)
                                    }}>
                                        <DeleteIcon className="text-danger" />
                                    </button>

                                </TableCell>
                            </TableRow>
                        ))}
                    </NewCustomTable>
                </div>


                <ConfirmModal className="dark:bg-[#333] !bg-[#020817] border border-white/20"
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

    const { contacts, totalPages } = await contactController.getContacts({ request, page, search_term })
    return { contacts, totalPages }
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

            case "logout":
                const logout = await usersController.logout(intent)
                return logout
            case "delete":
                const deleteCat = await contactController.DeleteCat(id)
                return deleteCat
            default:
                break;
        }

    } catch (error: any) {
        return json({ message: error.message, success: false }, { status: 500 });
    }
};
