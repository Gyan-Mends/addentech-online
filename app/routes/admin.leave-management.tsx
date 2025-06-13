import { Card, CardHeader, CardBody, CardFooter, Button, Input, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea, Chip, DatePicker } from "@nextui-org/react";
import { Form, Link, useLoaderData, useActionData, useFetcher, useSubmit } from "@remix-run/react";
import { CalendarDays, CheckCircle, Clock, Filter, Plus, TrendingUp, Users, XCircle, Eye, Download, AlertCircle, Search, Calendar } from "lucide-react";
import { json, LoaderFunction, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { LeaveController } from "~/controller/leave";
import Registration from "~/modal/registration";
import Department from "~/modal/department";
import { useState, useEffect } from "react";
import AdminLayout from "~/layout/adminLayout";
import LineChart from "~/components/ui/LineChart";

// Loader function to fetch leave data
export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
    try {
        console.log("=== LOADER START ===");
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        console.log("User ID from session:", userId);

        if (!userId) {
            return redirect("/addentech-login");
        }

        // Test database connection first
        console.log("Testing database connection...");

        // Get current user information for role-based access
        console.log("Finding user by email:", userId);
        const currentUser = await Registration.findOne({ email: userId });
        console.log("Current user found:", currentUser ? `${currentUser.firstName} ${currentUser.lastName} (${currentUser.role})` : 'Not found');

        // Ensure Department model is loaded
        console.log("Department model available:", Department);

        const url = new URL(request.url);
        const filters = {
            status: url.searchParams.get('status') || 'all',
            leaveType: url.searchParams.get('leaveType') || 'all',
            department: url.searchParams.get('department') || 'all',
            page: parseInt(url.searchParams.get('page') || '1'),
            limit: parseInt(url.searchParams.get('limit') || '10'),
            // Date range filtering
            startDate: url.searchParams.get('startDate'),
            endDate: url.searchParams.get('endDate'),
            // Name filtering
            employeeName: url.searchParams.get('employeeName'),
            // Role-based access
            userEmail: userId,
            userRole: currentUser?.role,
            userDepartment: currentUser?.department
        };

        console.log("Filters being passed:", filters);

        console.log("Calling LeaveController.getLeaves...");
        const result = await LeaveController.getLeaves(filters);
        console.log("Result from controller:", {
            leavesCount: result.leaves?.length || 0,
            total: result.total,
            statsKeys: Object.keys(result.stats || {})
        });

        const leaves = result.leaves || [];
        const total = result.total || 0;
        let stats = result.stats || {};

        // Role-based stats filtering
        if (currentUser?.role === 'staff') {
            // Staff can only see their own statistics
            const userLeaves = leaves.filter(leave =>
                leave.employee?.email === userId ||
                leave.employee?._id?.toString() === currentUser.id
            );
            stats = {
                totalApplications: userLeaves.length,
                pendingApprovals: userLeaves.filter(l => l.status === 'pending').length,
                approvedThisMonth: userLeaves.filter(l =>
                    l.status === 'approved' &&
                    new Date(l.lastModified).getMonth() === new Date().getMonth()
                ).length,
                rejectedThisMonth: userLeaves.filter(l =>
                    l.status === 'rejected' &&
                    new Date(l.lastModified).getMonth() === new Date().getMonth()
                ).length,
                upcomingLeaves: userLeaves.filter(l =>
                    l.status === 'approved' &&
                    new Date(l.startDate) > new Date()
                ).length,
                onLeaveToday: userLeaves.filter(l => {
                    const today = new Date();
                    const start = new Date(l.startDate);
                    const end = new Date(l.endDate);
                    return l.status === 'approved' && start <= today && end >= today;
                }).length
            };
        } else if (currentUser?.role === 'department_head') {
            // Department heads see stats for their department only
            const deptLeaves = leaves.filter(leave =>
                leave.department?._id?.toString() === currentUser.department?.toString() ||
                leave.department === currentUser.department
            );
            stats = {
                totalApplications: deptLeaves.length,
                pendingApprovals: deptLeaves.filter(l => l.status === 'pending').length,
                approvedThisMonth: deptLeaves.filter(l =>
                    l.status === 'approved' &&
                    new Date(l.lastModified).getMonth() === new Date().getMonth()
                ).length,
                rejectedThisMonth: deptLeaves.filter(l =>
                    l.status === 'rejected' &&
                    new Date(l.lastModified).getMonth() === new Date().getMonth()
                ).length,
                upcomingLeaves: deptLeaves.filter(l =>
                    l.status === 'approved' &&
                    new Date(l.startDate) > new Date()
                ).length,
                onLeaveToday: deptLeaves.filter(l => {
                    const today = new Date();
                    const start = new Date(l.startDate);
                    const end = new Date(l.endDate);
                    return l.status === 'approved' && start <= today && end >= today;
                }).length
            };
        }
        // Admin/Manager keep the original stats (all data)

        // Get departments for filtering dropdown (only for admin/manager)
        let departments = [];
        if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
            try {
                departments = await Department.find({ isActive: true });
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        }

        console.log("=== LOADER SUCCESS ===");
        return json({
            leaves,
            total,
            stats,
            filters,
            departments,
            currentUser: {
                id: userId,
                role: currentUser?.role,
                department: currentUser?.department,
                name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown'
            },
            success: url.searchParams.get('success')
        });
    } catch (error: any) {
        console.error('=== LOADER ERROR ===');
        console.error('Error loading leave data:', error);
        console.error('Stack trace:', error?.stack);
        return json({
            leaves: [],
            total: 0,
            stats: {
                totalApplications: 0,
                pendingApprovals: 0,
                approvedThisMonth: 0,
                rejectedThisMonth: 0,
                upcomingLeaves: 0,
                onLeaveToday: 0
            },
            filters: { status: 'all', leaveType: 'all', department: 'all' },
            currentUser: null,
            error: `Failed to load leave data: ${error?.message || error}`
        });
    }
}

