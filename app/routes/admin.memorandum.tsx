import { Avatar, Button, Checkbox, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem, Skeleton, TableCell, TableRow, User } from "@nextui-org/react";
import FormSelect from "~/components/form/FormSelect";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { ArrowLeft, X, Trash2, Edit, Bell, Search, User as UserIcon } from "lucide-react";
import ConfirmModal from "~/components/modal/confirmModal";
import CreateModal from "~/components/modal/createModal";
import EditModal from "~/components/modal/EditModal";
import NewCustomTable from "~/components/table/newTable";
import { errorToast, successToast } from "~/components/toast";
import CustomInput from "~/components/ui/CustomInput";
import { DepartmentInterface, MemoInterface, RegistrationInterface } from "~/interface/interface";
import AdminLayout from "~/layout/adminLayout";
import { v4 as uuidv4 } from "uuid";
import { Upload as FileUpload } from "lucide-react";
import { MemoColumns } from "~/components/table/columns";
import { ChevronDown, Eye } from "lucide-react";
import { Plus, FileText, Download, ChevronsDownIcon, DownloadCloudIcon, Upload } from "lucide-react";
import Drawer from "~/components/modal/drawer";
import axios from "axios";

// ReactQuill dynamic import
const ReactQuill = typeof window === "object" ? require("react-quill") : () => false;

