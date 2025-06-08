import { Card, CardHeader, CardBody, Button, Input, Select, SelectItem, Textarea, Checkbox, CheckboxGroup, Switch } from "@nextui-org/react";
import { Form, Link, useLoaderData, useActionData, useNavigate } from "@remix-run/react";
import { Save, ArrowLeft, Calendar, Users, Tag, Clock } from "lucide-react";
import { json, LoaderFunction, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { TaskController } from "~/controller/task";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import { useState, useEffect } from "react";
import AdminLayout from "~/layout/adminLayout";

// Loader function to fetch necessary data for task creation
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

        // Check if user can create tasks
        if (currentUser.role === 'staff') {
            return redirect("/admin/task-management");
        }

        // Get departments
        let departments = [];
        if (currentUser.role === 'admin' || currentUser.role === 'manager') {
            departments = await Departments.find();
        } else {
            // Department head can only create tasks for their department
            const userDept = await Departments.findById(currentUser.department);
            if (userDept) {
                departments = [userDept];
            }
        }

        // Get users for assignment based on role
        let users = [];
        if (currentUser.role === 'admin' || currentUser.role === 'manager') {
            users = await Registration.find({ status: 'active' }, 'firstName lastName email role department');
        } else if (currentUser.role === 'department_head') {
            users = await Registration.find({ 
                department: currentUser.department, 
                status: 'active' 
            }, 'firstName lastName email role');
        }

        return json({
            departments,
            users,
            currentUser: {
                id: currentUser._id,
                email: currentUser.email,
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                role: currentUser.role,
                department: currentUser.department
            }
        });
    } catch (error: any) {
        console.error('Error loading task creation data:', error);
        return json({
            departments: [],
            users: [],
            currentUser: null,
            error: `Failed to load data: ${error?.message || error}`
        });
    }
};

// Action function to handle task creation
export async function action({ request }: ActionFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        const formData = await request.formData();
        
        // Extract task data from form
        const taskData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            priority: formData.get('priority') as string,
            category: formData.get('category') as string,
            department: formData.get('department') as string,
            dueDate: new Date(formData.get('dueDate') as string),
            startDate: formData.get('startDate') ? new Date(formData.get('startDate') as string) : undefined,
            estimatedHours: formData.get('estimatedHours') ? parseFloat(formData.get('estimatedHours') as string) : undefined,
            assignedTo: JSON.parse(formData.get('assignedTo') as string || '[]'),
            tags: JSON.parse(formData.get('tags') as string || '[]'),
            approvalRequired: formData.get('approvalRequired') === 'true',
            approvers: JSON.parse(formData.get('approvers') as string || '[]'),
            isRecurring: formData.get('isRecurring') === 'true',
            recurringPattern: formData.get('isRecurring') === 'true' ? {
                frequency: formData.get('recurringFrequency') as string,
                interval: parseInt(formData.get('recurringInterval') as string || '1'),
                endDate: formData.get('recurringEndDate') ? new Date(formData.get('recurringEndDate') as string) : undefined
            } : undefined
        };

        // Validate required fields
        if (!taskData.title || !taskData.description || !taskData.dueDate || !taskData.department) {
            return json({ 
                success: false, 
                message: "Title, description, due date, and department are required",
                errors: {
                    title: !taskData.title ? "Title is required" : "",
                    description: !taskData.description ? "Description is required" : "",
                    dueDate: !taskData.dueDate ? "Due date is required" : "",
                    department: !taskData.department ? "Department is required" : ""
                }
            });
        }

        // Create task using TaskController
        const result = await TaskController.createTask(taskData, userId);
        
        if (result.success) {
            return redirect(`/admin/task-details/${result.task?._id}`);
        } else {
            return json(result);
        }
    } catch (error: any) {
        console.error('Error creating task:', error);
        return json({ 
            success: false, 
            message: `Failed to create task: ${error?.message || error}` 
        });
    }
}

