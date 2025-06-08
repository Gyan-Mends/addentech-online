import { Card, CardHeader, CardBody, Button, Progress, Avatar, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { Link, useLoaderData } from "@remix-run/react";
import { Calendar, Clock, Users, TrendingUp, AlertTriangle, CheckCircle, Target, Timer, Plus, Eye } from "lucide-react";
import { json, LoaderFunction, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { TaskController } from "~/controller/task";
import Registration from "~/modal/registration";
import AdminLayout from "~/layout/adminLayout";

// Loader function to fetch dashboard data
export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        // Get current user information for role-based access
        const currentUser = await Registration.findOne({ email: userId });
        if (!currentUser) {
            return redirect("/addentech-login");
        }

        // Get dashboard data using TaskController
        const dashboardData = await TaskController.getDashboardData(userId);
        
        if (dashboardData.error) {
            return json({
                error: dashboardData.error,
                stats: {},
                recentTasks: [],
                upcomingDeadlines: [],
                currentUser: null
            });
        }

        return json({
            stats: dashboardData.stats,
            recentTasks: dashboardData.recentTasks,
            upcomingDeadlines: dashboardData.upcomingDeadlines,
            currentUser: {
                id: currentUser._id,
                email: currentUser.email,
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                role: currentUser.role,
                department: currentUser.department
            }
        });
    } catch (error: any) {
        console.error('Error loading task dashboard:', error);
        return json({
            error: `Failed to load dashboard: ${error?.message || error}`,
            stats: {
                totalTasks: 0,
                activeTasks: 0,
                completedTasks: 0,
                overdueTasks: 0,
                highPriorityTasks: 0,
                tasksThisWeek: 0
            },
            recentTasks: [],
            upcomingDeadlines: [],
            currentUser: null
        });
    }
};

