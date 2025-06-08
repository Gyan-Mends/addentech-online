import User from "~/modal/registration";
import Category from "~/modal/category";
import Blog from "~/modal/blog";
import Departments from "~/modal/department";
import Contact from "~/modal/contact";
import Task from "~/modal/task";
import Attendance from "~/modal/attendance";
import mongoose from "~/mongoose.server";

class DashboardController {
    // Base dashboard data for all roles
    async getDashboardData(): Promise<any> {
        try {
            const totalUsers = await User.countDocuments()
            const totalCategories = await Category.countDocuments()
            const totalBlogs = await Blog.countDocuments()
            const totalMessages = await Contact.countDocuments()
            const totalDepartments = await Departments.countDocuments()
            return { totalUsers, totalCategories, totalBlogs, totalMessages, totalDepartments }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            return { error: "Failed to fetch dashboard data" }
        }
    }

    // Role-specific dashboard data with visualizations
    async getRoleDashboardData(userId: string, role: string, departmentId?: string): Promise<any> {
        try {
            // Base data for all roles
            const baseData = await this.getDashboardData();
            
            // Get current month data range
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            // Get current week data range
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            const endOfWeek = new Date(now);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            let dashboardData: any = { ...baseData };
            
            // Admin dashboard data
            if (role === "admin") {
                // Active users by role
                const usersByRole = await User.aggregate([
                    { $match: { status: "active" } },
                    { $group: { _id: "$role", count: { $sum: 1 } } }
                ]);
                
                // Tasks data
                const tasksByStatus = await Task.aggregate([
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ]);
                
                // Attendance data
                const attendanceByMonth = await Attendance.aggregate([
                    { 
                        $match: { 
                            checkInTime: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
                        }
                    },
                    {
                        $group: {
                            _id: { month: { $month: "$checkInTime" }, year: { $year: "$checkInTime" } },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } }
                ]);
                
                // Department performance
                const departmentPerformance = await Task.aggregate([
                    { $lookup: { from: "registrations", localField: "assignedTo", foreignField: "_id", as: "assignedUser" } },
                    { $unwind: "$assignedUser" },
                    { $lookup: { from: "departments", localField: "assignedUser.department", foreignField: "_id", as: "department" } },
                    { $unwind: "$department" },
                    { 
                        $group: { 
                            _id: { department: "$department.name", status: "$status" },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.department": 1 } }
                ]);
                
                dashboardData.usersByRole = this.processChartData(usersByRole, "role");
                dashboardData.tasksByStatus = this.processChartData(tasksByStatus, "status");
                dashboardData.attendanceByMonth = this.formatMonthlyData(attendanceByMonth);
                dashboardData.departmentPerformance = this.processDepartmentData(departmentPerformance);
            } 
            
            // Manager dashboard data
            else if (role === "manager") {
                // Tasks data
                const tasksByStatus = await Task.aggregate([
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ]);
                
                // Team performance
                const teamPerformance = await Task.aggregate([
                    { $lookup: { from: "registrations", localField: "assignedTo", foreignField: "_id", as: "assignedUser" } },
                    { $unwind: "$assignedUser" },
                    { 
                        $group: { 
                            _id: { user: { $concat: ["$assignedUser.firstName", " ", "$assignedUser.lastName"] }, status: "$status" },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.user": 1 } }
                ]);
                
                // Recent Activities
                const recentTasks = await Task.find({}).sort({ createdAt: -1 }).limit(5)
                    .populate("assignedTo", "firstName lastName")
                    .populate("createdBy", "firstName lastName");

                // Get work mode distribution - important for managing hybrid teams
                const workModeDistribution = await User.aggregate([
                    { $match: { status: "active" } },
                    { $group: { _id: "$workMode", count: { $sum: 1 } } }
                ]);
                    
                dashboardData.tasksByStatus = this.processChartData(tasksByStatus, "status");
                dashboardData.teamPerformance = this.processTeamData(teamPerformance);
                dashboardData.recentTasks = recentTasks;
                dashboardData.workModeDistribution = this.processChartData(workModeDistribution, "workMode");
            } 
            
            // Department Head dashboard data
            else if (role === "department_head" && departmentId) {
                // Department staff
                const departmentStaff = await User.countDocuments({ department: departmentId });
                
                // Department tasks
                const departmentTasks = await Task.aggregate([
                    { $lookup: { from: "registrations", localField: "assignedTo", foreignField: "_id", as: "assignedUser" } },
                    { $unwind: "$assignedUser" },
                    { $match: { "assignedUser.department": new mongoose.Types.ObjectId(departmentId) } },
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ]);
                
                // Staff performance
                const staffPerformance = await Task.aggregate([
                    { $lookup: { from: "registrations", localField: "assignedTo", foreignField: "_id", as: "assignedUser" } },
                    { $unwind: "$assignedUser" },
                    { $match: { "assignedUser.department": new mongoose.Types.ObjectId(departmentId) } },
                    { 
                        $group: { 
                            _id: { user: { $concat: ["$assignedUser.firstName", " ", "$assignedUser.lastName"] }, status: "$status" },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.user": 1 } }
                ]);
                
                // Department attendance
                const departmentAttendance = await Attendance.aggregate([
                    { $lookup: { from: "registrations", localField: "user", foreignField: "_id", as: "userInfo" } },
                    { $unwind: "$userInfo" },
                    { $match: { "userInfo.department": new mongoose.Types.ObjectId(departmentId) } },
                    { $match: { checkInTime: { $gte: startOfMonth, $lte: endOfMonth } } },
                    { 
                        $group: { 
                            _id: { day: { $dayOfMonth: "$checkInTime" } },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.day": 1 } }
                ]);

                // Work mode distribution within the department
                const workModeBreakdown = await User.aggregate([
                    { $match: { department: new mongoose.Types.ObjectId(departmentId) } },
                    { $group: { _id: "$workMode", count: { $sum: 1 } } }
                ]);
                
                // Attendance efficiency by work mode (analyze check-in patterns)
                const workModeAttendance = await Attendance.aggregate([
                    { $lookup: { from: "registrations", localField: "user", foreignField: "_id", as: "userInfo" } },
                    { $unwind: "$userInfo" },
                    { $match: { "userInfo.department": new mongoose.Types.ObjectId(departmentId) } },
                    { $match: { checkInTime: { $gte: startOfMonth, $lte: endOfMonth } } },
                    { 
                        $group: { 
                            _id: "$userInfo.workMode",
                            totalHours: { 
                                $sum: { 
                                    $divide: [{ $subtract: ["$checkOutTime", "$checkInTime"] }, 3600000] 
                                } 
                            },
                            count: { $sum: 1 }
                        }
                    }
                ]);
                
                dashboardData.departmentStaff = departmentStaff;
                dashboardData.departmentTasks = this.processChartData(departmentTasks, "status");
                dashboardData.staffPerformance = this.processTeamData(staffPerformance);
                dashboardData.departmentAttendance = this.formatDailyData(departmentAttendance, startOfMonth.getMonth());
                dashboardData.workModeBreakdown = this.processChartData(workModeBreakdown, "workMode");
                dashboardData.workModeAttendance = this.processWorkModeData(workModeAttendance);
            } 
            
            // Staff dashboard data
            else if (role === "staff") {
                // Personal tasks (assignedTo is an array)
                const userTasks = await Task.aggregate([
                    { $match: { assignedTo: { $in: [new mongoose.Types.ObjectId(userId)] } } },
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ]);
                
                // Personal attendance
                const userAttendance = await Attendance.aggregate([
                    { $match: { user: new mongoose.Types.ObjectId(userId) } },
                    { $match: { checkInTime: { $gte: startOfMonth, $lte: endOfMonth } } },
                    { 
                        $group: { 
                            _id: { day: { $dayOfMonth: "$checkInTime" } },
                            hoursWorked: { 
                                $sum: { 
                                    $divide: [{ $subtract: ["$checkOutTime", "$checkInTime"] }, 3600000] 
                                } 
                            }
                        }
                    },
                    { $sort: { "_id.day": 1 } }
                ]);
                
                // Upcoming tasks (assignedTo is an array)
                const upcomingTasks = await Task.find({
                    assignedTo: { $in: [userId] },
                    status: "pending",
                    dueDate: { $gte: new Date() }
                }).sort({ dueDate: 1 }).limit(5);
                
                // Recent activities (assignedTo is an array)
                const recentActivities = await Task.find({
                    assignedTo: { $in: [userId] },
                    updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }).sort({ updatedAt: -1 }).limit(5);
                
                dashboardData.userTasks = this.processChartData(userTasks, "status");
                dashboardData.userAttendance = this.formatDailyData(userAttendance, startOfMonth.getMonth(), true);
                dashboardData.upcomingTasks = upcomingTasks;
                dashboardData.recentActivities = recentActivities;
            }
            
            return dashboardData;
        } catch (error) {
            console.error("Error fetching role dashboard data:", error);
            return { error: "Failed to fetch dashboard data for role" };
        }
    }
    
    // Helper method to process chart data
    private processChartData(data: any[], labelField: string) {
        return {
            labels: data.map(item => item._id || "Unknown"),
            values: data.map(item => item.count || 0)
        };
    }
    
    // Helper method to process department performance data
    private processDepartmentData(data: any[]) {
        const departments: { [key: string]: any } = {};
        
        data.forEach(item => {
            const deptName = item._id.department || "Unknown";
            const status = item._id.status || "Unknown";
            const count = item.count || 0;
            
            if (!departments[deptName]) {
                departments[deptName] = { completed: 0, pending: 0, inProgress: 0 };
            }
            
            departments[deptName][status.toLowerCase()] = count;
        });
        
        return Object.keys(departments).map(dept => ({
            name: dept,
            ...departments[dept]
        }));
    }
    
    // Helper method to process team performance data
    private processTeamData(data: any[]) {
        const staff: { [key: string]: any } = {};
        
        data.forEach(item => {
            const userName = item._id.user || "Unknown";
            const status = item._id.status || "Unknown";
            const count = item.count || 0;
            
            if (!staff[userName]) {
                staff[userName] = { completed: 0, pending: 0, inProgress: 0 };
            }
            
            staff[userName][status.toLowerCase()] = count;
        });
        
        return Object.keys(staff).map(user => ({
            name: user,
            ...staff[user]
        }));
    }
    
    // Helper method to format monthly data
    private formatMonthlyData(data: any[]) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        return {
            labels: data.map(item => `${months[item._id.month - 1]} ${item._id.year}`),
            values: data.map(item => item.count || 0)
        };
    }
    
    // Helper method to format daily data
    private formatDailyData(data: any[], month: number, includeHours = false) {
        const daysInMonth = new Date(new Date().getFullYear(), month + 1, 0).getDate();
        const result: any = { labels: [], values: [] };
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dayData = data.find(item => item._id.day === i);
            result.labels.push(`Day ${i}`);
            
            if (includeHours) {
                result.values.push(dayData ? parseFloat(dayData.hoursWorked.toFixed(1)) : 0);
            } else {
                result.values.push(dayData ? dayData.count : 0);
            }
        }
        
        return result;
    }

    // Helper method to process work mode data with average hours
    private processWorkModeData(data: any[]) {
        // Format the work mode attendance data for visualization
        return {
            labels: data.map(item => item._id || 'Unknown'),
            values: data.map(item => item.count || 0),
            avgHours: data.map(item => parseFloat((item.totalHours / (item.count || 1)).toFixed(1)) || 0)
        };
    }
}

const dashboard = new DashboardController
export default dashboard