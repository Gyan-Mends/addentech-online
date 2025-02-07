import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem, Skeleton, TableCell, TableRow, Textarea, Tooltip, User } from "@nextui-org/react"
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react"
import { log } from "node:console"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import BackIcon from "~/components/icons/BackIcon"
import CloseIcon from "~/components/icons/CloseIcon"
import CommentIcon from "~/components/icons/comment"
import { DeleteIcon } from "~/components/icons/DeleteIcon"
import { EditIcon } from "~/components/icons/EditIcon"
import ElipIcon from "~/components/icons/ElipIcon"
import { EyeIcon } from "~/components/icons/EyeIcon"
import NotificationIcon from "~/components/icons/NotificationIcon"
import PlusIcon from "~/components/icons/PlusIcon"
import { SearchIcon } from "~/components/icons/SearchIcon"
import TaskIcon from "~/components/icons/TaskIcon"
import UserIcon from "~/components/icons/UserIcon"
import ConfirmModal from "~/components/modal/confirmModal"
import CreateModal from "~/components/modal/createModal"
import EditModal from "~/components/modal/EditModal"
import { taskColumn, UserColumns } from "~/components/table/columns"
import NewCustomTable from "~/components/table/newTable"
import { errorToast, successToast } from "~/components/toast"
import CustomInput from "~/components/ui/CustomInput"
import department from "~/controller/departments"
import taskController from "~/controller/task"
import usersController from "~/controller/Users"
import { DepartmentInterface, RegistrationInterface, TaskInterface } from "~/interface/interface"
import AdminLayout from "~/layout/adminLayout"
import HODLayout from "~/layout/hodLayout"
import { getSession } from "~/session"

