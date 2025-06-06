import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, Form, useFetcher, useNavigate, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Leave, { LeaveStatus, LeaveTypes } from "~/modal/leave";
import { Card, CardBody } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import {
    CalendarDays,
    Clock,
    Users,
    TrendingUp,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Filter,
    Download,
    Plus
} from "lucide-react";
import AdminLayout from "~/layout/adminLayout";
import Drawer from "~/components/modal/drawer";

interface LeaveData {
    _id: string;
    employee: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        department: {
            name: string;
        };
    };
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: string;
    priority: string;
    submissionDate: string;
    approvalWorkflow: Array<{
        approver: {
            firstName: string;
            lastName: string;
        };
        approverRole: string;
        status: string;
        comments?: string;
        actionDate?: string;
    }>;
}

interface DashboardStats {
    totalApplications: number;
    pendingApprovals: number;
    approvedThisMonth: number;
    rejectedThisMonth: number;
    upcomingLeaves: number;
    onLeaveToday: number;
}

// export const loader: LoaderFunction = async ({ request }) => {
//     try {
//         const session = await getSession(request.headers.get("Cookie"));
//         const email = session.get("email");

//         if (!email) {
//             return redirect("/addentech-login");
//         }

//         const currentUser = await Registration.findOne({ email });
//         if (!currentUser) {
//             return redirect("/addentech-login");
//         }

//         // Get URL parameters for filtering
//         const url = new URL(request.url);
//         const status = url.searchParams.get("status") || "all";
//         const leaveType = url.searchParams.get("leaveType") || "all";
//         const department = url.searchParams.get("department") || "all";

//         // Build query based on user role and filters
//         let leaveQuery: any = {};
        
//         // Role-based access control similar to attendance
//         const isAdmin = ['admin', 'manager'].includes(currentUser.role);
//         const isDepartmentHead = currentUser.role === 'department_head';
        
//         if (!isAdmin && !isDepartmentHead) {
//             // Regular users can only see their own leave applications
//             leaveQuery.employee = currentUser._id;
//         } else if (isDepartmentHead && !isAdmin) {
//             // Department heads can see leaves from their department
//             leaveQuery.department = currentUser.department;
//         }
//         // Admins and managers can see all leaves (no additional filter)

//         if (status !== "all") {
//             leaveQuery.status = status;
//         }

//         if (leaveType !== "all") {
//             leaveQuery.leaveType = leaveType;
//         }

//         if (department !== "all" && isAdmin) {
//             leaveQuery.department = department;
//         }

//         // Get leave applications
//         // const leaves = await Leave.find(leaveQuery)
//         //     .populate({
//         //         path: 'employee',
//         //         select: 'firstName lastName email department',
//         //         populate: {
//         //             path: 'department',
//         //             select: 'name'
//         //         }
//         //     })
//         //     .populate({
//         //         path: 'approvalWorkflow.approver',
//         //         select: 'firstName lastName'
//         //     })
//         //     .sort({ submissionDate: -1 })
//         //     .limit(50);

//         // Calculate dashboard statistics
//         const today = new Date();
//         const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//         const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

//         const baseStatsQuery = !isAdmin && !isDepartmentHead 
//             ? { employee: currentUser._id }
//             : isDepartmentHead && !isAdmin 
//                 ? { department: currentUser.department }
//                 : {};

//         const [
//             totalApplications,
//             pendingApprovals,
//             approvedThisMonth,
//             rejectedThisMonth,
//             upcomingLeaves,
//             onLeaveToday
//         ] = await Promise.all([
//             Leave.countDocuments(baseStatsQuery),
//             Leave.countDocuments({
//                 ...baseStatsQuery,
//                 status: LeaveStatus.PENDING
//             }),
//             Leave.countDocuments({
//                 ...baseStatsQuery,
//                 status: LeaveStatus.APPROVED,
//                 submissionDate: { $gte: startOfMonth, $lte: endOfMonth }
//             }),
//             Leave.countDocuments({
//                 ...baseStatsQuery,
//                 status: LeaveStatus.REJECTED,
//                 submissionDate: { $gte: startOfMonth, $lte: endOfMonth }
//             }),
//             Leave.countDocuments({
//                 ...baseStatsQuery,
//                 status: LeaveStatus.APPROVED,
//                 startDate: { $gt: today }
//             }),
//             Leave.countDocuments({
//                 ...baseStatsQuery,
//                 status: LeaveStatus.APPROVED,
//                 startDate: { $lte: today },
//                 endDate: { $gte: today }
//             })
//         ]);

