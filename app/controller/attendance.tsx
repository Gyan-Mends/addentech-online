import { json } from "@remix-run/node";
import Attendance from "~/modal/attendance";
import Registration from "~/modal/registration";
import { scheduleJob } from "node-schedule";

class AttendanceController {
  constructor() {
    // Initialize the auto-checkout job when the controller is created
    this.initializeAutoCheckoutJob();
  }

  // Initialize the scheduled job for auto-checkout
  private initializeAutoCheckoutJob() {
    try {
      // Schedule auto-checkout job to run every day at 6pm (18:00)
      scheduleJob('auto-checkout-6pm', '0 18 * * *', async () => {
        console.log('Running automatic checkout at 6pm');
        await this.performAutoCheckout();
      });
      
      console.log('Auto-checkout job scheduled for 6:00 PM daily');
      console.log('Note: If auto-checkout is not working, you can manually trigger it from the admin panel');
    } catch (error) {
      console.error('Error scheduling auto-checkout job:', error);
      console.log('Auto-checkout scheduling failed. Manual trigger is still available in admin panel.');
    }
  }

  // Manual method to perform auto-checkout (can be called manually for testing)
  async performAutoCheckout() {
    try {
      console.log('Starting automatic checkout process...');
      const now = new Date();
      console.log('Current time:', now.toISOString());
      
      // Create date range for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      // Also create a range for the last 7 days to catch any missed checkouts
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      console.log('Date ranges:', {
        today: { start: today.toISOString(), end: tomorrow.toISOString() },
        lastWeek: { start: weekAgo.toISOString(), end: tomorrow.toISOString() }
      });
      
      // First, let's see all attendance records without checkout
      const allRecordsWithoutCheckout = await Attendance.find({
        checkOutTime: { $exists: false }
      }).populate('user', 'firstName lastName email');
      
      console.log(`Total records without checkout: ${allRecordsWithoutCheckout.length}`);
      allRecordsWithoutCheckout.forEach(record => {
        console.log(`Record: ${(record.user as any)?.firstName} ${(record.user as any)?.lastName}, Date: ${record.date}, CheckIn: ${record.checkInTime}`);
      });
      
      // Find all attendance records from today that don't have checkout times
      const todayRecords = await Attendance.find({
        date: {
          $gte: today,
          $lt: tomorrow,
        },
        checkOutTime: { $exists: false }
      }).populate('user', 'firstName lastName email');
      
      console.log(`Found ${todayRecords.length} attendance records from today without checkout`);
      
      // Find records from the last week that don't have checkout times
      const recentRecords = await Attendance.find({
        date: {
          $gte: weekAgo,
          $lt: tomorrow,
        },
        checkOutTime: { $exists: false }
      }).populate('user', 'firstName lastName email');
      
      console.log(`Found ${recentRecords.length} attendance records from last week without checkout`);
      
      // Process records (prioritize today's records, then recent ones)
      let recordsToProcess = [];
      
      if (todayRecords.length > 0) {
        console.log('Processing today\'s records first...');
        recordsToProcess = todayRecords;
      } else if (recentRecords.length > 0) {
        console.log('No today\'s records found, processing recent records...');
        recordsToProcess = recentRecords;
      } else {
        // If no records found with date range, try alternative approach
        console.log('No records found with date ranges, trying alternative approach...');
        
        // Try finding records where the date field is recent (regardless of time)
        const todayString = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        const alternativeRecords = await Attendance.find({
          checkOutTime: { $exists: false }
        }).populate('user', 'firstName lastName email');
        
        // Filter records manually by checking if the date is recent
        const recentAlternativeRecords = alternativeRecords.filter(record => {
          const recordDate = new Date(record.date);
          const recordDateString = recordDate.toISOString().split('T')[0];
          const daysDiff = (today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff >= 0 && daysDiff <= 7; // Within last 7 days
        });
        
        console.log(`Found ${recentAlternativeRecords.length} records using alternative date matching`);
        recordsToProcess = recentAlternativeRecords;
      }
      
      if (recordsToProcess.length > 0) {
        return await this.processCheckoutRecords(recordsToProcess);
      }
      
      console.log('No records to auto-checkout');
      return {
        success: true,
        message: 'No records to auto-checkout',
        count: 0
      };
    } catch (error: any) {
      console.error('Error in auto-checkout process:', error);
      return {
        success: false,
        message: `Error in auto-checkout: ${error.message}`,
        count: 0
      };
    }
  }

  // Helper method to process checkout records
  private async processCheckoutRecords(records: any[]) {
    console.log(`Processing ${records.length} records for checkout`);
    
    // Auto checkout each record at 6:00 PM
    const checkOutTime = new Date();
    checkOutTime.setHours(18, 0, 0, 0); // Set to exactly 6:00 PM
    
    let successCount = 0;
    
    for (const record of records) {
      try {
        console.log(`Processing record for user: ${(record.user as any)?.firstName} ${(record.user as any)?.lastName}`);
        console.log(`Record details: ID=${record._id}, CheckIn=${record.checkInTime}, Date=${record.date}`);
        
        const checkInTime = new Date(record.checkInTime);
        const workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        
        // Ensure work hours is not negative
        const validWorkHours = Math.max(0, workHours);
        
        record.checkOutTime = checkOutTime;
        record.workHours = parseFloat(validWorkHours.toFixed(2));
        
        const savedRecord = await record.save();
        console.log(`Successfully saved checkout for record ${record._id}`);
        
        successCount++;
        console.log(`Auto-checked out user: ${(record.user as any)?.firstName} ${(record.user as any)?.lastName} - Work hours: ${validWorkHours.toFixed(2)}`);
      } catch (error: any) {
        console.error(`Error auto-checking out record ${record._id}:`, error);
      }
    }
    
    console.log(`Auto-checked out ${successCount} out of ${records.length} users`);
    
    return {
      success: true,
      message: `Auto-checked out ${successCount} users`,
      count: successCount,
      total: records.length
    };
  }

  // Helper method to calculate distance between two coordinates using Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  // Helper to check if time is within check-in hours (7am to 5pm)
  private isWithinCheckInHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 7 && hour < 17; // 7am to 5pm
  }
  
