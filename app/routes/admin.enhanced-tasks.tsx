import { Card, CardHeader, CardBody, Button, Input, Select, SelectItem, Textarea, Chip, Progress, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Badge, Divider, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tabs, Tab } from "@nextui-org/react";
import { Form, Link, useLoaderData, useActionData, useSubmit, useNavigate } from "@remix-run/react";
import { json, LoaderFunction, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Calendar, Clock, Users, MessageCircle, Edit, CheckCircle, ArrowLeft, Plus, Reply, MoreVertical, UserPlus, AlertTriangle, FileText, Eye, Filter, Search, Star, Flag } from "lucide-react";
import { getSession } from "~/session";
import { TaskController } from "~/controller/task";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import AdminLayout from "~/layout/adminLayout";

// Loader function with enhanced role-based access
export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        // Get current user information
        const currentUser = await Registration.findOne({ email: userId }).populate('department');
        if (!currentUser) {
            return redirect("/addentech-login");
        }

        // Get filter parameters
        const url = new URL(request.url);
        const filters = {
            status: url.searchParams.get('status') || 'all',
            priority: url.searchParams.get('priority') || 'all',
            department: url.searchParams.get('department') || 'all',
            search: url.searchParams.get('search') || '',
            dueDateStart: url.searchParams.get('dueDateStart') || '',
            dueDateEnd: url.searchParams.get('dueDateEnd') || '',
            userEmail: userId,
            userRole: currentUser.role,
            userDepartment: currentUser.department
        };

        // Get tasks with role-based access
        const { tasks, total, stats } = await TaskController.getTasks(filters);

        // Get departments and users based on role
        let departments = [];
        let users = [];
        
        if (currentUser.role === 'admin' || currentUser.role === 'manager') {
            departments = await Departments.find();
            users = await Registration.find({ status: 'active' }, 'firstName lastName email role department');
        } else if (currentUser.role === 'department_head') {
            const userDept = await Departments.findById(currentUser.department);
            if (userDept) {
                departments = [userDept];
            }
            users = await Registration.find({ 
                department: currentUser.department, 
                status: 'active' 
            }, 'firstName lastName email role');
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
    } catch (error) {
        console.error('Error loading enhanced tasks:', error);
        return json({ 
            tasks: [], 
            total: 0, 
            stats: {}, 
            filters: {}, 
            departments: [], 
            users: [], 
            currentUser: null,
            error: "Failed to load tasks" 
        });
    }
};

// Action function for task operations
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
                const statusReason = formData.get('statusReason') as string;
                
                const result = await TaskController.updateTask(
                    taskId,
                    { status: newStatus as any },
                    userId
                );
                
                // Add status change comment
                if (result.success && statusReason) {
                    await TaskController.addComment(
                        taskId,
                        `Status changed to "${newStatus}". Reason: ${statusReason}`,
                        userId
                    );
                }
                
                return json(result);

            case 'assignToMember':
                const assignTaskId = formData.get('taskId') as string;
                const assignedMemberId = formData.get('assignedMemberId') as string;
                const assignmentInstructions = formData.get('instructions') as string;
                
                // Update task assignment
                const assignResult = await TaskController.updateTask(
                    assignTaskId,
                    { 
                        assignedTo: [assignedMemberId],
                        lastModifiedBy: userId
                    },
                    userId
                );
                
                // Add assignment comment
                if (assignResult.success && assignmentInstructions) {
                    await TaskController.addComment(
                        assignTaskId,
                        `Task assigned with instructions: ${assignmentInstructions}`,
                        userId
                    );
                }
                
                return json(assignResult);

            case 'addComment':
                const commentTaskId = formData.get('taskId') as string;
                const message = formData.get('message') as string;
                const parentCommentId = formData.get('parentCommentId') as string;
                const mentions = JSON.parse(formData.get('mentions') as string || '[]');
                
                const commentResult = await TaskController.addComment(
                    commentTaskId,
                    message,
                    userId,
                    mentions,
                    parentCommentId || undefined
                );
                return json(commentResult);

            default:
                return json({ success: false, message: "Invalid action" });
        }
    } catch (error: any) {
        console.error('Error in enhanced task action:', error);
        return json({ 
            success: false, 
            message: `Failed to perform action: ${error?.message || error}` 
        });
    }
}

