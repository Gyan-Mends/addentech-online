import { useState, useEffect } from "react";
import { Spinner } from "@nextui-org/react";
import { Link, useLocation, useNavigation } from "@remix-run/react";
import {
    BarChart2,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Clock,
    Home,
    LogOut,
    Menu,
    Users,
    X,
} from "lucide-react";
import { useLoaderData } from "@remix-run/react";

interface SidebarItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    hasDropdown?: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
    subItems?: Array<{ to: string; label: string; isActive: boolean }>;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    to,
    icon,
    label,
    isActive,
    hasDropdown = false,
    isOpen = false,
    onToggle,
    subItems = [],
}) => {
    const activeColor = "text-pink-500";
    const inactiveColor = "text-gray-600";

    return (
        <div className="mb-1">
            <div
                className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 ${isActive ? "bg-pink-50" : "hover:bg-gray-100"
                    }`}
                onClick={hasDropdown ? onToggle : undefined}
            >
                {hasDropdown ? (
                    <>
                        <div
                            className={`mr-3 ${isActive ? activeColor : inactiveColor}`}
                        >
                            {icon}
                        </div>
                        <span
                            className={`flex-1 ${isActive ? activeColor : inactiveColor}`}
                        >
                            {label}
                        </span>
                        {isOpen ? (
                            <ChevronDown
                                className={`h-4 w-4 ${isActive ? activeColor : inactiveColor}`}
                            />
                        ) : (
                            <ChevronRight
                                className={`h-4 w-4 ${isActive ? activeColor : inactiveColor}`}
                            />
                        )}
                    </>
                ) : (
                    <Link
                        to={to}
                        className="flex items-center w-full"
                        prefetch="intent"
                    >
                        <div
                            className={`mr-3 ${isActive ? activeColor : inactiveColor}`}
                        >
                            {icon}
                        </div>
                        <span
                            className={`flex-1 ${isActive ? activeColor : inactiveColor}`}
                        >
                            {label}
                        </span>
                    </Link>
                )}
            </div>

            {hasDropdown && isOpen && (
                <div className="ml-8 mt-1 space-y-1">
                    {subItems.map((subItem, index) => (
                        <Link
                            key={index}
                            to={subItem.to}
                            className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${subItem.isActive
                                ? "bg-pink-50 text-pink-500"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                            prefetch="intent"
                        >
                            {subItem.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
    const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
    const [isAttendanceDropdownOpen, setIsAttendanceDropdownOpen] = useState(false);
    const location = useLocation();
    const navigation = useNavigation();
    const loaderData = useLoaderData();

    // Set sidebar to closed by default on mobile, open on larger screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        // Set initial state
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Close sidebar when navigation occurs on mobile
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    // Toggle functions
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleTaskDropdown = () => setIsTaskDropdownOpen(!isTaskDropdownOpen);
    const toggleReportDropdown = () => setIsReportDropdownOpen(!isReportDropdownOpen);
    const toggleAttendanceDropdown = () => setIsAttendanceDropdownOpen(!isAttendanceDropdownOpen);

    // Check if a path is active
    const isPathActive = (path: string) => {
        return location.pathname === path;
    };

    // Check if a path starts with a prefix
    const pathStartsWith = (prefix: string) => {
        return location.pathname.startsWith(prefix);
    };

    const isLoading = navigation.state === "loading";

    return (
        <div className="flex min-h-screen font-nunito overflow-hidden">
            {/* Sidebar */}
            <div
                className={`${isSidebarOpen ? "w-64" : "w-0 -ml-64 md:ml-0"} bg-white shadow-r-md transition-all duration-300 ease-in-out flex flex-col z-30 fixed h-screen overflow-y-auto`}
            >
                {/* Logo */}
                <div className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-pink-500">
                            Addentech Online
                        </h1>
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 overflow-y-auto">
                    <SidebarItem
                        to="/admin"
                        icon={<Home className="h-5 w-5" />}
                        label="Dashboard"
                        isActive={isPathActive("/admin")}
                    />

                    <SidebarItem
                        to="#"
                        icon={<ClipboardList className="h-5 w-5" />}
                        label="Tasks"
                        isActive={pathStartsWith("/admin/task")}
                        hasDropdown={true}
                        isOpen={isTaskDropdownOpen}
                        onToggle={toggleTaskDropdown}
                        subItems={[
                            {
                                to: "/admin/task",
                                label: "All Tasks",
                                isActive: isPathActive("/admin/task"),
                            },
                            {
                                to: "/admin/task/create",
                                label: "Create Task",
                                isActive: isPathActive("/admin/task/create"),
                            },
                        ]}
                    />

                    <SidebarItem
                        to="#"
                        icon={<Clock className="h-5 w-5" />}
                        label="Attendance"
                        isActive={pathStartsWith("/admin/attendance")}
                        hasDropdown={true}
                        isOpen={isAttendanceDropdownOpen}
                        onToggle={toggleAttendanceDropdown}
                        subItems={[
                            {
                                to: "/admin/attendance",
                                label: "View Attendance",
                                isActive: isPathActive("/admin/attendance"),
                            },
                            {
                                to: "/admin/attendance/report",
                                label: "Attendance Report",
                                isActive: isPathActive("/admin/attendance/report"),
                            },
                        ]}
                    />

                    <SidebarItem
                        to="#"
                        icon={<BarChart2 className="h-5 w-5" />}
                        label="Reports"
                        isActive={pathStartsWith("/admin/report")}
                        hasDropdown={true}
                        isOpen={isReportDropdownOpen}
                        onToggle={toggleReportDropdown}
                        subItems={[
                            {
                                to: "/admin/report/performance",
                                label: "Performance Report",
                                isActive: isPathActive("/admin/report/performance"),
                            },
                            {
                                to: "/admin/report/department",
                                label: "Department Report",
                                isActive: isPathActive("/admin/report/department"),
                            },
                        ]}
                    />

                    <SidebarItem
                        to="/admin/users"
                        icon={<Users className="h-5 w-5" />}
                        label="Users"
                        isActive={pathStartsWith("/admin/users")}
                    />

                    <div className="mt-8">
                        <SidebarItem
                            to="/addentech-login"
                            icon={<LogOut className="h-5 w-5" />}
                            label="Logout"
                            isActive={false}
                        />
                    </div>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-1 md:ml-64">
                {/* Top header */}
                <header className="bg-white shadow-sm z-20 px-4 py-2">
                    <div className="flex justify-between items-center">
                        {/* Mobile sidebar toggle */}
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden text-gray-500 hover:text-gray-700"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* User profile */}
                        <div className="flex items-center ml-auto">
                            <div className="mr-4 text-right">
                                <p className="text-sm font-medium text-gray-700">
                                    {loaderData?.currentUser?.firstName} {loaderData?.currentUser?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {loaderData?.currentUser?.role}
                                </p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-medium">
                                {loaderData?.currentUser?.firstName?.[0]}
                                {loaderData?.currentUser?.lastName?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 rounded-lg bg-gray-50 rounded-tl-xl overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Spinner className="!text-pink-500" size="lg" />
                        </div>

                    ) : (
                        children
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
