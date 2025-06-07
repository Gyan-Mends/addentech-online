import { Card, CardHeader, CardBody, Button, Input, Select, SelectItem, Textarea, DatePicker, Chip, Alert } from "@nextui-org/react";
import { Form, useActionData, useLoaderData, useNavigation, redirect } from "@remix-run/react";
import { CalendarDays, Clock, FileText, Send, ArrowLeft, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { LeaveController } from "~/controller/leave";
import { LeaveBalanceController } from "~/controller/leaveBalance";
import Registration from "~/modal/registration";
import LeavePolicy from "~/modal/leavePolicy";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { errorToast, successToast } from "~/components/toast";
import AdminLayout from "~/layout/adminLayout";

// Loader to get user data, policies, and balances
export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        // Get user data
        const user = await Registration.findOne({ email: userId });
        if (!user) {
            return redirect("/addentech-login");
        }

        // Get active leave policies
        const policies = await LeavePolicy.find({ isActive: true }).sort({ leaveType: 1 });
        
        // Get user's leave balances
        const balances = await LeaveBalanceController.getEmployeeBalances(user._id);
        
        // Format leave types from policies
        const leaveTypes = policies.map(policy => ({
            key: policy.leaveType,
            label: policy.leaveType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            policy: {
                description: policy.description,
                defaultAllocation: policy.defaultAllocation,
                maxConsecutiveDays: policy.maxConsecutiveDays,
                minAdvanceNotice: policy.minAdvanceNotice,
                maxAdvanceBooking: policy.maxAdvanceBooking,
                documentRequired: policy.documentRequired,
                approvalLevels: policy.approvalLevels
            }
        }));

        const priorities = [
            { key: 'low', label: 'Low' },
            { key: 'normal', label: 'Normal' },
            { key: 'high', label: 'High' },
            { key: 'urgent', label: 'Urgent' }
        ];

        return json({
            user: {
                id: user._id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                department: user.department,
                role: user.role
            },
            leaveTypes,
            policies,
            balances,
            priorities
        });
    } catch (error) {
        console.error('Error in loader:', error);
        return redirect("/addentech-login");
    }
}