const TaskCreate = () => {
    const { departments, users, currentUser, error } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigate = useNavigate();

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [category, setCategory] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [estimatedHours, setEstimatedHours] = useState('');
    const [assignedTo, setAssignedTo] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [approvalRequired, setApprovalRequired] = useState(false);
    const [approvers, setApprovers] = useState<string[]>([]);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringFrequency, setRecurringFrequency] = useState('weekly');
    const [recurringInterval, setRecurringInterval] = useState('1');
    const [recurringEndDate, setRecurringEndDate] = useState('');

    // Auto-set department for department heads
    useEffect(() => {
        if (currentUser?.role === 'department_head' && departments.length > 0) {
            setSelectedDepartment(departments[0]._id);
        }
    }, [currentUser, departments]);

    // Clear assigned users when department changes
    useEffect(() => {
        setAssignedTo([]);
    }, [selectedDepartment]);

    // Handle tag addition
    const addTag = () => {
        if (currentTag.trim() && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag('');
        }
    };

    // Remove tag
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Get only department heads for the selected department
    const getFilteredUsers = () => {
        if (!selectedDepartment) return [];
        
        // Debug logging
        console.log('Selected Department:', selectedDepartment);
        console.log('All Users:', users);
        
        // Return only department heads for the selected department
        const filteredUsers = users.filter((user: any) => {
            const isDepartmentMatch = user.department === selectedDepartment || 
                                    (user.department && user.department._id === selectedDepartment) ||
                                    (user.department && user.department.toString() === selectedDepartment);
            const isDepartmentHead = user.role === 'department_head';
            
            console.log(`User: ${user.firstName} ${user.lastName}, Dept: ${user.department}, Role: ${user.role}, Match: ${isDepartmentMatch && isDepartmentHead}`);
            
            return isDepartmentMatch && isDepartmentHead;
        });
        
        console.log('Filtered Department Heads:', filteredUsers);
        return filteredUsers;
    };

    // Get department heads count for description
    const getDepartmentHeads = () => {
        return getFilteredUsers();
    };

    // Get users who can approve (managers and above)
    const getApprovalUsers = () => {
        return users.filter((user: any) => 
            user.role === 'admin' || 
            user.role === 'manager' || 
            user.role === 'department_head'
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        // Validate required fields - only prevent submission if validation fails
        if (!title || !description || !dueDate || !selectedDepartment) {
            e.preventDefault();
            alert('Please fill in all required fields: Title, Description, Due Date, and Department');
            return;
        }
        // Let Remix handle the form submission naturally - don't prevent default
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Error/Success Messages */}
                {error && (
                    <Card className="border-danger-200 bg-danger-50">
                        <CardBody>
                            <p className="text-danger-700">{error}</p>
                        </CardBody>
                    </Card>
                )}

                {actionData && !actionData.success && (
                    <Card className="border-danger-200 bg-danger-50">
                        <CardBody>
                            <p className="text-danger-700">{actionData.message}</p>
                        </CardBody>
                    </Card>
                )}

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="light"
                        startContent={<ArrowLeft size={16} />}
                        onClick={() => navigate('/admin/task-management')}
                    >
                        Back to Tasks
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Create New Task
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Fill out the form below to create a new task
                        </p>
                    </div>
                </div>

                {/* Task Creation Form */}
                <Form method="post" onSubmit={handleSubmit}>
                    {/* Hidden inputs for complex data */}
                    <input type="hidden" name="assignedTo" value={JSON.stringify(assignedTo)} />
                    <input type="hidden" name="tags" value={JSON.stringify(tags)} />
                    <input type="hidden" name="approvalRequired" value={approvalRequired.toString()} />
                    <input type="hidden" name="approvers" value={JSON.stringify(approvers)} />
                    <input type="hidden" name="isRecurring" value={isRecurring.toString()} />
                    {startDate && <input type="hidden" name="startDate" value={startDate} />}
                    {estimatedHours && <input type="hidden" name="estimatedHours" value={estimatedHours} />}
                    {isRecurring && (
                        <>
                            <input type="hidden" name="recurringFrequency" value={recurringFrequency} />
                            <input type="hidden" name="recurringInterval" value={recurringInterval} />
                            {recurringEndDate && <input type="hidden" name="recurringEndDate" value={recurringEndDate} />}
                        </>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Task Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Basic Information</h3>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    <Input
                                        name="title"
                                        label="Task Title"
                                        placeholder="Enter task title"
                                        value={title}
                                        onValueChange={setTitle}
                                        isRequired
                                        errorMessage={actionData?.errors?.title}
                                        isInvalid={!!actionData?.errors?.title}
                                    />
                                    
                                    <Textarea
                                        name="description"
                                        label="Description"
                                        placeholder="Describe the task in detail"
                                        value={description}
                                        onValueChange={setDescription}
                                        minRows={4}
                                        isRequired
                                        errorMessage={actionData?.errors?.description}
                                        isInvalid={!!actionData?.errors?.description}
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            name="priority"
                                            label="Priority"
                                            selectedKeys={[priority]}
                                            onSelectionChange={(keys) => setPriority(Array.from(keys)[0] as string)}
                                        >
                                            <SelectItem key="low" value="low">Low</SelectItem>
                                            <SelectItem key="medium" value="medium">Medium</SelectItem>
                                            <SelectItem key="high" value="high">High</SelectItem>
                                            <SelectItem key="critical" value="critical">Critical</SelectItem>
                                        </Select>
                                        
                                        <Input
                                            name="category"
                                            label="Category"
                                            placeholder="e.g., Development, Marketing"
                                            value={category}
                                            onValueChange={setCategory}
                                            startContent={<Tag size={16} />}
                                        />
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Assignment and Department */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Assignment & Department</h3>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    <Select
                                        name="department"
                                        label="Department"
                                        selectedKeys={selectedDepartment ? [selectedDepartment] : []}
                                        onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0] as string)}
                                        isRequired
                                        errorMessage={actionData?.errors?.department}
                                        isInvalid={!!actionData?.errors?.department}
                                        isDisabled={currentUser?.role === 'department_head'}
                                    >
                                        {departments?.map((dept: any) => (
                                            <SelectItem key={dept._id} value={dept._id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Assign To Department Heads"
                                        selectionMode="multiple"
                                        selectedKeys={assignedTo}
                                        onSelectionChange={(keys) => setAssignedTo(Array.from(keys) as string[])}
                                        placeholder={selectedDepartment ? "Select department heads" : "Select department first"}
                                        isDisabled={!selectedDepartment}
                                        description={selectedDepartment ? 
                                            `Department heads available: ${getDepartmentHeads().length}` : 
                                            "Select a department to see available department heads"
                                        }
                                    >
                                        {getFilteredUsers().map((user: any) => (
                                            <SelectItem key={user._id} value={user._id}>
                                                {user.firstName} {user.lastName} (Department Head)
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </CardBody>
                            </Card>

                            {/* Dates and Time */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Timeline</h3>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            type="date"
                                            label="Start Date (Optional)"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            startContent={<Calendar size={16} />}
                                        />
                                        
                                        <Input
                                            name="dueDate"
                                            type="date"
                                            label="Due Date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            isRequired
                                            startContent={<Calendar size={16} />}
                                            errorMessage={actionData?.errors?.dueDate}
                                            isInvalid={!!actionData?.errors?.dueDate}
                                        />
                                    </div>
                                    
                                    <Input
                                        type="number"
                                        label="Estimated Hours (Optional)"
                                        placeholder="0"
                                        value={estimatedHours}
                                        onValueChange={setEstimatedHours}
                                        step="0.5"
                                        min="0"
                                        startContent={<Clock size={16} />}
                                    />
                                </CardBody>
                            </Card>

                            {/* Tags */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Tags</h3>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add a tag"
                                            value={currentTag}
                                            onValueChange={setCurrentTag}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        />
                                        <Button onClick={addTag} color="primary" variant="flat">
                                            Add
                                        </Button>
                                    </div>
                                    
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, index) => (
                                                <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm">
                                                    <span>{tag}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>

                        {/* Sidebar - Additional Options */}
                        <div className="space-y-6">
                            {/* Approval Workflow */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Approval Workflow</h3>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    <Switch
                                        isSelected={approvalRequired}
                                        onValueChange={setApprovalRequired}
                                    >
                                        Requires Approval
                                    </Switch>
                                    
                                    {approvalRequired && (
                                        <Select
                                            label="Approvers"
                                            selectionMode="multiple"
                                            selectedKeys={approvers}
                                            onSelectionChange={(keys) => setApprovers(Array.from(keys) as string[])}
                                            placeholder="Select approvers"
                                        >
                                            {getApprovalUsers().map((user: any) => (
                                                <SelectItem key={user._id} value={user._id}>
                                                    {user.firstName} {user.lastName} ({user.role})
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Recurring Task */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Recurring Task</h3>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    <Switch
                                        isSelected={isRecurring}
                                        onValueChange={setIsRecurring}
                                    >
                                        Make Recurring
                                    </Switch>
                                    
                                    {isRecurring && (
                                        <div className="space-y-3">
                                            <Select
                                                label="Frequency"
                                                selectedKeys={[recurringFrequency]}
                                                onSelectionChange={(keys) => setRecurringFrequency(Array.from(keys)[0] as string)}
                                            >
                                                <SelectItem key="daily" value="daily">Daily</SelectItem>
                                                <SelectItem key="weekly" value="weekly">Weekly</SelectItem>
                                                <SelectItem key="monthly" value="monthly">Monthly</SelectItem>
                                                <SelectItem key="yearly" value="yearly">Yearly</SelectItem>
                                            </Select>
                                            
                                            <Input
                                                type="number"
                                                label="Interval"
                                                placeholder="1"
                                                value={recurringInterval}
                                                onValueChange={setRecurringInterval}
                                                min="1"
                                                description={`Every ${recurringInterval} ${recurringFrequency.replace('ly', '')}(s)`}
                                            />
                                            
                                            <Input
                                                type="date"
                                                label="End Date (Optional)"
                                                value={recurringEndDate}
                                                onChange={(e) => setRecurringEndDate(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Action Buttons */}
                            <Card>
                                <CardBody>
                                    <div className="space-y-3">
                                        <Button
                                            type="submit"
                                            color="primary"
                                            size="lg"
                                            className="w-full"
                                            startContent={<Save size={16} />}
                                        >
                                            Create Task
                                        </Button>
                                        
                                        <Button
                                            variant="light"
                                            size="lg"
                                            className="w-full"
                                            onClick={() => navigate('/admin/task-management')}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default TaskCreate; 