  // Helper to check if today is a weekend
  private isWeekend(): boolean {
    const now = new Date();
    const day = now.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  }
  async checkIn({
    userId,
    departmentId,
    notes,
    workMode,
    latitude,
    longitude,
    locationName,
  }: {
    userId: string;
    departmentId: string;
    notes?: string;
    workMode: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
  }) {
    try {
      console.log('Check-in attempt:', { userId, departmentId, workMode, hasLocation: !!(latitude && longitude) });
      
      // Check if today is a weekend (Saturday or Sunday)
      if (this.isWeekend()) {
        console.log('Check-in failed: Attendance not allowed on weekends');
        return json({
          message: "Attendance cannot be taken on Saturday or Sunday.",
          success: false,
          status: 400,
        });
      }
      
      // Check if current time is within check-in hours (7am to 5pm)
      if (!this.isWithinCheckInHours()) {
        console.log('Check-in failed: Outside check-in hours');
        return json({
          message: "Check-in is only allowed between 7:00 AM and 5:00 PM.",
          success: false,
          status: 400,
        });
      }
      
      // Check if user exists
      const user = await Registration.findById(userId);
      if (!user) {
        console.log('Check-in failed: User not found');
        return json({
          message: "User not found",
          success: false,
          status: 404,
        });
      }

      // Check if user already checked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingAttendance = await Attendance.findOne({
        user: userId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      if (existingAttendance) {
        console.log('Check-in failed: User already checked in today');
        return json({
          message: "User already checked in today",
          success: false,
          status: 409,
        });
      }

      // Validate location for in-house attendance
      if (workMode === "in-house") {
        // Location is mandatory for in-house workers
        if (!latitude || !longitude) {
          console.log('Check-in failed: Location required for in-house attendance');
          return json({
            message: "Location access is required for in-house attendance. Please enable location services and allow location access.",
            success: false,
            status: 400,
          });
        }

        // Office location coordinates (as specified in requirements)
        const officeLatitude = 5.660881;
        const officeLongitude = -0.156627;
        
        // Calculate distance between user and office (using Haversine formula)
        const distance = this.calculateDistance(
          latitude,
          longitude,
          officeLatitude,
          officeLongitude
        );
        
        console.log('Location check:', { 
          userCoords: {latitude, longitude}, 
          officeCoords: {officeLatitude, officeLongitude}, 
          distance: `${distance.toFixed(3)} km` 
        });
        
        // If user is not within 100 meters of the office
        if (distance > 0.1) { // 0.1 km = 100 meters
          return json({
            message: `You are not at the office location (${(distance * 1000).toFixed(0)}m away). In-house attendance requires your physical presence within 100m of the office.`,
            success: false,
            status: 400,
          });
        }
      }
      
      // Create new attendance record
      const attendanceData: {
        user: string;
        department: string;
        checkInTime: Date;
        date: Date;
        notes: string;
        workMode: string;
        status: string;
        location?: {
          latitude: number;
          longitude: number;
          locationName?: string;
        };
      } = {
        user: userId,
        department: departmentId,
        checkInTime: new Date(),
        date: new Date(),
        notes: notes || '',
        workMode: workMode || 'in-house',
        status: 'present'
      };
      
      // Add location data if provided (mandatory for in-house, optional for remote)
      if (latitude && longitude) {
        attendanceData.location = { 
          latitude, 
          longitude,
          locationName: locationName || (workMode === 'in-house' ? 'Office Location' : 'Remote Location')
        };
      }
      
      console.log('Creating attendance record with data:', {
        ...attendanceData,
        location: attendanceData.location ? 'Location included' : 'No location'
      });
      const attendance = new Attendance(attendanceData);

      const savedAttendance = await attendance.save();
      console.log('Attendance saved:', savedAttendance ? 'success' : 'failed');

      if (savedAttendance) {
        return json({
          message: workMode === 'in-house' 
            ? "Check-in successful - Location verified" 
            : "Check-in successful",
          success: true,
          status: 201,
          data: savedAttendance,
        });
      } else {
        return json({
          message: "Failed to record check-in",
          success: false,
          status: 500,
        });
      }
    } catch (error: any) {
      console.error('Check-in error:', error);
      return json({
        message: `Check-in error: ${error.message}`,
        success: false,
        status: 500,
        error: error.toString()
      });
    }
  }

