import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem, Skeleton, TableCell, TableRow, User } from "@nextui-org/react";
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
import { UserColumns } from "~/components/table/columns";
import NewCustomTable from "~/components/table/newTable";
import { errorToast, successToast } from "~/components/toast";
import CustomInput from "~/components/ui/CustomInput";
import department from "~/controller/departments";
import taskController from "~/controller/task";
import usersController from "~/controller/Users";
import { DepartmentInterface, RegistrationInterface } from "~/interface/interface";
import AdminLayout from "~/layout/adminLayout";
import { getSession } from "~/session";
import { v4 as uuidv4 } from "uuid";
export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" }];
};

const Users = () => {
    const [isCreateModalOpened, setIsCreateModalOpened] = useState(false);
    const [base64Image, setBase64Image] = useState<any>();
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false);
    const [isEditModalOpened, setIsEditModalOpened] = useState(false);
    const [dataValue, setDataValue] = useState<RegistrationInterface>();
    const [isLoading, setIsLoading] = useState(false);
    const submit = useSubmit();
    const actionData = useActionData<any>();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState(0);
    console.log("This is the ref:" + referenceNumber);

    const {

        departments,
        users
    } = useLoaderData<{
        departments: DepartmentInterface[]
        users: RegistrationInterface[]
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
        <AdminLayout pageName="Users Management">
            <div>
                <div className="z-1">
                    <div className="flex justify-between">
                        <Input
                            size="md"
                            placeholder="Search user..."
                            startContent={<SearchIcon className="" />}
                            onValueChange={(value) => {
                                const timeoutId = setTimeout(() => {
                                    navigate(`?search_term=${value}`);
                                }, 100);
                                return () => clearTimeout(timeoutId);
                            }}
                            classNames={{
                                inputWrapper: "shadow-sm w-[50vw] text-sm font-nunito dark:bg-[#18181B] border border-2 border-white/10",
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

                    <div className="flex z-0 mt-6 justify-between items-center px-6 border dark:border-white/10 bg-default-50 shadow-md h-20 rounded-2xl gap-2 overflow-y-hidden">
                        <Toaster position="top-right" />

                        <div className="">
                            <Button
                                size="md"
                                variant="bordered"
                                onClick={() => {
                                    navigate(-1);
                                }}
                                color="primary"
                                className="font-nunito text-sm"
                            >
                                <BackIcon className="h-[20px] w-[20px]" />
                                <p>Back</p>
                            </Button>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => {
                                    setIsDrawerOpen(!isDrawerOpen)
                                }}
                                color="primary"
                                size="md"
                                className="font-nunito flex text-sm px-8"
                            >
                                <UserIcon className="text-defaul-200 h-4 w-4" /> Create Memo
                            </Button>

                        </div>
                    </div>
                </div>

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
                        <CustomInput
                            label="Reference Number"
                            isRequired
                            name="referenceNumber"
                            type="text"
                            placeholder=" "
                            labelPlacement="outside"
                        />

                        <div className="flex gap-6">
                            <Select
                                label="From Department"
                                labelPlacement="outside"
                                placeholder="Select department"
                                isRequired
                                name="department"
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
                                name="department"
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
                            name="referenceNumber"
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
                            name="department"
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
                            name="department"
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
                            <input hidden type="text" />
                            <label htmlFor="" className="font-nunito">Subject</label>
                            <ReactQuill
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
                                name="department"
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
                            name="referenceNumber"
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
                            name="department"
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
                            <input hidden type="text" />
                            <label htmlFor="" className="font-nunito">Remarks</label>
                            <ReactQuill
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
                                name="department"
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
                                name="department"
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

                    </Form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Users;

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

    return json({ departments, users });
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