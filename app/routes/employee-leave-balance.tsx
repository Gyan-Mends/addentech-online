import { Card, CardBody, CardHeader, Button, Progress, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem } from "@nextui-org/react";
import { useLoaderData, Link } from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { Calendar, Clock, TrendingUp, Plus, History, BarChart3, Eye, ArrowUp, ArrowDown, Activity } from "lucide-react";
import { useState } from "react";
import AdminLayout from "~/layout/adminLayout";
import { LeaveBalanceController } from "~/controller/leaveBalance";
import { LeaveController } from "~/controller/leave";
import Registration from "~/modal/registration";

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        // Get current user
        const user = await Registration.findOne({ email: userId });
        if (!user) {
            return redirect("/addentech-login");
        }

        // Get user's leave balances
        const balances = await LeaveBalanceController.getEmployeeBalances(user._id);
        
        // Get recent leave history
        const { leaves: recentLeaves } = await LeaveController.getLeaves({
            userEmail: userId,
            userRole: user.role,
            limit: 10,
            page: 1
        });

        // Calculate balance analytics
        const analytics = {
            totalDaysUsed: balances.reduce((sum: number, b: any) => sum + b.used, 0),
            totalDaysRemaining: balances.reduce((sum: number, b: any) => sum + b.remaining, 0),
            pendingDays: balances.reduce((sum: number, b: any) => sum + b.pending, 0),
            mostUsedLeaveType: balances.length > 0 
                ? balances.reduce((prev: any, current: any) => (prev.used > current.used) ? prev : current).leaveType
                : 'N/A'
        };
        
        return json({
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                position: user.position,
                department: user.department
            },
            balances,
            recentLeaves,
            analytics,
            currentYear: new Date().getFullYear()
        });
    } catch (error: any) {
        console.error('Error loading balance data:', error);
        return json({
            user: null,
            balances: [],
            recentLeaves: [],
            analytics: {
                totalDaysUsed: 0,
                totalDaysRemaining: 0,
                pendingDays: 0,
                mostUsedLeaveType: 'N/A'
            },
            currentYear: new Date().getFullYear(),
            error: "Failed to load balance data"
        });
    }
}

