import { Card, CardHeader, CardBody, Button, Select, SelectItem, Divider } from "@nextui-org/react";
import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import { BarChart3, Users, TrendingUp, Calendar, FileText, Clock } from "lucide-react";
import AdminLayout from "~/layout/adminLayout";
import LineChart from "~/components/ui/LineChart";

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return redirect("/addentech-login");
        }

        const currentUser = await Registration.findOne({ email: userId });
        if (!currentUser) {
            return redirect("/addentech-login");
        }

        // Get departments for filtering based on role
        let departments = [];
        if (currentUser.role === 'admin' || currentUser.role === 'manager') {
            departments = await Departments.find();
        } else if (currentUser.role === 'department_head') {
            const userDept = await Departments.findById(currentUser.department);
            if (userDept) {
                departments = [userDept];
            }
        }
        // Staff don't need department info for main reports page

        // Get users for individual reports based on role
        let users = [];
        if (currentUser.role === 'admin' || currentUser.role === 'manager') {
            users = await Registration.find({ status: 'active' }, 'firstName lastName email role department');
        } else if (currentUser.role === 'department_head') {
            users = await Registration.find({ 
                department: currentUser.department, 
                status: 'active' 
            }, 'firstName lastName email role');
        } else if (currentUser.role === 'staff') {
            // Staff can only see their own info
            users = [await Registration.findById(currentUser._id, 'firstName lastName email role department')];
        }

        return json({
            departments,
            users,
            currentUser: {
                id: currentUser._id,
                email: currentUser.email,
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                role: currentUser.role,
                department: currentUser.department
            }
        });
    } catch (error: any) {
        console.error('Error loading reports data:', error);
        return json({
            departments: [],
            users: [],
            currentUser: null,
            error: `Failed to load data: ${error?.message || error}`
        });
    }
};

