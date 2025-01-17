import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Textarea } from "@nextui-org/react";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import BackIcon from "~/components/icons/BackIcon";
import CloseIcon from "~/components/icons/CloseIcon";
import CommentIcon from "~/components/icons/comment";
import { DeleteIcon } from "~/components/icons/DeleteIcon";
import ElipIcon from "~/components/icons/ElipIcon";
import { EyeIcon } from "~/components/icons/EyeIcon";
import NotificationIcon from "~/components/icons/NotificationIcon";
import PlusIcon from "~/components/icons/PlusIcon";
import { SearchIcon } from "~/components/icons/SearchIcon";
import TaskIcon from "~/components/icons/TaskIcon";
import ConfirmModal from "~/components/modal/confirmModal";
import { errorToast, successToast } from "~/components/toast";
import taskController from "~/controller/task";
import { TaskInterface } from "~/interface/interface";
import HODLayout from "~/layout/hodLayout";
import Task from "~/modal/task";
import { getSession } from "~/session";

const TaskDetails = () => {
    const { taskDetail, id } = useLoaderData<{ taskDetail: TaskInterface, id: string }>();
    const navigate = useNavigate()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false)
    const [isViewCommentOpen, setIsViewCommentOpen] = useState(false);
    const [dataValue, setDataValue] = useState<TaskInterface>()
    const actionData = useActionData<any>()
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false)
    const submit = useSubmit()

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
        }
        return text;
    };
    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message)
            } else {
                errorToast(actionData.message)
            }
        }
    }, [actionData])

    return (
        <HODLayout pageName="Task Details">
            <Toaster position="top-right" />
            <div>
                <div className="z-1">
                    <div className="flex justify-between">
                        {/* search */}
                        {/* search */}
                        <Input
                            size="md"
                            placeholder="Search user..."
                            startContent={<SearchIcon className="" />}
                            onValueChange={(value) => {
                                const timeoutId = setTimeout(() => {
                                    navigate(`?search_term=${value}`);
                                }, 100);
                                return () => clearTimeout(timeoutId);
                            }} classNames={{
                                inputWrapper: " shadow-sm w-[50vw]  text-sm font-nunito dark:bg-[#18181B] border border-2 border-white/10",
                            }}
                        />

                        <div className="flex gap-4 items-center">
                            <div className="border h-full w-full flex items-center justify-center rounded-full px-2 py-1">
                                <NotificationIcon className="h-6 w-6 text-default-500" />

                            </div>
                            <div>
                                <Dropdown placement="bottom-end">
                                    <DropdownTrigger>
                                        <Avatar
                                            isBordered
                                            as="button"
                                            className="transition-transform"
                                            color="secondary"
                                            name="Jason Hughes"
                                            size="sm"
                                            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                                        />
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Profile Actions" variant="flat">
                                        <DropdownItem key="profile" className="h-14 gap-2">
                                            <p className="font-semibold">Signed in as</p>
                                            <p className="font-semibold">zoey@example.com</p>
                                        </DropdownItem>
                                        <DropdownItem key="logout" color="danger">
                                            Log Out
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        </div>
                    </div>

                    <div className="flex z-0 mt-6 justify-between items-center px-6 bg-default-100 shadow-md h-20 rounded-2xl gap-2 overflow-y-hidden">
                        <Toaster position="top-right" />

                        <div className="">
                            {/* back */}
                            {/* back */}
                            <Button
                                size="md"
                                variant="bordered"
                                onClick={() => {
                                    navigate(-1)
                                }} color="primary" className="font-nunito text-sm  ">
                                <BackIcon className="h-[20px] w-[20px] " /><p >Back</p>
                            </Button>
                        </div>
                        <div className="flex gap-4">

                            {/* button to add new user */}
                            {/* button to add new user */}
                            <Button
                                color="primary"
                                size="md"

                                onClick={() => {
                                    // setIsCreateModalOpened(true)
                                }}
                                className="font-nunito  flex text-sm px-8">
                                <TaskIcon className="text-defaul-200 h-4 w-4" /> Create Task
                            </Button>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="border border-default-200 rounded-2xl p-10 bg-default-100">
                            <div className="flex justify-between">
                                <h2 className="text-xl font-bold mb-4 font-montserrat">{taskDetail.title}</h2>
                                <h2 className="text-sm mb-4 font-nunito text-default-400">
                                    Due Date: {new Date(taskDetail.dueDate).toLocaleDateString()}
                                </h2>
                                <h2 className="text-sm mb-4 font-nunito text-default-600 flex gap-4 items-center">
                                    Priority:  <Button
                                        variant="flat"
                                        size="sm"
                                        color="danger"
                                        className={`w-20 rounded-xl bg-opacity-20 font-nunito`}
                                    >
                                        {taskDetail.priority}
                                    </Button>
                                </h2>
                                <h2 className="text-sm mb-4 font-nunito text-default-600 flex gap-4 items-center">
                                    Status:  <Button
                                        variant="flat"
                                        size="sm"
                                        color="success"
                                        className={`w-20 rounded-xl bg-opacity-20 font-nunito`}
                                    >
                                        {taskDetail.status}
                                    </Button>
                                </h2>
                            </div>
                            <p className="font-nunito text-sm">{taskDetail.description}</p>
                        </div>

                        <h3 className="mt-6 text-lg font-semibold">Task</h3>
                        {taskDetail.assignment && taskDetail.assignment.length > 0 ? (
                            <div className="mt-4 grid grid-cols-4 gap-4">
                                {taskDetail?.assignment?.map((task: TaskInterface, index: number) => (
                                    <div
                                        className="h-full border bg-default-100 w-full rounded-xl dark:border-default-200 p-2 flex flex-col justify-between"
                                        key={index}
                                    >
                                        <div>
                                            <div className="flex justify-between">
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

                                            <Dropdown>
                                                <DropdownTrigger>
                                                    <button>
                                                        <ElipIcon className="h-4 w-4" />
                                                    </button>
                                                </DropdownTrigger>
                                                <DropdownMenu aria-label="Example with disabled actions" disabledKeys={["edit", "delete"]}>
                                                    <DropdownItem className="flex gap-4" key="new">
                                                        <button onClick={() => {
                                                            setIsDrawerOpen(!isDrawerOpen)
                                                            setDataValue(task)
                                                        }} className="flex w-full text-primary font-nunito gap-2 items-center">
                                                            <EyeIcon className="" /> View
                                                        </button>
                                                    </DropdownItem>

                                                    <DropdownItem className="flex gap-4" key="new">
                                                        <button className="flex gap-2 text-danger items-center">
                                                            <DeleteIcon /> Delete
                                                        </button>
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>

                                        </div>
                                        <p className="mt-2 font-bold font-montserrat">{task?.assignee?.firstName + " " + task?.assignee?.middleName + " " + task?.assignee?.lastName}</p>
                                            <p className="mt-2 text-xs font-nunito">{truncateText(task.description, 8)}</p>
                                        </div>

                                        <Dropdown>
                                            <DropdownTrigger>
                                                <button onClick={() => {
                                                    setDataValue(task)
                                                }} className="flex mt-2 font- text-default-500 gap-2 items-center">
                                                    <CommentIcon className="h-4 w-4" /> Comment(0)
                                                </button>
                                            </DropdownTrigger>
                                            <DropdownMenu aria-label="Example with disabled actions" disabledKeys={["edit", "delete"]}>
                                                <DropdownItem className="flex gap-4" key="new">
                                                    <button onClick={() => {
                                                        setIsCommentDrawerOpen(!isCommentDrawerOpen)
                                                        setDataValue(task)
                                                    }} className="flex w-full text-primary font-nunito gap-2 items-center">
                                                        <PlusIcon className="" /> Add Comment
                                                    </button>
                                                </DropdownItem>

                                                <DropdownItem className="flex gap-4" key="new">
                                                    <button
                                                        onClick={() => {
                                                            setIsViewCommentOpen(!isViewCommentOpen)
                                                        }}
                                                        className="flex gap-2 text-danger items-center">
                                                        <EyeIcon className="" /> View Comment
                                                    </button>
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>

                                    </div>
                                ))}
                            </div>
                        ) : (
                                <p className="font-nunito">No assignments found for this task.</p>
                        )}
                    </div>
                </div>

                <div
                    className={`w-[20vw] h-[100vh] bg-default-200 fixed top-0 right-0 z-10 transition-transform duration-500 p-6 ${isDrawerOpen ? "transform-none" : "translate-x-full "
                        }`}
                >
                    <div className="flex justify-between">
                        <p className="dark:text-white font-bold font-montserrat">Task Details</p>
                        <button onClick={() => {
                            setIsDrawerOpen(!isDrawerOpen)
                        }}>
                            <CloseIcon className="h-4 w-4" />

                        </button>
                    </div> <hr className="mt-4 border border-default-400" />

                    <div className="mt-6 flex flex-col gap-4">
                        {/* Team Section */}
                        <div className="grid grid-cols-3 items-center font-nunito">
                            <p className="font-nunito text-sm">Created:</p>
                            <p className="col-span-2 font-nunito text-sm">{dataValue?.team}</p>
                        </div>

                        {/* Status Section */}
                        <div className="grid grid-cols-3 items-center font-nunito">
                            <p className="font-nunito text-sm">Status:</p>
                            <div className="col-span-2">
                                <button className="bg-success bg-opacity-40 font-nunito text-sm px-4 py-1 rounded-xl">
                                    {dataValue?.status}
                                </button>
                            </div>
                        </div>

                        {/* Lead Section */}
                        <div className="grid grid-cols-3 items-center font-nunito">
                            <p className="font-nunito text-sm">Lead:</p>
                            <div className="col-span-2 flex items-center gap-2">
                                <img
                                    src={dataValue?.lead.image}
                                    className="h-8 w-8 rounded-full"
                                    alt="Lead"
                                />
                                <p className="font-nunito text-sm">
                                    {`${dataValue?.lead.firstName} ${dataValue?.lead.middleName} ${dataValue?.lead.lastName}`}
                                </p>
                            </div>
                        </div>

                        {/* Assignee Section */}
                        <div className="grid grid-cols-3 items-center font-nunito">
                            <p className="font-nunito text-sm">Assignee:</p>
                            <div className="col-span-2 flex items-center gap-2">
                                <img
                                    src={dataValue?.assignee.image}
                                    className="h-8 w-8 rounded-full"
                                    alt="Assignee"
                                />
                                <p className="font-nunito text-sm">
                                    {`${dataValue?.assignee.firstName} ${dataValue?.assignee.middleName} ${dataValue?.assignee.lastName}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <hr className="mt-4 border border-default-400" />

                    <div className="mt-6 flex flex-col gap-4">
                        <p className="font-bold font-montserrat">Dates</p>
                        {/* Team Section */}
                        <div className="grid grid-cols-3 items-center font-nunito">
                            <p className="font-nunito text-sm">Created:</p>
                            <p className="col-span-2 font-nunito text-sm">
                                {dataValue?.assignedAt ? new Date(dataValue.assignedAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>

                        {/* Status Section */}
                        <div className="grid grid-cols-3 items-center font-nunito">
                            <p className="font-nunito text-sm">Deadline:</p>
                            <p className="col-span-2 font-nunito text-sm">
                                {dataValue?.dueDate ? new Date(dataValue.dueDate).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>


                    <hr className="mt-8 border border-default-400" />

                    <div className="mt-6 flex flex-col gap-4">
                        <p className="font-bold font-montserrat">Description</p>
                        {/* Team Section */}
                        <div className="grid grid-cols-1 items-center font-nunito">
                            <p className="font-nunito text-sm">{dataValue?.description}</p>

                        </div>
                    </div>
                </div>

                <div
                    className={`w-[20vw] h-[100vh] bg-default-200 fixed top-0 right-0 z-10 p-4 transition-transform duration-500 ${isCommentDrawerOpen ? "transform-none" : "translate-x-full"
                        }`}
                >
                    <div className="flex gap-40">
                        <p className="font-nunito">Add Comment</p>
                        <button onClick={() => {
                            setIsCommentDrawerOpen(false)
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
                            {/* <input name="createdby" hidden value={user._id} type="text" /> */}
                            <input name="id" hidden value={id} type="text" />
                            <input name="AssignmentId" hidden value={dataValue?._id} type="text" />


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

                                            <div>

                                                <p className="font-nunito text-sm text-default-400">{(comment?.createdAt)}

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

                <ConfirmModal className="dark:bg-default border border-white/5" header="Confirm Status Update" content="Are you sure to update the status of this project?" isOpen={isConfirmModalOpened} onOpenChange={() => {
                    setIsConfirmModalOpened(false)
                }}>
                    <div className="flex gap-4">
                        <Button color="success" variant="flat" className="font-montserrat font-semibold" size="sm" onPress={() => {
                            setIsConfirmModalOpened(false)
                        }}>
                            No
                        </Button>
                        <Button color="danger" variant="flat" className="font-montserrat font-semibold " size="sm" onClick={() => {
                            setIsConfirmModalOpened(false)
                            if (dataValue) {
                                // Define the order of statuses
                                const statuses = ["Pending", "Onhold", "Inprogress", "Needs Approval", "Completed"];

                                // Find the current status index
                                const currentIndex = statuses.indexOf(dataValue.status);

                                // Determine the next status (looping back to the first if at the end)
                                const newStatus = statuses[(currentIndex + 1) % statuses.length];

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



            </div>
        </HODLayout>
    );
};

export default TaskDetails;

export const loader: LoaderFunction = async ({ request, params }) => {
    const { id } = params;

    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");



    if (!id) {
        throw new Response("Task ID not provided", { status: 400 });
    }

    try {

        const taskDetail = await Task.findById(id)
            .populate({
                path: "assignment.assignee", 
                model: "registration", // Make sure it's using the correct model for the reference
            })
            .populate({
                path: "assignment.lead",
                model: "registration", // Make sure it's using the correct model for the reference
            })
            .populate("createdBy"); // You can also populate the creator if necessary.




        return json({
            taskDetail, id
        });
    } catch (error) {
        console.error("Error fetching task details:", error);
        throw new Response("Internal Server Error", { status: 500 });
    }
};

// Adjust import based on your file structure

export const action: ActionFunction = async ({ request }) => {
    console.log('start here...');

    const formData = await request.formData();
    const intent = formData.get("intent") as string;
    const createdBy = formData.get("createdby") as string;
    const id = formData.get("id") as string;
    const AssignmentId = formData.get("AssignmentId") as string;
    const comment = formData.get("comment") as string;
    const status = formData.get("status") as string; // Extract status for updateStatus intent


    console.log({
        AssignmentId, id, comment
    });


    // Validate required fields
    if (!intent) {
        return json(
            { message: "Intent is required", success: false, status: 400 },
            { status: 400 }
        );
    }

    try {
        switch (intent) {
            case "comment": {
                const response = await taskController.assignmentComment({
                    AssignmentId,
                    id,
                    createdBy,
                    comment,
                });

                // Ensure the controller response is returned directly
                return response;
            }

            case "updateStatus": {
                const statusUpdate = await taskController.UpdateTaskkStatus({
                    id,
                    status,
                });
                return statusUpdate;
            }

            default:
                return json(
                    { message: "Invalid intent", success: false, status: 400 },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        return json(
            {
                message: error.message || "An unexpected error occurred",
                success: false,
                status: 500,
            },
            { status: 500 }
        );
    }
};

