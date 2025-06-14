import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useMemo } from "react";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Department from "~/modal/department";
import LeavePolicy from "~/modal/leavePolicy";
import { LeaveController } from "~/controller/leave";
import { LeaveBalanceController } from "~/controller/leaveBalance";
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

    // Role-based access control
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

    // Build filters for LeaveController
    const leaveFilters: any = {
      startDate: startRange.toISOString(),
      endDate: endRange.toISOString(),
      status: 'all',
      page: 1,
      limit: 1000,
      userEmail: email,
      userRole: currentUser.role,
      userDepartment: currentUser.department
    };

    if (department !== "all" && isAdmin) {
      leaveFilters.department = department;
    }

    // Get leaves for the month using LeaveController
    const { leaves: allLeaves } = await LeaveController.getLeaves(leaveFilters);
    
    // Filter to only approved and pending leaves
    const leaves = allLeaves.filter((leave: any) => 
      leave.status === 'approved' || leave.status === 'pending'
    );

    // Get departments for filter (admin only)
    let departments: any[] = [];
    if (isAdmin) {
      try {
        departments = await Department.find({ isActive: true });
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
    teamStats.onLeaveToday = leaves.filter((leave: any) => 
      leave.status === 'approved' &&
      new Date(leave.startDate) <= today &&
      new Date(leave.endDate) >= today
    ).length;

    teamStats.upcomingLeaves = leaves.filter((leave: any) => 
      leave.status === 'approved' &&
      new Date(leave.startDate) > today
    ).length;

    teamStats.pendingApprovals = leaves.filter((leave: any) => 
      leave.status === 'pending'
    ).length;

    // Get leave policies for policy information
    const policies = await LeavePolicy.find({ isActive: true });

    // Get team balances for capacity planning (admin/manager only)
    let teamBalances: any[] = [];
    if (isAdmin || isDepartmentHead) {
      try {
        if (isAdmin) {
          // Get all employees' balances
          const allEmployees = await Registration.find({ status: 'active' });
          for (const employee of allEmployees) {
            const balances = await LeaveBalanceController.getEmployeeBalances(employee._id, year);
            if (balances.length > 0) {
              teamBalances.push({
                employee: {
                  id: employee._id,
                  name: `${employee.firstName} ${employee.lastName}`,
                  department: employee.department
                },
                balances
              });
            }
          }
        } else if (isDepartmentHead) {
          // Get department employees' balances
          const deptEmployees = await Registration.find({ 
            department: currentUser.department, 
            status: 'active' 
          });
          for (const employee of deptEmployees) {
            const balances = await LeaveBalanceController.getEmployeeBalances(employee._id, year);
            if (balances.length > 0) {
              teamBalances.push({
                employee: {
                  id: employee._id,
                  name: `${employee.firstName} ${employee.lastName}`,
                  department: employee.department
                },
                balances
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching team balances:", error);
      }
    }

    // Detect policy violations in current leaves
    const policyViolations: any[] = [];
    for (const leave of leaves) {
      const policy = policies.find(p => p.leaveType === leave.leaveType);
      if (policy) {
        const submissionDate = new Date(leave.submissionDate);
        const startDate = new Date(leave.startDate);
        const advanceNotice = Math.ceil((startDate.getTime() - submissionDate.getTime()) / (1000 * 3600 * 24));
        
        if (advanceNotice < policy.minAdvanceNotice) {
          policyViolations.push({
            leaveId: leave._id,
            employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
            leaveType: leave.leaveType,
            violation: 'Insufficient advance notice',
            required: policy.minAdvanceNotice,
            actual: advanceNotice
          });
        }
        
        if (leave.totalDays > policy.maxConsecutiveDays) {
          policyViolations.push({
            leaveId: leave._id,
            employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
            leaveType: leave.leaveType,
            violation: 'Exceeds maximum consecutive days',
            required: policy.maxConsecutiveDays,
            actual: leave.totalDays
          });
        }
      }
    }

    return json({
      leaves,
      departments,
      policies,
      teamBalances,
      policyViolations,
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
  const { leaves, departments, policies, teamBalances, policyViolations, teamStats, currentYear, currentMonth, currentUser, isAdmin, isDepartmentHead } = useLoaderData<typeof loader>();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showPolicyViolations, setShowPolicyViolations] = useState(false);

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
    return leaves.filter((leave: any) => {
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
 <div className="p-6 space-y-6 !text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dashboard-primary">
            Leave Calendar
          </h1>
        </div>
      </div>

      {/* Role-based access message */}
      {!isAdmin && !isDepartmentHead && (
        <div className="bg-dashboard-secondary border border-blue-400/50 p-4 rounded-lg">
          <p className="text-dashboard-primary">
            <span className="font-bold text-blue-400">Note:</span> You are viewing your personal leave calendar.
          </p>
        </div>
      )}

      

      {/* Calendar Controls */}
      <Card className="bg-dashboard-secondary border border-white/20">
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                color="primary"
                variant="light"
                startContent={<ChevronLeft size={16} />}
                onClick={() => navigateMonth('prev')}
                className="text-dashboard-primary hover:text-blue-400"
              >
                Previous
              </Button>
              
              <h2 className="text-xl font-bold text-dashboard-primary">
                {monthNames[currentMonth - 1]} {currentYear}
              </h2>
              
              <Button
                color="primary"
                variant="light"
                endContent={<ChevronRight size={16} />}
                onClick={() => navigateMonth('next')}
                className="text-dashboard-primary hover:text-blue-400"
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
                  classNames={{
                    trigger: "bg-dashboard-tertiary border border-white/20 text-dashboard-primary",
                    popoverContent: "bg-dashboard-secondary border border-white/20"
                  }}
                >
                  <SelectItem key="all" value="all" className="text-dashboard-primary">All Departments</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept._id} value={dept._id} className="text-dashboard-primary">
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
                classNames={{
                  trigger: "bg-dashboard-tertiary border border-white/20 text-dashboard-primary",
                  popoverContent: "bg-dashboard-secondary border border-white/20"
                }}
              >
                <SelectItem key="month" value="month" className="text-dashboard-primary">Month</SelectItem>
                <SelectItem key="week" value="week" className="text-dashboard-primary">Week</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Calendar Grid */}
      <Card className="bg-dashboard-secondary border border-white/20">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b border-white/20">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-4 text-center font-semibold bg-dashboard-tertiary text-dashboard-primary">
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
                    className={`border-r border-b border-white/10 p-2 min-h-[120px] bg-dashboard-secondary ${
                      isCurrentDay ? 'bg-blue-500/20 border-blue-400/50' : ''
                    } ${isWeekendDay ? 'bg-dashboard-tertiary/50' : ''}`}
                  >
                    {/* Day Number */}
                    <div className={`text-sm font-medium mb-2 ${
                      isCurrentDay ? 'text-blue-400 font-bold' : 
                      isWeekendDay ? 'text-dashboard-muted' : 'text-dashboard-primary'
                    }`}>
                      {day}
                    </div>

                    {/* Leave Items */}
                    <div className="space-y-1">
                      {dayLeaves.slice(0, 3).map((leave: any) => (
                        <div
                          key={leave._id}
                          className={`text-xs p-1 rounded truncate cursor-pointer ${getLeaveTypeColor(leave.leaveType)}`}
                          title={`${leave.employee?.firstName} ${leave.employee?.lastName} - ${leave.leaveType} (${leave.status})`}
                        >
                          <div className="flex items-center gap-1">
                            {leave.status === 'pending' && (
                              <Clock size={10} />
                            )}
                            <span className="truncate">
                              {leave.employee?.firstName} {leave.employee?.lastName?.charAt(0)}.
                            </span>
                          </div>
                          <div className="truncate capitalize">
                            {leave.leaveType}
                          </div>
                        </div>
                      ))}
                      
                      {dayLeaves.length > 3 && (
                        <div className="text-xs text-dashboard-muted p-1">
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
      <Card className="bg-dashboard-secondary border border-white/20">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2 text-dashboard-primary">
            <Info size={18} className="text-dashboard-primary" />
            Legend
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span className="text-sm text-dashboard-primary">Annual Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span className="text-sm text-dashboard-primary">Sick Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span className="text-sm text-dashboard-primary">Emergency Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span className="text-sm text-dashboard-primary">Maternity/Paternity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded"></div>
              <span className="text-sm text-dashboard-primary">Study Leave</span>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-dashboard-secondary">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-dashboard-secondary" />
              <span>Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400/30 border-2 border-blue-400 rounded"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-dashboard-muted rounded"></div>
              <span>Weekend</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Policy Violations Alert */}
      {(isAdmin || isDepartmentHead) && policyViolations.length > 0 && (
        <Card className="border-orange-400/50 bg-dashboard-secondary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-400" />
                Policy Violations ({policyViolations.length})
              </h3>
              <Button
                size="sm"
                variant="light"
                color="warning"
                onPress={() => setShowPolicyViolations(!showPolicyViolations)}
                className="text-orange-400 hover:text-orange-300"
              >
                {showPolicyViolations ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </CardHeader>
          {showPolicyViolations && (
            <CardBody className="pt-0">
              <div className="space-y-3">
                {policyViolations.map((violation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-orange-400/30 rounded-lg bg-dashboard-tertiary">
                    <div>
                      <p className="font-medium text-orange-300">{violation.employeeName}</p>
                      <p className="text-sm text-orange-400">{violation.leaveType} - {violation.violation}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-orange-300">
                        Required: {violation.required} | Actual: {violation.actual}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          )}
        </Card>
      )}

      {/* Team Balance Overview */}
      {(isAdmin || isDepartmentHead) && teamBalances.length > 0 && (
        <Card className="bg-dashboard-secondary border border-white/20">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2 text-dashboard-primary">
              <Users size={18} className="text-dashboard-primary" />
              Team Leave Balance Overview
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {teamBalances.slice(0, 10).map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-white/20 rounded-lg bg-dashboard-tertiary">
                  <div>
                    <p className="font-medium text-dashboard-primary">{member.employee.name}</p>
                    <p className="text-sm text-dashboard-secondary">{member.employee.department}</p>
                  </div>
                  <div className="flex gap-2">
                    {member.balances.slice(0, 3).map((balance: any, idx: number) => (
                      <div key={idx} className="text-center">
                        <p className="text-xs text-dashboard-muted capitalize">{balance.leaveType}</p>
                        <p className="text-sm font-medium text-dashboard-primary">{balance.remaining}/{balance.totalAllocated}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {teamBalances.length > 10 && (
              <p className="text-sm text-dashboard-muted text-center mt-3">
                +{teamBalances.length - 10} more team members
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {/* Upcoming Leaves List */}
      <Card className="bg-dashboard-secondary border border-white/20">
        <CardHeader>
          <h3 className="text-lg font-semibold text-dashboard-primary">Upcoming Leaves This Month</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {leaves
              .filter((leave: any) => {
                const startDate = new Date(leave.startDate);
                return startDate >= new Date();
              })
              .slice(0, 10)
              .map((leave: any) => (
                <div key={leave._id} className="flex items-center justify-between p-3 border border-white/20 rounded-lg bg-dashboard-tertiary hover:bg-dashboard-tertiary/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getLeaveTypeColor(leave.leaveType).split(' ')[0]}`}></div>
                    <div>
                      <p className="font-medium text-dashboard-primary">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </p>
                      <p className="text-sm text-dashboard-secondary">
                        {leave.employee?.department?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-dashboard-primary">
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
                      <span className="text-xs text-dashboard-muted capitalize">
                        {leave.leaveType}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {leaves.length === 0 && (
            <p className="text-center text-dashboard-muted py-8">
              No upcoming leaves scheduled for this month
            </p>
          )}
        </CardBody>
      </Card>
    </div>
   </AdminLayout>
  );
}