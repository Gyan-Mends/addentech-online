import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSubmit, useFetcher } from "@remix-run/react";
import { useState } from "react";
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Tabs,
  Tab,
  Divider,
  Avatar
} from "@nextui-org/react";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Leave, { LeaveTypes, LeaveStatus, LeavePriority } from "~/modal/leave";
import LeaveController from "~/controller/leaveController";
import AdminLayout from "~/layout/adminLayout";
import { CalendarDays, Plus, Eye, Check, X, Edit, Trash2 } from "lucide-react";

export const loader:LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const userEmail = session.get("email");
    
    if (!userEmail) {
      return redirect("/addentech-login");
    }
    
    const currentUser = await Registration.findOne({ email: userEmail }).populate('department');
    
    if (!currentUser) {
      return redirect("/addentech-login");
    }

    // Fetch leaves based on user role
    const leavesResult = await LeaveController.getLeaves(
      currentUser._id.toString(),
      currentUser.role,
      currentUser.department?._id?.toString()
    );

    // Get pending approvals for this user
    const pendingApprovalsResult = await LeaveController.getPendingApprovals(currentUser._id.toString());

    // Get leave statistics
    const statisticsResult = await LeaveController.getLeaveStatistics(
      currentUser.role,
      currentUser._id.toString(),
      currentUser.department?._id?.toString()
    );

    // Get leave balance for current user
    const balanceResult = await LeaveController.getLeaveBalance(currentUser._id.toString());
    
    return json({
      currentUser,
      leaves: leavesResult.success ? leavesResult.leaves : [],
      pendingApprovals: pendingApprovalsResult.success ? pendingApprovalsResult.leaves : [],
      statistics: statisticsResult.success ? statisticsResult.statistics : null,
      leaveBalance: balanceResult.success ? balanceResult.balance : null
    });
  } catch (error) {
    console.error("Error in leaves loader:", error);
    return json({ error: "Failed to load leaves" }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const userEmail = session.get("email");
    
    if (!userEmail) {
      return redirect("/addentech-login");
    }
    
    const currentUser = await Registration.findOne({ email: userEmail }).populate('department');
    if (!currentUser) {
      return redirect("/addentech-login");
    }

    const formData = await request.formData();
    const action = formData.get("action") as string;

    switch (action) {
      case "create": {
        const leaveData = {
          employee: currentUser._id,
          department: currentUser.department?._id,
          leaveType: formData.get("leaveType"),
          startDate: new Date(formData.get("startDate") as string),
          endDate: new Date(formData.get("endDate") as string),
          reason: formData.get("reason"),
          priority: formData.get("priority") || LeavePriority.MEDIUM,
          emergencyContact: formData.get("emergencyContact") ? {
            name: formData.get("emergencyContactName"),
            phone: formData.get("emergencyContactPhone"),
            relationship: formData.get("emergencyContactRelationship")
          } : undefined,
          handoverNotes: formData.get("handoverNotes")
        };

        const result = await LeaveController.createLeave(leaveData);
        
        if (result.success) {
          return json({ success: true, message: "Leave application submitted successfully" });
        } else {
          return json({ success: false, error: result.error }, { status: 400 });
        }
      }

      case "approve": {
        const leaveId = formData.get("leaveId") as string;
        const comments = formData.get("comments") as string;
        
        const result = await LeaveController.approveLeave(leaveId, currentUser._id.toString(), comments);
        
        if (result.success) {
          return json({ success: true, message: "Leave approved successfully" });
        } else {
          return json({ success: false, error: result.error }, { status: 400 });
        }
      }

      case "reject": {
        const leaveId = formData.get("leaveId") as string;
        const comments = formData.get("comments") as string;
        
        if (!comments) {
          return json({ success: false, error: "Comments are required when rejecting a leave" }, { status: 400 });
        }
        
        const result = await LeaveController.rejectLeave(leaveId, currentUser._id.toString(), comments);
        
        if (result.success) {
          return json({ success: true, message: "Leave rejected" });
        } else {
          return json({ success: false, error: result.error }, { status: 400 });
        }
      }

      case "cancel": {
        const leaveId = formData.get("leaveId") as string;
        
        const result = await LeaveController.cancelLeave(leaveId, currentUser._id.toString(), currentUser.role);
        
        if (result.success) {
          return json({ success: true, message: "Leave cancelled successfully" });
        } else {
          return json({ success: false, error: result.error }, { status: 400 });
        }
      }

      default:
        return json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in leaves action:", error);
    return json({ success: false, error: "Server error" }, { status: 500 });
  }
};

export default function LeaveManagementPage() {
  const loaderData = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const fetcher = useFetcher();
  
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isApprovalOpen, onOpen: onApprovalOpen, onClose: onApprovalClose } = useDisclosure();
  
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [activeTab, setActiveTab] = useState("all");
  
  if ('error' in loaderData) {
    return (
      <AdminLayout>
        <div className="text-red-500 p-4">Error: {loaderData.error}</div>
      </AdminLayout>
    );
  }

  const { currentUser, leaves, pendingApprovals, statistics, leaveBalance } = loaderData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case LeaveStatus.APPROVED: return "success";
      case LeaveStatus.REJECTED: return "danger";
      case LeaveStatus.PENDING: return "warning";
      case LeaveStatus.CANCELLED: return "default";
      default: return "primary";
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    return LeaveTypes[type as keyof typeof LeaveTypes] || type;
  };

  const handleCreateLeave = (formData: FormData) => {
    formData.append("action", "create");
    submit(formData, { method: "post" });
    onCreateClose();
  };

  const handleApproval = (leaveId: string, action: 'approve' | 'reject', comments?: string) => {
    const formData = new FormData();
    formData.append("action", action);
    formData.append("leaveId", leaveId);
    if (comments) formData.append("comments", comments);
    submit(formData, { method: "post" });
    onApprovalClose();
  };

  const openApprovalModal = (leave: any, action: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setApprovalAction(action);
    onApprovalOpen();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const filteredLeaves = () => {
    switch (activeTab) {
      case "pending": return leaves.filter((leave: any) => leave.status === LeaveStatus.PENDING);
      case "approved": return leaves.filter((leave: any) => leave.status === LeaveStatus.APPROVED);
      case "rejected": return leaves.filter((leave: any) => leave.status === LeaveStatus.REJECTED);
      case "my-leaves": return leaves.filter((leave: any) => leave.employee._id === currentUser._id);
      default: return leaves;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          </div>
          <Button 
            color="primary" 
            startContent={<Plus className="h-4 w-4" />}
            onPress={onCreateOpen}
          >
            Apply for Leave
          </Button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.totalLeaves}</div>
                <div className="text-sm text-gray-600">Total Leaves</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.pendingLeaves}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.approvedLeaves}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.rejectedLeaves}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Leave Balance Card */}
        {leaveBalance && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Leave Balance</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{leaveBalance.annual}</div>
                  <div className="text-sm text-gray-600">Annual Leave</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{leaveBalance.sick}</div>
                  <div className="text-sm text-gray-600">Sick Leave</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{leaveBalance.maternity}</div>
                  <div className="text-sm text-gray-600">Maternity</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">{leaveBalance.emergency}</div>
                  <div className="text-sm text-gray-600">Emergency</div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Pending Approvals (for managers/admins) */}
        {pendingApprovals && pendingApprovals.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-orange-600">Pending Approvals ({pendingApprovals.length})</h3>
            </CardHeader>
            <CardBody>
              <LeaveTable 
                leaves={pendingApprovals}
                currentUser={currentUser}
                onViewLeave={(leave: any) => {
                  setSelectedLeave(leave);
                  onViewOpen();
                }}
                onApproveLeave={(leave: any) => openApprovalModal(leave, 'approve')}
                onRejectLeave={(leave: any) => openApprovalModal(leave, 'reject')}
                showApprovalActions={true}
              />
            </CardBody>
          </Card>
        )}

        {/* Main Leave Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold">Leave Applications</h3>
              <Tabs 
                selectedKey={activeTab} 
                onSelectionChange={(key) => setActiveTab(key as string)}
                size="sm"
              >
                <Tab key="all" title="All" />
                <Tab key="pending" title="Pending" />
                <Tab key="approved" title="Approved" />
                <Tab key="rejected" title="Rejected" />
                <Tab key="my-leaves" title="My Leaves" />
              </Tabs>
            </div>
          </CardHeader>
          <CardBody>
            <LeaveTable 
              leaves={filteredLeaves()}
              currentUser={currentUser}
              onViewLeave={(leave: any) => {
                setSelectedLeave(leave);
                onViewOpen();
              }}
              onApproveLeave={(leave: any) => openApprovalModal(leave, 'approve')}
              onRejectLeave={(leave: any) => openApprovalModal(leave, 'reject')}
              showApprovalActions={currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'department_head'}
              showPersonalActions={true}
            />
          </CardBody>
        </Card>

        {/* Modals */}
        <CreateLeaveModal 
          isOpen={isCreateOpen} 
          onClose={onCreateClose} 
          onSubmit={handleCreateLeave} 
        />
        
        <ViewLeaveModal 
          isOpen={isViewOpen} 
          onClose={onViewClose} 
          leave={selectedLeave} 
        />
        
        <ApprovalModal 
          isOpen={isApprovalOpen} 
          onClose={onApprovalClose} 
          leave={selectedLeave} 
          action={approvalAction}
          onSubmit={handleApproval}
        />
      </div>
    </AdminLayout>
  );
}

