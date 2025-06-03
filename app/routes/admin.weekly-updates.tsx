import { json, LinksFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useActionData, useRevalidator } from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  Tabs, Tab, Card, CardBody, Button, Input, Textarea,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Spinner, Select, SelectItem, Chip, Progress,
  DatePicker, Badge, Avatar, Divider, Tooltip, Switch
} from "@nextui-org/react";
import { 
  FileText, Plus, Calendar, BarChart, Edit, Eye, Trash2, CheckCircle,
  Clock, AlertTriangle, Target, Users, TrendingUp, PlayCircle,
  PauseCircle, CheckSquare, XCircle, Bell, Send, Save, ArrowRight
} from "lucide-react";
import { Form } from "@remix-run/react";
import AdminLayout from "~/layout/adminLayout";
import DataTable from "~/components/DataTable";
import CustomInput from "~/components/ui/CustomInput";
import RichEditor from "~/components/ui/RichEditor";
import { getSession } from "~/session";
import dailyTaskController from "~/controller/dailyTaskController";
import scheduledTaskController from "~/controller/scheduledTaskController";
import Registration from "~/modal/registration";
import department from "~/controller/departments";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" }];
};

// Helper functions
const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatTime = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const getCurrentWeekRange = () => {
  const now = new Date();
  const currentDay = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  monday.setHours(0, 0, 0, 0);
  
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  return {
    start: monday,
    end: friday,
    startFormatted: monday.toISOString().split('T')[0],
    endFormatted: friday.toISOString().split('T')[0]
  };
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent": return "danger";
    case "high": return "warning";
    case "medium": return "primary";
    case "low": return "default";
    default: return "default";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "success";
    case "in_progress": return "primary";
    case "pending": return "default";
    case "cancelled": return "danger";
    default: return "default";
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;
  
  const session = await getSession(request.headers.get("Cookie"));
  const email = session.get("email");

  if (!email) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const user = await Registration.findOne({ email });
  
  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }

  const weekInfo = dailyTaskController.getWeekInfo();
  const weekRange = getCurrentWeekRange();
  const {departmentsResponse} = await department.getDepartments({ request, page, search_term });

  try {
    // Connect to database and fetch real data
    const DailyTask = (await import("~/modal/dailyTask")).default;
    const ScheduledTask = (await import("~/modal/scheduledTask")).default;

    // Calculate date range for current week
    const startDate = new Date(weekRange.start);
    const endDate = new Date(weekRange.end);

    // Fetch current week tasks from database
    const currentWeekTasks = await DailyTask.find({
      user: user._id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
    .populate("department", "name")
    .sort({ date: 1, createdAt: 1 })
    .lean();

    // Fetch weekly preview data
    const weeklyTasks = await DailyTask.find({
      user: user._id,
      weekNumber: weekInfo.weekNumber,
      year: weekInfo.year,
    })
    .populate("department", "name")
    .sort({ date: 1, createdAt: 1 })
    .lean();

    // Calculate weekly summary
    const weeklyPreview = {
      weekNumber: weekInfo.weekNumber,
      year: weekInfo.year,
      summary: {
        totalTasks: weeklyTasks.length,
        completedTasks: weeklyTasks.filter(t => t.status === "completed").length,
        pendingTasks: weeklyTasks.filter(t => t.status === "pending").length,
        inProgressTasks: weeklyTasks.filter(t => t.status === "in_progress").length,
        totalEstimatedHours: weeklyTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
        totalActualHours: weeklyTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
        weeklySubmissionStatus: weeklyTasks.length > 0 ? weeklyTasks[0].weeklySubmissionStatus : "draft",
      },
      tasks: weeklyTasks,
    };

    // Fetch scheduled tasks
    const scheduledTasks = await ScheduledTask.find({
      user: user._id,
      status: "scheduled",
    })
    .populate("department", "name")
    .sort({ dueDate: 1 })
    .lean();

    // Fetch upcoming tasks (next 7 days)
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 7);
    
    const upcomingTasks = await ScheduledTask.find({
      user: user._id,
      status: "scheduled",
      dueDate: {
        $gte: new Date(),
        $lte: upcomingDate,
      },
    })
    .populate("department", "name")
    .sort({ dueDate: 1 })
    .lean();

    // Calculate analytics
    const analytics = {
      totalTasks: currentWeekTasks.length,
      completedTasks: currentWeekTasks.filter(t => t.status === "completed").length,
      pendingTasks: currentWeekTasks.filter(t => t.status === "pending").length,
      inProgressTasks: currentWeekTasks.filter(t => t.status === "in_progress").length,
    };

    return json({
      user,
      weekInfo,
      weekRange,
      departmentsResponse: departmentsResponse || [],
      currentWeekTasks,
      weeklyPreview,
      scheduledTasks,
      upcomingTasks,
      analytics,
    });
  } catch (error) {
    console.error("Error in loader:", error);
    return json({
      user,
      weekInfo,
      weekRange,
      departmentsResponse: departmentsResponse || [],
      currentWeekTasks: [],
      weeklyPreview: null,
      scheduledTasks: [],
      upcomingTasks: [],
      analytics: {},
      error: "Failed to load task data",
    });
  }
};

