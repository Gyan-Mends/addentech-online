
import { useState, useEffect } from "react"
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    Input,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Chip,
    Avatar,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Tooltip,
    Progress,
    Tabs,
    Tab,
} from "@nextui-org/react"
import { Search, Bell, ChevronLeft, Users, Briefcase, FileText, Tag, BarChart2, Activity, Eye, Edit, Trash2, Plus, Calendar, Clock, TrendingUp, TrendingDown, HelpCircle, Settings, LogOut, User } from 'lucide-react'
import { Link } from "@remix-run/react"

export default function AdminDashboard() {
    const [notifications, setNotifications] = useState(3)
    const [selectedTab, setSelectedTab] = useState("overview")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
          setIsLoading(false)
      }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const stats = [
        {
            title: "Total Departments",
            value: "12",
            icon: <Briefcase className="h-6 w-6 text-emerald-500" />,
            change: "+2",
            trend: "up",
            period: "from last month",
        },
        {
            title: "Total Users",
            value: "847",
            icon: <Users className="h-6 w-6 text-blue-500" />,
            change: "+124",
            trend: "up",
            period: "from last month",
        },
        {
            title: "Blog Categories",
            value: "24",
            icon: <Tag className="h-6 w-6 text-purple-500" />,
            change: "+5",
            trend: "up",
            period: "from last month",
        },
        {
            title: "Blogs",
            value: "156",
            icon: <FileText className="h-6 w-6 text-amber-500" />,
            change: "+32",
            trend: "up",
            period: "from last month",
        },
    ]

    const recentActivities = [
        {
            id: 1,
            user: {
                name: "Sarah Johnson",
                avatar: "/placeholder.svg?height=40&width=40",
                role: "Admin",
            },
            action: "published a new blog post",
            target: "The Future of Legal Tech",
            time: "10 minutes ago",
        },
        {
            id: 2,
            user: {
                name: "Michael Chen",
                avatar: "/placeholder.svg?height=40&width=40",
                role: "Editor",
            },
            action: "updated category",
            target: "Technology",
            time: "1 hour ago",
        },
        {
            id: 3,
            user: {
                name: "Aisha Patel",
                avatar: "/placeholder.svg?height=40&width=40",
                role: "Author",
            },
            action: "created a new account",
            target: "",
            time: "3 hours ago",
        },
        {
            id: 4,
            user: {
                name: "David Rodriguez",
                avatar: "/placeholder.svg?height=40&width=40",
                role: "Admin",
            },
            action: "deleted blog post",
            target: "Outdated Legal Practices",
            time: "Yesterday",
        },
        {
            id: 5,
            user: {
                name: "Jennifer Lee",
                avatar: "/placeholder.svg?height=40&width=40",
                role: "Editor",
            },
            action: "added new department",
            target: "Marketing",
            time: "Yesterday",
        },
    ]

    const popularBlogs = [
        {
            id: 1,
            title: "The Impact of AI on Legal Practice",
            views: 2547,
            category: "Technology",
            publishDate: "Jan 15, 2025",
        },
        {
            id: 2,
            title: "Digital Transformation Strategies for 2025",
            views: 1832,
            category: "Digital",
            publishDate: "Jan 12, 2025",
        },
        {
            id: 3,
            title: "Cloud Computing Trends to Watch",
            views: 1456,
            category: "Technology",
            publishDate: "Jan 18, 2025",
        },
        {
            id: 4,
            title: "The rapid growth of IT",
            views: 1245,
            category: "Technology",
            publishDate: "Jan 7, 2025",
        },
    ]

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Top Navigation */}
            <Navbar
                maxWidth="full"
                className="bg-gray-900 border-b border-gray-800"
                classNames={{
                    wrapper: "px-4",
                }}
            >
                <NavbarBrand>
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold">D</div>
                            <span className="ml-2 text-xl font-bold text-blue-500">DENNISLAW</span>
                        </div>
                    </Link>
                </NavbarBrand>
                <NavbarContent className="flex-1 gap-4" justify="center">
                    <Input
                        classNames={{
                            base: "max-w-full sm:max-w-[20rem] h-10",
                            mainWrapper: "h-full",
                            input: "text-small",
                            inputWrapper: "h-full font-normal text-default-500 bg-gray-800 border-gray-700",
                        }}
                        placeholder="Search user..."
                        size="sm"
                        startContent={<Search size={18} />}
                        type="search"
                    />
                </NavbarContent>
                <NavbarContent justify="end">
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Button
                                className="bg-transparent p-0 min-w-0"
                                endContent={
                                    <div className="relative">
                                        <Bell size={24} className="text-gray-400" />
                                        {notifications > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                                {notifications}
                                            </span>
                                        )}
                                    </div>
                                }
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Notifications" className="w-80">
                            <DropdownItem key="notifications" className="h-auto p-0" textValue="Notifications">
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">Notifications</h3>
                                    <div className="mt-4 space-y-4">
                                        <div className="flex gap-3">
                                            <Avatar src="/placeholder.svg?height=40&width=40" size="sm" />
                                            <div>
                                                <p className="text-sm">
                                                    <span className="font-semibold">Sarah Johnson</span> published a new blog post
                                                </p>
                                                <p className="text-xs text-gray-400">10 minutes ago</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Avatar src="/placeholder.svg?height=40&width=40" size="sm" />
                                            <div>
                                                <p className="text-sm">
                                                    <span className="font-semibold">Michael Chen</span> updated category Technology
                                                </p>
                                                <p className="text-xs text-gray-400">1 hour ago</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Avatar src="/placeholder.svg?height=40&width=40" size="sm" />
                                            <div>
                                                <p className="text-sm">
                                                    <span className="font-semibold">Aisha Patel</span> created a new account
                                                </p>
                                                <p className="text-xs text-gray-400">3 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button className="mt-4 w-full" color="primary" variant="flat" size="sm">
                                        View All Notifications
                                    </Button>
                                </div>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar
                                as="button"
                                className="transition-transform"
                                src="/placeholder.svg?height=40&width=40"
                                showFallback
                                size="sm"
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
                                <div className="flex flex-col">
                                    <span className="text-sm">Signed in as</span>
                                    <span className="text-sm font-semibold">admin@dennislaw.com</span>
                                </div>
                            </DropdownItem>
                            <DropdownItem key="settings" startContent={<Settings size={16} />}>
                                Settings
                            </DropdownItem>
                            <DropdownItem key="help" startContent={<HelpCircle size={16} />}>
                                Help & Feedback
                            </DropdownItem>
                            <DropdownItem key="logout" startContent={<LogOut size={16} />} color="danger">
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavbarContent>
            </Navbar>

            {/* Main Content */}
            <div className="container mx-auto p-4">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        as={Link}
                        to="/admin"
                        variant="flat"
                        color="primary"
                        startContent={<ChevronLeft size={16} />}
                        className="bg-blue-500/10"
                    >
                        Back
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, index) => (
                        <Card key={index} className="bg-gray-900 border-gray-800">
                            <CardBody className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-gray-400 text-sm">{stat.title}</p>
                                      <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                                      <div className="flex items-center mt-2">
                                          {stat.trend === "up" ? (
                                              <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                                          ) : (
                                              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                          )}
                                          <span
                                              className={`text-xs ${stat.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                                          >
                                              {stat.change} {stat.period}
                                          </span>
                                      </div>
                                  </div>
                                  <div className="h-12 w-12 rounded-lg bg-gray-800 flex items-center justify-center">
                                      {stat.icon}
                                  </div>
                              </div>
                          </CardBody>
                      </Card>
                  ))}
                </div>

                {/* Main Content Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader className="px-5 py-4 border-b border-gray-800">
                                <Tabs
                                    selectedKey={selectedTab}
                                    onSelectionChange={(key) => setSelectedTab(key as string)}
                                    color="primary"
                                    variant="light"
                                    classNames={{
                                        tabList: "bg-transparent gap-4",
                                        cursor: "bg-blue-500",
                                        tab: "max-w-fit px-2 h-8",
                                    }}
                                >
                                    <Tab
                                        key="overview"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <BarChart2 size={16} />
                                                <span>Overview</span>
                        </div>
                    }
                                    />
                                    <Tab
                                        key="blogs"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} />
                                                <span>Blogs</span>
                                          </div>
                    }
                                    />
                                    <Tab
                                        key="users"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Users size={16} />
                                                <span>Users</span>
                                            </div>
                                        }
                                    />
                                </Tabs>
                            </CardHeader>
                            <CardBody className="p-0">
                                {selectedTab === "overview" && (
                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold mb-4">Blog Performance</h3>
                                        {isLoading ? (
                                            <div className="space-y-4">
                                                <Progress
                                                    size="sm"
                                                    isIndeterminate
                                                    aria-label="Loading..."
                                                    className="max-w-full"
                                                    color="primary"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm text-gray-400">Views</span>
                                                        <span className="text-sm font-medium">12,546</span>
                                                    </div>
                                                    <Progress value={75} color="primary" className="h-2" />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm text-gray-400">Engagement</span>
                                                        <span className="text-sm font-medium">8,294</span>
                                                    </div>
                                                    <Progress value={60} color="success" className="h-2" />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm text-gray-400">Conversions</span>
                                                        <span className="text-sm font-medium">3,672</span>
                                                    </div>
                                                    <Progress value={40} color="warning" className="h-2" />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm text-gray-400">Bounce Rate</span>
                                                        <span className="text-sm font-medium">24%</span>
                                                    </div>
                                                    <Progress value={24} color="danger" className="h-2" />
                                                </div>
                                            </div>
                                        )}

                                        <h3 className="text-lg font-semibold mt-8 mb-4">Popular Blogs</h3>
                                        {isLoading ? (
                                            <div className="space-y-4">
                                                <Progress
                                                    size="sm"
                                                    isIndeterminate
                                                    aria-label="Loading..."
                                                    className="max-w-full"
                                                    color="primary"
                                                />
                                            </div>
                                        ) : (
                                            <Table aria-label="Popular blogs" className="min-w-full">
                                                <TableHeader>
                                                    <TableColumn>TITLE</TableColumn>
                                                    <TableColumn>CATEGORY</TableColumn>
                                                    <TableColumn>VIEWS</TableColumn>
                                                    <TableColumn>DATE</TableColumn>
                                                    <TableColumn>ACTIONS</TableColumn>
                                                </TableHeader>
                                                <TableBody>
                                                    {popularBlogs.map((blog) => (
                                                        <TableRow key={blog.id}>
                                                            <TableCell className="max-w-[200px] truncate">{blog.title}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    size="sm"
                                                                    variant="flat"
                                                                    color={
                                                                        blog.category === "Technology"
                                                                            ? "primary"
                                                                            : blog.category === "Digital"
                                                                                ? "secondary"
                                                                                : "default"
                                                                    }
                                                              >
                                                                  {blog.category}
                                                              </Chip>
                                                          </TableCell>
                                                          <TableCell>{blog.views.toLocaleString()}</TableCell>
                                                          <TableCell>{blog.publishDate}</TableCell>
                                                          <TableCell>
                                                              <div className="flex gap-2">
                                                                  <Tooltip content="View">
                                                                      <Button isIconOnly size="sm" variant="light">
                                                                          <Eye size={16} />
                                                                      </Button>
                                                                  </Tooltip>
                                                                  <Tooltip content="Edit">
                                                                      <Button isIconOnly size="sm" variant="light">
                                                                          <Edit size={16} />
                                                                      </Button>
                                                                  </Tooltip>
                                                                  <Tooltip content="Delete">
                                                                      <Button isIconOnly size="sm" variant="light" color="danger">
                                                                          <Trash2 size={16} />
                                                                      </Button>
                                                                  </Tooltip>
                                                              </div>
                                                          </TableCell>
                                                      </TableRow>
                                                  ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </div>
                                )}

                                {selectedTab === "blogs" && (
                                    <div className="p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">All Blogs</h3>
                                            <Button color="primary" size="sm" endContent={<Plus size={16} />}>
                                                Add New Blog
                                            </Button>
                                        </div>
                                        {isLoading ? (
                                            <div className="space-y-4">
                                                <Progress
                                                    size="sm"
                                                    isIndeterminate
                                                    aria-label="Loading..."
                                                    className="max-w-full"
                                                    color="primary"
                                                />
                                            </div>
                                        ) : (
                                            <Table aria-label="All blogs" className="min-w-full">
                                                <TableHeader>
                                                    <TableColumn>TITLE</TableColumn>
                                                    <TableColumn>AUTHOR</TableColumn>
                                                    <TableColumn>CATEGORY</TableColumn>
                                                    <TableColumn>STATUS</TableColumn>
                                                    <TableColumn>DATE</TableColumn>
                                                    <TableColumn>ACTIONS</TableColumn>
                                                </TableHeader>
                                                <TableBody>
                                                    {[...popularBlogs, ...popularBlogs].slice(0, 5).map((blog, index) => (
                                                        <TableRow key={`blog-${index}`}>
                                                            <TableCell className="max-w-[200px] truncate">{blog.title}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar src="/placeholder.svg?height=24&width=24" size="sm" />
                                                                    <span>
                                                                        {index % 2 === 0 ? "Sarah Johnson" : index % 3 === 0 ? "Michael Chen" : "Aisha Patel"}
                                                                    </span>
                                                                </div>
                                                          </TableCell>
                                                          <TableCell>
                                                              <Chip
                                                                  size="sm"
                                                                  variant="flat"
                                                                  color={
                                                                      blog.category === "Technology"
                                                                          ? "primary"
                                                                          : blog.category === "Digital"
                                                                              ? "secondary"
                                                                              : "default"
                                                                  }
                                                              >
                                                                  {blog.category}
                                                              </Chip>
                                                          </TableCell>
                                                          <TableCell>
                                                              <Chip
                                                                  size="sm"
                                                                  variant="flat"
                                                                  color={index % 3 === 0 ? "success" : index % 2 === 0 ? "warning" : "default"}
                                                              >
                                                                  {index % 3 === 0 ? "Published" : index % 2 === 0 ? "Draft" : "Review"}
                                                              </Chip>
                                                          </TableCell>
                                                          <TableCell>{blog.publishDate}</TableCell>
                                                          <TableCell>
                                                              <div className="flex gap-2">
                                                                  <Tooltip content="View">
                                                                      <Button isIconOnly size="sm" variant="light">
                                                                          <Eye size={16} />
                                                                      </Button>
                                                                  </Tooltip>
                                                                  <Tooltip content="Edit">
                                                                      <Button isIconOnly size="sm" variant="light">
                                                                          <Edit size={16} />
                                                                      </Button>
                                                                  </Tooltip>
                                                                  <Tooltip content="Delete">
                                                                      <Button isIconOnly size="sm" variant="light" color="danger">
                                                                          <Trash2 size={16} />
                                                                      </Button>
                                                                  </Tooltip>
                                                              </div>
                                                          </TableCell>
                                                      </TableRow>
                                                  ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </div>
                                )}

                                {selectedTab === "users" && (
                                    <div className="p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">All Users</h3>
                                            <Button color="primary" size="sm" endContent={<Plus size={16} />}>
                                                Add New User
                                            </Button>
                                        </div>
                                        {isLoading ? (
                                            <div className="space-y-4">
                                                <Progress
                                                    size="sm"
                                                    isIndeterminate
                                                    aria-label="Loading..."
                                                    className="max-w-full"
                                                    color="primary"
                                                />
                                            </div>
                                        ) : (
                                            <Table aria-label="All users" className="min-w-full">
                                                <TableHeader>
                                                    <TableColumn>NAME</TableColumn>
                                                    <TableColumn>EMAIL</TableColumn>
                                                    <TableColumn>ROLE</TableColumn>
                                                    <TableColumn>STATUS</TableColumn>
                                                    <TableColumn>JOINED</TableColumn>
                                                    <TableColumn>ACTIONS</TableColumn>
                                                </TableHeader>
                                                <TableBody>
                                                    {[
                                                        {
                                                            name: "Sarah Johnson",
                                                            email: "sarah.johnson@example.com",
                                                            role: "Admin",
                                                            status: "Active",
                                                            joined: "Jan 10, 2023",
                                                        },
                                                        {
                                                            name: "Michael Chen",
                                                            email: "michael.chen@example.com",
                                                            role: "Editor",
                                                            status: "Active",
                                                            joined: "Mar 15, 2023",
                                                        },
                                                        {
                                                            name: "Aisha Patel",
                                                            email: "aisha.patel@example.com",
                                                            role: "Author",
                                                            status: "Active",
                                                            joined: "Jun 22, 2023",
                                                        },
                                                        {
                                                            name: "David Rodriguez",
                                                            email: "david.rodriguez@example.com",
                                                            role: "Admin",
                                                            status: "Inactive",
                                                            joined: "Sep 5, 2023",
                                                        },
                                                        {
                                                            name: "Jennifer Lee",
                                                            email: "jennifer.lee@example.com",
                                                            role: "Editor",
                                                            status: "Active",
                                                            joined: "Nov 18, 2023",
                                                        },
                                                    ].map((user, index) => (
                                                        <TableRow key={`user-${index}`}>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar src="/placeholder.svg?height=24&width=24" size="sm" />
                                                                    <span>{user.name}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{user.email}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    size="sm"
                                                                    variant="flat"
                                                                    color={
                                                                        user.role === "Admin"
                                                                            ? "primary"
                                                                            : user.role === "Editor"
                                                                                ? "secondary"
                                                                                : "default"
                                                                    }
                                                                >
                                                                  {user.role}
                                                              </Chip>
                                                          </TableCell>
                                                          <TableCell>
                                                              <Chip
                                                                  size="sm"
                                                                  variant="flat"
                                                                  color={user.status === "Active" ? "success" : "danger"}
                                                              >
                                                                  {user.status}
                                                              </Chip>
                                                          </TableCell>
                                                          <TableCell>{user.joined}</TableCell>
                                                          <TableCell>
                                                              <div className="flex gap-2">
                                                                  <Tooltip content="View">
                                                                      <Button isIconOnly size="sm" variant="light">
                                                                          <Eye size={16} />
                                                                      </Button>
                                                                  </Tooltip>
                                                                  <Tooltip content="Edit">
                                                                      <Button isIconOnly size="sm" variant="light">
                                                                          <Edit size={16} />
                                                                      </Button>
                                                                  </Tooltip>
                                                                  <Tooltip content="Delete">
                                                                      <Button isIconOnly size="sm" variant="light" color="danger">
                                                                          <Trash2 size={16} />
                                    </Button>
                                                                  </Tooltip>
                                                              </div>
                                                          </TableCell>
                            </TableRow>
                                                  ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        {/* Report Card */}
                        <Card className="bg-gray-900 border-gray-800 mb-6">
                            <CardHeader className="px-5 py-4 border-b border-gray-800">
                                <h3 className="text-lg font-semibold">Report</h3>
                            </CardHeader>
                            <CardBody className="p-5">
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <Progress
                                            size="sm"
                                            isIndeterminate
                                            aria-label="Loading..."
                                            className="max-w-full"
                                            color="primary"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded bg-blue-500/10 flex items-center justify-center">
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Total Views</p>
                                                    <p className="font-semibold">24,512</p>
                                                </div>
                                            </div>
                                            <Chip color="primary" variant="flat" size="sm">
                                                +12.5%
                                            </Chip>
                                        </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded bg-emerald-500/10 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-400">New Users</p>
                                                        <p className="font-semibold">847</p>
                                                    </div>
                                                </div>
                                                <Chip color="success" variant="flat" size="sm">
                                                    +24.3%
                                                </Chip>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded bg-amber-500/10 flex items-center justify-center">
                                                        <FileText className="h-4 w-4 text-amber-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-400">New Posts</p>
                                                        <p className="font-semibold">156</p>
                                                    </div>
                                                </div>
                                                <Chip color="warning" variant="flat" size="sm">
                                                    +18.7%
                                                </Chip>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded bg-purple-500/10 flex items-center justify-center">
                                                        <Activity className="h-4 w-4 text-purple-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-400">Engagement</p>
                                                        <p className="font-semibold">68.2%</p>
                                                    </div>
                                                </div>
                                                <Chip color="secondary" variant="flat" size="sm">
                                                    +5.3%
                                                </Chip>
                                            </div>

                                        <Button className="w-full mt-4" color="primary">
                                            View Full Report
                                        </Button>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Recent Activities */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader className="px-5 py-4 border-b border-gray-800">
                                <h3 className="text-lg font-semibold">Recent Activities</h3>
                            </CardHeader>
                            <CardBody className="p-0">
                                {isLoading ? (
                                    <div className="p-5 space-y-4">
                                        <Progress
                                            size="sm"
                                            isIndeterminate
                                            aria-label="Loading..."
                                            className="max-w-full"
                                            color="primary"
                                        />
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-800">
                                        {recentActivities.map((activity) => (
                                            <div key={activity.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                                                <div className="flex gap-3">
                                                    <Avatar src={activity.user.avatar} size="sm" />
                                                    <div>
                                                        <p className="text-sm">
                                                            <span className="font-semibold">{activity.user.name}</span> {activity.action}{" "}
                                                            {activity.target && <span className="text-blue-500">"{activity.target}"</span>}
                                                        </p>
                                                        <div className="flex items-center mt-1 text-xs text-gray-400">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {activity.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardBody>
                            <CardFooter className="px-5 py-4 border-t border-gray-800">
                                <Button className="w-full" variant="flat" color="primary" size="sm">
                                    View All Activities
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
