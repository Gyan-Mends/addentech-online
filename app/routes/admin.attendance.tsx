import { Button, Input, Spinner, Tab, Tabs, TableRow, TableCell } from "@nextui-org/react";
import NewCustomTable from "~/components/table/newTable";
import AdminLayout from "~/layout/adminLayout";
import { BarChart2, Calendar, CheckCircle, Clock, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import LineChart from "~/components/ui/LineChart";
import { errorToast, successToast } from "~/components/toast";
import { Toaster } from "react-hot-toast";
import axios from "axios";

// Define interfaces
interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  workMode: string;
}

interface AttendanceRecord {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    workMode?: string;
  };
  department: {
    _id: string;
    name: string;
  };
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  workHours?: number;
  workMode: string;
  status: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    locationName?: string;
  };
}

interface Department {
  _id: string;
  name: string;
}

export default function AttendancePage() {
  // State management
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // Filter states
  const [activeTab, setActiveTab] = useState("today");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form states
  const [checkInNotes, setCheckInNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'unknown' | 'granted' | 'denied' | 'unavailable'>('unknown');

  // Fetch attendance data
  const fetchAttendanceData = async (params: any = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.set('startDate', params.startDate);
      if (params.endDate) queryParams.set('endDate', params.endDate);
      if (params.department) queryParams.set('department', params.department);
      if (params.userId) queryParams.set('userId', params.userId);
      
      const response = await axios.get(`/api/attendance?${queryParams.toString()}`);
      
      if (response.data.success) {
        setAttendanceData(response.data.data || []);
        setCurrentUser(response.data.currentUser);
        setIsAdmin(response.data.isAdmin);
        setMessage(response.data.message);
      } else {
        errorToast(response.data.message || "Failed to fetch attendance data");
        setAttendanceData([]);
      }
    } catch (error: any) {
      console.error("Error fetching attendance data:", error);
      errorToast(error.response?.data?.message || "Error fetching attendance data");
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      if (response.data.success) {
        setDepartments(response.data.data.departments || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Fetch all users (for admin/manager)
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      if (response.data.success) {
        setAllUsers(response.data.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Handle check-in
  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('action', 'checkIn');
      formData.append('notes', checkInNotes);

      // Get location for in-house work mode
      if (currentUser?.workMode === 'in-house') {
        try {
          // Request location permission and get current position
          const position = await getCurrentLocation();
          formData.append('latitude', position.coords.latitude.toString());
          formData.append('longitude', position.coords.longitude.toString());
          formData.append('locationName', 'Office Location');
        } catch (locationError: any) {
          console.error("Location error:", locationError);
          
          // Handle different location errors
          if (locationError.code === 1) { // PERMISSION_DENIED
            const allowLocation = confirm(
              "Location access is required for in-house workers to verify attendance location. " +
              "Please allow location access and try again. Do you want to continue without location?"
            );
            
            if (!allowLocation) {
              errorToast("Location access is required for in-house attendance");
              setIsSubmitting(false);
              return;
            }
          } else if (locationError.code === 2) { // POSITION_UNAVAILABLE
            errorToast("Unable to determine your location. Please check your GPS settings.");
            setIsSubmitting(false);
            return;
          } else if (locationError.code === 3) { // TIMEOUT
            errorToast("Location request timed out. Please try again.");
            setIsSubmitting(false);
            return;
          } else {
            errorToast("Location access is required for in-house attendance. Please enable location services.");
            setIsSubmitting(false);
            return;
          }
        }
      }

      const response = await axios.post('/api/attendance', formData);

      if (response.data.success) {
        successToast(response.data.message);
        setCheckInNotes("");
        await fetchAttendanceData(); // Refresh data
      } else {
        errorToast(response.data.message);
      }
    } catch (error: any) {
      console.error("Error checking in:", error);
      errorToast(error.response?.data?.message || "Error during check-in");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async (attendanceId: string) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('action', 'checkOut');
      formData.append('attendanceId', attendanceId);

      const response = await axios.post('/api/attendance', formData);

      if (response.data.success) {
        successToast(response.data.message);
        await fetchAttendanceData(); // Refresh data
      } else {
        errorToast(response.data.message);
      }
    } catch (error: any) {
      console.error("Error checking out:", error);
      errorToast(error.response?.data?.message || "Error during check-out");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle work mode update
  const handleUpdateWorkMode = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    formData.append('action', 'updateWorkMode');

    try {
      const response = await axios.post('/api/attendance', formData);

      if (response.data.success) {
        successToast(response.data.message);
        await fetchAllUsers(); // Refresh users list
        form.reset();
      } else {
        errorToast(response.data.message);
      }
    } catch (error: any) {
      console.error("Error updating work mode:", error);
      errorToast(error.response?.data?.message || "Error updating work mode");
    }
  };

  // Handle delete attendance
  const handleDeleteAttendance = async (attendanceId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('action', 'deleteAttendance');
      formData.append('attendanceId', attendanceId);

      const response = await axios.post('/api/attendance', formData);

      if (response.data.success) {
        successToast(response.data.message);
        await fetchAttendanceData(); // Refresh data
      } else {
        errorToast(response.data.message);
      }
    } catch (error: any) {
      console.error("Error deleting attendance:", error);
      errorToast(error.response?.data?.message || "Error deleting attendance record");
    }
  };

  // Handle auto-checkout
  const handleAutoCheckout = async () => {
    try {
      const response = await axios.get('/api/attendance?action=auto-checkout');

      if (response.data.success) {
        successToast(response.data.message);
        await fetchAttendanceData(); // Refresh data
      } else {
        errorToast(response.data.message);
      }
    } catch (error: any) {
      console.error("Error triggering auto-checkout:", error);
      errorToast(error.response?.data?.message || "Error triggering auto-checkout");
    }
  };

  // Check location permission status
  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    try {
      // Check if permission API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        switch (permission.state) {
          case 'granted':
            setLocationStatus('granted');
            break;
          case 'denied':
            setLocationStatus('denied');
            break;
          case 'prompt':
            setLocationStatus('unknown');
            break;
        }
        
        // Listen for permission changes
        permission.onchange = () => {
          switch (permission.state) {
            case 'granted':
              setLocationStatus('granted');
              break;
            case 'denied':
              setLocationStatus('denied');
              break;
            case 'prompt':
              setLocationStatus('unknown');
              break;
          }
        };
      } else {
        // Fallback for browsers without permission API
        setLocationStatus('unknown');
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationStatus('unknown');
    }
  };

  // Get current location
  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      // Show a loading message to user
      const loadingToast = "Getting your location...";
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (error) => {
          // Enhanced error handling with specific error codes
          let errorMessage = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred while retrieving location.";
              break;
          }
          
          const enhancedError = new Error(errorMessage);
          (enhancedError as any).code = error.code;
          reject(enhancedError);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout to 15 seconds
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  };

  // Handle report generation
  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendanceData({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      department: selectedDepartment
    });
  };

  // Handle filter submission
  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendanceData({
      department: selectedDepartment,
      userId: selectedUser
    });
  };

  // Helper function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Load initial data
  useEffect(() => {
    fetchAttendanceData();
    fetchDepartments();
    
    // Check location permission for in-house workers
    if (currentUser?.workMode === 'in-house') {
      checkLocationPermission();
    }
  }, [currentUser?.workMode]);

  // Load users for admin
  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers();
    }
  }, [isAdmin]);

  // Columns for attendance table
  const columns = [
    { title: "USER", allowSort: true },
    { title: "DEPARTMENT", allowSort: true },
    { title: "DATE", allowSort: true },
    { title: "CHECK IN", allowSort: false },
    { title: "CHECK OUT", allowSort: false },
    { title: "WORK MODE", allowSort: false },
    { title: "WORK HOURS", allowSort: false },
    { title: "STATUS", allowSort: false },
    { title: "ACTIONS", allowSort: false },
  ];

  // Helper function to render table row cells
  const renderTableCell = (row: AttendanceRecord, columnIndex: number) => {
    switch (columnIndex) {
      case 0: // USER
        const user = row.user || {};
        const isCurrentUser = user._id === currentUser?.id;
        return (
          <span className={isCurrentUser ? "font-bold text-blue-600" : ""}>
            {user.firstName || ""} {user.lastName || ""}
            {isCurrentUser && " (You)"}
          </span>
        );
      case 1: // DEPARTMENT
        const department = row.department || {};
        return department.name || "";
      case 2: // DATE
        return new Date(row.date).toLocaleDateString();
      case 3: // CHECK IN
        return new Date(row.checkInTime).toLocaleTimeString();
      case 4: // CHECK OUT
        return row.checkOutTime
          ? new Date(row.checkOutTime).toLocaleTimeString()
          : "Not checked out";
      case 5: // WORK MODE
        return (
          <span className={`text-xs ${row.workMode === "in-house" ? "text-blue-600" : "text-purple-600"}`}>
            {row.workMode === "in-house" ? "In-House" : "Remote"}
          </span>
        );
      case 6: // WORK HOURS
        if (!row.checkInTime || !row.checkOutTime) {
          return "0 hrs 0 mins";
        }
        const checkInTime = new Date(row.checkInTime);
        const checkOutTime = new Date(row.checkOutTime);
        if (isNaN(checkInTime.getTime()) || isNaN(checkOutTime.getTime())) {
          return "0 hrs 0 mins";
        }
        const workHours = checkOutTime.getTime() - checkInTime.getTime();
        const hours = Math.floor(workHours / (1000 * 60 * 60));
        const minutes = Math.floor((workHours % (1000 * 60 * 60)) / (1000 * 60));
        const validHours = isNaN(hours) ? 0 : Math.max(0, hours);
        const validMinutes = isNaN(minutes) ? 0 : Math.max(0, minutes);
        return `${validHours} hrs ${validMinutes} mins`;
      case 7: // STATUS
        return row.checkOutTime ? "Out of Office" : "In Office";
      case 8: // ACTIONS
        return (
          <div className="flex space-x-2">
            {row.checkInTime && !row.checkOutTime && (
              <Button
                size="sm"
                color="success"
                isLoading={isSubmitting}
                startContent={<CheckCircle className="h-4 w-4" />}
                className="text-white"
                onClick={() => handleCheckOut(row._id)}
              >
                Check Out
              </Button>
            )}
            {isAdmin && (
              <Button
                size="sm"
                color="danger"
                onClick={() => handleDeleteAttendance(row._id)}
              >
                Delete
              </Button>
            )}
          </div>
        );
      default:
        return "";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 !text-white">
        <Toaster />

        {/* Header */}
        <div className="bg-dashboard-secondary border border-white/20 rounded-xl p-6 text-white shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Attendance Management</h1>
              <p className="text-gray-300 mt-1">Track and manage attendance records</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-dashboard-secondary border border-white/20 shadow-md rounded-xl p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm text-gray-300">Total Records</p>
                <p className="text-2xl font-bold text-white">{attendanceData?.length || 0}</p>
              </div>
              <Calendar className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="bg-dashboard-secondary border border-white/20 shadow-md rounded-xl p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm text-gray-300">Present Today</p>
                <p className="text-2xl font-bold text-white">
                  {attendanceData?.filter((record: any) =>
                    new Date(record.date).toDateString() === new Date().toDateString() &&
                    record.checkInTime && !record.checkOutTime
                  ).length || 0}
                </p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-dashboard-secondary border border-white/20 shadow-md rounded-xl p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm text-gray-300">Remote Workers</p>
                <p className="text-2xl font-bold text-white">
                  {attendanceData?.filter((record: any) => record.workMode === 'remote').length || 0}
                </p>
              </div>
              <Users className="text-purple-400" size={24} />
            </div>
          </div>

          <div className="bg-dashboard-secondary border border-white/20 shadow-md rounded-xl p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm text-gray-300">In-House Workers</p>
                <p className="text-2xl font-bold text-white">
                  {attendanceData?.filter((record: any) => record.workMode === 'in-house').length || 0}
                </p>
              </div>
              <Clock className="text-amber-400" size={24} />
            </div>
          </div>
        </div>

        {/* Attendance Statistics Line Chart */}
        <LineChart
          title="Attendance Statistics Overview"
          data={{
            labels: ['Total Records', 'Present Today', 'Remote Workers', 'In-House Workers'],
            datasets: [
              {
                label: 'Attendance Stats',
                data: [
                  attendanceData?.length || 0,
                  attendanceData?.filter((record: any) =>
                    new Date(record.date).toDateString() === new Date().toDateString() &&
                    record.checkInTime && !record.checkOutTime
                  ).length || 0,
                  attendanceData?.filter((record: any) => record.workMode === 'remote').length || 0,
                  attendanceData?.filter((record: any) => record.workMode === 'in-house').length || 0
                ],
                borderColor: '#06B6D4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                fill: true,
                tension: 0.4,
              },
            ],
          }}
          height={350}
          className="mb-6"
        />

        <div className="bg-dashboard-secondary  p-6 rounded-lg shadow-md border lg:border-black/10 border-black/30">
          <div className="lg:flex justify-between items-center mb-6">
            <div className="text-white">
              <h1 className="text-2xl font-bold ">
                Attendance Management
              </h1>
              {currentUser && (
                <p className="text-gray-600 mt-1">
                  Welcome, {currentUser.firstName} {currentUser.lastName} |
                  Current Work Mode: <span className="font-semibold text-primary">{currentUser.workMode === "in-house" ? "In-House" : "Remote"}</span>
                </p>
              )}
            </div>

            {/* Check In Form */}
            <form onSubmit={handleCheckIn} className="flex mt-10 lg:mt-0 border border-white/10 flex-col space-y-4 w-full max-w-lg p-4 border rounded-lg border-black/10 shadow">
              <h2 className="text-lg font-semibold text-white">Check In</h2>

              {/* Notes field only - user ID and department are automatically retrieved */}
              <div className="mb-4">
                <Input
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  label="Notes"
                  className="text-white"
                  placeholder="Any notes for today?"
                  classNames={{
                    inputWrapper: "bg-dashboard-secondary border border-white/10 shadow-sm"
                  }}
                />
              </div>

              {/* Attendance Status and Rules */}
              <div className="p-3 bg-dashboard-secondary border border-white/10 !text-white rounded-lg mb-4">
                <p className="text-sm text-white mb-2">
                  <span className="font-semibold">Work Mode:</span> {currentUser?.workMode === "in-house" ? "In-House" : "Remote"}
                </p>

                {/* Attendance Rules Section */}
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <p className="text-xs font-semibold text-dark-text mb-1">Attendance Rules:</p>
                  <ul className="text-xs text-white list-disc pl-4 space-y-1">
                    <li>Attendance cannot be taken on weekends (Saturday/Sunday)</li>
                    <li>Check-in is only allowed between 7:00 AM and 5:00 PM</li>
                    <li>You can check out anytime after check-in</li>
                    <li>System will automatically check you out at 6:00 PM if not done</li>
                  </ul>
                </div>

                {currentUser?.workMode === "in-house" && (
                  <div className="mt-3 border-t border-blue-200 pt-2">
                    <p className="text-xs font-semibold text-dark-text mb-1">Location Requirements:</p>
                    <p className="text-xs mb-2">In-house attendance requires location access to verify you are at the office.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${
                        locationStatus === 'granted' ? 'bg-green-500' :
                        locationStatus === 'denied' ? 'bg-red-500' :
                        locationStatus === 'unavailable' ? 'bg-gray-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <p className={`text-xs ${
                        locationStatus === 'granted' ? 'text-green-300' :
                        locationStatus === 'denied' ? 'text-red-300' :
                        locationStatus === 'unavailable' ? 'text-gray-300' :
                        'text-yellow-300'
                      }`}>
                        {locationStatus === 'granted' ? 'Location access granted - Ready for check-in' :
                         locationStatus === 'denied' ? 'Location access denied - Please enable location services' :
                         locationStatus === 'unavailable' ? 'Location services not available in this browser' :
                         'Location access will be requested when checking in'}
                      </p>
                    </div>
                    {locationStatus === 'denied' && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-md">
                        <p className="text-xs text-red-700">
                          To enable location access: Go to your browser settings → Privacy & Security → Site Settings → Location → Allow this site to access your location.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {currentUser?.workMode === "in-house" && locationStatus !== 'granted' && (
                <Button
                  type="button"
                  className="bg-blue-500 text-white w-full mb-2"
                  onClick={async () => {
                    try {
                      await getCurrentLocation();
                      successToast("Location access granted! You can now check in.");
                      setLocationStatus('granted');
                    } catch (error: any) {
                      if (error.code === 1) {
                        errorToast("Location access denied. Please allow location access to check in.");
                        setLocationStatus('denied');
                      } else {
                        errorToast("Unable to get location. Please check your settings.");
                      }
                    }
                  }}
                >
                  Test Location Access
                </Button>
              )}

              <Button
                type="submit"
                className="bg-pink-500 text-white w-full"
                isLoading={isSubmitting}
                startContent={<Clock className="h-4 w-4" />}
                isDisabled={currentUser?.workMode === "in-house" && locationStatus === 'unavailable'}
              >
                Check In
              </Button>

              {currentUser?.workMode === "in-house" && locationStatus === 'unavailable' && (
                <p className="text-xs text-red-400 mt-1 text-center">
                  Location services are not available in your browser. Please use a different browser or device.
                </p>
              )}
            </form>
          </div>

          {/* Work Mode Management (Admins and Managers only) */}
          {isAdmin && (
            <div className="mb-8 p-4 bg-dashboard-secondary border border-white/20 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-white mb-4">Admin Controls</h2>
              
              {/* Work Mode Management */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-white mb-3">Manage Work Modes</h3>
                <form onSubmit={handleUpdateWorkMode} className="flex flex-col space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Select User</label>
                      <select name="targetUserId" className="w-full px-3 py-2 border border-white/20 bg-dashboard-secondary rounded-md !text-white" required>
                        <option value="">Choose a user</option>
                        {allUsers && allUsers.map((user: any) => (
                          <option key={user._id} value={user._id}>
                            {user.firstName} {user.lastName} - {user.workMode === "in-house" ? "In-House" : "Remote"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Work Mode</label>
                      <select name="newWorkMode" className="w-full px-3 py-2 border border-white/20 bg-dashboard-secondary rounded-md !text-white" required>
                        <option value="">Select work mode</option>
                        <option value="in-house">In-House</option>
                        <option value="remote">Remote</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="submit"
                        className="bg-blue-500 text-white w-full"
                        isLoading={isSubmitting}
                      >
                        Update Work Mode
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Auto-checkout button */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-white mb-3">Auto-Checkout</h3>
                <Button
                  onClick={handleAutoCheckout}
                  className="bg-orange-500 text-white"
                  isLoading={isSubmitting}
                >
                  Trigger Auto-Checkout
                </Button>
              </div>
            </div>
          )}

          {/* Role-based access message */}
          {!isAdmin && (
            <div className="bg-dashboard-secondary border border-white/20 p-4 rounded-lg mb-4">
              <p className="text-blue-700">
                <span className="font-bold">Note:</span> You are viewing your personal attendance records.
              </p>
            </div>
          )}

          <Tabs
            className="flex flex-wrap"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            classNames={{
              tabList: "bg-dashboard-secondary border border-white/20",
              tab: "text-gray-300 data-[selected=true]:text-white",
              tabContent: "text-gray-300 data-[selected=true]:text-white",
              panel: "pt-6"
            }}
          >
            <Tab
              key="today"
              title={
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{isAdmin ? "All Attendance" : "My Attendance"}</span>
                </div>
              }
            >
              <div className="mt-6 !text-white">
                {/* Admin-only filters */}
                {isAdmin && (
                  <div className="bg-dashboard-secondary border border-white/20 rounded-lg p-4 mb-6">
                    <h3 className="text-lg text-white font-semibold mb-2">Filter Attendance</h3>
                    <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
                      <div>
                        <label className="block text-sm text-white mb-1">
                          Department
                        </label>
                        <select
                          className="bg-dashboard-secondary border border-white/20 rounded px-3 py-2 w-[70vw] lg:max-w-[250px] text-white"
                          name="department"
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                          <option value="">All Departments</option>
                          {departments && departments.map((dept: any) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-white mb-1">
                          User
                        </label>
                        <select
                          className="bg-dashboard-secondary border border-white/20 rounded px-3 py-2 w-[70vw] lg:max-w-[250px] text-white"
                          name="userId"
                          value={selectedUser}
                          onChange={(e) => setSelectedUser(e.target.value)}
                        >
                          <option value="">All Users</option>
                          {allUsers && allUsers.map((user: any) => (
                            <option key={user._id} value={user._id}>
                              {user.firstName} {user.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          color="primary"
                          className="bg-pink-500"
                        >
                          Filter
                        </Button>
                        <Button
                          type="button"
                          color="default"
                          variant="bordered"
                          startContent={<X className="h-4 w-4 text-white" />}
                          onClick={() => {
                            setSelectedDepartment("");
                            setSelectedUser("");
                            fetchAttendanceData();
                          }}
                          className="!text-white border border-white/20"
                        >
                          Clear
                        </Button>
                      </div>
                    </form>
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
                <div className="bg-dashboard-secondary border border-white/20 rounded-lg p-4 mb-6">
                  <h3 className="text-lg text-white font-semibold mb-2">Generate Report</h3>
                  <form onSubmit={handleGenerateReport} className="flex flex-wrap gap-4 items-end">
                    {/* Department filter (admin only) */}
                    {isAdmin && (
                      <div>
                        <label className="block text-sm text-white mb-1">
                          Department
                        </label>
                        <select
                          className="bg-dashboard-secondary border border-white/20 rounded px-3 py-2 w-full max-w-[250px] text-white"
                          name="department"
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                          <option value="">All Departments</option>
                          {departments && departments.map((dept: any) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-white mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        className="bg-dashboard-secondary border border-white/20 rounded px-3 py-2 text-white"
                        value={dateRange.startDate}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, startDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        className="bg-dashboard-secondary border border-white/20 rounded px-3 py-2 text-white"
                        value={dateRange.endDate}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, endDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        color="primary"
                        className="bg-pink-500"
                      >
                        Generate Report
                      </Button>
                      <Button
                        type="button"
                        color="primary"
                        variant="bordered"
                        className="!text-white"
                        startContent={<X className="h-4 w-4 text-white" />}
                        onClick={() => {
                          setDateRange({
                            startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0],
                            endDate: new Date().toISOString().split("T")[0],
                          });
                          setSelectedDepartment("");
                          fetchAttendanceData();
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </form>
                </div>
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

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" color="primary" />
            </div>
          ) : (
            <>
              {attendanceData && attendanceData.length > 0 ? (
                (() => {
                  const totalItems = attendanceData.length;
                  const totalPages = Math.ceil(totalItems / itemsPerPage);
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const endIndex = startIndex + itemsPerPage;
                  const currentData = attendanceData.slice(startIndex, endIndex);
                  
                  return (
                    <NewCustomTable
                      totalPages={totalPages}
                      loadingState={loading ? "loading" : "idle"}
                      columns={columns}
                      page={currentPage}
                      setPage={setCurrentPage}
                    >
                      {currentData.map((record: AttendanceRecord, index: number) => (
                        <TableRow key={record._id || index}>
                          {columns.map((_, columnIndex) => (
                            <TableCell key={columnIndex}>
                              {renderTableCell(record, columnIndex)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </NewCustomTable>
                  );
                })()
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {activeTab === "today"
                      ? "No attendance records found."
                      : activeTab === "report"
                        ? "Select date range and department to generate a report."
                        : "Select a department to view attendance."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
