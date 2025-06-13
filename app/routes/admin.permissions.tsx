import { Button, Card, Checkbox, Chip, Select, SelectItem, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useEffect, useState } from "react";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import AdminLayout from "~/layout/adminLayout";
import { Edit, Save, Shield, UserCheck } from "lucide-react";

// Define the available permissions
const availablePermissions = {
  // Page access permissions
  view_dashboard: "View Dashboard",
  view_users: "Access Users Page",
  view_departments: "Access Departments Page",
  view_tasks: "Access Tasks Page",
  view_attendance: "Access Attendance Page",
  view_reports: "Access Reports Page",
  view_blog: "Access Blog Page",
  view_categories: "Access Categories Page",
  view_messages: "Access Messages Page",
  
  // Task management permissions
  create_task: "Create Tasks",
  edit_task: "Edit Tasks",
  assign_task: "Assign Tasks",
  
  // Department access
  manage_department: "Manage Departments",
  
  // Monthly reports
  create_report: "Create Reports",
  edit_report: "Edit Reports",
  approve_report: "Approve/Reject Reports",
  
  // Attendance
  manage_attendance: "Manage Attendance",
  view_attendance_report: "View Attendance Reports",
  
  // Leave management
  view_leaves: "View Leaves",
  create_leave: "Create Leave Applications",
  edit_leave: "Edit Leave Applications",
  approve_leave: "Approve/Reject Leaves",
  manage_leaves: "Manage All Leaves",
};

