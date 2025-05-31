"use client";

import {
    Avatar,
    Button,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Spinner,
} from "@nextui-org/react";
import { Link, useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import {
    ArrowLeft,
    BarChart,
    Bell,
    BookOpen,
    CheckSquare,
    ChevronDown,
    Clock,
    FileText,
    Folder,
    LayoutDashboard,
    LogOut,
    Mail,
    Menu,
    Search,
    Settings,
    Tag,
    User,
    X,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

// Define navigation items by role
type NavItem = {
    to: string;
    icon: React.ReactNode;
    label: string;
    roles: string[];
};

const navItems: NavItem[] = [
    {
        to: "/admin",
        icon: <LayoutDashboard className="h-5 w-5 hover:text-white text-pink-500" />,
        label: "Dashboard",
        roles: ["admin", "department_head", "manager", "staff"]
    },
    {
        to: "/admin/users",
        icon: <User className="h-5 w-5 hover:text-white text-pink-500" />,
        label: "Users",
        roles: ["admin", "manager"]
    },
    {
        to: "/admin/departments",
        icon: <Folder className="h-5 w-5 hover:text-white text-pink-500" />,
        label: "Department",
        roles: ["admin", "manager"]
    },
    {
        to: "/admin/attendance",
        icon: <Clock className="h-5 w-5 hover:text-white text-pink-500" />,
        label: "Attendance",
        roles: ["admin", "department_head", "manager", "staff"]
    },
    {
        to: "/admin/tasks",
        icon: <CheckSquare className="h-5 w-5 hover:text-white text-pink-500" />,
        label: "Tasks",
        roles: ["admin", "department_head", "manager", "staff"]
    },
    {
        to: "/admin/monthly-reports",
        icon: <BarChart className="h-5 w-5 hover:text-white text-pink-500" />,
        label: "Monthly Reports",
        roles: ["admin", "head", "manager", "staff"]
    },
    {
        to: "/admin/blog",
        icon: <BookOpen className="h-5 w-5 hover:text-white text-pink-500" />,
        label: "Blog",
        roles: ["admin"]
    },
    {
        to: "/admin/category",
        icon: <Tag className="h-5 w-5 hover:text-white text-pink-500" />,
        label: "Blog Categories",
        roles: ["admin"]
    },
    {
        to: "/admin/contact",
        icon: <Mail className="h-5 w-5 hover:text-white text-pink-500" />,
        label: "Messages",
        roles: ["admin"]
    },
    {
        to: "/admin/memorandum",
        icon: <FileText className="h-5 w-5 hover:text-white text-pink-500" />,
        label: "Memorandum",
        roles: ["admin", "department_head", "manager", "staff"]
    }
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userRole, setUserRole] = useState<string>("staff");
    const navigation = useNavigation();
    const navigate = useNavigate();
    
    // Fetch user role from session
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch("/api/user/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    setUserRole(userData.role || "staff");
                }
            } catch (error) {
                console.error("Failed to fetch user role:", error);
            }
        };
        
        fetchUserRole();
    }, []);

    const isLoading = navigation.state === "loading";

    return (
        <div className="flex h-screen  font-nunito">
            {/* Sidebar */}
            <div
                className={`${isSidebarOpen ? "w-64" : "w-0 -ml-64"} bg-white shadow-r-md transition-all duration-300 ease-in-out flex flex-col z-30 fixed h-full md:relative`}
            >
                <div className="flex items-center justify-between p-4 border-b border-b-white/20">
                    <div className="flex items-center">

                        <span className="ml-2 text-xl font-bold font-montserrat">
                            Addentech
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-col flex-1 px-2 py-4 space-y-6">
                    <ul className="flex flex-col">
                        {navItems
                            .filter(item => item.roles.includes(userRole))
                            .map((item, index) => (
                                <Link key={index} to={item.to}>
                                    <li className="hover:bg-pink-100 py-3 hover:border-r-4 hover:border-r-pink-500 hover:bg-opacity-50 font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-4 transition-all duration-300 ease-in-out">
                                        {item.icon}
                                        {item.label}
                                    </li>
                                </Link>
                            ))
                        }
                    </ul>
                    <Divider className="" />
                    <div className="mt-6">
                        <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                            ACCOUNT
                        </h3>
                        <Button variant="ghost" className="w-full justify-start mb-2">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-red-500 hover:text-red-700"
                            onClick={() => {
                                // Logout functionality
                                fetch("/api/logout", { method: "POST" })
                                    .then(() => navigate("/addentech-login"))
                                    .catch(err => console.error("Logout failed:", err));
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>

               
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden ">
                <header className="h-16 bg-white shadow-b-md flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsSidebarOpen(true)}
                            className={isSidebarOpen ? "md:hidden" : ""}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Button
                            size="sm"
                            className=" md:flex rounded-md text-md h-[35px] shadow-sm hover:bg-pink-300 text-pink-500 bg-pink-200 "
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 " />
                            Back
                        </Button>
                    </div>

                    <div className="flex-1 max-w-md mx-4 rounded">
                        <Input
                            startContent={
                                <Search className="h-4 w-4 text-pink-500" />
                            }
                            onValueChange={(value) => {
                                const timeoutId = setTimeout(() => {
                                    navigate(`?search_term=${value}`);
                                }, 100);
                                return () => clearTimeout(timeoutId);
                            }}
                            type="search"
                            placeholder="Search user..."
                            className="w-full"
                            classNames={{
                                inputWrapper:
                                    "border hover:bg-gray-50 shadow-sm focus:bg-gray-50 focus:ring-1 focus:ring-pink-500 rounded-md border-black/20 bg-white ",
                            }}
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* <ThemeSwitcher /> */}
                        <div className="relative h-10 w-10 rounded-full flex items-center justify-center border border-white/20">
                            <div>
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-400"></span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 sm:p-6 rounded-lg bg-gray-50 rounded-tl-xl">
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
