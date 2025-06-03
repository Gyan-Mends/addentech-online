import WeeklyUpdate from "~/modal/weeklyUpdate";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import { json } from "@remix-run/node";

class WeeklyUpdateController {
  async createUpdate(formData: any) {
    try {
      console.log('Create weekly update with form data:', formData);
      const { 
        user, 
        department, 
        weekNumber, 
        year, 
        startDate, 
        endDate, 
        tasksCompleted, 
        challengesFaced, 
        nextWeekPlans, 
        additionalNotes 
      } = formData;
      
      // Check if update already exists for this user, week, and year
      const existingUpdate = await WeeklyUpdate.findOne({
        user,
        weekNumber,
        year,
      });

      if (existingUpdate) {
        return json({
          message: "Weekly update for this week already exists",
          success: false,
          status: 409,
        });
      }
      
      // Create new weekly update
      const newUpdate = new WeeklyUpdate({
        user,
        department,
        weekNumber,
        year,
        startDate,
        endDate,
        tasksCompleted,
        challengesFaced: challengesFaced || "",
        nextWeekPlans,
        additionalNotes: additionalNotes || "",
        status: "draft"
      });

      const savedUpdate = await newUpdate.save();

      if (savedUpdate) {
        return json({
          message: "Weekly update created successfully",
          success: true,
          status: 201,
          data: savedUpdate,
        });
      } else {
        return json({
          message: "Failed to create weekly update",
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

  async updateUpdate(formData: any) {
    try {
      console.log('Update weekly update with form data:', formData);
      const { updateId } = formData;
      
      if (!updateId) {
        return json({
          message: "Update ID is required",
          success: false,
          status: 400,
        });
      }
      
      // Find the existing update
      const update = await WeeklyUpdate.findById(updateId);
      if (!update) {
        return json({
          message: "Weekly update not found",
          success: false,
          status: 404,
        });
      }
      
      // Ensure user can only update their own draft updates
      if (update.status !== "draft") {
        return json({
          message: "Only draft updates can be edited",
          success: false,
          status: 403,
        });
      }
      
      // Prepare update object with fields that can be updated
      const updateData: Record<string, any> = {};
      
      // Update fields if provided
      if (formData.tasksCompleted) updateData.tasksCompleted = formData.tasksCompleted;
      if (formData.challengesFaced !== undefined) updateData.challengesFaced = formData.challengesFaced;
      if (formData.nextWeekPlans) updateData.nextWeekPlans = formData.nextWeekPlans;
      if (formData.additionalNotes !== undefined) updateData.additionalNotes = formData.additionalNotes;
      
      // Update the weekly update
      const updatedUpdate = await WeeklyUpdate.findByIdAndUpdate(
        updateId,
        updateData,
        { new: true }
      );

      if (updatedUpdate) {
        return json({
          message: "Weekly update updated successfully",
          success: true,
          status: 200,
          data: updatedUpdate,
        });
      } else {
        return json({
          message: "Failed to update weekly update",
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

  async submitUpdate(formData: any) {
    try {
      console.log('Submit weekly update with form data:', formData);
      const { updateId, userId } = formData;
      
      if (!updateId) {
        return json({
          message: "Update ID is required",
          success: false,
          status: 400,
        });
      }
      
      // Update with a single operation
      const updatedUpdate = await WeeklyUpdate.findByIdAndUpdate(
        updateId,
        { 
          status: "submitted",
          submittedAt: new Date(),
          tasksCompleted: formData.tasksCompleted || undefined,
          challengesFaced: formData.challengesFaced || undefined,
          nextWeekPlans: formData.nextWeekPlans || undefined,
          additionalNotes: formData.additionalNotes || undefined
        },
        { new: true }
      );

      if (updatedUpdate) {
        return json({
          message: "Weekly update submitted successfully",
          success: true,
          status: 200,
          data: updatedUpdate,
        });
      } else {
        return json({
          message: "Failed to submit weekly update",
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

  async reviewUpdate(formData: any) {
    try {
      console.log('Review weekly update with form data:', formData);
      const { updateId, reviewerComments, reviewerId } = formData;
      
      if (!updateId) {
        return json({
          message: "Update ID is required",
          success: false,
          status: 400,
        });
      }
      
      // Update with review information
      const updatedUpdate = await WeeklyUpdate.findByIdAndUpdate(
        updateId,
        { 
          status: "reviewed",
          reviewerComments: reviewerComments || "",
          reviewedBy: reviewerId,
          reviewedAt: new Date()
        },
        { new: true }
      );

      if (updatedUpdate) {
        return json({
          message: "Weekly update reviewed successfully",
          success: true,
          status: 200,
          data: updatedUpdate,
        });
      } else {
        return json({
          message: "Failed to review weekly update",
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

  async deleteUpdate(formData: any) {
    try {
      console.log('Delete weekly update with form data:', formData);
      const { updateId, userId } = formData;
      
      if (!updateId) {
        return json({
          message: "Update ID is required",
          success: false,
          status: 400,
        });
      }
      
      // Find the update to check permissions
      const update = await WeeklyUpdate.findById(updateId);
      if (!update) {
        return json({
          message: "Weekly update not found",
          success: false,
          status: 404,
        });
      }
      
      // Check if the user is authorized to delete this update
      // Only the creator can delete their draft updates
      if (update.status !== "draft" || update.user.toString() !== userId) {
        return json({
          message: "Not authorized to delete this update",
          success: false,
          status: 403,
        });
      }
      
      // Delete the update
      const deletedUpdate = await WeeklyUpdate.findByIdAndDelete(updateId);

      if (deletedUpdate) {
        return json({
          message: "Weekly update deleted successfully",
          success: true,
          status: 200,
        });
      } else {
        return json({
          message: "Failed to delete weekly update",
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

  async getAllUpdates() {
    try {
      const updates = await WeeklyUpdate.find()
        .populate("user", "firstName lastName email")
        .populate("department", "name")
        .populate("reviewedBy", "firstName lastName")
        .sort({ year: -1, weekNumber: -1 });

      return json({
        message: "Updates retrieved successfully",
        success: true,
        status: 200,
        data: updates,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  async getUpdatesByUser(userId: string) {
    try {
      const updates = await WeeklyUpdate.find({ user: userId })
        .populate("department", "name")
        .populate("reviewedBy", "firstName lastName")
        .sort({ year: -1, weekNumber: -1 });

      return json({
        message: "User updates retrieved successfully",
        success: true,
        status: 200,
        data: updates,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  async getUpdatesByDepartment(departmentId: string) {
    try {
      const updates = await WeeklyUpdate.find({ department: departmentId })
        .populate("user", "firstName lastName email")
        .populate("department", "name")
        .populate("reviewedBy", "firstName lastName")
        .sort({ year: -1, weekNumber: -1 });

      return json({
        message: "Department updates retrieved successfully",
        success: true,
        status: 200,
        data: updates,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  async getUpdateById(updateId: string) {
    try {
      const update = await WeeklyUpdate.findById(updateId)
        .populate("user", "firstName lastName email")
        .populate("department", "name")
        .populate("reviewedBy", "firstName lastName");

      if (!update) {
        return json({
          message: "Weekly update not found",
          success: false,
          status: 404,
        });
      }

      return json({
        message: "Weekly update retrieved successfully",
        success: true,
        status: 200,
        data: update,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }
  
  // Helper method to get current week number and dates
  getCurrentWeekInfo() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    
    // Calculate the current week number (1-based)
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    
    // Calculate start and end of the week
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Monday as start of week
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Sunday as end of week
    
    return {
      weekNumber,
      year: now.getFullYear(),
      startDate,
      endDate
    };
  }
  
  // Check if a user has submitted a weekly update for a specific week
  async hasUserSubmittedUpdate(userId: string, weekNumber: number, year: number) {
    try {
      // Find any update by this user for the specified week that has status of submitted or reviewed
      const update = await WeeklyUpdate.findOne({
        user: userId,
        weekNumber,
        year,
        status: { $in: ["submitted", "reviewed"] }
      });
      
      // Return true if an update exists, false otherwise
      return !!update;
    } catch (error) {
      console.error("Error checking if user submitted update:", error);
      return false;
    }
  }
}

export default new WeeklyUpdateController();
