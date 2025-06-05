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
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  
  const isSubmitting = navigation.state === "submitting";
  
  useEffect(() => {
    if (loaderData?.users) {
      setUsers(loaderData.users);
    }
  }, [loaderData]);
  
  // Update permissions when user is selected
  useEffect(() => {
    if (selectedUser) {
      const userPerms: Record<string, boolean> = {};
      
      // Initialize all permissions to false
      Object.keys(availablePermissions).forEach(key => {
        userPerms[key] = false;
      });
      
      // Set user's actual permissions
      if (selectedUser.permissions) {
        Object.entries(selectedUser.permissions).forEach(([key, value]) => {
          if (key in availablePermissions) {
            userPerms[key] = Boolean(value);
          }
        });
      }
      
      setUserPermissions(userPerms);
    }
  }, [selectedUser]);
  
  // Handle permission toggle
  const handlePermissionChange = (permission: string, checked: boolean) => {
    setUserPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
  };
  
  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="h-6 w-6 text-pink-500" />
            User Permissions Management
          </h1>
          
          {isSubmitting && <Spinner />}
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
        
        <div className="mb-6">
          <Select
            label="Select User"
            placeholder="Choose a user to manage permissions"
            onChange={(e) => {
              const userId = e.target.value;
              const user = users.find(u => u._id === userId);
              setSelectedUser(user);
            }}
          >
            {users.map((user) => (
              <SelectItem key={user._id} value={user._id}>
                {user.firstName} {user.lastName} ({user.email}) - {user.role}
              </SelectItem>
            ))}
          </Select>
        </div>
        
        {selectedUser && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Editing Permissions for {selectedUser.firstName} {selectedUser.lastName}
              </h2>
              <div className="flex gap-2 mt-2">
                <Chip color="primary">{selectedUser.role}</Chip>
                <Chip color="secondary">
                  {selectedUser.department?.name || "No Department"}
                </Chip>
              </div>
            </div>
            
            <Form method="post">
              <input type="hidden" name="_action" value="update_permissions" />
              <input type="hidden" name="userId" value={selectedUser._id} />
              
              <Card className="mb-4">
                <div className="p-4">
                  {Object.entries(permissionCategories).map(([category, permissions]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {permissions.map(perm => (
                          <Checkbox
                            key={perm}
                            name={`perm_${perm}`}
                            isSelected={userPermissions[perm]}
                            onChange={(e) => handlePermissionChange(perm, e.target.checked)}
                          >
                            {availablePermissions[perm]}
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  color="primary"
                  startContent={<Save size={16} />}
                  isLoading={isSubmitting}
                >
                  Save Permissions
                </Button>
              </div>
            </Form>
          </div>
        )}
        
        {!selectedUser && (
          <div className="text-center py-12 text-gray-500">
            <UserCheck size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Select a user to manage their permissions</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
