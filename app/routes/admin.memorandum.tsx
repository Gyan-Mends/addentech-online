import { Avatar, Button, Checkbox, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem, Skeleton, TableCell, TableRow, User } from "@nextui-org/react";
import FormSelect from "~/components/form/FormSelect";
import { ActionFunction, json, LinksFunction, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import BackIcon from "~/components/icons/BackIcon";
import CloseIcon from "~/components/icons/CloseIcon";
import { DeleteIcon } from "~/components/icons/DeleteIcon";
import { EditIcon } from "~/components/icons/EditIcon";
import NotificationIcon from "~/components/icons/NotificationIcon";
import PlusIcon from "~/components/icons/PlusIcon";
import { SearchIcon } from "~/components/icons/SearchIcon";
import UserIcon from "~/components/icons/UserIcon";
import ConfirmModal from "~/components/modal/confirmModal";
import CreateModal from "~/components/modal/createModal";
import EditModal from "~/components/modal/EditModal";
import NewCustomTable from "~/components/table/newTable";
import { errorToast, successToast } from "~/components/toast";
import CustomInput from "~/components/ui/CustomInput";
import department from "~/controller/departments";
import taskController from "~/controller/task";
import usersController from "~/controller/Users";
import { DepartmentInterface, MemoInterface, RegistrationInterface } from "~/interface/interface";
import AdminLayout from "~/layout/adminLayout";
import { getSession } from "~/session";
import { v4 as uuidv4 } from "uuid";
import { FileUploader } from "~/components/icons/uploader";
import memo from "~/controller/memeo";
import memoController from "~/controller/memeo";
import { MemoColumns } from "~/components/table/columns";
import { ChevronDownIcon } from "~/components/icons/ArrowDown";
import { EyeIcon } from "~/components/icons/EyeIcon";
import { Plus, FileText, Download, ChevronsDownIcon, DownloadCloudIcon, Upload } from "lucide-react";
import Drawer from "~/components/modal/drawer";
import Registration from "~/modal/registration";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" }];
};

