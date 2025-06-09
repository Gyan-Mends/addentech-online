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

    // {
    //     to: "/admin/monthly-reports",
    //     icon: <BarChart className="h-4 w-4 hover:text-white text-pink-500" />,
    //     label: "Monthly Reports",
    //     roles: ["admin", "head", "manager", "staff", "department_head", "user", "*"],
    //     permission: "view_reports"
    // },
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

    // {
    //     to: "/admin/permissions",
    //     icon: <Shield className="h-4 w-4 hover:text-white text-pink-500" />,
    //     label: "User Permissions",
    //     roles: ["admin", "manager", "department_head"]
    //     // No permission needed as this is strictly role-based
    // },
   
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
    const [isLeaveDropdownOpen, setIsLeaveDropdownOpen] = useState(false);
    const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
    const navigation = useNavigation();
    const navigate = useNavigate(); 
    const isLoading = navigation.state === "loading";

    // Function to handle accordion toggle with scroll
    const handleLeaveAccordionToggle = () => {
        setIsLeaveDropdownOpen(!isLeaveDropdownOpen);
        
        // If opening, scroll to make content visible after animation
        if (!isLeaveDropdownOpen) {
            setTimeout(() => {
                const leaveMenuItem = document.querySelector('[data-leave-accordion]');
                if (leaveMenuItem) {
                    leaveMenuItem.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }
            }, 150); // Half of animation duration
        }
    };

    // Function to handle task accordion toggle with scroll
    const handleTaskAccordionToggle = () => {
        setIsTaskDropdownOpen(!isTaskDropdownOpen);
        
        // If opening, scroll to make content visible after animation
        if (!isTaskDropdownOpen) {
            setTimeout(() => {
                const taskMenuItem = document.querySelector('[data-task-accordion]');
                if (taskMenuItem) {
                    taskMenuItem.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }
            }, 150); // Half of animation duration
        }
    };
  
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
        <div className="flex font-nunito h-screen overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <div
                className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}  w-64 bg-white transition-transform duration-300 ease-in-out flex flex-col z-30 fixed h-full md:relative md:translate-x-0`}
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
                                <div 
                    className="flex flex-col flex-1 px-2 py-4 space-y-6 overflow-y-auto"
                    style={{
                        scrollbarWidth: 'thin',
                    }}
                >
                    <ul className="flex flex-col space-y-1">
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
                        
                        {/* Task Management Accordion */}
                        {["admin", "department_head", "manager", "staff"].includes(userRole) && (
                            <div data-task-accordion>
                                <li 
                                    className="hover:bg-pink-100 py-3 hover:border-r-4 hover:border-r-pink-500 hover:bg-opacity-50 font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-4 transition-all duration-300 ease-in-out text-sm cursor-pointer"
                                    onClick={handleTaskAccordionToggle}
                                >
                                    <CheckSquare className="h-4 w-4 hover:text-white text-pink-500" />
                                    Task Management
                                    <ChevronDown className={`h-3 w-3 ml-auto transition-transform duration-200 ${isTaskDropdownOpen ? 'rotate-180' : ''}`} />
                                </li>
                                
                                {/* Submenu */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isTaskDropdownOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="ml-6 mt-2 space-y-1">
                                        <Link to="/admin/task-management">
                                            <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                                                <LayoutDashboard className="h-3 w-3" />
                                                Task Dashboard
                                            </div>
                                        </Link>
                                        
                                        <Link to="/admin/task-create">
                                            <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                                                <FileText className="h-3 w-3" />
                                                Create Task
                                            </div>
                                        </Link>
                                        
                                        <Link to="/admin/enhanced-tasks">
                                            <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                                                <CheckSquare className="h-3 w-3" />
                                                Enhanced Tasks
                                            </div>
                                        </Link>
                                        
                                        <Link to="/admin/task-details">
                                            <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                                                <FileText className="h-3 w-3" />
                                                Task Details
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Leave Management Accordion */}
                        {["admin", "manager", "department_head", "staff"].includes(userRole) && (
                            <div data-leave-accordion>
                                <li 
                                    className="hover:bg-pink-100 py-3 hover:border-r-4 hover:border-r-pink-500 hover:bg-opacity-50 font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-4 transition-all duration-300 ease-in-out text-sm cursor-pointer"
                                    onClick={handleLeaveAccordionToggle}
                                >
                                    <CalendarDays className="h-4 w-4 hover:text-white text-pink-500" />
                                    Leave Management
                                    <ChevronDown className={`h-3 w-3 ml-auto transition-transform duration-200 ${isLeaveDropdownOpen ? 'rotate-180' : ''}`} />
                                </li>
                                
                                {/* Submenu */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isLeaveDropdownOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="ml-6 mt-2 space-y-1">
                                        <Link to="/admin/leave-management">
                                            <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                                                <LayoutDashboard className="h-3 w-3" />
                                                Leave Dashboard
                                            </div>
                                        </Link>
                                        
                                        <Link to="/employee-leave-application">
                                            <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                                                <FileText className="h-3 w-3" />
                                                Apply for Leave
                                            </div>
                                        </Link>
                                        
                                        <Link to="/admin/team-calendar">
                                            <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                                                <Calendar className="h-3 w-3" />
                                                Team Calendar
                                            </div>
                                        </Link>
                                        
                                        <Link to="/employee-leave-balance">
                                            <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                                                <CheckSquare className="h-3 w-3" />
                                                Leave Balance
                                            </div>
                                        </Link>
                                        
                                        {["admin", "manager"].includes(userRole) && (
                                            <Link to="/admin/leave-policies">
                                                <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                                                    <Settings className="h-3 w-3" />
                                                    Leave Policies
                                                </div>
                                            </Link>
                                        )}
                                        
                                        {["admin", "manager"].includes(userRole) && (
                                            <Link to="/admin/leave-reminders">
                                                <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                                                    <Bell className="h-3 w-3" />
                                                    Leave Reminders
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
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
            <div className="flex-1 flex flex-col overflow-hidden h-full">
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

                <main className="flex-1 lg:ml-8 overflow-auto p-4  lg:px-10 rounded-lg bg-gray-50 rounded-tl-xl">
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