//         const stats: DashboardStats = {
//             totalApplications,
//             pendingApprovals,
//             approvedThisMonth,
//             rejectedThisMonth,
//             upcomingLeaves,
//             onLeaveToday
//         };

//         // Get departments for filter (admin only)
//         let departments = [];
//         if (isAdmin) {
//             try {
//                 const response = await fetch(`${url.origin}/api/departments`);
//                 if (response.ok) {
//                     const result = await response.json();
//                     departments = result.data || [];
//                 }
//             } catch (error) {
//                 console.error("Error fetching departments:", error);
//             }
//         }

//         return json({
//             // leaves,
//             stats,
//             currentUser: {
//                 id: currentUser._id,
//                 firstName: currentUser.firstName,
//                 lastName: currentUser.lastName,
//                 email: currentUser.email,
//                 role: currentUser.role,
//                 department: currentUser.department
//             },
//             isAdmin,
//             isDepartmentHead,
//             departments,
//             filters: { status, leaveType, department }
//         });

//     } catch (error) {
//         console.error("Error loading leave dashboard:", error);
//         throw new Response("Internal Server Error", { status: 500 });
//     }
// };

export const action: ActionFunction = async ({ request }) => {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const email = session.get("email");

        const user = await Registration.findOne({ email });
        if (!user || !['admin', 'manager', 'department_head'].includes(user.role)) {
            return json({ error: "Forbidden" }, { status: 403 });
        }

        const formData = await request.formData();
        const action = formData.get("_action") as string;
        const leaveId = formData.get("leaveId") as string;

        // const leave = await Leave.findById(leaveId);
        // if (!leave) {
        //     return json({ error: "Leave application not found" }, { status: 404 });
        // }

        switch (action) {
            case "approve":
                const approveComments = formData.get("comments") as string;
                    // await leave.approve(user._id.toString(), approveComments);
                return json({ success: "Leave approved successfully" });

            case "reject":
                const rejectComments = formData.get("comments") as string;
                if (!rejectComments) {
                    return json({ error: "Comments required for rejection" }, { status: 400 });
                }
                // await leave.reject(user._id.toString(), rejectComments);
                return json({ success: "Leave rejected successfully" });

            default:
                return json({ error: "Invalid action" }, { status: 400 });
        }

    } catch (error) {
        console.error("Error processing leave action:", error);
        return json({ error: "Failed to process leave action" }, { status: 500 });
    }
};