function LeaveTable({ 
  leaves, 
  currentUser, 
  onViewLeave, 
  onApproveLeave, 
  onRejectLeave, 
  showApprovalActions = false,
  showPersonalActions = false 
}: any) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case LeaveStatus.APPROVED: return "success";
      case LeaveStatus.REJECTED: return "danger";
      case LeaveStatus.PENDING: return "warning";
      case LeaveStatus.CANCELLED: return "default";
      default: return "primary";
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    return LeaveTypes[type as keyof typeof LeaveTypes] || type;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  if (leaves.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No leave applications found
      </div>
    );
  }

  return (
    <Table aria-label="Leave applications table">
      <TableHeader>
        <TableColumn>Employee</TableColumn>
        <TableColumn>Leave Type</TableColumn>
        <TableColumn>Start Date</TableColumn>
        <TableColumn>End Date</TableColumn>
        <TableColumn>Duration</TableColumn>
        <TableColumn>Status</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody>
        {leaves.map((leave: any) => (
          <TableRow key={leave._id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar size="sm" name={leave.employee.firstName} />
                <div>
                  <div className="font-medium">{leave.employee.firstName} {leave.employee.lastName}</div>
                  <div className="text-sm text-gray-500">{leave.employee.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Chip size="sm" variant="flat" color="primary">
                {getLeaveTypeLabel(leave.leaveType)}
              </Chip>
            </TableCell>
            <TableCell>{formatDate(leave.startDate)}</TableCell>
            <TableCell>{formatDate(leave.endDate)}</TableCell>
            <TableCell>{leave.duration} days</TableCell>
            <TableCell>
              <Chip size="sm" color={getStatusColor(leave.status)}>
                {leave.status}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => onViewLeave(leave)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {showApprovalActions && leave.status === LeaveStatus.PENDING && (
                  <>
                    <Button
                      isIconOnly
                      size="sm"
                      color="success"
                      variant="light"
                      onPress={() => onApproveLeave(leave)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => onRejectLeave(leave)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CreateLeaveModal({ isOpen, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    priority: LeavePriority.MEDIUM,
    emergencyContact: false,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    handoverNotes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formDataObj = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== false) {
        formDataObj.append(key, value.toString());
      }
    });
    
    onSubmit(formDataObj);
    
    // Reset form
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      priority: LeavePriority.MEDIUM,
      emergencyContact: false,
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      handoverNotes: ''
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            Apply for Leave
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Leave Type"
                placeholder="Select leave type"
                value={formData.leaveType}
                onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                isRequired
              >
                {Object.entries(LeaveTypes).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </Select>
              
              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                {Object.values(LeavePriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </Select>
              
              <Input
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                isRequired
              />
              
              <Input
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                isRequired
              />
            </div>
            
            <Textarea
              label="Reason"
              placeholder="Please provide reason for leave"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              isRequired
            />
            
            <Textarea
              label="Handover Notes"
              placeholder="Any important handover information"
              value={formData.handoverNotes}
              onChange={(e) => setFormData({...formData, handoverNotes: e.target.value})}
            />
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.checked})}
              />
              <span>Add Emergency Contact</span>
            </div>
            
            {formData.emergencyContact && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Contact Name"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                />
                <Input
                  label="Contact Phone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                />
                <Input
                  label="Relationship"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => setFormData({...formData, emergencyContactRelationship: e.target.value})}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Submit Application
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

function ViewLeaveModal({ isOpen, onClose, leave }: any) {
  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  
  if (!leave) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Leave Application Details
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg" name={leave.employee.firstName} />
              <div>
                <h3 className="text-lg font-semibold">{leave.employee.firstName} {leave.employee.lastName}</h3>
                <p className="text-gray-600">{leave.employee.email}</p>
                <p className="text-sm text-gray-500">{leave.employee.department?.name}</p>
              </div>
            </div>
            
            <Divider />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Leave Type</p>
                <Chip color="primary">{LeaveTypes[leave.leaveType as keyof typeof LeaveTypes]}</Chip>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Chip color={getStatusColor(leave.status)}>{leave.status}</Chip>
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{formatDate(leave.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">{formatDate(leave.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{leave.duration} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className="font-medium">{leave.priority}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Reason</p>
              <p className="mt-1">{leave.reason}</p>
            </div>
            
            {leave.handoverNotes && (
              <div>
                <p className="text-sm text-gray-600">Handover Notes</p>
                <p className="mt-1">{leave.handoverNotes}</p>
              </div>
            )}
            
            {leave.emergencyContact && (
              <div>
                <p className="text-sm text-gray-600">Emergency Contact</p>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p><strong>Name:</strong> {leave.emergencyContact.name}</p>
                  <p><strong>Phone:</strong> {leave.emergencyContact.phone}</p>
                  <p><strong>Relationship:</strong> {leave.emergencyContact.relationship}</p>
                </div>
              </div>
            )}
            
            {leave.approvalWorkflow && leave.approvalWorkflow.length > 0 && (
              <div>
                <p className="text-sm text-gray-600">Approval Workflow</p>
                <div className="mt-2 space-y-2">
                  {leave.approvalWorkflow.map((approval: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium">{approval.approver.firstName} {approval.approver.lastName}</p>
                        <p className="text-sm text-gray-600">{approval.approver.role}</p>
                      </div>
                      <div className="text-right">
                        <Chip size="sm" color={approval.status === 'approved' ? 'success' : approval.status === 'rejected' ? 'danger' : 'warning'}>
                          {approval.status}
                        </Chip>
                        {approval.approvedAt && (
                          <p className="text-xs text-gray-500 mt-1">{formatDate(approval.approvedAt)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ApprovalModal({ isOpen, onClose, leave, action, onSubmit }: any) {
  const [comments, setComments] = useState('');
  
  const handleSubmit = () => {
    if (action === 'reject' && !comments.trim()) {
      alert('Comments are required when rejecting a leave');
      return;
    }
    
    onSubmit(leave._id, action, comments);
    setComments('');
  };

  if (!leave) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {action === 'approve' ? 'Approve' : 'Reject'} Leave Application
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Employee</p>
              <p className="font-medium">{leave.employee.firstName} {leave.employee.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Leave Type</p>
              <p className="font-medium">{LeaveTypes[leave.leaveType as keyof typeof LeaveTypes]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium">{leave.duration} days ({new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()})</p>
            </div>
            <Textarea
              label={`Comments ${action === 'reject' ? '(Required)' : '(Optional)'}`}
              placeholder={`Add your ${action === 'approve' ? 'approval' : 'rejection'} comments here...`}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              isRequired={action === 'reject'}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button 
            color={action === 'approve' ? 'success' : 'danger'} 
            onPress={handleSubmit}
          >
            {action === 'approve' ? 'Approve' : 'Reject'} Leave
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case LeaveStatus.APPROVED: return "success";
    case LeaveStatus.REJECTED: return "danger";
    case LeaveStatus.PENDING: return "warning";
    case LeaveStatus.CANCELLED: return "default";
    default: return "primary";
  }
}