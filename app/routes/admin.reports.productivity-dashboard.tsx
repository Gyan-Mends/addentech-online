import { Card, CardHeader, CardBody, Button, Select, SelectItem, DateInput, Chip } from "@nextui-org/react";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { json, LoaderFunction, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import { ReportController } from "~/controller/reportController";
import { ArrowLeft, TrendingUp, Activity, Clock, Users, Calendar, BarChart3 } from "lucide-react";
import AdminLayout from "~/layout/adminLayout";
import { useState, useEffect } from "react";

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
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

        const url = new URL(request.url);
        const departmentId = url.searchParams.get('department');
        const userIdParam = url.searchParams.get('user');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

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
            // Staff cannot filter by department (they only see their own tasks)
            departments = [];
        }

        // Get users for selection based on role
        let users = [];
        if (currentUser.role === 'admin') {
            // Admin can see all users
            users = await Registration.find({ status: 'active' }, 'firstName lastName email role department');
        } else if (currentUser.role === 'manager') {
            // Manager can see all users
            users = await Registration.find({ status: 'active' }, 'firstName lastName email role department');
        } else if (currentUser.role === 'department_head') {
            // HOD can see their department users
            users = await Registration.find({ 
                department: currentUser.department, 
                status: 'active' 
            }, 'firstName lastName email role');
        } else if (currentUser.role === 'staff') {
            // Staff can only see themselves
            users = [await Registration.findById(currentUser._id, 'firstName lastName email role department')];
        }

        // Generate productivity dashboard with role-based filtering
        const filters = {
            department: departmentId || undefined,
            userId: userIdParam || undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            requestingUserRole: currentUser.role,
            requestingUserId: currentUser._id
        };

        // Apply role-based restrictions
        if (currentUser.role === 'department_head') {
            // HOD can only see their department
            filters.department = currentUser.department;
        } else if (currentUser.role === 'staff') {
            // Staff can only see their own activities
            filters.userId = currentUser._id;
            delete filters.department; // Remove department filter for staff
        }

        const dashboardResult = await ReportController.getProductivityDashboard(filters);
        const dashboard = dashboardResult.success ? dashboardResult.data : [];

        return json({
            departments,
            users,
            dashboard,
            filters,
            currentUser: {
                id: currentUser._id,
                email: currentUser.email,
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                role: currentUser.role,
                department: currentUser.department
            }
        });
    } catch (error: any) {
        console.error('Error loading productivity dashboard:', error);
        return json({
            departments: [],
            users: [],
            dashboard: [],
            filters: {},
            currentUser: null,
            error: `Failed to load data: ${error?.message || error}`
        });
    }
};

