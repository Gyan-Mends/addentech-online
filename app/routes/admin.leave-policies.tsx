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
    const loaderData = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    // Handle potential error state
    const policies = 'policies' in loaderData ? loaderData.policies : [];

    const handleCreateNew = () => {
        setModalMode('create');
        onOpen();
    };

    return (
        <AdminLayout>
            <div className="space-y-6 !text-white">
                {/* Header */}
                <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 text-white shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Leave Policies Management</h1>
                            <p className="text-gray-300 mt-2">Configure leave types, allocations, and approval workflows</p>
                        </div>
                        <Button
                            className="bg-action-primary text-white hover:bg-action-primary"
                            startContent={<Plus size={16} />}
                            onClick={handleCreateNew}
                        >
                            New Policy
                        </Button>
                    </div>
                </div>

                {/* Action Message */}
                {actionData && (
                    <div className={`p-4 rounded-lg border ${
                        (actionData as any).success 
                            ? "border-green-500/20 bg-green-500/10 text-green-400" 
                            : "border-red-500/20 bg-red-500/10 text-red-400"
                    }`}>
                        <p>
                            {(actionData as any).message || (actionData as any).error}
                        </p>
                    </div>
                )}

                {/* Policies Table */}
                <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                    <Table 
                        aria-label="Leave policies table" 
                        className="bg-dashboard-secondary"
                        classNames={{
                            wrapper: "bg-dashboard-secondary shadow-none",
                            th: "bg-dashboard-secondary text-white border-b border-white/20",
                            td: "text-gray-300 border-b border-white/10"
                        }}
                    >
                        <TableHeader className="bg-dashboard-primary">
                            <TableColumn className="text-white">Leave Type</TableColumn>
                            <TableColumn className="text-white">Allocation</TableColumn>
                            <TableColumn className="text-white">Max Consecutive</TableColumn>
                            <TableColumn className="text-white">Advance Notice</TableColumn>
                            <TableColumn className="text-white">Actions</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {policies.map((policy: any) => (
                                <TableRow key={policy._id} className="hover:bg-white/5">
                                    <TableCell>
                                        <div>
                                            <p className="font-medium capitalize text-white">{policy.leaveType}</p>
                                            <p className="text-sm text-gray-400">{policy.description}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-300">{policy.defaultAllocation} days</TableCell>
                                    <TableCell className="text-gray-300">{policy.maxConsecutiveDays} days</TableCell>
                                    <TableCell className="text-gray-300">{policy.minAdvanceNotice} days</TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            className="bg-blue-500 text-white hover:bg-blue-600"
                                            startContent={<Edit size={14} />}
                                        >
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Policy Modal */}
                <Modal 
                    isOpen={isOpen} 
                    onClose={onClose} 
                    size="2xl"
                    classNames={{
                        base: "bg-dashboard-secondary border border-white/20",
                        header: "bg-dashboard-secondary border-b border-white/20",
                        body: "bg-dashboard-secondary",
                        footer: "bg-dashboard-secondary border-t border-white/20"
                    }}
                >
                    <ModalContent>
                        <Form method="post">
                            <ModalHeader>
                                <h3 className="text-lg font-bold text-white">Create New Policy</h3>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-8">
                                    <input type="hidden" name="_action" value="create" />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            labelPlacement="outside"
                                            placeholder=" "
                                            variant="bordered"
                                            classNames={{
                                                label: "font-nunito !text-white",
                                                inputWrapper: "font-nunito bg-dashboard-secondary border border-white/20 text-white",
                                                input: "text-white"
                                            }}
                                            label="Leave Type"
                                            name="leaveType"
                                            isRequired
                                        />
                                        <Input
                                            labelPlacement="outside"
                                            placeholder=" "
                                            variant="bordered"
                                            classNames={{
                                                label: "font-nunito !text-white",
                                                inputWrapper: "font-nunito bg-dashboard-secondary border border-white/20 text-white",
                                                input: "text-white"
                                            }}
                                            label="Default Allocation (days)"
                                            name="defaultAllocation"
                                            type="number"
                                            isRequired
                                        />
                                    </div>

                                    <Input
                                        labelPlacement="outside"
                                        placeholder=" "
                                        variant="bordered"
                                        classNames={{
                                            label: "font-nunito !text-white",
                                            inputWrapper: "font-nunito bg-dashboard-secondary border border-white/20 text-white",
                                            input: "text-white"
                                        }}
                                        label="Description"
                                        name="description"
                                        isRequired
                                    />

                                    <div className="grid grid-cols-3 gap-4">
                                        <Input
                                            labelPlacement="outside"
                                            placeholder=" "
                                            variant="bordered"
                                            classNames={{
                                                label: "font-nunito !text-white",
                                                inputWrapper: "font-nunito bg-dashboard-secondary border border-white/20 text-white",
                                                input: "text-white"
                                            }}
                                            label="Max Consecutive Days"
                                            name="maxConsecutiveDays"
                                            type="number"
                                            isRequired
                                        />
                                        <Input
                                            labelPlacement="outside"
                                            placeholder=" "
                                            variant="bordered"
                                            classNames={{
                                                label: "font-nunito !text-white",
                                                inputWrapper: "font-nunito bg-dashboard-secondary border border-white/20 text-white",
                                                input: "text-white"
                                            }}
                                            label="Min Advance Notice (days)"
                                            name="minAdvanceNotice"
                                            type="number"
                                            isRequired
                                        />
                                        <Input
                                            labelPlacement="outside"
                                            placeholder=" "
                                            variant="bordered"
                                            classNames={{
                                                label: "font-nunito !text-white",
                                                inputWrapper: "font-nunito bg-dashboard-secondary border border-white/20 text-white",
                                                input: "text-white"
                                            }}
                                            label="Max Advance Booking (days)"
                                            name="maxAdvanceBooking"
                                            type="number"
                                            defaultValue="365"
                                            isRequired
                                        />
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        <Switch 
                                            name="carryForwardAllowed"
                                            classNames={{
                                                base: "text-white",
                                                wrapper: "bg-white/20",
                                                thumb: "bg-white"
                                            }}
                                        >
                                            <span className="text-white">Allow Carry Forward</span>
                                        </Switch>
                                        <Input
                                            labelPlacement="outside"
                                            placeholder=" "
                                            variant="bordered"
                                            classNames={{
                                                label: "font-nunito !text-white",
                                                inputWrapper: "font-nunito bg-dashboard-secondary border border-white/20 text-white",
                                                input: "text-white"
                                            }}
                                            label="Carry Forward Limit"
                                            name="carryForwardLimit"
                                            type="number"
                                            defaultValue="5"
                                            className="w-48"
                                        />
                                    </div>

                                    <Switch 
                                        name="documentRequired"
                                        classNames={{
                                            base: "text-white",
                                            wrapper: "bg-white/20",
                                            thumb: "bg-white"
                                        }}
                                    >
                                        <span className="text-white">Documents Required</span>
                                    </Switch>

                                    <div className="border-t border-white/20 pt-4">
                                        <h4 className="font-medium mb-3 text-white">Approval Workflow Limits</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                labelPlacement="outside"
                                                placeholder=" "
                                                variant="bordered"
                                                classNames={{
                                                    label: "font-nunito !text-white",
                                                    inputWrapper: "font-nunito bg-dashboard-secondary border border-white/20 text-white",
                                                    input: "text-white"
                                                }}
                                                label="Manager Max Days"
                                                name="managerMaxDays"
                                                type="number"
                                                defaultValue="30"
                                            />
                                            <Input
                                                labelPlacement="outside"
                                                placeholder=" "
                                                variant="bordered"
                                                classNames={{
                                                    label: "font-nunito !text-white",
                                                    inputWrapper: "font-nunito bg-dashboard-secondary border border-white/20 text-white",
                                                    input: "text-white"
                                                }}
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
                                <Button 
                                    variant="light" 
                                    onPress={onClose}
                                    className="text-gray-300 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-action-primary text-white hover:bg-action-primary"
                                >
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