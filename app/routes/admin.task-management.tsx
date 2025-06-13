import { Card, CardHeader, CardBody, Button, Input, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Tooltip, Progress } from "@nextui-org/react";
import { Form, Link, useLoaderData, useActionData, useSubmit } from "@remix-run/react";
import { CalendarDays, CheckCircle, Clock, Filter, Plus, TrendingUp, Users, AlertTriangle, Search, Calendar, Timer, MessageSquare, Paperclip, Eye } from "lucide-react";
import { json, LoaderFunction, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { TaskController } from "~/controller/task";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import { useState, useEffect } from "react";
import AdminLayout from "~/layout/adminLayout";

// Loader function to fetch task data
export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        // Get current user information for role-based access
        const currentUser = await Registration.findOne({ email: userId });
        if (!currentUser) {
            return redirect("/addentech-login");
        }

        const url = new URL(request.url);
        const filters = {
            status: url.searchParams.get('status') || 'all',
            priority: url.searchParams.get('priority') || 'all',
            category: url.searchParams.get('category') || 'all',
            department: url.searchParams.get('department') || 'all',
            assignedTo: url.searchParams.get('assignedTo') || '',
            dueDateStart: url.searchParams.get('dueDateStart') || '',
            dueDateEnd: url.searchParams.get('dueDateEnd') || '',
            search: url.searchParams.get('search') || '',
            page: parseInt(url.searchParams.get('page') || '1'),
            limit: parseInt(url.searchParams.get('limit') || '10'),
            sortBy: url.searchParams.get('sortBy') || 'dueDate',
            sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc',
            userEmail: userId,
            userRole: currentUser?.role,
            userDepartment: currentUser?.department
        };

        // Get tasks using TaskController
        const result = await TaskController.getTasks(filters);
        const tasks = result.tasks || [];
        const total = result.total || 0;
        const stats = result.stats || {};

        // Get departments for filtering (admin/manager only)
        let departments = [];
        if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
            try {
                departments = await Departments.find();
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        }

        // Get users for assignment (based on role)
        let users = [];
        try {
            if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
                users = await Registration.find({ status: 'active' }, 'firstName lastName email role department');
            } else if (currentUser?.role === 'department_head') {
                users = await Registration.find({ 
                    department: currentUser.department, 
                    status: 'active' 
                }, 'firstName lastName email role');
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }

        return json({
            tasks,
            total,
            stats,
            filters,
            departments,
            users,
            currentUser: {
                id: currentUser._id,
                email: currentUser.email,
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                role: currentUser.role,
                department: currentUser.department
            }
        });
    } catch (error: any) {
        console.error('Error loading task data:', error);
        return json({
            tasks: [],
            total: 0,
            stats: {
                totalTasks: 0,
                activeTasks: 0,
                completedTasks: 0,
                overdueTasks: 0,
                highPriorityTasks: 0,
                tasksThisWeek: 0
            },
            filters: { status: 'all', priority: 'all', category: 'all', department: 'all' },
            departments: [],
            users: [],
            currentUser: null,
            error: `Failed to load task data: ${error?.message || error}`
        });
    }
};

// Action function to handle task operations
export async function action({ request }: ActionFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        const formData = await request.formData();
        const action = formData.get('_action') as string;

        switch (action) {
            case 'updateStatus':
                const taskId = formData.get('taskId') as string;
                const newStatus = formData.get('status') as string;
                
                const result = await TaskController.updateTask(
                    taskId,
                    { status: newStatus as any },
                    userId
                );
                
                return json(result);

            case 'addComment':
                const commentTaskId = formData.get('taskId') as string;
                const message = formData.get('message') as string;
                const mentions = JSON.parse(formData.get('mentions') as string || '[]');
                
                const commentResult = await TaskController.addComment(
                    commentTaskId,
                    message,
                    userId,
                    mentions
                );
                
                return json(commentResult);

            case 'logTime':
                const timeTaskId = formData.get('taskId') as string;
                const hours = parseFloat(formData.get('hours') as string);
                const description = formData.get('description') as string;
                
                const timeResult = await TaskController.addTimeEntry(
                    timeTaskId,
                    hours,
                    description,
                    userId
                );
                
                return json(timeResult);

            default:
                return json({ success: false, message: "Invalid action" });
        }
    } catch (error: any) {
        console.error('Error in action:', error);
        return json({ success: false, message: `Action failed: ${error?.message || error}` });
    }
}