const ProductivityDashboard = () => {
    const { departments, users, dashboard, filters, currentUser, error } = useLoaderData<typeof loader>();
    const [searchParams, setSearchParams] = useSearchParams();

    const updateFilter = (key: string, value: string | null) => {
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) {
            newSearchParams.set(key, value);
        } else {
            newSearchParams.delete(key);
        }
        setSearchParams(newSearchParams);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getActivityColor = (type: string) => {
        const colors = {
            created: 'primary',
            assigned: 'secondary',
            delegated: 'warning',
            status_changed: 'default',
            completed: 'success',
            commented: 'primary',
            time_logged: 'warning',
            updated: 'default'
        };
        return colors[type as keyof typeof colors] || 'default';
    };

    const formatActivityType = (type: string) => {
        return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Calculate summary statistics
    const totalActivities = dashboard.reduce((sum: number, day: any) => sum + day.totalActivities, 0);
    const totalHours = dashboard.reduce((sum: number, day: any) => sum + day.totalHours, 0);
    const averageDailyActivities = dashboard.length > 0 ? (totalActivities / dashboard.length).toFixed(1) : '0';
    const averageDailyHours = dashboard.length > 0 ? (totalHours / dashboard.length).toFixed(1) : '0';

    // Get unique activity types across all days
    const allActivityTypes = new Set<string>();
    dashboard.forEach((day: any) => {
        day.activities.forEach((activity: any) => {
            allActivityTypes.add(activity.type);
        });
    });

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
                                <div className="p-2 bg-avatar-orange rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-dashboard-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-dashboard-primary">Productivity Dashboard</h1>
                                    <p className="text-dashboard-secondary mt-1">
                                        Real-time task activity and productivity metrics
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="bg-dashboard-secondary border border-white/10">
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-dashboard-primary">Filters</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Select 
                                label="Department"
                                placeholder="All departments"
                                value={filters.department || ''}
                                onChange={(e) => updateFilter('department', e.target.value || null)}
                                classNames={{
                                    label: "text-dashboard-primary",
                                    trigger: "bg-dashboard-secondary border border-white/20 text-dashboard-primary",
                                    popoverContent: "bg-dashboard-secondary border border-white/20"
                                }}
                            >
                                <SelectItem key="" value="" className="text-dashboard-primary">All Departments</SelectItem>
                                {departments?.map((dept: any) => (
                                    <SelectItem key={dept._id} value={dept._id} className="text-dashboard-primary">
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            
                            <Select 
                                label="User"
                                placeholder="All users"
                                value={filters.userId || ''}
                                onChange={(e) => updateFilter('user', e.target.value || null)}
                                classNames={{
                                    label: "text-dashboard-primary",
                                    trigger: "bg-dashboard-secondary border border-white/20 text-dashboard-primary",
                                    popoverContent: "bg-dashboard-secondary border border-white/20"
                                }}
                            >
                                <SelectItem key="" value="" className="text-dashboard-primary">All Users</SelectItem>
                                {users?.map((user: any) => (
                                    <SelectItem key={user._id} value={user._id} className="text-dashboard-primary">
                                        {user.firstName} {user.lastName}
                                    </SelectItem>
                                ))}
                            </Select>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-dashboard-primary">Start Date</label>
                                <input 
                                    type="date"
                                    className="w-full p-2 border border-white/20 rounded-lg bg-dashboard-secondary text-dashboard-primary"
                                    value={filters.startDate ? new Date(filters.startDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => updateFilter('startDate', e.target.value || null)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-dashboard-primary">End Date</label>
                                <input 
                                    type="date"
                                    className="w-full p-2 border border-white/20 rounded-lg bg-dashboard-secondary text-dashboard-primary"
                                    value={filters.endDate ? new Date(filters.endDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => updateFilter('endDate', e.target.value || null)}
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-dashboard-secondary border border-white/20 hover:border-blue-400/50 transition-colors">
                        <CardBody className="text-center">
                            <Activity className="w-12 h-12 text-metric-blue mx-auto mb-3" />
                            <h3 className="text-3xl font-bold text-metric-blue">{totalActivities}</h3>
                            <p className="text-dashboard-primary font-medium">Total Activities</p>
                            <p className="text-sm text-dashboard-secondary">Avg: {averageDailyActivities}/day</p>
                        </CardBody>
                    </Card>
                    <Card className="bg-dashboard-secondary border border-white/20 hover:border-emerald-400/50 transition-colors">
                        <CardBody className="text-center">
                            <Clock className="w-12 h-12 text-metric-green mx-auto mb-3" />
                            <h3 className="text-3xl font-bold text-metric-green">{totalHours.toFixed(1)}</h3>
                            <p className="text-dashboard-primary font-medium">Total Hours</p>
                            <p className="text-sm text-dashboard-secondary">Avg: {averageDailyHours}h/day</p>
                        </CardBody>
                    </Card>
                    <Card className="bg-dashboard-secondary border border-white/20 hover:border-violet-400/50 transition-colors">
                        <CardBody className="text-center">
                            <Calendar className="w-12 h-12 text-metric-purple mx-auto mb-3" />
                            <h3 className="text-3xl font-bold text-metric-purple">{dashboard.length}</h3>
                            <p className="text-dashboard-primary font-medium">Days Tracked</p>
                            <p className="text-sm text-dashboard-secondary">Activity period</p>
                        </CardBody>
                    </Card>
                    <Card className="bg-dashboard-secondary border border-white/20 hover:border-amber-400/50 transition-colors">
                        <CardBody className="text-center">
                            <BarChart3 className="w-12 h-12 text-metric-orange mx-auto mb-3" />
                            <h3 className="text-3xl font-bold text-metric-orange">{allActivityTypes.size}</h3>
                            <p className="text-dashboard-primary font-medium">Activity Types</p>
                            <p className="text-sm text-dashboard-secondary">Different activities</p>
                        </CardBody>
                    </Card>
                </div>

                {/* Activity Types Legend */}
                <Card className="bg-dashboard-secondary border border-white/10">
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-dashboard-primary">Activity Types</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(allActivityTypes).map((type) => (
                                <Chip 
                                    key={type}
                                    color={getActivityColor(type)}
                                    variant="flat"
                                >
                                    {formatActivityType(type)}
                                </Chip>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Daily Activity Timeline */}
                <Card className="bg-dashboard-secondary border border-white/10">
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-dashboard-primary">Daily Activity Timeline</h2>
                    </CardHeader>
                    <CardBody>
                        {dashboard.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="w-16 h-16 text-dashboard-muted mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-dashboard-primary mb-2">No Activity Data</h3>
                                <p className="text-dashboard-secondary">
                                    No activity found for the selected filters and date range
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dashboard.map((day: any) => (
                                    <div key={day._id} className="border border-white/10 rounded-lg p-4 bg-dashboard-tertiary">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-lg font-semibold text-dashboard-primary">{formatDate(day._id)}</h3>
                                            <div className="flex gap-4 text-sm text-dashboard-secondary">
                                                <span>{day.totalActivities} activities</span>
                                                <span>{day.totalHours.toFixed(1)} hours</span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                            {day.activities.map((activity: any, index: number) => (
                                                <div key={index} className="text-center p-2 bg-dashboard-secondary rounded">
                                                    <Chip 
                                                        color={getActivityColor(activity.type)}
                                                        variant="flat"
                                                        size="sm"
                                                        className="mb-1"
                                                    >
                                                        {formatActivityType(activity.type)}
                                                    </Chip>
                                                    <p className="text-sm font-semibold text-dashboard-primary">{activity.count}</p>
                                                    {activity.hours > 0 && (
                                                        <p className="text-xs text-dashboard-secondary">{activity.hours.toFixed(1)}h</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ProductivityDashboard; 