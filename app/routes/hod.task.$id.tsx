import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input } from "@nextui-org/react";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import BackIcon from "~/components/icons/BackIcon";
import CloseIcon from "~/components/icons/CloseIcon";
import CommentIcon from "~/components/icons/comment";
import { DeleteIcon } from "~/components/icons/DeleteIcon";
import ElipIcon from "~/components/icons/ElipIcon";
import { EyeIcon } from "~/components/icons/EyeIcon";
import NotificationIcon from "~/components/icons/NotificationIcon";
import { SearchIcon } from "~/components/icons/SearchIcon";
import TaskIcon from "~/components/icons/TaskIcon";
import { TaskInterface } from "~/interface/interface";
import HODLayout from "~/layout/hodLayout";
import Task from "~/modal/task";
import { getSession } from "~/session";

const TaskDetails = () => {
    const { taskDetail } = useLoaderData<{ taskDetail: TaskInterface }>();
    const navigate = useNavigate()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [dataValue, setDataValue] = useState<TaskInterface>()

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
        }
        return text;
    };

    return (
        <HODLayout pageName="Task Details">
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
                        <h2 className="text-xl font-bold mb-4">{taskDetail.title}</h2>
                        <p>{taskDetail.description}</p>
                        <h3 className="mt-6 text-lg font-semibold">Assignments</h3>
                        {taskDetail.assignment && taskDetail.assignment.length > 0 ? (
                            <div className="mt-4 grid grid-cols-4 gap-4">
                                {taskDetail?.assignment?.map((task: TaskInterface, index: number) => (
                                    <div
                                        className="h-full border bg-default-100 w-full rounded-xl dark:border-default-200 p-2"
                                        key={index}
                                    >
                                        <div className="flex justify-between">
                                            <Button
                                                variant="flat"
                                                size="sm"
                                                color="success"
                                                className={`w-20 rounded-xl bg-opacity-20 font-nunito ${task.priority === "low"}`}
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
                                                        <button onClick={ } className="flex font- text-default-500 gap-2 items-center">
                                                            <CommentIcon className="h-4 w-4" /> Comment
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
                                        <p className="mt-2 text-xs font-nunito">{truncateText(task.description, 22)}</p>

                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No assignments found for this task.</p>
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
                                    className="h-10 w-10 rounded-full"
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
                                    className="h-10 w-10 rounded-full"
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
                path: "assignment.assignee", // Specifically populate assignee within the assignment array
                model: "registration", // Make sure it's using the correct model for the reference
            })
            .populate({
                path: "assignment.lead",
                model: "registration", // Make sure it's using the correct model for the reference
            })
            .populate("createdBy"); // You can also populate the creator if necessary.




        return json({
            taskDetail,
        });
    } catch (error) {
        console.error("Error fetching task details:", error);
        throw new Response("Internal Server Error", { status: 500 });
    }
};
