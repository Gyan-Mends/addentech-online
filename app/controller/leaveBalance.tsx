import LeaveBalance from '../modal/leaveBalance';
import LeavePolicy from '../modal/leavePolicy';
import Registration from '../modal/registration';

export class LeaveBalanceController {
    
    // Initialize leave balances for a new employee
    static async initializeEmployeeBalances(employeeId: string, year: number = new Date().getFullYear()): Promise<void> {
        try {
            // Get all active leave policies
            const policies = await LeavePolicy.find({ isActive: true });
            
            for (const policy of policies) {
                // Check if balance already exists
                const existingBalance = await LeaveBalance.findOne({
                    employee: employeeId,
                    leaveType: policy.leaveType,
                    year
                });
                
                if (!existingBalance) {
                    const balance = new LeaveBalance({
                        employee: employeeId,
                        leaveType: policy.leaveType,
                        year,
                        totalAllocated: policy.defaultAllocation,
                        used: 0,
                        pending: 0,
                        carriedForward: 0,
                        remaining: policy.defaultAllocation,
                        transactions: [{
                            type: 'allocation',
                            amount: policy.defaultAllocation,
                            date: new Date(),
                            description: `Annual allocation for ${policy.leaveType}`
                        }]
                    });
                    
                    await balance.save();
                }
            }
        } catch (error) {
            console.error('Error initializing employee balances:', error);
            throw new Error('Failed to initialize employee leave balances');
        }
    }
    
    // Get employee leave balances
    static async getEmployeeBalances(employeeId: string, year: number = new Date().getFullYear()) {
        try {
            const balances = await LeaveBalance.find({
                employee: employeeId,
                year
            }).populate('employee', 'firstName lastName email');
            
            return balances;
        } catch (error) {
            console.error('Error fetching employee balances:', error);
            throw new Error('Failed to fetch employee leave balances');
        }
    }
    
    // Check if employee has sufficient balance for leave request
    static async checkBalance(employeeId: string, leaveType: string, days: number, year: number = new Date().getFullYear()) {
        try {
            let balance = await LeaveBalance.findOne({
                employee: employeeId,
                leaveType,
                year
            });
            
            // If no balance exists, initialize it
            if (!balance) {
                await this.initializeEmployeeBalances(employeeId, year);
                balance = await LeaveBalance.findOne({
                    employee: employeeId,
                    leaveType,
                    year
                });
            }
            
            if (!balance) {
                return {
                    hasBalance: false,
                    available: 0,
                    required: days,
                    message: 'Leave balance not found for this leave type'
                };
            }
            
            const available = balance.totalAllocated + balance.carriedForward - balance.used - balance.pending;
            const hasBalance = available >= days;
            
            return {
                hasBalance,
                available,
                required: days,
                message: hasBalance 
                    ? 'Sufficient balance available'
                    : `Insufficient balance. Available: ${available} days, Required: ${days} days`
            };
        } catch (error) {
            console.error('Error checking balance:', error);
            throw new Error('Failed to check leave balance');
        }
    }
    
    // Reserve balance for pending leave request
    static async reserveBalance(employeeId: string, leaveType: string, days: number, leaveId: string, year: number = new Date().getFullYear()): Promise<boolean> {
        try {
            const balance = await LeaveBalance.findOne({
                employee: employeeId,
                leaveType,
                year
            });
            
            if (!balance) {
                throw new Error('Leave balance not found');
            }
            
            balance.pending += days;
            balance.remaining = balance.totalAllocated + balance.carriedForward - balance.used - balance.pending;
            balance.lastUpdated = new Date();
            
            balance.transactions.push({
                type: 'used',
                amount: days,
                date: new Date(),
                description: `Reserved for pending leave request`,
                leaveId
            });
            
            await balance.save();
            return true;
        } catch (error) {
            console.error('Error reserving balance:', error);
            return false;
        }
    }
    
