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
    const loaderData = useLoaderData<typeof loader>();
    const { user, balances, recentLeaves, analytics, currentYear } = loaderData;
    const error = 'error' in loaderData ? loaderData.error : null;
    
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
                <div className="space-y-6 !text-white">
                    <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
                        <p>{error}</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 !text-white">
                {/* Header */}
                <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 text-white shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-white">My Leave Balance</h1>
                            <p className="text-gray-300 mt-2">Track your leave allocations and usage</p>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/employee-leave-application">
                                <Button
                                    className="bg-action-primary text-white hover:bg-action-primary shadow-sm"
                                    startContent={<Plus size={16} />}
                                >
                                    Apply for Leave
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Balance Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {balances.length === 0 ? (
                        <div className="col-span-full">
                            <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-300">No leave balances found</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Your leave balances will appear here once they're set up
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        balances.map((balance: any) => (
                            <div key={balance._id} className="bg-dashboard-secondary border border-white/20 border-l-4 border-l-blue-500 rounded-xl p-6 shadow-md">
                                <div className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div>
                                            <h3 className="text-lg font-semibold capitalize text-white">
                                                {balance.leaveType.replace('_', ' ')}
                                            </h3>
                                            <p className="text-sm text-gray-300">
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
                                                className="text-gray-300 hover:text-white"
                                            >
                                                <Eye size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-0">
                                    <div className="space-y-3">
                                        <Progress
                                            value={calculateUsagePercentage(balance.used, balance.totalAllocated)}
                                            color={getBalanceColor(balance.remaining, balance.totalAllocated)}
                                            size="sm"
                                            className="w-full"
                                        />
                                        
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className="text-center">
                                                <p className="font-medium text-white">{balance.totalAllocated}</p>
                                                <p className="text-gray-400">Allocated</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-medium text-white">{balance.used}</p>
                                                <p className="text-gray-400">Used</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-medium text-white">{balance.pending}</p>
                                                <p className="text-gray-400">Pending</p>
                                            </div>
                                        </div>

                                        {balance.carriedForward > 0 && (
                                            <div className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 p-2 rounded">
                                                <p>+ {balance.carriedForward} days carried forward</p>
                                            </div>
                                        )}

                                        {balance.transactions && balance.transactions.length > 0 && (
                                            <div className="text-xs text-gray-400">
                                                Last updated: {formatDate(balance.lastUpdated || balance.createdAt)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Enhanced Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                        <div className="text-center text-white">
                            <Calendar className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="text-2xl font-bold">
                                {balances.reduce((sum: number, b: any) => sum + b.totalAllocated, 0)}
                            </h3>
                            <p className="text-sm opacity-90">Total Annual Leave</p>
                        </div>
                    </div>

                    <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                        <div className="text-center text-white">
                            <Clock className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="text-2xl font-bold">
                                {analytics.totalDaysUsed}
                            </h3>
                            <p className="text-sm opacity-90">Days Used This Year</p>
                        </div>
                    </div>

                    <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                        <div className="text-center text-white">
                            <TrendingUp className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="text-2xl font-bold">
                                {analytics.totalDaysRemaining}
                            </h3>
                            <p className="text-sm opacity-90">Days Remaining</p>
                        </div>
                    </div>

                    <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                        <div className="text-center text-white">
                            <BarChart3 className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="text-lg font-bold capitalize">
                                {analytics.mostUsedLeaveType.replace('_', ' ')}
                            </h3>
                            <p className="text-sm opacity-90">Most Used Leave Type</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">Recent Leave Activity</h3>
                        </div>
                    </div>
                    <div>
                        {recentLeaves.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-300">No recent leave activity</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Your leave applications and approvals will appear here
                                </p>
                            </div>
                        ) : (
                            <Table 
                                aria-label="Recent leave activity"
                                className="bg-dashboard-secondary"
                                classNames={{
                                    wrapper: "bg-dashboard-secondary shadow-none",
                                    th: "bg-dashboard-secondary text-white border-b border-white/20",
                                    td: "text-gray-300 border-b border-white/10"
                                }}
                            >
                                <TableHeader>
                                    <TableColumn className="text-white">Leave Type</TableColumn>
                                    <TableColumn className="text-white">Duration</TableColumn>
                                    <TableColumn className="text-white">Days</TableColumn>
                                    <TableColumn className="text-white">Status</TableColumn>
                                    <TableColumn className="text-white">Applied</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {recentLeaves.map((leave: any) => (
                                        <TableRow key={leave._id} className="hover:bg-white/5">
                                            <TableCell className="capitalize text-gray-300">{leave.leaveType}</TableCell>
                                            <TableCell className="text-gray-300">
                                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                            </TableCell>
                                            <TableCell className="text-gray-300">{leave.totalDays} days</TableCell>
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
                                            <TableCell className="text-gray-300">{formatDate(leave.submissionDate)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>

                {/* Leave Policies Info */}
                <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 shadow-md">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white">Leave Policy Information</h3>
                    </div>
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium mb-3 text-white">Important Notes</h4>
                                <ul className="text-sm space-y-2 text-gray-300">
                                    <li>• Leave requests require advance notice</li>
                                    <li>• Some leave types may require documentation</li>
                                    <li>• Unused leave may be carried forward (policy dependent)</li>
                                    <li>• Check with HR for specific policy details</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-3 text-white">Need Help?</h4>
                                <div className="space-y-2">
                                    <Link to="/admin/leave-management">
                                        <Button 
                                            variant="light" 
                                            size="sm" 
                                            className="w-full text-gray-300 hover:text-white border border-white/20"
                                        >
                                            View All My Applications
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="light" 
                                        size="sm" 
                                        className="w-full text-gray-300 hover:text-white border border-white/20"
                                    >
                                        Contact HR
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 