import { Card, CardHeader, CardBody, Button, Input, Select, SelectItem, Textarea, Progress, Chip, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Divider, Tabs, Tab, Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Form, Link, useLoaderData, useActionData, useSubmit, useNavigate } from "@remix-run/react";
import { ArrowLeft, Edit, MessageSquare, Clock, Users, Calendar, Tag, FileText, CheckCircle, AlertTriangle, Timer, Paperclip, Send, Save, Plus, Reply, MoreVertical, UserPlus } from "lucide-react";
import { json, LoaderFunction, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { TaskController } from "~/controller/task";
import Registration from "~/modal/registration";
import { useState, useEffect } from "react";
import AdminLayout from "~/layout/adminLayout";

// Loader function to fetch task details with role-based access
export const loader: LoaderFunction = async ({ request, params }: LoaderFunctionArgs) => {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        const taskId = params.id;
        if (!taskId) {
            throw new Error("Task ID is required");
        }

        // Get current user information
        const currentUser = await Registration.findOne({ email: userId }).populate('department');
        if (!currentUser) {
            return redirect("/addentech-login");
        }

        // Get task details with role-based access
        const task = await TaskController.getTaskById(taskId, userId);
        if (!task) {
            throw new Error("Task not found or access denied");
        }

        // Get department users for assignment (if user is department head)
        let departmentUsers = [];
        if (currentUser.role === 'department_head' || currentUser.role === 'admin' || currentUser.role === 'manager') {
            const departmentId = currentUser.role === 'department_head' ? currentUser.department : task.department;
            departmentUsers = await Registration.find({ 
                department: departmentId,
                status: 'active',
                role: { $in: ['staff', 'department_head'] }
            }, 'firstName lastName email role');
        }

        // Check permissions
        const permissions = {
            canEdit: canUserEdit(task, currentUser),
            canDelete: canUserDelete(task, currentUser),
            canChangeStatus: canUserChangeStatus(task, currentUser),
            canAssign: canUserAssign(task, currentUser),
            canComment: canUserComment(task, currentUser),
            canView: canUserView(task, currentUser)
        };

        return json({
            task,
            currentUser: {
                id: currentUser._id,
                email: currentUser.email,
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                role: currentUser.role,
                department: currentUser.department
            },
            departmentUsers,
            permissions
        });
    } catch (error) {
        console.error('Error loading task details:', error);
        throw new Response("Task not found", { status: 404 });
    }
};

// Action function to handle task operations
export async function action({ request, params }: ActionFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        const taskId = params.id;
        if (!taskId) {
            return json({ success: false, message: "Task ID is required" });
        }

        const formData = await request.formData();
        const action = formData.get('_action') as string;

        switch (action) {
            case 'updateStatus':
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

            case 'updateProgress':
                const progress = parseInt(formData.get('progress') as string);
                const progressResult = await TaskController.updateTask(
                    taskId,
                    { progress },
                    userId
                );
                return json(progressResult);

            case 'addComment':
                const message = formData.get('message') as string;
                const parentCommentId = formData.get('parentCommentId') as string;
                const mentions = JSON.parse(formData.get('mentions') as string || '[]');
                
                const commentResult = await TaskController.addComment(
                    taskId,
                    message,
                    userId,
                    mentions,
                    parentCommentId || undefined
                );
                return json(commentResult);

            case 'assignToMember':
                const assignedMemberId = formData.get('assignedMemberId') as string;
                const assignmentInstructions = formData.get('instructions') as string;
                
                // Handle hierarchical assignment
                const assignResult = await TaskController.assignTaskHierarchically(
                    taskId,
                    assignedMemberId,
                    userId,
                    assignmentInstructions || ''
                );
                
                // Add assignment comment
                if (assignResult.success && assignmentInstructions) {
                    await TaskController.addComment(
                        taskId,
                        `Task assigned with instructions: ${assignmentInstructions}`,
                        userId
                    );
                }
                
                return json(assignResult);

            case 'updateTask':
                const title = formData.get('title') as string;
                const description = formData.get('description') as string;
                const priority = formData.get('priority') as string;
                const dueDate = formData.get('dueDate') as string;
                
                const updateResult = await TaskController.updateTask(
                    taskId,
                    {
                        title,
                        description,
                        priority: priority as any,
                        dueDate: dueDate ? new Date(dueDate) : undefined
                    },
                    userId
                );
                return json(updateResult);

            default:
                return json({ success: false, message: "Invalid action" });
        }
    } catch (error: any) {
        console.error('Error in task action:', error);
        return json({ 
            success: false, 
            message: `Failed to perform action: ${error?.message || error}` 
        });
    }
}