const TaskDashboard = () => {
    const { stats, recentTasks, upcomingDeadlines, currentUser, error } = useLoaderData<typeof loader>();

    // Utility functions
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
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

    const getPageTitle = () => {
        if (currentUser?.role === 'staff') return `My Task Dashboard`;
        if (currentUser?.role === 'department_head') return `Department Task Dashboard`;
        return `Task Analytics Dashboard`;
    };

    const getPageDescription = () => {
        if (currentUser?.role === 'staff') return 'Overview of your assigned tasks and deadlines';
        if (currentUser?.role === 'department_head') return 'Monitor your department\'s task progress';
        return 'Company-wide task analytics and performance metrics';
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Error Message */}
                {error && (
                    <Card className="border-danger-200 bg-danger-50">
                        <CardBody>
                            <p className="text-danger-700">{error}</p>
                        </CardBody>
                    </Card>
                )}

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {getPageTitle()}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            {getPageDescription()}
                        </p>
                        {currentUser && (
                            <p className="text-gray-600 mt-1">
                                Welcome back, {currentUser.name} | Role: {currentUser.role}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {currentUser?.role !== 'staff' && (
                            <Link to="/admin/task-create">
                                <Button
                                    color="primary"
                                    startContent={<Plus size={16} />}
                                >
                                    New Task
                                </Button>
                            </Link>
                        )}
                        <Link to="/admin/task-management">
                            <Button
                                variant="flat"
                                startContent={<Eye size={16} />}
                            >
                                View All Tasks
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
                                    <p className="text-sm opacity-90">Total Tasks</p>
                                    <p className="text-2xl font-bold">{stats?.totalTasks || 0}</p>
                                </div>
                                <Target size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90">Active Tasks</p>
                                    <p className="text-2xl font-bold">{stats?.activeTasks || 0}</p>
                                </div>
                                <Clock size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90">Completed</p>
                                    <p className="text-2xl font-bold">{stats?.completedTasks || 0}</p>
                                </div>
                                <CheckCircle size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-red-500 to-red-600">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90">Overdue</p>
                                    <p className="text-2xl font-bold">{stats?.overdueTasks || 0}</p>
                                </div>
                                <AlertTriangle size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90">High Priority</p>
                                    <p className="text-2xl font-bold">{stats?.highPriorityTasks || 0}</p>
                                </div>
                                <TrendingUp size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90">This Week</p>
                                    <p className="text-2xl font-bold">{stats?.tasksThisWeek || 0}</p>
                                </div>
                                <Calendar size={24} />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Tasks */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center w-full">
                                <h3 className="text-lg font-semibold">Recent Tasks</h3>
                                <Link to="/admin/task-management">
                                    <Button size="sm" variant="light">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardBody>
                            {recentTasks && recentTasks.length > 0 ? (
                                <div className="space-y-4">
                                    {recentTasks.map((task: any) => (
                                        <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <Link to={`/admin/task-details/${task._id}`}>
                                                    <h4 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                                                        {task.title}
                                                    </h4>
                                                </Link>
                                                <p className="text-sm text-gray-600">{task.category}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Chip
                                                        color={getStatusColor(task.status)}
                                                        variant="flat"
                                                        size="sm"
                                                    >
                                                        {task.status.replace('_', ' ')}
                                                    </Chip>
                                                    <Chip
                                                        color={getPriorityColor(task.priority)}
                                                        variant="flat"
                                                        size="sm"
                                                    >
                                                        {task.priority}
                                                    </Chip>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    Due: {formatDate(task.dueDate)}
                                                </p>
                                                {task.progress !== undefined && (
                                                    <div className="w-20 mt-1">
                                                        <Progress
                                                            value={task.progress}
                                                            size="sm"
                                                            color={task.progress === 100 ? "success" : "primary"}
                                                        />
                                                        <span className="text-xs text-gray-500">
                                                            {task.progress}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No recent tasks</p>
                                    {currentUser?.role !== 'staff' && (
                                        <Link to="/admin/task-create">
                                            <Button
                                                color="primary"
                                                variant="flat"
                                                size="sm"
                                                className="mt-2"
                                                startContent={<Plus size={14} />}
                                            >
                                                Create First Task
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Upcoming Deadlines */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center w-full">
                                <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
                                <Link to="/admin/task-management?sortBy=dueDate&sortOrder=asc">
                                    <Button size="sm" variant="light">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardBody>
                            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingDeadlines.map((task: any) => (
                                        <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${isOverdue(task.dueDate, task.status) ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                                <div>
                                                    <Link to={`/admin/task-details/${task._id}`}>
                                                        <h4 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                                                            {task.title}
                                                        </h4>
                                                    </Link>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {task.assignedTo && task.assignedTo.length > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <Users size={12} className="text-gray-400" />
                                                                <span className="text-xs text-gray-600">
                                                                    {task.assignedTo.length} assignee{task.assignedTo.length > 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <Chip
                                                            color={getPriorityColor(task.priority)}
                                                            variant="flat"
                                                            size="sm"
                                                        >
                                                            {task.priority}
                                                        </Chip>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-medium ${isOverdue(task.dueDate, task.status) ? 'text-red-600' : 'text-orange-600'}`}>
                                                    {formatDate(task.dueDate)}
                                                </p>
                                                {isOverdue(task.dueDate, task.status) && (
                                                    <span className="text-xs text-red-600">Overdue</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No upcoming deadlines</p>
                                    <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>

                {/* Performance Metrics (if not staff) */}
                {currentUser?.role !== 'staff' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardBody className="text-center p-4">
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats?.completedTasks && stats?.totalTasks 
                                        ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
                                        : 0}%
                                </div>
                                <p className="text-sm text-gray-600">Completion Rate</p>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="text-center p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {stats?.activeTasks || 0}
                                </div>
                                <p className="text-sm text-gray-600">Active Tasks</p>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="text-center p-4">
                                <div className="text-2xl font-bold text-orange-600">
                                    {stats?.overdueTasks || 0}
                                </div>
                                <p className="text-sm text-gray-600">Overdue Items</p>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="text-center p-4">
                                <div className="text-2xl font-bold text-purple-600">
                                    {stats?.tasksThisWeek || 0}
                                </div>
                                <p className="text-sm text-gray-600">This Week</p>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Quick Actions</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {currentUser?.role !== 'staff' && (
                                <Link to="/admin/task-create">
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        className="w-full h-16 flex-col"
                                        startContent={<Plus size={20} />}
                                    >
                                        Create Task
                                    </Button>
                                </Link>
                            )}
                            <Link to="/admin/task-management">
                                <Button
                                    color="default"
                                    variant="flat"
                                    className="w-full h-16 flex-col"
                                    startContent={<Eye size={20} />}
                                >
                                    View All Tasks
                                </Button>
                            </Link>
                            <Link to="/admin/task-management?status=overdue">
                                <Button
                                    color="danger"
                                    variant="flat"
                                    className="w-full h-16 flex-col"
                                    startContent={<AlertTriangle size={20} />}
                                >
                                    Overdue Tasks
                                </Button>
                            </Link>
                            <Link to="/admin/task-management?priority=high">
                                <Button
                                    color="warning"
                                    variant="flat"
                                    className="w-full h-16 flex-col"
                                    startContent={<TrendingUp size={20} />}
                                >
                                    High Priority
                                </Button>
                            </Link>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default TaskDashboard; 