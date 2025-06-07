import { Card, CardHeader, CardBody, CardFooter, Button, Input, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea, Chip } from "@nextui-org/react";
import { Form, Link, useLoaderData, useActionData, useFetcher, useSubmit } from "@remix-run/react";
import { CalendarDays, CheckCircle, Clock, Filter, Plus, TrendingUp, Users, XCircle, Eye, Download, AlertCircle } from "lucide-react";
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { LeaveController } from "~/controller/leave";
import { useState, useEffect } from "react";
import AdminLayout from "~/layout/adminLayout";

// Loader function to fetch leave data
export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        const url = new URL(request.url);
        const filters = {
            status: url.searchParams.get('status') || 'all',
            leaveType: url.searchParams.get('leaveType') || 'all',
            department: url.searchParams.get('department') || 'all',
            page: parseInt(url.searchParams.get('page') || '1'),
            limit: parseInt(url.searchParams.get('limit') || '10')
        };

        const { leaves, total, stats } = await LeaveController.getLeaves(filters);
        
        return json({ 
            leaves, 
            total, 
            stats, 
            filters,
            currentUser: { id: userId },
            success: url.searchParams.get('success')
        });
    } catch (error) {
        console.error('Error loading leave data:', error);
        return json({ 
            leaves: [], 
            total: 0, 
            stats: {}, 
            filters: { status: 'all', leaveType: 'all', department: 'all' },
            currentUser: null,
            error: "Failed to load leave data"
        });
    }
}

// Action function to handle approvals/rejections
export async function action({ request }: ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        const action = formData.get('_action') as string;
        const leaveId = formData.get('leaveId') as string;
        const status = formData.get('status') as 'approved' | 'rejected';
        const comments = formData.get('comments') as string;

        if (action === 'updateStatus') {
            formData.set('_method', 'PUT');
            
            const response = await fetch(`${request.url.origin}/api/leaves`, {
                method: 'POST',
                headers: {
                    'Cookie': request.headers.get('Cookie') || ''
                },
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                return json({ success: true, message: result.message });
            } else {
                return json({ success: false, error: result.error });
            }
        }

        return json({ success: false, error: "Invalid action" });
    } catch (error) {
        console.error('Error in action:', error);
        return json({ success: false, error: "Action failed" });
    }
}

