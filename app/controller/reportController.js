import TaskActivity from '../modal/taskActivity.tsx';
import Registration from '../modal/registration.tsx';
import Departments from '../modal/department.tsx';
import Task from '../modal/task.tsx';

export class ReportController {

    // Get date ranges for different report periods
    static getDateRanges(period, year = new Date().getFullYear()) {
        const ranges = {};
        
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
        departmentId,
        period = 'monthly',
        year = new Date().getFullYear()
    ) {
        try {
            const department = await Departments.findById(departmentId);
            if (!department) {
                return { success: false, message: "Department not found" };
            }

            const dateRanges = this.getDateRanges(period, year);
            const report = {
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
                        department: departmentId,
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
                const periodStats = await TaskActivity.aggregate([
                    {
                        $match: {
                            department: departmentId,
                            timestamp: { $gte: dateRange.start, $lte: dateRange.end }
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
                            uniqueUsers: { $addToSet: '$_id.userId' }
                        }
                    }
                ]);

                report.periodBreakdown[periodName] = {
                    dateRange,
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
        userId,
        period = 'monthly',
        year = new Date().getFullYear(),
        requestingUserRole = 'admin',
        requestingUserId = null
    ) {
        try {
            const user = await Registration.findById(userId).populate('department');
            if (!user) {
                return { success: false, message: "User not found" };
            }

            const dateRanges = this.getDateRanges(period, year);
            const report = {
                user: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: user.role,
                    department: user.department?.name
                },
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
                        userId: userId,
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

            // Get task completion metrics
            const completedTasks = await TaskActivity.countDocuments({
                userId: userId,
                activityType: 'completed',
                timestamp: { $gte: yearStart, $lte: yearEnd }
            });

            report.summary = {
                totalActivities: overallStats.reduce((sum, stat) => sum + stat.count, 0),
                totalHours: overallStats.reduce((sum, stat) => sum + stat.totalHours, 0),
                completedTasks,
                activityBreakdown: overallStats
            };

            // Generate period-specific data
            for (const [periodName, dateRange] of Object.entries(dateRanges)) {
                const periodStats = await TaskActivity.aggregate([
                    {
                        $match: {
                            userId: userId,
                            timestamp: { $gte: dateRange.start, $lte: dateRange.end }
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

                report.periodBreakdown[periodName] = {
                    dateRange,
                    totalActivities: periodStats.reduce((sum, stat) => sum + stat.count, 0),
                    totalHours: periodStats.reduce((sum, stat) => sum + stat.totalHours, 0),
                    activityStats: periodStats
                };
            }

            return { success: true, report };
        } catch (error) {
            console.error('Error generating staff report:', error);
            return { success: false, message: "Failed to generate staff report" };
        }
    }

    // Generate productivity dashboard data
    static async getProductivityDashboard(filters = {}) {
        try {
            const { department, userId, startDate, endDate } = filters;
            
            const defaultStartDate = startDate || new Date(new Date().getFullYear(), 0, 1);
            const defaultEndDate = endDate || new Date();

            const matchQuery = {
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