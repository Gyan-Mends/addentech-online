import { Card, CardHeader, CardBody, Button, Progress, Chip, Avatar } from "@nextui-org/react";
import { Link } from "@remix-run/react";
import { CheckCircle, Clock, AlertTriangle, Plus, Eye, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface TaskStats {
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    overdueTasks: number;
    highPriorityTasks: number;
    tasksThisWeek: number;
}

interface Task {
    _id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string;
    progress: number;
    assignedTo: Array<{
        firstName: string;
        lastName: string;
    }>;
}

interface TaskWidgetProps {
    userRole: string;
    userEmail: string;
}

const TaskWidget = ({ userRole, userEmail }: TaskWidgetProps) => {
    const [stats, setStats] = useState<TaskStats>({
        totalTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        highPriorityTasks: 0,
        tasksThisWeek: 0
    });
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                setLoading(true);
                
                // Fetch task statistics based on user role
                const statsResponse = await fetch("/api/tasks/stats", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData.stats || stats);
                }

                // Fetch recent tasks
                const tasksResponse = await fetch("/api/tasks/recent?limit=3", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                
                if (tasksResponse.ok) {
                    const tasksData = await tasksResponse.json();
                    setRecentTasks(tasksData.tasks || []);
                }
            } catch (error) {
                console.error("Failed to fetch task data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTaskData();
    }, [userRole, userEmail]);

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const isOverdue = (dueDate: string, status: string) => {
        if (status === 'completed') return false;
        return new Date() > new Date(dueDate);
    };

    const getWidgetTitle = () => {
        switch (userRole) {
            case 'staff': return 'My Tasks';
            case 'department_head': return 'Department Tasks';
            case 'manager': return 'Team Tasks';
            case 'admin': return 'Task Overview';
            default: return 'Tasks';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">{getWidgetTitle()}</h3>
                </CardHeader>
                <CardBody>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center w-full">
                    <h3 className="text-lg font-semibold">{getWidgetTitle()}</h3>
                    <Link to="/admin/task-management">
                        <Button size="sm" variant="light" startContent={<Eye size={14} />}>
                            View All
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardBody className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{stats.activeTasks}</div>
                        <div className="text-xs text-gray-600">Active</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{stats.completedTasks}</div>
                        <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-red-600">{stats.overdueTasks}</div>
                        <div className="text-xs text-gray-600">Overdue</div>
                    </div>
                </div>

                {/* Progress Ring */}
                {stats.totalTasks > 0 && (
                    <div className="flex justify-center">
                        <div className="relative w-16 h-16">
                            <Progress
                                value={Math.round((stats.completedTasks / stats.totalTasks) * 100)}
                                color="success"
                                className="transform -rotate-90"
                                size="lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-semibold">
                                    {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Tasks */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Recent Tasks</h4>
                    {recentTasks.length > 0 ? (
                        recentTasks.map((task) => (
                            <div key={task._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <Link to={`/admin/task-details/${task._id}`}>
                                        <h5 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">
                                            {task.title}
                                        </h5>
                                    </Link>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Chip
                                            color={getStatusColor(task.status)}
                                            variant="flat"
                                            size="sm"
                                            className="text-xs"
                                        >
                                            {task.status.replace('_', ' ')}
                                        </Chip>
                                        <Chip
                                            color={getPriorityColor(task.priority)}
                                            variant="flat"
                                            size="sm"
                                            className="text-xs"
                                        >
                                            {task.priority}
                                        </Chip>
                                    </div>
                                </div>
                                <div className="text-right ml-2">
                                    <div className={`text-xs ${isOverdue(task.dueDate, task.status) ? 'text-red-600' : 'text-gray-600'}`}>
                                        {formatDate(task.dueDate)}
                                    </div>
                                    {task.progress !== undefined && (
                                        <div className="w-12 mt-1">
                                            <Progress
                                                value={task.progress}
                                                size="sm"
                                                color={task.progress === 100 ? "success" : "primary"}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <Clock size={24} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-xs text-gray-500">No recent tasks</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                    {userRole !== 'staff' && (
                        <Link to="/admin/task-create" className="flex-1">
                            <Button
                                color="primary"
                                variant="flat"
                                size="sm"
                                className="w-full"
                                startContent={<Plus size={14} />}
                            >
                                New Task
                            </Button>
                        </Link>
                    )}
                    <Link to="/admin/task-dashboard" className="flex-1">
                        <Button
                            color="default"
                            variant="flat"
                            size="sm"
                            className="w-full"
                            startContent={<TrendingUp size={14} />}
                        >
                            Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Alert for overdue tasks */}
                {stats.overdueTasks > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle size={16} className="text-red-600" />
                        <span className="text-sm text-red-700">
                            {stats.overdueTasks} task{stats.overdueTasks > 1 ? 's' : ''} overdue
                        </span>
                        <Link to="/admin/task-management?status=overdue" className="ml-auto">
                            <Button color="danger" variant="flat" size="sm">
                                View
                            </Button>
                        </Link>
                    </div>
                )}

                {/* High priority alert */}
                {stats.highPriorityTasks > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <TrendingUp size={16} className="text-orange-600" />
                        <span className="text-sm text-orange-700">
                            {stats.highPriorityTasks} high priority task{stats.highPriorityTasks > 1 ? 's' : ''}
                        </span>
                        <Link to="/admin/task-management?priority=high" className="ml-auto">
                            <Button color="warning" variant="flat" size="sm">
                                View
                            </Button>
                        </Link>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default TaskWidget; 