import { 
    Button, 
    Card, 
    CardBody, 
    CardHeader, 
    Input, 
    Select, 
    SelectItem, 
    Spinner, 
    Tab, 
    Tabs, 
    Textarea, 
    Chip,
    Badge,
    Progress,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@nextui-org/react";
import { Form, useActionData, useLoaderData, useNavigation, useSubmit, Link } from "@remix-run/react";
import AdminLayout from "~/layout/adminLayout";
import { json, LoaderFunctionArgs, redirect, ActionFunctionArgs } from "@remix-run/node";
import { 
    CheckCircle, 
    Clock, 
    MessageSquare, 
    Plus, 
    Tag, 
    Users, 
    Filter,
    Search,
    Eye,
    Edit,
    Archive,
    AlertTriangle,
    TrendingUp,
    FileText,
    User,
    Calendar,
    ChevronDown,
    MoreVertical,
    Settings
} from "lucide-react";
import { useState, useEffect } from "react";
import { commitSession, getSession } from "~/session";
import Registration from "~/modal/registration";
import Task from "~/modal/task";
import { DepartmentInterface, RegistrationInterface, TaskInterface } from "~/interface/interface";
import department from "~/controller/departments";
import TaskController from "~/controller/task";

// Types for the loader data
interface TaskLoaderData {
    tasks: TaskInterface[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalTasks: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    analytics: {
        totalTasks: number;
        completedTasks: number;
        overdueTasks: number;
        avgCompletionTime: number;
        tasksByStatus: any[];
        tasksByPriority: any[];
    };
    departments: DepartmentInterface[];
    users: RegistrationInterface[];
    currentUser: RegistrationInterface;
    filters: {
        status: string;
        priority: string;
        category: string;
        departmentId: string;
        assignedTo: string;
        searchTerm: string;
    };
}

// Types for action data
interface TaskActionData {
    success: boolean;
    message: string;
    task?: TaskInterface;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");
    
    // Check for user authorization
    if (!email) {
        console.log("No email in session, redirecting to login");
        return redirect("/addentech-login");
    }
    
    // Get user data from database using email
    const userData = await Registration.findOne({ email }).populate('department');
    if (!userData) {
        console.log("User not found in database, redirecting to login");
        return redirect("/addentech-login");
    }
    
    console.log("User found:", {
        email: userData.email,
        role: userData.role,
        department: userData.department,
        permissions: userData.permissions
    });
    
    // Check role-based permissions - include both variations of department head role
    const hasTaskPermission = 
        userData.role === "admin" || 
        userData.role === "manager" ||
        userData.role === "department_head" ||
        userData.role === "head" || // Include this variation too
        userData.role === "staff";
    
    console.log("Task permission check:", {
        userRole: userData.role,
        hasPermission: hasTaskPermission
    });
    
    if (!hasTaskPermission) {
        console.log("User does not have task permission, redirecting");
        return redirect("/admin?error=You do not have permission to access tasks");
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const status = url.searchParams.get("status") || "";
    const priority = url.searchParams.get("priority") || "";
    const category = url.searchParams.get("category") || "";
    const departmentId = url.searchParams.get("department") || "";
    const assignedTo = url.searchParams.get("assignedTo") || "";
    const searchTerm = url.searchParams.get("search") || "";

    // Get tasks with filters - using direct database query like usersController pattern
    try {
        const query: any = {};
        
        // Base visibility rules - more specific based on role and task assignment level
        if (userData.role === "admin" || userData.role === "manager") {
            // Admin and managers can see all tasks
            // No additional filters needed
        } else if (userData.role === "department_head" || userData.role === "head") {
            // Department heads can see:
            // 1. Tasks assigned to their department (department-level tasks)
            // 2. Tasks they created 
            // 3. Tasks assigned to them personally
            // 4. Tasks they collaborate on
            query.$or = [
                { 
                    department: userData.department,
                    taskAssignmentLevel: "department" // Department-level tasks
                },
                { 
                    department: userData.department,
                    assignedOwner: userData._id // Tasks assigned to them personally
                },
                { createdBy: userData._id }, // Tasks they created
                { 'collaborators.user': userData._id } // Tasks they collaborate on
            ];
        } else if (userData.role === "staff") {
            // Staff can only see:
            // 1. Tasks assigned to them personally
            // 2. Tasks they created (if any)
            // 3. Tasks they collaborate on
            query.$or = [
                { assignedOwner: userData._id }, // Tasks assigned to them
                { createdBy: userData._id }, // Tasks they created (if any)
                { 'collaborators.user': userData._id } // Tasks they collaborate on
            ];
        } else {
            // Unknown role - no access to tasks
            query._id = null; // This will return no results
        }
        
        // Apply filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;
        if (departmentId) query.department = departmentId;
        if (assignedTo) query.assignedOwner = assignedTo;
        query.archived = false; // Don't include archived tasks
        
        // Search filter
        if (searchTerm) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ]
            });
        }
        
        const skip = (page - 1) * limit;
        
        const tasks = await Task.find(query)
            .populate('department')
            .populate('assignedOwner')
            .populate('createdBy')
            .populate('collaborators.user')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const totalTasks = await Task.countDocuments(query);
        
        console.log("Tasks fetched:", {
            totalFound: tasks.length,
            totalInDB: totalTasks,
            userRole: userData.role,
            userDepartment: userData.department,
            query: JSON.stringify(query, null, 2),
            taskTitles: tasks.map((t: any) => t.title)
        });
        
        // Calculate analytics from the fetched tasks
        const analytics = {
            totalTasks: tasks?.length || 0,
            completedTasks: tasks?.filter((t: any) => t.status === "Completed").length || 0,
            overdueTasks: tasks?.filter((t: any) => new Date(t.dueDate) < new Date() && t.status !== "Completed").length || 0,
            avgCompletionTime: 0,
            tasksByStatus: [],
            tasksByPriority: []
        };

        // Get departments and users for filters - matching the pattern from admin.users.tsx
        const departmentResult = await department.getDepartments({
            request,
            page: 1,
            search_term: ""
        });
        const users = await Registration.find({}, 'firstName lastName email role department');

        return json({
            tasks: tasks || [],
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTasks / limit),
                totalTasks,
                hasNextPage: page < Math.ceil(totalTasks / limit),
                hasPrevPage: page > 1
            },
            analytics,
            departments: departmentResult.departments || [],
            users: users || [],
            currentUser: userData,
            filters: {
                status,
                priority,
                category,
                departmentId,
                assignedTo,
                searchTerm
            }
        });
        
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return json({
            tasks: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalTasks: 0,
                hasNextPage: false,
                hasPrevPage: false
            },
            analytics: {
                totalTasks: 0,
                completedTasks: 0,
                overdueTasks: 0,
                avgCompletionTime: 0,
                tasksByStatus: [],
                tasksByPriority: []
            },
            departments: [],
            users: [],
            currentUser: userData,
            filters: {
                status,
                priority,
                category,
                departmentId,
                assignedTo,
                searchTerm
            }
        });
    }
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");
    
    if (!email) {
        return json({ success: false, message: "User not authenticated" });
    }
    
    // Get user data from database using email
    const userData = await Registration.findOne({ email }).populate('department');
    if (!userData) {
        return json({ success: false, message: "User not found" });
    }

    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    try {
        console.log("Task action attempted:", {
            intent,
            userRole: userData.role,
            userDepartment: userData.department,
            userId: userData._id
        });
        
        switch (intent) {
            case "create_task_for_department":
                // Admin/Manager creates task for department
                return await TaskController.CreateTaskForDepartment({
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    category: formData.get("category") as string || "Operational Tasks",
                    priority: formData.get("priority") as string || "Medium (P3)",
                    departmentId: formData.get("departmentId") as string,
                    dueDate: formData.get("dueDate") as string,
                    specialInstructions: formData.get("specialInstructions") as string,
                    createdBy: userData._id.toString(),
                    user: userData
                });

            case "create_task_for_member":
                // HOD creates task directly for member
                const memberTaskResult = await TaskController.CreateTaskForMember({
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    category: formData.get("category") as string || "Operational Tasks",
                    priority: formData.get("priority") as string || "Medium (P3)",
                    assignedMemberId: formData.get("assignedMemberId") as string,
                    dueDate: formData.get("dueDate") as string,
                    hodInstructions: formData.get("hodInstructions") as string,
                    user: userData
                });
                console.log("Task for member result:", memberTaskResult);
                return memberTaskResult;

            case "update_status":
                return await TaskController.UpdateTaskStatusWithPermissions({
                    taskId: formData.get("taskId") as string,
                    status: formData.get("status") as string,
                    statusChangeReason: formData.get("statusChangeReason") as string,
                    user: userData
                });

            case "add_comment":
                return await TaskController.AddCommentWithReply({
                    taskId: formData.get("taskId") as string,
                    comment: formData.get("comment") as string,
                    type: formData.get("commentType") as string || "General",
                    visibility: formData.get("visibility") as string || "Public",
                    parentCommentId: formData.get("parentCommentId") as string,
                    user: userData
                });

            default:
                return json({ success: false, message: "Invalid action" });
        }
    } catch (error) {
        console.error("Action error:", error);
        return json({ 
            success: false, 
            message: "An error occurred while processing your request" 
        });
    }
};