    // Confirm balance usage when leave is approved
    static async confirmBalanceUsage(employeeId: string, leaveType: string, days: number, leaveId: string, year: number = new Date().getFullYear()): Promise<boolean> {
        try {
            const balance = await LeaveBalance.findOne({
                employee: employeeId,
                leaveType,
                year
            });
            
            if (!balance) {
                throw new Error('Leave balance not found');
            }
            
            balance.pending -= days;
            balance.used += days;
            balance.remaining = balance.totalAllocated + balance.carriedForward - balance.used - balance.pending;
            balance.lastUpdated = new Date();
            
            balance.transactions.push({
                type: 'used',
                amount: days,
                date: new Date(),
                description: `Leave approved and balance used`,
                leaveId
            });
            
            await balance.save();
            return true;
        } catch (error) {
            console.error('Error confirming balance usage:', error);
            return false;
        }
    }
    
    // Release reserved balance when leave is rejected
    static async releaseReservedBalance(employeeId: string, leaveType: string, days: number, leaveId: string, year: number = new Date().getFullYear()): Promise<boolean> {
        try {
            const balance = await LeaveBalance.findOne({
                employee: employeeId,
                leaveType,
                year
            });
            
            if (!balance) {
                throw new Error('Leave balance not found');
            }
            
            balance.pending -= days;
            balance.remaining = balance.totalAllocated + balance.carriedForward - balance.used - balance.pending;
            balance.lastUpdated = new Date();
            
            balance.transactions.push({
                type: 'adjustment',
                amount: days,
                date: new Date(),
                description: `Balance released - leave request rejected`,
                leaveId
            });
            
            await balance.save();
            return true;
        } catch (error) {
            console.error('Error releasing reserved balance:', error);
            return false;
        }
    }
    
    // Get team balances for managers
    static async getTeamBalances(managerId: string, year: number = new Date().getFullYear()): Promise<any[]> {
        try {
            // Find team members managed by this manager
            const teamMembers = await Registration.find({ 
                managerId: managerId 
            });
            
            const teamMemberIds = teamMembers.map(member => member._id);
            
            const balances = await LeaveBalance.find({
                employee: { $in: teamMemberIds },
                year
            }).populate('employee', 'firstName lastName email position');
            
            return balances;
        } catch (error) {
            console.error('Error fetching team balances:', error);
            throw new Error('Failed to fetch team leave balances');
        }
    }
    
    // Get department balances for department heads
    static async getDepartmentBalances(departmentId: string, year: number = new Date().getFullYear()): Promise<any[]> {
        try {
            // Find all employees in the department
            const departmentMembers = await Registration.find({ 
                department: departmentId 
            });
            
            const memberIds = departmentMembers.map(member => member._id);
            
            const balances = await LeaveBalance.find({
                employee: { $in: memberIds },
                year
            }).populate('employee', 'firstName lastName email position');
            
            return balances;
        } catch (error) {
            console.error('Error fetching department balances:', error);
            throw new Error('Failed to fetch department leave balances');
        }
    }
    
    // Admin function to adjust balances
    static async adjustBalance(
        employeeId: string,
        leaveType: string,
        adjustment: number,
        reason: string,
        year: number = new Date().getFullYear()
    ): Promise<boolean> {
        try {
            let balance = await LeaveBalance.findOne({
                employee: employeeId,
                leaveType,
                year
            });
            
            if (!balance) {
                await this.initializeEmployeeBalances(employeeId, year);
                balance = await LeaveBalance.findOne({
                    employee: employeeId,
                    leaveType,
                    year
                });
            }
            
            if (!balance) {
                throw new Error('Unable to create or find balance record');
            }
            
            balance.totalAllocated += adjustment;
            balance.remaining = balance.totalAllocated + balance.carriedForward - balance.used - balance.pending;
            balance.lastUpdated = new Date();
            
            balance.transactions.push({
                type: 'adjustment',
                amount: adjustment,
                date: new Date(),
                description: reason
            });
            
            await balance.save();
            return true;
        } catch (error) {
            console.error('Error adjusting balance:', error);
            return false;
        }
    }
} 