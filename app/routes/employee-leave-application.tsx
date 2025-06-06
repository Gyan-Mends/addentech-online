import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Leave, { LeaveTypes, LeavePriority } from "~/modal/leave";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import { DatePicker } from "@nextui-org/react";
import { CalendarDate, parseDate } from "@internationalized/date";
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Users, 
  FileText,
  CheckCircle,
  Info
} from "lucide-react";

interface LeaveBalance {
  totalEntitlement: number;
  totalUsed: number;
  remaining: number;
}

interface ActionData {
  success?: string;
  error?: string;
  errors?: {
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
    priority?: string;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");

    if (!email) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const user = await Registration.findOne({ email }).populate('department');
    if (!user) {
      throw new Response("User not found", { status: 404 });
    }

    // Get leave balance for current user
    const leaveBalance = await (Leave as any).getLeaveBalance(user._id.toString());
    
    // Get team members for handover (same department)
    const teamMembers = await Registration.find({
      department: user.department,
      _id: { $ne: user._id },
      status: 'active'
    }).select('firstName lastName email position');

    // Get upcoming leaves to show conflicts
    const upcomingLeaves = await (Leave as any).getUpcomingLeaves(user.department._id.toString(), 60);

    return json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
        position: user.position
      },
      leaveBalance,
      teamMembers,
      upcomingLeaves
    });

  } catch (error) {
    console.error("Error loading leave application:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");

    if (!email) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await Registration.findOne({ email });
    if (!user) {
      return json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const leaveType = formData.get("leaveType") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const reason = formData.get("reason") as string;
    const priority = formData.get("priority") as string;
    const handoverTo = formData.get("handoverTo") as string;
    const handoverNotes = formData.get("handoverNotes") as string;
    const emergencyContactName = formData.get("emergencyContactName") as string;
    const emergencyContactPhone = formData.get("emergencyContactPhone") as string;
    const emergencyContactRelationship = formData.get("emergencyContactRelationship") as string;

    // Validation
    const errors: ActionData["errors"] = {};

    if (!leaveType) {
      errors.leaveType = "Leave type is required";
    }

    if (!startDate) {
      errors.startDate = "Start date is required";
    }

    if (!endDate) {
      errors.endDate = "End date is required";
    }

    if (!reason || reason.trim().length < 10) {
      errors.reason = "Reason must be at least 10 characters long";
    }

    if (!priority) {
      errors.priority = "Priority is required";
    }

    // Validate dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        errors.startDate = "Start date cannot be in the past";
      }

      if (end < start) {
        errors.endDate = "End date cannot be before start date";
      }

      // Check for overlapping leaves
      const overlappingLeave = await Leave.findOne({
        employee: user._id,
        status: { $in: ['pending', 'approved'] },
        $or: [
          { startDate: { $lte: start }, endDate: { $gte: start } },
          { startDate: { $lte: end }, endDate: { $gte: end } },
          { startDate: { $gte: start }, endDate: { $lte: end } }
        ]
      });

      if (overlappingLeave) {
        errors.startDate = "You already have a leave application for overlapping dates";
      }
    }

    if (Object.keys(errors).length > 0) {
      return json({ errors }, { status: 400 });
    }

    // Create leave application
    const leaveData = {
      employee: user._id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason.trim(),
      priority,
      department: user.department,
      handoverTo: handoverTo || undefined,
      handoverNotes: handoverNotes || undefined
    };

    // Add emergency contact for emergency leaves
    if (leaveType === LeaveTypes.EMERGENCY && emergencyContactName && emergencyContactPhone) {
      (leaveData as any).emergencyContact = {
        name: emergencyContactName,
        phone: emergencyContactPhone,
        relationship: emergencyContactRelationship || 'Not specified'
      };
    }

    const leave = new Leave(leaveData);
    await leave.save();

    return redirect(`/employee/leave-status?success=Application submitted successfully`);

  } catch (error) {
    console.error("Error creating leave application:", error);
    return json({ error: "Failed to submit leave application" }, { status: 500 });
  }
};