// Action to handle form submission
export async function action({ request }: ActionFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        const formData = await request.formData();
        const leaveType = formData.get("leaveType") as string;
        const startDate = formData.get("startDate") as string;
        const endDate = formData.get("endDate") as string;
        const reason = formData.get("reason") as string;
        const priority = formData.get("priority") as string || 'normal';
        const intent = formData.get("intent") as string;

        switch (intent) {
            case "create":
                console.log("Creating leave application for user:", userId);
                console.log("Form data received:", { leaveType, startDate, endDate, reason, priority });
                
                // Find the user first to get their department
                const user = await Registration.findOne({ email: userId });
                if (!user) {
                    console.log("User not found:", userId);
                    return json({
                        message: "User not found",
                        success: false,
                        status: 404
                    });
                }

                // Get leave policy for validation
                const policy = await LeavePolicy.findOne({ leaveType, isActive: true });
                if (!policy) {
                    return json({
                        message: `Leave policy not found for ${leaveType}`,
                        success: false,
                        status: 400
                    });
                }

                // Calculate total days
                const start = new Date(startDate);
                const end = new Date(endDate);
                const timeDiff = end.getTime() - start.getTime();
                const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

                // Policy validations
                const today = new Date();
                const daysFromNow = Math.ceil((start.getTime() - today.getTime()) / (1000 * 3600 * 24));
                
                // Check advance notice requirement
                if (daysFromNow < policy.minAdvanceNotice) {
                    return json({
                        message: `This leave type requires at least ${policy.minAdvanceNotice} days advance notice`,
                        success: false,
                        status: 400
                    });
                }

                // Check maximum advance booking
                if (daysFromNow > policy.maxAdvanceBooking) {
                    return json({
                        message: `Leave can only be booked up to ${policy.maxAdvanceBooking} days in advance`,
                        success: false,
                        status: 400
                    });
                }

                // Check maximum consecutive days
                if (totalDays > policy.maxConsecutiveDays) {
                    return json({
                        message: `Maximum consecutive days for ${leaveType} is ${policy.maxConsecutiveDays} days`,
                        success: false,
                        status: 400
                    });
                }

                // Check leave balance
                const balanceCheck = await LeaveBalanceController.checkBalance(
                    user._id, 
                    leaveType, 
                    totalDays
                );

                if (!balanceCheck.hasBalance) {
                    return json({
                        message: balanceCheck.message,
                        success: false,
                        status: 400
                    });
                }

                // Build approval workflow based on policy
                const approvalWorkflow = policy.approvalLevels.map((level: any, index: number) => ({
                    approver: null, // Will be set by system based on org structure
                    approverRole: level.role,
                    status: 'pending' as const,
                    order: level.level
                }));

                const leaveData = {
                    employee: user._id,
                    leaveType,
                    startDate: start,
                    endDate: end,
                    totalDays,
                    reason,
                    priority,
                    department: user.department,
                    status: 'pending',
                    approvalWorkflow,
                    submissionDate: new Date(),
                    lastModified: new Date(),
                    isActive: true,
                    // Policy-related fields
                    currentApprovalLevel: 1,
                    needsEscalation: totalDays > (policy.approvalLevels[0]?.maxDays || 5)
                };

                console.log("Leave data to be created:", leaveData);

                // Create the leave application
                const newLeave = await LeaveController.createLeave(leaveData);
                
                // Reserve balance for pending request
                if (newLeave && newLeave._id) {
                    await LeaveBalanceController.reserveBalance(
                        user._id,
                        leaveType,
                        totalDays,
                        newLeave._id.toString()
                    );
                }
                
                console.log("Leave created successfully:", newLeave);
                
                return json({
                    message: "Leave application submitted successfully and balance reserved",
                    success: true,
                    status: 200
                });

            default:
                return json({
                    message: "Bad request",
                    success: false,
                    status: 400
                });
        }
    } catch (error) {
        console.error('Error submitting leave application:', error);
        return json({
            message: "Failed to submit application",
            success: false,
            status: 500
        });
    }
}

