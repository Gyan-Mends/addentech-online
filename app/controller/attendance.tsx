import { json } from "@remix-run/node";
import Attendance from "~/modal/attendance";
import Registration from "~/modal/registration";

class AttendanceController {
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
  async checkIn({
    userId,
    departmentId,
    notes,
    workMode,
    latitude,
    longitude,
  }: {
    userId: string;
    departmentId: string;
    notes?: string;
    workMode: string;
    latitude?: number;
    longitude?: number;
  }) {
    try {
      console.log('Check-in attempt:', { userId, departmentId, workMode });
      
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
      if (workMode === "in-house" && (latitude && longitude)) {
        // Office location coordinates (example - replace with actual office coordinates)
        const officeLatitude = 5.6037; // Replace with actual office latitude
        const officeLongitude = -0.1870; // Replace with actual office longitude
        
        // Calculate distance between user and office (using Haversine formula)
        const distance = this.calculateDistance(
          latitude,
          longitude,
          officeLatitude,
          officeLongitude
        );
        
        console.log('Location check:', { userCoords: {latitude, longitude}, officeCoords: {officeLatitude, officeLongitude}, distance });
        
        // If user is not within 100 meters of the office
        if (distance > 0.1) { // 0.1 km = 100 meters
          return json({
            message: "You are not at the office location. In-house attendance requires your physical presence.",
            success: false,
            status: 400,
          });
        }
      }
      
      // Create new attendance record
      const attendanceData = {
        user: userId,
        department: departmentId,
        checkInTime: new Date(),
        date: new Date(),
        notes: notes || '',
        workMode: workMode || 'in-house',
        status: 'present'
      };
      
      if (latitude && longitude) {
        attendanceData['location'] = { latitude, longitude };
      }
      
      console.log('Creating attendance record with data:', attendanceData);
      const attendance = new Attendance(attendanceData);

      const savedAttendance = await attendance.save();
      console.log('Attendance saved:', savedAttendance ? 'success' : 'failed');

      if (savedAttendance) {
        return json({
          message: "Check-in successful",
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