export default function EmployeeLeaveBalance() {
    const { user, balances, recentLeaves, analytics, currentYear, error } = useLoaderData<typeof loader>();
    const [selectedBalance, setSelectedBalance] = useState<any>(null);
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const { isOpen, onOpen, onClose } = useDisclosure();

    const calculateUsagePercentage = (used: number, total: number) => {
        return total > 0 ? Math.round((used / total) * 100) : 0;
    };

    const getBalanceColor = (remaining: number, total: number) => {
        const percentage = remaining / total;
        if (percentage > 0.7) return 'success';
        if (percentage > 0.3) return 'warning';
        return 'danger';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'allocation': return <ArrowUp className="w-4 h-4 text-green-500" />;
            case 'used': return <ArrowDown className="w-4 h-4 text-red-500" />;
            case 'adjustment': return <Activity className="w-4 h-4 text-blue-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const viewTransactionHistory = (balance: any) => {
        setSelectedBalance(balance);
        onOpen();
    };

    // Generate years for selection
    const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    if (error) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <Card className="border-red-200 bg-red-50">
                        <CardBody>
                            <p className="text-red-700">{error}</p>
                        </CardBody>
                    </Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">My Leave Balance</h1>
                       
                    </div>
                    <div className="flex gap-3">
                        {/* <Select
                            size="sm"
                            selectedKeys={[selectedYear]}
                            onSelectionChange={(keys) => setSelectedYear(Array.from(keys)[0] as string)}
                            className="w-24"
                        >
                            {availableYears.map(year => (
                                <SelectItem key={year.toString()} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </Select> */}
                        <Link to="/employee-leave-application">
                            <Button
                                className="bg-pink-500 text-white shadow-sm"
                                startContent={<Plus size={16} />}

                            >
                                Apply for Leave
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Balance Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {balances.length === 0 ? (
                        <div className="col-span-full">
                            <Card>
                                <CardBody className="text-center py-12">
                                    <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600">No leave balances found</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Your leave balances will appear here once they're set up
                                    </p>
                                </CardBody>
                            </Card>
                        </div>
                    ) : (
                        balances.map((balance: any) => (
                            <Card key={balance._id} className="border-l-4 border-l-blue-500">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div>
                                            <h3 className="text-lg font-semibold capitalize">
                                                {balance.leaveType.replace('_', ' ')}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {balance.remaining} days remaining
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Chip
                                                color={getBalanceColor(balance.remaining, balance.totalAllocated)}
                                                size="sm"
                                                variant="flat"
                                            >
                                                {Math.round((balance.remaining / balance.totalAllocated) * 100)}%
                                            </Chip>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                isIconOnly
                                                onPress={() => viewTransactionHistory(balance)}
                                            >
                                                <Eye size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0">
                                    <div className="space-y-3">
                                        <Progress
                                            value={calculateUsagePercentage(balance.used, balance.totalAllocated)}
                                            color={getBalanceColor(balance.remaining, balance.totalAllocated)}
                                            size="sm"
                                            className="w-full"
                                        />
                                        
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className="text-center">
                                                <p className="font-medium">{balance.totalAllocated}</p>
                                                <p className="text-gray-500">Allocated</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-medium">{balance.used}</p>
                                                <p className="text-gray-500">Used</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-medium">{balance.pending}</p>
                                                <p className="text-gray-500">Pending</p>
                                            </div>
                                        </div>

                                        {balance.carriedForward > 0 && (
                                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                                <p>+ {balance.carriedForward} days carried forward</p>
                                            </div>
                                        )}

                                        {balance.transactions && balance.transactions.length > 0 && (
                                            <div className="text-xs text-gray-500">
                                                Last updated: {formatDate(balance.lastUpdated || balance.createdAt)}
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        ))
                    )}
                </div>

                {/* Enhanced Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
                        <CardBody className="text-center p-6 text-white">
                            <Calendar className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="text-2xl font-bold">
                                {balances.reduce((sum: number, b: any) => sum + b.totalAllocated, 0)}
                            </h3>
                            <p className="text-sm opacity-90">Total Annual Leave</p>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600">
                        <CardBody className="text-center p-6 text-white">
                            <Clock className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="text-2xl font-bold">
                                {analytics.totalDaysUsed}
                            </h3>
                            <p className="text-sm opacity-90">Days Used This Year</p>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600">
                        <CardBody className="text-center p-6 text-white">
                            <TrendingUp className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="text-2xl font-bold">
                                {analytics.totalDaysRemaining}
                            </h3>
                            <p className="text-sm opacity-90">Days Remaining</p>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600">
                        <CardBody className="text-center p-6 text-white">
                            <BarChart3 className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="text-lg font-bold capitalize">
                                {analytics.mostUsedLeaveType.replace('_', ' ')}
                            </h3>
                            <p className="text-sm opacity-90">Most Used Leave Type</p>
                        </CardBody>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5" />
                            <h3 className="text-lg font-semibold">Recent Leave Activity</h3>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {recentLeaves.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600">No recent leave activity</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Your leave applications and approvals will appear here
                                </p>
                            </div>
                        ) : (
                            <Table aria-label="Recent leave activity">
                                <TableHeader>
                                    <TableColumn>Leave Type</TableColumn>
                                    <TableColumn>Duration</TableColumn>
                                    <TableColumn>Days</TableColumn>
                                    <TableColumn>Status</TableColumn>
                                    <TableColumn>Applied</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {recentLeaves.map((leave: any) => (
                                        <TableRow key={leave._id}>
                                            <TableCell className="capitalize">{leave.leaveType}</TableCell>
                                            <TableCell>
                                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                            </TableCell>
                                            <TableCell>{leave.totalDays} days</TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={
                                                        leave.status === 'approved' ? 'success' :
                                                        leave.status === 'rejected' ? 'danger' : 'warning'
                                                    }
                                                    size="sm"
                                                    variant="flat"
                                                >
                                                    {leave.status}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>{formatDate(leave.submissionDate)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardBody>
                </Card>

                {/* Leave Policies Info */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Leave Policy Information</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium mb-3">Important Notes</h4>
                                <ul className="text-sm space-y-2 text-gray-600">
                                    <li>• Leave requests require advance notice</li>
                                    <li>• Some leave types may require documentation</li>
                                    <li>• Unused leave may be carried forward (policy dependent)</li>
                                    <li>• Check with HR for specific policy details</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-3">Need Help?</h4>
                                <div className="space-y-2">
                                    <Link to="/admin/leave-management">
                                        <Button variant="light" size="sm" className="w-full">
                                            View All My Applications
                                        </Button>
                                    </Link>
                                    <Button variant="light" size="sm" className="w-full">
                                        Contact HR
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
} 