


import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, User } from "@nextui-org/react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { useTheme } from "next-themes";
// import useTheme from "next-theme/dist/useTheme";
import { ReactNode, useEffect, useState } from "react";
import CloseIcon from "~/components/icons/CloseIcon";
import DashboardIcon from "~/components/icons/DashboardIcon";
import LogoutIcon from "~/components/icons/LogoutIcon";
import MoonIcon from "~/components/icons/MoonIcon";
import NotificationIcon from "~/components/icons/NotificationIcon";
import ProductIcon from "~/components/icons/ProductsIcon";
import RefreshIcon from "~/components/icons/RefreshIcon";
import { SearchIcon } from "~/components/icons/SearchIcon";
import SettingsIcon from "~/components/icons/SettingsIcon";
import SunIcon from "~/components/icons/SunIcon";
import SupplierIcon from "~/components/icons/SupplierIcon";
import UsersGroup from "~/components/icons/UsersGroup";
// import logo from "~/components/illustration/logo.png"
import cat from "~/components/illustration/categorization.png"
import ConfirmModal from "~/components/modal/confirmModal";
// import adminDashboardController from "~/controllers/AdminDashBoardController";
// import productsController from "~/controllers/productsController";
// import restocking from "~/controllers/restocking";
// import { RegistrationInterface } from "~/interfaces/interface";
import { getSession } from "~/session";
import CatIcon from "~/components/icons/CatIcon";
import CategoryIcon from "~/components/icons/CatIcon";
import RestockIcon from "~/components/icons/restock";
import SaleIcon from "~/components/icons/Sales";
import usersController from "~/controller/Users";
import { RegistrationInterface } from "~/interface/interface";
import logo from "~/components/images/addentech_logo.png"
import { DepartmentIcon } from "~/components/icons/departmentIcon";

interface UserLayoutProps {
    children?: ReactNode;
    pageName?: string;
}

