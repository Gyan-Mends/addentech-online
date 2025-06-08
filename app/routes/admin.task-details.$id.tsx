import { Card, CardHeader, CardBody, Button, Input, Select, SelectItem, Textarea, Progress, Chip, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Divider, Tabs, Tab } from "@nextui-org/react";
import { Form, Link, useLoaderData, useActionData, useSubmit, useNavigate } from "@remix-run/react";
import { ArrowLeft, Edit, MessageSquare, Clock, Users, Calendar, Tag, FileText, CheckCircle, AlertTriangle, Timer, Paperclip, Send, Save } from "lucide-react";
import { json, LoaderFunction, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { TaskController } from "~/controller/task";
import Registration from "~/modal/registration";
import { useState, useEffect } from "react";
import AdminLayout from "~/layout/adminLayout";

// Loader function to fetch task details
export const loader: LoaderFunction = async ({ request, params }: LoaderFunctionArgs) => {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        const taskId = params.id;
        if (!taskId) {
            return redirect("/admin/task-management");
        }

        // Get current user information for role-based access
        const currentUser = await Registration.findOne({ email: userId });
        if (!currentUser) {
            return redirect("/addentech-login");
        }

        // Get task details using TaskController
        const task = await TaskController.getTaskById(taskId, userId);
        
        if (!task) {
            return redirect("/admin/task-management");
        }

        return json({
            task,
            currentUser: {
                id: currentUser._id,
                email: currentUser.email,
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                role: currentUser.role,
                department: currentUser.department
            }
        });
    } catch (error: any) {
        console.error('Error loading task details:', error);
        return redirect("/admin/task-management");
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
                const result = await TaskController.updateTask(
                    taskId,
                    { status: newStatus as any },
                    userId
                );
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
                const mentions = JSON.parse(formData.get('mentions') as string || '[]');
                const commentResult = await TaskController.addComment(
                    taskId,
                    message,
                    userId,
                    mentions
                );
                return json(commentResult);

            case 'logTime':
                const hours = parseFloat(formData.get('hours') as string);
                const description = formData.get('description') as string;
                const date = new Date(formData.get('date') as string || new Date());
                const timeResult = await TaskController.addTimeEntry(
                    taskId,
                    hours,
                    description,
                    userId,
                    date
                );
                return json(timeResult);

            default:
                return json({ success: false, message: "Invalid action" });
        }
    } catch (error: any) {
        console.error('Error in task action:', error);
        return json({ success: false, message: `Action failed: ${error?.message || error}` });
    }
}

