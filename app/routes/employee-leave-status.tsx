import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams, Form } from "@remix-run/react";
import { useState } from "react";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Leave, { LeaveStatus, LeaveTypes } from "~/modal/leave";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { Badge } from "@nextui-org/react";
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download
} from "lucide-react";

interface LeaveApplication {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  priority: string;
  submissionDate: string;
  approvalWorkflow: Array<{
    approver: {
      firstName: string;
      lastName: string;
    };
    approverRole: string;
    status: string;
    comments?: string;
    actionDate?: string;
  }>;
  handoverTo?: {
    firstName: string;
    lastName: string;
  };
  handoverNotes?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");

    if (!email) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const user = await Registration.findOne({ email });
    if (!user) {
      throw new Response("User not found", { status: 404 });
    }

    // Get URL parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";
    const leaveType = url.searchParams.get("leaveType") || "all";
    const year = url.searchParams.get("year") || new Date().getFullYear().toString();

    // Build query
    let query: any = { employee: user._id };
    
    if (status !== "all") {
      query.status = status;
    }

    if (leaveType !== "all") {
      query.leaveType = leaveType;
    }

    // Filter by year
    const startOfYear = new Date(parseInt(year), 0, 1);
    const endOfYear = new Date(parseInt(year), 11, 31);
    query.submissionDate = { $gte: startOfYear, $lte: endOfYear };

    // Get leave applications
    const leaves = await Leave.find(query)
      .populate({
        path: 'approvalWorkflow.approver',
        select: 'firstName lastName'
      })
      .populate({
        path: 'handoverTo',
        select: 'firstName lastName'
      })
      .sort({ submissionDate: -1 });

    // Get leave balance
    const leaveBalance = await Leave.getLeaveBalance(user._id.toString());

    // Calculate yearly statistics
    const yearlyStats = {
      totalApplications: leaves.length,
      approved: leaves.filter(l => l.status === LeaveStatus.APPROVED).length,
      pending: leaves.filter(l => l.status === LeaveStatus.PENDING).length,
      rejected: leaves.filter(l => l.status === LeaveStatus.REJECTED).length,
      totalDaysRequested: leaves.reduce((sum, l) => sum + l.totalDays, 0),
      totalDaysApproved: leaves
        .filter(l => l.status === LeaveStatus.APPROVED)
        .reduce((sum, l) => sum + l.totalDays, 0)
    };

