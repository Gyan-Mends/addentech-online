import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { Form, useActionData } from "@remix-run/react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { Send } from "lucide-react";
import AdminLayout from "~/layout/adminLayout";

export async function action({ request }: ActionFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        
        // Call the reminder API
        const response = await fetch(`${new URL(request.url).origin}/api/leave-reminders`, {
            method: 'POST'
        });
        
        const result = await response.json();
        return json(result);
        
    } catch (error: any) {
        return json({ 
            success: false, 
            error: "Failed to trigger reminders"
        });
    }
}

export default function LeaveReminders() {
    const actionData = useActionData<typeof action>();
    
    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Leave Reminder System</h1>
                
                {actionData && (
                    <Card className={actionData.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                        <CardBody>
                            <p>{actionData.message || actionData.error}</p>
                            {actionData.success && (
                                <div className="text-sm mt-2">
                                    <p>Checked: {actionData.totalChecked}</p>
                                    <p>Sent: {actionData.remindersSent}</p>
                                    <p>Errors: {actionData.errors}</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Manual Reminder Trigger</h3>
                    </CardHeader>
                    <CardBody>
                        <Form method="post">
                            <Button
                                type="submit"
                                color="primary"
                                startContent={<Send size={16} />}
                            >
                                Send Leave Reminders Now
                            </Button>
                        </Form>
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
} 