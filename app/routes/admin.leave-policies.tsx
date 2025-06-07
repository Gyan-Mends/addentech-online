import { Button, Card, CardBody, CardHeader, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Switch, Chip } from "@nextui-org/react";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { Plus, Edit } from "lucide-react";
import { useState } from "react";
import AdminLayout from "~/layout/adminLayout";
import LeavePolicy from "~/modal/leavePolicy";

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // Get all leave policies
        const policies = await LeavePolicy.find({}).sort({ leaveType: 1 });
        
        return json({ policies, userId });
    } catch (error: any) {
        return json({ 
            error: "Failed to load policies", 
            policies: [] 
        });
    }
}

export async function action({ request }: ActionFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        
        const formData = await request.formData();
        const action = formData.get('_action') as string;
        
        switch (action) {
            case 'create':
                const newPolicy = new LeavePolicy({
                    leaveType: formData.get('leaveType'),
                    description: formData.get('description'),
                    defaultAllocation: Number(formData.get('defaultAllocation')),
                    maxConsecutiveDays: Number(formData.get('maxConsecutiveDays')),
                    minAdvanceNotice: Number(formData.get('minAdvanceNotice')),
                    maxAdvanceBooking: Number(formData.get('maxAdvanceBooking')),
                    carryForwardAllowed: formData.get('carryForwardAllowed') === 'on',
                    carryForwardLimit: Number(formData.get('carryForwardLimit')) || 0,
                    documentRequired: formData.get('documentRequired') === 'on',
                    approvalLevels: [{
                        level: 1,
                        role: 'manager',
                        maxDays: Number(formData.get('managerMaxDays')) || 30
                    }, {
                        level: 2,
                        role: 'department_head',
                        maxDays: Number(formData.get('deptHeadMaxDays')) || 60
                    }, {
                        level: 3,
                        role: 'admin',
                        maxDays: 999
                    }]
                });
                
                await newPolicy.save();
                return json({ success: true, message: "Leave policy created successfully" });
                
            default:
                return json({ success: false, error: "Invalid action" });
        }
    } catch (error: any) {
        return json({ success: false, error: `Action failed: ${error?.message}` });
    }
}

export default function LeavePolicies() {
    const { policies } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    const handleCreateNew = () => {
        setModalMode('create');
        onOpen();
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Leave Policies Management</h1>
                        <p className="text-gray-600 mt-2">Configure leave types, allocations, and approval workflows</p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<Plus size={16} />}
                        onClick={handleCreateNew}
                    >
                        New Policy
                    </Button>
                </div>

                {actionData && (
                    <Card className={actionData.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                        <CardBody>
                            <p className={actionData.success ? "text-green-700" : "text-red-700"}>
                                {actionData.message || actionData.error}
                            </p>
                        </CardBody>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Leave Policies</h3>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Leave policies table">
                            <TableHeader>
                                <TableColumn>Leave Type</TableColumn>
                                <TableColumn>Allocation</TableColumn>
                                <TableColumn>Max Consecutive</TableColumn>
                                <TableColumn>Advance Notice</TableColumn>
                                <TableColumn>Actions</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {policies.map((policy: any) => (
                                    <TableRow key={policy._id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium capitalize">{policy.leaveType}</p>
                                                <p className="text-sm text-gray-600">{policy.description}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{policy.defaultAllocation} days</TableCell>
                                        <TableCell>{policy.maxConsecutiveDays} days</TableCell>
                                        <TableCell>{policy.minAdvanceNotice} days</TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                startContent={<Edit size={14} />}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                {/* Policy Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                    <ModalContent>
                        <Form method="post">
                            <ModalHeader>
                                <h3 className="text-lg font-bold">Create New Policy</h3>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <input type="hidden" name="_action" value="create" />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Leave Type"
                                            name="leaveType"
                                            isRequired
                                        />
                                        <Input
                                            label="Default Allocation (days)"
                                            name="defaultAllocation"
                                            type="number"
                                            isRequired
                                        />
                                    </div>

                                    <Input
                                        label="Description"
                                        name="description"
                                        isRequired
                                    />

                                    <div className="grid grid-cols-3 gap-4">
                                        <Input
                                            label="Max Consecutive Days"
                                            name="maxConsecutiveDays"
                                            type="number"
                                            isRequired
                                        />
                                        <Input
                                            label="Min Advance Notice (days)"
                                            name="minAdvanceNotice"
                                            type="number"
                                            isRequired
                                        />
                                        <Input
                                            label="Max Advance Booking (days)"
                                            name="maxAdvanceBooking"
                                            type="number"
                                            defaultValue="365"
                                            isRequired
                                        />
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        <Switch name="carryForwardAllowed">
                                            Allow Carry Forward
                                        </Switch>
                                        <Input
                                            label="Carry Forward Limit"
                                            name="carryForwardLimit"
                                            type="number"
                                            defaultValue="5"
                                            className="w-48"
                                        />
                                    </div>

                                    <Switch name="documentRequired">
                                        Documents Required
                                    </Switch>

                                    <div className="border-t pt-4">
                                        <h4 className="font-medium mb-3">Approval Workflow Limits</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Manager Max Days"
                                                name="managerMaxDays"
                                                type="number"
                                                defaultValue="30"
                                            />
                                            <Input
                                                label="Dept Head Max Days"
                                                name="deptHeadMaxDays"
                                                type="number"
                                                defaultValue="60"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary">
                                    Create Policy
                                </Button>
                            </ModalFooter>
                        </Form>
                    </ModalContent>
                </Modal>
            </div>
        </AdminLayout>
    );
} 