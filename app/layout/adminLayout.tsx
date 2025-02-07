import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, User } from "@nextui-org/react";
import { LoaderFunction, redirect } from "@remix-run/node";
import { Link, useActionData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { ReactNode, useEffect, useState } from "react";
import CloseIcon from "~/components/icons/CloseIcon";
import DashboardIcon from "~/components/icons/DashboardIcon";
import NotificationIcon from "~/components/icons/NotificationIcon";
import { SearchIcon } from "~/components/icons/SearchIcon";
import UsersGroup from "~/components/icons/UsersGroup";
import logo from "~/components/images/header-logo-blue.svg"
import { DepartmentIcon } from "~/components/icons/departmentIcon";
import { Toaster } from "react-hot-toast";
import { errorToast, successToast } from "~/components/toast";
import BackIcon from "~/components/icons/BackIcon";
import UserIcon from "~/components/icons/UserIcon";

interface UserLayoutProps {
    children?: ReactNode;
    handleOnClick?: string
    buttonName?: string
    redirect?: string
    redirectDelay?: string
}

const AdminLayout = ({ children, handleOnClick, buttonName, redirect, redirectDelay }: UserLayoutProps) => {
    const [desktopNav, setDesktopNav] = useState(true);
    const [mobileNavOpen, setMobileNavOpen] = useState(false); // Hide mobile nav by default
    const navigate = useNavigate()
    const actionData = useActionData<any>()
    const navigation = useNavigation()
    const isLoading = navigation.state === "loading";
    const mobileNavToggle = () => {
        setMobileNavOpen(!mobileNavOpen);
    };

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message);

                // Set a delay before triggering the redirection
                const timer = setTimeout(() => {
                    if (typeof redirect === "function") {
                        redirect();
                    } else if (typeof redirect === "string") {
                        window.location.href = redirect; // Redirect using a URL string
                    }
                }, redirectDelay);

                // Cleanup the timer on unmount
                return () => clearTimeout(timer);
            } else {
                errorToast(actionData.message);
            }
        }
    }, [actionData, redirect, redirectDelay]);

    return (
        <div className="  h-[100vh] w-full  overflow-y-hidden">

            {/* Desktop navigation bar */}
            {/* Desktop navigation bar */}
            <div className="relative">
                <div className={`hidden border dark:border-white/10  lg:block md:block w-64 h-[100vh] shadow-md dark:text-white fixed transition-transform duration-500 p-6 bg-default-50 ${desktopNav ? "transform-none" : "-translate-x-full"}`}>
                {/* logo */}
                <div >
                        <Link to="/admin">
                            <img src={logo} className="h-16 w-40" alt="" />
                        </Link>
                </div>
                {/* Side Nav Content */}
                <div className="flex flex-col gap-4">
                    <ul className="mt-6 pl-2 flex flex-col gap-2">
                        <Link className="" to="/admin">
                                <li className="text-sm hover:bg-[#249DD0]  hover:border-r-4 h-10 hover:border-r-white hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out text-gray-200">
                                    <DashboardIcon className="text-[#249DD0] h-5 w-5 hover:text-white" />
                                Dashboard
                            </li>
                        </Link>
                    </ul>
                    <ul className=" pl-2 flex flex-col gap-2">
                        <Link className="" to="/admin/departments">
                                <li className="text-sm h-10 hover:bg-[#249DD0] hover:border-r-4 hover:border-r-white hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out text-gray-200">
                                    <DepartmentIcon className="text-[#249DD0] h-5 w-5 hover:text-white" />
                                Departments
                            </li>
                        </Link>
                    </ul>
                    <ul className=" pl-2 flex flex-col gap-2">
                        <Link className="" to="/admin/users">
                                <li className="h-10 text-sm hover:bg-[#249DD0] hover:border-r-4 hover:border-r-white hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out text-gray-200">
                                    <UsersGroup className="text-[#249DD0] h-5 w-5 hover:text-white" />
                                Team
                            </li>
                        </Link>
                    </ul>
                    <ul className=" pl-2 flex flex-col gap-2">
                        <Link className="" to="/admin/category">
                                <li className="h-10 text-sm hover:bg-[#249DD0] hover:border-r-4 hover:border-r-white hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out text-gray-200">
                                    <UsersGroup className="text-[#249DD0] h-5 w-5 hover:text-white" />
                                Blog Category
                            </li>
                        </Link>
                    </ul>
                    <ul className=" pl-2 flex flex-col gap-2">
                        <Link className="" to="/admin/blog">
                                <li className="h-10 text-sm hover:bg-[#249DD0] hover:border-r-4 hover:border-r-white hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out text-gray-200">
                                    <UsersGroup className="text-[#249DD0] h-5 w-5 hover:text-white" />
                                Blog
                            </li>
                        </Link>
                    </ul>


                    <ul className=" pl-2 flex flex-col gap-2">
                            <Link className="" to="/admin/contact">
                                <li className=" h-10 text-sm hover:bg-[#249DD0] hover:border-r-4 hover:border-r-white hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out text-gray-200">
                                    <UsersGroup className="text-[#249DD0] h-5 w-5 hover:text-white" />
                                Contacts
                            </li>
                        </Link>
                    </ul>
                    <ul className=" pl-2 flex flex-col gap-2">
                        <Link className="" to="/admin/task">
                                <li className="h-10 text-sm hover:bg-[#249DD0] hover:border-r-4 hover:border-r-white hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out text-gray-200">
                                    <UsersGroup className="text-[#249DD0] h-5 w-5 hover:text-white" />
                                Projects
                            </li>
                        </Link>
                    </ul>
                    <ul className=" pl-2 flex flex-col gap-2">
                        <Link className="" to="/admin/memorandum">
                                <li className="h-10 text-sm hover:bg-[#249DD0] hover:border-r-4 hover:border-r-white hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out text-gray-200">
                                    <UsersGroup className="text-[#249DD0] h-5 w-5 hover:text-white" />
                                Memorandum
                            </li>
                        </Link>
                    </ul>
                        <ul className=" pl-2 flex flex-col gap-2">
                            <Link className="" to="/admin/reporting">
                                <li className="h-10 text-sm hover:bg-primary hover:border-r-4 hover:border-r-white  hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out text-gray-200">
                                    <UsersGroup className="text-[#249DD0] h-5 w-5 hover:text-white" />
                                    Anonymous Repoting
                                </li>
                            </Link>
                        </ul>
                    </div>
                </div>
            </div>


            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
                </div>
            )}

            <div className={`h-full p-4 transition-all duration-500 overflow-x-hidden  z-1 ${desktopNav ? "lg:ml-64 md:ml-64" : ""}`}>
                {/* Main Content */}
                <div className="">
                    <Toaster position="top-right" />
                    {/* seach contents */}
                    {/* seach contents */}
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
                    {/* back button */}
                    {/* back button */}
                    <div className="flex z-0 mt-6 justify-between items-center px-6 border dark:border-white/10 bg-default-50 shadow-md h-20 rounded-2xl gap-2 overflow-y-hidden">
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
                                onClick={handleOnClick}
                                color="primary"
                                size="md"
                                className="font-nunito flex text-sm px-8"
                            >
                                <UserIcon className="text-defaul-200 h-4 w-4" />
                                {buttonName}
                            </Button>

                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;



export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") || "";
};