// Action function to handle approvals/rejections
export async function action({ request }: ActionFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");

        if (!userId) {
            return redirect("/addentech-login");
        }

        const formData = await request.formData();
        const action = formData.get('_action') as string;
        const leaveId = formData.get('leaveId') as string;
        const status = formData.get('status') as 'approved' | 'rejected';
        const comments = formData.get('comments') as string;

        console.log('Action function called with:', { action, leaveId, status, comments, userId });

        if (action === 'updateStatus') {
            // Direct controller call following admin.users.tsx pattern
            const result = await LeaveController.updateLeaveStatus({
                leaveId,
                status,
                comments,
                approverEmail: userId
            });

            // Send email notification to employee about approval/rejection
            if (result.success) {
                try {
                    // Get the updated leave details for email notification
                    const updatedLeave = await LeaveController.getLeaveById(leaveId);

                    if (updatedLeave && updatedLeave.employee) {
                        const { EmailService } = await import('~/services/emailService');
                        const employee = updatedLeave.employee as any;

                        if (employee && employee.email) {
                            await EmailService.sendLeaveApprovalNotification(
                                employee.email,
                                `${employee.firstName} ${employee.lastName}`,
                                updatedLeave.leaveType,
                                status,
                                comments
                            );
                        }
                    }
                } catch (emailError: any) {
                    console.error('Failed to send approval notification email:', emailError?.message || emailError);
                    // Don't fail the entire operation if email fails
                }
            }

            return json(result);
        }

        return json({ success: false, error: "Invalid action" });
    } catch (error: any) {
        console.error('Error in action:', error);
        return json({ success: false, error: `Action failed: ${error?.message || error}` });
    }
}