// Permission helper functions
function canUserView(task: any, user: any): boolean {
    // Admin and Manager can view any task
    if (user.role === 'admin' || user.role === 'manager') return true;
    
    // Department head can view tasks in their department
    if (user.role === 'department_head' && 
        task.department._id.toString() === user.department._id.toString()) return true;
    
    // Staff can view tasks assigned to them, created by them, or in their department
    if (user.role === 'staff') {
        const isAssigned = task.assignedTo?.some((assignee: any) => 
            assignee._id?.toString() === user._id.toString());
        const isCreator = task.createdBy?._id?.toString() === user._id.toString();
        const isDepartmentMember = task.department._id.toString() === user.department._id.toString();
        return isAssigned || isCreator || isDepartmentMember;
    }
    
    return false;
}

function canUserEdit(task: any, user: any): boolean {
    // Admin and Manager can edit any task
    if (user.role === 'admin' || user.role === 'manager') return true;
    
    // Department head can edit tasks created by admin/manager in their department (limited edit)
    if (user.role === 'department_head' && 
        task.department._id.toString() === user.department._id.toString()) {
        // Can't edit tasks created by admin/manager, but can change status and assign
        return false; // Will be handled by canChangeStatus and canAssign
    }
    
    // Staff can edit tasks assigned to them or created by them
    if (user.role === 'staff') {
        const isAssigned = task.assignedTo?.some((assignee: any) => 
            assignee._id?.toString() === user._id.toString());
        const isCreator = task.createdBy?._id?.toString() === user._id.toString();
        return isAssigned || isCreator;
    }
    
    return false;
}

function canUserDelete(task: any, user: any): boolean {
    // Only admin and manager can delete tasks
    if (user.role === 'admin' || user.role === 'manager') return true;
    
    // Task creator can delete if they're staff and it's their own task
    if (user.role === 'staff' && task.createdBy?._id?.toString() === user._id.toString()) {
        return true;
    }
    
    return false;
}

function canUserChangeStatus(task: any, user: any): boolean {
    // Admin and Manager can change any task status
    if (user.role === 'admin' || user.role === 'manager') return true;
    
    // Department head can change status of tasks in their department
    if (user.role === 'department_head' && 
        task.department._id.toString() === user.department._id.toString()) return true;
    
    // Staff can change status only if assigned to them
    if (user.role === 'staff') {
        return task.assignedTo?.some((assignee: any) => 
            assignee._id?.toString() === user._id.toString());
    }
    
    return false;
}

function canUserAssign(task: any, user: any): boolean {
    // Admin and Manager can assign any task
    if (user.role === 'admin' || user.role === 'manager') return true;
    
    // Department head can assign tasks in their department
    if (user.role === 'department_head' && 
        task.department._id.toString() === user.department._id.toString()) return true;
    
    return false;
}

function canUserComment(task: any, user: any): boolean {
    // Anyone who can view the task can comment
    return canUserView(task, user);
}