const Users = () => {
    // State management
    const [memos, setMemos] = useState<MemoInterface[]>([]);
    const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
    const [users, setUsers] = useState<RegistrationInterface[]>([]);
    const [currentUser, setCurrentUser] = useState<RegistrationInterface | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal and drawer states
    const [isCreateModalOpened, setIsCreateModalOpened] = useState(false);
    const [base64Image, setBase64Image] = useState<any>();
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false);
    const [isEditModalOpened, setIsEditModalOpened] = useState(false);
    const [dataValue, setDataValue] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    
    // Form states
    const [referenceNumber, setReferenceNumber] = useState('');
    const [content, setContent] = useState("");
    const [contentTwo, setContentTow] = useState("");
    const [departmentValue, setDepartmentValue] = useState("");
    const [fromNameValue, setFromNameValue] = useState("");
    const [toNameValue, setToNameValue] = useState("");
    const [toDepartmentValue, setToDepartmentValue] = useState("");
    const [ccNameValue, setCcNameValue] = useState("");
    const [ccDepartmentValue, setCcDepartmentValue] = useState("");
    const [memoTypeValue, setMemoTypeValue] = useState("");
    const [frequencyValue, setFrequencyValue] = useState("");
    const [dueDateValue, setDueDateValue] = useState("");
    
    // State for filtered users
    const [toUsers, setToUsers] = useState<any[]>([]);
    const [ccUsers, setCcUsers] = useState<any[]>([]);

    // Fetch memos
    const fetchMemos = async (page = 1, search = "") => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set('page', page.toString());
            if (search) params.set('search_term', search);
            
            const response = await axios.get(`/api/memos?${params.toString()}`);
            
            if (response.data.success) {
                setMemos(response.data.data || []);
                setTotalPages(response.data.totalPages || 1);
                setCurrentUser(response.data.currentUser);
            } else {
                errorToast(response.data.message || "Failed to fetch memos");
            }
        } catch (error: any) {
            console.error("Error fetching memos:", error);
            errorToast(error.response?.data?.message || "Error fetching memos");
        } finally {
            setLoading(false);
        }
    };

    // Fetch departments
    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/departments');
            if (response.data.success) {
                setDepartments(response.data.data.departments || []);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    // Fetch users
    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            if (response.data.success) {
                setUsers(response.data.data.users || []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Handle memo actions (create, update, delete)
    const handleMemoAction = async (formData: FormData) => {
        try {
            setIsLoading(true);
            const response = await axios.post('/api/memos', formData);
            
            if (response.data.success) {
                successToast(response.data.message);
                await fetchMemos(currentPage, searchTerm); // Refresh data
                
                // Close modals/drawers
                setIsDrawerOpen(false);
                setIsEditDrawerOpen(false);
                setIsConfirmModalOpened(false);
                
                // Reset form
                resetForm();
            } else {
                errorToast(response.data.message);
            }
        } catch (error: any) {
            console.error("Error with memo action:", error);
            errorToast(error.response?.data?.message || "Error processing memo action");
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setContent("");
        setContentTow("");
        setBase64Image("");
        setDepartmentValue("");
        setFromNameValue("");
        setToNameValue("");
        setToDepartmentValue("");
        setCcNameValue("");
        setCcDepartmentValue("");
        setMemoTypeValue("");
        setFrequencyValue("");
        setDueDateValue("");
        setDataValue(null);
    };

    // Generate random reference number
    const generateRandomReference = () => {
        return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    };

    // Handle create memo
    const handleCreateMemo = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        formData.append('intent', 'create');
        formData.append('base64Image', base64Image || '');
        
        await handleMemoAction(formData);
    };

    // Handle update memo
    const handleUpdateMemo = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        formData.append('intent', 'update');
        formData.append('base64Image', base64Image || '');
        formData.append('id', dataValue?._id || '');
        
        await handleMemoAction(formData);
    };

    // Handle delete memo
    const handleDeleteMemo = async () => {
        if (!dataValue?._id) return;
        
        const formData = new FormData();
        formData.append('intent', 'delete');
        formData.append('id', dataValue._id);
        
        await handleMemoAction(formData);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchMemos(page, searchTerm);
    };

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchMemos(1, searchTerm);
    };

    // Load initial data
    useEffect(() => {
        fetchMemos();
        fetchDepartments();
        fetchUsers();
    }, []);

    // Filter users by department when to department changes
    useEffect(() => {
        if (toDepartmentValue && users) {
            const filteredUsers = users.filter(user => {
                const userDeptId = typeof user.department === 'object' 
                    ? (user.department as DepartmentInterface)?._id 
                    : user.department;
                
                return userDeptId === toDepartmentValue;
            });
            setToUsers(filteredUsers);
        } else {
            setToUsers([]);
        }
        setToNameValue(""); // Reset selection when department changes
    }, [toDepartmentValue, users]);

    // Filter users by department when cc department changes
    useEffect(() => {
        if (ccDepartmentValue && users) {
            const filteredUsers = users.filter(user => {
                const userDeptId = typeof user.department === 'object' 
                    ? (user.department as DepartmentInterface)?._id 
                    : user.department;
                
                return userDeptId === ccDepartmentValue;
            });
            setCcUsers(filteredUsers);
        } else {
            setCcUsers([]);
        }
        setCcNameValue(""); // Reset selection when department changes
    }, [ccDepartmentValue, users]);

    // Set base64 image when dataValue changes
    useEffect(() => {
        if (dataValue?.image) {
            setBase64Image(dataValue.image);
        }
    }, [dataValue]);

    // Set department value when dataValue changes
    useEffect(() => {
        if (dataValue?.fromDepartment && typeof dataValue.fromDepartment === 'object') {
            setDepartmentValue((dataValue.fromDepartment as DepartmentInterface)._id);
        }
    }, [dataValue]);

    // Set from name value when dataValue changes
    useEffect(() => {
        if (dataValue?.fromName && typeof dataValue.fromName === 'object') {
            setFromNameValue((dataValue.fromName as RegistrationInterface)._id);
        }
    }, [dataValue]);

    function formatTime(date: Date) {
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${(hours % 12) || 12}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
        return isToday ? `${formattedTime} Today` : formattedTime;
    }

    const handleConfirmModalClosed = () => {
        setIsConfirmModalOpened(false)
    }

    const handleClick = () => {
        setIsDrawerOpen(!isDrawerOpen)
        const randomRef = generateRandomReference();
        setReferenceNumber(randomRef);
    };

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

    const handleEdit = (data: any) => {
        // Set the content for the Quill editors
        setContent(data.subject || "");
        setContentTow(data.remark || "");

        // Format dates to YYYY-MM-DD for input fields
        const formatDateForInput = (dateString: string | Date) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        const formattedData = {
            ...data,
            memoDate: formatDateForInput(data.memoDate || ''),
            dueDate: formatDateForInput(data.dueDate || '')
        };

        setDataValue(formattedData);
        setDepartmentValue(typeof data.fromDepartment === 'object' ? (data.fromDepartment as DepartmentInterface)._id : data.fromDepartment);
        setFromNameValue(typeof data.fromName === 'object' ? (data.fromName as RegistrationInterface)._id : data.fromName);
        setToDepartmentValue(typeof data.toDepartment === 'object' ? (data.toDepartment as DepartmentInterface)._id : data.toDepartment);
        setToNameValue(typeof data.toName === 'object' ? (data.toName as RegistrationInterface)._id : data.toName);
        setCcDepartmentValue(typeof data.ccDepartment === 'object' ? (data.ccDepartment as DepartmentInterface)._id : data.ccDepartment);
        setCcNameValue(typeof data.ccName === 'object' ? (data.ccName as RegistrationInterface)._id : data.ccName);
        setMemoTypeValue(data.memoType || "");
        setFrequencyValue(data.frequency || "");
        setDueDateValue(formatDateForInput(data.dueDate || ''));
        setIsEditDrawerOpen(true);
    };

    // Helper function to get department name
    const getDepartmentName = (dept: string | DepartmentInterface) => {
        if (typeof dept === 'string') return dept;
        return dept?.name || '';
    };

    // Helper function to get user name
    const getUserName = (user: string | RegistrationInterface) => {
        if (typeof user === 'string') return user;
        return `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim();
    };

    return (
        <AdminLayout>
            <div>
                <div className="flex justify-end">
                    <Button className="border border-white/30 px-4 py-1 bg-action-primary text-white" onClick={() => {
                        const randomRef = generateRandomReference();
                        setReferenceNumber(randomRef);
                        setIsDrawerOpen(true);
                    }}>
                        <Plus />
                        Create Memo
                    </Button>
                </div>

                <NewCustomTable
                    columns={MemoColumns}
                    loadingState={loading ? "loading" : "idle"}
                    totalPages={totalPages}
                    page={currentPage}
                    setPage={handlePageChange}>
                    {memos?.map((memo, index: number) => (
                        <TableRow key={index}>
                            <TableCell>{memo.refNumber}</TableCell>
                            <TableCell>{getDepartmentName(memo.fromDepartment)}</TableCell>
                            <TableCell>{getUserName(memo.fromName)}</TableCell>
                            <TableCell>{getDepartmentName(memo.toDepartment)}</TableCell>
                            <TableCell>{getUserName(memo.toName)}</TableCell>
                            <TableCell>{memo?.memoDate ? new Date(memo.memoDate).toLocaleDateString() : ''}</TableCell>
                            <TableCell>{memo?.dueDate ? new Date(memo.dueDate).toLocaleDateString() : ''}</TableCell>
                            <TableCell className="flex gap-2">
                                <button onClick={() => {
                                    setIsConfirmModalOpened(true)
                                    setDataValue(memo)
                                }}>
                                    <Trash2 className="text-red-500" />
                                </button>
                                <button onClick={() => {
                                    handleEdit(memo);
                                }}>
                                    <Edit className="text-blue-500" />
                                </button>
                                <button onClick={() => {
                                    setIsViewDrawerOpen(true)
                                    setDataValue(memo)
                                }}>
                                    <Eye className="" />
                                </button>
                                {(memo.image && memo.image !== '') ? (
                                    <a
                                        href={memo.image}
                                        download
                                        className="p-1 inline-block"
                                        title="Download attached file"
                                        onClick={(e) => {
                                            if (!memo.image) {
                                                e.preventDefault();
                                                errorToast("No file available for download.");
                                            }
                                        }}
                                    >
                                        <Download className="h-4 w-4 text-green-500" />
                                    </a>
                                ) : (
                                    <button className="p-1" title="No file attached" disabled>
                                        <DownloadCloudIcon />
                                    </button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </NewCustomTable>

                {/* Create memo drawer */}
                <Drawer
                    isDrawerOpened={isDrawerOpen}
                    handleDrawerClosed={() => {
                        setIsDrawerOpen(false)
                    }}
                    title="Create Memo"
                >
                    <form className="flex flex-col gap-6 p-4" onSubmit={handleCreateMemo}>
                        <input
                            name="refNumber"
                            className="text-sm shadow-sm border border-white/20 hover:border-b-action-primary hover:transition-all hover:duration-300 hover:ease-in-out bg-dashboard-secondary max-w-full h-10 rounded-xl pl-2"
                            value={referenceNumber} 
                            type="text" 
                            readOnly
                        />

                        <div className="flex gap-6">
                            <div className="flex-1">
                                <label className="text-sm font-medium !text-white block mb-2">
                                    From Department <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-white/20 text-white   rounded-md bg-dashboard-secondary cursor-not-allowed"
                                    value={currentUser?.department ? 
                                        departments.find(d => d._id === currentUser.department)?.name || 'Department not found' : 
                                        'No department assigned'}
                                    readOnly
                                />
                                <input name="fromDepartment" type="hidden" value={currentUser?.department || ''} />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium !text-white block mb-2">
                                    From Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-white/20 text-white rounded-md bg-dashboard-secondary cursor-not-allowed"
                                    value={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User not found'}
                                    readOnly
                                />
                                <input name="fromName" type="hidden" value={currentUser?._id || ''} />
                            </div>
                        </div>

                        <CustomInput
                            label="Memo Date"
                            isRequired
                            name="memoDate"
                            type="Date"
                            placeholder=" "
                            labelPlacement="outside"
                        />

                        <div className="flex gap-6">
                            <Select
                                label="To Department"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="toDepartment"
                                selectedKeys={toDepartmentValue ? [toDepartmentValue] : []}
                                onSelectionChange={(keys) => {
                                    const selectedKey = Array.from(keys)[0] as string;
                                    setToDepartmentValue(selectedKey || "");
                                }}
                                classNames={{
                                    label: "font-nunito text-sm !text-white",
                                    popoverContent: "z-[10000] bg-dashboard-secondary shadow-sm dark:bg-default-50 border border-white/20 font-nunito ",
                                    trigger: " shadow-sm   border border-white/20 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full bg-dashboard-secondary  "
                                }}
                            >
                                {departments && departments.map((department: DepartmentInterface) => (
                                    <SelectItem className="!text-white" key={department._id}>{department.name}</SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="To Name"
                                labelPlacement="outside"
                                placeholder="Select user"
                                isRequired
                                name="toName"
                                selectedKeys={toNameValue ? [toNameValue] : []}
                                onSelectionChange={(keys) => {
                                    const selectedKey = Array.from(keys)[0] as string;
                                    setToNameValue(selectedKey || "");
                                }}
                                isDisabled={!toDepartmentValue}
                                classNames={{
                                    label: "font-nunito text-sm !text-white",
                                    popoverContent: "z-[10000] bg-dashboard-secondary shadow-sm dark:bg-default-50 border border-white/20 font-nunito ",
                                    trigger: " shadow-sm   border border-white/20 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full bg-dashboard-secondary  "
                                }}
                            >
                                {toUsers.map((user: any) => (
                                    <SelectItem className="!text-white" key={user._id}>{`${user.firstName} ${user.lastName}`}</SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <label htmlFor="" className="font-nunito">Subject</label>
                            <input type="hidden" name="subject" value={content} />
                            <ReactQuill
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                className='md:!h-[20vh] mt-2 font-nunito rounded w-full mb-12 !font-nunito'
                            />
                        </div>

                        <div className="flex gap-6 mt-6">
                            <Select
                                label="Memo Type"
                                labelPlacement="outside"
                                placeholder="Select type"
                                isRequired
                                name="memoType"
                                classNames={{
                                    label: "font-nunito text-sm !text-white",
                                    popoverContent: "z-[10000] bg-dashboard-secondary shadow-sm dark:bg-default-50 border border-white/20 font-nunito ",
                                    trigger: " shadow-sm   border border-white/20 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full bg-dashboard-secondary  "
                                }}
                            >
                                {[
                                    { key: "Open", value: "Open", display_name: "Open" },
                                    { key: "Processing", value: "Processing", display_name: "Processing" },
                                    { key: "Closed", value: "Closed", display_name: "Closed" },
                                ].map((role) => (
                                    <SelectItem className="!text-white" key={role.key}>{role.display_name}</SelectItem>
                                ))}
                            </Select>
                            <CustomInput
                                label="Due Date"
                                isRequired
                                name="dueDate"
                                type="Date"
                                placeholder=" "
                                labelPlacement="outside"
                            />
                        </div>

                        <Select
                            label="Follow up Frequency"
                            labelPlacement="outside"
                            placeholder="Select frequency"
                            isRequired
                            name="frequency"
                            classNames={{
                                label: "font-nunito text-sm !text-white",
                                popoverContent: "z-[10000] bg-dashboard-secondary shadow-sm dark:bg-default-50 border border-white/20 font-nunito ",
                                trigger: " shadow-sm   border border-white/20 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out  max-w-full bg-dashboard-secondary  "
                            }}
                        >
                            {[
                                { key: "Every Day", value: "Every Day", display_name: "Every Day" },
                                { key: "Every Week", value: "Every Week", display_name: "Every Week" },
                                { key: "Every Month", value: "Every Month", display_name: "Every Month" },
                            ].map((role) => (
                                <SelectItem  className="!text-white" key={role.key}>{role.display_name}</SelectItem>
                            ))}
                        </Select>

                        <div>
                            <label htmlFor="" className="font-nunito !text-white">Remarks</label>
                            <input type="hidden" name="remark" value={contentTwo} />
                            <ReactQuill
                                value={contentTwo}
                                onChange={setContentTow}
                                modules={modules}
                                className='md:!h-[20vh] mt-2 font-nunito rounded w-full mb-12 !font-nunito'
                            />
                        </div>

                        <div className="flex gap-6 mt-6">
                            <Select
                                label="CC Department"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="ccDepartment"
                                selectedKeys={ccDepartmentValue ? [ccDepartmentValue] : []}
                                onSelectionChange={(keys) => {
                                    const selectedKey = Array.from(keys)[0] as string;
                                    setCcDepartmentValue(selectedKey || "");
                                }}
                                classNames={{
                                    label: "font-nunito text-sm !text-white",
                                    popoverContent: "z-[10000] bg-dashboard-secondary shadow-sm dark:bg-default-50 border border-white/20 font-nunito ",
                                    trigger: " shadow-sm   border border-white/20 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full bg-dashboard-secondary  "
                                }}
                            >
                                {departments && departments.map((department: DepartmentInterface) => (
                                    <SelectItem className="!text-white" key={department._id}>{department.name}</SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="CC Name"
                                labelPlacement="outside"
                                placeholder="Select user"
                                isRequired
                                name="ccName"
                                selectedKeys={ccNameValue ? [ccNameValue] : []}
                                onSelectionChange={(keys) => {
                                    const selectedKey = Array.from(keys)[0] as string;
                                    setCcNameValue(selectedKey || "");
                                }}
                                isDisabled={!ccDepartmentValue}
                                classNames={{
                                    label: "font-nunito text-sm !text-white",
                                    popoverContent: "z-[10000] bg-dashboard-secondary shadow-sm dark:bg-default-50 border border-white/20 font-nunito ",
                                    trigger: " shadow-sm   border border-white/20 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full bg-dashboard-secondary  "
                                }}
                            >
                                {ccUsers.map((user: any) => (
                                    <SelectItem className="!text-white" key={user._id}>{`${user.firstName} ${user.lastName}`}</SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className=" ">
                            <label className="font-nunito block text-sm !text-white" htmlFor="">Image</label>
                            <input name="image" type="text" hidden />
                            <div className="relative inline-block w-40 h-40 border-2 border-dashed border-gray-600 rounded-xl dark:border-white/30 mt-2">
                                <input
                                    name="image"
                                    required
                                    placeholder=" "
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    type="file"
                                    onChange={(event: any) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () => {
                                                setBase64Image(reader.result)
                                            }
                                            reader.readAsDataURL(file)
                                        }
                                    }}
                                />
                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"><FileUpload className="h-20 w-20 text-white" /></span>
                            </div>
                        </div>

                        {/* Email checkbox - always checked and hidden since emailCheck should always be true */}
                        <input name="emailCheck" type="hidden" value="on" />

                        <div className="flex gap-6 mt-6">
                            <button type="submit" className="font-montserrat w-40  bg-primary text-white py-2 rounded-md" disabled={isLoading}>
                                {isLoading ? "Sending..." : "Send Memo"}
                            </button>
                        </div>
                    </form>
                </Drawer>

                {/* View Memo */}
                <Drawer
                    isDrawerOpened={isViewDrawerOpen}
                    handleDrawerClosed={() => setIsViewDrawerOpen(false)}
                    title="View Memo"
                >
                    <div className="font-nunito text-xs !text-white flex flex-col gap-4 mt-6 p-4">
                        <span className="flex justify-between">
                            <p> Reference Number:</p>
                            <p>{dataValue?.refNumber}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> From Department:</p>
                            <p>{getDepartmentName(dataValue?.fromDepartment)}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> From Name:</p>
                            <p>{getUserName(dataValue?.fromName)}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> To Department:</p>
                            <p>{getDepartmentName(dataValue?.toDepartment)}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> To Name:</p>
                            <p>{getUserName(dataValue?.toName)}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> Memo Date:</p>
                            <p>{dataValue?.memoDate ? new Date(dataValue.memoDate).toLocaleDateString() : ''}</p>
                        </span><hr className="mt-4 border border-default-400" />

                        <span>
                            <p className="font-montseratt font-bold text-[15px]">Subject</p>
                            <div className="mt-4" dangerouslySetInnerHTML={{ __html: dataValue?.subject || '' }}></div>
                        </span><hr className="mt-4 border border-default-400" />

                        <span className="flex justify-between">
                            <p> Memo Type:</p>
                            <p>{dataValue?.memoType}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> Due Date:</p>
                            <p>{dataValue?.dueDate ? new Date(dataValue.dueDate).toLocaleDateString() : ''}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> Frequency:</p>
                            <p>{dataValue?.frequency}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> CC Department:</p>
                            <p>{getDepartmentName(dataValue?.ccDepartment)}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> CC Name:</p>
                            <p>{getUserName(dataValue?.ccName)}</p>
                        </span><hr className="mt-4 border border-default-400" />

                        <span>
                            <p className="font-montseratt font-bold text-[15px]">Remarks</p>
                            <div className="mt-4" dangerouslySetInnerHTML={{ __html: dataValue?.remark || '' }}></div>
                        </span><hr className="mt-4 border border-default-400" />
                        <span>
                            {dataValue?.image && <img src={dataValue.image} alt="" />}
                        </span>
                    </div>
                </Drawer>

                {/* Edit Memo */}
                <Drawer
                    isDrawerOpened={isEditDrawerOpen}
                    handleDrawerClosed={() => setIsEditDrawerOpen(false)}
                    title="Edit Memo"
                >
                    <form className="flex flex-col gap-6 p-4" onSubmit={handleUpdateMemo}>
                        <input
                            name="refNumber"
                            className="text-sm shadow-sm   border border-white/20   hover:border-b-action-primary hover:transition-all hover:duration-300 hover:ease-in-out bg-dashboard-secondary max-w-full h-10 rounded-xl pl-2"
                            value={dataValue?.refNumber} type="text" />

                        <div className="flex gap-6">
                            <FormSelect
                                label="From Department"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="fromDepartment"
                                options={departments}
                                optionKey="_id"
                                optionLabel="name"
                                dataValue={dataValue || {}}
                                setDataValue={setDataValue}
                                fieldName="fromDepartment"
                                isObject={true}

                            />
                            <FormSelect
                                label="From Name"
                                labelPlacement="outside"
                                placeholder="Select user"
                                isRequired
                                name="fromName"
                                options={users}
                                optionKey="_id"
                                optionLabel="firstName"
                                dataValue={dataValue || {}}
                                setDataValue={setDataValue}
                                fieldName="fromName"
                                isObject={true}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium !text-white">
                                Memo Date <span className="text-danger">*</span>
                            </label>
                            <input
                                type="date"
                                name="memoDate"
                                required
                                className="w-full px-3 py-2 border border-white/20 bg-dashboard-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-action-primary "
                                value={dataValue?.memoDate || ''}
                                onChange={(e) => setDataValue((prev: any) => ({
                                    ...prev,
                                    memoDate: e.target.value
                                }))}
                            />
                        </div>

                        <div className="flex gap-6">
                            <FormSelect
                                label="To Department"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="toDepartment"
                                options={departments}
                                optionKey="_id"
                                optionLabel="name"
                                dataValue={dataValue || {}}
                                setDataValue={setDataValue}
                                fieldName="toDepartment"
                                isObject={true}
                            />
                            <FormSelect
                                label="To Name"
                                labelPlacement="outside"
                                placeholder="Select user"
                                isRequired
                                name="toName"
                                options={users}
                                optionKey="_id"
                                optionLabel="firstName"
                                dataValue={dataValue || {}}
                                setDataValue={setDataValue}
                                fieldName="toName"
                                isObject={true}
                            />
                        </div>

                        <div>
                            <label htmlFor="" className="font-nunito !text-white">Subject</label>
                            <input type="hidden" name="subject" value={content} />
                            <ReactQuill
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                className='md:!h-[20vh] mt-2 font-nunito rounded w-full mb-12 !font-nunito'
                            />
                        </div>

                        <div className="flex gap-6 mt-6">
                            <FormSelect
                                label="Memo Type"
                                labelPlacement="outside"
                                placeholder="Select type"
                                isRequired
                                name="memoType"
                                options={[
                                    { key: "Open", value: "Open", display_name: "Open" },
                                    { key: "Processing", value: "Processing", display_name: "Processing" },
                                    { key: "Closed", value: "Closed", display_name: "Closed" },
                                ]}
                                dataValue={dataValue || {}}
                                setDataValue={setDataValue}
                                fieldName="memoType"
                            />
                            <div className="flex-1 flex flex-col gap-1">
                                <label className="text-sm font-medium !text-white">
                                    Due Date <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    required
                                    className="w-full px-3 py-2 border border-white/20 bg-dashboard-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-action-primary"
                                    value={dataValue?.dueDate || ''}
                                    onChange={(e) => setDataValue((prev: any) => ({
                                        ...prev,
                                        dueDate: e.target.value
                                    }))}
                                />
                            </div>
                        </div>

                        <FormSelect
                            label="Follow up Frequency"
                            labelPlacement="outside"
                            placeholder="Select frequency"
                            isRequired
                            name="frequency"
                            options={[
                                { key: "Every Day", value: "Every Day", display_name: "Every Day" },
                                { key: "Every Week", value: "Every Week", display_name: "Every Week" },
                                { key: "Every Month", value: "Every Month", display_name: "Every Month" },
                            ]}
                            dataValue={dataValue || {}}
                            setDataValue={setDataValue}
                            fieldName="frequency"
                        />

                        <div>
                            <label htmlFor="" className="font-nunito !text-white">Remarks</label>
                            <input type="hidden" name="remark" value={contentTwo} />
                            <ReactQuill
                                value={contentTwo}
                                onChange={setContentTow}
                                modules={modules}
                                className='md:!h-[20vh] mt-2 font-nunito rounded w-full mb-12 !font-nunito'
                            />
                        </div>

                        <div className="flex gap-6 mt-6">
                            <FormSelect
                                label="CC Department"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="ccDepartment"
                                options={departments}
                                optionKey="_id"
                                optionLabel="name"
                                dataValue={dataValue || {}}
                                setDataValue={setDataValue}
                                fieldName="ccDepartment"
                                isObject={true}
                            />
                            <FormSelect
                                label="CC Name"
                                labelPlacement="outside"
                                placeholder="Select user"
                                isRequired
                                name="ccName"
                                options={users}
                                optionKey="_id"
                                optionLabel="firstName"
                                dataValue={dataValue || {}}
                                setDataValue={setDataValue}
                                fieldName="ccName"
                                isObject={true}
                            />
                        </div>

                        <div className=" ">
                            <input name="base64Image" value={base64Image} type="hidden" />
                            <label className="font-nunito block text-sm !text-white" htmlFor="image">Image</label>
                            <div className="relative inline-block w-40 h-40 border-2 border-dashed border-gray-400 rounded-xl dark:border-white/30 mt-2">
                                <input
                                    name="image"
                                    id="image"
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setBase64Image(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
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
                                        <Upload className="h-14 w-14 text-gray-400" />
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Email checkbox - always checked and hidden since emailCheck should always be true */}
                        <input name="emailCheck" type="hidden" value="on" />

                        <div className="flex gap-6 mt-6">
                            <button type="submit" className="font-montserrat w-40 !bg-primary text-white py-2 rounded-md" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update Memo"}
                            </button>
                        </div>
                    </form>
                </Drawer>
            </div>

            <ConfirmModal header="Confirm Delete" content="Are you sure to delete this memo?" isOpen={isConfirmModalOpened} onOpenChange={handleConfirmModalClosed}>
                <div className="flex gap-4">
                    <Button color="success" variant="flat" className="font-montserrat font-semibold" size="sm" onPress={handleConfirmModalClosed}>
                        No
                    </Button>
                    <Button color="danger" variant="flat" className="font-montserrat font-semibold " size="sm" onClick={handleDeleteMemo} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Yes"}
                    </Button>
                </div>
            </ConfirmModal>

            <Toaster />
        </AdminLayout>
    );
};

export default Users;