export default function LeaveApplication() {
  const { user, leaveBalance, teamMembers, upcomingLeaves } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  // Calculate leave days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate.toString());
      const end = new Date(endDate.toString());
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      setCalculatedDays(daysDiff > 0 ? daysDiff : 0);
    } else {
      setCalculatedDays(0);
    }
  }, [startDate, endDate]);

  // Show emergency contact form for emergency leaves
  useEffect(() => {
    setShowEmergencyContact(selectedLeaveType === LeaveTypes.EMERGENCY);
  }, [selectedLeaveType]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLeaveTypeDescription = (type: string) => {
    const descriptions = {
      [LeaveTypes.ANNUAL]: "Regular annual leave for vacation or personal time",
      [LeaveTypes.SICK]: "Medical leave for illness or health appointments",
      [LeaveTypes.MATERNITY]: "Maternity leave for new mothers",
      [LeaveTypes.PATERNITY]: "Paternity leave for new fathers",
      [LeaveTypes.EMERGENCY]: "Emergency leave for urgent personal matters",
      [LeaveTypes.STUDY]: "Educational leave for training or studies",
      [LeaveTypes.COMPASSIONATE]: "Compassionate leave for bereavement",
      [LeaveTypes.UNPAID]: "Unpaid leave without salary",
      [LeaveTypes.OTHER]: "Other types of leave not listed above"
    };
    return descriptions[type as keyof typeof descriptions] || "";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Leave Application
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Submit your leave request for approval
        </p>
      </div>

      {/* Success/Error Messages */}
      {actionData?.success && (
        <Card className="border-green-200 bg-green-50">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle size={20} />
              <span>{actionData.success}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {actionData?.error && (
        <Card className="border-red-200 bg-red-50">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle size={20} />
              <span>{actionData.error}</span>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Application Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText size={20} />
                Leave Application Form
              </h2>
            </CardHeader>
            <CardBody>
              <Form method="post" className="space-y-6">
                {/* Leave Type */}
                <div>
                  <Select
                    name="leaveType"
                    label="Leave Type"
                    placeholder="Select leave type"
                    isRequired
                    errorMessage={actionData?.errors?.leaveType}
                    isInvalid={!!actionData?.errors?.leaveType}
                    selectedKeys={selectedLeaveType ? [selectedLeaveType] : []}
                    onSelectionChange={(keys) => setSelectedLeaveType(Array.from(keys)[0] as string)}
                  >
                    {Object.values(LeaveTypes).map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)} Leave
                      </SelectItem>
                    ))}
                  </Select>
                  
                  {selectedLeaveType && (
                    <p className="text-sm text-gray-600 mt-1">
                      {getLeaveTypeDescription(selectedLeaveType)}
                    </p>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <DatePicker
                      name="startDate"
                      label="Start Date"
                      isRequired
                      minValue={parseDate(new Date().toISOString().split('T')[0])}
                      errorMessage={actionData?.errors?.startDate}
                      isInvalid={!!actionData?.errors?.startDate}
                      value={startDate}
                      onChange={setStartDate}
                    />
                  </div>
                  
                  <div>
                    <DatePicker
                      name="endDate"
                      label="End Date"
                      isRequired
                      minValue={startDate || parseDate(new Date().toISOString().split('T')[0])}
                      errorMessage={actionData?.errors?.endDate}
                      isInvalid={!!actionData?.errors?.endDate}
                      value={endDate}
                      onChange={setEndDate}
                    />
                  </div>
                </div>

                {/* Calculated Days */}
                {calculatedDays > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-medium">
                          Total Leave Days: {calculatedDays}
                        </span>
                        <Calendar className="text-blue-600" size={20} />
                      </div>
                      {leaveBalance.remaining < calculatedDays && (
                        <p className="text-red-600 text-sm mt-2">
                          ⚠️ This exceeds your remaining leave balance ({leaveBalance.remaining} days)
                        </p>
                      )}
                    </CardBody>
                  </Card>
                )}

                {/* Priority */}
                <Select
                  name="priority"
                  label="Priority"
                  placeholder="Select priority level"
                  isRequired
                  errorMessage={actionData?.errors?.priority}
                  isInvalid={!!actionData?.errors?.priority}
                >
                  <SelectItem key={LeavePriority.LOW} value={LeavePriority.LOW}>
                    Low Priority
                  </SelectItem>
                  <SelectItem key={LeavePriority.MEDIUM} value={LeavePriority.MEDIUM}>
                    Medium Priority
                  </SelectItem>
                  <SelectItem key={LeavePriority.HIGH} value={LeavePriority.HIGH}>
                    High Priority
                  </SelectItem>
                  <SelectItem key={LeavePriority.URGENT} value={LeavePriority.URGENT}>
                    Urgent Priority
                  </SelectItem>
                </Select>

                {/* Reason */}
                <Textarea
                  name="reason"
                  label="Reason for Leave"
                  placeholder="Please provide a detailed reason for your leave application..."
                  minRows={4}
                  isRequired
                  errorMessage={actionData?.errors?.reason}
                  isInvalid={!!actionData?.errors?.reason}
                />

                {/* Handover Section */}
                <Card className="bg-gray-50">
                  <CardBody className="p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Users size={18} />
                      Work Handover Details
                    </h3>
                    
                    <div className="space-y-4">
                      <Select
                        name="handoverTo"
                        label="Handover Work To"
                        placeholder="Select team member (optional)"
                      >
                        {teamMembers.map((member: any) => (
                          <SelectItem key={member._id} value={member._id}>
                            {member.firstName} {member.lastName} - {member.position}
                          </SelectItem>
                        ))}
                      </Select>
                      
                      <Textarea
                        name="handoverNotes"
                        label="Handover Instructions"
                        placeholder="Provide details about tasks, deadlines, and important information..."
                        minRows={3}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Emergency Contact (for emergency leaves) */}
                {showEmergencyContact && (
                  <Card className="bg-red-50 border-red-200">
                    <CardBody className="p-4">
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-800">
                        <AlertTriangle size={18} />
                        Emergency Contact Information
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          name="emergencyContactName"
                          label="Contact Name"
                          placeholder="Full name"
                          isRequired
                        />
                        
                        <Input
                          name="emergencyContactPhone"
                          label="Contact Phone"
                          placeholder="Phone number"
                          type="tel"
                          isRequired
                        />
                        
                        <Input
                          name="emergencyContactRelationship"
                          label="Relationship"
                          placeholder="e.g., Spouse, Parent, etc."
                          className="sm:col-span-2"
                        />
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    className="flex-1"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Leave Application"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="light"
                    size="lg"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar - Leave Balance & Info */}
        <div className="space-y-6">
          {/* Leave Balance */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock size={18} />
                Leave Balance
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {leaveBalance.remaining}
                  </div>
                  <div className="text-sm text-gray-600">Days Remaining</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Entitlement:</span>
                    <span className="font-medium">{leaveBalance.totalEntitlement} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Used This Year:</span>
                    <span className="font-medium">{leaveBalance.totalUsed} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining:</span>
                    <span className="font-medium text-green-600">{leaveBalance.remaining} days</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(leaveBalance.totalUsed / leaveBalance.totalEntitlement) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Upcoming Team Leaves */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users size={18} />
                Upcoming Team Leaves
              </h3>
            </CardHeader>
            <CardBody>
              {upcomingLeaves.length > 0 ? (
                <div className="space-y-3">
                  {upcomingLeaves.slice(0, 5).map((leave: any) => (
                    <div key={leave._id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">
                          {leave.employee.firstName} {leave.employee.lastName}
                        </p>
                        <p className="text-gray-600">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {leave.leaveType}
                      </span>
                    </div>
                  ))}
                  {upcomingLeaves.length > 5 && (
                    <p className="text-sm text-gray-600 text-center">
                      +{upcomingLeaves.length - 5} more...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center">
                  No upcoming team leaves
                </p>
              )}
            </CardBody>
          </Card>

          {/* Leave Policy Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-800">
                <Info size={18} />
                Leave Policy
              </h3>
            </CardHeader>
            <CardBody>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• Submit applications at least 3 days in advance</p>
                <p>• Emergency leaves require immediate notification</p>
                <p>• Annual leave: 21 days per year</p>
                <p>• Sick leave: Medical certificate required for 3+ days</p>
                <p>• Approval depends on workload and team coverage</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}