const TaskManagement = () => {
    const { tasks, total, stats, filters, departments, users, currentUser, error } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const submit = useSubmit();

    // Filter states
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department || 'all');
    const [dueDateStart, setDueDateStart] = useState(filters.dueDateStart || '');
    const [dueDateEnd, setDueDateEnd] = useState(filters.dueDateEnd || '');

    // Modal states
    const { isOpen: isCommentOpen, onOpen: onCommentOpen, onClose: onCommentClose } = useDisclosure();
    const { isOpen: isTimeOpen, onOpen: onTimeOpen, onClose: onTimeClose } = useDisclosure();
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [comment, setComment] = useState('');
    const [timeHours, setTimeHours] = useState('');
    const [timeDescription, setTimeDescription] = useState('');

    // Handle successful actions
    useEffect(() => {
        if (actionData?.success) {
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }, [actionData]);

    // Utility functions
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'under_review': return 'warning';
            case 'on_hold': return 'default';
            case 'not_started': return 'default';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'danger';
            case 'high': return 'warning';
            case 'medium': return 'primary';
            case 'low': return 'default';
            default: return 'default';
        }
    };

    const isOverdue = (dueDate: string, status: string) => {
        if (status === 'completed') return false;
        return new Date() > new Date(dueDate);
    };

    // Filter handling
    const applyFilters = () => {
        const searchParams = new URLSearchParams();
        
        if (selectedStatus !== 'all') searchParams.set('status', selectedStatus);
        if (selectedPriority !== 'all') searchParams.set('priority', selectedPriority);
        if (selectedDepartment !== 'all' && (currentUser?.role === 'admin' || currentUser?.role === 'manager')) {
            searchParams.set('department', selectedDepartment);
        }
        if (searchQuery.trim()) searchParams.set('search', searchQuery.trim());
        if (dueDateStart) searchParams.set('dueDateStart', dueDateStart);
        if (dueDateEnd) searchParams.set('dueDateEnd', dueDateEnd);
        
        window.location.href = `/admin/task-management?${searchParams.toString()}`;
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedStatus('all');
        setSelectedPriority('all');
        setSelectedDepartment('all');
        setDueDateStart('');
        setDueDateEnd('');
        window.location.href = '/admin/task-management';
    };

    // Task actions
    const handleStatusUpdate = (task: any, newStatus: string) => {
        const formData = new FormData();
        formData.set('_action', 'updateStatus');
        formData.set('taskId', task._id);
        formData.set('status', newStatus);
        submit(formData, { method: 'POST' });
    };

    const handleCommentSubmit = () => {
        if (!selectedTask || !comment.trim()) return;

        const formData = new FormData();
        formData.set('_action', 'addComment');
        formData.set('taskId', selectedTask._id);
        formData.set('message', comment);
        formData.set('mentions', JSON.stringify([])); // TODO: Implement mention parsing
        
        submit(formData, { method: 'POST' });
        setComment('');
        onCommentClose();
    };

    const handleTimeSubmit = () => {
        if (!selectedTask || !timeHours || parseFloat(timeHours) <= 0) return;

        const formData = new FormData();
        formData.set('_action', 'logTime');
        formData.set('taskId', selectedTask._id);
        formData.set('hours', timeHours);
        formData.set('description', timeDescription);
        
        submit(formData, { method: 'POST' });
        setTimeHours('');
        setTimeDescription('');
        onTimeClose();
    };

    // Role-based access control
    const canCreateTasks = currentUser?.role !== 'staff';
    const canViewAllStats = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    const canViewDepartmentStats = currentUser?.role === 'department_head';
    const isStaff = currentUser?.role === 'staff';

    const getPageTitle = () => {
        if (isStaff) return `My Tasks`;
        if (canViewDepartmentStats) return `Department Task Management`;
        return `Task Management Dashboard`;
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6 !text-white">
                {/* Error/Success Messages */}
                {error && (
                    <Card className="bg-dashboard-secondary border border-red-700">
                        <CardBody>
                            <p className="text-red-300">{error}</p>
                        </CardBody>
                    </Card>
                )}

                {actionData?.success && (
                    <Card className="bg-dashboard-secondary border border-green-700">
                        <CardBody>
                            <p className="text-green-300">{actionData.message}</p>
                        </CardBody>
                    </Card>
                )}

                {actionData && !actionData.success && (
                    <Card className="bg-dashboard-secondary border border-red-700">
                        <CardBody>
                            <p className="text-red-300">{actionData.message}</p>
                        </CardBody>
                    </Card>
                )}

                {/* Header */}
                <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 text-white shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">
                                {getPageTitle()}
                            </h1>
                            <p className="text-gray-300 mt-2">
                                {isStaff && 'View and manage your assigned tasks'}
                                {canViewDepartmentStats && 'Manage tasks for your department'}
                                {canViewAllStats && 'Manage all tasks across the organization'}
                            </p>
                            {currentUser && (
                                <p className="text-gray-300 mt-1">
                                    Total Tasks: {total} | Role: {currentUser.role}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {canCreateTasks && (
                                <Link to="/admin/task-create">
                                    <Button
                                        startContent={<Plus size={16} />}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold"
                                    >
                                        New Task
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm text-gray-300">Total Tasks</p>
                                    <p className="text-2xl font-bold text-white">{stats?.totalTasks || 0}</p>
                                </div>
                                <CalendarDays size={24} className="text-blue-400" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm text-gray-300">Active Tasks</p>
                                    <p className="text-2xl font-bold text-white">{stats?.activeTasks || 0}</p>
                                </div>
                                <Clock size={24} className="text-green-400" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm text-gray-300">Completed</p>
                                    <p className="text-2xl font-bold text-white">{stats?.completedTasks || 0}</p>
                                </div>
                                <CheckCircle size={24} className="text-purple-400" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm text-gray-300">Overdue</p>
                                    <p className="text-2xl font-bold text-white">{stats?.overdueTasks || 0}</p>
                                </div>
                                <AlertTriangle size={24} className="text-red-400" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm text-gray-300">High Priority</p>
                                    <p className="text-2xl font-bold text-white">{stats?.highPriorityTasks || 0}</p>
                                </div>
                                <TrendingUp size={24} className="text-amber-400" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm text-gray-300">This Week</p>
                                    <p className="text-2xl font-bold text-white">{stats?.tasksThisWeek || 0}</p>
                                </div>
                                <Users size={24} className="text-blue-400" />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Enhanced Filters */}
                <Card className="bg-dashboard-secondary border border-white/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">Search & Filter</h3>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            {/* Search */}
                            <Input
                                label="Search Tasks"
                                placeholder="Search title, description..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                startContent={<Search size={16} />}
                                size="sm"
                                clearable
                            />

                            {/* Status Filter */}
                            <Select
                                label="Status"
                                size="sm"
                                selectedKeys={[selectedStatus]}
                                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                            >
                                <SelectItem key="all" value="all">All Status</SelectItem>
                                <SelectItem key="not_started" value="not_started">Not Started</SelectItem>
                                <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                                <SelectItem key="under_review" value="under_review">Under Review</SelectItem>
                                <SelectItem key="completed" value="completed">Completed</SelectItem>
                                <SelectItem key="on_hold" value="on_hold">On Hold</SelectItem>
                            </Select>

                            {/* Priority Filter */}
                            <Select
                                label="Priority"
                                size="sm"
                                selectedKeys={[selectedPriority]}
                                onSelectionChange={(keys) => setSelectedPriority(Array.from(keys)[0] as string)}
                            >
                                <SelectItem key="all" value="all">All Priority</SelectItem>
                                <SelectItem key="low" value="low">Low</SelectItem>
                                <SelectItem key="medium" value="medium">Medium</SelectItem>
                                <SelectItem key="high" value="high">High</SelectItem>
                                <SelectItem key="critical" value="critical">Critical</SelectItem>
                            </Select>

                            {/* Department Filter (Admin/Manager only) */}
                            {canViewAllStats && (
                                <Select
                                    label="Department"
                                    size="sm"
                                    selectedKeys={[selectedDepartment]}
                                    onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0] as string)}
                                >
                                    <SelectItem key="all" value="all">All Departments</SelectItem>
                                    {departments?.map((dept: any) => (
                                        <SelectItem key={dept._id} value={dept._id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}

                            {/* Due Date Start */}
                            <Input
                                type="date"
                                label="Due Date From"
                                size="sm"
                                value={dueDateStart}
                                onChange={(e) => setDueDateStart(e.target.value)}
                                startContent={<Calendar size={16} />}
                            />

                            {/* Due Date End */}
                            <Input
                                type="date"
                                label="Due Date To"
                                size="sm"
                                value={dueDateEnd}
                                onChange={(e) => setDueDateEnd(e.target.value)}
                                startContent={<Calendar size={16} />}
                            />

                            {/* Filter Actions */}
                            <div className="flex gap-2 items-end">
                                <Button
                                    color="primary"
                                    size="sm"
                                    onClick={applyFilters}
                                    className="flex-1"
                                >
                                    Apply
                                </Button>
                                <Button
                                    variant="flat"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="flex-1"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Tasks Table */}
                <Card className="bg-dashboard-secondary border border-white/20">
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-white">Tasks</h3>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Tasks table">
                            <TableHeader>
                                <TableColumn>TASK</TableColumn>
                                <TableColumn>ASSIGNEE</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>PRIORITY</TableColumn>
                                <TableColumn>DUE DATE</TableColumn>
                                <TableColumn>PROGRESS</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {tasks.map((task: any) => (
                                    <TableRow key={task._id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-white">{task.title}</p>
                                                <p className="text-sm text-gray-300">{task.category}</p>
                                                {task.tags && task.tags.length > 0 && (
                                                    <div className="flex gap-1 mt-1">
                                                        {task.tags.slice(0, 2).map((tag: string, index: number) => (
                                                            <Chip key={index} size="sm" variant="flat">
                                                                {tag}
                                                            </Chip>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                {task.assignedTo?.slice(0, 2).map((assignee: any, index: number) => (
                                                    <span key={index} className="text-sm text-white">
                                                        {assignee.firstName} {assignee.lastName}
                                                    </span>
                                                ))}
                                                {task.assignedTo?.length > 2 && (
                                                    <span className="text-xs text-gray-300">
                                                        +{task.assignedTo.length - 2} more
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                color={getStatusColor(task.status)}
                                                variant="flat"
                                                size="sm"
                                            >
                                                {task.status.replace('_', ' ')}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                color={getPriorityColor(task.priority)}
                                                variant="flat"
                                                size="sm"
                                            >
                                                {task.priority}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`${isOverdue(task.dueDate, task.status) ? 'text-red-400' : 'text-white'}`}>
                                                {formatDate(task.dueDate)}
                                                {isOverdue(task.dueDate, task.status) && (
                                                    <span className="block text-xs text-red-400">Overdue</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-20">
                                                <Progress
                                                    value={task.progress || 0}
                                                    size="sm"
                                                    color={task.progress === 100 ? "success" : "primary"}
                                                />
                                                <span className="text-xs text-gray-300">
                                                    {task.progress || 0}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Link to={`/admin/task-details/${task._id}`}>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        isIconOnly
                                                    >
                                                        <Eye size={14} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    isIconOnly
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        onCommentOpen();
                                                    }}
                                                >
                                                    <MessageSquare size={14} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    isIconOnly
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        onTimeOpen();
                                                    }}
                                                >
                                                    <Timer size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {tasks.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-300">No tasks found matching your criteria</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Comment Modal */}
                <Modal isOpen={isCommentOpen} onClose={onCommentClose}>
                    <ModalContent>
                        <ModalHeader>
                            <h3 className="text-lg font-bold">Add Comment</h3>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Input
                                    label="Task"
                                    value={selectedTask?.title || ''}
                                    isReadOnly
                                />
                                <Input
                                    label="Comment"
                                    placeholder="Enter your comment..."
                                    value={comment}
                                    onValueChange={setComment}
                                    multiline
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onCommentClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={handleCommentSubmit}>
                                Add Comment
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Time Entry Modal */}
                <Modal isOpen={isTimeOpen} onClose={onTimeClose}>
                    <ModalContent>
                        <ModalHeader>
                            <h3 className="text-lg font-bold">Log Time</h3>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Input
                                    label="Task"
                                    value={selectedTask?.title || ''}
                                    isReadOnly
                                />
                                <Input
                                    type="number"
                                    label="Hours"
                                    placeholder="0.5"
                                    value={timeHours}
                                    onValueChange={setTimeHours}
                                    step="0.25"
                                    min="0"
                                />
                                <Input
                                    label="Description (Optional)"
                                    placeholder="What did you work on?"
                                    value={timeDescription}
                                    onValueChange={setTimeDescription}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onTimeClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={handleTimeSubmit}>
                                Log Time
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default TaskManagement; 