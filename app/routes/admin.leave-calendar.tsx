import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useMemo } from "react";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Leave, { LeaveStatus } from "~/modal/leave";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { Badge } from "@nextui-org/react";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  AlertTriangle,
  Clock,
  Info
} from "lucide-react";
import AdminLayout from "~/layout/adminLayout";

interface LeaveCalendarData {
  _id: string;
  employee: {
    firstName: string;
    lastName: string;
    department: {
      name: string;
    };
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");

    if (!email) {
      return redirect("/addentech-login");
    }

    const currentUser = await Registration.findOne({ email });
    if (!currentUser) {
      return redirect("/addentech-login");
    }

    // Role-based access control similar to attendance
    const isAdmin = ['admin', 'manager'].includes(currentUser.role);
    const isDepartmentHead = currentUser.role === 'department_head';

    // Get URL parameters
    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get("year") || new Date().getFullYear().toString());
    const month = parseInt(url.searchParams.get("month") || (new Date().getMonth() + 1).toString());
    const department = url.searchParams.get("department") || "all";

    // Calculate date range for the month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    
    // Extend range to show overlapping leaves
    const startRange = new Date(startOfMonth);
    startRange.setDate(startRange.getDate() - 7);
    const endRange = new Date(endOfMonth);
    endRange.setDate(endRange.getDate() + 7);

