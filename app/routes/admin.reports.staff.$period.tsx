import { Card, CardHeader, CardBody, Button, Select, SelectItem, Spinner, Chip, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Form, Link, useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import { json, LoaderFunction, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import { ReportController } from "~/controller/reportController";
import { ArrowLeft, Download, Calendar, BarChart3, TrendingUp, User, Clock, Activity, Award, ChevronDown, FileText, Printer } from "lucide-react";
import AdminLayout from "~/layout/adminLayout";
import { ReportExporter } from "~/utils/reportExport";

export const loader: LoaderFunction = async ({ request, params }: LoaderFunctionArgs) => {

    console.log("checking..........");
    
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        const currentUser = await Registration.findOne({ email: userId });
        if (!currentUser) {
            return redirect("/addentech-login");
        }

        const { period } = params;
        const url = new URL(request.url);
        const selectedUserId = url.searchParams.get('user');
        const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());

        // Get users for selection based on role
        let users = [];
        if (currentUser.role === 'admin') {
            // Admin can see all staff reports
            users = await Registration.find({ status: 'active' })
                .populate('department', 'name')
                .select('firstName lastName email role department');
        } else if (currentUser.role === 'manager') {
            // Manager can see all staff reports
            users = await Registration.find({ status: 'active' })
                .populate('department', 'name')
                .select('firstName lastName email role department');
        } else if (currentUser.role === 'department_head') {
            // HOD can see their own report and their department staff reports
            users = await Registration.find({ 
                department: currentUser.department, 
                status: 'active' 
            })
                .populate('department', 'name')
                .select('firstName lastName email role department');
        } else if (currentUser.role === 'staff') {
            // Staff can only see their own report
            users = [await Registration.findById(currentUser._id)
                .populate('department', 'name')
                .select('firstName lastName email role department')];
        }

        // Auto-select current user for staff, or use selected user for others
        let reportUserId = selectedUserId;
        if (currentUser.role === 'staff') {
            // Staff always see their own report
            reportUserId = currentUser._id.toString();
        }

        // Generate report if user is selected or auto-selected for staff
        let report = null;
        if (reportUserId && users.some(u => u._id.toString() === reportUserId.toString())) {
            const reportResult = await ReportController.generateStaffReport(
                reportUserId,
                period as 'weekly' | 'monthly' | 'quarterly',
                year,
                currentUser.role,
                currentUser._id
            );
            report = reportResult.success ? reportResult.report : null;
        }

        return json({
            users,
            report,
            period,
            selectedUser: reportUserId,
            year,
            currentUser: {
                id: currentUser._id,
                email: currentUser.email,
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                role: currentUser.role,
                department: currentUser.department
            }
        });
    } catch (error: any) {
        console.error('Error loading staff report:', error);
        return json({
            users: [],
            report: null,
            period: params.period,
            selectedUser: null,
            year: new Date().getFullYear(),
            currentUser: null,
            error: `Failed to load data: ${error?.message || error}`
        });
    }
};

