import { Avatar, Button, Checkbox, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem, Skeleton, TableCell, TableRow, User } from "@nextui-org/react";
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
export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" }];
};

const Users = () => {
    const [isCreateModalOpened, setIsCreateModalOpened] = useState(false);
    const [base64Image, setBase64Image] = useState<any>();
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false);
    const [isEditModalOpened, setIsEditModalOpened] = useState(false);
    const [dataValue, setDataValue] = useState<MemoInterface>();
    const [isLoading, setIsLoading] = useState(false);
    const submit = useSubmit();
    const actionData = useActionData<any>();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState('');
    console.log("This is the ref:" + referenceNumber);
    const [content, setContent] = useState("");
    const [contentTwo, setContentTow] = useState("");
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
        users
    } = useLoaderData<{
        departments: DepartmentInterface[]
        users: RegistrationInterface[]
        memos: MemoInterface[]
        totalPages: number
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



    return (
        <AdminLayout handleOnClick={handleClick} pageName="Users Management">
            <div>


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
                            <TableCell>{memo.fromDepartment?.name}</TableCell>
                            <TableCell>{memo.fromName?.firstName}</TableCell>
                            <TableCell>{memo.toDepartment?.name}</TableCell>
                            <TableCell>{memo.toName?.firstName}</TableCell>
                            <TableCell>{new Date(memo?.memoDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(memo?.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell className="flex gap-2">
                                <button onClick={() => {
                                    setIsConfirmModalOpened(true)
                                    setDataValue(memo)
                                }}>
                                    <DeleteIcon />
                                </button>
                                <button onClick={() => {
                                    setIsEditDrawerOpen(true)
                                    setDataValue(memo)
                                }}>
                                    <EditIcon />
                                </button>
                                <button onClick={() => {
                                    setIsViewDrawerOpen(true)
                                    setDataValue(memo)
                                }}>
                                    <EyeIcon className="" />
                                </button>
                                <button>
                                    <ChevronDownIcon />
                                </button>
                            </TableCell>

                        </TableRow>
                    ))}
                </NewCustomTable>


                {/* Creeat memo drawer */}
                {/* Creeat memo drawer */}
                <div
                    className={`w-[40vw] h-[100vh] bg-default-50 overflow-y-scroll border dark:border-white/10  fixed top-0 right-0 z-10 transition-transform duration-500 p-6 ${isDrawerOpen ? "transform-none" : "translate-x-full"}`}
                >
                    <div className="flex justify-between gap-10 ">
                        <p className="font-nunito">Create a new memo</p>
                        <button
                            onClick={() => {
                                setIsDrawerOpen(false);
                            }}
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <hr className="mt-4 border border-default-400" />

                    <Form className="flex flex-col gap-6 pt-4" method="post">
                        <input
                            name="refNumber"
                            className="text-sm dark:bg-default-50 shadow-sm   border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full h-10 rounded-xl pl-2"
                            value={referenceNumber} type="text" />

                        <div className="flex gap-6">
                            <Select
                                label="From Department"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="fromDepartment"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                }}
                            >
                                {departments.map((department: DepartmentInterface) => (
                                    <SelectItem key={department._id}>{department.name}</SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="From Name"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="fromName"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                }}
                            >
                                {users.map((user: RegistrationInterface) => (
                                    <SelectItem key={user._id}>{user.firstName}</SelectItem>
                                ))}
                            </Select>
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
                            classNames={{
                                label: "font-nunito text-sm text-default-100",
                                popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                            }}
                        >
                            {departments.map((department: DepartmentInterface) => (
                                <SelectItem key={department._id}>{department.name}</SelectItem>
                            ))}
                        </Select>
                        <Select
                            label="To Name"
                            labelPlacement="outside"
                            placeholder="Select department"
                            isRequired
                                name="toName"
                            classNames={{
                                label: "font-nunito text-sm text-default-100",
                                popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                            }}
                        >
                            {users.map((user: RegistrationInterface) => (
                                <SelectItem key={user._id}>{user.firstName}</SelectItem>
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
                                placeholder="Select department"
                                isRequired
                                name="memoType"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
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
                            placeholder="Select department"
                            isRequired
                            name="frequency"
                            classNames={{
                                label: "font-nunito text-sm text-default-100",
                                popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-full",
                            }}
                        >
                            {[
                                { key: "Evey Day", value: "Evey Day", display_name: "Evey Day" },
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
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                }}
                            >
                                {departments.map((department: DepartmentInterface) => (
                                    <SelectItem key={department._id}>{department.name}</SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="CC Name"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="ccName"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                }}
                            >
                                {users.map((user: RegistrationInterface) => (
                                    <SelectItem key={user._id}>{user.firstName}</SelectItem>
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
                                        const file = event.target.files[0];
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


                        <Checkbox name="emailCheck" className="font-nunito" defaultSelected>Send Email Notification</Checkbox>

                        <div className="flex gap-6 mt-6">
                            <button color="primary" className="font-montserrat w-40">Send Memo</button>
                        </div>

                        <input name="admin" value="{user?._id}" type="hidden" />
                        <input name="intent" value="create" type="hidden" />
                        <input name="base64Image" value={base64Image} type="hidden" />

                    </Form>
                </div>

                <div
                    className={`w-[20vw] h-[100vh] bg-default-50 overflow-y-scroll border dark:border-white/10  fixed top-0 right-0 z-10 transition-transform duration-500 p-6 ${isViewDrawerOpen ? "transform-none" : "translate-x-full"}`}
                >
                    <div className="flex justify-between gap-10 ">
                        <p className="font-nunito">Memo Details</p>
                        <button
                            onClick={() => {
                                setIsViewDrawerOpen(false);
                            }}
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <hr className="mt-4 border border-default-400" />

                    <div className="font-nunito text-xs flex flex-col gap-4 mt-6">
                        <span className="flex justify-between">
                            <p> Reference Number:</p>
                            <p>{dataValue?.refNumber}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> From Department:</p>
                            <p>{dataValue?.fromDepartment.name}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> From Name:</p>
                            <p>{dataValue?.fromName.firstName + " " + dataValue?.fromName.middleName + " " + dataValue?.fromName.lastName}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> To Department:</p>
                            <p>{dataValue?.toDepartment.name}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> To Name:</p>
                            <p>{dataValue?.toName.firstName + " " + dataValue?.toName.middleName + " " + dataValue?.toName.lastName}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> Memo Date:</p>
                            <p>{new Date(dataValue?.memoDate).toLocaleDateString()}</p>
                        </span><hr className="mt-4 border border-default-400" />

                        <span>
                            <p className="font-montseratt font-bold text-[15px]">Subject</p>
                            <p className="mt-4">{dataValue?.subject}</p>
                        </span><hr className="mt-4 border border-default-400" />

                        <span className="flex justify-between">
                            <p> Memo Type:</p>
                            <p>{dataValue?.memoType}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> Due Date:</p>
                            <p>{new Date(dataValue?.dueDate).toLocaleDateString()}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> Frequency:</p>
                            <p>{dataValue?.frequency}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> CC Department:</p>
                            <p>{dataValue?.ccDepartment.name}</p>
                        </span>
                        <span className="flex justify-between">
                            <p> CC Name:</p>
                            <p>{dataValue?.ccName.firstName + " " + dataValue?.ccName.middleName + " " + dataValue?.ccName.lastName}</p>
                        </span><hr className="mt-4 border border-default-400" />

                        <span>
                            <p className="font-montseratt font-bold text-[15px]">Subject</p>
                            <p className="mt-4">{dataValue?.subject}</p>
                        </span><hr className="mt-4 border border-default-400" />
                        <span>
                            <img src={dataValue?.image} alt="" />
                        </span>
                    </div>
                </div>

                {/* Edit Memo */}
                <div
                    className={`w-[40vw] h-[100vh] bg-default-50 overflow-y-scroll border dark:border-white/10  fixed top-0 right-0 z-10 transition-transform duration-500 p-6 ${isEditDrawerOpen ? "transform-none" : "translate-x-full"}`}
                >
                    <div className="flex justify-between gap-10 ">
                        <p className="font-nunito">Edit memo</p>
                        <button
                            onClick={() => {
                                setIsEditDrawerOpen(false);
                            }}
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <hr className="mt-4 border border-default-400" />

                    <Form className="flex flex-col gap-6 pt-4" method="post">
                        <input
                            name="refNumber"
                            className="text-sm dark:bg-default-50 shadow-sm   border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full h-10 rounded-xl pl-2"
                            value={referenceNumber} type="text" />

                        <div className="flex gap-6">
                            <Select
                                label="From Department"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="fromDepartment"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                }}
                            >
                                {departments.map((department: DepartmentInterface) => (
                                    <SelectItem key={department._id}>{department.name}</SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="From Name"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="fromName"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                }}
                            >
                                {users.map((user: RegistrationInterface) => (
                                    <SelectItem key={user._id}>{user.firstName}</SelectItem>
                                ))}
                            </Select>
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
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                }}
                            >
                                {departments.map((department: DepartmentInterface) => (
                                    <SelectItem key={department._id}>{department.name}</SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="To Name"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="toName"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                }}
                            >
                                {users.map((user: RegistrationInterface) => (
                                    <SelectItem key={user._id}>{user.firstName}</SelectItem>
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
                                placeholder="Select department"
                                isRequired
                                name="memoType"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
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
                            placeholder="Select department"
                            isRequired
                            name="frequency"
                            classNames={{
                                label: "font-nunito text-sm text-default-100",
                                popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-full",
                            }}
                        >
                            {[
                                { key: "Evey Day", value: "Evey Day", display_name: "Evey Day" },
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
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                }}
                            >
                                {departments.map((department: DepartmentInterface) => (
                                    <SelectItem key={department._id}>{department.name}</SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="CC Name"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="ccName"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-default-50 border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                }}
                            >
                                {users.map((user: RegistrationInterface) => (
                                    <SelectItem key={user._id}>{user.firstName}</SelectItem>
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
                                        const file = event.target.files[0];
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


                        <Checkbox name="emailCheck" className="font-nunito" defaultSelected>Send Email Notification</Checkbox>

                        <div className="flex gap-6 mt-6">
                            <button color="primary" className="font-montserrat w-40">Send Memo</button>
                        </div>

                        <input name="admin" value="{user?._id}" type="hidden" />
                        <input name="intent" value="create" type="hidden" />
                        <input name="base64Image" value={base64Image} type="hidden" />

                    </Form>
                </div>
            </div>

            <ConfirmModal className="dark:bg-default-50 border border-white/10" header="Confirm Delete" content="Are you sure to delete user?" isOpen={isConfirmModalOpened} onOpenChange={handleConfirmModalClosed}>
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
    const emailCheck = formData.get("emailCheck") === "on";
    const intent = formData.get("intent") as string
    const id = formData.get("id") as string;




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
            })
            return memo

        case "delete":
            const deleteMemo = await memoController.DeleteMemo({
                id
            })
            return deleteMemo

            break;

        default:
            break;
    }





};


export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") as string;
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");

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

    return json({ departments, memos, totalPages, users });
};




export const meta: MetaFunction = () => {
    return [
        { title: "Sales | Point of Sale" },
        {
            name: "description",
            content: ".",
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