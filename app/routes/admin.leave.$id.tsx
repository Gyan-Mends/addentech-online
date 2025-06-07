import { Card, CardHeader, CardBody, Button, Chip, Divider } from "@nextui-org/react";
import { useLoaderData, Link } from "@remix-run/react";
import { ArrowLeft, Calendar, Clock, User, FileText, MessageSquare } from "lucide-react";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { LeaveController } from "~/controller/leave";
import AdminLayout from "~/layout/adminLayout";

export async function loader({ request, params }: LoaderFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("userId");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        const leaveId = params.id;
        if (!leaveId) {
            throw new Error("Leave ID is required");
        }

        const leave = await LeaveController.getLeaveById(leaveId);
        
        if (!leave) {
            throw new Error("Leave application not found");
        }

        return json({ leave });
    } catch (error) {
        console.error('Error loading leave details:', error);
        return redirect("/admin/leave-management?error=Leave application not found");
    }
}

const LeaveDetail = () => {
    const { leave } = useLoaderData<typeof loader>();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin/leave-management">
                        <Button
                            variant="light"
                            startContent={<ArrowLeft size={16} />}
                        >
                            Back to Leave Management
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Leave Application Details
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Application ID: {leave._id}
                        </p>
                    </div>
                </div>

                {/* Main Details Card */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-3">
                                <User size={20} />
                                <h2 className="text-xl font-semibold">
                                    {leave.employee?.firstName} {leave.employee?.lastName}
                                </h2>
                            </div>
                            <Chip
                                color={getStatusColor(leave.status)}
                                variant="flat"
                                size="lg"
                            >
                                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </Chip>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Leave Type</label>
                                    <p className="text-lg capitalize">{leave.leaveType}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Department</label>
                                    <p className="text-lg">{leave.department?.name}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Priority</label>
                                    <p className="text-lg capitalize">{leave.priority}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                                    <p className="text-lg">{formatDate(leave.startDate)}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-600">End Date</label>
                                    <p className="text-lg">{formatDate(leave.endDate)}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Total Days</label>
                                    <p className="text-lg font-semibold">{leave.totalDays} days</p>
                                </div>
                            </div>
                        </div>
                        
                        <Divider className="my-6" />
                        
                        <div>
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-3">
                                <FileText size={16} />
                                Reason for Leave
                            </label>
                            <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">
                                {leave.reason}
                            </p>
                        </div>
                    </CardBody>
                </Card>

                {/* Timeline Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Clock size={20} />
                            <h3 className="text-lg font-semibold">Application Timeline</h3>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="font-medium">Application Submitted</p>
                                    <p className="text-sm text-gray-600">{formatDate(leave.submissionDate)}</p>
                                </div>
                            </div>
                            
                            {leave.approvalWorkflow?.map((approval: any, index: number) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <div className={`w-3 h-3 rounded-full ${
                                        approval.status === 'approved' ? 'bg-green-500' :
                                        approval.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}></div>
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {approval.status === 'pending' ? 'Pending Approval' : 
                                             approval.status === 'approved' ? 'Approved' : 'Rejected'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {approval.approver?.firstName} {approval.approver?.lastName} ({approval.approverRole})
                                        </p>
                                        {approval.actionDate && (
                                            <p className="text-sm text-gray-500">{formatDate(approval.actionDate)}</p>
                                        )}
                                        {approval.comments && (
                                            <p className="text-sm text-gray-700 mt-2 italic">"{approval.comments}"</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Additional Information */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Additional Information</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="font-medium text-gray-600">Submission Date</label>
                                <p>{formatDate(leave.submissionDate)}</p>
                            </div>
                            <div>
                                <label className="font-medium text-gray-600">Last Modified</label>
                                <p>{formatDate(leave.lastModified)}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default LeaveDetail; 