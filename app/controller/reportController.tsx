import mongoose from 'mongoose';
import TaskActivity from '~/modal/taskActivity';
import Registration from '~/modal/registration';
import Departments from '~/modal/department';
import Task from '~/modal/task';

export class ReportController {

    // Get date ranges for different report periods
    static getDateRanges(period: string, year: number = new Date().getFullYear()) {
        const ranges: any = {};
        
        switch (period) {
            case 'weekly':
                const now = new Date();
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                ranges.current = { start: startOfWeek, end: endOfWeek };
                break;
                
            case 'monthly':
                for (let month = 0; month < 12; month++) {
                    const start = new Date(year, month, 1);
                    const end = new Date(year, month + 1, 0);
                    ranges[`month_${month + 1}`] = { start, end };
                }
                break;
                
            case 'quarterly':
                const quarters = [
                    { name: 'Q1', months: [0, 1, 2] },
                    { name: 'Q2', months: [3, 4, 5] },
                    { name: 'Q3', months: [6, 7, 8] },
                    { name: 'Q4', months: [9, 10, 11] }
                ];
                
                quarters.forEach((quarter, index) => {
                    const start = new Date(year, quarter.months[0], 1);
                    const end = new Date(year, quarter.months[2] + 1, 0);
                    ranges[quarter.name] = { start, end };
                });
                break;
        }
        
        return ranges;
    }

