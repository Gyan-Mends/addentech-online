import React, { useState, useEffect } from "react";
import { Button, Textarea, TableRow, TableCell } from "@nextui-org/react";
import { useNavigate } from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import { Edit, Trash2, Plus } from "lucide-react";
import axios from "axios";
import ConfirmModal from "~/components/modal/confirmModal";
import { CategoryColumns } from "~/components/table/columns";
import { errorToast, successToast } from "~/components/toast";
import AdminLayout from "~/layout/adminLayout";
import NewCustomTable from "~/components/table/newTable";
import { CategoryInterface } from "~/interface/interface";
import CustomInput from "~/components/ui/CustomInput";
import Drawer from "~/components/modal/drawer";

const Category = () => {
    // Data state
    const [categories, setCategories] = useState<CategoryInterface[]>([]);
    const [user, setUser] = useState<{ _id: string } | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    // UI state
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [dataValue, setDataValue] = useState<CategoryInterface>();
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [confirmModalOpened, setConfirmModalOpened] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [actionData, setActionData] = useState<{
        message: string;
        success: boolean;
        status: number;
    } | null>(null);

    const navigate = useNavigate();

    // Fetch categories data
    const fetchCategories = async (page = 1, search_term = "") => {
        try {
            setFetchLoading(true);
            const response = await axios.get(`/api/categories?page=${page}&search_term=${search_term}`);
            if (response.data.success) {
                const data = response.data.data;
                setUser(data.user);
                setCategories(data.categories);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
            }
        } catch (error: any) {
            errorToast(error.response?.data?.message || "Failed to fetch categories");
        } finally {
            setFetchLoading(false);
        }
    };

    // Handle category actions (create, update, delete)
    const handleCategoryAction = async (formData: FormData) => {
        try {
            const response = await axios.post("/api/categories", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setActionData(response.data);
            
            if (response.data.success) {
                // Refresh the categories list
                await fetchCategories(currentPage);
            }
            
            return response.data;
        } catch (error: any) {
            const errorData = error.response?.data || { message: "An error occurred", success: false };
            setActionData(errorData);
            return errorData;
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEditModalClose = () => {
        setEditModalOpened(false);
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
        formData.append("seller", user?._id || "");
        
        await handleCategoryAction(formData);
    };

    const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("intent", "create");
        formData.append("seller", user?._id || "");
        
        await handleCategoryAction(formData);
    };

    useEffect(() => {
        if (actionData?.success) {
            successToast(actionData?.message);
            setCreateModalOpened(false);
            setEditModalOpened(false);
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
                <div className="flex justify-end mb-6">
                    <Button className="border text-dashboard-primary border-dashboard-light px-4 py-1 bg-action-primary hover:bg-action-primary:hover" onClick={() => {
                        setCreateModalOpened(true);
                    }}>
                        <Plus />
                        Create Category
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
                        fetchCategories(page);
                    }}>
                    {categories.map((category: CategoryInterface, index: number) => (
                        <TableRow key={index} className="border-b border-dashboard hover:bg-dashboard-tertiary">
                            <TableCell className="text-xs text-dashboard-secondary">{category.name}</TableCell>
                            <TableCell className="text-xs text-dashboard-secondary">{category.description}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <button className="text-action-view hover:text-green-300" onClick={() => {
                                        setEditModalOpened(true);
                                        setDataValue(category);
                                    }}>
                                        <Edit className="" />
                                    </button>
                                    <button className="text-action-delete hover:text-red-300" onClick={() => {
                                        setDataValue(category);
                                        setConfirmModalOpened(true);
                                    }}>
                                        <Trash2 className="" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </NewCustomTable>

                {/* Edit Modal */}
                {dataValue && (
                    <Drawer title="Edit Category" isDrawerOpened={editModalOpened} handleDrawerClosed={handleEditModalClose}>
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 p-4">
                            <CustomInput
                                className="!text-white"
                                label="Name"
                                name="name"
                                defaultValue={dataValue?.name}
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                            />
                            
                            <Textarea
                                label="Category description"
                                labelPlacement="outside"
                                placeholder=" "
                                name="description"
                                className="mt-4 font-nunito text-sm"
                                defaultValue={dataValue?.description}
                                classNames={{
                                    label: "font-nunito text-sm !text-white",
                                    inputWrapper: " bg-dashboard-secondary shadow-sm   border border-white/20 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out max-w-full"
                                }}
                            />

                            <Button size="sm" type="submit" className="rounded-xl bg-action-primary text-white text-sm mt-10 font-nunito h-10 w-40 px-4">
                                Update
                            </Button>
                        </form>
                    </Drawer>
                )}

                {/* Confirm Modal */}
                <ConfirmModal
                    content="Are you sure to delete category?" 
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
                                await handleCategoryAction(formData);
                            }
                        }}>
                            Yes
                        </Button>
                    </div>
                </ConfirmModal>

                {/* Create Modal */}
                <Drawer isDrawerOpened={createModalOpened} handleDrawerClosed={handleCreateModalClosed} title="Create New Category">
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
                            autoFocus
                            label="Category description"
                            labelPlacement="outside"
                            placeholder=" "
                            name="description"
                            className="mt-4 font-nunito text-sm"
                            classNames={{
                                label: "font-nunito text-sm !text-white",
                                inputWrapper: " bg-dashboard-secondary shadow-sm   border border-white/20 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out max-w-full"
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

export default Category;
