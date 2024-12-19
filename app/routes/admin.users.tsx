import { Button, Input, Select, SelectItem, Skeleton, TableCell, TableRow, User } from "@nextui-org/react"
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import BackIcon from "~/components/icons/BackIcon"
import { DeleteIcon } from "~/components/icons/DeleteIcon"
import { EditIcon } from "~/components/icons/EditIcon"
import PlusIcon from "~/components/icons/PlusIcon"
import { SearchIcon } from "~/components/icons/SearchIcon"
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
        categories
    } = useLoaderData<{
        user: { _id: string },
        users: RegistrationInterface[],
        totalPages: number,
        categories: DepartmentInterface[]
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
            <div className="flex z-0 mt-6 justify-between gap-2 overflow-y-hidden">
                <Toaster position="top-right" />
                <div className="flex items-center justify-center gap-2">
                    {/* back */}
                    {/* back */}
                    <Button size="sm" onClick={() => {
                        navigate(-1)
                    }} color="primary" className="font-nunito text-sm  border-b-white dark:border-primary  dark:text-white dark:bg-[#333]">
                        <BackIcon className="h-[20px] w-[20px] dark:text-[#05ECF2]" /><p >Back</p>
                    </Button>
                </div>
                <div className="flex gap-4">
                    {/* search */}
                    {/* search */}
                    <Input
                        size="sm"
                        placeholder="Search user..."
                        startContent={<SearchIcon className="" />}
                        onValueChange={(value) => {
                            const timeoutId = setTimeout(() => {
                                navigate(`?search_term=${value}`);
                            }, 100);
                            return () => clearTimeout(timeoutId);
                        }} classNames={{
                            inputWrapper: "bg-white shadow-sm text-sm font-nunito dark:bg-[#333] border border-white/5 ",
                        }}
                    />
                    {/* button to add new user */}
                    {/* button to add new user */}
                    <Button size="sm"
                        variant="flat"
                        onClick={() => {
                            setIsCreateModalOpened(true)
                        }}
                        className="font-nunito dark:bg-[#333]  text-sm px-8">
                        Create User
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
                            <Button size="sm" className="bg-[#05ECF2] bg-opacity-40" variant="flat" onClick={() => {
                                setIsEditModalOpened(true)
                                setDataValue(user)
                            }}>
                                <EditIcon /> Edit
                            </Button>
                            <Button size="sm" color="danger" variant="flat" onClick={() => {
                                setIsConfirmModalOpened(true)
                                setDataValue(user)
                            }}>
                                <DeleteIcon /> Delete
                            </Button>

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
                modalTitle="Create New User"
                isOpen={isCreateModalOpened}
                onOpenChange={handleCreateModalClosed}
            >
                {(onClose) => (
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
                                    popoverContent: "focus:dark:bg-[#333] focus-bg-white bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-[#333]  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm   "
                                }}
                            >
                                {[
                                    { key: "admin", value: "admin", display_name: "Admin" },
                                    { key: "attendant", value: "attendant", display_name: "Attendant" },
                                ].map((role) => (
                                    <SelectItem key={role.key}>{role.display_name}</SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="flex gap-4">
                            <Select
                                label="Role"
                                labelPlacement="outside"
                                placeholder=" "
                                isRequired
                                name="role"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent: "focus:dark:bg-[#333] focus-bg-white bg-white shadow-sm dark:bg-[#333] border border-white/5 font-nunito",
                                    trigger: "bg-white shadow-sm dark:bg-[#333]  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm   "
                                }}
                            >
                                {Categories.map((department: DepartmentInterface, index: number) => (
                                    <SelectItem key={index}>{department.name}</SelectItem>
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
                            <input
                                name="image"
                                required
                                placeholder=" "
                                className="bg-white shadow-sm dark:bg-[#333]  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm   h-10 w-[25vw] rounded-xl"
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
                        </div>

                        {/* <input name="admin" value={user?._id} type="hidden" /> */}
                        <input name="intent" value="create" type="hidden" />
                        <input name="base64Image" value={base64Image} type="hidden" />

                        <div className="flex justify-end gap-2 mt-10 font-nunito">
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Close
                            </Button>
                            <button type="submit" className="rounded-xl bg-[#05ECF2] bg-opacity-20 text-[#05ECF2] text-sm font-nunito px-4">
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
    const { categories } = await department.getCategories({
        request,
        page,
        search_term
    });

    return json({ user, users, totalPages, categories });
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