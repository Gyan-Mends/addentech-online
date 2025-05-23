import { Button, Divider, Select, SelectItem, TableCell, TableRow, Tooltip, User } from "@nextui-org/react"
import { ActionFunction, json, LinksFunction, LoaderFunction, MetaFunction, } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react"
import { Plus, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import { DeleteIcon } from "~/components/icons/DeleteIcon"
import { EditIcon } from "~/components/icons/EditIcon"
import { FileUploader } from "~/components/icons/uploader"
import ConfirmModal from "~/components/modal/confirmModal"
import Drawer from "~/components/modal/drawer"
import { UserColumns } from "~/components/table/columns"
import NewCustomTable from "~/components/table/newTable"
import { errorToast, successToast } from "~/components/toast"
import CustomInput from "~/components/ui/CustomInput"
import department from "~/controller/departments"
import usersController from "~/controller/Users"
import { DepartmentInterface, RegistrationInterface } from "~/interface/interface"
import AdminLayout from "~/layout/adminLayout"
import { getSession } from "~/session"
export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" }];
};

const Users = () => {
    const [isCreateModalOpened, setIsCreateModalOpened] = useState(false)
    const [base64Image, setBase64Image] = useState<any>()
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false)
    const [isEditModalOpened, setIsEditModalOpened] = useState(false)
    const [isEditDrawerOpened, setIsEditDrawerOpened] = useState(false)
    const [dataValue, setDataValue] = useState<RegistrationInterface>()
    const [isLoading, setIsLoading] = useState(false)
    const submit = useSubmit()
    const actionData = useActionData<{
        message: string;
        success: boolean;
        status: number;
    }>()
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
    const [content, setContent] = useState("");
    useEffect(() => {
        // Set the initial content from dataValue.description
        if (dataValue?.bio) {
            setContent(dataValue.bio);
        }
    }, [dataValue]);

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
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message)
                setIsCreateModalOpened(false)
                setIsConfirmModalOpened(false)
                setIsEditDrawerOpened(false)
            } else {
                errorToast(actionData.message)
            }
        }
    }, [actionData])

    const handleClick = () => {
        setIsCreateModalOpened(true)
    }
    const handleCreateModalClosed = () => {
        setIsCreateModalOpened(false)
    }
    const handleConfirmModalClosed = () => {
        setIsConfirmModalOpened(false)
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

    useEffect(() => {
        if (dataValue?.image) {
            setBase64Image(dataValue.image); // Set the image from the database as the initial value
        }
    }, [dataValue]);

    return (
        <AdminLayout>
            <div className="relative">
                <Toaster position="top-right" />
                <div className="flex justify-end">
                    <Button className="border text-white border-white/30 px-4 py-1 bg-pink-500" onClick={() => {
                        setIsCreateModalOpened(true)
                    }}>
                        <Plus />
                        Create User
                    </Button>
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
                            <TableCell className="relative flex items-center gap-4 mt-2">
                                <button className="text-primary " onClick={() => {
                                    setIsEditDrawerOpened(true)
                                    setDataValue(user)
                                    console.log(dataValue);

                                }}>

                                    <EditIcon className="" />
                                </button>
                                <button className="text-danger" onClick={() => {
                                    setIsConfirmModalOpened(true)
                                    setDataValue(user)
                                }}>
                                    <DeleteIcon className="" />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </NewCustomTable>
            </div>

            {/* confirm modal */}
            {/* confirm modal */}
            <ConfirmModal header="Confirm Delete" content="Are you sure to delete user?" isOpen={isConfirmModalOpened} onOpenChange={handleConfirmModalClosed}>
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
                console.log(dataValue),
                <Drawer isDrawerOpened={isEditDrawerOpened} handleDrawerClosed={handleEditDrawerClosed} title="Edit User">
                    <Form method="post" className="flex flex-col gap-4 p-4">
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
                                placeholder="Select Role"
                                isRequired
                                defaultSelectedKeys={[dataValue.role]} // Ensure dataValue.role matches a valid key
                                name="role"
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent:
                                        "z-[10000] bg-white shadow-sm dark:bg-default-50 border border-black/5 font-nunito",
                                    trigger:
                                        "shadow-sm border border-black/5 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full !bg-white",
                                }}
                            >
                                {[
                                    { key: "admin", value: "admin", display_name: "Admin" },
                                    { key: "hod", value: "hod", display_name: "HOD" },
                                    { key: "staff", value: "staff", display_name: "Staff" },
                                ].map((role) => (
                                    <SelectItem key={role.key} value={role.value}>
                                        {role.display_name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>


                        <div className="flex gap-4">
                            <Select
                                isRequired
                                className="max-w-xs"
                                label="Department"
                                labelPlacement="outside"
                                placeholder="Select Department"
                                name="department"
                                defaultSelectedKeys={[dataValue.department]}
                                classNames={{
                                    label: "font-nunito text-sm text-default-100",
                                    popoverContent:
                                        "z-[10000] bg-white shadow-sm dark:bg-default-50 border border-black/5 font-nunito",
                                    trigger:
                                        "shadow-sm border border-black/5 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full !bg-white",
                                }}
                            >
                                {departments.map((department) => (
                                    <SelectItem key={department._id} value={department._id}>
                                        {department.name}
                                    </SelectItem>
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
                                <label className="font-nunito block text-sm !text-black" htmlFor="image">
                                    Image
                                </label>
                                <div className="relative inline-block w-40 h-40 border-2 border-dashed border-gray-400 rounded-xl dark:border-white/30 mt-2">
                                    {/* The file input */}
                                    <input
                                        name="image"
                                        id="image"
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept="image/*"
                                        onChange={(event) => {
                                            const file = event.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setBase64Image(reader.result as string); // Update state with new image data
                                                };
                                                reader.readAsDataURL(file); // Convert file to base64
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
                                            <Upload className="h-14 w-14 text-gray-400" />
                                        </span>
                                    )}
                                </div>
                            </div>

                        <div>
                            <Divider />

                            <div className="mt-6">
                                <label htmlFor="" className="font-nunito">Bio</label>
                                <input type="hidden" name="bio" value={content} />
                                <ReactQuill
                                    value={content} // Bind editor content to state
                                    onChange={setContent} // Update state on change
                                    modules={modules}
                                    className="md:!h-[30vh] mt-2 font-nunito rounded w-full  !font-nunito"
                                />
                            </div>

                            <Divider className="mt-28" />

                            <div className="flex flex-col gap-6">
                                <p>Professional Experience </p>
                                <CustomInput
                                    defaultValue={dataValue.institution}
                                    label=" Institution"
                                    isRequired
                                    name="institution"
                                    isClearable
                                    placeholder=" "
                                    type="text"
                                    labelPlacement="outside"

                                />
                                <div className="flex gap-4">
                                    <CustomInput
                                        defaultValue={dataValue.positionInstitution}
                                        label=" Position_institution"
                                        isRequired
                                        name="position_institution"
                                        isClearable
                                        placeholder=" "
                                        type="text"
                                        labelPlacement="outside"

                                    />
                                    <CustomInput
                                        defaultValue={dataValue.dateCompletedInstitution}
                                        label=" Date Completed"
                                        isRequired
                                        name="date_completed"
                                        isClearable
                                        placeholder=" "
                                        type="date"
                                        labelPlacement="outside"

                                    />

                                </div>
                            </div>
                            <Divider className="mt-6" />
                            <div className="flex flex-col gap-6 mt-4">
                                <p>Education Background</p>
                                <CustomInput
                                    defaultValue={dataValue.institutionName}
                                    label="Intution Name"
                                    isRequired
                                    name="institution_name"
                                    isClearable
                                    placeholder=" "
                                    type="text"
                                    labelPlacement="outside"

                                />
                                <div className="flex gap-4">
                                    <CustomInput
                                        defaultValue={dataValue.positionInstitution}
                                        label=" Program"
                                        isRequired
                                        name="program"
                                        isClearable
                                        placeholder=" "
                                        type="text"
                                        labelPlacement="outside"

                                    />
                                    <CustomInput
                                        defaultValue={dataValue.dateCompletedProgram}
                                        isRequired
                                        label="Date Completed"
                                        isRequired
                                        name="date_c"
                                        isClearable
                                        placeholder=" "
                                        type="date"
                                        labelPlacement="outside"

                                    />

                                </div>
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
                </Drawer>
            )
            }
            {/* Create Modal */}
            {/* Create Modal */}
            <Drawer isDrawerOpened={isCreateModalOpened} handleDrawerClosed={handleCreateModalClosed} title="Create User">
                <Form method="post" className="flex flex-col gap-4 p-4">
                    <CustomInput
                        label="First name"
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
                                popoverContent: "z-[10000] bg-white shadow-sm dark:bg-default-50 border border-black/5 font-nunito ",
                                trigger: " shadow-sm   border border-black/30 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full !bg-white  "
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
                                popoverContent: "z-[10000]  !bg-white shadow-sm  border border-black/5 font-nunito ",
                                trigger: "   shadow-sm   border border-black/30  hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full !bg-white "
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
                            {base64Image ? (
                                <img
                                    src={base64Image}
                                    alt="Preview"
                                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                    <FileUploader className="h-20 w-20 !text-gray-600" />
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <Divider />

                        <div className="mt-6">
                            <label htmlFor="" className="font-nunito">Bio</label>
                            <input type="hidden" name="bio" value={content} />
                            <ReactQuill
                                value={content} // Bind editor content to state
                                onChange={setContent} // Update state on change
                                modules={modules}
                                className="md:!h-[30vh] mt-2 font-nunito rounded w-full  !font-nunito"
                            />
                        </div>

                        <Divider className="mt-28" />

                        <div className="flex flex-col gap-6">
                            <p>Professional Experience </p>
                            <CustomInput
                                label=" Institution"
                                isRequired
                                name="institution"
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"

                            />
                            <div className="flex gap-4">
                                <CustomInput
                                    label=" Position_institution"
                                    isRequired
                                    name="position_institution"
                                    isClearable
                                    placeholder=" "
                                    type="text"
                                    labelPlacement="outside"

                                />
                                <CustomInput
                                    label=" Date Completed"
                                    isRequired
                                    name="date_completed"
                                    isClearable
                                    placeholder=" "
                                    type="date"
                                    labelPlacement="outside"

                                />

                            </div>
                        </div>
                        <Divider className="mt-6" />
                        <div className="flex flex-col gap-6 mt-4">
                            <p>Education Background</p>
                            <CustomInput
                                label="Intution Name"
                                isRequired
                                name="institution_name"
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"

                            />
                            <div className="flex gap-4">
                                <CustomInput
                                    label=" Program"
                                    isRequired
                                    name="program"
                                    isClearable
                                    placeholder=" "
                                    type="text"
                                    labelPlacement="outside"

                                />
                                <CustomInput
                                    label="Date Completed"
                                    isRequired
                                    name="date_c"
                                    isClearable
                                    placeholder=" "
                                    type="date"
                                    labelPlacement="outside"

                                />

                            </div>
                        </div>
                    </div>

                    <input name="admin" value={user?._id} type="hidden" />
                    <input name="intent" value="create" type="hidden" />
                    <input name="base64Image" value={base64Image} type="hidden" />

                    <button type="submit" className="rounded-xl bg-pink-500 text-white text-sm font-nunito h-10 w-40 px-4">
                        Submit
                    </button>
                </Form>
            </Drawer>
        </AdminLayout >
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
    const bio = formData.get("bio") as string;
    const institution = formData.get("institution") as string;
    const positionInstitution = formData.get("position_institution") as string;
    const dateCompletedInstitution = formData.get("date_completed") as string;
    const institutionName = formData.get("institution_name") as string;
    const program = formData.get("program") as string;
    const dateCompletedProgram = formData.get("date_c") as string;



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
                base64Image,
                bio,
                institutionName,
                program,
                dateCompletedProgram,
                institution,
                positionInstitution,
                dateCompletedInstitution,
            });
            return user;


        case "delete":
            const deleteUser = await usersController.DeleteUser({
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
                id,
                bio,
                institutionName,
                program,
                dateCompletedProgram,
                institution,
                positionInstitution,
                dateCompletedInstitution,
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
        { title: "Addentechnology Limited" },
        {
            name: "description",
            content: ".",
        },
        {
            name: "author",
            content: "Mends Gyan",
        },
        { name: "og:title", content: "Addentechnology" },
        {
            name: "og:description",
            content: "",
        },
        {
            name: "og:image",
            content:
                "https://res.cloudinary.com/app-deity/image/upload/v1701282976/qfdbysyu0wqeugtcq9wq.jpg",
        },
        { name: "og:url", content: "https://addentech-online.vercel.app" },
        {
            name: "keywords",
            content:
                "Adentechnology Ghana, Dennis Law Ghana, Dennis Law, Addentech",
        },
    ];
};