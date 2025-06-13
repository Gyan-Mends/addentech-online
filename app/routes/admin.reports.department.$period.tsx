import { Card, CardHeader, CardBody, Button, Select, SelectItem, Spinner, Chip, Progress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Form, Link, useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import { json, LoaderFunction, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import { ReportController } from "~/controller/reportController";
import { ArrowLeft, Download, Calendar, BarChart3, TrendingUp, Users, Clock, Activity, Award, ChevronDown, FileText, Printer, CheckCircle } from "lucide-react";
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
                                <div className="p-2 bg-action-primary rounded-lg">
                                    <Icon className="w-6 h-6 text-dashboard-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-dashboard-primary">
                                        {periodLabels[period as keyof typeof periodLabels]} Department Report
                                    </h1>
                                    <p className="text-dashboard-secondary mt-1">
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
                <Card className="bg-dashboard-secondary border border-white/10">
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select 
                                label="Select Department"
                                placeholder="Choose a department"
                                value={selectedDepartment || ''}
                                onChange={(e) => handleDepartmentChange(e.target.value)}
                                classNames={{
                                    label: "text-dashboard-primary",
                                    trigger: "bg-dashboard-secondary border border-white/20 text-dashboard-primary",
                                    popoverContent: "bg-dashboard-secondary border border-white/20"
                                }}
                            >
                                {departments?.map((dept: any) => (
                                    <SelectItem key={dept._id} value={dept._id} className="text-dashboard-primary">
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            
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
                                <Chip color="primary" variant="flat" className="h-10 bg-action-primary text-dashboard-primary">
                                    {periodLabels[period as keyof typeof periodLabels]} Report
                                </Chip>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Report Content */}
                {!selectedDepartment ? (
                    <Card className="bg-dashboard-secondary border border-white/10">
                        <CardBody className="text-center py-12">
                            <Users className="w-16 h-16 text-dashboard-muted mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-dashboard-primary mb-2">Select a Department</h3>
                            <p className="text-dashboard-secondary">Choose a department from the dropdown above to generate the report</p>
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
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="bg-dashboard-secondary border border-white/20 hover:border-blue-400/50 transition-colors">
                                <CardBody className="text-center">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <Activity className="w-6 h-6 text-metric-blue" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-metric-blue">{report.summary.totalActivities}</h3>
                                    <p className="text-dashboard-primary font-medium">Total Activities</p>
                                    <p className="text-sm text-dashboard-secondary">This {period}</p>
                                </CardBody>
                            </Card>
                            <Card className="bg-dashboard-secondary border border-white/20 hover:border-emerald-400/50 transition-colors">
                                <CardBody className="text-center">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <Clock className="w-6 h-6 text-metric-green" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-metric-green">{report.summary.totalHours.toFixed(1)}</h3>
                                    <p className="text-dashboard-primary font-medium">Total Hours</p>
                                    <p className="text-sm text-dashboard-secondary">Logged time</p>
                                </CardBody>
                            </Card>
                            <Card className="bg-dashboard-secondary border border-white/20 hover:border-violet-400/50 transition-colors">
                                <CardBody className="text-center">
                                    <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <Users className="w-6 h-6 text-metric-purple" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-metric-purple">{report.summary.uniqueUsers}</h3>
                                    <p className="text-dashboard-primary font-medium">Active Users</p>
                                    <p className="text-sm text-dashboard-secondary">Department members</p>
                                </CardBody>
                            </Card>
                            <Card className="bg-dashboard-secondary border border-white/20 hover:border-amber-400/50 transition-colors">
                                <CardBody className="text-center">
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle className="w-6 h-6 text-metric-orange" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-metric-orange">{report.summary.assignedTasks || 0}</h3>
                                    <p className="text-dashboard-primary font-medium">Assigned Tasks</p>
                                    <p className="text-sm text-dashboard-secondary">Total tasks</p>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Task Status Breakdown */}
                        {report.summary.taskStatusBreakdown && Object.keys(report.summary.taskStatusBreakdown).length > 0 && (
                        <Card className="bg-dashboard-secondary border border-white/20">
                            <CardHeader>
                                <h2 className="text-xl font-semibold text-dashboard-primary">Task Status Overview</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {Object.entries(report.summary.taskStatusBreakdown).map(([status, count]: [string, any]) => (
                                        <div key={status} className="text-center p-4 bg-dashboard-tertiary rounded-lg border border-white/10 hover:border-white/30 transition-colors">
                                            <Chip 
                                                color={status === 'completed' ? 'success' : status === 'in_progress' ? 'primary' : status === 'under_review' ? 'warning' : 'default'} 
                                                variant="flat"
                                                className="mb-3"
                                            >
                                                {status.replace('_', ' ').toUpperCase()}
                                            </Chip>
                                            <p className="text-2xl font-bold text-dashboard-primary">{count}</p>
                                            <p className="text-sm text-dashboard-secondary font-medium">tasks</p>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                        )}

                        {/* Activity Breakdown */}
                        <Card className="bg-dashboard-secondary border border-white/20">
                            <CardHeader>
                                <h2 className="text-xl font-semibold text-dashboard-primary">Activity Breakdown for {year}</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {report.summary.activityBreakdown?.map((activity: any) => (
                                        <div key={activity._id} className="text-center p-4 bg-dashboard-tertiary rounded-lg border border-white/10 hover:border-white/30 transition-colors">
                                            <Chip 
                                                color={getActivityColor(activity._id)} 
                                                variant="flat"
                                                className="mb-3"
                                            >
                                                {formatActivityType(activity._id)}
                                            </Chip>
                                            <p className="text-2xl font-bold text-dashboard-primary">{activity.count}</p>
                                            {activity.totalHours > 0 && (
                                                <p className="text-sm text-dashboard-secondary font-medium">{activity.totalHours}h logged</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* All Assigned Tasks */}
                        {report.summary.assignedTasksList && report.summary.assignedTasksList.length > 0 && (
                        <Card className="bg-dashboard-secondary border border-white/10">
                            <CardHeader>
                                <h2 className="text-xl font-semibold text-dashboard-primary">All Department Tasks ({year})</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-3">
                                    {report.summary.assignedTasksList.map((task: any) => (
                                        <div key={task._id} className="flex justify-between items-center p-4 bg-dashboard-tertiary border border-white/10 rounded-lg hover:bg-dashboard-primary transition-colors">
                                            <div className="flex-grow">
                                                <h5 className="font-semibold text-dashboard-primary">{task.title}</h5>
                                                <div className="text-sm text-dashboard-secondary mt-1">
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
                        <Card className="bg-dashboard-secondary border border-white/10">
                            <CardHeader>
                                <h2 className="text-xl font-semibold text-dashboard-primary">{periodLabels[period as keyof typeof periodLabels]} Breakdown</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-6">
                                    {report.periodBreakdown && Object.entries(report.periodBreakdown)
                                        .filter(([periodName, data]) => periodName && data)
                                        .map(([periodName, data]: [string, any]) => (
                                        <div key={periodName || 'unknown'} className="border border-white/10 rounded-lg p-4 bg-dashboard-tertiary">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-dashboard-primary">
                                                    {periodName || 'Unknown Period'}
                                                </h3>
                                                <div className="text-sm text-dashboard-secondary">
                                                    {new Date(data.dateRange.start).toLocaleDateString()} - {new Date(data.dateRange.end).toLocaleDateString()}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div className="text-center p-4 bg-dashboard-secondary rounded-lg border border-white/20 hover:border-blue-400/50 transition-colors">
                                                    <p className="text-2xl font-bold text-metric-blue">{data.totalActivities}</p>
                                                    <p className="text-sm text-dashboard-primary font-medium">Activities</p>
                                                </div>
                                                <div className="text-center p-4 bg-dashboard-secondary rounded-lg border border-white/20 hover:border-emerald-400/50 transition-colors">
                                                    <p className="text-2xl font-bold text-metric-green">{data.totalHours.toFixed(1)}</p>
                                                    <p className="text-sm text-dashboard-primary font-medium">Hours</p>
                                                </div>
                                                <div className="text-center p-4 bg-dashboard-secondary rounded-lg border border-white/20 hover:border-violet-400/50 transition-colors">
                                                    <p className="text-2xl font-bold text-metric-purple">{data.activityStats?.length || 0}</p>
                                                    <p className="text-sm text-dashboard-primary font-medium">Activity Types</p>
                                                </div>
                                                <div className="text-center p-4 bg-dashboard-secondary rounded-lg border border-white/20 hover:border-amber-400/50 transition-colors">
                                                    <p className="text-2xl font-bold text-metric-orange">{data.assignedTasks || 0}</p>
                                                    <p className="text-sm text-dashboard-primary font-medium">Assigned Tasks</p>
                                                </div>
                                            </div>

                                            {data.activityStats && data.activityStats.length > 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    {data.activityStats.map((activity: any) => (
                                                        <div key={activity._id} className="flex justify-between items-center p-2 bg-dashboard-secondary border border-white/10 rounded">
                                                            <span className="font-medium text-dashboard-primary">{formatActivityType(activity._id)}</span>
                                                            <div className="text-right">
                                                                <span className="font-bold text-dashboard-primary">{activity.totalCount}</span>
                                                                {activity.totalHours > 0 && (
                                                                    <span className="text-sm text-dashboard-secondary ml-2">({activity.totalHours}h)</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Assigned Tasks for this period */}
                                            {data.tasksList && data.tasksList.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="font-semibold mb-3 text-dashboard-primary">Tasks Assigned in this Period</h4>
                                                    <div className="space-y-2">
                                                        {data.tasksList.map((task: any) => (
                                                            <div key={task._id} className="flex justify-between items-center p-3 bg-dashboard-secondary border border-white/10 rounded-lg">
                                                                <div className="flex-grow">
                                                                    <h5 className="font-medium text-dashboard-primary">{task.title}</h5>
                                                                    <p className="text-sm text-dashboard-secondary">
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