const EmployeeLeaveApplication = () => {
    const { user, leaveTypes, balances, priorities } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [totalDays, setTotalDays] = useState<number>(0);
    const [selectedLeaveType, setSelectedLeaveType] = useState<string>('');
    const [validationMessages, setValidationMessages] = useState<string[]>([]);

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

    // Validate against policy when inputs change
    useEffect(() => {
        const messages: string[] = [];
        
        if (selectedLeaveType && totalDays > 0 && startDate) {
            const selectedPolicy = leaveTypes.find(lt => lt.key === selectedLeaveType)?.policy;
            
            if (selectedPolicy) {
                const today = new Date();
                const daysFromNow = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                
                // Check advance notice
                if (daysFromNow < selectedPolicy.minAdvanceNotice) {
                    messages.push(`Requires ${selectedPolicy.minAdvanceNotice} days advance notice`);
                }
                
                // Check max advance booking
                if (daysFromNow > selectedPolicy.maxAdvanceBooking) {
                    messages.push(`Can only book up to ${selectedPolicy.maxAdvanceBooking} days in advance`);
                }
                
                // Check consecutive days
                if (totalDays > selectedPolicy.maxConsecutiveDays) {
                    messages.push(`Maximum ${selectedPolicy.maxConsecutiveDays} consecutive days allowed`);
                }
                
                // Check balance
                const balance = balances.find((b: any) => b.leaveType === selectedLeaveType);
                if (balance && balance.remaining < totalDays) {
                    messages.push(`Insufficient balance. Available: ${balance.remaining} days, Required: ${totalDays} days`);
                }
            }
        }
        
        setValidationMessages(messages);
    }, [selectedLeaveType, totalDays, startDate, leaveTypes, balances]);

    // Get selected leave type policy and balance
    const selectedPolicy = leaveTypes.find(lt => lt.key === selectedLeaveType)?.policy;
    const selectedBalance = balances.find((b: any) => b.leaveType === selectedLeaveType);

    // Handle success/error response with toast
    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message);
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = "/admin/leave-management";
                }, 1500);
            } else {
                errorToast(actionData.message);
            }
        }
    }, [actionData]);

    return (
        <AdminLayout>
            <div className="relative">
                <Toaster position="top-right" />
            </div>
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
                {actionData && !actionData.success && (
                    <Card className="border-danger-200 bg-danger-50">
                        <CardBody>
                            <p className="text-danger-700">{actionData.message}</p>
                        </CardBody>
                    </Card>
                )}

                {/* Success Display */}
                {actionData?.success && (
                    <Card className="border-success-200 bg-success-50">
                        <CardBody>
                            <p className="text-success-700">{actionData.message}</p>
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
                                    onSelectionChange={(keys) => setSelectedLeaveType(Array.from(keys)[0] as string)}
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

                            {/* Policy Information & Balance */}
                            {selectedLeaveType && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Leave Policy Info */}
                                    {selectedPolicy && (
                                        <Card className="border-blue-200 bg-blue-50">
                                            <CardHeader className="pb-2">
                                                <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                                                    <Info size={18} />
                                                    Policy Information
                                                </h3>
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                <div className="space-y-2 text-sm">
                                                    <p><strong>Description:</strong> {selectedPolicy.description}</p>
                                                    <p><strong>Max Consecutive Days:</strong> {selectedPolicy.maxConsecutiveDays}</p>
                                                    <p><strong>Advance Notice:</strong> {selectedPolicy.minAdvanceNotice} days</p>
                                                    <p><strong>Max Advance Booking:</strong> {selectedPolicy.maxAdvanceBooking} days</p>
                                                    {selectedPolicy.documentRequired && (
                                                        <Chip color="warning" size="sm" variant="flat">
                                                            Documentation Required
                                                        </Chip>
                                                    )}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    )}

                                    {/* Balance Information */}
                                    {selectedBalance ? (
                                        <Card className="border-green-200 bg-green-50">
                                            <CardHeader className="pb-2">
                                                <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                                                    <CheckCircle size={18} />
                                                    Your Balance
                                                </h3>
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                <div className="space-y-2 text-sm">
                                                    <p><strong>Total Allocated:</strong> {selectedBalance.totalAllocated} days</p>
                                                    <p><strong>Used:</strong> {selectedBalance.used} days</p>
                                                    <p><strong>Pending:</strong> {selectedBalance.pending} days</p>
                                                    <p className="text-lg font-semibold text-green-700">
                                                        <strong>Available:</strong> {selectedBalance.remaining} days
                                                    </p>
                                                    {selectedBalance.carriedForward > 0 && (
                                                        <Chip color="primary" size="sm" variant="flat">
                                                            +{selectedBalance.carriedForward} carried forward
                                                        </Chip>
                                                    )}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ) : selectedLeaveType && (
                                        <Card className="border-orange-200 bg-orange-50">
                                            <CardBody>
                                                <div className="text-center text-orange-700">
                                                    <AlertTriangle size={24} className="mx-auto mb-2" />
                                                    <p>No balance found for this leave type</p>
                                                    <p className="text-sm">Contact HR for balance setup</p>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {/* Validation Messages */}
                            {validationMessages.length > 0 && (
                                <Alert 
                                    color="warning" 
                                    variant="faded"
                                    startContent={<AlertTriangle size={18} />}
                                    title="Policy Validation Warnings"
                                >
                                    <ul className="list-disc list-inside space-y-1">
                                        {validationMessages.map((message, index) => (
                                            <li key={index}>{message}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}

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

                            {/* Hidden Fields */}
                            <input name="intent" value="create" type="hidden" />

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