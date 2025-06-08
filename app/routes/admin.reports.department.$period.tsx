import { Card, CardHeader, CardBody, Button, Select, SelectItem, Spinner, Chip, Progress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Form, Link, useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import { json, LoaderFunction, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import { ReportController } from "~/controller/reportController";
import { ArrowLeft, Download, Calendar, BarChart3, TrendingUp, Users, Clock, Activity, Award, ChevronDown, FileText, Printer } from "lucide-react";
import AdminLayout from "~/layout/adminLayout";
import { useState, useEffect } from "react";
import { ReportExporter } from "~/utils/reportExport";

export const loader: LoaderFunction = async ({ request, params }: LoaderFunctionArgs) => {
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
        const departmentId = url.searchParams.get('department');
        const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());

        // Get departments for selection based on role
        let departments = [];
        if (currentUser.role === 'admin') {
            // Admin can see all departments
            departments = await Departments.find();
        } else if (currentUser.role === 'manager') {
            // Manager can see all departments  
            departments = await Departments.find();
        } else if (currentUser.role === 'department_head') {
            // HOD can only see their own department
            const userDept = await Departments.findById(currentUser.department);
            if (userDept) {
                departments = [userDept];
            }
        } else if (currentUser.role === 'staff') {
            // Staff cannot access department reports
            return redirect("/admin/reports");
        }

        // Generate report if department is selected
        let report = null;
        if (departmentId && departments.some(d => d._id.toString() === departmentId)) {
            const reportResult = await ReportController.generateDepartmentReport(
                departmentId,
                period as 'weekly' | 'monthly' | 'quarterly',
                year
            );
            report = reportResult.success ? reportResult.report : null;
        }

        return json({
            departments,
            report,
            period,
            selectedDepartment: departmentId,
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
        console.error('Error loading department report:', error);
        return json({
            departments: [],
            report: null,
            period: params.period,
            selectedDepartment: null,
            year: new Date().getFullYear(),
            currentUser: null,
            error: `Failed to load data: ${error?.message || error}`
        });
    }
};

const DepartmentReportPage = () => {
    const { departments, report, period, selectedDepartment, year, currentUser, error } = useLoaderData<typeof loader>();
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

    const handleDepartmentChange = (departmentId: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('department', departmentId);
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
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/reports">
                            <Button variant="light" size="sm" startContent={<ArrowLeft className="w-4 h-4" />}>
                                Back to Reports
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {periodLabels[period as keyof typeof periodLabels]} Department Report
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Comprehensive {period} activity and productivity analysis
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {report && (
                        <Dropdown>
                            <DropdownTrigger>
                                <Button color="primary" startContent={<Download className="w-4 h-4" />} endContent={<ChevronDown className="w-4 h-4" />}>
                                    Export Report
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Export options">
                                <DropdownItem 
                                    key="csv" 
                                    startContent={<FileText className="w-4 h-4" />}
                                    onClick={() => ReportExporter.exportDepartmentReportToCSV(report, period, year)}
                                >
                                    Export as CSV
                                </DropdownItem>
                                <DropdownItem 
                                    key="json" 
                                    startContent={<FileText className="w-4 h-4" />}
                                    onClick={() => ReportExporter.exportReportToJSON(report, period, year, 'department')}
                                >
                                    Export as JSON
                                </DropdownItem>
                                <DropdownItem 
                                    key="print" 
                                    startContent={<Printer className="w-4 h-4" />}
                                    onClick={() => ReportExporter.openPrintableReport(report, period, year, 'department')}
                                >
                                    Print Report
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    )}
                </div>

                {/* Filters */}
                <Card>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select 
                                label="Select Department"
                                placeholder="Choose a department"
                                value={selectedDepartment || ''}
                                onChange={(e) => handleDepartmentChange(e.target.value)}
                            >
                                {departments?.map((dept: any) => (
                                    <SelectItem key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            
                            <Select 
                                label="Year"
                                value={year.toString()}
                                onChange={(e) => handleYearChange(e.target.value)}
                            >
                                {years.map((yr) => (
                                    <SelectItem key={yr.toString()} value={yr.toString()}>
                                        {yr}
                                    </SelectItem>
                                ))}
                            </Select>

                            <div className="flex items-end">
                                <Chip color="primary" variant="flat" className="h-10">
                                    {periodLabels[period as keyof typeof periodLabels]} Report
                                </Chip>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Report Content */}
                {!selectedDepartment ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Department</h3>
                            <p className="text-gray-500">Choose a department from the dropdown above to generate the report</p>
                        </CardBody>
                    </Card>
                ) : !report ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <Spinner size="lg" />
                            <p className="mt-4 text-gray-600">Generating report...</p>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <Card>
                                <CardBody className="text-center">
                                    <Activity className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-blue-600">{report.summary.totalActivities}</h3>
                                    <p className="text-gray-600">Total Activities</p>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="text-center">
                                    <Clock className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-green-600">{report.summary.totalHours.toFixed(1)}</h3>
                                    <p className="text-gray-600">Hours Logged</p>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="text-center">
                                    <Award className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-purple-600">{report.summary.completedTasks || 0}</h3>
                                    <p className="text-gray-600">Tasks Completed</p>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="text-center">
                                    <BarChart3 className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-orange-600">{Object.keys(report.periodBreakdown).length}</h3>
                                    <p className="text-gray-600">Periods Tracked</p>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="text-center">
                                    <Users className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-indigo-600">{report.summary.totalAssignedTasks || 0}</h3>
                                    <p className="text-gray-600">Assigned Tasks</p>
                                    <p className="text-sm text-gray-500">Department total</p>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Task Status Breakdown */}
                        {report.summary.taskStatusBreakdown && Object.keys(report.summary.taskStatusBreakdown).length > 0 && (
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Task Status Overview</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {Object.entries(report.summary.taskStatusBreakdown).map(([status, count]: [string, any]) => (
                                        <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                                            <Chip 
                                                color={status === 'completed' ? 'success' : status === 'in_progress' ? 'primary' : status === 'under_review' ? 'warning' : 'default'} 
                                                variant="flat"
                                                className="mb-2"
                                            >
                                                {status.replace('_', ' ').toUpperCase()}
                                            </Chip>
                                            <p className="text-2xl font-bold">{count}</p>
                                            <p className="text-sm text-gray-600">tasks</p>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                        )}

                        {/* Activity Breakdown */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Activity Breakdown for {year}</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {report.summary.activityBreakdown?.map((activity: any) => (
                                        <div key={activity._id} className="text-center p-4 bg-gray-50 rounded-lg">
                                            <Chip 
                                                color={getActivityColor(activity._id)} 
                                                variant="flat"
                                                className="mb-2"
                                            >
                                                {formatActivityType(activity._id)}
                                            </Chip>
                                            <p className="text-2xl font-bold">{activity.count}</p>
                                            {activity.totalHours > 0 && (
                                                <p className="text-sm text-gray-600">{activity.totalHours}h logged</p>
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
                                <h2 className="text-xl font-semibold">All Department Tasks ({year})</h2>
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
                                                    {task.assignedTo && task.assignedTo.length > 0 && (
                                                        <span className="ml-4">• Assigned to: {task.assignedTo.map((user: any) => `${user.firstName} ${user.lastName}`).join(', ')}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Chip 
                                                    color={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'primary' : task.status === 'under_review' ? 'warning' : 'default'}
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
                                <h2 className="text-xl font-semibold">{periodLabels[period as keyof typeof periodLabels]} Breakdown</h2>
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
                                                                <span className="font-bold">{activity.totalCount}</span>
                                                                {activity.totalHours > 0 && (
                                                                    <span className="text-sm text-gray-600 ml-2">({activity.totalHours}h)</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Assigned Tasks for this period */}
                                            {data.tasksList && data.tasksList.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="font-semibold mb-3">Tasks Assigned in this Period</h4>
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
                                                                        {task.assignedTo && task.assignedTo.length > 0 && (
                                                                            <span className="ml-2">• To: {task.assignedTo.map((user: any) => `${user.firstName} ${user.lastName}`).join(', ')}</span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Chip 
                                                                        color={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'primary' : task.status === 'under_review' ? 'warning' : 'default'}
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

export default DepartmentReportPage; 