export default function LeaveDashboard() {
    // const { leaves, stats, currentUser, isAdmin, isDepartmentHead, departments, filters } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const navigate = useNavigate();

    const [selectedLeave, setSelectedLeave] = useState<LeaveData | null>(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');

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
            case 'medium': return 'text-blue-600';
            case 'low': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const handleApprovalAction = (leave: LeaveData, action: 'approve' | 'reject') => {
        setSelectedLeave(leave);
        setApprovalAction(action);
        setShowApprovalModal(true);
    };

    const submitApproval = () => {
        if (!selectedLeave) return;

        const formData = new FormData();
        formData.append("_action", approvalAction);
        formData.append("leaveId", selectedLeave._id);
        formData.append("comments", (document.getElementById("approval-comments") as HTMLTextAreaElement)?.value || "");

        fetcher.submit(formData, { method: "post" });
        setShowApprovalModal(false);
        setSelectedLeave(null);
    };

    // const exportToCSV = () => {
    //     const csvContent = [
    //         ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Submitted'].join(','),
    //         ...leaves.map((leave: LeaveData) => [
    //             `${leave.employee.firstName} ${leave.employee.lastName}`,
    //             leave.leaveType,
    //             formatDate(leave.startDate),
    //             formatDate(leave.endDate),
    //             leave.totalDays,
    //             leave.status,
    //             formatDate(leave.submissionDate)
    //         ].join(','))
    //     ].join('\n');

    //     const blob = new Blob([csvContent], { type: 'text/csv' });
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = `leave-applications-${new Date().toISOString().split('T')[0]}.csv`;
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    // };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                                    <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Leave Management Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {/* {isAdmin 
                            ? "Manage employee leave applications and approvals" 
                            : isDepartmentHead 
                                ? "Manage department leave applications and approvals"
                                : "View your leave applications and history"
                        } */}
                    </p>
                    {/* {currentUser && (
                        <p className="text-gray-600 mt-1">
                            Welcome, {currentUser.firstName} {currentUser.lastName} | Role: {currentUser.role}
                        </p>
                    )} */}
                </div>
                    <div className="flex gap-3">
                        {/* {isAdmin && (
                            <Button
                                color="primary"
                                startContent={<Download size={16} />}
                                onClick={exportToCSV}
                            >
                                Export CSV
                            </Button>
                        )} */}
                      <Link to="/employee-leave-application">
                      <Button
                            color="success"
                            startContent={<Plus size={16} />}
                            // onClick={() => navigate('/employee-leave-application')}
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
                                    {/* <p className="text-2xl font-bold">{stats.totalApplications}</p> */}
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
                                    {/* <p className="text-2xl font-bold">{stats.pendingApprovals}</p> */}
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
                                    {/* <p className="text-2xl font-bold">{stats.approvedThisMonth}</p> */}
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
                                    {/* <p className="text-2xl font-bold">{stats.rejectedThisMonth}</p> */}
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
                                    {/* <p className="text-2xl font-bold">{stats.upcomingLeaves}</p> */}
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
                                    {/* <p className="text-2xl font-bold">{stats.onLeaveToday}</p> */}
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
                                    // defaultSelectedKeys={[filters.status]}
                                >
                                    <SelectItem key="all" value="all">All Status</SelectItem>
                                    <SelectItem key="pending" value="pending">Pending</SelectItem>
                                    <SelectItem key="approved" value="approved">Approved</SelectItem>
                                    <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
                                </Select>

                                {/* <Select
                                    name="leaveType"
                                    label="Leave Type"
                                    size="sm"
                                    className="w-40"
                                    defaultSelectedKeys={[filters.leaveType]}
                                >
                                    <SelectItem key="all" value="all">All Types</SelectItem>
                                    {Object.values(LeaveTypes).map(type => (
                                        <SelectItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </SelectItem>
                                    ))}
                                </Select> */}

                                {/* {isAdmin && (
                                    <Select
                                        name="department"
                                        label="Department"
                                        size="sm"
                                        className="w-40"
                                        defaultSelectedKeys={[filters.department]}
                                    >
                                        <SelectItem key="all" value="all">All Departments</SelectItem>
                                        {departments.map((dept: any) => (
                                            <SelectItem key={dept._id} value={dept._id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )} */}

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
                                    {/* {leaves.map((leave: LeaveData) => (
                                        <tr key={leave._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium">
                                                        {leave.employee.firstName} {leave.employee.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {leave.employee.department?.name}
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
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                                                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                                </span>
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
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        startContent={<Eye size={14} />}
                                                        onClick={() => navigate(`/admin/leave/${leave._id}`)}
                                                    >
                                                        View
                                                    </Button>

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
                                    ))} */}
                                </tbody>
                            </table>
                        </div>

                        {/* {leaves.length === 0 && (
                            <div className="text-center py-8">
                                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">No leave applications found</p>
                            </div>
                        )} */}
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
                {showApprovalModal && selectedLeave && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md mx-4">
                            <CardBody className="p-6">
                                <h3 className="text-lg font-bold mb-4">
                                    {approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Application
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Employee:</p>
                                        <p className="font-medium">
                                            {selectedLeave.employee.firstName} {selectedLeave.employee.lastName}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Leave Type:</p>
                                        <p className="font-medium capitalize">{selectedLeave.leaveType}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Duration:</p>
                                        <p className="font-medium">
                                            {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                                            ({selectedLeave.totalDays} days)
                                        </p>
                                    </div>

                                    <Textarea
                                        id="approval-comments"
                                        label={`Comments ${approvalAction === 'reject' ? '(Required)' : '(Optional)'}`}
                                        placeholder={`Enter your ${approvalAction} comments...`}
                                        minRows={3}
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        color="default"
                                        variant="light"
                                        onClick={() => setShowApprovalModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color={approvalAction === 'approve' ? 'success' : 'danger'}
                                        onClick={submitApproval}
                                    >
                                        {approvalAction === 'approve' ? 'Approve' : 'Reject'}
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}