import { Button, Divider, Select, SelectItem, TableCell, TableRow, Tooltip, User } from "@nextui-org/react"
import { ActionFunction, json, LinksFunction, LoaderFunction, MetaFunction, } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react"
import { Plus, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import { Trash2, Edit, Upload as FileUpload } from "lucide-react"
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
        departments,
        currentPage
    } = useLoaderData<{
        user: { _id: string },
        users: RegistrationInterface[],
        totalPages: number,
        departments: DepartmentInterface[],
        currentPage: number
    }>()
    const [content, setContent] = useState("");
    const [department, setDepartment] = useState()
    useEffect(() => {
        // Set the initial content from dataValue.description
        if (dataValue?.bio) {
            setContent(dataValue.bio);
        }
    }, [dataValue]);

    const ReactQuill = typeof window === "object" ? require("react-quill") : () => false
    const modules = {
        // toolbar color and background
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
            // setDataValue(dataValue.department);
        }
    }, [dataValue]);

    useEffect(() => {
        if (dataValue?.image) {
            setBase64Image(dataValue.image); // Set the image from the database as the initial value
        }
    }, [dataValue]);

    return (
        <AdminLayout>
            <div className="relative bg-dashboard-primary min-h-screen">
                <Toaster position="top-right" />
                <div className="flex justify-end mb-6">
                    <Button className="border text-dashboard-primary border-dashboard-light px-4 py-1 bg-action-primary hover:bg-action-primary:hover" onClick={() => {
                        setIsCreateModalOpened(true)
                    }}>
                        <Plus />
                        Create User
                    </Button>
                </div>
                {/* table  */}
                <NewCustomTable
                    columns={UserColumns}
                    loadingState={navigation.state === "loading" ? "loading" : "idle"}
                    totalPages={totalPages}
                    page={currentPage}
                    setPage={(page) => (
                        navigate(`?page=${page}`)
                    )}>
                    {users?.map((user, index: number) => (
                        <TableRow key={index} className="border-b border-dashboard hover:bg-dashboard-tertiary">
                            <TableCell className="text-xs">
                                <p className="!text-xs">
                                    <User
                                        avatarProps={{ radius: "sm", src: user.image }}
                                        name={
                                            <p className="font-nunito text-xs text-dashboard-primary">
                                                {user.firstName + ' ' + user.middleName + ' ' + user.lastName}
                                            </p>
                                        }
                                    />
                                </p>
                            </TableCell>
                            <TableCell className="text-xs text-dashboard-secondary">{user.email}</TableCell>
                            <TableCell className="text-dashboard-secondary">{user.phone}</TableCell>
                            <TableCell className="text-dashboard-secondary">{typeof user.department === 'object' && user.department ? (user.department as any).name : user.department}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-status-admin text-dashboard-primary' :
                                        user.role === 'manager' ? 'bg-avatar-blue text-dashboard-primary' :
                                            user.role === 'department_head' ? 'bg-avatar-purple text-dashboard-primary' :
                                                'bg-status-active text-dashboard-primary'
                                    }`}>
                                    {user.role}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <button className="text-action-view hover:text-green-300" onClick={() => {
                                        setIsEditDrawerOpened(true)
                                        setDataValue(user as any)
                                        console.log('=== EDIT DEBUG INFO ===');
                                        console.log('Current page:', currentPage);
                                        console.log('User data for edit:', user);
                                        console.log('Department structure:', user.department);
                                        console.log('Department type:', typeof user.department);
                                        console.log('Available departments:', departments);
                                        console.log('========================');

                                    }}>
                                        <Edit className="" />
                                    </button>
                                    <button className="text-action-delete hover:text-red-300" onClick={() => {
                                        setIsConfirmModalOpened(true)
                                        setDataValue(user as any)
                                    }}>
                                        <Trash2 className="" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </NewCustomTable>
            </div>

            {/* confirm modal */}
            {/* confirm modal */}
            <ConfirmModal header="Confirm Delete" content="Are you sure to delete user?" isOpen={isConfirmModalOpened} onOpenChange={handleConfirmModalClosed}>
                <div className="flex gap-4">
                    <Button color="success" variant="flat" className="font-montserrat font-semibold !text-white" size="sm" onPress={handleConfirmModalClosed}>
                        No
                    </Button>
                    <Button color="danger" variant="flat" className="font-montserrat font-semibold " size="sm" onPress={() => {
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
                    <Form method="post" className="flex flex-col gap-4 p-4 !text-white">
                        <CustomInput
                            className="!text-white"
                            label="First name"
                            isRequired
                            defaultValue={dataValue.firstName}
                            isClearable
                            name="firstname"
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />
                        <div className="flex flex-col sm:flex-row gap-4">
                            <CustomInput
                                className="!text-white"
                                label="Middle Name"
                                name="middlename"
                                defaultValue={dataValue.middleName}
                                placeholder=" "
                                isClearable
                                type="text"
                                labelPlacement="outside"
                            />
                            <CustomInput
                                className="!text-white"
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
                            className="!text-white"
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
                                className="!text-white"
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
                                className="!text-white"
                                label="Role"
                                labelPlacement="outside"
                                placeholder="Select Role"
                                isRequired
                                defaultSelectedKeys={[dataValue.role]} // Ensure dataValue.role matches a valid key
                                name="role"
                                classNames={{
                                    label: "font-nunito text-sm !text-white",
                                    popoverContent:
                                        "z-[10000] bg-dashboard-secondary shadow-sm border border-white/20 font-nunito",
                                    trigger:
                                        "shadow-sm border border-white/20 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out bg-dashboard-secondary max-w-full text-white",
                                }}
                            >
                                {[
                                    { key: "admin", value: "admin", display_name: "Admin" },
                                    { key: "department_head", value: "department_head", display_name: "Department Head" },
                                    { key: "manager", value: "manager", display_name: "Manager" },
                                    { key: "staff", value: "staff", display_name: "Staff" },
                                ].map((role) => (
                                    <SelectItem key={role.key} value={role.value}>
                                        {role.display_name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>


                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select
                                isRequired
                                className="flex-1 !text-white"
                                label="Department"
                                labelPlacement="outside"
                                placeholder="Select Department"
                                name="department"
                                selectedKeys={(() => {
                                    let selectedKey = '';

                                    // Debug the department selection
                                    console.log('Department selection debug:');
                                    console.log('dataValue.department:', dataValue.department);
                                    console.log('type:', typeof dataValue.department);

                                    // Handle both cases: department as object or as string ID
                                    if (typeof dataValue.department === 'string') {
                                        selectedKey = dataValue.department;
                                        console.log('Using string department ID:', selectedKey);
                                    } else if (dataValue.department?._id) {
                                        selectedKey = dataValue.department._id;
                                        console.log('Using department._id:', selectedKey);
                                    } else {
                                        console.log('No valid department found');
                                    }

                                    // Verify the department exists in available departments
                                    const departmentExists = departments.some(dept => dept._id === selectedKey);
                                    console.log('Department exists in list:', departmentExists);

                                    return selectedKey ? new Set([selectedKey]) : new Set([]);
                                })()}
                                onSelectionChange={(keys) => {
                                    console.log('Department selection changed:', keys);
                                }}
                                classNames={{
                                    label: "font-nunito text-sm !text-white",
                                    popoverContent:
                                        "z-[10000] bg-dashboard-secondary shadow-sm border border-white/20 font-nunito",
                                    trigger:
                                        "shadow-sm border border-white/20 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out bg-dashboard-secondary max-w-full text-white",
                                }}
                            >
                                {departments.map((department) => (
                                    <SelectItem key={department._id} value={department._id}>
                                        {department.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <CustomInput
                                className="!text-white flex-1"
                                label="Position"
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
                            <label className="font-nunito block text-sm !text-white" htmlFor="image">
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
                                        const file = event.target.files?.[0];
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
                                <label htmlFor="" className="font-nunito !text-white">Bio</label>
                                <input type="hidden" name="bio" value={content} />
                                <ReactQuill
                                    value={content} // Bind editor content to state
                                    onChange={setContent} // Update state on change
                                    modules={modules}
                                    className="md:!h-[30vh] mt-2 font-nunito rounded w-full  !font-nunito"
                                />
                            </div>
                        </div>

                        <input name="admin" value={user?._id} type="hidden" />
                        <input name="intent" value="update" type="hidden" />
                        <input name="id" value={dataValue?._id} type="hidden" />
                        <input name="currentPage" value={currentPage} type="hidden" />


                        <Button size="sm" type="submit" className="rounded-xl bg-action-primary text-white text-sm mt-20 font-nunito h-10 w-40 px-4" onClick={() => {
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
                <Form method="post" className="flex flex-col gap-4 p-4 !text-white">
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
                            className="!text-white"
                            label="Middle Name"
                            name="middlename"
                            placeholder=" "
                            isClearable
                            type="text"
                            labelPlacement="outside"
                        />
                        <CustomInput
                            className="!text-white"
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
                        className="!text-white"
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
                            className="!text-white"
                            label="Phone"
                            isRequired
                            name="phone"
                            isClearable
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />
                        <CustomInput
                            className="!text-white"
                            label="Password"
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
                        variant="bordered"
                            label="Role"
                            labelPlacement="outside"
                            className="!text-white"
                            placeholder=" "
                            isRequired
                            name="role"
                            classNames={{
                                label: "font-nunito text-sm !text-white",
                                popoverContent: "z-[10000] bg-dashboard-secondary shadow-sm border border-white/20 font-nunito ",
                                trigger: " shadow-sm text-gray-400  border border-white/20 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out bg-dashboard-secondary max-w-full text-white  "
                            }}
                        >
                            {[
                                { key: "admin", value: "admin", display_name: "Admin" },
                                { key: "department_head", value: "department_head", display_name: "Department Head" },
                                { key: "manager", value: "manager", display_name: "Manager" },
                                { key: "staff", value: "staff", display_name: "Staff" },
                            ].map((role) => (
                                <SelectItem className="!text-white" key={role.key}>{role.display_name}</SelectItem>
                            ))}
                        </Select>
                    </div>

                    <div className="flex gap-4">
                        <Select
                            variant="bordered"
                            label="Departments"
                            labelPlacement="outside"
                            placeholder=" "
                            isRequired
                            name="department"
                            classNames={{
                                label: "font-nunito text-sm !text-white",
                                popoverContent: "z-[10000]  bg-dashboard-secondary shadow-sm  border border-white/20 font-nunito ",
                                trigger: "shadow-sm text-gray-400  border border-white/20  hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out bg-dashboard-secondary max-w-full !text-white "
                            }}
                        >
                            {departments.map((department: DepartmentInterface, index: number) => (
                                <SelectItem className="!text-white" key={department._id}>{department.name}</SelectItem>
                            ))}
                        </Select>

                        <CustomInput
                            className="!text-white"
                            label="Position"
                            isRequired
                            name="position"
                            isClearable
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                        />
                    </div>

                    <div className=" ">
                        <label className="font-nunito block text-sm text-white" htmlFor="">Image</label>
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
                            <label htmlFor="" className="font-nunito text-white">Bio</label>
                            <input type="hidden" name="bio" value={content} />
                            <ReactQuill
                                value={content} // Bind editor content to state
                                onChange={setContent} // Update state on change
                                modules={modules}
                                className="md:!h-[30vh] mt-2 font-nunito rounded w-full  !font-nunito"
                            />
                        </div>
                    </div>

                    <input name="admin" value={user?._id} type="hidden" />
                    <input name="intent" value="create" type="hidden" />
                    <input name="base64Image" value={base64Image} type="hidden" />
                    <input name="currentPage" value={currentPage} type="hidden" />

                    <button type="submit" className="rounded-xl bg-action-primary text-white text-sm font-nunito mt-20 h-10 w-40 px-4">
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
    const currentPage = formData.get("currentPage") as string;

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

    return json({ user, users, totalPages, departments, currentPage: page });
}