const Users = () => {
    const [isCreateModalOpened, setIsCreateModalOpened] = useState(false);
    const [base64Image, setBase64Image] = useState<any>();
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false);
    const [isEditModalOpened, setIsEditModalOpened] = useState(false);
    const [dataValue, setDataValue] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);
    const submit = useSubmit();
    const actionData = useActionData<any>();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
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

    console.log("This is the ref:" + referenceNumber);

    function formatTime(date: Date) {
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${(hours % 12) || 12}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
        return isToday ? `${formattedTime} Today` : formattedTime;
    }

    const {
        departments,
        memos,
        totalPages,
        users,
        currentUser
    } = useLoaderData<{
        departments: DepartmentInterface[]
        users: RegistrationInterface[]
        memos: MemoInterface[]
        totalPages: number
        currentUser: RegistrationInterface
    }>()

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message);
            } else {
                errorToast(actionData.message);
            }
        }
    }, [actionData]);

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setIsLoading(true);
        }, 1000);
        return () => clearTimeout(timeOut);
    }, []);

    // Filter users by department when to department changes
    useEffect(() => {
        if (toDepartmentValue) {
            const filteredUsers = users.filter(user => user.department === toDepartmentValue);
            setToUsers(filteredUsers);
        } else {
            setToUsers([]);
        }
        setToNameValue(""); // Reset selection when department changes
    }, [toDepartmentValue, users]);

    // Filter users by department when cc department changes
    useEffect(() => {
        if (ccDepartmentValue) {
            const filteredUsers = users.filter(user => user.department === ccDepartmentValue);
            setCcUsers(filteredUsers);
        } else {
            setCcUsers([]);
        }
        setCcNameValue(""); // Reset selection when department changes
    }, [ccDepartmentValue, users]);

    const generateRandomReference = () => {
        return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    };

    const handleConfirmModalClosed = () => {
        setIsConfirmModalOpened(false)
    }

    const handleClick = () => {
        setIsDrawerOpen(!isDrawerOpen)
        const randomRef = generateRandomReference();
        setReferenceNumber(randomRef);
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
        if (dataValue?.image) {
            setBase64Image(dataValue.image);
        }
    }, [dataValue]);

    useEffect(() => {
        if (dataValue?.fromDepartment && typeof dataValue.fromDepartment === 'object') {
            setDepartmentValue((dataValue.fromDepartment as DepartmentInterface)._id);
        }
    }, [dataValue]);

    useEffect(() => {
        if (dataValue?.fromName && typeof dataValue.fromName === 'object') {
            setFromNameValue((dataValue.fromName as RegistrationInterface)._id);
        }
    }, [dataValue]);

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
                    <Button className="border border-white/30 px-4 py-1 bg-pink-500 text-white" onClick={() => {
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
                    loadingState={navigation.state === "loading" ? "loading" : "idle"}
                    totalPages={totalPages}
                    page={1}
                    setPage={(page) => (
                        navigate(`?page=${page}`)
                    )}>
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
                                    <DeleteIcon className="text-red-500" />
                                </button>
                                <button onClick={() => {
                                    handleEdit(memo);
                                }}>
                                    <EditIcon className="text-blue-500" />
                                </button>
                                <button onClick={() => {
                                    setIsViewDrawerOpen(true)
                                    setDataValue(memo)
                                }}>
                                    <EyeIcon className="" />
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
                    <Form className="flex flex-col gap-6 p-4" method="post">
                        <input
                            name="refNumber"
                            className="text-sm dark:bg-default-50 shadow-sm border border-black/30 hover:border-b-pink-500 hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full h-10 rounded-xl pl-2"
                            value={referenceNumber} 
                            type="text" 
                            readOnly
                        />

                        <div className="flex gap-6">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-foreground-700 block mb-2">
                                    From Department <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
                                    value={currentUser?.department ? 
                                        departments.find(d => d._id === currentUser.department)?.name || 'Department not found' : 
                                        'No department assigned'}
                                    readOnly
                                />
                                <input name="fromDepartment" type="hidden" value={currentUser?.department || ''} />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-foreground-700 block mb-2">
                                    From Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
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
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "z-[10000] bg-white shadow-sm dark:bg-default-50 border border-black/5 font-nunito ",
                                    trigger: " shadow-sm   border border-black/30 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full !bg-white  "
                                }}
                            >
                                {departments.map((department: DepartmentInterface) => (
                                    <SelectItem key={department._id}>{department.name}</SelectItem>
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
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "z-[10000] bg-white shadow-sm dark:bg-default-50 border border-black/5 font-nunito ",
                                    trigger: " shadow-sm   border border-black/30 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full !bg-white  "
                                }}
                            >
                                {toUsers.map((user: any) => (
                                    <SelectItem key={user._id}>{`${user.firstName} ${user.lastName}`}</SelectItem>
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
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "z-[10000] bg-white shadow-sm dark:bg-default-50 border border-black/5 font-nunito ",
                                    trigger: " shadow-sm   border border-black/30 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full !bg-white  "
                                }}
                            >
                                {[
                                    { key: "Open", value: "Open", display_name: "Open" },
                                    { key: "Processing", value: "Processing", display_name: "Processing" },
                                    { key: "Closed", value: "Closed", display_name: "Closed" },
                                ].map((role) => (
                                    <SelectItem key={role.key}>{role.display_name}</SelectItem>
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
                                label: "font-nunito text-sm text-default-100",
                                popoverContent: "z-[10000] bg-white shadow-sm dark:bg-default-50 border border-black/5 font-nunito ",
                                trigger: " shadow-sm   border border-black/30 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full !bg-white  "
                            }}
                        >
                            {[
                                { key: "Every Day", value: "Every Day", display_name: "Every Day" },
                                { key: "Every Week", value: "Every Week", display_name: "Every Week" },
                                { key: "Every Month", value: "Every Month", display_name: "Every Month" },
                            ].map((role) => (
                                <SelectItem key={role.key}>{role.display_name}</SelectItem>
                            ))}
                        </Select>

                        <div>
                            <label htmlFor="" className="font-nunito">Remarks</label>
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
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "z-[10000] bg-white shadow-sm dark:bg-default-50 border border-black/5 font-nunito ",
                                    trigger: " shadow-sm   border border-black/30 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full !bg-white  "
                                }}
                            >
                                {departments.map((department: DepartmentInterface) => (
                                    <SelectItem key={department._id}>{department.name}</SelectItem>
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
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "z-[10000] bg-white shadow-sm dark:bg-default-50 border border-black/5 font-nunito ",
                                    trigger: " shadow-sm   border border-black/30 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full !bg-white  "
                                }}
                            >
                                {ccUsers.map((user: any) => (
                                    <SelectItem key={user._id}>{`${user.firstName} ${user.lastName}`}</SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className=" ">
                            <label className="font-nunito block text-sm" htmlFor="">Image</label>
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
                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"><FileUploader className="h-20 w-20 text-white" /></span>
                            </div>
                        </div>

                        {/* Email checkbox - always checked and hidden since emailCheck should always be true */}
                        <input name="emailCheck" type="hidden" value="on" />

                        <div className="flex gap-6 mt-6">
                            <button color="primary" className="font-montserrat w-40">Send Memo</button>
                        </div>

                        <input name="intent" value="create" type="hidden" />
                        <input name="base64Image" value={base64Image} type="hidden" />

                    </Form>
                </Drawer>

                {/* View Memo */}
                <Drawer
                    isDrawerOpened={isViewDrawerOpen}
                    handleDrawerClosed={() => setIsViewDrawerOpen(false)}
                    title="View Memo"
                >
                    <div className="font-nunito text-xs flex flex-col gap-4 mt-6 p-4">
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
                    <Form className="flex flex-col gap-6 p-4" method="post">
                        <input
                            name="refNumber"
                            className="text-sm dark:bg-default-50 shadow-sm   border border-black/30   hover:border-b-pink-500 hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full h-10 rounded-xl pl-2"
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
                            <label className="text-sm font-medium text-foreground-700">
                                Memo Date <span className="text-danger">*</span>
                            </label>
                            <input
                                type="date"
                                name="memoDate"
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                                <label className="text-sm font-medium text-foreground-700">
                                    Due Date <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                            <label htmlFor="" className="font-nunito">Remarks</label>
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
                            <label className="font-nunito block text-sm !text-black" htmlFor="image">
                                Image
                            </label>
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
                            <button color="primary" className="font-montserrat w-40">Update Memo</button>
                        </div>

                        <input name="intent" value="update" type="hidden" />
                        <input name="base64Image" value={base64Image} type="hidden" />
                        <input name="id" value={dataValue?._id} type="hidden" />

                    </Form>
                </Drawer>
            </div>

            <ConfirmModal header="Confirm Delete" content="Are you sure to delete this memo?" isOpen={isConfirmModalOpened} onOpenChange={handleConfirmModalClosed}>
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
        </AdminLayout>
    );
};

export default Users;

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    const refNumber = formData.get("refNumber") as string;
    const fromDepartment = formData.get("fromDepartment") as string;
    const fromName = formData.get("fromName") as string;
    const memoDate = formData.get("memoDate") as string;
    const toDepartment = formData.get("toDepartment") as string;
    const toName = formData.get("toName") as string;
    const subject = formData.get("subject") as string;
    const memoType = formData.get("memoType") as string;
    const dueDate = formData.get("dueDate") as string;
    const frequency = formData.get("frequency") as string;
    const remark = formData.get("remark") as string;
    const ccDepartment = formData.get("ccDepartment") as string;
    const ccName = formData.get("ccName") as string;
    const base64Image = formData.get("base64Image") as string
    const emailCheck = true; // Always true as requested
    const intent = formData.get("intent") as string
    const id = formData.get("id") as string;

    // Get current user for email sending
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");
    const currentUser = token ? await Registration.findOne({ email: token }) : null;

    if (!currentUser) {
        return json({
            message: "User not authenticated",
            success: false,
            status: 401
        });
    }

    switch (intent) {
        case "create":
            const memo = await memoController.Memo({
                refNumber,
                fromDepartment,
                fromName,
                memoDate,
                toDepartment,
                toName,
                subject,
                memoType,
                dueDate,
                frequency,
                remark,
                ccDepartment,
                ccName,
                emailCheck,
                base64Image,
                currentUser,
            })
            return memo

        case "update":
            const updateMemo = await memoController.UpdateMemo({
                id,
                refNumber,
                fromDepartment,
                fromName,
                memoDate,
                toDepartment,
                toName,
                subject,
                memoType,
                dueDate,
                frequency,
                remark,
                ccDepartment,
                ccName,
                emailCheck,
                base64Image,
                currentUser,
            })
            return updateMemo

        case "delete":
            const deleteMemo = await memoController.DeleteMemo({
                id
            })
            return deleteMemo

        default:
            return json({
                message: "Invalid intent",
                success: false,
                status: 400
            })
    }
};

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") as string;
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");

    if (!token) {
        return redirect("/addentech-login");
    }

    // Get current user without populating department to keep it as ID
    const currentUser = await Registration.findOne({ email: token });
    
    if (!currentUser) {
        return redirect("/addentech-login");
    }

    const { departments } = await department.getDepartments({
        request,
        page,
        search_term,
    });

    const { users } = await usersController.FetchUsers({
        request,
        page,
        search_term,
    });
    
    const { memos, totalPages } = await memoController.FetchMemo({
        request,
        page,
        search_term,
    });

    return json({ departments, memos, totalPages, users, currentUser });
};

export const meta: MetaFunction = () => {
    return [
        { title: "Memorandum | Point of Sale" },
        {
            name: "description",
            content: "Manage organizational memorandums.",
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