    // Generate department activity report
    static async generateDepartmentReport(
        departmentId: string,
        period: 'weekly' | 'monthly' | 'quarterly',
        year: number = new Date().getFullYear()
    ) {
        try {
            const department = await Departments.findById(departmentId);
            if (!department) {
                return { success: false, message: "Department not found" };
            }

            const dateRanges = this.getDateRanges(period, year);
            const report: any = {
                department: department.name,
                period,
                year,
                summary: {},
                periodBreakdown: {}
            };

            // Get overall summary for the entire year
            const yearStart = new Date(year, 0, 1);
            const yearEnd = new Date(year, 11, 31);

            const overallStats = await TaskActivity.aggregate([
                {
                    $match: {
                        department: new mongoose.Types.ObjectId(departmentId),
                        timestamp: { $gte: yearStart, $lte: yearEnd }
                    }
                },
                {
                    $group: {
                        _id: '$activityType',
                        count: { $sum: 1 },
                        totalHours: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$activityType', 'time_logged'] },
                                    '$metadata.timeLogged',
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            report.summary = {
                totalActivities: overallStats.reduce((sum, stat) => sum + stat.count, 0),
                totalHours: overallStats.reduce((sum, stat) => sum + stat.totalHours, 0),
                activityBreakdown: overallStats
            };

            // Generate period-specific data
            for (const [periodName, dateRange] of Object.entries(dateRanges)) {
                const range = dateRange as { start: Date; end: Date };
                
                const periodStats = await TaskActivity.aggregate([
                    {
                        $match: {
                            department: new mongoose.Types.ObjectId(departmentId),
                            timestamp: { $gte: range.start, $lte: range.end }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                activityType: '$activityType',
                                userId: '$userId'
                            },
                            count: { $sum: 1 },
                            totalHours: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$_id.activityType', 'time_logged'] },
                                        '$metadata.timeLogged',
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id.activityType',
                            totalCount: { $sum: '$count' },
                            totalHours: { $sum: '$totalHours' },
                            userBreakdown: {
                                $push: {
                                    userId: '$_id.userId',
                                    count: '$count',
                                    hours: '$totalHours'
                                }
                            }
                        }
                    }
                ]);

                // Get user details for the breakdown
                const userIds = periodStats.flatMap(stat => 
                    stat.userBreakdown.map((user: any) => user.userId)
                );
                const uniqueUserIds = [...new Set(userIds)];
                const users = await Registration.find(
                    { _id: { $in: uniqueUserIds } },
                    'firstName lastName email role'
                );

                const userMap = users.reduce((map, user) => {
                    map[user._id.toString()] = user;
                    return map;
                }, {} as any);

                // Populate user details in the breakdown
                periodStats.forEach(stat => {
                    stat.userBreakdown = stat.userBreakdown.map((userStat: any) => ({
                        ...userStat,
                        user: userMap[userStat.userId.toString()]
                    }));
                });

                report.periodBreakdown[periodName] = {
                    dateRange: range,
                    totalActivities: periodStats.reduce((sum, stat) => sum + stat.totalCount, 0),
                    totalHours: periodStats.reduce((sum, stat) => sum + stat.totalHours, 0),
                    activityStats: periodStats
                };
            }

            return { success: true, report };
        } catch (error) {
            console.error('Error generating department report:', error);
            return { success: false, message: "Failed to generate department report" };
        }
    }

    // Generate individual staff report with role-based filtering
    static async generateStaffReport(
        userId: string,
        period: 'weekly' | 'monthly' | 'quarterly' = 'monthly',
        year: number = new Date().getFullYear(),
        requestingUserRole: string = 'admin',
        requestingUserId: string | null = null
    ) {
        try {
            const user = await Registration.findById(userId).populate('department');
            if (!user) {
                return { success: false, message: "User not found" };
            }

            const dateRanges = this.getDateRanges(period, year);
            const report: any = {
                user: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: user.role,
                    department: user.department?.name
                },
                period,
                year,
                summary: {},
                periodBreakdown: {},
                taskDetails: {}
            };

            // Get overall summary for the entire year
            const yearStart = new Date(year, 0, 1);
            const yearEnd = new Date(year, 11, 31);

            // Build match query with role-based filtering
            let activityMatchQuery: any = {
                userId: userId,
                timestamp: { $gte: yearStart, $lte: yearEnd }
            };

            // If staff is requesting, only show activities for tasks assigned to them
            if (requestingUserRole === 'staff' && requestingUserId) {
                const staffUser = await Registration.findById(requestingUserId);
                if (staffUser && staffUser._id.toString() !== userId) {
                    // Staff can only see their own reports
                    return { success: false, message: "Access denied: You can only view your own reports" };
                }
                
                // Get only tasks assigned to this staff member (assignedTo is an array)
                const assignedTasks = await Task.find({ 
                    assignedTo: { $in: [userId] }
                }).select('_id');
                const taskIds = assignedTasks.map(task => task._id);
                
                activityMatchQuery.taskId = { $in: taskIds };
            }

            const overallStats = await TaskActivity.aggregate([
                {
                    $match: activityMatchQuery
                },
                {
                    $group: {
                        _id: '$activityType',
                        count: { $sum: 1 },
                        totalHours: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$activityType', 'time_logged'] },
                                    '$metadata.timeLogged',
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            // Get task completion metrics and assigned tasks info
            const completedTasks = await TaskActivity.countDocuments({
                userId: userId,
                activityType: 'completed',
                timestamp: { $gte: yearStart, $lte: yearEnd }
            });

            // Get all tasks assigned to this user for the year (assignedTo is an array)
            let assignedTasksQuery: any = { assignedTo: { $in: [userId] } };
            if (requestingUserRole === 'staff' && requestingUserId) {
                // For staff, only show tasks they're assigned to
                assignedTasksQuery = { assignedTo: { $in: [requestingUserId] } };
            }

            const assignedTasks = await Task.find(assignedTasksQuery)
                .populate('createdBy', 'firstName lastName')
                .populate('department', 'name')
                .select('title status priority dueDate createdAt assignedTo')
                .lean();

            // Calculate task status breakdown
            const taskStatusBreakdown = assignedTasks.reduce((breakdown: any, task: any) => {
                breakdown[task.status] = (breakdown[task.status] || 0) + 1;
                return breakdown;
            }, {});

            report.summary = {
                totalActivities: overallStats.reduce((sum, stat) => sum + stat.count, 0),
                totalHours: overallStats.reduce((sum, stat) => sum + stat.totalHours, 0),
                completedTasks,
                totalAssignedTasks: assignedTasks.length,
                taskStatusBreakdown,
                activityBreakdown: overallStats,
                assignedTasksList: assignedTasks // Full task details
            };

            // Generate period-specific data
            for (const [periodName, dateRange] of Object.entries(dateRanges)) {
                const range = dateRange as { start: Date; end: Date };
                
                // Apply same filtering for period breakdown
                let periodMatchQuery: any = {
                    userId: userId,
                    timestamp: { $gte: range.start, $lte: range.end }
                };

                if (requestingUserRole === 'staff' && requestingUserId) {
                    // Get only tasks assigned to this staff member for this period (assignedTo is an array)
                    const assignedTasks = await Task.find({ 
                        assignedTo: { $in: [userId] } 
                    }).select('_id');
                    const taskIds = assignedTasks.map(task => task._id);
                    
                    periodMatchQuery.taskId = { $in: taskIds };
                }
                
                const periodStats = await TaskActivity.aggregate([
                    {
                        $match: periodMatchQuery
                    },
                    {
                        $group: {
                            _id: '$activityType',
                            count: { $sum: 1 },
                            totalHours: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$activityType', 'time_logged'] },
                                        '$metadata.timeLogged',
                                        0
                                    ]
                                }
                            },
                            activities: {
                                $push: {
                                    taskId: '$taskId',
                                    description: '$activityDescription',
                                    timestamp: '$timestamp',
                                    metadata: '$metadata'
                                }
                            }
                        }
                    }
                ]);

                // Get tasks for this specific period
                const periodTasks = assignedTasks.filter((task: any) => {
                    const taskDate = new Date(task.createdAt);
                    return taskDate >= range.start && taskDate <= range.end;
                });

                const periodTaskStatusBreakdown = periodTasks.reduce((breakdown: any, task: any) => {
                    breakdown[task.status] = (breakdown[task.status] || 0) + 1;
                    return breakdown;
                }, {});

                report.periodBreakdown[periodName] = {
                    dateRange: range,
                    totalActivities: periodStats.reduce((sum, stat) => sum + stat.count, 0),
                    totalHours: periodStats.reduce((sum, stat) => sum + stat.totalHours, 0),
                    activityStats: periodStats,
                    assignedTasks: periodTasks.length,
                    taskStatusBreakdown: periodTaskStatusBreakdown,
                    tasksList: periodTasks // List of tasks for this period
                };
            }

            return { success: true, report };
        } catch (error) {
            console.error('Error generating staff report:', error);
            return { success: false, message: "Failed to generate staff report" };
        }
    }

    // Generate productivity dashboard data
    static async getProductivityDashboard(
        filters: {
            department?: string;
            userId?: string;
            startDate?: Date;
            endDate?: Date;
        } = {}
    ) {
        try {
            const { department, userId, startDate, endDate } = filters;
            
            const defaultStartDate = startDate || new Date(new Date().getFullYear(), 0, 1);
            const defaultEndDate = endDate || new Date();

            const matchQuery: any = {
                timestamp: { $gte: defaultStartDate, $lte: defaultEndDate }
            };

            if (department) matchQuery.department = department;
            if (userId) matchQuery.userId = userId;

            const productivityData = await TaskActivity.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                            activityType: '$activityType'
                        },
                        count: { $sum: 1 },
                        totalHours: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$activityType', 'time_logged'] },
                                    '$metadata.timeLogged',
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id.date',
                        activities: {
                            $push: {
                                type: '$_id.activityType',
                                count: '$count',
                                hours: '$totalHours'
                            }
                        },
                        totalActivities: { $sum: '$count' },
                        totalHours: { $sum: '$totalHours' }
                    }
                },
                { $sort: { '_id': 1 } }
            ]);

            return { success: true, data: productivityData };
        } catch (error) {
            console.error('Error generating productivity dashboard:', error);
            return { success: false, message: "Failed to generate productivity dashboard" };
        }
    }
} 