  async checkOut({ attendanceId }: { attendanceId: string }) {
    try {
      const attendance = await Attendance.findById(attendanceId);
      
      if (!attendance) {
        return json({
          message: "Attendance record not found",
          success: false,
          status: 404,
        });
      }

      if (attendance.checkOutTime) {
        return json({
          message: "User already checked out",
          success: false,
          status: 409,
        });
      }

      const checkOutTime = new Date();
      const checkInTime = new Date(attendance.checkInTime);
      
      // Calculate work hours (difference in milliseconds, converted to hours)
      const workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      attendance.checkOutTime = checkOutTime;
      attendance.workHours = parseFloat(workHours.toFixed(2));
      
      const updatedAttendance = await attendance.save();

      if (updatedAttendance) {
        return json({
          message: "Check-out successful",
          success: true,
          status: 200,
          data: updatedAttendance,
        });
      } else {
        return json({
          message: "Failed to record check-out",
          success: false,
          status: 500,
        });
      }
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  async getAttendanceByUser({ userId }: { userId: string }) {
    try {
      const attendance = await Attendance.find({ user: userId })
        .populate("user", "firstName lastName email")
        .populate("department", "name")
        .sort({ date: -1 });

      return json({
        message: "User attendance records retrieved successfully",
        success: true,
        status: 200,
        data: attendance,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  async getAttendanceByDepartment({ departmentId }: { departmentId: string }) {
    try {
      console.log('Getting attendance for department:', departmentId);
      const attendance = await Attendance.find({ department: departmentId })
        .populate("user")
        .populate("department")
        .sort({ date: -1 }); // Most recent first

      console.log(`Found ${attendance.length} records for department ${departmentId}`);
      
      return {
        success: true,
        message: attendance.length > 0 ? "Department attendance records found" : "No attendance records found for this department",
        data: attendance,
        count: attendance.length
      };
    } catch (error: any) {
      console.error('Error getting department attendance:', error);
      return {
        success: false,
        message: error.message,
        data: [],
        count: 0
      };
    }
  }

  async getUserAttendance({ 
    userId, 
    startDate, 
    endDate 
  }: { 
    userId: string; 
    startDate?: string; 
    endDate?: string; 
  }) {
    try {
      console.log('Getting user attendance for:', userId);
      // Build the query
      let query: any = { user: userId };
      
      // Add date range if provided
      if (startDate && endDate) {
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        
        query.date = {
          $gte: startDateObj,
          $lte: endDateObj
        };
      }
      
      // Find attendance records
      const attendanceRecords = await Attendance.find(query)
        .populate('user', 'firstName lastName')
        .populate('department', 'name')
        .sort({ date: -1 });
      
      console.log(`Found ${attendanceRecords.length} attendance records for user ${userId}`);
      
      // Return the data directly, not wrapped in json()
      return {
        success: true,
        message: attendanceRecords.length > 0 
          ? "Attendance records retrieved successfully" 
          : "No attendance records found",
        data: attendanceRecords,
        count: attendanceRecords.length
      };
    } catch (error: any) {
      console.error('Error getting user attendance:', error);
      return {
        success: false,
        message: error.message,
        status: 500,
        data: []
      };
    }
  }
  
  async getAttendanceReport({ 
    startDate, 
    endDate, 
    departmentId 
  }: { 
    startDate: string; 
    endDate: string; 
    departmentId?: string 
  }) {
    try {
      console.log('Generating attendance report:', { startDate, endDate, departmentId });
      
      // Build query
      let query: any = {};
      
      // Add date range
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: start,
        $lte: end
      };
      
      // Add department filter if provided
      if (departmentId) {
        query.department = departmentId;
      }
      
      const attendance = await Attendance.find(query)
        .populate("user")
        .populate("department")
        .sort({ date: -1 }); // Most recent first
      
      console.log(`Found ${attendance.length} records for the report`);

      return {
        success: true,
        message: attendance.length > 0 ? "Attendance report generated" : "No attendance records found for this period",
        data: attendance,
        count: attendance.length
      };
    } catch (error: any) {
      console.error('Error generating attendance report:', error);
      return {
        success: false,
        message: error.message,
        data: [],
        count: 0
      };
    }
  }
  
  // Method to delete an attendance record (admin/manager only)
  async deleteAttendance({ attendanceId, userRole }: { attendanceId: string; userRole: string }) {
    try {
      console.log(`Attempting to delete attendance record: ${attendanceId} by role: ${userRole}`);
      
      // Check if user has permission to delete
      if (!['admin', 'manager'].includes(userRole)) {
        return {
          message: "You don't have permission to delete attendance records",
          success: false,
          status: 403
        };
      }
      
      // Find and delete the attendance record
      const attendance = await Attendance.findById(attendanceId);
      
      if (!attendance) {
        return {
          message: "Attendance record not found",
          success: false,
          status: 404
        };
      }
      
      await Attendance.deleteOne({ _id: attendanceId });
      
      return {
        message: "Attendance record deleted successfully",
        success: true,
        status: 200
      };
    } catch (error: any) {
      console.error('Error deleting attendance record:', error);
      return {
        message: `Error deleting attendance record: ${error.message}`,
        success: false,
        status: 500
      };
    }
  }
}

const attendanceController = new AttendanceController();
export default attendanceController;
