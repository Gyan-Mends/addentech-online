import { 
    Button, 
    Card, 
    CardBody, 
    CardHeader, 
    Input, 
    Select, 
    SelectItem, 
    Textarea, 
    Chip
} from "@nextui-org/react";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import AdminLayout from "~/layout/adminLayout";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { ActionFunctionArgs } from "@remix-run/node";
import { Plus, CheckCircle, Clock, AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Task from "~/modal/task";
import Departments from "~/modal/department";
import React from "react";

// Real task controller implementation
const taskController = {
    async CreateTaskForDepartment(data: any) {
        try {
            console.log("Creating task for department with data:", data);
            
            // Verify user can create tasks for departments (Admin/Manager only)
            if (!data.user || !["admin", "manager"].includes(data.user.role)) {
                return json({
                    message: 'Only Admin and Manager can create tasks for departments',
                    success: false,
                    status: 403
                });
            }
            
            // Find department head for assignment notification
            const departmentHead = await Registration.findOne({ 
                department: data.departmentId, 
                role: "department_head" 
            });
            
            if (!departmentHead) {
                return json({
                    message: 'No department head found for this department',
                    success: false,
                    status: 400
                });
            }
            
            // Create task assigned to department (initially to HOD for further assignment)
            const taskData = {
                title: data.title,
                description: data.description,
                category: data.category || "Operational Tasks",
                priority: data.priority || "Medium (P3)",
                department: data.departmentId,
                assignedOwner: departmentHead._id, // Initially assign to HOD
                createdBy: data.createdBy,
                dueDate: new Date(data.dueDate),
                status: "Not Started",
                estimatedTimeInvestment: { hours: 0, unit: "hours" },
                actualTimeSpent: { hours: 0, unit: "hours" },
                successCriteria: [],
                requiredResources: [],
                stakeholders: [],
                budgetImplications: {
                    estimatedCost: 0,
                    actualCost: 0,
                    currency: "USD",
                    approved: false
                },
                riskFactors: [],
                dependencies: [],
                collaborators: [],
                comments: data.specialInstructions ? [{
                    createdBy: data.createdBy,
                    comment: `Task assigned to department. Special Instructions: ${data.specialInstructions}`,
                    type: "Status Update",
                    visibility: "Team Only",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    reactions: []
                }] : [],
                progressUpdates: [],
                attachments: [],
                approvalWorkflow: [],
                metrics: {
                    viewCount: 0,
                    editCount: 0,
                    completionScore: 0,
                    qualityScore: 0,
                    stakeholderSatisfaction: 0
                },
                recurrence: {
                    isRecurring: false,
                    interval: 1
                },
                archived: false,
                isTemplate: false,
                usageCount: 0,
                taskAssignmentLevel: "department",
                departmentAssignmentComplete: false
            };
            
            console.log("Creating task with data:", taskData);
            
            const task = new Task(taskData);
            const savedTask = await task.save();
            
            console.log("Task saved successfully:", savedTask._id);
            
            // Populate the saved task
            const populatedTask = await Task.findById(savedTask._id)
                .populate('department')
                .populate('createdBy')
                .populate('assignedOwner');
            
            return json({
                message: "Task created and assigned to department successfully",
                task: populatedTask,
                success: true,
                status: 201
            });
            
        } catch (error) {
            console.error("Create task for department error:", error);
            return json({
                message: "Failed to create task for department: " + (error instanceof Error ? error.message : String(error)),
                success: false,
                status: 500,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    },

    async CreateTaskForMember(data: any) {
        try {
            console.log("Creating task for member with data:", data);
            
            // Verify user is HOD
            if (!data.user || data.user.role !== "department_head") {
                return json({
                    message: 'Only department heads can create tasks for their members',
                    success: false,
                    status: 403
                });
            }
            
            // Verify assigned member belongs to the same department
            const assignedMember = await Registration.findById(data.assignedMemberId);
            if (!assignedMember || assignedMember.department.toString() !== data.user.department.toString()) {
                return json({
                    message: 'You can only assign tasks to members of your department',
                    success: false,
                    status: 400
                });
            }
            
            // Create task directly assigned to member
            const taskData = {
                title: data.title,
                description: data.description,
                category: data.category || "Operational Tasks",
                priority: data.priority || "Medium (P3)",
                department: data.user.department,
                assignedOwner: data.assignedMemberId,
                createdBy: data.user._id,
                dueDate: new Date(data.dueDate),
                status: "Not Started",
                estimatedTimeInvestment: { hours: 0, unit: "hours" },
                actualTimeSpent: { hours: 0, unit: "hours" },
                successCriteria: [],
                requiredResources: [],
                stakeholders: [],
                budgetImplications: {
                    estimatedCost: 0,
                    actualCost: 0,
                    currency: "USD",
                    approved: false
                },
                riskFactors: [],
                dependencies: [],
                collaborators: [],
                comments: data.hodInstructions ? [{
                    createdBy: data.user._id,
                    comment: `Task created by HOD. Instructions: ${data.hodInstructions}`,
                    type: "Status Update",
                    visibility: "Team Only",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    reactions: []
                }] : [],
                progressUpdates: [],
                attachments: [],
                approvalWorkflow: [],
                metrics: {
                    viewCount: 0,
                    editCount: 0,
                    completionScore: 0,
                    qualityScore: 0,
                    stakeholderSatisfaction: 0
                },
                recurrence: {
                    isRecurring: false,
                    interval: 1
                },
                archived: false,
                isTemplate: false,
                usageCount: 0,
                taskAssignmentLevel: "member",
                departmentAssignmentComplete: true
            };
            
            const task = new Task(taskData);
            const savedTask = await task.save();
            
            // Populate the saved task
            const populatedTask = await Task.findById(savedTask._id)
                .populate('department')
                .populate('createdBy')
                .populate('assignedOwner');
            
            return json({
                message: "Task created and assigned to member successfully",
                task: populatedTask,
                success: true,
                status: 201
            });
            
        } catch (error) {
            console.error("Create task for member error:", error);
            return json({
                message: "Failed to create task for member: " + (error instanceof Error ? error.message : String(error)),
                success: false,
                status: 500,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
};

interface LoaderData {
    currentUser: {
        _id: string;
        role: string;
        firstName: string;
        lastName: string;
        email: string;
        department?: {
            _id: string;
            name: string;
        };
    };
    departmentUsers: Array<{
        _id: string;
        firstName: string;
        lastName: string;
        role: string;
        position?: string;
    }>;
    departments: Array<{
        _id: string;
        name: string;
    }>;
}

interface ActionData {
    success: boolean;
    message: string;
    details?: string;
    task?: any;
    error?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");
    
    if (!email) {
        return redirect("/addentech-login");
    }
    
    const userData = await Registration.findOne({ email }).populate('department');
    if (!userData) {
        return redirect("/addentech-login");
    }

    // Get department users if user is HOD
    let departmentUsers: any[] = [];
    if (userData.role === "department_head") {
        departmentUsers = await Registration.find({
            department: userData.department,
            role: { $in: ["staff", "member"] }
        });
    }

    // Get all departments for admin/manager
    let departments: any[] = [];
    if (["admin", "manager"].includes(userData.role)) {
        departments = await Departments.find({}, 'name');
    }

    return json<LoaderData>({
        currentUser: {
            _id: userData._id.toString(),
            role: userData.role,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            department: userData.department ? {
                _id: (userData.department as any)._id.toString(),
                name: (userData.department as any).name
            } : undefined
        },
        departmentUsers: departmentUsers.map(user => ({
            _id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            position: user.position
        })),
        departments: departments.map(dept => ({
            _id: dept._id.toString(),
            name: dept.name
        }))
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    console.log("Action called for task creation");
    
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");
    
    if (!email) {
        console.log("No email in session");
        return json<ActionData>({ success: false, message: "User not authenticated" });
    }
    
    const userData = await Registration.findOne({ email }).populate('department');
    if (!userData) {
        console.log("User not found");
        return json<ActionData>({ success: false, message: "User not found" });
    }

    const formData = await request.formData();
    const actionType = formData.get("_action") as string;
    
    console.log("Action type:", actionType);
    console.log("Form data:", Object.fromEntries(formData));

    try {
        switch (actionType) {
            case "create_task_for_department":
                const deptTaskData = {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    category: formData.get("category") as string,
                    priority: formData.get("priority") as string,
                    departmentId: formData.get("departmentId") as string,
                    dueDate: formData.get("dueDate") as string,
                    specialInstructions: formData.get("specialInstructions") as string,
                    createdBy: userData._id,
                    user: userData
                };
                console.log("Calling CreateTaskForDepartment with:", deptTaskData);
                return await taskController.CreateTaskForDepartment(deptTaskData);

            case "create_task_for_member":
                const memberTaskData = {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    category: formData.get("category") as string,
                    priority: formData.get("priority") as string,
                    assignedMemberId: formData.get("assignedMemberId") as string,
                    dueDate: formData.get("dueDate") as string,
                    hodInstructions: formData.get("hodInstructions") as string,
                    user: userData
                };
                console.log("Calling CreateTaskForMember with:", memberTaskData);
                return await taskController.CreateTaskForMember(memberTaskData);

            default:
                console.log("Invalid action type:", actionType);
                return json<ActionData>({ success: false, message: "Invalid action" });
        }
    } catch (error) {
        console.error("Action error:", error);
        return json<ActionData>({ 
            success: false, 
            message: "An error occurred while processing your request",
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

export default function ComprehensiveTaskManagement() {
    const navigation = useNavigation();
    const loaderData = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    
    const [showCreateDrawer, setShowCreateDrawer] = useState(false);
    const [createTaskType, setCreateTaskType] = useState<"department" | "member">("department");

    const isLoading = navigation.state === "loading";
    const isSubmitting = navigation.state === "submitting";

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

    const canCreateForDepartment = ["admin", "manager"].includes(loaderData.currentUser.role);
    const canCreateForMember = loaderData.currentUser.role === "department_head";

    // Close drawer on successful submission
    useEffect(() => {
        if (actionData?.success) {
            setShowCreateDrawer(false);
        }
    }, [actionData?.success]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Task Management System</h1>
                        <p className="text-gray-600">
                            Role: <strong>{loaderData.currentUser.role.replace('_', ' ')}</strong> | 
                            Department: <strong>{loaderData.currentUser.department?.name || "Not assigned"}</strong>
                        </p>
                    </div>
                    
                    {(canCreateForDepartment || canCreateForMember) && (
                        <div className="flex gap-2">
                            {canCreateForDepartment && (
                                <Button
                                    color="primary"
                                    onPress={() => {
                                        console.log("Create task for department button clicked");
                                        setCreateTaskType("department");
                                        setShowCreateDrawer(true);
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
                                        console.log("Create task for member button clicked");
                                        setCreateTaskType("member");
                                        setShowCreateDrawer(true);
                                    }}
                                    startContent={<Plus className="h-4 w-4" />}
                                >
                                    Assign Task to Member
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Debug Information */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardBody className="py-3">
                        <p className="text-sm text-blue-800">
                            <strong>Debug Info:</strong> 
                            Can create for department: {canCreateForDepartment ? "Yes" : "No"} | 
                            Can create for member: {canCreateForMember ? "Yes" : "No"} | 
                            Departments available: {loaderData.departments?.length || 0} | 
                            Department users: {loaderData.departmentUsers?.length || 0}
                        </p>
                    </CardBody>
                </Card>

                {/* Action Feedback */}
                {actionData && (
                    <Card className={`border-l-4 ${actionData.success ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
                        <CardBody className="py-3">
                            <p className={`font-medium ${actionData.success ? 'text-green-800' : 'text-red-800'}`}>
                                {actionData.message}
                            </p>
                            {actionData.error && (
                                <p className="text-sm mt-1 text-red-600">
                                    Error: {actionData.error}
                                </p>
                            )}
                        </CardBody>
                    </Card>
                )}

                {/* Role-based Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardBody className="flex flex-row items-center justify-between p-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Your Role</p>
                                <p className="text-lg font-bold text-gray-900 capitalize">
                                    {loaderData.currentUser.role.replace('_', ' ')}
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
                                <p className="text-sm font-medium text-gray-600">Permissions</p>
                                <p className="text-sm text-gray-900">
                                    {canCreateForDepartment && "Create for Departments"}
                                    {canCreateForMember && "Assign to Members"}
                                    {!canCreateForDepartment && !canCreateForMember && "View Only"}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </CardBody>
                    </Card>

                    {canCreateForMember && (
                        <Card>
                            <CardBody className="flex flex-row items-center justify-between p-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Department Members</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {loaderData.departmentUsers.length}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-purple-600" />
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>

                {/* Workflow Explanation */}
                <Card>
                    <CardHeader>
                        <span className="font-semibold">Task Assignment Workflow</span>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                                <div>
                                    <p className="font-medium">Admin/Manager Creates Task</p>
                                    <p className="text-sm text-gray-600">Admin or Manager creates a task and assigns it to a department</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                                <div>
                                    <p className="font-medium">Department Head Assignment</p>
                                    <p className="text-sm text-gray-600">Department head receives the task and assigns it to specific team members</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                                <div>
                                    <p className="font-medium">Member Execution</p>
                                    <p className="text-sm text-gray-600">Assigned member works on the task and updates status as needed</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                                <div>
                                    <p className="font-medium">Communication & Tracking</p>
                                    <p className="text-sm text-gray-600">All stakeholders can comment, track progress, and receive notifications</p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Create Task Drawer */}
                <div className={`
                    fixed top-0 right-0 h-full w-[500px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50
                    ${showCreateDrawer ? 'translate-x-0' : 'translate-x-full'}
                `}>
                    <div className="h-full flex flex-col">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {createTaskType === "department" 
                                        ? "Create Task for Department" 
                                        : "Assign Task to Department Member"
                                    }
                                </h2>
                                <Button
                                    variant="light"
                                    isIconOnly
                                    onPress={() => setShowCreateDrawer(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <Form 
                                method="post" 
                                className="space-y-6"
                                onSubmit={(e) => {
                                    console.log("Form submitted");
                                    console.log("Form data being submitted:", new FormData(e.currentTarget));
                                }}
                            >
                                <input 
                                    type="hidden" 
                                    name="_action" 
                                    value={createTaskType === "department" ? "create_task_for_department" : "create_task_for_member"} 
                                />
                                
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Basic Information</h3>
                                    <Input
                                        name="title"
                                        label="Task Title"
                                        placeholder="Enter a clear, actionable task title"
                                        isRequired
                                        variant="bordered"
                                    />
                                    <Textarea
                                        name="description"
                                        label="Description"
                                        placeholder="Provide detailed information about what needs to be done"
                                        minRows={3}
                                        isRequired
                                        variant="bordered"
                                    />
                                </div>

                                {/* Assignment */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Assignment</h3>
                                    {createTaskType === "department" ? (
                                        <div>
                                            <Select
                                                name="departmentId"
                                                label="Assign to Department"
                                                placeholder="Select department"
                                                isRequired
                                                variant="bordered"
                                            >
                                                {loaderData.departments?.map((dept) => (
                                                    <SelectItem key={dept._id} value={dept._id}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                            {loaderData.departments?.length === 0 && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    No departments available. Please contact admin.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <Select
                                                name="assignedMemberId"
                                                label="Assign to Member"
                                                placeholder="Select a team member"
                                                isRequired
                                                variant="bordered"
                                            >
                                                {loaderData.departmentUsers?.map((user) => (
                                                    <SelectItem key={user._id} value={user._id}>
                                                        {user.firstName} {user.lastName} - {user.position || user.role}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                            {loaderData.departmentUsers?.length === 0 && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    No department members available.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Task Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Task Details</h3>
                                    <Select
                                        name="priority"
                                        label="Priority Level"
                                        placeholder="Select priority"
                                        defaultSelectedKeys={["Medium (P3)"]}
                                        isRequired
                                        variant="bordered"
                                    >
                                        {priorityLevels.map(priority => (
                                            <SelectItem key={priority} value={priority}>
                                                {priority}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    
                                    <Select
                                        name="category"
                                        label="Category"
                                        placeholder="Select category"
                                        defaultSelectedKeys={["Operational Tasks"]}
                                        variant="bordered"
                                    >
                                        {taskCategories.map(category => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    
                                    <Input
                                        name="dueDate"
                                        label="Due Date"
                                        type="date"
                                        isRequired
                                        variant="bordered"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                {/* Instructions */}
                                <div className="space-y-4">
                                    <Textarea
                                        name={createTaskType === "department" ? "specialInstructions" : "hodInstructions"}
                                        label={createTaskType === "department" ? "Special Instructions" : "Instructions for Member"}
                                        placeholder={createTaskType === "department" 
                                            ? "Any special instructions or requirements for the department head..."
                                            : "Specific instructions, expectations, or requirements for the assigned member..."
                                        }
                                        minRows={2}
                                        variant="bordered"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex gap-3">
                                        <Button 
                                            variant="light" 
                                            onPress={() => setShowCreateDrawer(false)}
                                            className="flex-1"
                                            type="button"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            color="primary" 
                                            type="submit"
                                            isLoading={isSubmitting}
                                            className="flex-1"
                                            isDisabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Creating..." : (createTaskType === "department" ? "Assign to Department" : "Assign to Member")}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>

                {/* Overlay */}
                {showCreateDrawer && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setShowCreateDrawer(false)}
                    />
                )}
            </div>
        </AdminLayout>
    );
} 