export const action = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const email = session.get("email");

  if (!email) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const user = await Registration.findOne({ email });
  if (!user) {
    return json({ success: false, message: "User not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const action = formData.get("_action");

  switch (action) {
    case "create_daily_task": {
      const data = {
        user: user._id,
        department: user.department,
        date: formData.get("date"),
        title: formData.get("title"),
        description: formData.get("description"),
        priority: formData.get("priority"),
        estimatedHours: parseFloat(formData.get("estimatedHours") as string) || 0,
        category: formData.get("category"),
        notes: formData.get("notes") || "",
      };
      return dailyTaskController.createTask(data);
    }

    case "update_daily_task": {
      const data = {
        taskId: formData.get("taskId"),
        userId: user._id,
        title: formData.get("title"),
        description: formData.get("description"),
        priority: formData.get("priority"),
        estimatedHours: parseFloat(formData.get("estimatedHours") as string) || 0,
        actualHours: parseFloat(formData.get("actualHours") as string) || 0,
        status: formData.get("status"),
        category: formData.get("category"),
        notes: formData.get("notes") || "",
        challenges: formData.get("challenges") || "",
      };
      return dailyTaskController.updateTask(data);
    }

    case "delete_daily_task": {
      const data = {
        taskId: formData.get("taskId"),
        userId: user._id,
      };
      return dailyTaskController.deleteTask(data);
    }

    case "submit_weekly": {
      return dailyTaskController.submitWeeklyTasks(user._id);
    }

    case "create_scheduled_task": {
      const data = {
        user: user._id,
        department: user.department,
        title: formData.get("title"),
        description: formData.get("description"),
        dueDate: formData.get("dueDate"),
        priority: formData.get("priority"),
        category: formData.get("category"),
        estimatedHours: parseFloat(formData.get("estimatedHours") as string) || 0,
        notes: formData.get("notes") || "",
        reminderSettings: {
          enableReminders: formData.get("enableReminders") === "true",
          daysBefore: parseInt(formData.get("daysBefore") as string) || 1,
          onDueDate: formData.get("onDueDate") === "true",
        },
      };
      return scheduledTaskController.createScheduledTask(data);
    }

    default:
      return json({ success: false, message: "Invalid action" });
  }
};

export default function TaskManagementPage() {
  const actionData = useActionData() as { success?: boolean; message?: string } | undefined;
  const revalidator = useRevalidator();
  const { 
    user, 
    weekInfo, 
    weekRange, 
    departmentsResponse, 
    currentWeekTasks, 
    weeklyPreview, 
    scheduledTasks, 
    upcomingTasks, 
    analytics 
  } = useLoaderData<{ 
    user: any, 
    weekInfo: any, 
    weekRange: any, 
    departmentsResponse: any, 
    currentWeekTasks: any[], 
    weeklyPreview: any, 
    scheduledTasks: any[], 
    upcomingTasks: any[], 
    analytics: any 
  }>();
   
  const [activeTab, setActiveTab] = useState("daily-tasks");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDayTasks, setSelectedDayTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
  const { isOpen: isScheduledModalOpen, onOpen: onScheduledModalOpen, onClose: onScheduledModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isDayDetailModalOpen, onOpen: onDayDetailModalOpen, onClose: onDayDetailModalClose } = useDisclosure();

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "other",
    estimatedHours: 0,
    notes: "",
  });

  const [scheduledForm, setScheduledForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    category: "other",
    estimatedHours: 0,
    notes: "",
    enableReminders: true,
    daysBefore: 1,
    onDueDate: true,
  });

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      category: "other",
      estimatedHours: 0,
      notes: "",
    });
    setSelectedTask(null);
  };

  const resetScheduledForm = () => {
    setScheduledForm({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      category: "other",
      estimatedHours: 0,
      notes: "",
      enableReminders: true,
      daysBefore: 1,
      onDueDate: true,
    });
    setSelectedTask(null);
  };

  // Handle action responses
  useEffect(() => {
    if (actionData) {
      setIsLoading(false);
      if (actionData?.success) {
        // Close modals on success
        onTaskModalClose();
        onScheduledModalClose();
        onDeleteModalClose();
        onDayDetailModalClose();
        
        // Reset forms
        resetTaskForm();
        resetScheduledForm();
        
        // Trigger revalidation to refresh data
        revalidator.revalidate();
      }
    }
  }, [actionData, onTaskModalClose, onScheduledModalClose, onDeleteModalClose, onDayDetailModalClose, revalidator]);

  const isWeekSubmitted = weeklyPreview?.summary?.weeklySubmissionStatus !== "draft";

  const tasksByDate = currentWeekTasks.reduce((acc: any, task: any) => {
    const taskDate = new Date(task.date);
    const dateKey = taskDate.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {});

  const weekDays = [];
  const startDate = new Date(weekRange.start);
  for (let i = 0; i < 5; i++) { // Only show Monday to Friday (5 days)
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    weekDays.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === new Date().toDateString(),
    });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Task Management</h1>
            <p className="text-gray-600 mt-1">
              Week {weekInfo.weekNumber}, {weekInfo.year} • {formatDate(weekRange.start)} - {formatDate(weekRange.end)}
            </p>
        </div>

          <div className="flex space-x-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="font-semibold">{currentWeekTasks.length} tasks</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="font-semibold">
                    {currentWeekTasks.filter(t => t.status === "completed").length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="font-semibold">{upcomingTasks.length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action messages */}
        {actionData && (
          <Card className={`p-4 ${actionData?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`${actionData?.success ? 'text-green-800' : 'text-red-800'}`}>
              {actionData?.message}
            </p>
          </Card>
        )}

        {/* Weekly submission status */}
        {!isWeekSubmitted && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Week Not Submitted</p>
                  <p className="text-sm text-yellow-600">
                    Your tasks for this week are still in draft mode. They will be auto-submitted on Friday at 12 PM.
                  </p>
          </div>
              </div>
              
              <Form method="post">
                <input type="hidden" name="_action" value="submit_weekly" />
                <Button color="warning" type="submit" startContent={<Send className="h-4 w-4" />}>
                  Submit Week Now
                </Button>
              </Form>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="w-full"
        >
          <Tab
            key="daily-tasks"
            title={
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Daily Tasks</span>
              </div>
            }
          />
          <Tab
            key="scheduled-tasks"
            title={
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Scheduled Tasks</span>
                {upcomingTasks.length > 0 && (
                  <Badge color="warning" size="sm">
                    {upcomingTasks.length}
                  </Badge>
                )}
              </div>
            }
          />
            <Tab
            key="weekly-overview"
              title={
              <div className="flex items-center space-x-2">
                <BarChart className="h-4 w-4" />
                <span>Weekly Overview</span>
                </div>
              }
            />
          <Tab
            key="analytics"
            title={
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Analytics</span>
              </div>
            }
          />
        </Tabs>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Daily Tasks Tab */}
          {activeTab === "daily-tasks" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Daily Tasks</h2>
                <Button
                  color="primary"
                  startContent={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    resetTaskForm();
                    onTaskModalOpen();
                  }}
                  isDisabled={isWeekSubmitted}
                >
                  Add Task
                </Button>
              </div>

              {/* Week View */}
              <div className="grid grid-cols-5 gap-4">
                {weekDays.map((day) => {
                  const dayTasks = tasksByDate[day.date] || [];
                  const completedTasks = dayTasks.filter((t: any) => t.status === "completed").length;
                  const pendingTasks = dayTasks.filter((t: any) => t.status === "pending").length;
                  const inProgressTasks = dayTasks.filter((t: any) => t.status === "in_progress").length;

                  return (
                    <Card 
                      key={day.date} 
                      className={`p-4 min-h-[200px] cursor-pointer hover:shadow-lg transition-all ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
                      isPressable
                      onPress={() => {
                        setSelectedDate(day.date);
                        setSelectedDayTasks(dayTasks);
                        onDayDetailModalOpen();
                      }}
                    >
                      <div className="text-center mb-3">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium text-lg">{day.dayName}</p>
                            <p className="text-sm text-gray-600">{day.dayNumber}</p>
                            {day.isToday && (
                              <Badge color="primary" variant="flat" size="sm">Today</Badge>
                            )}
                          </div>
                          {!isWeekSubmitted && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent day card click
                              }}
                            >
                              <Button
                                size="sm"
                                color="primary"
                                variant="light"
                                isIconOnly
                                onPress={() => {
                                  setSelectedDate(day.date);
                                  resetTaskForm();
                                  onTaskModalOpen();
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {dayTasks.length > 0 ? (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800 mb-2">
                              {dayTasks.length}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {dayTasks.length === 1 ? 'Task' : 'Tasks'}
                            </p>
                            
                            <div className="space-y-1">
                              {completedTasks > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-green-600">Completed</span>
                                  <Badge color="success" size="sm">{completedTasks}</Badge>
                                </div>
                              )}
                              {inProgressTasks > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-blue-600">In Progress</span>
                                  <Badge color="primary" size="sm">{inProgressTasks}</Badge>
                                </div>
                              )}
                              {pendingTasks > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-orange-600">Pending</span>
                                  <Badge color="warning" size="sm">{pendingTasks}</Badge>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 text-xs text-gray-500">
                              Click to view details
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="text-gray-300 mb-2">
                              <Calendar className="h-8 w-8 mx-auto" />
                            </div>
                            <p className="text-sm text-gray-400">No tasks</p>
                            {!isWeekSubmitted && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-400 mb-2">
                                  Click + to add tasks
                                </p>
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent day card click
                                  }}
                                >
                                  <Button
                                    size="sm"
                                    color="primary"
                                    variant="flat"
                                    startContent={<Plus className="h-4 w-4" />}
                                    onPress={() => {
                                      setSelectedDate(day.date);
                                      resetTaskForm();
                                      onTaskModalOpen();
                                    }}
                                  >
                                    Add Task
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scheduled Tasks Tab */}
          {activeTab === "scheduled-tasks" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Scheduled Tasks</h2>
                <Button
                  color="primary"
                  startContent={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    resetScheduledForm();
                    onScheduledModalOpen();
                  }}
                >
                  Schedule Task
                </Button>
                    </div>

              {/* Upcoming Tasks */}
              {upcomingTasks.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Upcoming Tasks (Next 7 Days)
                  </h3>
                  <div className="space-y-2">
                    {upcomingTasks.map((task: any) => (
                      <div key={task._id} className="flex items-center justify-between p-3 bg-orange-50 rounded">
                    <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <p className="text-xs text-orange-600 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Due: {formatDate(task.dueDate)}
                          </p>
                    </div>
                        <div className="flex items-center space-x-2">
                          <Chip size="sm" color={getPriorityColor(task.priority)} variant="flat">
                            {task.priority}
                          </Chip>
                    <Button
                            size="sm"
                      color="primary"
                            variant="flat"
                            startContent={<ArrowRight className="h-3 w-3" />}
                    >
                            Move to Daily
                    </Button>
                  </div>
                      </div>
                    ))}
                  </div>
            </Card>
          )}

              {/* All Scheduled Tasks */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">All Scheduled Tasks</h3>
                {scheduledTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No scheduled tasks yet</p>
                    <p className="text-sm">Schedule tasks for future dates to get email reminders</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledTasks.map((task: any) => (
                      <div key={task._id} className="p-3 border rounded hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                    <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">Due: {formatDate(task.dueDate)}</span>
                              <Chip size="sm" color={getPriorityColor(task.priority)} variant="flat">
                                {task.priority}
                              </Chip>
                              <Chip size="sm" variant="flat">{task.category}</Chip>
                    </div>
                    </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="light" isIconOnly>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="light" color="danger" isIconOnly>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                    </div>
                    </div>
                  </div>
                    ))}
                  </div>
                )}
            </Card>
            </div>
          )}

          {/* Weekly Overview Tab */}
          {activeTab === "weekly-overview" && (
                <div className="space-y-6">
              <h2 className="text-xl font-semibold">Weekly Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed</span>
                      <span>{currentWeekTasks.filter(t => t.status === "completed").length}/{currentWeekTasks.length}</span>
                    </div>
                    <Progress 
                      value={currentWeekTasks.length > 0 ? (currentWeekTasks.filter(t => t.status === "completed").length / currentWeekTasks.length) * 100 : 0}
                      color="success"
                    />
                    </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Time Tracking</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Estimated:</span>
                      <span>{currentWeekTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)}h</span>
                  </div>
                    <div className="flex justify-between">
                      <span>Actual:</span>
                      <span>{currentWeekTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)}h</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Status</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span>{currentWeekTasks.filter(t => t.status === "pending").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Progress:</span>
                      <span>{currentWeekTasks.filter(t => t.status === "in_progress").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span>{currentWeekTasks.filter(t => t.status === "completed").length}</span>
                      </div>
                        </div>
                </Card>
                        </div>

              {/* Weekly Summary for Submission */}
              {weeklyPreview && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Weekly Summary</h3>
                  <div className="prose max-w-none">
                    <p>This week I completed {weeklyPreview.summary?.completedTasks || 0} out of {weeklyPreview.summary?.totalTasks || 0} tasks.</p>
                    {/* Add more summary content here */}
                        </div>
                </Card>
                    )}
                  </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
                  <div className="space-y-6">
              <h2 className="text-xl font-semibold">Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{analytics.totalTasks || 0}</p>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                </Card>

                <Card className="p-4 text-center">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{analytics.completedTasks || 0}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </Card>

                <Card className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{analytics.totalActualHours || 0}h</p>
                  <p className="text-sm text-gray-600">Hours Worked</p>
                </Card>

                <Card className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{analytics.productivityRate || 0}%</p>
                  <p className="text-sm text-gray-600">Productivity</p>
                </Card>
                    </div>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Coming Soon</h3>
                <p className="text-gray-600">
                  Advanced analytics including productivity trends, category breakdowns, 
                  and performance insights will be available in future updates.
                </p>
              </Card>
            </div>
          )}
        </div>
                    </div>

      {/* Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={onTaskModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {selectedTask ? "Edit Task" : "Add New Task"}
          </ModalHeader>
          <Form method="post" onSubmit={() => setIsLoading(true)}>
            <ModalBody className="space-y-4">
              <input 
                type="hidden" 
                name="_action" 
                value={selectedTask ? "update_daily_task" : "create_daily_task"} 
              />
              {selectedTask && <input type="hidden" name="taskId" value={selectedTask._id} />}
              
              <Input
                name="date"
                label="Date"
                type="date"
                value={selectedTask ? selectedTask.date?.split('T')[0] : selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                isRequired
                isDisabled={!!selectedTask}
              />

              <Input
                name="title"
                label="Task Title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                isRequired
                placeholder="Enter task title..."
              />

              <Textarea
                name="description"
                label="Description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                isRequired
                placeholder="Describe the task..."
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  name="priority"
                  label="Priority"
                  selectedKeys={[taskForm.priority]}
                  onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                >
                  <SelectItem key="low" value="low">Low</SelectItem>
                  <SelectItem key="medium" value="medium">Medium</SelectItem>
                  <SelectItem key="high" value="high">High</SelectItem>
                  <SelectItem key="urgent" value="urgent">Urgent</SelectItem>
                </Select>

                <Select
                  name="category"
                  label="Category"
                  selectedKeys={[taskForm.category]}
                  onChange={(e) => setTaskForm({...taskForm, category: e.target.value})}
                >
                  <SelectItem key="development" value="development">Development</SelectItem>
                  <SelectItem key="meeting" value="meeting">Meeting</SelectItem>
                  <SelectItem key="documentation" value="documentation">Documentation</SelectItem>
                  <SelectItem key="testing" value="testing">Testing</SelectItem>
                  <SelectItem key="bug_fix" value="bug_fix">Bug Fix</SelectItem>
                  <SelectItem key="client_work" value="client_work">Client Work</SelectItem>
                  <SelectItem key="administrative" value="administrative">Administrative</SelectItem>
                  <SelectItem key="training" value="training">Training</SelectItem>
                  <SelectItem key="other" value="other">Other</SelectItem>
                </Select>
              </div>

              <Input
                name="estimatedHours"
                label="Estimated Hours"
                type="number"
                step="0.5"
                min="0"
                value={taskForm.estimatedHours.toString()}
                onChange={(e) => setTaskForm({...taskForm, estimatedHours: parseFloat(e.target.value) || 0})}
              />

              {selectedTask && (
                <>
                  <Input
                    name="actualHours"
                    label="Actual Hours"
                    type="number"
                    step="0.5"
                    min="0"
                    defaultValue={selectedTask.actualHours?.toString() || "0"}
                  />

                  <Select
                    name="status"
                    label="Status"
                    defaultSelectedKeys={[selectedTask.status]}
                  >
                    <SelectItem key="pending" value="pending">Pending</SelectItem>
                    <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                    <SelectItem key="completed" value="completed">Completed</SelectItem>
                    <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
                  </Select>

                  <Textarea
                    name="challenges"
                    label="Challenges Faced (Optional)"
                    defaultValue={selectedTask.challenges || ""}
                    placeholder="Describe any challenges or obstacles..."
                  />
                </>
              )}

              <Textarea
                name="notes"
                label="Notes (Optional)"
                value={taskForm.notes}
                onChange={(e) => setTaskForm({...taskForm, notes: e.target.value})}
                placeholder="Additional notes..."
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onTaskModalClose}>
                Cancel
              </Button>
              {selectedTask && (
                      <Button
                        color="danger"
                  variant="flat"
                        onPress={() => {
                    onTaskModalClose();
                    onDeleteModalOpen();
                        }}
                      >
                        Delete
                      </Button>
                    )}
              <Button color="primary" type="submit" isLoading={isLoading}>
                {selectedTask ? "Update Task" : "Create Task"}
              </Button>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>

      {/* Scheduled Task Modal */}
      <Modal isOpen={isScheduledModalOpen} onClose={onScheduledModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>Schedule New Task</ModalHeader>
          <Form method="post" onSubmit={() => setIsLoading(true)}>
            <ModalBody className="space-y-4">
              <input type="hidden" name="_action" value="create_scheduled_task" />
              
              <Input
                name="title"
                label="Task Title"
                value={scheduledForm.title}
                onChange={(e) => setScheduledForm({...scheduledForm, title: e.target.value})}
                isRequired
                placeholder="Enter task title..."
              />

              <Textarea
                name="description"
                label="Description"
                value={scheduledForm.description}
                onChange={(e) => setScheduledForm({...scheduledForm, description: e.target.value})}
                isRequired
                placeholder="Describe the task..."
              />

              <Input
                name="dueDate"
                label="Due Date"
                type="date"
                value={scheduledForm.dueDate}
                onChange={(e) => setScheduledForm({...scheduledForm, dueDate: e.target.value})}
                isRequired
                min={new Date().toISOString().split('T')[0]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  name="priority"
                  label="Priority"
                  selectedKeys={[scheduledForm.priority]}
                  onChange={(e) => setScheduledForm({...scheduledForm, priority: e.target.value})}
                >
                  <SelectItem key="low" value="low">Low</SelectItem>
                  <SelectItem key="medium" value="medium">Medium</SelectItem>
                  <SelectItem key="high" value="high">High</SelectItem>
                  <SelectItem key="urgent" value="urgent">Urgent</SelectItem>
                </Select>

                <Select
                  name="category"
                  label="Category"
                  selectedKeys={[scheduledForm.category]}
                  onChange={(e) => setScheduledForm({...scheduledForm, category: e.target.value})}
                >
                  <SelectItem key="development" value="development">Development</SelectItem>
                  <SelectItem key="meeting" value="meeting">Meeting</SelectItem>
                  <SelectItem key="documentation" value="documentation">Documentation</SelectItem>
                  <SelectItem key="testing" value="testing">Testing</SelectItem>
                  <SelectItem key="bug_fix" value="bug_fix">Bug Fix</SelectItem>
                  <SelectItem key="client_work" value="client_work">Client Work</SelectItem>
                  <SelectItem key="administrative" value="administrative">Administrative</SelectItem>
                  <SelectItem key="training" value="training">Training</SelectItem>
                  <SelectItem key="other" value="other">Other</SelectItem>
                </Select>
                  </div>

              <Input
                name="estimatedHours"
                label="Estimated Hours"
                type="number"
                step="0.5"
                min="0"
                value={scheduledForm.estimatedHours.toString()}
                onChange={(e) => setScheduledForm({...scheduledForm, estimatedHours: parseFloat(e.target.value) || 0})}
              />

              <Divider />

              <div className="space-y-4">
                <h4 className="font-medium">Reminder Settings</h4>
                
                <div className="flex items-center justify-between">
                  <span>Enable email reminders</span>
                  <Switch
                    name="enableReminders"
                    isSelected={scheduledForm.enableReminders}
                    onValueChange={(value) => setScheduledForm({...scheduledForm, enableReminders: value})}
                      />
                    </div>

                {scheduledForm.enableReminders && (
                  <>
                    <Input
                      name="daysBefore"
                      label="Days before due date"
                      type="number"
                      min="0"
                      max="30"
                      value={scheduledForm.daysBefore.toString()}
                      onChange={(e) => setScheduledForm({...scheduledForm, daysBefore: parseInt(e.target.value) || 1})}
                      description="Send reminder email this many days before the due date"
                    />

                    <div className="flex items-center justify-between">
                      <span>Send reminder on due date</span>
                      <Switch
                        name="onDueDate"
                        isSelected={scheduledForm.onDueDate}
                        onValueChange={(value) => setScheduledForm({...scheduledForm, onDueDate: value})}
                        />
                      </div>
                  </>
                    )}
                  </div>

              <Textarea
                name="notes"
                label="Notes (Optional)"
                value={scheduledForm.notes}
                onChange={(e) => setScheduledForm({...scheduledForm, notes: e.target.value})}
                placeholder="Additional notes..."
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onScheduledModalClose}>
                      Cancel
                    </Button>
              <Button color="primary" type="submit" isLoading={isLoading}>
                Schedule Task
                    </Button>
            </ModalFooter>
                </Form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this task? This action cannot be undone.</p>
            {selectedTask && (
              <div className="mt-2 p-3 bg-gray-50 rounded">
                <p className="font-medium">{selectedTask.title}</p>
                <p className="text-sm text-gray-600">{selectedTask.description}</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onDeleteModalClose}>
              Cancel
            </Button>
            <Form method="post">
              <input type="hidden" name="_action" value="delete_daily_task" />
              <input type="hidden" name="taskId" value={selectedTask?._id} />
              <Button color="danger" type="submit" isLoading={isLoading}>
                Delete Task
              </Button>
            </Form>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Day Detail Modal */}
      <Modal isOpen={isDayDetailModalOpen} onClose={onDayDetailModalClose} size="5xl">
        <ModalContent>
          <ModalHeader className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">
                Tasks for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            {!isWeekSubmitted && (
              <Button
                color="primary"
                startContent={<Plus className="h-4 w-4" />}
                onPress={() => {
                  resetTaskForm();
                  onDayDetailModalClose();
                  onTaskModalOpen();
                }}
              >
                Add Task
              </Button>
            )}
          </ModalHeader>
          <ModalBody>
            {selectedDayTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Task</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Hours</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedDayTasks.map((task) => (
                      <tr key={task._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-gray-600 truncate max-w-xs">
                              {task.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Chip
                            size="sm"
                            color={getPriorityColor(task.priority)}
                            variant="flat"
                          >
                            {task.priority}
                          </Chip>
                        </td>
                        <td className="px-4 py-3">
                          <Chip
                            size="sm"
                            color={getStatusColor(task.status)}
                            variant="flat"
                          >
                            {task.status}
                          </Chip>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600 capitalize">
                            {task.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div>Est: {task.estimatedHours || 0}h</div>
                            <div className="text-gray-600">Act: {task.actualHours || 0}h</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="light"
                              isIconOnly
                              onPress={() => {
                                setSelectedTask(task);
                                setTaskForm({
                                  title: task.title,
                                  description: task.description,
                                  priority: task.priority,
                                  category: task.category,
                                  estimatedHours: task.estimatedHours,
                                  notes: task.notes,
                                });
                                onDayDetailModalClose();
                                onTaskModalOpen();
                              }}
                              isDisabled={isWeekSubmitted}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!isWeekSubmitted && (
                              <Button
                                size="sm"
                                variant="light"
                                color="danger"
                                isIconOnly
                                onPress={() => {
                                  setSelectedTask(task);
                                  onDayDetailModalClose();
                                  onDeleteModalOpen();
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks for this day</h3>
                <p className="text-gray-600 mb-4">
                  Get started by adding your first task for this day.
                </p>
                {!isWeekSubmitted && (
                  <Button
                    color="primary"
                    startContent={<Plus className="h-4 w-4" />}
                    onPress={() => {
                      resetTaskForm();
                      onDayDetailModalClose();
                      onTaskModalOpen();
                    }}
                  >
                    Add Your First Task
                  </Button>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onDayDetailModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}