const LeaveManagement = () => {
    const { leaves, total, stats, filters, currentUser, success, error } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const submit = useSubmit();
    const [selectedLeave, setSelectedLeave] = useState<any>(null);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
    const [comments, setComments] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();

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
            case 'approved': return 'text-green-600 bg-green-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600';
            case 'high': return 'text-orange-600';
            case 'normal': return 'text-blue-600';
            case 'low': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const handleApprovalAction = (leave: any, action: 'approve' | 'reject') => {
        setSelectedLeave(leave);
        setApprovalAction(action);
        setComments('');
        onOpen();
    };

    const handleSubmitApproval = () => {
        if (!selectedLeave || !approvalAction) return;

        const formData = new FormData();
        formData.set('_action', 'updateStatus');
        formData.set('leaveId', selectedLeave._id);
        formData.set('status', approvalAction);
        formData.set('comments', comments);

        submit(formData, { method: 'POST' });
        onClose();
    };

    const exportToCSV = () => {
        const params = new URLSearchParams({
            status: filters.status,
            leaveType: filters.leaveType,
            department: filters.department
        });
        
        window.open(`/api/leaves/export?${params.toString()}`, '_blank');
    };

    return (
        <AdminLayout>
              <div className="p-6 space-y-6">
                {/* Success/Error Messages */}
                {success && (
                    <Card className="border-success-200 bg-success-50">
                        <CardBody>
                            <p className="text-success-700">{success}</p>
                        </CardBody>
                    </Card>
                )}
                
                {(error || actionData?.error) && (
                    <Card className="border-danger-200 bg-danger-50">
                        <CardBody>
                            <p className="text-danger-700">{error || actionData?.error}</p>
                        </CardBody>
                    </Card>
                )}

                {actionData?.success && (
                    <Card className="border-success-200 bg-success-50">
                        <CardBody>
                            <p className="text-success-700">{actionData.message}</p>
                        </CardBody>
                    </Card>
                )}

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Leave Management Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Manage employee leave applications and approvals
                        </p>
                        {currentUser && (
                            <p className="text-gray-600 mt-1">
                                Total Applications: {total} | Active Filters Applied
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            color="primary"
                            startContent={<Download size={16} />}
                            onClick={exportToCSV}
                        >
                            Export CSV
                        </Button>
                        <Link to="/employee-leave-application">
                            <Button
                                color="success"
                                startContent={<Plus size={16} />}
                            >
                                New Leave Application
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90">Total Applications</p>
                                    <p className="text-2xl font-bold">{stats.totalApplications || 0}</p>
                                </div>
                                <CalendarDays size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90">Pending Approvals</p>
                                    <p className="text-2xl font-bold">{stats.pendingApprovals || 0}</p>
                                </div>
                                <Clock size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90">Approved This Month</p>
                                    <p className="text-2xl font-bold">{stats.approvedThisMonth || 0}</p>
                                </div>
                                <CheckCircle size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-red-500 to-red-600">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90">Rejected This Month</p>
                                    <p className="text-2xl font-bold">{stats.rejectedThisMonth || 0}</p>
                                </div>
                                <XCircle size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90">Upcoming Leaves</p>
                                    <p className="text-2xl font-bold">{stats.upcomingLeaves || 0}</p>
                                </div>
                                <TrendingUp size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90">On Leave Today</p>
                                    <p className="text-2xl font-bold">{stats.onLeaveToday || 0}</p>
                                </div>
                                <Users size={24} />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Role-based access message */}
                {/* {!isAdmin && !isDepartmentHead && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-blue-700">
                            <span className="font-bold">Note:</span> You are viewing your personal leave applications and history.
                        </p>
                    </div>
                )} */}

                {/* Filters */}
                <Card>
                    <CardBody>
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex items-center gap-2">
                                <Filter size={16} />
                                <span className="text-sm font-medium">Filters:</span>
                            </div>

                            <Form method="get" className="flex flex-wrap gap-4">
                                <Select
                                    name="status"
                                    label="Status"
                                    size="sm"
                                    className="w-40"
                                    defaultSelectedKeys={[filters.status]}
                                >
                                    <SelectItem key="all" value="all">All Status</SelectItem>
                                    <SelectItem key="pending" value="pending">Pending</SelectItem>
                                    <SelectItem key="approved" value="approved">Approved</SelectItem>
                                    <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
                                </Select>

                                <Select
                                    name="leaveType"
                                    label="Leave Type"
                                    size="sm"
                                    className="w-40"
                                    defaultSelectedKeys={[filters.leaveType]}
                                >
                                    <SelectItem key="all" value="all">All Types</SelectItem>
                                    <SelectItem key="annual" value="annual">Annual</SelectItem>
                                    <SelectItem key="sick" value="sick">Sick</SelectItem>
                                    <SelectItem key="maternity" value="maternity">Maternity</SelectItem>
                                    <SelectItem key="paternity" value="paternity">Paternity</SelectItem>
                                    <SelectItem key="emergency" value="emergency">Emergency</SelectItem>
                                    <SelectItem key="bereavement" value="bereavement">Bereavement</SelectItem>
                                    <SelectItem key="personal" value="personal">Personal</SelectItem>
                                    <SelectItem key="study" value="study">Study</SelectItem>
                                </Select>

                                <Button type="submit" color="primary" size="sm">
                                    Apply Filters
                                </Button>
                            </Form>
                        </div>
                    </CardBody>
                </Card>

                {/* Leave Applications Table */}
                <Card>
                    <CardBody>
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3">Employee</th>
                                        <th className="text-left p-3">Leave Type</th>
                                        <th className="text-left p-3">Duration</th>
                                        <th className="text-left p-3">Days</th>
                                        <th className="text-left p-3">Status</th>
                                        <th className="text-left p-3">Priority</th>
                                        <th className="text-left p-3">Submitted</th>
                                        <th className="text-left p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((leave: any) => (
                                        <tr key={leave._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium">
                                                        {leave.employee?.firstName} {leave.employee?.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {leave.department?.name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="capitalize">{leave.leaveType}</span>
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    <p className="text-sm">{formatDate(leave.startDate)}</p>
                                                    <p className="text-sm text-gray-600">to {formatDate(leave.endDate)}</p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="font-medium">{leave.totalDays} days</span>
                                            </td>
                                            <td className="p-3">
                                                <Chip
                                                    size="sm"
                                                    color={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'}
                                                    variant="flat"
                                                >
                                                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                                </Chip>
                                            </td>
                                            <td className="p-3">
                                                <span className={`font-medium capitalize ${getPriorityColor(leave.priority)}`}>
                                                    {leave.priority}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className="text-sm">{formatDate(leave.submissionDate)}</span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Link to={`/admin/leave/${leave._id}`}>
                                                        <Button
                                                            size="sm"
                                                            variant="light"
                                                            startContent={<Eye size={14} />}
                                                        >
                                                            View
                                                        </Button>
                                                    </Link>

                                                    {leave.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                color="success"
                                                                variant="light"
                                                                startContent={<CheckCircle size={14} />}
                                                                onClick={() => handleApprovalAction(leave, 'approve')}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                color="danger"
                                                                variant="light"
                                                                startContent={<XCircle size={14} />}
                                                                onClick={() => handleApprovalAction(leave, 'reject')}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {leaves.length === 0 && (
                            <div className="text-center py-8">
                                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">No leave applications found</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Try adjusting your filters or check back later
                                </p>
                            </div>
                        )}
                    </CardBody>
                </Card>


                {/* <Drawer
                    isOpen={showApprovalModal}
                    onClose={() => setShowApprovalModal(false)}
                    title="Leave Application"
                    placement="right"
                    size="lg"
                >
                    <div className="p-6">
                        <h3 className="text-lg font-bold mb-4">
                            {approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Application
                        </h3>
                    </div>
                </Drawer> */}

                {/* Approval Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalContent>
                        <ModalHeader>
                            <h3 className="text-lg font-bold">
                                {approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Application
                            </h3>
                        </ModalHeader>
                        <ModalBody>
                            {selectedLeave && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">Application Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Employee:</span>
                                                <p className="font-medium">
                                                    {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Leave Type:</span>
                                                <p className="font-medium capitalize">{selectedLeave.leaveType}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Duration:</span>
                                                <p className="font-medium">
                                                    {formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Total Days:</span>
                                                <p className="font-medium">{selectedLeave.totalDays} days</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <span className="text-gray-600">Reason:</span>
                                            <p className="font-medium">{selectedLeave.reason}</p>
                                        </div>
                                    </div>

                                    <Textarea
                                        label={`${approvalAction === 'approve' ? 'Approval' : 'Rejection'} Comments`}
                                        placeholder={`Add your ${approvalAction === 'approve' ? 'approval' : 'rejection'} comments here...`}
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        minRows={3}
                                    />
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color={approvalAction === 'approve' ? 'success' : 'danger'}
                                onPress={handleSubmitApproval}
                            >
                                {approvalAction === 'approve' ? 'Approve' : 'Reject'} Application
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                
            </div>
        </AdminLayout>
    )
}

export default LeaveManagement;