// Group permissions by category
const permissionCategories = {
  "Page Access": [
    "view_dashboard", "view_users", "view_departments", "view_tasks", 
    "view_attendance", "view_reports", "view_blog", "view_categories", "view_messages"
  ],
  "Task Management": ["create_task", "edit_task", "assign_task"],
  "Department Management": ["manage_department"],
  "Reports": ["create_report", "edit_report", "approve_report"],
  "Attendance": ["manage_attendance", "view_attendance_report"],
  "Leave Management": ["view_leaves", "create_leave", "edit_leave", "approve_leave", "manage_leaves"]
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Get the session and user
    const session = await getSession(request.headers.get("Cookie"));
    const userEmail = session.get("email");
    
    if (!userEmail) {
      return redirect("/addentech-login");
    }
    
    // Get the current user
    const currentUser = await Registration.findOne({ email: userEmail });
    
    if (!currentUser) {
      return redirect("/addentech-login");
    }
    
    // Only allow admin and manager roles to access this page
    if (currentUser.role !== "admin" && currentUser.role !== "manager") {
      return redirect("/admin?error=You do not have permission to manage user permissions");
    }
    
    // Get all users
    const users = await Registration.find(
      {}, 
      { firstName: 1, lastName: 1, email: 1, role: 1, permissions: 1, department: 1 }
    )
    .populate("department", "name")
    .lean();
    
    return json({
      success: true,
      users,
      currentUser
    });
  } catch (error) {
    console.error("Error in permissions loader:", error);
    return json({
      success: false,
      message: "Error loading users",
      users: []
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Get the session and user
    const session = await getSession(request.headers.get("Cookie"));
    const userEmail = session.get("email");
    
    if (!userEmail) {
      return json({ success: false, message: "Unauthorized" });
    }
    
    // Get the current user
    const currentUser = await Registration.findOne({ email: userEmail });
    
    if (!currentUser) {
      return json({ success: false, message: "Unauthorized" });
    }
    
    // Only allow admin and manager roles to manage permissions
    if (currentUser.role !== "admin" && currentUser.role !== "manager") {
      return json({ 
        success: false, 
        message: "You do not have permission to manage user permissions" 
      });
    }
    
    const formData = await request.formData();
    const action = formData.get("_action") as string;
    
    if (action === "update_permissions") {
      const userId = formData.get("userId") as string;
      
      // Get all permission keys from the form
      const permissions: Record<string, boolean> = {};
      
      // Collect all permissions from the form
      Object.keys(availablePermissions).forEach(key => {
        permissions[key] = formData.get(`perm_${key}`) === "on";
      });
      
      // Update the user's permissions
      await Registration.findByIdAndUpdate(
        userId,
        { $set: { permissions } }
      );
      
      return json({ 
        success: true, 
        message: "User permissions updated successfully" 
      });
    }
    
    return json({ success: false, message: "Invalid action" });
  } catch (error) {
    console.error("Error in permissions action:", error);
    return json({ 
      success: false, 
      message: "Error updating permissions" 
    });
  }
};

export default function UserPermissionsPage() {
  const { users } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  
  // Initialize permissions when user is selected
  useEffect(() => {
    if (selectedUser) {
      const permissions = selectedUser.permissions ? Object.fromEntries(selectedUser.permissions) : {};
      setUserPermissions(permissions);
    }
  }, [selectedUser]);
  
  const handlePermissionChange = (permissionKey: string, checked: boolean) => {
    setUserPermissions(prev => ({
      ...prev,
      [permissionKey]: checked
    }));
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6 !text-white">
        {/* Header */}
        <div className="bg-color-dark-2 border border-white/10 p-6 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-400" />
                User Permissions Management
              </h1>
              <p className="text-gray-300 mt-1">Manage user access and permissions across the system</p>
            </div>
            {isSubmitting && <Spinner />}
          </div>
        </div>
        
        {/* Action Data Messages */}
        {actionData && (
          <div
            className={`p-4 rounded-md border ${
              actionData.success
                ? "bg-green-900/20 text-green-300 border-green-700"
                : "bg-red-900/20 text-red-300 border-red-700"
            }`}
          >
            {actionData.message}
          </div>
        )}
        
        {/* User Selection */}
        <div className="bg-color-dark-2 border border-white/10 p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Select User</h2>
          <Select
            label="Choose a user to manage permissions"
            placeholder="Select a user..."
            className="max-w-md"
            classNames={{
              trigger: "bg-dashboard-tertiary border-white/20 text-white",
              value: "text-white",
              listbox: "bg-dashboard-secondary",
              popoverContent: "bg-dashboard-secondary border-white/20"
            }}
            onChange={(e) => {
              const userId = e.target.value;
              const user = users.find(u => u?._id === userId);
              setSelectedUser(user || null);
            }}
          >
            {users.map((user) => (
              <SelectItem key={user._id} value={user._id} className="text-white">
                {user.firstName} {user.lastName} ({user.email}) - {user.role}
              </SelectItem>
            ))}
          </Select>
        </div>
        
        {/* Permissions Management */}
        {selectedUser && (
          <div className="bg-color-dark-2 border border-white/10 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Permissions for {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                                 <p className="text-gray-300 text-sm">
                   Role: <span className="font-medium">{selectedUser?.role}</span> | 
                   Department: <span className="font-medium">{selectedUser?.department?.name || "Not assigned"}</span>
                 </p>
              </div>
            </div>
            
            <Form method="post" className="space-y-6">
              <input type="hidden" name="_action" value="update_permissions" />
              <input type="hidden" name="userId" value={selectedUser._id} />
              
              {Object.entries(permissionCategories).map(([category, permissions]) => (
                <div key={category} className="bg-dashboard-tertiary p-4 rounded-lg border border-white/10">
                  <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-400" />
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions.map((permissionKey) => (
                      <div key={permissionKey} className="flex items-center space-x-2">
                        <Checkbox
                          name={`perm_${permissionKey}`}
                          isSelected={userPermissions[permissionKey] || false}
                          onValueChange={(checked) => handlePermissionChange(permissionKey, checked)}
                          className="text-white"
                          classNames={{
                            wrapper: "before:border-white/30",
                            label: "text-gray-300"
                          }}
                        >
                                                     <span className="text-sm text-gray-300">
                             {availablePermissions[permissionKey as keyof typeof availablePermissions] || permissionKey}
                           </span>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isSubmitting}
                  startContent={<Save className="h-4 w-4" />}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Updating..." : "Update Permissions"}
                </Button>
              </div>
            </Form>
          </div>
        )}
        
        {/* Current Users Overview */}
        <div className="bg-color-dark-2 border border-white/10 p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Users Overview</h2>
          <div className="overflow-x-auto">
            <Table 
              aria-label="Users table"
              classNames={{
                wrapper: "bg-dashboard-secondary border border-white/10",
                th: "bg-dashboard-tertiary text-white border-b border-white/10",
                td: "text-gray-300 border-b border-white/10"
              }}
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>PERMISSIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        className={`${
                          user.role === 'admin' ? 'bg-red-600 text-white' :
                          user.role === 'manager' ? 'bg-blue-600 text-white' :
                          user.role === 'department_head' ? 'bg-purple-600 text-white' :
                          'bg-green-600 text-white'
                        }`}
                      >
                        {user.role}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {user.department?.name || "Not assigned"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="flat"
                        onClick={() => setSelectedUser(user)}
                        className="bg-dashboard-tertiary text-white border border-white/20 hover:bg-dashboard-primary"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