const ReportsPage = () => {
    const { departments, users, currentUser, error } = useLoaderData<typeof loader>();

    if (error) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <Card className="border-danger">
                        <CardBody>
                            <p className="text-danger">{error}</p>
                        </CardBody>
                    </Card>
                </div>
            </AdminLayout>
        );
    }

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <AdminLayout>
            <div className="p-6 space-y-6 !text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Task Activity Reports</h1>
                        <p className="text-gray-300 mt-2">
                            Generate comprehensive reports for departments and individual staff members
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm text-gray-300">Total Departments</p>
                                    <p className="text-2xl font-bold text-white">{departments?.length || 0}</p>
                                </div>
                                <Users className="text-blue-400" size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm text-gray-300">Total Users</p>
                                    <p className="text-2xl font-bold text-white">{users?.length || 0}</p>
                                </div>
                                <FileText className="text-green-400" size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm text-gray-300">Report Types</p>
                                    <p className="text-2xl font-bold text-white">6</p>
                                </div>
                                <BarChart3 className="text-purple-400" size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-dashboard-secondary border border-white/20 shadow-md">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm text-gray-300">Current Year</p>
                                    <p className="text-2xl font-bold text-white">{new Date().getFullYear()}</p>
                                </div>
                                <Calendar className="text-amber-400" size={24} />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Reports Statistics Line Chart */}
                <LineChart
                    title="Reports Dashboard Overview"
                    data={{
                        labels: ['Total Departments', 'Total Users', 'Report Types', 'Current Year'],
                        datasets: [
                            {
                                label: 'Reports Stats',
                                data: [
                                    departments?.length || 0,
                                    users?.length || 0,
                                    6, // Number of report types
                                    new Date().getFullYear()
                                ],
                                borderColor: '#8B5CF6',
                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                fill: true,
                                tension: 0.4,
                            },
                        ],
                    }}
                    height={350}
                    className="mb-6"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Department Reports - Not available for staff */}
                    {currentUser?.role !== 'staff' && (
                    <Card className="p-6 bg-dashboard-secondary border border-white/20">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl text-white font-semibold">Department Reports</h2>
                                    <p className="text-gray-300 text-sm">
                                        View activity and productivity reports by department
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody className="pt-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link to="/admin/reports/department/weekly">
                                        <Card className="cursor-pointer hover:shadow-md bg-dashboard-secondary transition-shadow border border-white/20 hover:border-blue-200">
                                            <CardBody className="p-4 text-center">
                                                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                                <h3 className="font-semibold text-white">Weekly Reports</h3>
                                                <p className="text-sm text-gray-300">Current week activity</p>
                                            </CardBody>
                                        </Card>
                                    </Link>
                                    <Link to="/admin/reports/department/monthly">
                                        <Card className="cursor-pointer hover:shadow-md bg-dashboard-secondary transition-shadow border border-white/20 hover:border-blue-200">
                                            <CardBody className="p-4 text-center">
                                                <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                                <h3 className="font-semibold text-white">Monthly Reports</h3>
                                                <p className="text-sm text-gray-300">Month-by-month breakdown</p>
                                            </CardBody>
                                        </Card>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Link to="/admin/reports/department/quarterly">
                                        <Card className="cursor-pointer hover:shadow-md bg-dashboard-secondary transition-shadow border border-white/20 hover:border-purple-200">
                                            <CardBody className="p-4 text-center">
                                                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                                <h3 className="font-semibold text-white">Quarterly Reports</h3>
                                                <p className="text-sm text-gray-300">Q1, Q2, Q3, Q4 analysis</p>
                                            </CardBody>
                                        </Card>
                                    </Link>
                                    <Link to="/admin/reports/productivity-dashboard">
                                            <Card className="cursor-pointer hover:shadow-md bg-dashboard-secondary transition-shadow border border-white/20 hover:border-orange-200">
                                            <CardBody className="p-4 text-center">
                                                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                                <h3 className="font-semibold text-white">Productivity Dashboard</h3>
                                                <p className="text-sm text-gray-300">Real-time metrics</p>
                                            </CardBody>
                                        </Card>
                                    </Link>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    )}

                    {/* Individual Staff Reports */}
                    <Card className="p-6 bg-dashboard-secondary border border-white/20">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Individual Staff Reports</h2>
                                    <p className="text-gray-300 text-sm">
                                        Track individual performance and activity
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody className="pt-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link to="/admin/reports/staff/weekly">
                                        <Card className="cursor-pointer hover:shadow-md bg-dashboard-secondary transition-shadow border border-white/20 hover:border-green-200">
                                            <CardBody className="p-4 text-center">
                                                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                                <h3 className="font-semibold text-white">Weekly Reports</h3>
                                                <p className="text-sm text-gray-300">Individual weekly activity</p>
                                            </CardBody>
                                        </Card>
                                    </Link>
                                    <Link to="/admin/reports/staff/monthly">
                                        <Card className="cursor-pointer hover:shadow-md bg-dashboard-secondary transition-shadow border border-white/20 hover:border-green-200">
                                            <CardBody className="p-4 text-center">
                                                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                                <h3 className="font-semibold text-white">Monthly Reports</h3>
                                                <p className="text-sm text-gray-300">Monthly performance tracking</p>
                                            </CardBody>
                                        </Card>
                                    </Link>
                                </div>
                                <div className="w-full">
                                    <Link to="/admin/reports/staff/quarterly">
                                        <Card className="cursor-pointer hover:shadow-md bg-dashboard-secondary transition-shadow border border-white/20 hover:border-green-200">
                                            <CardBody className="p-4 text-center">
                                                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                                <h3 className="font-semibold text-white">Quarterly Reports</h3>
                                                <p className="text-sm text-gray-300">Quarterly performance analysis</p>
                                            </CardBody>
                                        </Card>
                                    </Link>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Quick Stats */}
                <Card className="p-6 bg-dashboard-secondary border border-white/20">
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-white">Quick Access</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
                                <h3 className="font-semibold text-blue-300">Available Departments</h3>
                                <p className="text-2xl font-bold text-blue-400">{departments?.length || 0}</p>
                                <p className="text-sm text-blue-300">departments to report on</p>
                            </div>
                            <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
                                <h3 className="font-semibold text-green-300">Staff Members</h3>
                                <p className="text-2xl font-bold text-green-400">{users?.length || 0}</p>
                                <p className="text-sm text-green-300">individual reports available</p>
                            </div>
                            <div className="bg-purple-900/20 border border-purple-700 p-4 rounded-lg">
                                <h3 className="font-semibold text-purple-300">Current Year</h3>
                                <p className="text-2xl font-bold text-purple-400">{currentYear}</p>
                                <p className="text-sm text-purple-300">reporting year</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ReportsPage; 