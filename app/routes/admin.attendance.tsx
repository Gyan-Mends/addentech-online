import { Button, Input, Spinner, Tab, Tabs } from "@nextui-org/react";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { DataTable } from "../components/DataTable";
import AdminLayout from "~/layout/adminLayout";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import attendanceController from "~/controller/attendance";
import { ActionFunctionArgs } from "@remix-run/node";
import { BarChart2, Calendar, CheckCircle, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { getSession } from "~/session";
import Registration from "~/modal/registration";
import { redirect } from "@remix-run/node";
import { errorToast, successToast } from "~/components/toast";
import { Toaster } from "react-hot-toast";

// Define the return type for the loader
interface LoaderData {
  currentUser: any;
  isAdmin: boolean;
  data: any[];
  departments: any[];
  allUsers?: any[];
  message?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Get user session data
    const session = await getSession(request.headers.get("Cookie"));
    const userEmail = session.get("email");

    if (!userEmail) {
      return redirect("/addentech-login");
    }

    // Get current user info
    const currentUser = await Registration.findOne({ email: userEmail });
    if (!currentUser) {
      return redirect("/addentech-login");
    }

    const url = new URL(request.url);
    const departmentId = url.searchParams.get("department") || (currentUser.department ? currentUser.department.toString() : null);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const userId = url.searchParams.get("userId");

    // Fetch departments for the dropdown
    let departments = [];
    try {
      const response = await fetch(`${url.origin}/api/departments`);
      if (response.ok) {
        const result = await response.json();
        departments = result.data || [];
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
    
    // Fetch all users (for admin/manager work mode management)
    let allUsers: Array<{
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      workMode?: string;
    }> = [];
    
    if (["admin", "manager"].includes(currentUser.role)) {
      try {
        allUsers = await Registration.find({}, "_id firstName lastName email role workMode");
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    // Get attendance data based on user role and parameters
    let attendanceData = [];
    let message = "";
    
    // Only admins and managers can see all attendance records
    const canViewAllAttendance = ["admin", "manager"].includes(currentUser.role);
    
    if (!canViewAllAttendance) {
      // Non-admin/manager users can only see their own attendance
      let queryParams: { userId: string; startDate?: string; endDate?: string } = {
        userId: currentUser._id
      };
      
      // Add date filtering if provided
      if (startDate && endDate) {
        queryParams.startDate = startDate;
        queryParams.endDate = endDate;
      }
      
      // Get attendance data directly from the controller
      const result = await attendanceController.getUserAttendance(queryParams);
      attendanceData = result.data || [];
      message = result.message;
    } else {
      // Admin and Manager view
      if (startDate && endDate) {
        // Date range report
        const result = await attendanceController.getAttendanceReport({
          startDate,
          endDate,
          departmentId: departmentId || undefined
        });
        // Get data directly from the controller
        attendanceData = result.data || [];
        message = result.message;
      } else if (userId) {
        // View specific user's attendance
        const result = await attendanceController.getUserAttendance({
          userId
        });
        // Get data directly from the controller
        attendanceData = result.data || [];
        message = result.message;
      } else if (departmentId) {
        // View department attendance
        const result = await attendanceController.getAttendanceByDepartment({
          departmentId,
        });
        // Get data directly from the controller
        attendanceData = result.data || [];
        message = result.message;
      } else {
        // Default view for admins/managers - ALL attendance records
        console.log('Admin view: fetching all attendance records');
        
        try {
          // Fetch all attendance records for admin/manager view
          const allAttendance = await Attendance.find({})
            .populate('user', 'firstName lastName email workMode')
            .populate('department', 'name')
            .sort({ date: -1 });
            
          console.log(`Found ${allAttendance.length} total attendance records`);
          attendanceData = allAttendance;
          message = allAttendance.length > 0 ? 
            "Showing all attendance records" : 
            "No attendance records found in the system";
        } catch (error) {
          console.error('Error fetching all attendance:', error);
          message = "Error fetching attendance records";
          attendanceData = [];
        }
      }
    }
    
    if (attendanceData.length === 0) {
      message = "No attendance records found";
    }

    return json({
      currentUser: {
        id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        role: currentUser.role,
        department: currentUser.department,
        workMode: currentUser.workMode || "in-house"
      },
      isAdmin: ["admin", "manager"].includes(currentUser.role),
      data: attendanceData,
      departments,
      allUsers: ["admin", "manager"].includes(currentUser.role) ? allUsers : undefined,
      message: attendanceData.length === 0 ? "No attendance records found for the specified criteria." : undefined
    });
  } catch (error: any) {
    return json({
      success: false,
      message: error.message || "An error occurred",
      departments: [],
      data: [],
      allUsers: [],
      currentUser: null,
      isAdmin: false
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // Get the user session first
  const session = await getSession(request.headers.get("Cookie"));
  const userEmail = session.get("email");
  
  if (!userEmail) {
    return json({ success: false, message: "Not authenticated" }, { status: 401 });
  }
  
  // Get current user
  const currentUser = await Registration.findOne({ email: userEmail });
  if (!currentUser) {
    return json({ success: false, message: "User not found" }, { status: 404 });
  }
  
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "checkIn") {
    try {
      // Use the current user's ID and department automatically
      const userId = currentUser._id.toString();
      const departmentId = currentUser.department.toString();
      const notes = formData.get("notes") as string;
      // Use the user's configured work mode
      const workMode = currentUser.workMode || "in-house";
      
      // Only get location if work mode is in-house
      let latitude, longitude;
      if (workMode === "in-house") {
        latitude = formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : undefined;
        longitude = formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : undefined;
      }

      // Validate required fields
      if (!userId || !departmentId) {
        return json({
          message: "Missing required user or department data",
          success: false,
          status: 400,
          debug: { userId, departmentId, workMode }
        });
      }

      // Call the controller method to check in
      const result = await attendanceController.checkIn({
        userId: currentUser.id,
        departmentId: currentUser.department,
        notes,
        workMode: currentUser.workMode,
        latitude: latitude ? parseFloat(latitude.toString()) : undefined,
        longitude: longitude ? parseFloat(longitude.toString()) : undefined,
        locationName: formData.get('locationName')?.toString() || 'Unknown location'
      });

      // If check-in was successful, redirect to refresh the page data
      if (result.status === 201) {
        return redirect('/admin/attendance');
      }

      return result;
    } catch (error: any) {
      return json({
        message: `Check-in error: ${error.message}`,
        success: false,
        status: 500
      });
    }
  } else if (action === "updateWorkMode") {
    // Only admins and managers can update work modes
    if (!["admin", "manager"].includes(currentUser.role)) {
      return json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    const targetUserId = formData.get("targetUserId") as string;
    const newWorkMode = formData.get("newWorkMode") as string;

    if (!targetUserId || !newWorkMode || !['in-house', 'remote'].includes(newWorkMode)) {
      return json({ success: false, message: "Invalid parameters" }, { status: 400 });
    }

    try {
      await Registration.findByIdAndUpdate(targetUserId, { workMode: newWorkMode });
      return json({ success: true, message: `Work mode updated to ${newWorkMode}` });
    } catch (error) {
      return json({ success: false, message: "Failed to update work mode" }, { status: 500 });
    }
  } else if (action === "checkOut") {
    const attendanceId = formData.get("attendanceId") as string;

    if (!attendanceId) {
      return json({ success: false, message: "Attendance ID is required for checkout" }, { status: 400 });
    }

    return await attendanceController.checkOut({
      attendanceId,
    });
  } else if (action === "deleteAttendance") {
    // Only admins and managers can delete attendance records
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return json({ success: false, message: "You don't have permission to delete attendance records" }, { status: 403 });
    }

    const attendanceId = formData.get("attendanceId") as string;

    if (!attendanceId) {
      return json({ success: false, message: "Attendance ID is required for deletion" }, { status: 400 });
    }

    // Call the controller method to delete the attendance record
    const result = await attendanceController.deleteAttendance({
      attendanceId,
      userRole: currentUser.role
    });

    // If successful, redirect to refresh the page
    if (result.success) {
      return redirect('/admin/attendance');
    }

    return json(result);
  }

  // If we get here, no valid action was specified
  return json({ success: false, message: "Invalid action" }, { status: 400 });
};

export default function AttendancePage() {
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  // Initial states
  const [activeTab, setActiveTab] = useState("today");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const actionData = useActionData<typeof action>();
  const isLoading = navigation.state === "loading";
  
  // Helper function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Debug output to check what data we're receiving
  useEffect(() => {
    console.log('Attendance data in component:', {
      dataAvailable: loaderData?.data?.length > 0,
      dataLength: loaderData?.data?.length,
      firstRecord: loaderData?.data?.[0],
      isAdmin: loaderData?.isAdmin
    });
  }, [loaderData]);

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        successToast(actionData.message);
      } else {
        errorToast(actionData.message);
      }
    }
  }, [actionData]);

  // Columns for attendance table
  const columns = [
    {
      key: "user",
      label: "USER",
      render: (row: any) => {
        const user = row.user || {};
        // Highlight the current user's records
        const isCurrentUser = user._id === loaderData.currentUser.id;
        return (
          <span className={isCurrentUser ? "font-bold text-blue-600" : ""}>
            {user.firstName || ""} {user.lastName || ""}
            {isCurrentUser && " (You)"}
          </span>
        );
      },
    },
    {
      key: "department",
      label: "DEPARTMENT",
      render: (row: any) => {
        const department = row.department || {};
        return department.name || "";
      },
    },
    {
      key: "date",
      label: "DATE",
      render: (row: any) => {
        return new Date(row.date).toLocaleDateString();
      },
    },
    {
      key: "checkInTime",
      label: "CHECK IN",
      render: (row: any) => {
        return new Date(row.checkInTime).toLocaleTimeString();
      },
    },
    {
      key: "checkOutTime",
      label: "CHECK OUT",
      render: (row: any) => {
        return row.checkOutTime
          ? new Date(row.checkOutTime).toLocaleTimeString()
          : "Not checked out";
      },
    },
    {
      key: "location",
      label: "LOCATION",
      render: (row: any) => {
        if (row.location && row.location.locationName) {
          return (
            <div className="max-w-xs truncate" title={row.location.locationName}>
              <span className="text-xs">{row.location.locationName}</span>
              {row.workMode === "in-house" && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                  In-House
                </span>
              )}
              {row.workMode === "remote" && (
                <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-1 rounded">
                  Remote
                </span>
              )}
            </div>
          );
        } else if (row.workMode) {
          return (
            <span className={`text-xs ${row.workMode === "in-house" ? "text-blue-600" : "text-purple-600"}`}>
              {row.workMode === "in-house" ? "In-House" : "Remote"}
            </span>
          );
        }
        return "Unknown";
      },
    },
    {
      key: "workHours",
      label: "WORK HOURS",
      render: (row: any) => {
        return row.workHours ? `${row.workHours} hrs` : "In progress";
      },
    },
    {
      key: "status",
      label: "STATUS",
      render: (row: any) => {
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              row.status === "present"
                ? "bg-green-100 text-green-800"
                : row.status === "late"
                ? "bg-yellow-100 text-yellow-800"
                : row.status === "absent"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (row: any) => {
        // Actions container to hold multiple buttons
        return (
          <div className="flex space-x-2">
            {/* Check-out button for records without checkout time */}
            {row.checkInTime && !row.checkOutTime && (
              <Form method="post" className="inline">
                <input type="hidden" name="_action" value="checkOut" />
                <input type="hidden" name="attendanceId" value={row._id} />
                <Button
                  type="submit"
                  size="sm"
                  color="success"
                  isLoading={isLoading}
                  startContent={<CheckCircle className="h-4 w-4" />}
                >
                  Check Out
                </Button>
              </Form>
            )}

            {/* Delete button for admin/manager roles */}
            {loaderData.isAdmin && (
              <Form method="post" className="inline" onSubmit={(e) => {
                if (!confirm('Are you sure you want to delete this attendance record?')) {
                  e.preventDefault();
                }
              }}>
                <input type="hidden" name="_action" value="deleteAttendance" />
                <input type="hidden" name="attendanceId" value={row._id} />
                <Button
                  type="submit"
                  size="sm"
                  color="danger"
                  isLoading={isLoading}
                >
                  Delete
                </Button>
              </Form>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-lg shadow-md border lg:border-black/10 border-black/30">
        <Toaster position="top-right" />
        <div className="lg:flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Attendance Management
            </h1>
            {loaderData.currentUser && (
              <p className="text-gray-600 mt-1">
                Welcome, {loaderData.currentUser.firstName} {loaderData.currentUser.lastName} | 
                Current Work Mode: <span className="font-semibold">{loaderData.currentUser.workMode === "in-house" ? "In-House" : "Remote"}</span>
              </p>
            )}
          </div>

          {/* Check In Form */}
          <Form method="post" className="flex mt-10 lg:mt-0 flex-col space-y-4 w-full max-w-lg p-4 border rounded-lg border-black/10 shadow">
            <h2 className="text-lg font-semibold text-gray-700">Check In</h2>
            <input type="hidden" name="_action" value="checkIn" />
            <input type="hidden" name="latitude" id="latitude" />
            <input type="hidden" name="longitude" id="longitude" />
            <input type="hidden" name="locationName" id="locationName" />

            {/* Notes field only - user ID and department are automatically retrieved */}
            <div className="mb-4">
              <Input
                name="notes"
                label="Notes"
                placeholder="Any notes for today?"
                classNames={{
                  inputWrapper: "bg-white border border-black/20 shadow-sm"
                }}
              />
            </div>

            {/* Attendance Status and Rules */}
            <div className="p-3 bg-blue-50 rounded-lg mb-4">
              <p className="text-sm text-blue-700 mb-2">
                <span className="font-semibold">Work Mode:</span> {loaderData.currentUser?.workMode === "in-house" ? "In-House" : "Remote"}
              </p>

              {/* Attendance Rules Section */}
              <div className="border-t border-blue-200 pt-2 mt-2">
                <p className="text-xs font-semibold text-blue-800 mb-1">Attendance Rules:</p>
                <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1">
                  <li>Attendance cannot be taken on weekends (Saturday/Sunday)</li>
                  <li>Check-in is only allowed between 7:00 AM and 5:00 PM</li>
                  <li>You can check out anytime after check-in</li>
                  <li>System will automatically check you out at 6:00 PM if not done</li>
                </ul>
              </div>

              {loaderData.currentUser?.workMode === "in-house" && (
                <div className="mt-3 border-t border-blue-200 pt-2">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Location Requirements:</p>
                  <p className="text-xs text-gray-700 mb-2">In-house attendance requires you to be physically present at the office location.</p>
                  <button 
                    type="button" 
                    className="text-xs bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      // Handle location capture here
                      if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition(
                          async (position) => {
                            const { latitude, longitude } = position.coords;

                            // Set hidden inputs with location data
                            document.getElementById("latitude").value = latitude.toString();
                            document.getElementById("longitude").value = longitude.toString();

                            // Calculate distance from office (assuming office coordinates are 5.660881, -0.156627)
                            const officeLatitude = 5.660881;
                            const officeLongitude = -0.156627;
                            const distance = calculateDistance(
                              latitude,
                              longitude,
                              officeLatitude,
                              officeLongitude
                            );

                            // Get location name using reverse geocoding with Google Maps API
                            try {
                              const response = await fetch(
                                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
                              );
                              const data = await response.json();
                              let locationName = "Unknown location";

                              if (data.status === "OK" && data.results && data.results.length > 0) {
                                locationName = data.results[0].formatted_address;
                                // Set the location name in the hidden input
                                document.getElementById("locationName").value = locationName;
                              } else {
                                console.error("Geocoding failed:", data);
                              }

                              // Update location status message
                              const locationStatus = document.getElementById("locationStatus");
                              if (locationStatus) {
                                locationStatus.innerHTML = `<div class="p-2 bg-green-100 rounded">
                                  <p>Location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
                                  <p>Location name: ${locationName}</p>
                                  <p>Distance from office: ${(distance * 1000).toFixed(0)} meters</p>
                                  <p>Status: ${distance <= 0.1 ? "<span class='text-green-600 font-bold'>Within office range ✓</span>" : "<span class='text-red-600 font-bold'>Outside office range ✗</span>"}</p>
                                </div>`;
                              }
                            } catch (error) {
                              console.error("Error with geocoding:", error);
                              // Still update location status without the name
                              const locationStatus = document.getElementById("locationStatus");
                              if (locationStatus) {
                                locationStatus.innerHTML = `<div class="p-2 bg-green-100 rounded">
                                  <p>Location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
                                  <p>Distance from office: ${(distance * 1000).toFixed(0)} meters</p>
                                  <p>Status: ${distance <= 0.1 ? "<span class='text-green-600 font-bold'>Within office range ✓</span>" : "<span class='text-red-600 font-bold'>Outside office range ✗</span>"}</p>
                                </div>`;
                              }
                            }

                            // Enable check-in button if location is captured
                            const checkInBtn = document.getElementById("checkInBtn") as HTMLButtonElement;
                            if (checkInBtn) {
                              checkInBtn.disabled = false;
                            }

                            successToast("Location captured successfully!");
                          },
                          (error) => {
                            console.error("Error getting location:", error);
                            const locationStatus = document.getElementById("locationStatus");
                            if (locationStatus) {
                              locationStatus.innerHTML = `<div class="p-2 bg-red-100 rounded">
                                <p>Error capturing location: ${error.message}</p>
                              </div>`;
                            }
                            errorToast(`Error capturing location: ${error.message}. Please allow location access to check in.`);
                          }
                        );
                      } else {
                        errorToast("Geolocation is not available in your browser.");
                      }
                    }}
                  >
                    Capture My Location
                  </button>
                  <p id="locationStatus" className="text-sm text-gray-500 mt-2 p-2 border border-dashed border-gray-300 rounded">Click to capture your location</p>
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              id="checkInBtn"
              className="bg-pink-500 text-white w-full"
              isLoading={isLoading}
              startContent={<Clock className="h-4 w-4" />}
              disabled={loaderData?.currentUser?.workMode === "in-house"}
            >
              Check In
            </Button>
          </Form>
        </div>
        
        {/* Work Mode Management (Admins and Managers only) */}
        {loaderData.isAdmin && (
          <div className="mb-8 p-4 border rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Manage Work Modes</h2>
            <Form method="post" className="flex flex-col space-y-4">
              <input type="hidden" name="_action" value="updateWorkMode" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                  <select name="targetUserId" className="w-full px-3 py-2 border rounded-md" required>
                    <option value="">Choose a user</option>
                    {loaderData.allUsers && loaderData.allUsers.map((user: any) => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} - {user.workMode === "in-house" ? "In-House" : "Remote"}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                  <select name="newWorkMode" className="w-full px-3 py-2 border rounded-md" required>
                    <option value="">Select work mode</option>
                    <option value="in-house">In-House</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <Button
                    type="submit"
                    className="bg-blue-500 text-white w-full"
                    isLoading={isLoading}
                  >
                    Update Work Mode
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        )}

        {/* Role-based access message */}
        {!loaderData.isAdmin && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-700">
              <span className="font-bold">Note:</span> You are viewing your personal attendance records.
            </p>
          </div>
        )}
        
        <Tabs
        className="flex flex-wrap"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          <Tab
            key="today"
            title={
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{loaderData.isAdmin ? "All Attendance" : "My Attendance"}</span>
              </div>
            }
          >
            <div className="mt-6">
              {/* Admin-only filters */}
              {loaderData.isAdmin && (
                <div className="bg-white rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold mb-2">Filter Attendance</h3>
                  <Form className="flex flex-wrap items-end gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        className="border rounded px-3 py-2 w-[70vw] lg:max-w-[250px]"
                        name="department"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        <option value="">All Departments</option>
                        {loaderData.departments.map((dept: any) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        User
                      </label>
                      <select
                        className="border rounded px-3 py-2 w-[70vw] lg:max-w-[250px]"
                        name="userId"
                      >
                        <option value="">All Users</option>
                        {loaderData.allUsers && loaderData.allUsers.map((user: any) => (
                          <option key={user._id} value={user._id}>
                            {user.firstName} {user.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="submit"
                      color="primary"
                      className="bg-pink-500"
                    >
                      Filter
                    </Button>
                  </Form>
                </div>
              )}
            </div>
          </Tab>
          <Tab
            key="report"
            title={
              <div className="flex items-center space-x-2">
                <BarChart2 className="h-4 w-4" />
                <span>Attendance Report</span>
              </div>
            }
          >
            <div className="mt-6">
              <div className="bg-white rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-2">Generate Report</h3>
                <Form className="flex flex-wrap gap-4">
                  {/* Department filter (admin only) */}
                  {loaderData.isAdmin && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        className="border rounded px-3 py-2 w-full max-w-[250px]"
                        name="department"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        <option value="">All Departments</option>
                        {loaderData.departments.map((dept: any) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      className="border rounded px-3 py-2"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      className="border rounded px-3 py-2"
                      value={dateRange.endDate}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      color="primary"
                      className="bg-pink-500"
                    >
                      Generate Report
                    </Button>
                  </div>
                </Form>
              </div>

              <DataTable
                columns={columns}
                data={loaderData.data}
                isLoading={isLoading}
                emptyContent={"No attendance records found"}
              />
            </div>
          </Tab>
          <Tab
            key="department"
            title={
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Department Attendance</span>
              </div>
            }
          />
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <>
            {loaderData && 'data' in loaderData && loaderData.data && loaderData.data.length > 0 ? (
              <DataTable
                columns={columns}
                data={loaderData.data}
                pagination
                search
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {activeTab === "today"
                    ? "No attendance records for today."
                    : activeTab === "report"
                    ? "Select date range and department to generate a report."
                    : "Select a department to view attendance."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
