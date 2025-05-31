import { Button, Card, Input, Select, SelectItem, Spinner, Tab, Tabs, Textarea } from "@nextui-org/react";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { DataTable } from "../components/DataTable";
import AdminLayout from "~/layout/adminLayout";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import taskController from "~/controller/task";
import { ActionFunctionArgs } from "@remix-run/node";
import { CalendarDays, CheckCircle, Clock, MessageSquare, Plus, Tag, Users } from "lucide-react";
import { useState } from "react";
import { commitSession, getSession } from "~/session";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  
  // Check for user authorization
  if (!user) {
    return redirect("/login?redirectTo=/admin/tasks");
  }
  
  // Check role-based permissions
  const hasTaskPermission = 
    user.role === "admin" || 
    user.permissions?.view_task;
  
  if (!hasTaskPermission) {
    return redirect("/admin?error=You do not have permission to access tasks");
  }

  const url = new URL(request.url);
  const departmentId = url.searchParams.get("department");
  const taskId = url.searchParams.get("id");
  const filter = url.searchParams.get("filter") || "all";

  if (taskId) {
    return await taskController.GetSingleTask(taskId);
  } else if (departmentId) {
    return await taskController.GetTasksByDepartment(departmentId);
  } else {
    // Get all tasks for admin, or just the user's department for staff
    if (user.role === "admin") {
      return await taskController.GetAllTasks();
    } else {
      return await taskController.GetTasksByDepartment(user.department);
    }
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  
  if (!user) {
    return json({ success: false, message: "User not authenticated" });
  }

  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "create_task") {
    // Check if user has permission to create tasks
    if (user.role !== "admin" && !user.permissions?.create_task) {
      return json({ 
        success: false, 
        message: "You don't have permission to create tasks" 
      });
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const department = formData.get("department") as string;
    const dueDate = formData.get("dueDate") as string;
    const status = "Unclaimed";

    return await taskController.CreateTask({
      title,
      description,
      priority,
      department,
      dueDate,
      status,
      createdBy: user._id,
      intent: "create",
    });
  } else if (action === "comment") {
    const id = formData.get("taskId") as string;
    const comment = formData.get("comment") as string;

    return await taskController.comment({
      id,
      comment,
      createdBy: user._id,
    });
  } else if (action === "assign_task") {
    // Check if user has permission to assign tasks
    if (user.role !== "admin" && !user.permissions?.assign_task) {
      return json({ 
        success: false, 
        message: "You don't have permission to assign tasks" 
      });
    }

    const id = formData.get("taskId") as string;
    const team = formData.get("team") as string;
    const lead = formData.get("lead") as string;
    const assignee = formData.get("assignee") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const dueDate = formData.get("dueDate") as string;
    const status = formData.get("status") as string;

    return await taskController.AssignTask({
      id,
      team,
      lead,
      assignee,
      description,
      priority,
      dueDate,
      status,
      createdBy: user._id,
    });
  }

  return json({ success: false, message: "Invalid action" });
};