const StaffReportPage = () => {
    const { users, report, period, selectedUser, year, currentUser, error } = useLoaderData<typeof loader>();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const periodLabels = {
        weekly: 'Weekly',
        monthly: 'Monthly',
        quarterly: 'Quarterly'
    };

    const periodIcon = {
        weekly: Calendar,
        monthly: BarChart3,
        quarterly: TrendingUp
    };

    const Icon = periodIcon[period as keyof typeof periodIcon] || Calendar;

    const handleUserChange = (userId: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('user', userId);
        setSearchParams(newSearchParams);
    };

    const handleYearChange = (newYear: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('year', newYear);
        setSearchParams(newSearchParams);
    };

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const formatActivityType = (type: string) => {
        return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const getActivityColor = (type: string): "default" | "primary" | "secondary" | "warning" | "success" | "danger" => {
        const colors = {
            created: 'primary' as const,
            assigned: 'secondary' as const,
            delegated: 'warning' as const,
            status_changed: 'default' as const,
            completed: 'success' as const,
            commented: 'primary' as const,
            time_logged: 'warning' as const,
            updated: 'default' as const
        };
        return colors[type as keyof typeof colors] || 'default';
    };

    const getRoleColor = (role: string): "default" | "primary" | "secondary" | "warning" | "success" | "danger" => {
        const colors = {
            admin: 'danger' as const,
            manager: 'warning' as const,
            department_head: 'secondary' as const,
            staff: 'primary' as const
        };
        return colors[role as keyof typeof colors] || 'default';
    };

    const getStatusColor = (status: string): "default" | "primary" | "secondary" | "warning" | "success" | "danger" => {
        const colors = {
            completed: 'success' as const,
            in_progress: 'primary' as const,
            under_review: 'warning' as const,
            on_hold: 'default' as const,
            not_started: 'default' as const
        };
        return colors[status as keyof typeof colors] || 'default';
    };

    if (error) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <Card className="border-danger">
                        <CardBody>
                            <p className="text-danger">{error}</p>
                        </CardBody>
                    </Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6 !text-white bg-dashboard-primary min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/reports">
                            <Button variant="light" size="sm" startContent={<ArrowLeft className="w-4 h-4" />} className="text-dashboard-primary border-dashboard-light">
                                Back to Reports
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-status-active rounded-lg">
                                    <Icon className="w-6 h-6 text-dashboard-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-dashboard-primary">
                                        {periodLabels[period as keyof typeof periodLabels]} Staff Report
                                    </h1>
                                    <p className="text-dashboard-secondary mt-1">
                                        Individual {period} performance and activity analysis
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {report && (
                        <Dropdown>
                            <DropdownTrigger>
                                <Button color="success" startContent={<Download className="w-4 h-4" />} endContent={<ChevronDown className="w-4 h-4" />}>
                                    Export Report
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Export options">
                                <DropdownItem 
                                    key="csv" 
                                    startContent={<FileText className="w-4 h-4" />}
                                    onClick={() => ReportExporter.exportStaffReportToCSV(report, period, year)}
                                >
                                    Export as CSV
                                </DropdownItem>
                                <DropdownItem 
                                    key="json" 
                                    startContent={<FileText className="w-4 h-4" />}
                                    onClick={() => ReportExporter.exportReportToJSON(report, period, year, 'staff')}
                                >
                                    Export as JSON
                                </DropdownItem>
                                <DropdownItem 
                                    key="print" 
                                    startContent={<Printer className="w-4 h-4" />}
                                    onClick={() => ReportExporter.openPrintableReport(report, period, year, 'staff')}
                                >
                                    Print Report
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    )}
                </div>

                {/* Filters */}
                <Card className="bg-dashboard-secondary border border-white/10">
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {currentUser?.role !== 'staff' && (
                            <Select 
                                label="Select Staff Member"
                                placeholder="Choose an employee"
                                value={selectedUser || ''}
                                onChange={(e) => handleUserChange(e.target.value)}
                                classNames={{
                                    label: "text-dashboard-primary",
                                    trigger: "bg-dashboard-secondary border border-white/20 text-dashboard-primary",
                                    popoverContent: "bg-dashboard-secondary border border-white/20"
                                }}
                            >
                                {users?.map((user: any) => (
                                    <SelectItem key={user._id} value={user._id} className="text-dashboard-primary">
                                        <div className="flex items-center gap-2">
                                            <Avatar 
                                                size="sm" 
                                                name={`${user.firstName} ${user.lastName}`}
                                                className="flex-shrink-0"
                                            />
                                            <div>
                                                <div className="font-medium text-dashboard-primary">{user.firstName} {user.lastName}</div>
                                                <div className="text-xs text-dashboard-muted">
                                                    {user.role} - {user.department?.name}
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>
                            )}
                            
                            <Select 
                                label="Year"
                                value={year.toString()}
                                onChange={(e) => handleYearChange(e.target.value)}
                                classNames={{
                                    label: "text-dashboard-primary",
                                    trigger: "bg-dashboard-secondary border border-white/20 text-dashboard-primary",
                                    popoverContent: "bg-dashboard-secondary border border-white/20"
                                }}
                            >
                                {years.map((yr) => (
                                    <SelectItem key={yr.toString()} value={yr.toString()} className="text-dashboard-primary">
                                        {yr}
                                    </SelectItem>
                                ))}
                            </Select>

                            <div className="flex items-end">
                                <Chip color="success" variant="flat" className="h-10 bg-status-active text-dashboard-primary">
                                    {periodLabels[period as keyof typeof periodLabels]} Report
                                </Chip>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Report Content */}
                {!selectedUser ? (
                    <Card className="bg-dashboard-secondary border border-white/10">
                        <CardBody className="text-center py-12">
                            <User className="w-16 h-16 text-dashboard-muted mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-dashboard-primary mb-2">
                                {currentUser?.role === 'staff' ? 'Loading Your Report...' : 'Select a Staff Member'}
                            </h3>
                            <p className="text-dashboard-secondary">
                                {currentUser?.role === 'staff' 
                                    ? 'Please wait while we load your personal activity report'
                                    : 'Choose an employee from the dropdown above to generate the report'
                                }
                            </p>
                        </CardBody>
                    </Card>
                ) : !report ? (
                    <Card className="bg-dashboard-secondary border border-white/10">
                        <CardBody className="text-center py-12">
                            <Spinner size="lg" />
                            <p className="mt-4 text-dashboard-secondary">Generating report...</p>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Employee Info */}
                        <Card className="bg-dashboard-secondary border border-white/10">
                            <CardBody>
                                <div className="flex items-center gap-4">
                                    <Avatar 
                                        size="lg" 
                                        name={report.user.name}
                                        className="flex-shrink-0"
                                    />
                                    <div className="flex-grow">
                                        <h2 className="text-2xl font-bold text-dashboard-primary">{report.user.name}</h2>
                                        <p className="text-dashboard-secondary">{report.user.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Chip 
                                                color={getRoleColor(report.user.role)} 
                                                variant="flat"
                                                size="sm"
                                                className="text-dashboard-primary"
                                            >
                                                {report.user.role.replace('_', ' ').toUpperCase()}
                                            </Chip>
                                            <Chip color="default" variant="flat" size="sm" className="bg-dashboard-tertiary text-dashboard-primary">
                                                {report.user.department}
                                            </Chip>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <Card className="bg-dashboard-secondary border border-white/10">
                                <CardBody className="text-center">
                                    <Activity className="w-12 h-12 text-action-primary mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-action-primary">{report.summary.totalActivities}</h3>
                                    <p className="text-dashboard-secondary">Total Activities</p>
                                </CardBody>
                            </Card>
                            <Card className="bg-dashboard-secondary border border-white/10">
                                <CardBody className="text-center">
                                    <Clock className="w-12 h-12 text-status-active mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-status-active">{report.summary.totalHours.toFixed(1)}</h3>
                                    <p className="text-dashboard-secondary">Hours Logged</p>
                                </CardBody>
                            </Card>
                            <Card className="bg-dashboard-secondary border border-white/10">
                                <CardBody className="text-center">
                                    <Award className="w-12 h-12 text-avatar-purple mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-avatar-purple">{report.summary.completedTasks}</h3>
                                    <p className="text-dashboard-secondary">Tasks Completed</p>
                                </CardBody>
                            </Card>
                            <Card className="bg-dashboard-secondary border border-white/10">
                                <CardBody className="text-center">
                                    <BarChart3 className="w-12 h-12 text-avatar-orange mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-avatar-orange">{Object.keys(report.periodBreakdown).length}</h3>
                                    <p className="text-dashboard-secondary">Periods Tracked</p>
                                </CardBody>
                            </Card>
                            <Card className="bg-dashboard-secondary border border-white/10">
                                <CardBody className="text-center">
                                    <User className="w-12 h-12 text-avatar-blue mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-avatar-blue">{report.summary.totalAssignedTasks || 0}</h3>
                                    <p className="text-dashboard-secondary">Assigned Tasks</p>
                                    <p className="text-sm text-dashboard-muted">Total assigned</p>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Task Status Breakdown */}
                        {report.summary.taskStatusBreakdown && Object.keys(report.summary.taskStatusBreakdown).length > 0 && (
                        <Card className="bg-dashboard-secondary border border-white/10">
                            <CardHeader>
                                <h2 className="text-xl font-semibold text-dashboard-primary">Task Status Overview</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {Object.entries(report.summary.taskStatusBreakdown).map(([status, count]: [string, any]) => (
                                        <div key={status} className="text-center p-4 bg-dashboard-tertiary rounded-lg">
                                            <Chip 
                                                color={getStatusColor(status)} 
                                                variant="flat"
                                                className="mb-2"
                                            >
                                                {status.replace('_', ' ').toUpperCase()}
                                            </Chip>
                                            <p className="text-2xl font-bold text-dashboard-primary">{count}</p>
                                            <p className="text-sm text-dashboard-secondary">tasks</p>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                        )}

                        {/* Activity Breakdown */}
                        <Card className="bg-dashboard-secondary border border-white/10">
                            <CardHeader>
                                <h2 className="text-xl font-semibold text-dashboard-primary">Activity Summary for {year}</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {report.summary.activityBreakdown?.map((activity: any) => (
                                        <div key={activity._id} className="text-center p-4 bg-dashboard-tertiary rounded-lg">
                                            <Chip 
                                                color={getActivityColor(activity._id)} 
                                                variant="flat"
                                                className="mb-2"
                                            >
                                                {formatActivityType(activity._id)}
                                            </Chip>
                                            <p className="text-2xl font-bold text-dashboard-primary">{activity.count}</p>
                                            {activity.totalHours > 0 && (
                                                <p className="text-sm text-dashboard-secondary">{activity.totalHours.toFixed(1)}h logged</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* All Assigned Tasks */}
                        {report.summary.assignedTasksList && report.summary.assignedTasksList.length > 0 && (
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">All Assigned Tasks ({year})</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-3">
                                    {report.summary.assignedTasksList.map((task: any) => (
                                        <div key={task._id} className="flex justify-between items-center p-4 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-grow">
                                                <h5 className="font-semibold text-gray-900">{task.title}</h5>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                    {task.createdBy && (
                                                        <span className="ml-4">• Assigned by: {task.createdBy.firstName} {task.createdBy.lastName}</span>
                                                    )}
                                                    {task.department && (
                                                        <span className="ml-4">• Dept: {task.department.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Chip 
                                                    color={getStatusColor(task.status)}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {task.status.replace('_', ' ').toUpperCase()}
                                                </Chip>
                                                <Chip 
                                                    color={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {task.priority.toUpperCase()}
                                                </Chip>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                        )}

                        {/* Period Breakdown */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">{periodLabels[period as keyof typeof periodLabels]} Performance</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-6">
                                    {report.periodBreakdown && Object.entries(report.periodBreakdown)
                                        .filter(([periodName, data]) => periodName && data)
                                        .map(([periodName, data]: [string, any]) => (
                                        <div key={periodName || 'unknown'} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold">
                                                    {periodName || 'Unknown Period'}
                                                </h3>
                                                <div className="text-sm text-gray-600">
                                                    {new Date(data.dateRange.start).toLocaleDateString()} - {new Date(data.dateRange.end).toLocaleDateString()}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div className="text-center p-3 bg-blue-50 rounded">
                                                    <p className="text-xl font-bold text-blue-600">{data.totalActivities}</p>
                                                    <p className="text-sm text-blue-600">Activities</p>
                                                </div>
                                                <div className="text-center p-3 bg-green-50 rounded">
                                                    <p className="text-xl font-bold text-green-600">{data.totalHours.toFixed(1)}</p>
                                                    <p className="text-sm text-green-600">Hours</p>
                                                </div>
                                                <div className="text-center p-3 bg-purple-50 rounded">
                                                    <p className="text-xl font-bold text-purple-600">{data.activityStats?.length || 0}</p>
                                                    <p className="text-sm text-purple-600">Activity Types</p>
                                                </div>
                                                <div className="text-center p-3 bg-orange-50 rounded">
                                                    <p className="text-xl font-bold text-orange-600">{data.assignedTasks || 0}</p>
                                                    <p className="text-sm text-orange-600">Assigned Tasks</p>
                                                </div>
                                            </div>

                                            {data.activityStats && data.activityStats.length > 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    {data.activityStats.map((activity: any) => (
                                                        <div key={activity._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                            <span className="font-medium">{formatActivityType(activity._id)}</span>
                                                            <div className="text-right">
                                                                <span className="font-bold">{activity.count}</span>
                                                                {activity.totalHours > 0 && (
                                                                    <span className="text-sm text-gray-600 ml-2">({activity.totalHours.toFixed(1)}h)</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Assigned Tasks for this period */}
                                            {data.tasksList && data.tasksList.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="font-semibold mb-3">Assigned Tasks in this Period</h4>
                                                    <div className="space-y-2">
                                                        {data.tasksList.map((task: any) => (
                                                            <div key={task._id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                                                                <div className="flex-grow">
                                                                    <h5 className="font-medium text-gray-900">{task.title}</h5>
                                                                    <p className="text-sm text-gray-600">
                                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                                        {task.createdBy && (
                                                                            <span className="ml-2">• Assigned by: {task.createdBy.firstName} {task.createdBy.lastName}</span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Chip 
                                                                        color={getStatusColor(task.status)}
                                                                        variant="flat"
                                                                        size="sm"
                                                                    >
                                                                        {task.status.replace('_', ' ').toUpperCase()}
                                                                    </Chip>
                                                                    <Chip 
                                                                        color={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}
                                                                        variant="flat"
                                                                        size="sm"
                                                                    >
                                                                        {task.priority}
                                                                    </Chip>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default StaffReportPage; 