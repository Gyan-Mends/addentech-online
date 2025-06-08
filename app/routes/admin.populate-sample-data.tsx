import { json, ActionFunction } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { Button, Card, CardBody, Chip } from "@nextui-org/react";
import { getSession } from "~/session";
import TaskActivity from "~/modal/taskActivity";
import Registration from "~/modal/registration";
import Task from "~/modal/task";
import Departments from "~/modal/department";
import AdminLayout from "~/layout/adminLayout";

export const action: ActionFunction = async ({ request }) => {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return json({ success: false, message: "Not authenticated" });
        }

        const currentUser = await Registration.findOne({ email: userId });
        if (!currentUser || currentUser.role !== 'admin') {
            return json({ success: false, message: "Access denied: Admin only" });
        }

        // Get sample data
        const departments = await Departments.find().limit(3);
        const users = await Registration.find({ status: 'active' }).limit(10);
        const tasks = await Task.find().limit(5);

        if (!departments.length || !users.length || !tasks.length) {
            return json({ 
                success: false, 
                message: "No base data found. Please create departments, users, and tasks first." 
            });
        }

        const activities = [];
        const now = new Date();

        // Generate sample activities for the last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
            const randomDept = departments[Math.floor(Math.random() * departments.length)];

            // Create 2-5 activities per day
            const dailyActivities = Math.floor(Math.random() * 4) + 2;
            
            for (let j = 0; j < dailyActivities; j++) {
                const activityTypes = [
                    'created', 'assigned', 'status_changed', 'updated', 
                    'commented', 'time_logged', 'completed'
                ];
                const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
                
                const activity = {
                    taskId: randomTask._id,
                    userId: randomUser._id,
                    department: randomDept._id,
                    activityType: randomType,
                    activityDescription: `Sample ${randomType.replace('_', ' ')} activity for testing`,
                    newValue: randomType === 'time_logged' ? Math.floor(Math.random() * 8 + 1).toString() : `Sample ${randomType} value`,
                    metadata: randomType === 'time_logged' ? { timeLogged: Math.floor(Math.random() * 8 + 1) } : {},
                    timestamp: new Date(date.getTime() + (j * 60 * 60 * 1000)) // Spread throughout the day
                };

                activities.push(activity);
            }
        }

        // Insert sample activities
        await TaskActivity.insertMany(activities);

        return json({ 
            success: true, 
            message: `Successfully created ${activities.length} sample activities for testing reports`,
            count: activities.length
        });

    } catch (error) {
        console.error('Error populating sample data:', error);
        return json({ 
            success: false, 
            message: `Failed to populate sample data: ${error.message}` 
        });
    }
};

const PopulateSampleData = () => {
    const actionData = useActionData<typeof action>();
    const submit = useSubmit();

    const handlePopulate = () => {
        const formData = new FormData();
        formData.append('_action', 'populate');
        submit(formData, { method: 'post' });
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Populate Sample Data</h1>
                    <p className="text-gray-600 mt-2">
                        Generate sample activity data for testing the reporting system
                    </p>
                </div>

                <Card>
                    <CardBody className="text-center py-12">
                        <h2 className="text-xl font-semibold mb-4">Generate Sample Activity Data</h2>
                        <p className="text-gray-600 mb-6">
                            This will create sample task activities for the last 30 days to test the reporting system.
                            <br />
                            <strong>⚠️ Admin access required</strong>
                        </p>
                        
                        <Button 
                            color="primary" 
                            size="lg"
                            onClick={handlePopulate}
                            isDisabled={actionData?.success}
                        >
                            {actionData?.success ? 'Data Populated' : 'Populate Sample Data'}
                        </Button>

                        {actionData && (
                            <div className="mt-4">
                                <Chip 
                                    color={actionData.success ? 'success' : 'danger'}
                                    variant="flat"
                                >
                                    {actionData.message}
                                </Chip>
                                {actionData.success && actionData.count && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Created {actionData.count} sample activities
                                    </p>
                                )}
                            </div>
                        )}
                    </CardBody>
                </Card>

                {actionData?.success && (
                    <Card>
                        <CardBody>
                            <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                            <div className="space-y-2">
                                <p>✅ Sample data has been populated</p>
                                <p>📊 You can now test the reports:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600">
                                    <li><a href="/admin/reports" className="text-blue-600 hover:underline">View all reports</a></li>
                                    <li><a href="/admin/reports/productivity-dashboard" className="text-blue-600 hover:underline">Productivity Dashboard</a></li>
                                    <li><a href="/admin/reports/department/monthly" className="text-blue-600 hover:underline">Department Reports</a></li>
                                    <li><a href="/admin/reports/staff/monthly" className="text-blue-600 hover:underline">Staff Reports</a></li>
                                </ul>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
};

export default PopulateSampleData; 