export default function TasksPage() {
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [activeTab, setActiveTab] = useState("view");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);

  const isLoading = navigation.state === "loading";

  // Columns for tasks table
  const columns = [
    {
      key: "title",
      label: "TITLE",
      render: (row: any) => row.title,
    },
    {
      key: "department",
      label: "DEPARTMENT",
      render: (row: any) => {
        const department = row.department || {};
        return department.name || "Unknown";
      },
    },
    {
      key: "priority",
      label: "PRIORITY",
      render: (row: any) => {
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              row.priority === "high"
                ? "bg-red-100 text-red-800"
                : row.priority === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {row.priority.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "STATUS",
      render: (row: any) => {
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              row.status === "Approved"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "dueDate",
      label: "DUE DATE",
      render: (row: any) => {
        return new Date(row.dueDate).toLocaleDateString();
      },
    },
    {
      key: "createdBy",
      label: "CREATED BY",
      render: (row: any) => {
        const creator = row.createdBy || {};
        return `${creator.firstName || ""} ${creator.lastName || ""}`;
      },
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (row: any) => {
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              color="primary"
              className="bg-pink-500"
              onClick={() => {
                setSelectedTask(row);
                setActiveTab("details");
              }}
            >
              View
            </Button>
            <Button
              size="sm"
              color="secondary"
              onClick={() => {
                setSelectedTask(row);
                setShowCommentForm(true);
              }}
            >
              Comment
            </Button>
            {row.status === "Approved" && (
              <Button
                size="sm"
                color="success"
                onClick={() => {
                  setSelectedTask(row);
                  setShowAssignForm(true);
                }}
              >
                Assign
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Task Management</h1>
          {activeTab === "view" && (
            <Button
              color="primary"
              className="bg-pink-500"
              onClick={() => setActiveTab("create")}
              startContent={<Plus className="h-4 w-4" />}
            >
              Create New Task
            </Button>
          )}
        </div>

        {actionData && (
          <div
            className={`mb-4 p-4 rounded-md ${
              actionData.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {actionData.message}
          </div>
        )}

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="mb-6"
        >
          <Tab
            key="view"
            title={
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>All Tasks</span>
              </div>
            }
          />
          <Tab
            key="create"
            title={
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Task</span>
              </div>
            }
          />
          <Tab
            key="details"
            title={
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Task Details</span>
              </div>
            }
          />
        </Tabs>

        {activeTab === "view" && (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" />
              </div>
            ) : (
              <>
                {loaderData.data ? (
                  <DataTable
                    columns={columns}
                    data={loaderData.data}
                    pagination
                    search
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tasks found.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "create" && (
          <Form method="post" className="space-y-4 max-w-3xl mx-auto">
            <input type="hidden" name="_action" value="create_task" />
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  name="title"
                  label="Title"
                  placeholder="Enter task title"
                  isRequired
                  fullWidth
                />
              </div>
              <div className="col-span-2">
                <Textarea
                  name="description"
                  label="Description"
                  placeholder="Enter task description"
                  isRequired
                  minRows={4}
                  fullWidth
                />
              </div>
              <Select
                name="priority"
                label="Priority"
                placeholder="Select priority"
                isRequired
              >
                <SelectItem key="low" value="low">
                  Low
                </SelectItem>
                <SelectItem key="medium" value="medium">
                  Medium
                </SelectItem>
                <SelectItem key="high" value="high">
                  High
                </SelectItem>
              </Select>
              <Input
                name="department"
                label="Department ID"
                placeholder="Enter department ID"
                isRequired
              />
              <div className="col-span-2">
                <Input
                  name="dueDate"
                  label="Due Date"
                  type="date"
                  isRequired
                />
              </div>
            </div>
            <Button
              type="submit"
              className="bg-pink-500 text-white"
              isLoading={isLoading}
            >
              Create Task
            </Button>
          </Form>
        )}

        {activeTab === "details" && selectedTask && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Task Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium">{selectedTask.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p>{selectedTask.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="capitalize">{selectedTask.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    <p className="capitalize">{selectedTask.priority}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p>{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Assignment Information</h3>
                {selectedTask.assignment && selectedTask.assignment.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTask.assignment.map((assignment: any, index: number) => (
                      <div key={index} className="border-b pb-2 mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold">Team: {assignment.team}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            assignment.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : assignment.status === "Needs Approval"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {assignment.status}
                          </span>
                        </div>
                        <p className="text-sm mb-1">{assignment.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">This task has not been assigned yet.</p>
                )}
              </Card>
            </div>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Comments</h3>
              {selectedTask.comments && selectedTask.comments.length > 0 ? (
                <div className="space-y-4">
                  {selectedTask.comments.map((comment: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 border-b pb-3">
                      <div className="bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center">
                        <span className="text-gray-700 font-semibold">
                          {comment.createdBy && 
                           comment.createdBy.firstName && 
                           comment.createdBy.firstName.charAt(0)}
                           {comment.createdBy && 
                           comment.createdBy.lastName && 
                           comment.createdBy.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold">
                            {comment.createdBy && 
                             `${comment.createdBy.firstName || ""} ${comment.createdBy.lastName || ""}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p>{comment.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No comments yet.</p>
              )}
            </Card>
          </div>
        )}

        {showCommentForm && selectedTask && (
          <Card className="max-w-3xl mx-auto p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Add Comment</h3>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="_action" value="comment" />
              <input type="hidden" name="taskId" value={selectedTask._id} />
              <Textarea
                name="comment"
                label="Comment"
                placeholder="Enter your comment here"
                isRequired
                minRows={4}
              />
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  color="primary"
                  className="bg-pink-500"
                  isLoading={isLoading}
                  startContent={<MessageSquare className="h-4 w-4" />}
                >
                  Add Comment
                </Button>
                <Button
                  type="button"
                  variant="flat"
                  onClick={() => setShowCommentForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card>
        )}

        {showAssignForm && selectedTask && (
          <Card className="max-w-3xl mx-auto p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Assign Task</h3>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="_action" value="assign_task" />
              <input type="hidden" name="taskId" value={selectedTask._id} />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="team"
                  label="Team"
                  placeholder="Enter team name"
                  isRequired
                />
                <Input
                  name="lead"
                  label="Team Lead ID"
                  placeholder="Enter lead user ID"
                  isRequired
                />
                <Input
                  name="assignee"
                  label="Assignee ID"
                  placeholder="Enter assignee user ID"
                  isRequired
                />
                <Select
                  name="status"
                  label="Status"
                  placeholder="Select initial status"
                  isRequired
                >
                  <SelectItem key="Pending" value="Pending">
                    Pending
                  </SelectItem>
                  <SelectItem key="Inprogress" value="Inprogress">
                    In Progress
                  </SelectItem>
                </Select>
                <Select
                  name="priority"
                  label="Priority"
                  placeholder="Select priority"
                  isRequired
                >
                  <SelectItem key="low" value="low">
                    Low
                  </SelectItem>
                  <SelectItem key="medium" value="medium">
                    Medium
                  </SelectItem>
                  <SelectItem key="high" value="high">
                    High
                  </SelectItem>
                </Select>
                <Input
                  name="dueDate"
                  label="Due Date"
                  type="date"
                  isRequired
                />
                <div className="col-span-2">
                  <Textarea
                    name="description"
                    label="Assignment Description"
                    placeholder="Enter specific instructions for this assignment"
                    isRequired
                    minRows={3}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  color="primary"
                  className="bg-pink-500"
                  isLoading={isLoading}
                  startContent={<Users className="h-4 w-4" />}
                >
                  Assign Task
                </Button>
                <Button
                  type="button"
                  variant="flat"
                  onClick={() => setShowAssignForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