    return json({
      leaves,
      leaveBalance,
      yearlyStats,
      filters: { status, leaveType, year },
      user: {
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error("Error loading leave status:", error);
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
    const action = formData.get("_action") as string;
    const leaveId = formData.get("leaveId") as string;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return json({ error: "Leave application not found" }, { status: 404 });
    }

    // Check if user owns this leave application
    if (leave.employee.toString() !== user._id.toString()) {
      return json({ error: "Unauthorized" }, { status: 403 });
    }

    switch (action) {
      case "cancel":
        if (leave.status !== LeaveStatus.PENDING) {
          return json({ error: "Can only cancel pending applications" }, { status: 400 });
        }
        leave.status = LeaveStatus.CANCELLED;
        await leave.save();
        return json({ success: "Leave application cancelled successfully" });

      case "withdraw":
        if (leave.status !== LeaveStatus.APPROVED) {
          return json({ error: "Can only withdraw approved applications" }, { status: 400 });
        }
        leave.status = LeaveStatus.WITHDRAWN;
        await leave.save();
        return json({ success: "Leave application withdrawn successfully" });

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error processing leave action:", error);
    return json({ error: "Failed to process leave action" }, { status: 500 });
  }
};

export default function EmployeeLeaveStatus() {
  const { leaves, leaveBalance, yearlyStats, filters, user } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const successMessage = searchParams.get("success");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      case 'cancelled': return 'default';
      case 'withdrawn': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const canEdit = (leave: LeaveApplication) => {
    return leave.status === 'pending' && new Date(leave.startDate) > new Date();
  };

  const canCancel = (leave: LeaveApplication) => {
    return leave.status === 'pending';
  };

  const canWithdraw = (leave: LeaveApplication) => {
    return leave.status === 'approved' && new Date(leave.startDate) > new Date();
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Submitted', 'Reason'].join(','),
      ...leaves.map((leave: LeaveApplication) => [
        leave.leaveType,
        formatDate(leave.startDate),
        formatDate(leave.endDate),
        leave.totalDays,
        leave.status,
        formatDate(leave.submissionDate),
        `"${leave.reason.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-leave-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getWorkflowStatus = (workflow: any[]) => {
    const pending = workflow.find(w => w.status === 'pending');
    const approved = workflow.filter(w => w.status === 'approved');
    const rejected = workflow.find(w => w.status === 'rejected');

    if (rejected) {
      return `Rejected by ${rejected.approver.firstName} ${rejected.approver.lastName} (${rejected.approverRole})`;
    }

    if (pending) {
      return `Waiting for ${pending.approver.firstName} ${pending.approver.lastName} (${pending.approverRole})`;
    }

    if (approved.length === workflow.length) {
      return "All approvals completed";
    }

    return `${approved.length}/${workflow.length} approvals completed`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Leave Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            View and manage your leave requests
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            color="primary"
            startContent={<Download size={16} />}
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
          <Button
            color="success"
            startContent={<Plus size={16} />}
            onClick={() => window.location.href = '/employee/leave-application'}
          >
            New Application
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle size={20} />
              <span>{successMessage}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">Total Applications</p>
                <p className="text-2xl font-bold">{yearlyStats.totalApplications}</p>
              </div>
              <CalendarDays size={24} />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">Approved</p>
                <p className="text-2xl font-bold">{yearlyStats.approved}</p>
              </div>
              <CheckCircle size={24} />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">Pending</p>
                <p className="text-2xl font-bold">{yearlyStats.pending}</p>
              </div>
              <Clock size={24} />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">Rejected</p>
                <p className="text-2xl font-bold">{yearlyStats.rejected}</p>
              </div>
              <XCircle size={24} />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">Days Remaining</p>
                <p className="text-2xl font-bold">{leaveBalance.remaining}</p>
              </div>
              <CalendarDays size={24} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Form method="get" className="flex flex-wrap gap-4">
              <Select
                name="status"
                label="Status"
                size="sm"
                className="w-40"
                defaultSelectedKeys={[filters.status]}
              >
                <SelectItem key="all" value="all">All Status</SelectItem>
                <SelectItem key="pending" value="pending">Pending</SelectItem>
                <SelectItem key="approved" value="approved">Approved</SelectItem>
                <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
                <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
                <SelectItem key="withdrawn" value="withdrawn">Withdrawn</SelectItem>
              </Select>

              <Select
                name="leaveType"
                label="Leave Type"
                size="sm"
                className="w-40"
                defaultSelectedKeys={[filters.leaveType]}
              >
                <SelectItem key="all" value="all">All Types</SelectItem>
                {Object.values(LeaveTypes).map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </Select>

              <Select
                name="year"
                label="Year"
                size="sm"
                className="w-32"
                defaultSelectedKeys={[filters.year]}
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year.toString()} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </Select>

              <Button type="submit" color="primary" size="sm">
                Apply Filters
              </Button>
            </Form>
          </div>
        </CardBody>
      </Card>

      {/* Leave Applications Table */}
      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Leave Type</th>
                  <th className="text-left p-3">Duration</th>
                  <th className="text-left p-3">Days</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Priority</th>
                  <th className="text-left p-3">Approval Status</th>
                  <th className="text-left p-3">Submitted</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave: LeaveApplication) => (
                  <tr key={leave._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3">
                      <span className="capitalize font-medium">{leave.leaveType}</span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm">{formatDate(leave.startDate)}</p>
                        <p className="text-sm text-gray-600">to {formatDate(leave.endDate)}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{leave.totalDays} days</span>
                    </td>
                    <td className="p-3">
                      <Badge color={getStatusColor(leave.status)} variant="flat">
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium capitalize ${getPriorityColor(leave.priority)}`}>
                        {leave.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="text-sm text-gray-600">
                        {getWorkflowStatus(leave.approvalWorkflow)}
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{formatDate(leave.submissionDate)}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          startContent={<Eye size={14} />}
                          onClick={() => {
                            setSelectedLeave(leave);
                            setShowDetailsModal(true);
                          }}
                        >
                          View
                        </Button>
                        
                        {canEdit(leave) && (
                          <Button
                            size="sm"
                            color="primary"
                            variant="light"
                            startContent={<Edit size={14} />}
                            onClick={() => window.location.href = `/employee/leave-application/${leave._id}/edit`}
                          >
                            Edit
                          </Button>
                        )}
                        
                        {canCancel(leave) && (
                          <Form method="post" style={{ display: 'inline' }}>
                            <input type="hidden" name="_action" value="cancel" />
                            <input type="hidden" name="leaveId" value={leave._id} />
                            <Button
                              type="submit"
                              size="sm"
                              color="danger"
                              variant="light"
                              startContent={<Trash2 size={14} />}
                            >
                              Cancel
                            </Button>
                          </Form>
                        )}
                        
                        {canWithdraw(leave) && (
                          <Form method="post" style={{ display: 'inline' }}>
                            <input type="hidden" name="_action" value="withdraw" />
                            <input type="hidden" name="leaveId" value={leave._id} />
                            <Button
                              type="submit"
                              size="sm"
                              color="warning"
                              variant="light"
                              startContent={<Trash2 size={14} />}
                            >
                              Withdraw
                            </Button>
                          </Form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {leaves.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No leave applications found</p>
              <Button
                color="primary"
                className="mt-4"
                onClick={() => window.location.href = '/employee/leave-application'}
              >
                Submit Your First Leave Application
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Leave Details Modal */}
      {showDetailsModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <h3 className="text-xl font-bold">Leave Application Details</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Leave Type:</p>
                  <p className="font-medium capitalize">{selectedLeave.leaveType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority:</p>
                  <p className={`font-medium capitalize ${getPriorityColor(selectedLeave.priority)}`}>
                    {selectedLeave.priority}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date:</p>
                  <p className="font-medium">{formatDate(selectedLeave.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date:</p>
                  <p className="font-medium">{formatDate(selectedLeave.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Days:</p>
                  <p className="font-medium">{selectedLeave.totalDays} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status:</p>
                  <Badge color={getStatusColor(selectedLeave.status)} variant="flat">
                    {selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-sm text-gray-600">Reason:</p>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedLeave.reason}</p>
              </div>

              {/* Handover Details */}
              {(selectedLeave.handoverTo || selectedLeave.handoverNotes) && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">Handover Details:</p>
                  <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                    {selectedLeave.handoverTo && (
                      <p>
                        <span className="text-sm text-gray-600">Handover to:</span> 
                        {selectedLeave.handoverTo.firstName} {selectedLeave.handoverTo.lastName}
                      </p>
                    )}
                    {selectedLeave.handoverNotes && (
                      <p>
                        <span className="text-sm text-gray-600">Notes:</span> 
                        {selectedLeave.handoverNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {selectedLeave.emergencyContact && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">Emergency Contact:</p>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                    <p><span className="text-sm text-gray-600">Name:</span> {selectedLeave.emergencyContact.name}</p>
                    <p><span className="text-sm text-gray-600">Phone:</span> {selectedLeave.emergencyContact.phone}</p>
                    <p><span className="text-sm text-gray-600">Relationship:</span> {selectedLeave.emergencyContact.relationship}</p>
                  </div>
                </div>
              )}

              {/* Approval Workflow */}
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Approval Workflow:</p>
                <div className="space-y-3">
                  {selectedLeave.approvalWorkflow.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {step.status === 'approved' && <CheckCircle className="text-green-600" size={20} />}
                        {step.status === 'rejected' && <XCircle className="text-red-600" size={20} />}
                        {step.status === 'pending' && <Clock className="text-yellow-600" size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {step.approver.firstName} {step.approver.lastName} ({step.approverRole})
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: <span className="capitalize">{step.status}</span>
                        </p>
                        {step.comments && (
                          <p className="text-sm text-gray-600 mt-1">
                            Comments: {step.comments}
                          </p>
                        )}
                        {step.actionDate && (
                          <p className="text-sm text-gray-600">
                            Date: {formatDate(step.actionDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  color="default"
                  variant="light"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}