const Users = () => {
    const [isCreateModalOpened, setIsCreateModalOpened] = useState(false)
    const [base64Image, setBase64Image] = useState<any>()
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false)
    const [isDeleteConfirmModalOpened, setIsDeleteConfirmModalOpened] = useState(false)
    const [isPriorityConfirmModalOpened, setIsPriorityConfirmModalOpened] = useState(false)
    const [isEditModalOpened, setIsEditModalOpened] = useState(false)
    const [dataValue, setDataValue] = useState<TaskInterface>()
    const [isLoading, setIsLoading] = useState(false)
    const submit = useSubmit()
    const actionData = useActionData<any>()
    const { mobileNumberApi } = useLoaderData<typeof loader>()
    const navigate = useNavigate()
    const navigation = useNavigation()
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
        user,
        tasks,
        totalPages,
        departments,
        selectByDepartment
    } = useLoaderData<{
        user: { _id: string },
        tasks: TaskInterface[],
        totalPages: number,
        departments: DepartmentInterface[]
        selectByDepartment: RegistrationInterface
    }>()

    const handleCreateModalClosed = () => {
        setIsCreateModalOpened(false)
    }
    const handleConfirmModalClosed = () => {
        setIsConfirmModalOpened(false)
    }
    const handleEditModalClosed = () => {
        setIsEditModalOpened(false)
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

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
        }
        return text;
    };

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [isViewCommentOpen, setIsViewCommentOpen] = useState(false);
    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };
    const assignDrawer = () => {
        setIsAssignOpen(!isAssignOpen);
    };
    const commentDrawer = () => {
        setIsCommentOpen(!isCommentOpen);
    };
    const ViewcommentDrawer = () => {
        setIsViewCommentOpen(!isViewCommentOpen)
    };




    return (
        <AdminLayout handleOnClick={commentDrawer} pageName="Users Management">
            <div>
                <div className="z-1">





                    {/* table  */}
                    {/* table  */}
                    <div className="grid grid-cols-4 mt-4 gap-8">
                        {tasks?.map((task: TaskInterface, index: number) => (
                            <div
                                className="h-full border bg-default-100 w-full rounded-xl dark:border-default-200 p-2"
                                key={index}
                            >
                                <div className="flex justify-between">
                                    <Button
                                        onClick={() => {
                                            setDataValue(task)
                                            setIsPriorityConfirmModalOpened(true)
                                        }}
                                        variant="flat"
                                        size="sm"
                                        color="success"
                                        className={`w-20 rounded-xl bg-opacity-20 font-nunito ${task.priority === "low"}`}
                                    >
                                        {task.priority}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setDataValue(task)
                                            setIsConfirmModalOpened(true)
                                        }}
                                        variant="flat"
                                        size="sm"
                                        color="danger"
                                        className={`w-20 rounded-xl bg-opacity-20 font-nunito `}
                                    >
                                        {task.status}
                                    </Button>



                                    <Dropdown placement="bottom-end">
                                        <DropdownTrigger>
                                            <button>
                                                <ElipIcon className="h-4 w-4" />

                                            </button>
                                        </DropdownTrigger>
                                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                                            <DropdownItem key="profile" >
                                                <button

                                                    onClick={() => {
                                                        setDataValue(task)
                                                        setIsDeleteConfirmModalOpened(true)
                                                    }}
                                                    className="flex items-center gap-2 text-danger w-full">
                                                    <DeleteIcon /> Delete
                                                </button>
                                            </DropdownItem>
                                            <DropdownItem key="profile" >
                                                <button className="flex items-center gap-2 text-primary">
                                                    <EditIcon /> Edit
                                                </button>
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                                <p className="mt-2 font-bold font-montserrat">{task.title}</p>
                                <p className="mt-2 text-xs font-nunito">{truncateText(task.description, 20)}</p><hr className="border dark:border-default-200 border-1 mt-4" />
                                <div className="flex mt-4 flex items-center justify-between gap-6">
                                    <div className="flex  gap-4">
                                        <Link
                                            to={`/hod/task/${task._id}`}
                                        >
                                            <button className="flex gap-1 font-nunito text-sm">
                                                <EyeIcon className="h-4 w-4" /> View
                                            </button>
                                        </Link>
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <button className="flex gap-1 font-nunito text-sm">
                                                    <CommentIcon className=" h-4 w-4" /> Comment(0)
                                                </button>

                                            </DropdownTrigger>
                                            <DropdownMenu aria-label="Example with disabled actions" disabledKeys={["edit", "delete"]}>
                                                <DropdownItem key="new"><button className="flex gap-2 font-nunito text-sm" onClick={() => {
                                                    setDataValue(task);
                                                    commentDrawer();
                                                }}>
                                                    <PlusIcon className="" /> Add Comment
                                                </button></DropdownItem>
                                                <DropdownItem key="new"><button className="flex gap-2 font-nunito text-sm" onClick={() => {
                                                    setDataValue(task);
                                                    ViewcommentDrawer();
                                                }}>
                                                    <EyeIcon className="" /> View Comments
                                                </button></DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>

                                        <button className="flex gap-2 font-nunito text-sm" onClick={() => {
                                            setDataValue(task);
                                            commentDrawer();
                                        }}>
                                        </button>
                                    </div>

                                    <div>
                                        <Button onClick={() => {
                                            setDataValue(task);
                                            assignDrawer();
                                        }} size="sm">
                                            Assign Task
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* confirm modal */}
                    {/* confirm modal */}
                    <ConfirmModal className="dark:bg-default border border-white/5" header="Confirm Status Update" content="Are you sure to update the status of this project?" isOpen={isConfirmModalOpened} onOpenChange={handleConfirmModalClosed}>
                        <div className="flex gap-4">
                            <Button color="success" variant="flat" className="font-montserrat font-semibold" size="sm" onPress={handleConfirmModalClosed}>
                                No
                            </Button>
                            <Button color="danger" variant="flat" className="font-montserrat font-semibold " size="sm" onClick={() => {
                                setIsConfirmModalOpened(false)
                                if (dataValue) {
                                    // Assuming you are toggling between "Unclaimed" and "Approved"
                                    const newStatus = dataValue.status === "Unclaimed" ? "Approved" : "Unclaimed";

                                    submit({
                                        intent: "updateStatus",
                                        id: dataValue?._id,
                                        status: newStatus // Pass the new status to the backend
                                    }, {
                                        method: "post"
                                    });
                                }
                            }} >
                                Yes
                            </Button>
                        </div>
                    </ConfirmModal>

                    <ConfirmModal className="dark:bg-default border border-white/5" header="Confirm Delete" content="Are you sure to update the status of this project?" isOpen={isDeleteConfirmModalOpened} onOpenChange={() => {
                        setIsDeleteConfirmModalOpened(false)
                    }}>
                        <div className="flex gap-4">
                            <Button color="success" variant="flat" className="font-montserrat font-semibold" size="sm" onPress={() => {
                                setIsDeleteConfirmModalOpened(false)
                            }}>
                                No
                            </Button>
                            <Button color="danger" variant="flat" className="font-montserrat font-semibold " size="sm" onClick={() => {
                                setIsConfirmModalOpened(false)
                                if (dataValue) {
                                    // Assuming you are toggling between "Unclaimed" and "Approved"
                                    const newStatus = dataValue.status === "Unclaimed" ? "Approved" : "Unclaimed";

                                    submit({
                                        intent: "delete",
                                        id: dataValue?._id,
                                        status: newStatus // Pass the new status to the backend
                                    }, {
                                        method: "post"
                                    });
                                }
                            }} >
                                Yes
                            </Button>
                        </div>
                    </ConfirmModal>

                    <ConfirmModal className="dark:bg-default border border-white/5" header="Confirm Priority Update" content="Are you sure to update the priority of this project?" isOpen={isPriorityConfirmModalOpened} onOpenChange={() => {
                        setIsPriorityConfirmModalOpened(false)
                    }}>
                        <div className="flex gap-4">
                            <Button color="success" variant="flat" className="font-montserrat font-semibold" size="sm" onPress={() => {
                                setIsPriorityConfirmModalOpened(false)
                            }}>
                                No
                            </Button>
                            <Button color="danger" variant="flat" className="font-montserrat font-semibold " size="sm" onClick={() => {
                                setIsPriorityConfirmModalOpened(false)
                                if (dataValue) {
                                    // Assuming you are toggling between "low", "medium", and "high"
                                    const newPriority =
                                        dataValue.priority === "low" ? "medium" :
                                            dataValue.priority === "medium" ? "high" : "low";

                                    submit({
                                        intent: "updatePriority",
                                        id: dataValue?._id,
                                        priority: newPriority // Pass the new priority to the backend
                                    }, {
                                        method: "post"
                                    });
                                }

                            }} >
                                Yes
                            </Button>
                        </div>
                    </ConfirmModal>

                    {/* Create Modal */}
                    {/* Create Modal */}
                    <EditModal
                        className="bg-gray-200 dark:bg-[#333]"
                        modalTitle="Update Task Details"
                        isOpen={isEditModalOpened}
                        onOpenChange={handleEditModalClosed}
                    >
                        {(onClose) => (
                            <Form method="post" className="flex flex-col gap-4">
                                <CustomInput
                                    label="Task Title"
                                    isRequired
                                    name="title"
                                    isClearable
                                    placeholder="Enter task title"
                                    defaultValue={dataValue?.title}
                                    type="text"
                                    labelPlacement="outside"
                                />

                                <Textarea
                                    label="Description"
                                    isRequired
                                    name="description"
                                    placeholder="Enter task description"
                                    defaultValue={dataValue?.description}
                                    type="text"
                                    labelPlacement="outside"
                                    classNames={{
                                        inputWrapper:
                                            "bg-white shadow-sm dark:bg-[#333] border border-white/30 focus:bg-[#333] hover:border-b-success hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm",
                                    }}
                                />

                                <div className="flex gap-4">
                                    {/* Status Select */}
                                    <Select
                                        label="Status"
                                        labelPlacement="outside"
                                        placeholder="Select task status"
                                        isRequired
                                        name="status"
                                        defaultValue={dataValue?.status} // Existing value from database
                                        classNames={{
                                            label: "font-nunito text-sm text-default-100",
                                            popoverContent:
                                                "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                            trigger:
                                                "bg-white shadow-sm dark:bg-[#333] border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                        }}
                                    >
                                        {[
                                            { key: "unclaimed", value: "unclaimed", display_name: "Unclaimed" },
                                            { key: "assigned", value: "assigned", display_name: "Assigned" },
                                        ].map((status) => (
                                            <SelectItem key={status.key} value={status.value}>
                                                {status.display_name}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    {/* Priority Select */}
                                    <Select
                                        label="Priority"
                                        labelPlacement="outside"
                                        placeholder="Select task priority"
                                        isRequired
                                        name="priority"
                                        defaultValue={dataValue?.priority} // Existing value from database
                                        classNames={{
                                            label: "font-nunito text-sm text-default-100",
                                            popoverContent:
                                                "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                            trigger:
                                                "bg-white shadow-sm dark:bg-[#333] border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                        }}
                                    >
                                        {[
                                            { key: "low", value: "low", display_name: "Low" },
                                            { key: "medium", value: "medium", display_name: "Medium" },
                                            { key: "high", value: "high", display_name: "High" },
                                        ].map((priority) => (
                                            <SelectItem key={priority.key} value={priority.value}>
                                                {priority.display_name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                {/* Department Select */}
                                <Select
                                    label="Department"
                                    labelPlacement="outside"
                                    placeholder="Select department"
                                    isRequired
                                    name="department"
                                    defaultValue={dataValue?.department} // Existing value from database
                                    classNames={{
                                        label: "font-nunito text-sm text-default-100",
                                        popoverContent:
                                            "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                        trigger:
                                            "bg-white shadow-sm dark:bg-[#333] border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                    }}
                                >
                                    {departments.map((department: DepartmentInterface, index: number) => (
                                        <SelectItem key={department._id} value={department._id}>
                                            {department.name}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <CustomInput
                                    label="Due Date"
                                    isRequired
                                    name="dueDate"
                                    isClearable
                                    placeholder="Select due date"
                                    defaultValue={dataValue?.dueDate}
                                    type="date"
                                    labelPlacement="outside"
                                />

                                <input name="intent" value="update" type="hidden" />
                                <input name="updatedby" value={user?._id} type="hidden" />
                                <input name="id" value={dataValue?._id} type="hidden" />

                                <div className="flex justify-end gap-2 mt-10 font-nunito">
                                    <Button color="danger" variant="flat" onPress={onClose}>
                                        Close
                                    </Button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-[#05ECF2] bg-opacity-20 text-[#05ECF2] text-sm font-nunito px-4"
                                    >
                                        Update
                                    </button>
                                </div>
                            </Form>
                        )}
                    </EditModal>



                    {/* Create Modal */}
                    <CreateModal
                        className="bg-gray-200 dark:bg-[#333]"
                        modalTitle="Create New Task"
                        isOpen={isCreateModalOpened}
                        onOpenChange={handleCreateModalClosed}
                    >
                        {(onClose) => (
                            <Form method="post" className="flex flex-col gap-4">
                                <CustomInput
                                    label="Task Title"
                                    isRequired
                                    name="title"
                                    isClearable
                                    placeholder="Enter task title"
                                    type="text"
                                    labelPlacement="outside"
                                />

                                <Textarea
                                    label="Description"
                                    isRequired
                                    name="description"
                                    placeholder="Enter task description"
                                    type="text"
                                    labelPlacement="outside"
                                    classNames={{
                                        inputWrapper: "bg-white shadow-sm dark:bg-[#333]  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-success hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm"
                                    }}
                                />

                                <div className="flex gap-4">
                                    <Select
                                        label="Status"
                                        labelPlacement="outside"
                                        placeholder="Select task status"
                                        isRequired
                                        name="status"
                                        classNames={{
                                            label: "font-nunito text-sm text-default-100",
                                            popoverContent:
                                                "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                            trigger:
                                                "bg-white shadow-sm dark:bg-[#333] border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                        }}
                                    >
                                        {[
                                            { key: "Unclaimed", value: "Unclaimed", display_name: "Unclaimed" },
                                            { key: "Approved", value: "Approved", display_name: "Approved" },
                                        ].map((status) => (
                                            <SelectItem key={status.key}>{status.display_name}</SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Priority"
                                        labelPlacement="outside"
                                        placeholder="Select task priority"
                                        isRequired
                                        name="priority"
                                        classNames={{
                                            label: "font-nunito text-sm text-default-100",
                                            popoverContent:
                                                "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                            trigger:
                                                "bg-white shadow-sm dark:bg-[#333] border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                        }}
                                    >
                                        {[
                                            { key: "low", value: "low", display_name: "low" },
                                            { key: "medium", value: "medium", display_name: "medium" },
                                            { key: "high", value: "high", display_name: "high" },
                                        ].map((priority) => (
                                            <SelectItem key={priority.key}>{priority.display_name}</SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                <Select
                                    label="Department"
                                    labelPlacement="outside"
                                    placeholder="Select department"
                                    isRequired
                                    name="department"
                                    classNames={{
                                        label: "font-nunito text-sm text-default-100",
                                        popoverContent:
                                            "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                        trigger:
                                            "bg-white shadow-sm dark:bg-[#333] border border-white/30 hover:border-b-primary hover:bg-white max-w-sm",
                                    }}
                                >
                                    {departments.map((department: DepartmentInterface, index: number) => (
                                        <SelectItem key={department._id}>{department.name}</SelectItem>
                                    ))}
                                </Select>

                                <CustomInput
                                    label="Due Date"
                                    isRequired
                                    name="dueDate"
                                    isClearable
                                    placeholder="Select due date"
                                    type="date"
                                    labelPlacement="outside"
                                />

                                <input name="intent" value="create" type="hidden" />
                                <input name="createdby" value={user._id} type="hidden" />
                                <div className="flex justify-end gap-2 mt-10 font-nunito">
                                    <Button color="danger" variant="flat" onPress={onClose}>
                                        Close
                                    </Button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-[#05ECF2] bg-opacity-20 text-[#05ECF2] text-sm font-nunito px-4"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </Form>
                        )}
                    </CreateModal>
                </div>

                <div
                    className={`w-[20vw] h-[100vh] bg-default-200 fixed top-0 right-0 z-10 transition-transform duration-500 ${isDrawerOpen ? "transform-none" : "translate-x-full"
                        }`}
                >

                </div>

                <div
                    className={`w-[20vw] h-[100vh] bg-default-200 fixed top-0 right-0 z-10 transition-transform duration-500 ${isDrawerOpen ? "transform-none" : "translate-x-full"
                        }`}
                >

                </div>
                <div
                    className={`w-[20vw] h-[100vh] bg-default-200 fixed top-0 right-0 z-10 p-4 transition-transform duration-500 ${isAssignOpen ? "transform-none" : "translate-x-full"
                        }`}
                >
                    <div className="flex gap-10">
                        <p className="font-nunito">Assign Task To Staff or team</p>
                        <button onClick={() => {
                            setIsAssignOpen(false)
                        }}>
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </div><hr className="mt-4 border border-default-400" />

                    <div className="pt-6 ">
                        <Form method="post" className="flex flex-col gap-4">
                            <Input
                                label="Team"
                                isRequired
                                name="team"
                                isClearable
                                placeholder="Enter team name"
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: " shadow-sm dark:bg-default-200  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm   "
                                }}
                            />
                            <Select
                                label="Lead"
                                labelPlacement="outside"
                                placeholder="Select lead"
                                isRequired
                                name="lead"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent:
                                        "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                    trigger:
                                        "shadow-sm dark:bg-default-200  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm",
                                }}
                            >
                                {selectByDepartment?.map((lead: RegistrationInterface, index: number) => (
                                    <SelectItem key={lead._id} value={lead._id}>
                                        {lead.firstName + " " + lead.middleName + " " + lead.lastName}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="Assignee"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="assignee"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent:
                                        "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                    trigger:
                                        "shadow-sm dark:bg-default-200  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm",
                                }}
                            >
                                {selectByDepartment?.map((lead: RegistrationInterface, index: number) => (
                                    <SelectItem key={lead._id} value={lead._id}>
                                        {lead.firstName + " " + lead.middleName + " " + lead.lastName}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Status"
                                labelPlacement="outside"
                                placeholder="Select task status"
                                isRequired
                                name="status"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent:
                                        "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                    trigger:
                                        "shadow-sm dark:bg-default-200  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm",
                                }}
                            >
                                {[
                                    { key: "Pending", value: "Pending", display_name: "Pending" },
                                    { key: "Onhold", value: "Onhold", display_name: "Onhold" },
                                    { key: "Inprogress", value: "Inprogress", display_name: "Inprogress" },
                                    { key: "Needs Approval", value: "Needs Approval", display_name: "Needs Approval" },
                                    { key: "Completed", value: "Completed", display_name: "Completed" },
                                ].map((status) => (
                                    <SelectItem key={status.key}>{status.display_name}</SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Priority"
                                labelPlacement="outside"
                                placeholder="Select task priority"
                                isRequired
                                name="priority"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent:
                                        "focus:dark:bg-[#333] bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                    trigger:
                                        "shadow-sm dark:bg-default-200  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm",
                                }}
                            >
                                {[
                                    { key: "low", value: "low", display_name: "low" },
                                    { key: "medium", value: "medium", display_name: "medium" },
                                    { key: "high", value: "high", display_name: "high" },
                                ].map((priority) => (
                                    <SelectItem key={priority.key}>{priority.display_name}</SelectItem>
                                ))}
                            </Select>
                            <Input
                                label="Due Date"
                                isRequired
                                name="dueDate"
                                isClearable
                                placeholder="Select due date"
                                type="date"
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: " shadow-sm dark:bg-default-200  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm   "
                                }}
                            />
                            <Textarea
                                label="Description"
                                isRequired
                                name="description"
                                placeholder="Enter task description"
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: "shadow-sm dark:bg-default-200  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm "
                                }}
                            />
                            <input name="intent" hidden value="assign" type="text" />
                            <input name="createdby" hidden value={user._id} type="text" />
                            <input name="id" hidden value={dataValue?._id} type="text" />


                            <button className="bg-primary h-10 rounded-xl shadow-md font-nunito">
                                Assign
                            </button>

                        </Form>
                    </div>
                </div>
                <div
                    className={`w-[20vw] h-[100vh] bg-default-200 fixed top-0 right-0 z-10 p-4 transition-transform duration-500 ${isCommentOpen ? "transform-none" : "translate-x-full"
                        }`}
                >
                    <div className="flex gap-40">
                        <p className="font-nunito">Add Comment</p>
                        <button onClick={() => {
                            setIsCommentOpen(false)
                        }}>
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </div><hr className="mt-4 border border-default-400" />

                    <div className="pt-6 ">
                        <Form method="post" className="flex flex-col gap-4">

                            <Textarea
                                label="Comment"
                                isRequired
                                name="comment"
                                placeholder="Enter comment here..."
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    inputWrapper: "shadow-sm dark:bg-default-200  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm "
                                }}
                            />
                            <input name="intent" hidden value="comment" type="text" />
                            <input name="createdby" hidden value={user._id} type="text" />
                            <input name="id" hidden value={dataValue?._id} type="text" />


                            <button className="bg-primary h-10 rounded-xl shadow-md font-nunito">
                                Comment
                            </button>

                        </Form>
                    </div>
                </div>

                <div
                    className={`w-[20vw] h-[100vh] bg-default-200 fixed top-0 right-0 z-10 p-4 transition-transform duration-500 ${isViewCommentOpen ? "transform-none" : "translate-x-full"
                        }`}
                >
                    <div className="flex gap-40">
                        <p className="font-nunito">All Comment</p>
                        <button onClick={() => {
                            setIsViewCommentOpen(false)
                        }}>
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </div><hr className="mt-4 border border-default-400" />

                    <div className="pt-6">
                        {dataValue?.comments?.length > 0 ? (
                            // Sort comments by createdAt in descending order (most recent first)
                            [...dataValue.comments]
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((comment, index: number) => (
                                    <div key={index} className="mb-4 p-4 border border-default-400 shadow-md rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={comment.createdBy.image}
                                                alt={`${comment.createdBy.firstName}'s profile`}
                                            />
                                            <div>
                                                <p className="font-nunito text-sm">
                                                    {comment?.createdBy.firstName +
                                                        " " +
                                                        (comment?.createdBy.middleName || "") +
                                                        " " +
                                                        comment?.createdBy.lastName}
                                                </p>
                                                <p className="font-nunito text-sm text-default-400">{formatTime(new Date(comment?.createdAt))}

                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-4 font-nunito text-sm">{comment?.comment}</p>
                                    </div>
                                ))
                        ) : (
                            <p>No comments available.</p>
                        )}
                    </div>

                </div>
            </div>
        </AdminLayout>
    )
}

export default Users


export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const department = formData.get("department") as string | null;
    const priority = formData.get("priority") as string;
    const dueDate = formData.get("dueDate") as string | null;
    const status = formData.get("status") as string;
    const intent = formData.get("intent") as string | null;
    const createdBy = formData.get("createdby") as string;
    const id = formData.get("id") as string;
    const team = formData.get("team") as string | null;
    const lead = formData.get("lead") as string | null;
    const comment = formData.get("comment") as string;
    const assignee = formData.get("assignee") as string | null;



    // Validate required fields
    if (!intent) {
        return json({ message: "Intent is required", success: false, status: 400 });
    }

    try {
        switch (intent) {
            case "create": {
                if (!title || !description || !department || !priority || !dueDate || !status || !createdBy) {
                    return json({
                        message: "Missing required fields for task creation",
                        success: false,
                        status: 400,
                    });
                }

                const task = await taskController.CreateTask({
                    createdBy,
                    department,
                    title,
                    description,
                    priority,
                    dueDate,
                    status,
                    intent,
                });
                return task;
            }

            case "assign": {
                if (!id || !team || !lead || !assignee || !priority || !dueDate || !status || !createdBy || !description) {
                    return json({
                        message: "Missing required fields for task assignment",
                        success: false,
                        status: 400,
                    });
                }

                const taskAssignment = await taskController.AssignTask({
                    id,
                    team,
                    lead,
                    assignee,
                    priority,
                    dueDate,
                    status,
                    createdBy,
                    description,
                });
                return taskAssignment;
            }
            case "comment": {
                if (!id || !createdBy || !comment) {
                    return json({
                        message: "Missing required fields for task assignment",
                        success: false,
                        status: 400,
                    });
                }


                const comments = await taskController.comment({
                    id,
                    createdBy,
                    comment
                });
                return comments;
            }

            case "updateStatus": {
                const statusUpdate = await taskController.UpdateProjectkStatus({
                    id,
                    status,
                });
                return statusUpdate;
            }

            case "updatePriority": {
                const updatePriority = await taskController.UpdatePriority({
                    id,
                    priority,
                });
                return updatePriority;
            }

            case "delete":
                const deleteUser = await taskController.DeleteProject({
                id
            })
            return deleteUser

            default:
                return json({ message: "Invalid intent", success: false, status: 400 });
        }
    } catch (error: any) {
        return json({
            message: error.message || "An error occurred",
            success: false,
            status: 500,
        });
    }
};


export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") as string;
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");
    // if (!token) {
    //     return redirect("/")
    // }
    const { user, tasks, totalPages, selectByDepartment } = await taskController.FetchTasks({
        request,
        page,
        search_term
    });
    const { departments } = await department.getDepartments({
        request,
        page,
        search_term
    });
    console.log(tasks);


    return json({ user, tasks, totalPages, departments, selectByDepartment });
}

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