export default function ComprehensiveTaskManagement() {
    const navigation = useNavigation();
    const loaderData = useLoaderData<TaskLoaderData>();
    const actionData = useActionData<TaskActionData>();
    const submit = useSubmit();
    
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createTaskType, setCreateTaskType] = useState<"department" | "member">("department");
    const [filters, setFilters] = useState(loaderData.filters);

    const isLoading = navigation.state === "loading";

    // Task Categories and Priority Levels from Framework
    const taskCategories = [
        "Strategic Initiatives",
        "Operational Tasks", 
        "Project Work",
        "Administrative Tasks",
        "Emergency/Urgent Items"
    ];

    const priorityLevels = [
        "Critical (P1)",
        "High (P2)", 
        "Medium (P3)",
        "Low (P4)"
    ];

    const taskStatuses = [
        "Not Started",
        "In Progress", 
        "Under Review",
        "Completed",
        "Blocked",
        "On Hold",
        "Cancelled"
    ];

    // Handle action responses
    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                // Success toast notification would go here
                setShowCreateModal(false);
                // You can add a page refresh or revalidation here
                window.location.reload();
            } else {
                // Error toast notification would go here
                console.error(actionData.message);
                alert(actionData.message); // Temporary alert, replace with toast
            }
        }
    }, [actionData]);

    // Determine what task creation options user has based on role
    const canCreateForDepartment = ["admin", "manager"].includes(loaderData.currentUser.role);
    const canCreateForMember = ["department_head", "head", "manager"].includes(loaderData.currentUser.role);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Task Management System</h1>
                        <p className="text-gray-600">
                            {loaderData.currentUser.role === "admin" && "Admin view - Manage all organizational tasks"}
                            {loaderData.currentUser.role === "manager" && "Manager view - Oversee and create tasks for departments"}
                            {(loaderData.currentUser.role === "department_head" || loaderData.currentUser.role === "head") && "HOD view - Manage your department's tasks"}
                            {loaderData.currentUser.role === "staff" && "Staff view - Your assigned tasks"}
                        </p>
                    </div>
                    
                    {(canCreateForDepartment || canCreateForMember) && (
                        <div className="flex gap-2">
                            {canCreateForDepartment && (
                                <Button
                                    color="primary"
                                    onPress={() => {
                                        setCreateTaskType("department");
                                        setShowCreateModal(true);
                                    }}
                                    startContent={<Plus className="h-4 w-4" />}
                                >
                                    Create Task for Department
                                </Button>
                            )}
                            
                            {canCreateForMember && (
                                <Button
                                    color="secondary"
                                    onPress={() => {
                                        setCreateTaskType("member");
                                        setShowCreateModal(true);
                                    }}
                                    startContent={<Plus className="h-4 w-4" />}
                                >
                                    Assign Task to Member
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Role-based Task Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardBody className="flex flex-row items-center justify-between p-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Your Tasks</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {loaderData.analytics.totalTasks || 0}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="flex flex-row items-center justify-between p-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {loaderData.analytics.completedTasks || 0}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="flex flex-row items-center justify-between p-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Overdue</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {loaderData.analytics.overdueTasks || 0}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="flex flex-row items-center justify-between p-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {loaderData.tasks.filter((t: any) => t.status === "In Progress").length || 0}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-purple-600" />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Tasks List */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center w-full">
                            <span className="font-semibold">Tasks</span>
                            <div className="flex items-center gap-2">
                                <Chip size="sm" variant="flat">
                                    {loaderData.tasks.length} total
                                </Chip>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <Spinner size="lg" />
                            </div>
                        ) : loaderData.tasks.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    {loaderData.currentUser.role === "staff" 
                                        ? "No tasks assigned to you yet."
                                        : (loaderData.currentUser.role === "department_head" || loaderData.currentUser.role === "head")
                                        ? "No tasks for your department yet. Tasks created for your department will appear here."
                                        : "No tasks found. Create your first task!"
                                    }
                                </p>
                                {(loaderData.currentUser.role === "department_head" || loaderData.currentUser.role === "head") && (
                                    <p className="text-sm text-gray-400 mt-2">
                                        As a department head, you'll see tasks assigned to your department and tasks assigned to you personally.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {loaderData.tasks.map((task: any) => (
                                    <div key={task._id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-lg">{task.title}</h3>
                                                    {task.taskAssignmentLevel === "department" && (
                                                        <Chip size="sm" color="warning" variant="flat">
                                                            Department Task
                                                        </Chip>
                                                    )}
                                                    {task.assignedOwner?._id === loaderData.currentUser._id && (
                                                        <Chip size="sm" color="success" variant="flat">
                                                            Assigned to You
                                                        </Chip>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <Chip size="sm" color="primary" variant="flat">
                                                        {task.category}
                                                    </Chip>
                                                    <Chip 
                                                        size="sm" 
                                                        color={
                                                            task.priority === "Critical (P1)" ? "danger" :
                                                            task.priority === "High (P2)" ? "warning" :
                                                            task.priority === "Medium (P3)" ? "primary" : "default"
                                                        }
                                                        variant="flat"
                                                    >
                                                        {task.priority}
                                                    </Chip>
                                                    <Chip 
                                                        size="sm" 
                                                        color={
                                                            task.status === "Completed" ? "success" :
                                                            task.status === "In Progress" ? "warning" :
                                                            task.status === "Blocked" ? "danger" : "default"
                                                        }
                                                        variant="flat"
                                                    >
                                                        {task.status}
                                                    </Chip>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                                    {task.assignedOwner && (
                                                        <p>Assigned: {task.assignedOwner.firstName} {task.assignedOwner.lastName}</p>
                                                    )}
                                                    {task.department && (
                                                        <p>Dept: {task.department.name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t pt-4 mt-4">
                                    <p className="text-sm text-gray-500">
                                        Current user: <strong>{loaderData.currentUser.firstName} {loaderData.currentUser.lastName}</strong> | 
                                        Role: <strong>{loaderData.currentUser.role}</strong> | 
                                        Department: <strong>{(loaderData.currentUser.department as any)?.name || "Not assigned"}</strong>
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Showing {loaderData.tasks.length} tasks based on your role permissions
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Create Task Modal */}
                <Modal 
                    isOpen={showCreateModal} 
                    onClose={() => setShowCreateModal(false)}
                    size="3xl"
                    scrollBehavior="inside"
                >
                    <ModalContent>
                        <ModalHeader>
                            {createTaskType === "department" 
                                ? "Create Task for Department" 
                                : "Assign Task to Member"
                            }
                        </ModalHeader>
                        <ModalBody>
                            <Form method="post" className="space-y-6" id="task-create-form">
                                <input 
                                    type="hidden" 
                                    name="intent" 
                                    value={createTaskType === "department" ? "create_task_for_department" : "create_task_for_member"} 
                                />
                                
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Basic Information</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <Input
                                            name="title"
                                            label="Task Title"
                                            placeholder="Enter task title"
                                            isRequired
                                        />
                                        <Textarea
                                            name="description"
                                            label="Description"
                                            placeholder="Enter detailed task description"
                                            minRows={3}
                                            isRequired
                                        />
                                    </div>
                                </div>

                                {/* Assignment */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Assignment</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {createTaskType === "department" ? (
                                            <Select
                                                name="departmentId"
                                                label="Assign to Department"
                                                placeholder="Select department"
                                                isRequired
                                            >
                                                {loaderData.departments.map((dept: any) => (
                                                    <SelectItem key={dept._id} value={dept._id}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        ) : (
                                            <Select
                                                name="assignedMemberId"
                                                label="Assign to Member"
                                                placeholder="Select member"
                                                isRequired
                                            >
                                                {loaderData.users
                                                    .filter((user: any) => 
                                                        user.department?.toString() === (loaderData.currentUser.department as any)?._id?.toString()
                                                    )
                                                    .map((user: any) => (
                                                        <SelectItem key={user._id} value={user._id}>
                                                            {user.firstName} {user.lastName}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </Select>
                                        )}
                                        
                                        <Select
                                            name="priority"
                                            label="Priority Level"
                                            placeholder="Select priority"
                                            defaultSelectedKeys={["Medium (P3)"]}
                                            isRequired
                                        >
                                            {priorityLevels.map(priority => (
                                                <SelectItem key={priority} value={priority}>
                                                    {priority}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                {/* Timeline & Category */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            name="dueDate"
                                            label="Due Date"
                                            type="date"
                                            isRequired
                                        />
                                        <Select
                                            name="category"
                                            label="Category"
                                            placeholder="Select category"
                                            defaultSelectedKeys={["Operational Tasks"]}
                                        >
                                            {taskCategories.map(category => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="space-y-4">
                                    <Textarea
                                        name={createTaskType === "department" ? "specialInstructions" : "hodInstructions"}
                                        label={createTaskType === "department" ? "Special Instructions for HOD" : "Instructions for Member"}
                                        placeholder={createTaskType === "department" 
                                            ? "Any special instructions for the department head..."
                                            : "Specific instructions for the assigned member..."
                                        }
                                        minRows={2}
                                    />
                                </div>
                            </Form>
                        </ModalBody>
                        <ModalFooter>
                            <Button 
                                variant="light" 
                                onPress={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary" 
                                type="submit"
                                form="task-create-form"
                                isLoading={navigation.state === "submitting"}
                            >
                                {createTaskType === "department" ? "Assign to Department" : "Assign to Member"}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </AdminLayout>
    );
}
