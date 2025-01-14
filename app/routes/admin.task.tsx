import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem, Skeleton, TableCell, TableRow, Textarea, User } from "@nextui-org/react"
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import BackIcon from "~/components/icons/BackIcon"
import { DeleteIcon } from "~/components/icons/DeleteIcon"
import { EditIcon } from "~/components/icons/EditIcon"
import NotificationIcon from "~/components/icons/NotificationIcon"
import PlusIcon from "~/components/icons/PlusIcon"
import { SearchIcon } from "~/components/icons/SearchIcon"
import TaskIcon from "~/components/icons/TaskIcon"
import UserIcon from "~/components/icons/UserIcon"
import ConfirmModal from "~/components/modal/confirmModal"
import CreateModal from "~/components/modal/createModal"
import EditModal from "~/components/modal/EditModal"
import { UserColumns } from "~/components/table/columns"
import NewCustomTable from "~/components/table/newTable"
import { errorToast, successToast } from "~/components/toast"
import CustomInput from "~/components/ui/CustomInput"
import department from "~/controller/departments"
import taskController from "~/controller/task"
import usersController from "~/controller/Users"
import { DepartmentInterface, RegistrationInterface } from "~/interface/interface"
import AdminLayout from "~/layout/adminLayout"
import { getSession } from "~/session"

const Users = () => {
    const [isCreateModalOpened, setIsCreateModalOpened] = useState(false)
    const [base64Image, setBase64Image] = useState<any>()
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false)
    const [isEditModalOpened, setIsEditModalOpened] = useState(false)
    const [dataValue, setDataValue] = useState<RegistrationInterface>()
    const [isLoading, setIsLoading] = useState(false)
    const submit = useSubmit()
    const actionData = useActionData<any>()
    const { mobileNumberApi } = useLoaderData<typeof loader>()
    const navigate = useNavigate()
    const navigation = useNavigation()
    const {
        user,
        users,
        totalPages,
        departments
    } = useLoaderData<{
        user: { _id: string },
        users: RegistrationInterface[],
        totalPages: number,
        departments: DepartmentInterface[]
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


    return (
        <AdminLayout pageName="Users Management">
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
                            setIsCreateModalOpened(true)
                        }}
                        className="font-nunito  flex text-sm px-8">
                        <TaskIcon className="text-defaul-200 h-4 w-4" /> Create Task
                    </Button>
                </div>
            </div>

            {/* table  */}
            {/* table  */}
            <NewCustomTable
                columns={UserColumns}
                loadingState={navigation.state === "loading" ? "loading" : "idle"}
                totalPages={totalPages}
                page={1}
                setPage={(page) => (
                    navigate(`?page=${page}`)
                )}>
                {users?.map((user, index: number) => (
                    <TableRow key={index}>
                        <TableCell className="text-xs">
                            <p className="!text-xs">
                                <User
                                    avatarProps={{ radius: "sm", src: user.image }}
                                    name={
                                        <p className="font-nunito text-xs">
                                            {user.firstName + ' ' + user.middleName + ' ' + user.lastName}
                                        </p>
                                    }
                                />
                            </p>
                        </TableCell>
                        <TableCell className="text-xs">{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell className="relative flex items-center gap-4">
                            <button className="text-primary " onClick={() => {
                                setIsEditModalOpened(true)
                                setDataValue(user)
                            }}>
                                <EditIcon />
                            </button>
                            <button className="text-danger" onClick={() => {
                                setIsConfirmModalOpened(true)
                                setDataValue(user)
                            }}>
                                <DeleteIcon />
                            </button>

                        </TableCell>
                    </TableRow>
                ))}
            </NewCustomTable>

            {/* confirm modal */}
            {/* confirm modal */}
            <ConfirmModal className="dark:bg-[#333] border border-white/5" header="Confirm Delete" content="Are you sure to delete user?" isOpen={isConfirmModalOpened} onOpenChange={handleConfirmModalClosed}>
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

            {/* Create Modal */}
            {/* Create Modal */}
            <EditModal
                className="bg-gray-200 dark:bg-[#333] "
                modalTitle="Update user details"
                isOpen={isEditModalOpened}
                onOpenChange={handleEditModalClosed}
            >
                {(onClose) => (
                    <Form method="post" className="flex flex-col gap-4">
                        <CustomInput
                            label="First name"
                            isRequired
                            isClearable
                            name="firstname"
                            placeholder=" "
                            defaultValue={dataValue?.firstName}
                            type="text"
                            labelPlacement="outside"
                            className=""
                        />
                        <div className="flex gap-4">
                            <CustomInput
                                label="Middle Name"
                                name="middlename"
                                placeholder=" "
                                isClearable
                                defaultValue={dataValue?.middleName}
                                type="text"
                                labelPlacement="outside"
                                className=""
                            />
                            <CustomInput
                                label="Last Name"
                                isRequired
                                name="lastname"
                                defaultValue={dataValue?.lastName}
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                                className=""
                            />
                        </div>
                        <CustomInput
                            label="Email"
                            isRequired
                            name="email"
                            defaultValue={dataValue?.email}
                            isClearable
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                            className=""
                        />
                        <CustomInput
                            label=" Phone"
                            isRequired
                            name="phone"
                            defaultValue={dataValue?.phone}
                            isClearable
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />

                        <CustomInput
                            label=" Role"
                            isRequired
                            name="role"
                            defaultValue={dataValue?.role}
                            isClearable
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />


                        <input name="admin" value={user?._id} type="hidden" />
                        <input name="intent" value="update" type="hidden" />
                        <input name="id" value={dataValue?._id} type="hidden" />

                        <div className="flex justify-end gap-2 mt-10 ">
                            <Button className="font-montserrat font-semibold" color="danger" size="sm" variant="flat" onPress={onClose}>
                                Close
                            </Button>
                            <Button size="sm" type="submit" className="bg-[#05ECF2]  bg-opacity-20 text-[#05ECF2] text-sm font-montserrat font-semibold px-4" onClick={() => {
                                setIsEditModalOpened(false)
                            }}>
                                Update
                            </Button>
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
                                    { key: "unclaimed", value: "nnclaimed", display_name: "Unclaimed" },
                                    { key: "assigned", value: "assigned", display_name: "Assigned" },
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

        </AdminLayout>
    )
}

export default Users

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const department = formData.get("department") as string;
    const priority = formData.get("priority") as string;
    const dueDate = formData.get("dueDate") as string;
    const status = formData.get("status") as string;
    const intent = formData.get("intent") as string;
    const createdBy = formData.get("createdby") as string;
    const id = formData.get("id") as string;




    switch (intent) {
        case "create":
            const user = await taskController.CreateTask({
                createdBy,
                department,
                title,
                description,
                priority,
                dueDate,
                status,
                intent,
            })
            return user

        case "delete":
            const deleteUser = await usersController.DeleteUser({
                intent,
                id
            })
            return deleteUser

        case "update":
            const updateUser = await usersController.UpdateUser({
                firstName,
                middleName,
                lastName,
                email,
                admin,
                phone,
                id,
                role,
                intent,
            })
            return updateUser
        case "logout":
            const logout = await usersController.logout(intent)
            return logout
        default:
            return json({
                message: "Bad request",
                success: false,
                status: 400
            })
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") as string;

    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");
    // if (!token) {
    //     return redirect("/")
    // }
    const { user, users, totalPages } = await usersController.FetchUsers({
        request,
        page,
        search_term
    });
    const { departments } = await department.getDepartments({
        request,
        page,
        search_term
    });

    return json({ user, users, totalPages, departments });
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