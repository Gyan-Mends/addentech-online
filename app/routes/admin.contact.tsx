import React, { useState, useEffect } from "react";
import { Button, TableRow, TableCell } from "@nextui-org/react";
import { useNavigate } from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import axios from "axios";
import AdminLayout from "~/layout/adminLayout";
import ConfirmModal from "~/components/modal/confirmModal";
import { ContactColumns } from "~/components/table/columns";
import { errorToast, successToast } from "~/components/toast";
import NewCustomTable from "~/components/table/newTable";
import { ContactInterface } from "~/interface/interface";

const Contact = () => {
    // Data state
    const [contacts, setContacts] = useState<ContactInterface[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    // UI state
    const [dataValue, setDataValue] = useState<ContactInterface>();
    const [confirmModalOpened, setConfirmModalOpened] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [actionData, setActionData] = useState<{
        message: string;
        success: boolean;
        status: number;
    } | null>(null);

    const navigate = useNavigate();

    // Fetch contacts data
    const fetchContacts = async (page = 1, search_term = "") => {
        try {
            setFetchLoading(true);
            const response = await axios.get(`/api/contacts?page=${page}&search_term=${search_term}`);
            if (response.data.success) {
                const data = response.data.data;
                setContacts(data.contacts);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
            }
        } catch (error: any) {
            errorToast(error.response?.data?.message || "Failed to fetch contacts");
        } finally {
            setFetchLoading(false);
        }
    };

    // Handle contact actions (delete)
    const handleContactAction = async (formData: FormData) => {
        try {
            const response = await axios.post("/api/contacts", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setActionData(response.data);
            
            if (response.data.success) {
                // Refresh the contacts list
                await fetchContacts(currentPage);
            }
            
            return response.data;
        } catch (error: any) {
            const errorData = error.response?.data || { message: "An error occurred", success: false };
            setActionData(errorData);
            return errorData;
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleConfirmModalClosed = () => {
        setConfirmModalOpened(false);
    };

    useEffect(() => {
        if (actionData?.success) {
            successToast(actionData?.message);
            setConfirmModalOpened(false);
        }
        if (actionData && !actionData.success) {
            errorToast(actionData?.message);
        }
    }, [actionData]);

    return (
        <AdminLayout>
            <div className="relative bg-dashboard-primary min-h-screen">
                <Toaster position="top-right" />
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
                        <p className="text-gray-300 mt-1">Manage customer inquiries and messages</p>
                    </div>
                </div>
                
                {/* Table */}
                <NewCustomTable
                    columns={ContactColumns}
                    loadingState={fetchLoading ? "loading" : "idle"}
                    totalPages={totalPages}
                    page={currentPage}
                    setPage={(page) => {
                        setCurrentPage(page);
                        fetchContacts(page);
                    }}>
                    {contacts.map((contact: ContactInterface, index: number) => (
                        <TableRow key={index} className="border-b border-dashboard hover:bg-dashboard-tertiary">
                            <TableCell className="text-xs text-dashboard-secondary">{contact.firstName}</TableCell>
                            <TableCell className="text-xs text-dashboard-secondary">{contact.middleName}</TableCell>
                            <TableCell className="text-xs text-dashboard-secondary">{contact.lastName}</TableCell>
                            <TableCell className="text-xs text-dashboard-secondary">{contact.number}</TableCell>
                            <TableCell className="text-xs text-dashboard-secondary">{contact.description}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <button className="text-action-delete hover:text-red-300" onClick={() => {
                                        setDataValue(contact);
                                        setConfirmModalOpened(true);
                                    }}>
                                        <Trash2 className="" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </NewCustomTable>

                {/* Confirm Modal */}
                <ConfirmModal 
                    content="Are you sure to delete contact?" 
                    header="Confirm Delete" 
                    isOpen={confirmModalOpened} 
                    onOpenChange={handleConfirmModalClosed}
                >
                    <div className="flex gap-4">
                        <Button color="success" variant="flat" className="font-montserrat font-semibold !text-white" size="sm" onPress={handleConfirmModalClosed}>
                            No
                        </Button>
                        <Button color="danger" variant="flat" className="font-montserrat font-semibold" size="sm" onPress={async () => {
                            setConfirmModalOpened(false);
                            if (dataValue) {
                                const formData = new FormData();
                                formData.append("intent", "delete");
                                formData.append("id", dataValue._id);
                                await handleContactAction(formData);
                            }
                        }}>
                            Yes
                        </Button>
                    </div>
                </ConfirmModal>
            </div>
        </AdminLayout>
    );
};

export default Contact; 