const LeaveManagement = () => {

    const { leaves, total, stats, filters, departments, currentUser, success, error } = useLoaderData<{ leaves: any, total: number, stats: any, filters: any, departments: any, currentUser: any, success: any, error: any }>();

    const actionData = useActionData<typeof action>();
    const submit = useSubmit();
    const [selectedLeave, setSelectedLeave] = useState<any>(null);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
    const [comments, setComments] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Filter states
    const [searchName, setSearchName] = useState(filters.employeeName || '');
    const [startDate, setStartDate] = useState(filters.startDate || '');
    const [endDate, setEndDate] = useState(filters.endDate || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department || 'all');

    // Handle successful actions
    useEffect(() => {
        if (actionData?.success) {
            console.log('Action successful, reloading page...');
            // Reload the page to get fresh data
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

        console.log('Submitting approval with data:', {
            leaveId: selectedLeave._id,
            status: approvalAction === 'approve' ? 'approved' : 'rejected',
            comments
        });

        const formData = new FormData();
        formData.set('_action', 'updateStatus');
        formData.set('leaveId', selectedLeave._id);
        formData.set('status', approvalAction === 'approve' ? 'approved' : 'rejected');
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

    // Filter handling functions
    const applyFilters = () => {
        const searchParams = new URLSearchParams();

        if (selectedStatus !== 'all') searchParams.set('status', selectedStatus);
        if (selectedDepartment !== 'all' && (currentUser?.role === 'admin' || currentUser?.role === 'manager')) {
            searchParams.set('department', selectedDepartment);
        }
        if (searchName.trim()) searchParams.set('employeeName', searchName.trim());
        if (startDate) searchParams.set('startDate', startDate);
        if (endDate) searchParams.set('endDate', endDate);

        window.location.href = `/admin/leave-management?${searchParams.toString()}`;
    };

    const clearFilters = () => {
        setSearchName('');
        setStartDate('');
        setEndDate('');
        setSelectedStatus('all');
        setSelectedDepartment('all');
        window.location.href = '/admin/leave-management';
    };

    // Role-based access control
    const canViewAllStats = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    const canViewDepartmentStats = currentUser?.role === 'department_head';
    const isStaff = currentUser?.role === 'staff';

    // Page title based on role
    const getPageTitle = () => {
        if (isStaff) return `My Leave Applications`;
        if (canViewDepartmentStats) return `Department Leave Management`;
        return `Leave Management Dashboard`;
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6 !text-white">
                {/* Success/Error Messages */}
                {success && (
                    <Card className="bg-dashboard-secondary border border-green-700">
                        <CardBody>
                            <p className="text-green-300">{success}</p>
                        </CardBody>
                    </Card>
                )}

                {(error || (actionData && 'error' in actionData && actionData.error)) && (
                    <Card className="bg-dashboard-secondary border border-red-700">
                        <CardBody>
                            <p className="text-red-300">{error || (actionData && 'error' in actionData ? actionData.error : '')}</p>
                        </CardBody>
                    </Card>
                )}

                {actionData?.success && (
                    <Card className="bg-dashboard-secondary border border-green-700">
                        <CardBody>
                            <p className="text-green-300">{actionData && 'message' in actionData ? actionData.message : 'Action completed successfully'}</p>
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
                            <p className="text-gray-300 mt-1">Manage leave applications and approvals</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="bordered"
                                startContent={<Download size={16} />}
                                onClick={exportToCSV}
                                className="bg-dashboard-tertiary hover:bg-dashboard-secondary text-white border-white/20"
                            >
                                Export CSV
                            </Button>
                            {/* Only show New Leave Application for staff, admin, and manager */}
                            {(currentUser?.role === 'staff' || currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                                <Link to="/employee-leave-application">
                                    <Button
                                        startContent={<Plus size={16} />}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold"
                                    >
                                        New Leave Application
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="px-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm text-gray-300 font-nunito">Total Applications</p>
                                    <p className="text-2xl font-bold text-white font-nunito">{(stats as any)?.totalApplications || 0}</p>
                                </div>
                                <CalendarDays className="text-blue-400 font-nunito" size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white font-nunito">
                                <div>
                                    <p className="text-sm text-gray-300">Pending Approvals</p>
                                    <p className="text-2xl font-bold text-white font-nunito">{(stats as any)?.pendingApprovals || 0}</p>
                                </div>
                                <Clock className="text-amber-400 font-nunito" size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white font-nunito">
                                <div>
                                    <p className="text-sm text-gray-300 font-nunito">Approved This Month</p>
                                    <p className="text-2xl font-bold text-white font-nunito">{(stats as any)?.approvedThisMonth || 0}</p>
                                </div>
                                <CheckCircle className="text-green-400 font-nunito" size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white font-nunito">
                                <div>
                                    <p className="text-sm text-gray-300 font-nunito">Rejected This Month</p>
                                    <p className="text-2xl font-bold text-white font-nunito">{(stats as any)?.rejectedThisMonth || 0}</p>
                                </div>
                                <XCircle className="text-red-400 font-nunito" size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white font-nunito">
                                <div>
                                    <p className="text-sm text-gray-300 font-nunito">Upcoming Leaves</p>
                                    <p className="text-2xl font-bold text-white font-nunito">{(stats as any)?.upcomingLeaves || 0}</p>
                                </div>
                                <TrendingUp className="text-blue-400 font-nunito" size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white font-nunito">
                                <div>
                                    <p className="text-sm text-gray-300 font-nunito">On Leave Today</p>
                                    <p className="text-2xl font-bold text-white font-nunito">{(stats as any)?.onLeaveToday || 0}</p>
                                </div>
                                <Users className="text-purple-400 font-nunito" size={24} />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Leave Statistics Line Chart */}
                <LineChart
                    title="Leave Management Statistics Overview"
                    data={{
                        labels: ['Total Applications', 'Pending Approvals', 'Approved This Month', 'Rejected This Month', 'Upcoming Leaves', 'On Leave Today'],
                        datasets: [
                            {
                                label: 'Leave Stats',
                                data: [
                                    (stats as any)?.totalApplications || 0,
                                    (stats as any)?.pendingApprovals || 0,
                                    (stats as any)?.approvedThisMonth || 0,
                                    (stats as any)?.rejectedThisMonth || 0,
                                    (stats as any)?.upcomingLeaves || 0,
                                    (stats as any)?.onLeaveToday || 0
                                ],
                                borderColor: '#10B981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                fill: true,
                                tension: 0.4,
                            },
                        ],
                    }}
                    height={350}
                    className="mb-6"
                />

                {/* Role-based access message */}
                {/* {!isAdmin && !isDepartmentHead && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-blue-700">
                            <span className="font-bold">Note:</span> You are viewing your personal leave applications and history.
                        </p>
                    </div>
                )} */}

                {/* Enhanced Filters */}
                <Card className="bg-dashboard-secondary border border-white/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-white" />
                            <h3 className="text-lg font-semibold text-white">Search & Filter</h3>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            {/* Employee Name Search */}
                            <Input
                                label="Employee Name"
                                placeholder="Search by name..."
                                value={searchName}
                                onValueChange={setSearchName}
                                startContent={<Search size={16} />}
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-nunito text-white",
                                    inputWrapper: "font-nunito bg-dashboard-tertiary border border-white/20",
                                    
                                }}
                                size="sm"
                                isClearable
                            />

                            {/* Status Filter */}
                            <Select
                                label="Status"
                                size="sm"
                                selectedKeys={[selectedStatus]}
                                labelPlacement="outside"
                                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                                classNames={{
                                    label: "font-nunito text-white",
                                    trigger: "font-nunito bg-dashboard-tertiary border border-white/20",
                                }}
                            >
                                <SelectItem key="all" value="all">All Status</SelectItem>
                                <SelectItem key="pending" value="pending">Pending</SelectItem>
                                <SelectItem key="approved" value="approved">Approved</SelectItem>
                                <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
                            </Select>

                            {/* Department Filter (Admin/Manager only) */}
                            {canViewAllStats && (
                                <Select
                                    label="Department"
                                    size="sm"
                                    selectedKeys={[selectedDepartment]}
                                    onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0] as string)}
                                    labelPlacement="outside"
                                    classNames={{
                                        label: "font-nunito text-white",
                                        trigger: "font-nunito bg-dashboard-tertiary border border-white/20",
                                    }}
                                >
                                    <SelectItem key="all" value="all">All Departments</SelectItem>
                                    {departments?.map((dept: any) => (
                                        <SelectItem key={dept._id} value={dept._id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}

                            {/* Start Date Filter */}
                            <Input
                                type="date"
                                label="Start Date"
                                size="sm"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-nunito text-white",
                                    inputWrapper: "font-nunito bg-dashboard-tertiary border border-white/20",
                                }}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                startContent={<Calendar size={16} />}
                            />

                            {/* End Date Filter */}
                            <Input
                                type="date"
                                label="End Date"
                                size="sm"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-nunito text-white",
                                    inputWrapper: "font-nunito bg-dashboard-tertiary border border-white/20",
                                }}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                startContent={<Calendar size={16} />}
                            />

                            {/* Filter Actions */}
                            <div className="flex gap-2 items-end">
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                    size="sm"
                                    onClick={applyFilters}
                                   
                                >
                                    Apply
                                </Button>
                                <Button
                                    variant="bordered"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="flex-1 border-white/20 text-white hover:bg-dashboard-tertiary"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(filters.employeeName || filters.startDate || filters.endDate || filters.status !== 'all' || (filters.department !== 'all' && canViewAllStats)) && (
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-sm font-medium text-white">Active Filters:</span>
                                    {filters.employeeName && (
                                        <Chip size="sm" color="primary" variant="flat">
                                            Name: {filters.employeeName}
                                        </Chip>
                                    )}
                                    {filters.status !== 'all' && (
                                        <Chip size="sm" color="primary" variant="flat">
                                            Status: {filters.status}
                                        </Chip>
                                    )}
                                    {filters.department !== 'all' && canViewAllStats && (
                                        <Chip size="sm" color="primary" variant="flat">
                                            Department: {departments?.find((d: any) => d._id === filters.department)?.name || filters.department}
                                        </Chip>
                                    )}
                                    {filters.startDate && (
                                        <Chip size="sm" color="primary" variant="flat">
                                            From: {new Date(filters.startDate).toLocaleDateString()}
                                        </Chip>
                                    )}
                                    {filters.endDate && (
                                        <Chip size="sm" color="primary" variant="flat">
                                            To: {new Date(filters.endDate).toLocaleDateString()}
                                        </Chip>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Legacy filter - keeping for backward compatibility */}
                <Card style={{ display: 'none' }}>
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
                <Card className="bg-dashboard-secondary border border-white/20">
                    <CardBody>
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b border-white/20">
                                        <th className="text-left p-3 text-white">Employee</th>
                                        <th className="text-left p-3 text-white">Leave Type</th>
                                        <th className="text-left p-3 text-white">Duration</th>
                                        <th className="text-left p-3 text-white">Days</th>
                                        <th className="text-left p-3 text-white">Status</th>
                                        <th className="text-left p-3 text-white">Priority</th>
                                        <th className="text-left p-3 text-white">Submitted</th>
                                        <th className="text-left p-3 text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((leave: any) => (
                                        <tr key={leave._id} className="border-b border-white/20 hover:bg-dashboard-tertiary">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {leave.employee?.firstName} {leave.employee?.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-300">
                                                        {leave.department?.name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="capitalize text-white">{leave.leaveType}</span>
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    <p className="text-sm text-white">{formatDate(leave.startDate)}</p>
                                                    <p className="text-sm text-gray-300">to {formatDate(leave.endDate)}</p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="font-medium text-white">{leave.totalDays} days</span>
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

                                                    {/* Show approve/reject buttons based on role and permissions */}
                                                    {leave.status === 'pending' && (
                                                        currentUser?.role === 'admin' ||
                                                        currentUser?.role === 'manager' ||
                                                        (currentUser?.role === 'department_head' && leave.department?._id === currentUser?.department)
                                                    ) && (
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
                                <p className="text-gray-300">No leave applications found</p>
                                <p className="text-sm text-gray-400 mt-2">
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