const TaskDetails = () => {
    const { task, currentUser } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const submit = useSubmit();
    const navigate = useNavigate();

    // Modal states
    const { isOpen: isCommentOpen, onOpen: onCommentOpen, onClose: onCommentClose } = useDisclosure();
    const { isOpen: isTimeOpen, onOpen: onTimeOpen, onClose: onTimeClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    // Form states
    const [comment, setComment] = useState('');
    const [timeHours, setTimeHours] = useState('');
    const [timeDescription, setTimeDescription] = useState('');
    const [timeDate, setTimeDate] = useState(new Date().toISOString().split('T')[0]);
    const [editStatus, setEditStatus] = useState(task?.status || '');
    const [editProgress, setEditProgress] = useState(task?.progress?.toString() || '0');

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

    const canEdit = () => {
        if (currentUser?.role === 'admin' || currentUser?.role === 'manager') return true;
        if (currentUser?.role === 'department_head' && task?.department._id === currentUser?.department) return true;
        if (currentUser?.role === 'staff') {
            const isAssigned = task?.assignedTo?.some((assignee: any) => assignee._id === currentUser?.id);
            const isCreator = task?.createdBy._id === currentUser?.id;
            return isAssigned || isCreator;
        }
        return false;
    };

    // Action handlers
    const handleStatusUpdate = () => {
        const formData = new FormData();
        formData.set('_action', 'updateStatus');
        formData.set('status', editStatus);
        submit(formData, { method: 'POST' });
        onEditClose();
    };

    const handleProgressUpdate = () => {
        const formData = new FormData();
        formData.set('_action', 'updateProgress');
        formData.set('progress', editProgress);
        submit(formData, { method: 'POST' });
        onEditClose();
    };

    const handleCommentSubmit = () => {
        if (!comment.trim()) return;

        const formData = new FormData();
        formData.set('_action', 'addComment');
        formData.set('message', comment);
        formData.set('mentions', JSON.stringify([])); // TODO: Implement mention parsing
        submit(formData, { method: 'POST' });
        setComment('');
        onCommentClose();
    };

    const handleTimeSubmit = () => {
        if (!timeHours || parseFloat(timeHours) <= 0) return;

        const formData = new FormData();
        formData.set('_action', 'logTime');
        formData.set('hours', timeHours);
        formData.set('description', timeDescription);
        formData.set('date', timeDate);
        submit(formData, { method: 'POST' });
        setTimeHours('');
        setTimeDescription('');
        setTimeDate(new Date().toISOString().split('T')[0]);
        onTimeClose();
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Action Messages */}
                {actionData?.success && (
                    <Card className="border-success-200 bg-success-50">
                        <CardBody>
                            <p className="text-success-700">{actionData.message}</p>
                        </CardBody>
                    </Card>
                )}

                {actionData && !actionData.success && (
                    <Card className="border-danger-200 bg-danger-50">
                        <CardBody>
                            <p className="text-danger-700">{actionData.message}</p>
                        </CardBody>
                    </Card>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="light"
                            startContent={<ArrowLeft size={16} />}
                            onClick={() => navigate('/admin/task-management')}
                        >
                            Back to Tasks
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Task Details
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {task?.title}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {canEdit() && (
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<Edit size={16} />}
                                onClick={onEditOpen}
                            >
                                Edit
                            </Button>
                        )}
                        <Button
                            color="primary"
                            startContent={<MessageSquare size={16} />}
                            onClick={onCommentOpen}
                        >
                            Comment
                        </Button>
                        <Button
                            color="success"
                            variant="flat"
                            startContent={<Timer size={16} />}
                            onClick={onTimeOpen}
                        >
                            Log Time
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Task Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Task Overview */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between w-full">
                                    <h3 className="text-lg font-semibold">{task?.title}</h3>
                                    <div className="flex gap-2">
                                        <Chip
                                            color={getStatusColor(task?.status)}
                                            variant="flat"
                                        >
                                            {task?.status?.replace('_', ' ')}
                                        </Chip>
                                        <Chip
                                            color={getPriorityColor(task?.priority)}
                                            variant="flat"
                                        >
                                            {task?.priority}
                                        </Chip>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                                    <p className="text-gray-600">{task?.description}</p>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-gray-700">Progress</h4>
                                        <span className="text-sm text-gray-600">{task?.progress || 0}%</span>
                                    </div>
                                    <Progress
                                        value={task?.progress || 0}
                                        color={task?.progress === 100 ? "success" : "primary"}
                                        className="w-full"
                                    />
                                </div>

                                {/* Tags */}
                                {task?.tags && task.tags.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {task.tags.map((tag: string, index: number) => (
                                                <Chip key={index} size="sm" variant="flat" startContent={<Tag size={12} />}>
                                                    {tag}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Dates */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {task?.startDate && (
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-1">Start Date</h4>
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Calendar size={14} />
                                                {formatSimpleDate(task.startDate)}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-1">Due Date</h4>
                                        <p className={`flex items-center gap-1 ${isOverdue(task?.dueDate, task?.status) ? 'text-red-600' : 'text-gray-600'}`}>
                                            <Calendar size={14} />
                                            {formatSimpleDate(task?.dueDate)}
                                            {isOverdue(task?.dueDate, task?.status) && (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                                    Overdue
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Comments and Time Tracking */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold">Activity</h3>
                            </CardHeader>
                            <CardBody>
                                <Tabs aria-label="Activity tabs">
                                    <Tab key="comments" title={`Comments (${task?.comments?.length || 0})`}>
                                        <div className="space-y-4">
                                            {task?.comments && task.comments.length > 0 ? (
                                                task.comments.map((comment: any, index: number) => (
                                                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <Avatar
                                                            name={`${comment.user.firstName} ${comment.user.lastName}`}
                                                            size="sm"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-sm">
                                                                    {comment.user.firstName} {comment.user.lastName}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {formatDate(comment.timestamp)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700">{comment.message}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">No comments yet</p>
                                            )}
                                        </div>
                                    </Tab>
                                    <Tab key="time" title={`Time Logs (${task?.timeEntries?.length || 0})`}>
                                        <div className="space-y-4">
                                            {task?.timeEntries && task.timeEntries.length > 0 ? (
                                                task.timeEntries.map((entry: any, index: number) => (
                                                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <Clock size={14} className="text-blue-600" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-sm">
                                                                    {entry.user.firstName} {entry.user.lastName}
                                                                </span>
                                                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                                                    {entry.hours}h
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {formatDate(entry.date)}
                                                                </span>
                                                            </div>
                                                            {entry.description && (
                                                                <p className="text-sm text-gray-700">{entry.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">No time entries yet</p>
                                            )}
                                        </div>
                                    </Tab>
                                </Tabs>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Task Info */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold">Task Information</h3>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Category</h4>
                                    <p className="text-gray-600">{task?.category}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Department</h4>
                                    <p className="text-gray-600">{task?.department?.name}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Created By</h4>
                                    <div className="flex items-center gap-2">
                                        <Avatar
                                            name={`${task?.createdBy?.firstName} ${task?.createdBy?.lastName}`}
                                            size="sm"
                                        />
                                        <span className="text-sm">
                                            {task?.createdBy?.firstName} {task?.createdBy?.lastName}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Assigned To</h4>
                                    <div className="space-y-2">
                                        {task?.assignedTo && task.assignedTo.length > 0 ? (
                                            task.assignedTo.map((assignee: any, index: number) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Avatar
                                                        name={`${assignee.firstName} ${assignee.lastName}`}
                                                        size="sm"
                                                    />
                                                    <span className="text-sm">
                                                        {assignee.firstName} {assignee.lastName}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm">No assignees</p>
                                        )}
                                    </div>
                                </div>

                                <Divider />

                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Time Tracking</h4>
                                    <div className="space-y-1 text-sm">
                                        {task?.estimatedHours && (
                                            <p className="text-gray-600">
                                                Estimated: {task.estimatedHours}h
                                            </p>
                                        )}
                                        <p className="text-gray-600">
                                            Actual: {task?.actualHours || 0}h
                                        </p>
                                        {task?.estimatedHours && (
                                            <p className={`${(task?.actualHours || 0) > task.estimatedHours ? 'text-red-600' : 'text-green-600'}`}>
                                                {(task?.actualHours || 0) > task.estimatedHours ? 'Over' : 'Under'} by {Math.abs((task?.actualHours || 0) - task.estimatedHours)}h
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Created</h4>
                                    <p className="text-gray-600 text-sm">{formatDate(task?.createdAt)}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Last Updated</h4>
                                    <p className="text-gray-600 text-sm">{formatDate(task?.updatedAt)}</p>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold">Quick Actions</h3>
                            </CardHeader>
                            <CardBody className="space-y-3">
                                {canEdit() && (
                                    <>
                                        <Button
                                            color="primary"
                                            variant="flat"
                                            className="w-full"
                                            startContent={<Edit size={16} />}
                                            onClick={onEditOpen}
                                        >
                                            Edit Task
                                        </Button>
                                        <Button
                                            color="success"
                                            variant="flat"
                                            className="w-full"
                                            startContent={<CheckCircle size={16} />}
                                            onClick={() => {
                                                setEditStatus('completed');
                                                setEditProgress('100');
                                                handleStatusUpdate();
                                            }}
                                            isDisabled={task?.status === 'completed'}
                                        >
                                            Mark Complete
                                        </Button>
                                    </>
                                )}
                                <Button
                                    color="primary"
                                    className="w-full"
                                    startContent={<MessageSquare size={16} />}
                                    onClick={onCommentOpen}
                                >
                                    Add Comment
                                </Button>
                                <Button
                                    color="warning"
                                    variant="flat"
                                    className="w-full"
                                    startContent={<Timer size={16} />}
                                    onClick={onTimeOpen}
                                >
                                    Log Time
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose}>
                    <ModalContent>
                        <ModalHeader>
                            <h3 className="text-lg font-bold">Edit Task</h3>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Select
                                    label="Status"
                                    selectedKeys={[editStatus]}
                                    onSelectionChange={(keys) => setEditStatus(Array.from(keys)[0] as string)}
                                >
                                    <SelectItem key="not_started" value="not_started">Not Started</SelectItem>
                                    <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                                    <SelectItem key="under_review" value="under_review">Under Review</SelectItem>
                                    <SelectItem key="completed" value="completed">Completed</SelectItem>
                                    <SelectItem key="on_hold" value="on_hold">On Hold</SelectItem>
                                </Select>
                                
                                <Input
                                    type="number"
                                    label="Progress (%)"
                                    value={editProgress}
                                    onValueChange={setEditProgress}
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onEditClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={handleStatusUpdate}>
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Comment Modal */}
                <Modal isOpen={isCommentOpen} onClose={onCommentClose}>
                    <ModalContent>
                        <ModalHeader>
                            <h3 className="text-lg font-bold">Add Comment</h3>
                        </ModalHeader>
                        <ModalBody>
                            <Textarea
                                label="Comment"
                                placeholder="Enter your comment..."
                                value={comment}
                                onValueChange={setComment}
                                minRows={3}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onCommentClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={handleCommentSubmit} startContent={<Send size={16} />}>
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
                                    type="number"
                                    label="Hours"
                                    placeholder="0.5"
                                    value={timeHours}
                                    onValueChange={setTimeHours}
                                    step="0.25"
                                    min="0"
                                />
                                <Input
                                    type="date"
                                    label="Date"
                                    value={timeDate}
                                    onChange={(e) => setTimeDate(e.target.value)}
                                />
                                <Textarea
                                    label="Description (Optional)"
                                    placeholder="What did you work on?"
                                    value={timeDescription}
                                    onValueChange={setTimeDescription}
                                    minRows={3}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onTimeClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={handleTimeSubmit} startContent={<Save size={16} />}>
                                Log Time
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default TaskDetails; 