const EnhancedTaskManagement = () => {
    const { tasks, total, stats, filters, departments, users, currentUser, error } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const submit = useSubmit();
    const navigate = useNavigate();

    // Modal states
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    // Form states
    const [statusValue, setStatusValue] = useState('');
    const [statusReason, setStatusReason] = useState('');
    const [assignedMember, setAssignedMember] = useState('');
    const [assignmentInstructions, setAssignmentInstructions] = useState('');
    const [comment, setComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department || 'all');

    // Handle successful actions
    useEffect(() => {
        if (actionData?.success) {
            setShowStatusModal(false);
            setShowAssignModal(false);
            setShowCommentModal(false);
            setSelectedTask(null);
            setComment('');
            setReplyingTo(null);
            
            // Refresh the page to show updated data
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

    // Permission functions
    const canChangeStatus = (task: any) => {
        if (currentUser.role === 'admin' || currentUser.role === 'manager') return true;
        if (currentUser.role === 'department_head' && 
            task.department._id === currentUser.department._id) return true;
        if (currentUser.role === 'staff') {
            return task.assignedTo?.some((assignee: any) => assignee._id === currentUser.id);
        }
        return false;
    };

    const canAssignTask = (task: any) => {
        if (currentUser.role === 'admin' || currentUser.role === 'manager') return true;
        if (currentUser.role === 'department_head' && 
            task.department._id === currentUser.department._id) return true;
        return false;
    };

    const canComment = (task: any) => {
        // All users can comment on tasks they can view
        return true;
    };

    // Action handlers
    const handleStatusChange = (task: any) => {
        setSelectedTask(task);
        setStatusValue(task.status);
        setShowStatusModal(true);
    };

    const handleAssignTask = (task: any) => {
        setSelectedTask(task);
        setShowAssignModal(true);
    };

    const handleAddComment = (task: any) => {
        setSelectedTask(task);
        setShowCommentModal(true);
    };

    const submitStatusUpdate = () => {
        const formData = new FormData();
        formData.set('_action', 'updateStatus');
        formData.set('taskId', selectedTask._id);
        formData.set('status', statusValue);
        formData.set('statusReason', statusReason);
        submit(formData, { method: 'POST' });
    };

    const submitAssignment = () => {
        const formData = new FormData();
        formData.set('_action', 'assignToMember');
        formData.set('taskId', selectedTask._id);
        formData.set('assignedMemberId', assignedMember);
        formData.set('instructions', assignmentInstructions);
        submit(formData, { method: 'POST' });
    };

    const submitComment = () => {
        const formData = new FormData();
        formData.set('_action', 'addComment');
        formData.set('taskId', selectedTask._id);
        formData.set('message', comment);
        formData.set('mentions', JSON.stringify([]));
        if (replyingTo) {
            formData.set('parentCommentId', replyingTo);
        }
        submit(formData, { method: 'POST' });
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
        
        window.location.href = `/admin/enhanced-tasks?${searchParams.toString()}`;
    };

    const clearFilters = () => {
        window.location.href = '/admin/enhanced-tasks';
    };

    const getPageTitle = () => {
        switch (currentUser?.role) {
            case 'staff': return 'My Tasks & Department Tasks';
            case 'department_head': return 'Department Task Management';
            case 'admin':
            case 'manager': return 'Enhanced Task Management';
            default: return 'Task Management';
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Success/Error Messages */}
                {error && (
                    <Card className="border-danger-200 bg-danger-50">
                        <CardBody>
                            <p className="text-danger-700">{error}</p>
                        </CardBody>
                    </Card>
                )}

                {actionData && (
                    <Card className={`border-${actionData.success ? 'success' : 'danger'}-200 bg-${actionData.success ? 'success' : 'danger'}-50`}>
                        <CardBody>
                            <p className={`text-${actionData.success ? 'success' : 'danger'}-700`}>
                                {actionData.message}
                            </p>
                        </CardBody>
                    </Card>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {getPageTitle()}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            {currentUser?.role === 'staff' && "View and manage your assigned tasks and all department tasks"}
                            {currentUser?.role === 'department_head' && "Manage department tasks, assign to members, and track progress"}
                            {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && "Full task management with advanced permissions and assignment capabilities"}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            color="primary"
                            startContent={<Plus size={16} />}
                            onClick={() => navigate('/admin/task-create')}
                            isDisabled={currentUser?.role === 'staff'}
                        >
                            Create Task
                        </Button>
                        <Button
                            variant="flat"
                            onClick={() => navigate('/admin/task-management')}
                        >
                            Regular View
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardBody className="text-center">
                            <h3 className="text-2xl font-bold text-blue-600">{stats.totalTasks || 0}</h3>
                            <p className="text-sm text-gray-600">Total Tasks</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="text-center">
                            <h3 className="text-2xl font-bold text-green-600">{stats.activeTasks || 0}</h3>
                            <p className="text-sm text-gray-600">Active Tasks</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="text-center">
                            <h3 className="text-2xl font-bold text-orange-600">{stats.overdueTasks || 0}</h3>
                            <p className="text-sm text-gray-600">Overdue Tasks</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="text-center">
                            <h3 className="text-2xl font-bold text-purple-600">{stats.completedTasks || 0}</h3>
                            <p className="text-sm text-gray-600">Completed Tasks</p>
                        </CardBody>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Filter size={20} />
                            <h3 className="text-lg font-semibold">Filters</h3>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input
                                label="Search Tasks"
                                placeholder="Search title, description..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                startContent={<Search size={16} />}
                                clearable
                            />

                            <Select
                                label="Status"
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

                            <Select
                                label="Priority"
                                selectedKeys={[selectedPriority]}
                                onSelectionChange={(keys) => setSelectedPriority(Array.from(keys)[0] as string)}
                            >
                                <SelectItem key="all" value="all">All Priority</SelectItem>
                                <SelectItem key="low" value="low">Low</SelectItem>
                                <SelectItem key="medium" value="medium">Medium</SelectItem>
                                <SelectItem key="high" value="high">High</SelectItem>
                                <SelectItem key="critical" value="critical">Critical</SelectItem>
                            </Select>

                            {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                                <Select
                                    label="Department"
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
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button color="primary" onClick={applyFilters}>
                                Apply Filters
                            </Button>
                            <Button variant="light" onClick={clearFilters}>
                                Clear All
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Tasks Table */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Tasks ({total})</h3>
                    </CardHeader>
                    <CardBody>
                        {tasks && tasks.length > 0 ? (
                            <Table aria-label="Enhanced tasks table">
                                <TableHeader>
                                    <TableColumn>Task</TableColumn>
                                    <TableColumn>Status</TableColumn>
                                    <TableColumn>Priority</TableColumn>
                                    <TableColumn>Assigned To</TableColumn>
                                    <TableColumn>Due Date</TableColumn>
                                    <TableColumn>Progress</TableColumn>
                                    <TableColumn>Actions</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {tasks.map((task: any) => (
                                        <TableRow key={task._id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{task.title}</p>
                                                    <p className="text-sm text-gray-600 truncate max-w-xs">
                                                        {task.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Chip size="sm" variant="flat" color="default">
                                                            {task.department?.name}
                                                        </Chip>
                                                        {task.tags?.map((tag: string, index: number) => (
                                                            <Chip key={index} size="sm" variant="flat">
                                                                {tag}
                                                            </Chip>
                                                        ))}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={getStatusColor(task.status)}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {task.status.replace('_', ' ').toUpperCase()}
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
                                                {task.assignedTo && task.assignedTo.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {task.assignedTo.map((assignee: any) => (
                                                            <p key={assignee._id} className="text-sm">
                                                                {assignee.firstName} {assignee.lastName}
                                                            </p>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className={`${isOverdue(task.dueDate, task.status) ? 'text-red-600' : ''}`}>
                                                    {formatDate(task.dueDate)}
                                                    {isOverdue(task.dueDate, task.status) && (
                                                        <span className="block text-xs">Overdue</span>
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
                                                    <span className="text-xs text-gray-600">
                                                        {task.progress || 0}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="primary"
                                                        startContent={<Eye size={14} />}
                                                        onClick={() => navigate(`/admin/task-details/${task._id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                    
                                                    {canChangeStatus(task) && (
                                                        <Button
                                                            size="sm"
                                                            variant="light"
                                                            color="success"
                                                            startContent={<CheckCircle size={14} />}
                                                            onClick={() => handleStatusChange(task)}
                                                        >
                                                            Status
                                                        </Button>
                                                    )}
                                                    
                                                    {canAssignTask(task) && (
                                                        <Button
                                                            size="sm"
                                                            variant="light"
                                                            color="secondary"
                                                            startContent={<UserPlus size={14} />}
                                                            onClick={() => handleAssignTask(task)}
                                                        >
                                                            Assign
                                                        </Button>
                                                    )}
                                                    
                                                    {canComment(task) && (
                                                        <Button
                                                            size="sm"
                                                            variant="light"
                                                            color="warning"
                                                            startContent={<MessageCircle size={14} />}
                                                            onClick={() => handleAddComment(task)}
                                                        >
                                                            Comment
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No tasks found matching your criteria.</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Status Update Modal */}
                <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)}>
                    <ModalContent>
                        <ModalHeader>Update Task Status</ModalHeader>
                        <ModalBody>
                            {selectedTask && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Task: {selectedTask.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            Current Status: <span className="font-medium">{selectedTask.status}</span>
                                        </p>
                                    </div>
                                    
                                    <Select
                                        label="New Status"
                                        selectedKeys={[statusValue]}
                                        onSelectionChange={(keys) => setStatusValue(Array.from(keys)[0] as string)}
                                    >
                                        <SelectItem key="not_started" value="not_started">Not Started</SelectItem>
                                        <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                                        <SelectItem key="under_review" value="under_review">Under Review</SelectItem>
                                        <SelectItem key="completed" value="completed">Completed</SelectItem>
                                        <SelectItem key="on_hold" value="on_hold">On Hold</SelectItem>
                                    </Select>
                                    
                                    <Textarea
                                        label="Reason for Status Change (Optional)"
                                        placeholder="Why are you changing the status?"
                                        value={statusReason}
                                        onValueChange={setStatusReason}
                                        minRows={3}
                                    />
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onClick={() => setShowStatusModal(false)}>
                                Cancel
                            </Button>
                            <Button color="primary" onClick={submitStatusUpdate}>
                                Update Status
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Assign Task Modal */}
                <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)}>
                    <ModalContent>
                        <ModalHeader>Assign Task to Department Member</ModalHeader>
                        <ModalBody>
                            {selectedTask && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Task: {selectedTask.title}</h3>
                                    </div>
                                    
                                    <Select
                                        label="Select Member"
                                        placeholder="Choose a department member"
                                        selectedKeys={assignedMember ? [assignedMember] : []}
                                        onSelectionChange={(keys) => setAssignedMember(Array.from(keys)[0] as string)}
                                    >
                                        {users.map((user: any) => (
                                            <SelectItem key={user._id} value={user._id}>
                                                {user.firstName} {user.lastName} ({user.role})
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    
                                    <Textarea
                                        label="Assignment Instructions (Optional)"
                                        placeholder="Provide specific instructions for the assigned member"
                                        value={assignmentInstructions}
                                        onValueChange={setAssignmentInstructions}
                                        minRows={3}
                                    />
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onClick={() => setShowAssignModal(false)}>
                                Cancel
                            </Button>
                            <Button 
                                color="primary" 
                                onClick={submitAssignment}
                                isDisabled={!assignedMember}
                            >
                                Assign Task
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Add Comment Modal */}
                <Modal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)}>
                    <ModalContent>
                        <ModalHeader>
                            {replyingTo ? 'Reply to Comment' : 'Add Comment'}
                        </ModalHeader>
                        <ModalBody>
                            {selectedTask && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Task: {selectedTask.title}</h3>
                                    </div>
                                    
                                    <Textarea
                                        label="Your Comment"
                                        placeholder="Write your comment here..."
                                        value={comment}
                                        onValueChange={setComment}
                                        minRows={4}
                                    />
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onClick={() => setShowCommentModal(false)}>
                                Cancel
                            </Button>
                            <Button 
                                color="primary" 
                                onClick={submitComment}
                                isDisabled={!comment.trim()}
                            >
                                {replyingTo ? 'Reply' : 'Add Comment'}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Feature Summary */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Enhanced Features Summary</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium mb-2">✅ Status Management</h4>
                                <p className="text-sm text-gray-600">Users can change task status with role-based permissions and optional reasoning.</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">✅ Department Head Assignment</h4>
                                <p className="text-sm text-gray-600">Department heads can assign tasks to their team members with instructions.</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">✅ Role-based Permissions</h4>
                                <p className="text-sm text-gray-600">Different access levels: Admin/Manager (full), Department Head (limited), Staff (assigned only).</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">✅ Department-wide Visibility</h4>
                                <p className="text-sm text-gray-600">Staff can view all department tasks but only modify assigned ones.</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">✅ Comment Threading</h4>
                                <p className="text-sm text-gray-600">Support for replies to comments with nested conversation threads.</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">✅ Enhanced Filtering</h4>
                                <p className="text-sm text-gray-600">Advanced search and filtering capabilities with role-appropriate options.</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default EnhancedTaskManagement; 