const StaffLayout = ({ children, pageName }: UserLayoutProps) => {
    const { theme, setTheme } = useTheme();
    const [desktopNav, setDesktopNav] = useState(true);
    const [mobileNavOpen, setMobileNavOpen] = useState(false); // Hide mobile nav by default
    const [isLogoutConfirmModalOpened, setIsLogoutConfirmModalOpened] = useState(false)
    const submit = useSubmit()
    const [isLoading, setIsLoading] = useState(false)
    // const { user } = useLoaderData<{
    //     user: RegistrationInterface[];
    // }>();

    // const { theme, setTheme } = useTheme()

    // const { user } = useLoaderData<{ user: { user: string } }>()
    useEffect(() => {
        const timeOut = setTimeout(() => {
            setIsLoading(true)
        }, 1000)

        return () => clearTimeout(timeOut)
    }, [])


    const desktopNavToggle = () => {
        setDesktopNav(!desktopNav);
    };
    const mobileNavToggle = () => {
        setMobileNavOpen(!mobileNavOpen);
    };
    const handleConfirmModalClosed = () => {
        setIsLogoutConfirmModalOpened(false);
    };

    return (
        <div className=" bg-[#18181B] h-[100vh] w-full  overflow-y-hidden">


            {/* Desktop navigation bar */}
            {/* Desktop navigation bar */}
            <div className={`hidden lg:block md:block w-64 h-[100vh] shadow-md dark:text-white fixed transition-transform duration-500 p-6 ${desktopNav ? "transform-none" : "-translate-x-full"}`}>
                {/* logo */}
                <div >
                    <div>
                        <img src={logo} className="h-16 w-40" alt="" />
                    </div>
                </div>
                {/* Side Nav Content */}
                <div className="flex flex-col gap-4">
                    <ul className="mt-6 pl-2 flex flex-col gap-2">
                        <Link className="" to="/hod">
                            <li className="text-sm hover:bg-[#05ECF2]  hover:border-r-4 hover:border-r-white hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out text-gray-200">
                                <DashboardIcon className="text-[#05ECF2] h-5 w-5 hover:text-white" />
                                Dashboard
                            </li>
                        </Link>
                    </ul>

                    <ul className=" pl-2 flex flex-col gap-2">
                        <Link className="" to="/staff/projects">
                            <li className="text-sm hover:bg-[#05ECF2] hover:border-r-4 hover:border-r-white hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out text-gray-200">
                                <UsersGroup className="text-[#05ECF2] h-5 w-5 hover:text-white" />
                                Projects
                            </li>
                        </Link>
                    </ul>



                </div>
            </div>

            {/* Mobile Side Navigation Bar */}
            <div className={`h-full lg:hidden z-10  absolute md:hidden w-64 bg-primary bg-opacity-40  text-white backdrop-blur transition-transform duration-500 p-6 ${mobileNavOpen ? "transform-none" : "-translate-x-full"}`}>
                {/* Side Nav Content */}
                <button onClick={mobileNavToggle} className="block md:hidden ml-auto lg:hidden">
                    <CloseIcon className="text-danger-300" />
                </button>

                {/* logo */}
                <div className="flex items-center gap-2">
                    <div>
                        {/* <img className="bg-white rounded-full h-10 w-10 " src={logo} alt="logo" /> */}
                    </div>
                    <div className="font-nunito text-3xl">VoteEase</div>
                </div>
                {/* profile */}
                <div className=" mt-10">
                    <User
                        name="Jane Doe"
                        description="Product Designer"
                        avatarProps={{
                            src: "https://i.pravatar.cc/150?u=a04258114e29026702d"
                        }}
                    ></User>
                </div>
                {/* Side Nav Content */}
                <ul className="mt-10">
                    <Link className="" to="/user">
                        <li className="hover:bg-primary-400 text-md hover:bg-white hover:text-primary font-nunito p-2 rounded-lg flex items-center gap-2">
                            <DashboardIcon className="h-4 w-4" />
                            Dashboard
                        </li>
                    </Link>
                    <Link className="" to="/user/ticket">
                        <li className="hover:bg-primary-400 text-md hover:bg-white hover:text-primary font-nunito p-2 rounded-lg flex items-center gap-2">
                            <DashboardIcon className="h-4 w-4" />
                            Tickets
                        </li>
                    </Link>


                </ul>
            </div>

            <div className={`h-full p-4 transition-all duration-500 overflow-x-hidden  z-1 ${desktopNav ? "lg:ml-64 md:ml-64" : ""}`}>
                {/* Main Content */}
                <div className="">
                    {children}
                </div>
            </div>

            <ConfirmModal className="dark:bg-slate-950 border border-white/5" header="Confirm Logout" content="Are you sure to logout?" isOpen={isLogoutConfirmModalOpened} onOpenChange={handleConfirmModalClosed}>
                <div className="flex gap-4">
                    <Button color="primary" variant="flat" className="font-montserrat font-semibold" size="sm" onPress={handleConfirmModalClosed}>
                        No
                    </Button>
                    <Button color="danger" variant="flat" className="font-montserrat font-semibold " size="sm" onClick={() => {
                        setIsLogoutConfirmModalOpened(false)
                        submit({
                            intent: "logout",
                        }, {
                            method: "post"
                        })
                    }} >
                        Yes
                    </Button>
                </div>
            </ConfirmModal>

        </div>
    );
};

export default StaffLayout;

// export const action: ActionFunction = async ({ request }) => {
//     const formData = await request.formData();
//     const intent = formData.get("intent") as string;

//     switch (intent) {
//         case "logout":
//             const logout = await adminDashboardController.logout(intent)
//             return logout

//         default:
//             return json({
//                 message: "Bad request",
//                 success: false,
//                 status: 500
//             })
//     }
// }

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") || "";

    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");
    if (!token) return redirect("/");
    const { user } = await usersController.FetchUsers({
        request,
        page,
        search_term
    });




    return json({
        user
    })
};


