import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem, Skeleton, TableCell, TableRow, User } from "@nextui-org/react"
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import BackIcon from "~/components/icons/BackIcon"
import CloseIcon from "~/components/icons/CloseIcon"
import { DeleteIcon } from "~/components/icons/DeleteIcon"
import { EditIcon } from "~/components/icons/EditIcon"
import NotificationIcon from "~/components/icons/NotificationIcon"
import PlusIcon from "~/components/icons/PlusIcon"
import { SearchIcon } from "~/components/icons/SearchIcon"
import { FileUploader } from "~/components/icons/uploader"
import UserIcon from "~/components/icons/UserIcon"
import ConfirmModal from "~/components/modal/confirmModal"
import CreateModal from "~/components/modal/createModal"
import EditModal from "~/components/modal/EditModal"
import { UserColumns } from "~/components/table/columns"
import NewCustomTable from "~/components/table/newTable"
import { errorToast, successToast } from "~/components/toast"
import CustomInput from "~/components/ui/CustomInput"
import department from "~/controller/departments"
import usersController from "~/controller/Users"
import { DepartmentInterface, RegistrationInterface } from "~/interface/interface"
import AdminLayout from "~/layout/adminLayout"
import { getSession } from "~/session"

const Users = () => {
    const [isCreateModalOpened, setIsCreateModalOpened] = useState(false)
    const [base64Image, setBase64Image] = useState<any>()
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false)
    const [isEditModalOpened, setIsEditModalOpened] = useState(false)
    const [isEditDrawerOpened, setIsEditDrawerOpened] = useState(false)
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
    const [selectedRole, setSelectedRole] = useState();

    const handleClick = () => {
        setIsCreateModalOpened(true)
    }
    const handleCreateModalClosed = () => {
        setIsCreateModalOpened(false)
    }
    const handleConfirmModalClosed = () => {
        setIsConfirmModalOpened(false)
    }
    const handleEditModalClosed = () => {
        setIsEditModalOpened(false)
    }
    const handleEditDrawerClosed = () => {
        setIsEditDrawerOpened(false)
    }




    useEffect(() => {
        const timeOut = setTimeout(() => {
            setIsLoading(true)
        }, 1000)
        return () => clearTimeout(timeOut)
    }, [])

    useEffect(() => {
        if (dataValue?.department) {
            setDataValue(dataValue.department);
        }
    }, [dataValue]);

    const handleDepartmentChange = (value) => {
        setDataValue(value); // Update state with the new value
    };

    const animals = [
        { key: "cat", label: "Cat" },
        { key: "dog", label: "Dog" },
        { key: "elephant", label: "Elephant" },
        { key: "lion", label: "Lion" },
        { key: "tiger", label: "Tiger" },
        { key: "giraffe", label: "Giraffe" },
        { key: "dolphin", label: "Dolphin" },
        { key: "penguin", label: "Penguin" },
        { key: "zebra", label: "Zebra" },
        { key: "shark", label: "Shark" },
        { key: "whale", label: "Whale" },
        { key: "otter", label: "Otter" },
        { key: "crocodile", label: "Crocodile" },
    ];
    return (
        <AdminLayout redirect="/admin/users" redirectDelay={1000} handleOnClick={handleClick} buttonName="Create User" pageName="Users Management">


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
                                setIsEditDrawerOpened(true)
                                setDataValue(user)
                                console.log(dataValue);

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
            {dataValue && (

                <div
                    className={`w-[30vw] flex flex-col gap-6 h-[100vh] bg-default-50 overflow-y-scroll border dark:border-white/10 fixed top-0 right-0 z-10 transition-all duration-500 ease-in-out p-6 ${isEditDrawerOpened ? "transform-none opacity-100" : "translate-x-full opacity-0"
                        }`}
            >
                    <div className="flex justify-between gap-10 ">
                        <p className="font-nunito">Create new User</p>
                        <button
                            onClick={() => {
                                handleEditDrawerClosed()
                            }}
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <hr className=" border border-default-400 " />

                    <Form method="post" className="flex flex-col gap-4">
                        <CustomInput
                            label="First name"
                            isRequired
                            defaultValue={dataValue.firstName}
                            isClearable
                            name="firstname"
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />
                        <div className="flex gap-4">
                            <CustomInput
                                label="Middle Name"
                                name="middlename"
                                defaultValue={dataValue.middleName}
                                placeholder=" "
                                isClearable
                                type="text"
                                labelPlacement="outside"

                            />
                            <CustomInput
                                label="Last Name"
                                isRequired
                                name="lastname"
                                defaultValue={dataValue.lastName}
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                            />
                        </div>
                        <CustomInput
                            label="Email"
                            isRequired
                            defaultValue={dataValue.email}
                            name="email"
                            isClearable
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />
                        <div className=" gap-4">
                            <CustomInput
                                label=" Phone"
                                isRequired
                                name="phone"
                                defaultValue={dataValue.phone}
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"

                            />
                            {/* <CustomInput
                                label=" Password"
                                isRequired
                                name="password"
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"

                            /> */}
                        </div>
                        <div className="">
                            <Select
                                label="Role"
                                labelPlacement="outside"
                                placeholder=" "
                                isRequired
                                defaultSelectedKeys={[dataValue.role]}
                                name="role"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] focus-bg-white bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "dark:bg-default-50 shadow-sm   border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full   "
                                }}
                            >
                                {[
                                    { key: "admin", value: "admin", display_name: "Admin" },
                                    { key: "hod", value: "hod", display_name: "HOD" },
                                    { key: "staff", value: "staff", display_name: "Staff" },
                                ].map((role) => (
                                    <SelectItem key={role.key}>{role.display_name}</SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="flex gap-4">
                            <Select
                                isRequired
                                className="max-w-xs"
                                defaultSelectedKeys={[dataValue.department]}
                                label="Department"
                                placeholder=" "
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] focus-bg-white bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "dark:bg-default-50 shadow-sm   border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full   "
                                }}
                            >
                                {departments.map((animal) => (
                                    <SelectItem key={animal._id}>{animal.name}</SelectItem>
                                ))}
                            </Select>

                            <CustomInput
                                label=" Position"
                                isRequired
                                name="position"
                                defaultValue={dataValue.role}
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"

                            />
                        </div>
                        <div className=" ">
                            <input name="base64Image" value={base64Image} type="hidden" />
                            <label className="font-nunito block text-sm" htmlFor="">
                                Image
                            </label>
                            <div className="relative inline-block w-40 h-40 border-2 border-dashed border-gray-600 rounded-xl dark:border-white/30 mt-2">
                                <input
                                    name="image"
                                    placeholder=" "
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    type="file"
                                    onChange={(event: any) => {
                                        const file = event.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setBase64Image(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                {/* Display the default image or the uploaded image */}
                                {base64Image ? (
                                    <img
                                        src={base64Image}
                                        alt="Preview"
                                        className="absolute inset-0 w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                        <FileUploader className="h-20 w-20 text-white" />
                                    </span>
                                )}
                            </div>
                        </div>



                        <input name="admin" value={user?._id} type="hidden" />
                        <input name="intent" value="update" type="hidden" />
                        <input name="id" value={dataValue?._id} type="hidden" />

                            <Button size="sm" type="submit" className="bg-[#05ECF2]  bg-opacity-20 text-[#05ECF2] text-sm font-montserrat font-semibold px-4" onClick={() => {
                                setIsEditModalOpened(false)
                            }}>
                                Update
                        </Button>
                    </Form>
                </div>
            )}


            <div
                className={`w-[30vw] flex flex-col gap-6 h-[100vh] bg-default-50 overflow-y-scroll border dark:border-white/10  fixed top-0 right-0 z-10 transition-transform duration-500 p-6 ${isCreateModalOpened ? "transform-none" : "translate-x-full"}`}
            >
                <div className="flex justify-between gap-10 ">
                    <p className="font-nunito">Create new User</p>
                    <button
                        onClick={() => {
                            handleCreateModalClosed()
                        }}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>
                <hr className=" border border-default-400 " />

                <Form method="post" className="flex flex-col gap-4">
                        <CustomInput
                            label="First name"
                            isRequired
                            isClearable
                            name="firstname"
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />
                        <div className="flex gap-4">
                            <CustomInput
                                label="Middle Name"
                                name="middlename"
                                placeholder=" "
                                isClearable
                                type="text"
                                labelPlacement="outside"

                            />
                            <CustomInput
                                label="Last Name"
                                isRequired
                                name="lastname"
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                            />
                        </div>
                        <CustomInput
                            label="Email"
                            isRequired
                            name="email"
                            isClearable
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />
                        <div className="flex gap-4">
                            <CustomInput
                                label=" Phone"
                                isRequired
                                name="phone"
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"

                            />
                            <CustomInput
                                label=" Password"
                                isRequired
                                name="password"
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"

                            />
                        </div>
                        <div className="">
                            <Select
                                label="Role"
                                labelPlacement="outside"
                                placeholder=" "
                                isRequired
                                name="role"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] focus-bg-white bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "dark:bg-default-50 shadow-sm   border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full   "
                                }}
                            >
                                {[
                                    { key: "admin", value: "admin", display_name: "Admin" },
                                    { key: "hod", value: "hod", display_name: "HOD" },
                                    { key: "staff", value: "staff", display_name: "Staff" },
                                ].map((role) => (
                                    <SelectItem key={role.key}>{role.display_name}</SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="flex gap-4">
                            <Select
                                label="Departments"
                                labelPlacement="outside"
                                placeholder=" "
                                isRequired
                                name="department"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] focus-bg-white bg-white shadow-sm dark:bg-default-50 border border-white/5 font-nunito",
                                    trigger: "dark:bg-default-50 shadow-sm   border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full   "
                                }}
                            >
                                {departments.map((department: DepartmentInterface, index: number) => (
                                    <SelectItem key={department._id}>{department.name}</SelectItem>
                                ))}
                            </Select>

                            <CustomInput
                                label=" Position"
                                isRequired
                                name="position"
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"

                            />
                    </div>
                        <div className=" ">
                            <label className="font-nunito block text-sm" htmlFor="">Image</label>
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

                        <input name="admin" value={user?._id} type="hidden" />
                        <input name="intent" value="create" type="hidden" />
                        <input name="base64Image" value={base64Image} type="hidden" />


                    <button type="submit" className="rounded-xl bg-primary text-sm font-nunito h-10 w-40 px-4">
                                Submit
                    </button>
                    </Form>
            </div>
        </AdminLayout>
    )
}

export default Users

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const firstName = formData.get("firstname") as string;
    const lastName = formData.get("lastname") as string;
    const middleName = formData.get("middlename") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const base64Image = formData.get("base64Image") as string;
    const role = formData.get("role") as string;
    const admin = formData.get("admin") as string;
    const position = formData.get("position") as string;
    const intent = formData.get("intent") as string;
    const department = formData.get("department") as string;
    const id = formData.get("id") as string;


    switch (intent) {
        case "create":
            const user = await usersController.CreateUser({
                firstName,
                middleName,
                lastName,
                email,
                admin,
                password,
                phone,
                role,
                intent,
                position,
                department,
                base64Image
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
                role,
                position,
                department,
                base64Image,
                id
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