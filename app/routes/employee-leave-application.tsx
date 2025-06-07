import { Card, CardHeader, CardBody, Button, Input, Select, SelectItem, Textarea, DatePicker } from "@nextui-org/react";
import { Form, useActionData, useLoaderData, useNavigation, redirect } from "@remix-run/react";
import { CalendarDays, Clock, FileText, Send, ArrowLeft } from "lucide-react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { LeaveController } from "~/controller/leave";
import { useEffect, useState } from "react";
import AdminLayout from "~/layout/adminLayout";

// Loader to get user data and departments
export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        // Here you would fetch user and departments data
        // For now, returning mock data structure
        return json({
            user: { id: userId },
            departments: [], // Fetch from DepartmentController
            leaveTypes: [
                { key: 'annual', label: 'Annual Leave' },
                { key: 'sick', label: 'Sick Leave' },
                { key: 'maternity', label: 'Maternity Leave' },
                { key: 'paternity', label: 'Paternity Leave' },
                { key: 'emergency', label: 'Emergency Leave' },
                { key: 'bereavement', label: 'Bereavement Leave' },
                { key: 'personal', label: 'Personal Leave' },
                { key: 'study', label: 'Study Leave' }
            ],
            priorities: [
                { key: 'low', label: 'Low' },
                { key: 'normal', label: 'Normal' },
                { key: 'high', label: 'High' },
                { key: 'urgent', label: 'Urgent' }
            ]
        });
    } catch (error) {
        console.error('Error in loader:', error);
        return redirect("/addentech-login");
    }
}

// Action to handle form submission
export async function action({ request }: ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        formData.set('_method', 'POST');

        const response = await fetch(`${request.url.origin}/api/leaves`, {
            method: 'POST',
            headers: {
                'Cookie': request.headers.get('Cookie') || ''
            },
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            return redirect("/admin/leave-management?success=Application submitted successfully");
        } else {
            return json({ error: result.error || "Failed to submit application" });
        }
    } catch (error) {
        console.error('Error submitting leave application:', error);
        return json({ error: "Failed to submit application" });
    }
}

const EmployeeLeaveApplication = () => {
    const { user, leaveTypes, priorities } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [totalDays, setTotalDays] = useState<number>(0);

    // Calculate total days when dates change
    useEffect(() => {
        if (startDate && endDate) {
            const timeDiff = endDate.getTime() - startDate.getTime();
            const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            setTotalDays(days > 0 ? days : 0);
        } else {
            setTotalDays(0);
        }
    }, [startDate, endDate]);

    return (
        <AdminLayout>
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="light"
                        startContent={<ArrowLeft size={16} />}
                        onClick={() => window.history.back()}
                    >
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            New Leave Application
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Submit a new leave application for approval
                        </p>
                    </div>
                </div>

                {/* Error Display */}
                {actionData?.error && (
                    <Card className="border-danger-200 bg-danger-50">
                        <CardBody>
                            <p className="text-danger-700">{actionData.error}</p>
                        </CardBody>
                    </Card>
                )}

                {/* Application Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText size={20} />
                            <h2 className="text-xl font-semibold">Leave Application Details</h2>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Form method="post" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Leave Type */}
                                <Select
                                    name="leaveType"
                                    label="Leave Type"
                                    placeholder="Select leave type"
                                    isRequired
                                    variant="bordered"
                                >
                                    {leaveTypes.map((type) => (
                                        <SelectItem key={type.key} value={type.key}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </Select>

                                {/* Priority */}
                                <Select
                                    name="priority"
                                    label="Priority"
                                    placeholder="Select priority"
                                    defaultSelectedKeys={["normal"]}
                                    variant="bordered"
                                >
                                    {priorities.map((priority) => (
                                        <SelectItem key={priority.key} value={priority.key}>
                                            {priority.label}
                                        </SelectItem>
                                    ))}
                                </Select>

                                {/* Start Date */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Start Date *
                                    </label>
                                    <Input
                                        type="date"
                                        name="startDate"
                                        variant="bordered"
                                        isRequired
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setStartDate(new Date(e.target.value))}
                                    />
                                </div>

                                {/* End Date */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        End Date *
                                    </label>
                                    <Input
                                        type="date"
                                        name="endDate"
                                        variant="bordered"
                                        isRequired
                                        min={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setEndDate(new Date(e.target.value))}
                                    />
                                </div>
                            </div>

                            {/* Total Days Display */}
                            {totalDays > 0 && (
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardBody className="py-4">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays size={16} className="text-blue-600" />
                                            <span className="text-blue-800 font-medium">
                                                Total Leave Days: {totalDays} day{totalDays !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            {/* Reason */}
                            <Textarea
                                name="reason"
                                label="Reason for Leave"
                                placeholder="Please provide a detailed reason for your leave application..."
                                variant="bordered"
                                isRequired
                                minRows={4}
                                maxRows={8}
                            />

                            {/* Additional Information */}
                            <Card className="bg-gray-50 border-gray-200">
                                <CardBody>
                                    <h3 className="font-semibold text-gray-800 mb-3">Important Information</h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-start gap-2">
                                            <Clock size={14} className="mt-0.5 text-gray-400" />
                                            <span>Leave applications should be submitted at least 3 days in advance</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Clock size={14} className="mt-0.5 text-gray-400" />
                                            <span>Emergency leaves can be submitted with immediate effect</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Clock size={14} className="mt-0.5 text-gray-400" />
                                            <span>You will receive email notifications about approval status</span>
                                        </li>
                                    </ul>
                                </CardBody>
                            </Card>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="light"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    startContent={<Send size={16} />}
                                    isLoading={isSubmitting}
                                    disabled={!startDate || !endDate || totalDays <= 0}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>

                {/* Leave Policy Information */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Leave Policy Summary</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Annual Leave</h4>
                                <p className="text-sm text-gray-600">21 working days per year</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Sick Leave</h4>
                                <p className="text-sm text-gray-600">12 days per year (medical certificate required for 3+ consecutive days)</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Maternity Leave</h4>
                                <p className="text-sm text-gray-600">126 days (as per local labor law)</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Emergency Leave</h4>
                                <p className="text-sm text-gray-600">Up to 3 days (manager discretion)</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default EmployeeLeaveApplication; 