const TaskDetails = () => {
    const { task, currentUser, departmentUsers, permissions } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const submit = useSubmit();
    const navigate = useNavigate();

    // Modal states
    const { isOpen: isCommentOpen, onOpen: onCommentOpen, onClose: onCommentClose } = useDisclosure();
    const { isOpen: isTimeOpen, onOpen: onTimeOpen, onClose: onTimeClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);

    // Form states
    const [comment, setComment] = useState('');
    const [timeHours, setTimeHours] = useState('');
    const [timeDescription, setTimeDescription] = useState('');
    const [timeDate, setTimeDate] = useState(new Date().toISOString().split('T')[0]);
    const [editStatus, setEditStatus] = useState(task?.status || 'not_started');
    const [editProgress, setEditProgress] = useState(task?.progress?.toString() || '0');
    const [statusReason, setStatusReason] = useState('');
    const [assignedMember, setAssignedMember] = useState('');
    const [assignmentInstructions, setAssignmentInstructions] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    
    // Edit form states
    const [editTitle, setEditTitle] = useState(task?.title || '');
    const [editDescription, setEditDescription] = useState(task?.description || '');
    const [editPriority, setEditPriority] = useState(task?.priority || 'medium');
    const [editDueDate, setEditDueDate] = useState(
        task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    );

    // Handle successful actions
    useEffect(() => {
        if (actionData?.success) {
            setShowStatusModal(false);
            setShowAssignModal(false);
            setShowEditModal(false);
            setShowCommentModal(false);
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatSimpleDate = (dateString: string) => {
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

    // Action handlers
    const handleStatusUpdate = () => {
        const formData = new FormData();
        formData.set('_action', 'updateStatus');
        formData.set('status', editStatus);
        formData.set('statusReason', statusReason);
        submit(formData, { method: 'POST' });
    };

    const handleAssignMember = () => {
        const formData = new FormData();
        formData.set('_action', 'assignToMember');
        formData.set('assignedMemberId', assignedMember);
        formData.set('instructions', assignmentInstructions);
        submit(formData, { method: 'POST' });
    };

    const handleUpdateTask = () => {
        const formData = new FormData();
        formData.set('_action', 'updateTask');
        formData.set('title', editTitle);
        formData.set('description', editDescription);
        formData.set('priority', editPriority);
        formData.set('dueDate', editDueDate);
        submit(formData, { method: 'POST' });
    };

    const handleAddComment = (parentCommentId?: string) => {
        const formData = new FormData();
        formData.set('_action', 'addComment');
        formData.set('message', comment);
        formData.set('mentions', JSON.stringify([]));
        if (parentCommentId) {
            formData.set('parentCommentId', parentCommentId);
        }
        submit(formData, { method: 'POST' });
    };

    const renderComments = (comments: any[], level = 0) => {
        return comments.map((comment) => (
            <div key={comment._id} className={`mb-4 ${level > 0 ? 'ml-8 border-l-2 border-white/20 pl-4' : ''}`}>
                <div className="flex items-start space-x-3">
                    <Avatar 
                        name={`${comment.user.firstName} ${comment.user.lastName}`}
                        size="sm"
                    />
                    <div className="flex-1">
                        <div className="bg-dashboard-primary border border-white/10 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-white">
                                    {comment.user.firstName} {comment.user.lastName}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {formatDate(comment.timestamp)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300">
                                {comment.message}
                            </p>
                        </div>
                        {permissions.canComment && (
                            <Button
                                size="sm"
                                variant="light"
                                className="mt-1 text-gray-300 hover:text-white"
                                startContent={<Reply size={14} />}
                                onClick={() => {
                                    setReplyingTo(comment._id);
                                    setShowCommentModal(true);
                                }}
                            >
                                Reply
                            </Button>
                        )}
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3">
                                {renderComments(comment.replies, level + 1)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ));
    };

    if (!permissions.canView) {
        return (
            <AdminLayout>
                <div className="space-y-6 !text-white">
                    <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
                        <p>You don't have permission to view this task.</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 !text-white">
                {/* Success/Error Messages */}
                {actionData && (
                    <div className={`p-4 rounded-lg border ${actionData.success 
                        ? 'border-green-500/20 bg-green-500/10 text-green-400' 
                        : 'border-red-500/20 bg-red-500/10 text-red-400'
                    }`}>
                        <p>{actionData.message}</p>
                    </div>
                )}

                {/* Header */}
                <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           
                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    {task.title}
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <Chip
                                        color={getStatusColor(task.status)}
                                        variant="flat"
                                        size="sm"
                                    >
                                        {task.status.replace('_', ' ').toUpperCase()}
                                    </Chip>
                                    <Chip
                                        color={getPriorityColor(task.priority)}
                                        variant="flat"
                                        size="sm"
                                    >
                                        {task.priority.toUpperCase()} PRIORITY
                                    </Chip>
                                    {isOverdue(task.dueDate, task.status) && (
                                        <Badge color="danger" variant="flat">
                                            OVERDUE
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Dropdown */}
                        <Dropdown className="bg-dashboard-secondary border border-white/20">
                            <DropdownTrigger>
                                <Button
                                    variant="flat"
                                    endContent={<MoreVertical size={16} />}
                                    className="bg-action-primary text-white hover:bg-action-primary"
                                >
                                    Actions
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu 
                                aria-label="Task actions"
                                className="bg-dashboard-secondary border-none"
                            >
                                {permissions.canChangeStatus && (
                                    <DropdownItem
                                        key="status"
                                        startContent={<CheckCircle size={16} />}
                                        onClick={() => setShowStatusModal(true)}
                                        className="text-gray-300 hover:text-white"
                                    >
                                        Change Status
                                    </DropdownItem>
                                )}
                                {permissions.canAssign && (
                                    <DropdownItem
                                        key="assign"
                                        startContent={<UserPlus size={16} />}
                                        onClick={() => setShowAssignModal(true)}
                                        className="text-gray-300 hover:text-white"
                                    >
                                        Assign to Member
                                    </DropdownItem>
                                )}
                                {permissions.canEdit && (
                                    <DropdownItem
                                        key="edit"
                                        startContent={<Edit size={16} />}
                                        onClick={() => setShowEditModal(true)}
                                        className="text-gray-300 hover:text-white"
                                    >
                                        Edit Task
                                    </DropdownItem>
                                )}
                                {permissions.canComment && (
                                    <DropdownItem
                                        key="comment"
                                        startContent={<MessageSquare size={16} />}
                                        onClick={() => setShowCommentModal(true)}
                                        className="text-gray-300 hover:text-white"
                                    >
                                        Add Comment
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Task Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-white">Description</h3>
                            </div>
                            <div>
                                <p className="text-gray-300 whitespace-pre-wrap">
                                    {task.description}
                                </p>
                            </div>
                        </div>

                        {/* Progress */}
                        {/* <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-white">Progress</h3>
                            </div>
                            <div>
                                <div className="space-y-3">
                                    <Progress
                                        value={task.progress || 0}
                                        color={task.progress === 100 ? "success" : "primary"}
                                        size="lg"
                                        showValueLabel
                                    />
                                    <p className="text-sm text-gray-300">
                                        {task.progress || 0}% Complete
                                    </p>
                                </div>
                            </div>
                        </div> */}

                        {/* Comments */}
                        <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Comments</h3>
                                {permissions.canComment && (
                                    <Button
                                        size="sm"
                                        className="bg-action-primary text-white hover:bg-action-primary"
                                        startContent={<Plus size={16} />}
                                        onClick={() => setShowCommentModal(true)}
                                    >
                                        Add Comment
                                    </Button>
                                )}
                            </div>
                            <div>
                                {task.comments && task.comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {renderComments(task.comments)}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-center py-4">
                                        No comments yet. Be the first to comment!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Task Info */}
                        <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-white">Task Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Department</p>
                                    <p className="text-sm text-gray-300">{task.department.name}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Created By</p>
                                    <p className="text-sm text-gray-300">
                                        {task.createdBy.firstName} {task.createdBy.lastName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-400">Assigned To</p>
                                    {task.assignedTo && task.assignedTo.length > 0 ? (
                                        <div className="space-y-2">
                                            {task.assignedTo.map((assignee: any, index: number) => (
                                                <div key={assignee._id} className="bg-dashboard-primary border border-white/10 rounded-lg p-2">
                                                    <p className="text-sm font-medium text-white">
                                                        {assignee.firstName} {assignee.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-400 capitalize">
                                                        {assignee.role?.replace('_', ' ')}
                                                        {index === 0 && task.assignedTo.length > 1 && ' (Primary)'}
                                                        {index > 0 && ' (Delegated)'}
                                                    </p>
                                                </div>
                                            ))}
                                            
                                            {/* Assignment History */}
                                            {task.assignmentHistory && task.assignmentHistory.length > 0 && (
                                                <div className="border-t border-white/10 pt-2">
                                                    <p className="text-xs font-medium text-gray-400 mb-1">Assignment History</p>
                                                    <div className="space-y-1">
                                                        {task.assignmentHistory.slice(-3).map((assignment: any, index: number) => (
                                                            <div key={index} className="text-xs text-gray-400">
                                                                <span className="font-medium text-gray-300">
                                                                    {assignment.assignedBy.firstName} {assignment.assignedBy.lastName}
                                                                </span>
                                                                {' '}assigned to{' '}
                                                                <span className="font-medium text-gray-300">
                                                                    {assignment.assignedTo.firstName} {assignment.assignedTo.lastName}
                                                                </span>
                                                                <div className="text-xs text-gray-500">
                                                                    {new Date(assignment.assignedAt).toLocaleDateString()} at {new Date(assignment.assignedAt).toLocaleTimeString()}
                                                                    {assignment.assignmentLevel === 'delegation' && ' (Delegated)'}
                                                                </div>
                                                                {assignment.instructions && (
                                                                    <div className="text-xs italic text-gray-500 mt-1">
                                                                        "{assignment.instructions}"
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {task.assignmentHistory.length > 3 && (
                                                            <p className="text-xs text-gray-500">
                                                                ...and {task.assignmentHistory.length - 3} more assignments
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">Not assigned</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-400">Due Date</p>
                                    <p className={`text-sm ${isOverdue(task.dueDate, task.status) ? 'text-red-400' : 'text-gray-300'}`}>
                                        {formatDate(task.dueDate)}
                                        {isOverdue(task.dueDate, task.status) && (
                                            <span className="block text-xs">Overdue</span>
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-400">Created</p>
                                    <p className="text-sm text-gray-300">{formatDate(task.createdAt)}</p>
                                </div>

                                {task.updatedAt !== task.createdAt && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Last Updated</p>
                                        <p className="text-sm text-gray-300">{formatDate(task.updatedAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {/* <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                            </div>
                            <div className="space-y-3">
                                {permissions.canChangeStatus && (
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        className="w-full bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                                        startContent={<CheckCircle size={16} />}
                                        onClick={() => setShowStatusModal(true)}
                                    >
                                        Update Status
                                    </Button>
                                )}

                                {permissions.canAssign && (
                                    <Button
                                        color="secondary"
                                        variant="flat"
                                        className="w-full bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"
                                        startContent={<UserPlus size={16} />}
                                        onClick={() => setShowAssignModal(true)}
                                    >
                                        Assign to Member
                                    </Button>
                                )}

                                {permissions.canEdit && (
                                    <Button
                                        color="warning"
                                        variant="flat"
                                        className="w-full bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30"
                                        startContent={<Edit size={16} />}
                                        onClick={() => setShowEditModal(true)}
                                    >
                                        Edit Task
                                    </Button>
                                )}

                                {task.status !== 'completed' && permissions.canChangeStatus && (
                                    <Button
                                        color="success"
                                        variant="flat"
                                        className="w-full bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                                        startContent={<CheckCircle size={16} />}
                                        onClick={() => {
                                            setEditStatus('completed');
                                            setEditProgress('100');
                                            handleStatusUpdate();
                                        }}
                                    >
                                        Mark Complete
                                    </Button>
                                )}
                            </div>
                        </div> */}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-white">Tags</h3>
                                </div>
                                <div>
                                    <div className="flex flex-wrap gap-2">
                                        {task.tags.map((tag: string, index: number) => (
                                            <Chip key={index} size="sm" variant="flat" className="bg-white/10 text-gray-300">
                                                {tag}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Update Modal */}
                <Modal 
                    isOpen={showStatusModal} 
                    onClose={() => setShowStatusModal(false)}
                    classNames={{
                        base: "bg-dashboard-secondary border border-white/20",
                        header: "border-b border-white/20",
                        body: "text-white",
                        footer: "border-t border-white/20"
                    }}
                >
                    <ModalContent>
                        <ModalHeader className="text-white">Update Task Status</ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-300 mb-2">
                                        Current Status: <span className="font-medium text-white">{task.status}</span>
                                    </p>
                                    <Select
                                        variant="bordered"
                                        label="New Status"
                                        selectedKeys={[editStatus]}
                                        onSelectionChange={(keys) => setEditStatus(Array.from(keys)[0] as string)}
                                        classNames={{
                                            trigger: "bg-dashboard-tertiary border-white/20 text-white",
                                            value: "text-white",
                                            label: "!text-white"
                                        }}
                                    >
                                        <SelectItem key="not_started" value="not_started">Not Started</SelectItem>
                                        <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                                        <SelectItem key="under_review" value="under_review">Under Review</SelectItem>
                                        <SelectItem key="completed" value="completed">Completed</SelectItem>
                                        <SelectItem key="on_hold" value="on_hold">On Hold</SelectItem>
                                    </Select>
                                </div>
                                
                                <Textarea
                                    variant="bordered"
                                    label="Reason for Status Change (Optional)"
                                    placeholder="Why are you changing the status?"
                                    value={statusReason}
                                    onValueChange={setStatusReason}
                                    minRows={3}
                                    classNames={{
                                        input: "bg-dashboard-tertiary text-white",
                                        inputWrapper: "bg-dashboard-tertiary border-white/20",
                                        label: "!text-white"
                                    }}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button 
                                variant="light" 
                                onClick={() => setShowStatusModal(false)}
                                className="text-gray-300 hover:text-white border border-white/20"
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="bg-action-primary text-white hover:bg-action-primary" 
                                onClick={handleStatusUpdate}
                            >
                                Update Status
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Assign Member Modal */}
                <Modal 
                    isOpen={showAssignModal} 
                    onClose={() => setShowAssignModal(false)}
                    classNames={{
                        base: "bg-dashboard-secondary border border-white/20",
                        header: "border-b border-white/20",
                        body: "text-white",
                        footer: "border-t border-white/20"
                    }}
                >
                    <ModalContent>
                        <ModalHeader className="text-white">Assign Task to Department Member</ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Select
                                    variant="bordered"
                                    label="Select Member"
                                    placeholder="Choose a department member"
                                    selectedKeys={assignedMember ? [assignedMember] : []}
                                    onSelectionChange={(keys) => setAssignedMember(Array.from(keys)[0] as string)}
                                    classNames={{
                                        trigger: "bg-dashboard-tertiary border-white/20 text-white",
                                        value: "text-white",
                                        label: "!text-white"
                                    }}
                                >
                                    {departmentUsers.map((user: any) => (
                                        <SelectItem key={user._id} value={user._id}>
                                            {user.firstName} {user.lastName} ({user.role})
                                        </SelectItem>
                                    ))}
                                </Select>
                                
                                <Textarea
                                    variant="bordered"
                                    label="Assignment Instructions (Optional)"
                                    placeholder="Provide specific instructions for the assigned member"
                                    value={assignmentInstructions}
                                    onValueChange={setAssignmentInstructions}
                                    minRows={3}
                                    classNames={{
                                        input: "bg-dashboard-tertiary text-white",
                                        inputWrapper: "bg-dashboard-tertiary border-white/20",
                                        label: "!text-white"
                                    }}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button 
                                variant="light" 
                                onClick={() => setShowAssignModal(false)}
                                className="text-gray-300 hover:text-white border border-white/20"
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="bg-action-primary text-white hover:bg-action-primary" 
                                onClick={handleAssignMember}
                                isDisabled={!assignedMember}
                            >
                                Assign Task
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Edit Task Modal */}
                <Modal 
                    isOpen={showEditModal} 
                    onClose={() => setShowEditModal(false)}
                    classNames={{
                        base: "bg-dashboard-secondary border border-white/20",
                        header: "border-b border-white/20",
                        body: "text-white",
                        footer: "border-t border-white/20"
                    }}
                >
                    <ModalContent>
                        <ModalHeader className="text-white">Edit Task</ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Input
                                    variant="bordered"
                                    label="Task Title"
                                    value={editTitle}
                                    onValueChange={setEditTitle}
                                    classNames={{
                                        input: "bg-dashboard-primary text-white",
                                        inputWrapper: "bg-dashboard-primary border-white/20",
                                        label: "!text-white"
                                    }}
                                />
                                
                                <Textarea
                                    variant="bordered"
                                    label="Description"
                                    value={editDescription}
                                    onValueChange={setEditDescription}
                                    minRows={4}
                                    classNames={{
                                        input: "bg-dashboard-primary text-white",
                                        inputWrapper: "bg-dashboard-primary border-white/20",
                                        label: "!text-white"
                                    }}
                                />
                                
                                <Select
                                    variant="bordered"
                                    label="Priority"
                                    selectedKeys={[editPriority]}
                                    onSelectionChange={(keys) => setEditPriority(Array.from(keys)[0] as string)}
                                    classNames={{
                                        trigger: "bg-dashboard-tertiary border-white/20 text-white",
                                        value: "text-white",
                                        label: "!text-white"
                                    }}
                                >
                                    <SelectItem key="low" value="low">Low</SelectItem>
                                    <SelectItem key="medium" value="medium">Medium</SelectItem>
                                    <SelectItem key="high" value="high">High</SelectItem>
                                    <SelectItem key="critical" value="critical">Critical</SelectItem>
                                </Select>
                                
                                <Input
                                    variant="bordered"
                                    type="date"
                                    label="Due Date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    classNames={{
                                        input: "bg-dashboard-tertiary text-white",
                                        inputWrapper: "bg-dashboard-tertiary border-white/20",
                                        label: "!text-white"
                                    }}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button 
                                variant="light" 
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-300 hover:text-white border border-white/20"
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="bg-action-primary text-white hover:bg-action-primary" 
                                onClick={handleUpdateTask}
                            >
                                Update Task
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Add Comment Modal */}
                <Modal 
                    isOpen={showCommentModal} 
                    onClose={() => {
                        setShowCommentModal(false);
                        setReplyingTo(null);
                        setComment('');
                    }}
                    classNames={{
                        base: "bg-dashboard-secondary border border-white/20",
                        header: "border-b border-white/20",
                        body: "text-white",
                        footer: "border-t border-white/20"
                    }}
                >
                    <ModalContent>
                        <ModalHeader className="text-white">
                            {replyingTo ? 'Reply to Comment' : 'Add Comment'}
                        </ModalHeader>
                        <ModalBody>
                            <Textarea
                                variant="bordered"
                                label="Your Comment"
                                placeholder="Write your comment here..."
                                value={comment}
                                onValueChange={setComment}
                                minRows={4}
                                classNames={{
                                    input: "bg-dashboard-tertiary text-white",
                                    inputWrapper: "bg-dashboard-tertiary border-white/20",
                                    label: "!text-white"
                                }}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button 
                                variant="light" 
                                onClick={() => {
                                    setShowCommentModal(false);
                                    setReplyingTo(null);
                                    setComment('');
                                }}
                                className="text-gray-300 hover:text-white border border-white/20"
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="bg-action-primary text-white hover:bg-action-primary" 
                                onClick={() => handleAddComment(replyingTo || undefined)}
                                isDisabled={!comment.trim()}
                            >
                                {replyingTo ? 'Reply' : 'Add Comment'}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default TaskDetails; 