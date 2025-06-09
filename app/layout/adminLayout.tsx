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
    Calendar,
    CalendarDays,
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
    Shield,
    Tag,
    User,
    X,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

// Define navigation items by role and permission
type NavItem = {
    to: string;
    icon: React.ReactNode;
    label: string;
    roles: string[];
    permission?: string; // Optional permission key that allows access to this item
};

const navItems: NavItem[] = [
    {
        to: "/admin",
        icon: <LayoutDashboard className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "Dashboard",
        roles: ["admin", "department_head", "manager", "staff"],
        permission: "view_dashboard"
    },
    {
        to: "/admin/users",
        icon: <User className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "Users",
        roles: ["admin", "manager"],
        permission: "view_users"
    },
    {
        to: "/admin/departments",
        icon: <Folder className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "Department",
        roles: ["admin", "manager"],
        permission: "view_departments"
    },
    {
        to: "/admin/attendance",
        icon: <Clock className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "Attendance",
        roles: ["admin", "department_head", "manager", "staff"],
        permission: "view_attendance"
    },
    {
        to: "/admin/task-management",
        icon: <CheckSquare className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "Task Management",
        roles: ["admin", "department_head", "manager", "staff"],
        permission: "view_tasks"
    },
    {
        to: "/admin/monthly-reports",
        icon: <BarChart className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "Monthly Reports",
        roles: ["admin", "head", "manager", "staff", "department_head", "user", "*"],
        permission: "view_reports"
    },
    {
        to: "/admin/reports",
        icon: <FileText className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "Activity Reports",
        roles: ["admin", "department_head", "manager", "staff"],
        permission: "view_reports"
    },
    {
        to: "/admin/blog",
        icon: <BookOpen className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "Blog",
        roles: ["admin"],
        permission: "view_blog"
    },
    {
        to: "/admin/category",
        icon: <Tag className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "Blog Categories",
        roles: ["admin"],
        permission: "view_categories"
    },
    {
        to: "/admin/contact",
        icon: <Mail className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "Messages",
        roles: ["admin"],
        permission: "view_messages"
    },

    {
        to: "/admin/permissions",
        icon: <Shield className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "User Permissions",
        roles: ["admin", "manager", "department_head"]
        // No permission needed as this is strictly role-based
    },
   
    {
        to: "/admin/memorandum",
        icon: <FileText className="h-4 w-4 hover:text-white text-pink-500" />,
        label: "Memorandum",
        roles: ["admin", "department_head", "manager", "staff"],
        permission: "view_memorandum"
    }
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile
    const [userRole, setUserRole] = useState<string>("staff");
    const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
    const navigation = useNavigation();
    const navigate = useNavigate(); 
    const isLoading = navigation.state === "loading";
  
    // Auto-open sidebar on desktop
    // Auto-open sidebar on desktop
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
        
        // Add resize listener
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // Fetch user role and permissions from session
    // Fetch user role and permissions from session
    useEffect(() => {
        const fetchUserProfile = async () => {
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
                    
                    // Set user permissions
                    if (userData.permissions) {
                        setUserPermissions(userData.permissions);
                    }
                    
                    console.log("User profile loaded:", {
                        role: userData.role,
                        permissions: userData.permissions
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            }
        };
        
        fetchUserProfile();
    }, []);


    return (
        <div className="flex font-nunito">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <div
                className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out flex flex-col z-30 fixed h-full md:relative md:translate-x-0`}
            >
                <div className="flex items-center justify-between p-4 border-b border-b-white/20">
                    <div className="flex items-center">

                        <span className="ml-2 text-xl font-bold ">
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
                            .filter(item => {
                                // Include if user's role is in the allowed roles list
                                const hasRole = item.roles.includes(userRole);
                                
                                // Include if user has the specific permission for this item
                                const hasPermission = item.permission && userPermissions[item.permission];
                                
                                // Admin and manager always see all navigation items
                                const isAdminOrManager = userRole === "admin" || userRole === "manager";
                                
                                // Include the item if user has either the role OR the specific permission
                                return hasRole || hasPermission || isAdminOrManager;
                            })
                            .map((item, index) => (
                                <Link key={index} to={item.to}>
                                    <li className="hover:bg-pink-100 py-3 hover:border-r-4 hover:border-r-pink-500 hover:bg-opacity-50 font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-4 transition-all duration-300 ease-in-out text-sm">
                                        {item.icon}
                                        {item.label}
                                    </li>
                                </Link>
                            ))
                        }
                        
                        {/* Leave Management Dropdown */}
                        {["admin", "manager", "department_head", "staff"].includes(userRole) && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <li className="hover:bg-pink-100 py-3 hover:border-r-4 hover:border-r-pink-500 hover:bg-opacity-50 font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-4 transition-all duration-300 ease-in-out text-sm cursor-pointer">
                                        <CalendarDays className="h-4 w-4 hover:text-white text-pink-500" />
                                        Leave Management
                                        <ChevronDown className="h-3 w-3 ml-auto" />
                                    </li>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Leave Management Options">
                                    <DropdownItem key="leave-dashboard" href="/admin/leave-management">
                                        <div className="flex items-center gap-2">
                                            <LayoutDashboard className="h-4 w-4" />
                                            Leave Dashboard
                                        </div>
                                    </DropdownItem>
                                    <DropdownItem key="apply-leave" href="/employee-leave-application">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Apply for Leave
                                        </div>
                                    </DropdownItem>
                                    <DropdownItem key="team-calendar" href="/admin/team-calendar">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Team Calendar
                                        </div>
                                    </DropdownItem>
                                    <DropdownItem key="leave-balance" href="/employee-leave-balance">
                                        <div className="flex items-center gap-2">
                                            <CheckSquare className="h-4 w-4" />
                                            Leave Balance
                                        </div>
                                    </DropdownItem>
                                    {["admin", "manager"].includes(userRole) ? (
                                        <DropdownItem key="leave-policies" href="/admin/leave-policies">
                                            <div className="flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                Leave Policies
                                            </div>
                                        </DropdownItem>
                                    ) : null}
                                    {["admin", "manager"].includes(userRole) ? (
                                        <DropdownItem key="leave-reminders" href="/admin/leave-reminders">
                                            <div className="flex items-center gap-2">
                                                <Bell className="h-4 w-4" />
                                                Leave Reminders
                                            </div>
                                        </DropdownItem>
                                    ) : null}
                                </DropdownMenu>
                            </Dropdown>
                        )}
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
            <div className="flex-1 flex flex-col overflow-hidden px-10">
                <header className="h-16 bg-white shadow-b-md flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsSidebarOpen(true)}
                            className={`${isSidebarOpen ? "hidden md:hidden" : ""} md:hidden`}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Button
                            size="sm"
                            className="hidden sm:flex rounded-md text-md h-[35px] shadow-sm hover:bg-pink-300 text-pink-500 bg-pink-200"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>

                    <div className="flex-1 max-w-md mx-2 sm:mx-4 rounded hidden sm:block">
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
                                    "border hover:bg-gray-50 shadow-sm focus:bg-gray-50 focus:ring-1 focus:ring-pink-500 rounded-md border-black/20 bg-white",
                            }}
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 rounded-full flex items-center justify-center border border-white/20">
                            <div>
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-400"></span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className=" flex-1 overflow-auto p-4 sm:p-6 rounded-lg bg-gray-50 rounded-tl-xl">
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