    // Build query based on user role
    let leaveQuery: any = {
      status: { $in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
      $or: [
        { startDate: { $gte: startRange, $lte: endRange } },
        { endDate: { $gte: startRange, $lte: endRange } },
        { startDate: { $lte: startRange }, endDate: { $gte: endRange } }
      ]
    };

    if (!isAdmin && !isDepartmentHead) {
      // Regular users can only see their own leaves
      leaveQuery.employee = currentUser._id;
    } else if (isDepartmentHead && !isAdmin) {
      // Department heads can see leaves from their department
      leaveQuery.department = currentUser.department;
    } else if (department !== "all" && isAdmin) {
      // Admins can filter by department
      leaveQuery.department = department;
    }

    // Get leaves for the month
    const leaves = await Leave.find(leaveQuery)
      .populate({
        path: 'employee',
        select: 'firstName lastName department',
        populate: {
          path: 'department',
          select: 'name'
        }
      })
      .sort({ startDate: 1 });

    // Get departments for filter (admin only)
    let departments = [];
    if (isAdmin) {
      try {
        const url = new URL(request.url);
        const response = await fetch(`${url.origin}/api/departments`);
        if (response.ok) {
          const result = await response.json();
          departments = result.data || [];
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    }

    // Calculate team availability statistics
    const teamStats = {
      totalEmployees: 0,
      onLeaveToday: 0,
      upcomingLeaves: 0,
      pendingApprovals: 0
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get employee count based on role
    const employeeQuery = !isAdmin && !isDepartmentHead
      ? { _id: currentUser._id, status: 'active' }
      : isDepartmentHead && !isAdmin
        ? { department: currentUser.department, status: 'active' }
        : { status: 'active' };
    teamStats.totalEmployees = await Registration.countDocuments(employeeQuery);

    // Calculate statistics
    teamStats.onLeaveToday = leaves.filter(leave => 
      leave.status === LeaveStatus.APPROVED &&
      new Date(leave.startDate) <= today &&
      new Date(leave.endDate) >= today
    ).length;

    teamStats.upcomingLeaves = leaves.filter(leave => 
      leave.status === LeaveStatus.APPROVED &&
      new Date(leave.startDate) > today
    ).length;

    teamStats.pendingApprovals = leaves.filter(leave => 
      leave.status === LeaveStatus.PENDING
    ).length;

    return json({
      leaves,
      departments,
      teamStats,
      currentYear: year,
      currentMonth: month,
      currentUser: {
        id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        role: currentUser.role,
        department: currentUser.department
      },
      isAdmin,
      isDepartmentHead
    });

  } catch (error) {
    console.error("Error loading leave calendar:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
};

export default function LeaveCalendar() {
  const { leaves, departments, teamStats, currentYear, currentMonth, currentUser, isAdmin, isDepartmentHead } = useLoaderData<typeof loader>();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Calendar utilities
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [currentYear, currentMonth]);

  // Get leaves for a specific date
  const getLeavesForDate = (date: Date) => {
    return leaves.filter((leave: LeaveCalendarData) => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is weekend
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  // Navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'prev') {
      newMonth -= 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
    }

    window.location.href = `?year=${newYear}&month=${newMonth}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getLeaveTypeColor = (leaveType: string) => {
    const colors: Record<string, string> = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      emergency: 'bg-orange-100 text-orange-800',
      maternity: 'bg-pink-100 text-pink-800',
      paternity: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      compassionate: 'bg-gray-100 text-gray-800',
      unpaid: 'bg-yellow-100 text-yellow-800',
      other: 'bg-indigo-100 text-indigo-800'
    };
    return colors[leaveType] || 'bg-gray-100 text-gray-800';
  };

  return (
   <AdminLayout>
 <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Leave Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {isAdmin 
              ? "View team leave schedule and availability" 
              : isDepartmentHead 
                ? "View department leave schedule and availability"
                : "View your leave schedule"
            }
          </p>
          {currentUser && (
            <p className="text-gray-600 mt-1">
              Welcome, {currentUser.firstName} {currentUser.lastName} | Role: {currentUser.role}
            </p>
          )}
        </div>
      </div>

      {/* Role-based access message */}
      {!isAdmin && !isDepartmentHead && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-700">
            <span className="font-bold">Note:</span> You are viewing your personal leave calendar.
          </p>
        </div>
      )}

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">Total Team</p>
                <p className="text-2xl font-bold">{teamStats.totalEmployees}</p>
              </div>
              <Users size={24} />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">On Leave Today</p>
                <p className="text-2xl font-bold">{teamStats.onLeaveToday}</p>
              </div>
              <AlertTriangle size={24} />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">Upcoming Leaves</p>
                <p className="text-2xl font-bold">{teamStats.upcomingLeaves}</p>
              </div>
              <Calendar size={24} />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">Pending Approvals</p>
                <p className="text-2xl font-bold">{teamStats.pendingApprovals}</p>
              </div>
              <Clock size={24} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="light"
                startContent={<ChevronLeft size={16} />}
                onClick={() => navigateMonth('prev')}
              >
                Previous
              </Button>
              
              <h2 className="text-xl font-bold">
                {monthNames[currentMonth - 1]} {currentYear}
              </h2>
              
              <Button
                variant="light"
                endContent={<ChevronRight size={16} />}
                onClick={() => navigateMonth('next')}
              >
                Next
              </Button>
            </div>

            <div className="flex gap-4">
              {isAdmin && (
                <Select
                  placeholder="All Departments"
                  size="sm"
                  className="w-48"
                >
                  <SelectItem key="all" value="all">All Departments</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </Select>
              )}

              <Select
                placeholder="Month View"
                size="sm"
                className="w-32"
                selectedKeys={[viewMode]}
                onSelectionChange={(keys) => setViewMode(Array.from(keys)[0] as 'month' | 'week')}
              >
                <SelectItem key="month" value="month">Month</SelectItem>
                <SelectItem key="week" value="week">Week</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-4 text-center font-semibold bg-gray-50 dark:bg-gray-800">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7 auto-rows-fr min-h-[600px]">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="border-r border-b"></div>;
                }

                const currentDate = new Date(currentYear, currentMonth - 1, day);
                const dayLeaves = getLeavesForDate(currentDate);
                const isCurrentDay = isToday(currentDate);
                const isWeekendDay = isWeekend(currentDate);

                return (
                  <div
                    key={day}
                    className={`border-r border-b p-2 min-h-[120px] ${
                      isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${isWeekendDay ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                  >
                    {/* Day Number */}
                    <div className={`text-sm font-medium mb-2 ${
                      isCurrentDay ? 'text-blue-600 font-bold' : 
                      isWeekendDay ? 'text-gray-500' : 'text-gray-900 dark:text-white'
                    }`}>
                      {day}
                    </div>

                    {/* Leave Items */}
                    <div className="space-y-1">
                      {dayLeaves.slice(0, 3).map((leave: LeaveCalendarData) => (
                        <div
                          key={leave._id}
                          className={`text-xs p-1 rounded truncate cursor-pointer ${getLeaveTypeColor(leave.leaveType)}`}
                          title={`${leave.employee.firstName} ${leave.employee.lastName} - ${leave.leaveType} (${leave.status})`}
                        >
                          <div className="flex items-center gap-1">
                            {leave.status === 'pending' && (
                              <Clock size={10} />
                            )}
                            <span className="truncate">
                              {leave.employee.firstName} {leave.employee.lastName.charAt(0)}.
                            </span>
                          </div>
                          <div className="truncate capitalize">
                            {leave.leaveType}
                          </div>
                        </div>
                      ))}
                      
                      {dayLeaves.length > 3 && (
                        <div className="text-xs text-gray-500 p-1">
                          +{dayLeaves.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info size={18} />
            Legend
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-200 rounded"></div>
              <span className="text-sm">Annual Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-200 rounded"></div>
              <span className="text-sm">Sick Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-200 rounded"></div>
              <span className="text-sm">Emergency Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span className="text-sm">Maternity/Paternity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-200 rounded"></div>
              <span className="text-sm">Study Leave</span>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border-2 border-blue-500 rounded"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>Weekend</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Upcoming Leaves List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Upcoming Leaves This Month</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {leaves
              .filter((leave: LeaveCalendarData) => {
                const startDate = new Date(leave.startDate);
                return startDate >= new Date();
              })
              .slice(0, 10)
              .map((leave: LeaveCalendarData) => (
                <div key={leave._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getLeaveTypeColor(leave.leaveType).split(' ')[0]}`}></div>
                    <div>
                      <p className="font-medium">
                        {leave.employee.firstName} {leave.employee.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {leave.employee.department.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        color={leave.status === 'approved' ? 'success' : 'warning'} 
                        variant="flat" 
                        size="sm"
                      >
                        {leave.status}
                      </Badge>
                      <span className="text-xs text-gray-600 capitalize">
                        {leave.leaveType}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {leaves.length === 0 && (
            <p className="text-center text-gray-600 py-8">
              No upcoming leaves scheduled for this month
            </p>
          )}
        </CardBody>
      </Card>
    </div>
   </AdminLayout>
  );
}