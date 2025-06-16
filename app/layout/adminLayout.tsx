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
    ChevronLeft,
    ChevronRight,
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
        icon: <LayoutDashboard className="h-4 w-4 hover:text-white dark-text" />,
        label: "Dashboard",
        roles: ["admin", "department_head", "manager", "staff"],
        permission: "view_dashboard"
    },
    {
        to: "/admin/users",
        icon: <User className="h-4 w-4 hover:text-white dark-text" />,
        label: "Users",
        roles: ["admin", "manager"],
        permission: "view_users"
    },
    {
        to: "/admin/departments",
        icon: <Folder className="h-4 w-4 hover:text-white dark-text" />,
        label: "Department",
        roles: ["admin", "manager"],
        permission: "view_departments"
    },
    {
        to: "/admin/attendance",
        icon: <Clock className="h-4 w-4 hover:text-white dark-text" />,
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
        icon: <FileText className="h-4 w-4 hover:text-white dark-text" />,
        label: "Activity Reports",
        roles: ["admin", "department_head", "manager", "staff"],
        permission: "view_reports"
    },
    {
        to: "/admin/blog",
        icon: <BookOpen className="h-4 w-4 hover:text-white dark-text" />,
        label: "Blog",
        roles: ["admin"],
        permission: "view_blog"
    },
    {
        to: "/admin/category",
        icon: <Tag className="h-4 w-4 hover:text-white dark-text" />,
        label: "Blog Categories",
        roles: ["admin"],
        permission: "view_categories"
    },
    {
        to: "/admin/contact",
        icon: <Mail className="h-4 w-4 hover:text-white dark-text" />,
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
        icon: <FileText className="h-4 w-4 hover:text-white dark-text" />,
        label: "Memorandum",
        roles: ["admin", "department_head", "manager", "staff"],
        permission: "view_memorandum"
    }
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile overlay toggle
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop sidebar collapse toggle
    const [userRole, setUserRole] = useState<string>("staff");
    const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
    const [userProfile, setUserProfile] = useState<any>(null); // Store complete user profile data
    const [isLeaveDropdownOpen, setIsLeaveDropdownOpen] = useState(false);
    const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
    const navigation = useNavigation();
    const navigate = useNavigate();
    const isLoading = navigation.state === "loading";

    // Function to handle accordion toggle with scroll
    const handleLeaveAccordionToggle = () => {
        if (isCollapsed) return; // Don't open dropdowns in collapsed mode
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
        if (isCollapsed) return; // Don't open dropdowns in collapsed mode
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

    // Close dropdowns when sidebar is collapsed
    useEffect(() => {
        if (isCollapsed) {
            setIsLeaveDropdownOpen(false);
            setIsTaskDropdownOpen(false);
        }
    }, [isCollapsed]);

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
                    setUserProfile(userData); // Store complete user profile data

                    // Set user permissions
                    if (userData.permissions) {
                        setUserPermissions(userData.permissions);
                    }

                    console.log("User profile loaded:", {
                        role: userData.role,
                        permissions: userData.permissions,
                        profile: userData
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            }
        };

        fetchUserProfile();
    }, []);


    return (
        <div className="flex font-nunito bg-dashboard-primary h-screen overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 ease-in-out flex flex-col z-30 fixed h-full md:relative md:translate-x-0 bg-color-dark-2`}
            >
                <div className="flex items-center justify-between p-4 border-b border-dashboard">
                    <div className="flex items-center">
                        {!isCollapsed && (
                            <span className="ml-2 text-xl font-bold text-dashboard-primary">
                                Addentech
                            </span>
                        )}
                    </div>

                    {/* Mobile close button */}
                    <Button
                        variant="ghost"
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-dashboard-secondary"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <nav
                    className="flex flex-col flex-1 px-2 py-4 space-y-6 overflow-y-auto"
                    style={{
                        scrollbarWidth: 'thin',
                        msOverflowStyle: 'none',
                        scrollbarColor: 'transparent transparent'
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
                                    <li className={`bg-sidebar-item hover:bg-sidebar-item-active py-2 hover:border-r-4 hover:border-r-blue-500 font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-2 transition-all duration-300 ease-in-out  hover:text-dashboard-primary dark-text text-sm ${isCollapsed ? 'justify-center' : ''}`}
                                        title={isCollapsed ? item.label : ''}>
                                        {item.icon}
                                        {!isCollapsed && item.label}
                                    </li>
                                </Link>
                            ))
                        }

                        {/* Task Management Accordion */}
                        <li
                            className={`bg-sidebar-item hover:bg-sidebar-item:hover py-3 font-nunito p-1 rounded-lg flex items-center gap-4 transition-all duration-300 ease-in-out text-dashboard-secondary text-sm cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
                            onClick={handleTaskAccordionToggle}
                            data-task-accordion
                            title={isCollapsed ? 'Task Management' : ''}
                        >
                            <CheckSquare className="h-4 w-4 hover:text-dashboard-primary text-dashboard-secondary" />
                            {!isCollapsed && (
                                <>
                                    <span>Task Management</span>
                                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-300 ${isTaskDropdownOpen ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </li>

                        {!isCollapsed && (
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out text-dashboard-secondary ${isTaskDropdownOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="ml-6 mt-2 space-y-1">
                                    <Link to="/admin/task-management">
                                        <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm bg-sidebar-item hover:bg-sidebar-item:hover transition-colors duration-200 text-dashboard-secondary hover:text-dashboard-primary">
                                            <LayoutDashboard className="h-3 w-3" />
                                            Task Dashboard
                                        </div>
                                    </Link>

                                    <Link to="/admin/task-create">
                                        <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm bg-sidebar-item hover:bg-sidebar-item:hover transition-colors duration-200 text-dashboard-secondary hover:text-dashboard-primary">
                                            <FileText className="h-3 w-3" />
                                            Create Task
                                        </div>
                                    </Link>

                                    <Link to="/admin/enhanced-tasks">
                                        <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm bg-sidebar-item hover:bg-sidebar-item:hover transition-colors duration-200 text-dashboard-secondary hover:text-dashboard-primary">
                                            <CheckSquare className="h-3 w-3" />
                                            Enhanced Tasks
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Leave Management Accordion */}
                        <li
                            className={`bg-sidebar-item hover:bg-sidebar-item:hover py-3 font-nunito p-1 rounded-lg flex items-center gap-4 transition-all duration-300 ease-in-out text-dashboard-secondary text-sm cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
                            onClick={handleLeaveAccordionToggle}
                            data-leave-accordion
                            title={isCollapsed ? 'Leave Management' : ''}
                        >
                            <CalendarDays className="h-4 w-4 hover:text-dashboard-primary text-dashboard-secondary" />
                            {!isCollapsed && (
                                <>
                                    <span>Leave Management</span>
                                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-300 ${isLeaveDropdownOpen ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </li>

                        {!isCollapsed && (
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isLeaveDropdownOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="ml-6 mt-2 space-y-1">
                                    <Link to="/admin/leave-management">
                                        <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm bg-sidebar-item hover:bg-sidebar-item:hover transition-colors duration-200 text-dashboard-secondary hover:text-dashboard-primary">
                                            <LayoutDashboard className="h-3 w-3" />
                                            Leave Dashboard
                                        </div>
                                    </Link>

                                    <Link to="/employee-leave-application">
                                        <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm bg-sidebar-item hover:bg-sidebar-item:hover transition-colors duration-200 text-dashboard-secondary hover:text-dashboard-primary">
                                            <FileText className="h-3 w-3" />
                                            Apply for Leave
                                        </div>
                                    </Link>

                                    <Link to="/admin/team-calendar">
                                        <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm bg-sidebar-item hover:bg-sidebar-item:hover transition-colors duration-200 text-dashboard-secondary hover:text-dashboard-primary">
                                            <Calendar className="h-3 w-3" />
                                            Team Calendar
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </ul>
                </nav>

                {/* Collapse Toggle Button */}
                <div className="p-4 border-t border-dashboard">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full justify-center text-dashboard-secondary hover:text-dashboard-primary bg-transparent border-none"
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden h-full">
                <header className="h-16 bg-dashboard-secondary shadow-b-md flex items-center justify-between px-4 sm:px-6 border-b border-dashboard">
                    <div className="flex items-center space-x-2">
                        {/* Mobile menu toggle */}
                        <Button
                            variant="ghost"
                            onClick={() => setIsSidebarOpen(true)}
                            className={`${isSidebarOpen ? "hidden md:hidden" : ""} md:hidden text-dashboard-secondary`}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Button
                            size="sm"
                            className="hidden sm:flex rounded-md text-md h-[35px] shadow-sm bg-action-primary hover:bg-action-primary:hover text-dashboard-primary"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>

                    <div className="flex-1 max-w-md mx-2 sm:mx-4 rounded hidden sm:block">
                        <Input
                            startContent={
                                <Search className="h-4 w-4 text-gray-500" />
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
                                    "border shadow-sm rounded-md ring-0 bg-color-dark-2 border-white/40 focus:border-white/40 focus:ring-0 focus:ring-offset-0 !focus:bg-color-dark-2 focus:outline-none focus:shadow-none !hover:bg-color-dark-2",
                            }}
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 rounded-full flex items-center justify-center border border-white/20">
                            <div>
                                <Bell className="h-5 w-5 dark-text" />
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-400"></span>
                            </div>
                        </div>

                        {/* User Profile Dropdown */}
                        <Dropdown  placement="bottom-end" className="rounded-lg bg-dashboard-secondary border border-white/20">
                            <DropdownTrigger>
                                <div className="flex items-center  cursor-pointer hover:bg-dashboard-tertiary  rounded-lg transition-colors">
                                    <Avatar
                                        size="sm"
                                        src={userProfile?.profileImage || userProfile?.image || userProfile?.avatar}
                                        className="bg-avatar-purple"
                                        fallback={
                                            <User className="h-4 w-4 text-white" />
                                        }
                                    />
                                </div>
                            </DropdownTrigger>
                            <DropdownMenu
                                className="bg-dashboard-secondary border-none rounded-lg"
                            >
                                <DropdownItem
                                    key="profile"
                                    className="text-white hover:bg-dashboard-tertiary"
                                    startContent={<User className="h-4 w-4" />}
                                >
                                    Profile
                                </DropdownItem>
                                <DropdownItem
                                    key="settings"
                                    className="text-white hover:bg-dashboard-tertiary"
                                    startContent={<Settings className="h-4 w-4" />}
                                >
                                    <Link to="/admin/settings">
                                        Settings
                                    </Link>
                                </DropdownItem>
                                <DropdownItem
                                    key="logout"
                                    className="text-red-400 hover:bg-red-900/20"
                                    startContent={<LogOut className="h-4 w-4" />}
                                    onClick={async () => {
                                        try {
                                            const response = await fetch('/api/auth/logout', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                            });

                                            if (response.ok) {
                                                // Clear any local storage or session data if needed
                                                localStorage.clear();
                                                sessionStorage.clear();

                                                // Redirect to login page
                                                window.location.href = '/addentech-login';
                                            } else {
                                                console.error('Logout failed');
                                                // Fallback: redirect anyway
                                                window.location.href = '/addentech-login';
                                            }
                                        } catch (error) {
                                            console.error('Logout error:', error);
                                            // Fallback: redirect anyway
                                            window.location.href = '/addentech-login';
                                        }
                                    }}
                                >
                                    Logout
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </header>

                <main className="flex-1 lg:ml-8 overflow-auto p-4  lg:px-10 rounded-lg  rounded-tl-xl">
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