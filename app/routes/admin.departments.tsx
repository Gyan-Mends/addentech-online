import React, { useState, useEffect } from "react";
import { Button, Input, Textarea, TableRow, TableCell } from "@nextui-org/react";
import { useNavigate } from "@remix-run/react";
import { CategoryColumns } from "~/components/table/columns";
import AdminLayout from "~/layout/adminLayout";
import ConfirmModal from "~/components/modal/confirmModal";
import { Edit, Trash2, Plus } from "lucide-react";
import NewCustomTable from "~/components/table/newTable";
import { DepartmentInterface } from "~/interface/interface";
import CustomInput from "~/components/ui/CustomInput";
import Drawer from "~/components/modal/drawer";
import { Toaster } from "react-hot-toast";
import { errorToast, successToast } from "~/components/toast";
import axios from "axios";

const Department = () => {
    // Data state
    const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
    const [user, setUser] = useState<{ _id: string } | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    // UI state
    const [editDrawerOpened, setEditDrawerOpened] = useState(false);
    const [dataValue, setDataValue] = useState<DepartmentInterface>();
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [confirmModalOpened, setConfirmModalOpened] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [actionData, setActionData] = useState<{
        message: string;
        success: boolean;
        status: number;
    } | null>(null);

    const navigate = useNavigate();

    // Fetch departments data
    const fetchDepartments = async (page = 1, search_term = "") => {
        try {
            setFetchLoading(true);
            const response = await axios.get(`/api/departments?page=${page}&search_term=${search_term}`);
            if (response.data.success) {
                const data = response.data.data;
                setDepartments(data.departments);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
            }
        } catch (error: any) {
            errorToast(error.response?.data?.message || "Failed to fetch departments");
        } finally {
            setFetchLoading(false);
        }
    };

    // Handle department actions (create, update, delete)
    const handleDepartmentAction = async (formData: FormData) => {
        try {
            const response = await axios.post("/api/departments", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setActionData(response.data);
            
            if (response.data.success) {
                // Refresh the departments list
                await fetchDepartments(currentPage);
            }
            
            return response.data;
        } catch (error: any) {
            const errorData = error.response?.data || { message: "An error occurred", success: false };
            setActionData(errorData);
            return errorData;
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleEditDrawerModalClose = () => {
        setEditDrawerOpened(false);
    };

    const handleConfirmModalClosed = () => {
        setConfirmModalOpened(false);
    };

    const handleCreateModalClosed = () => {
        setCreateModalOpened(false);
    };

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("intent", "update");
        formData.append("id", dataValue?._id || "");
        
        await handleDepartmentAction(formData);
    };

    const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("intent", "create");
        
        await handleDepartmentAction(formData);
    };

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message);
                setCreateModalOpened(false);
                setConfirmModalOpened(false);
                setEditDrawerOpened(false);
            } else {
                errorToast(actionData.message);
            }
        }
    }, [actionData]);

    return (
        <AdminLayout>
            <div className="relative bg-dashboard-primary min-h-screen">
                <Toaster position="top-right" />
                
                {/* Header */}
                <div className="flex justify-end mb-6">
                    <Button className="border text-dashboard-primary border-dashboard-light px-4 py-1 bg-action-primary hover:bg-action-primary:hover" onClick={() => {
                        setCreateModalOpened(true);
                    }}>
                        <Plus />
                        Create Department
                    </Button>
                </div>
                
                {/* Table */}
                <NewCustomTable
                    columns={CategoryColumns}
                    loadingState={fetchLoading ? "loading" : "idle"}
                    totalPages={totalPages}
                    page={currentPage}
                    setPage={(page) => {
                        setCurrentPage(page);
                        fetchDepartments(page);
                    }}>
                    {departments.map((dept: DepartmentInterface, index: number) => (
                        <TableRow key={index} className="border-b border-dashboard hover:bg-dashboard-tertiary">
                            <TableCell className="text-xs text-dashboard-secondary">{dept.name}</TableCell>
                            <TableCell className="text-xs text-dashboard-secondary">{dept.description}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <button className="text-action-view hover:text-green-300" onClick={() => {
                                        setEditDrawerOpened(true);
                                        setDataValue(dept);
                                    }}>
                                        <Edit className="" />
                                    </button>
                                    <button className="text-action-delete hover:text-red-300" onClick={() => {
                                        setDataValue(dept);
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
                    content="Are you sure to delete department?" 
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
                                await handleDepartmentAction(formData);
                            }
                        }}>
                            Yes
                        </Button>
                    </div>
                </ConfirmModal>

                {/* Edit Modal */}
                {dataValue && (
                    <Drawer isDrawerOpened={editDrawerOpened} handleDrawerClosed={handleEditDrawerModalClose} title="Edit Department">
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 p-4">
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

                            <Textarea
                                variant="bordered"
                                autoFocus
                                label="Department description"
                                labelPlacement="outside"
                                placeholder=" "
                                name="description"
                                className="mt-4 font-nunito text-sm"
                                defaultValue={dataValue?.description}
                                classNames={{
                                    label: "font-nunito text-sm !text-white",
                                    inputWrapper: " shadow-sm bg-dashboard-secondary h-[40vh]  border border-white/20 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out text-white max-w-full"
                                }}
                            />

                            <Button size="sm" type="submit" className="rounded-xl bg-action-primary text-white text-sm mt-10 font-nunito h-10 w-40 px-4">
                                Update
                            </Button>
                        </form>
                    </Drawer>
                )}

                {/* Create Modal */}
                <Drawer isDrawerOpened={createModalOpened} handleDrawerClosed={handleCreateModalClosed} title="Create New Department">
                    <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 p-4">
                        <CustomInput
                            className="!text-white"
                            label="Name"
                            name="name"
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />

                        <Textarea
                            variant="bordered"
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

                        <button type="submit" className="mt-10 h-10 text-white bg-action-primary rounded-xl font-nunito px-4">
                            Submit
                        </button>
                    </form>
                </Drawer>
            </div>
        </AdminLayout>
    );
};

export default Department; 
