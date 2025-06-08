import TaskActivity from "../modal/taskActivity.tsx";
import Registration from "../modal/registration.tsx";
import Task from "../modal/task.tsx";

export class ActivityLogger {
    
    // Log task creation
    static async logTaskCreation(
        taskId,
        creatorEmail,
        taskData
    ) {
        try {
            const creator = await Registration.findOne({ email: creatorEmail });
            if (!creator) return;

            const task = await Task.findById(taskId);
            if (!task) return;

            await TaskActivity.create({
                taskId,
                userId: creator._id,
                department: task.department,
                activityType: 'created',
                activityDescription: `Task "${taskData.title}" created`,
                newValue: JSON.stringify({
                    title: taskData.title,
                    priority: taskData.priority,
                    dueDate: taskData.dueDate,
                    category: taskData.category
                }),
                metadata: {
                    priority: taskData.priority,
                    estimatedHours: taskData.estimatedHours
                }
            });

            console.log(`📝 Activity logged: Task creation by ${creator.firstName} ${creator.lastName}`);
        } catch (error) {
            console.error('Error logging task creation:', error);
        }
    }

    // Log task assignment (hierarchical)
    static async logTaskAssignment(
        taskId,
        assignedByEmail,
        assignedToId,
        assignmentLevel,
        instructions
    ) {
        try {
            const [assignedBy, assignedTo, task] = await Promise.all([
                Registration.findOne({ email: assignedByEmail }),
                Registration.findById(assignedToId),
                Task.findById(taskId)
            ]);

            if (!assignedBy || !assignedTo || !task) return;

            await TaskActivity.create({
                taskId,
                userId: assignedBy._id,
                department: task.department,
                activityType: assignmentLevel === 'initial' ? 'assigned' : 'delegated',
                activityDescription: `Task ${assignmentLevel === 'initial' ? 'assigned' : 'delegated'} to ${assignedTo.firstName} ${assignedTo.lastName}`,
                newValue: `${assignedTo.firstName} ${assignedTo.lastName}`,
                metadata: {
                    assignedTo: [assignedTo._id],
                    assignedBy: assignedBy._id,
                    assignmentLevel,
                    instructions
                }
            });

            console.log(`👥 Activity logged: Task ${assignmentLevel} by ${assignedBy.firstName} ${assignedBy.lastName} to ${assignedTo.firstName} ${assignedTo.lastName}`);
        } catch (error) {
            console.error('Error logging task assignment:', error);
        }
    }

    // Log status change
    static async logStatusChange(
        taskId,
        userEmail,
        previousStatus,
        newStatus,
        reason
    ) {
        try {
            const [user, task] = await Promise.all([
                Registration.findOne({ email: userEmail }),
                Task.findById(taskId)
            ]);

            if (!user || !task) return;

            const isCompletion = newStatus === 'completed';
            
            await TaskActivity.create({
                taskId,
                userId: user._id,
                department: task.department,
                activityType: isCompletion ? 'completed' : 'status_changed',
                activityDescription: `Status changed from "${previousStatus}" to "${newStatus}"${reason ? ` - ${reason}` : ''}`,
                previousValue: previousStatus,
                newValue: newStatus,
                metadata: {
                    statusReason: reason
                }
            });

            console.log(`🔄 Activity logged: Status change by ${user.firstName} ${user.lastName} from ${previousStatus} to ${newStatus}`);
        } catch (error) {
            console.error('Error logging status change:', error);
        }
    }

    // Log task update
    static async logTaskUpdate(
        taskId,
        userEmail,
        changes
    ) {
        try {
            const [user, task] = await Promise.all([
                Registration.findOne({ email: userEmail }),
                Task.findById(taskId)
            ]);

            if (!user || !task) return;

            const changeDescriptions = [];
            if (changes.title) changeDescriptions.push(`title updated`);
            if (changes.description) changeDescriptions.push(`description updated`);
            if (changes.priority) changeDescriptions.push(`priority changed to ${changes.priority}`);
            if (changes.dueDate) changeDescriptions.push(`due date updated`);

            await TaskActivity.create({
                taskId,
                userId: user._id,
                department: task.department,
                activityType: 'updated',
                activityDescription: `Task updated: ${changeDescriptions.join(', ')}`,
                newValue: JSON.stringify(changes),
                metadata: {
                    priority: changes.priority,
                    estimatedHours: changes.estimatedHours
                }
            });

            console.log(`✏️ Activity logged: Task update by ${user.firstName} ${user.lastName}`);
        } catch (error) {
            console.error('Error logging task update:', error);
        }
    }

    // Log comment addition
    static async logComment(
        taskId,
        userEmail,
        commentText,
        isReply = false
    ) {
        try {
            const [user, task] = await Promise.all([
                Registration.findOne({ email: userEmail }),
                Task.findById(taskId)
            ]);

            if (!user || !task) return;

            await TaskActivity.create({
                taskId,
                userId: user._id,
                department: task.department,
                activityType: 'commented',
                activityDescription: `${isReply ? 'Replied to comment' : 'Added comment'}: "${commentText.substring(0, 100)}${commentText.length > 100 ? '...' : ''}"`,
                newValue: commentText
            });

            console.log(`💬 Activity logged: Comment by ${user.firstName} ${user.lastName}`);
        } catch (error) {
            console.error('Error logging comment:', error);
        }
    }

    // Log time entry
    static async logTimeEntry(
        taskId,
        userEmail,
        hours,
        description
    ) {
        try {
            const [user, task] = await Promise.all([
                Registration.findOne({ email: userEmail }),
                Task.findById(taskId)
            ]);

            if (!user || !task) return;

            await TaskActivity.create({
                taskId,
                userId: user._id,
                department: task.department,
                activityType: 'time_logged',
                activityDescription: `Logged ${hours} hours${description ? ` - ${description}` : ''}`,
                newValue: hours.toString(),
                metadata: {
                    timeLogged: hours
                }
            });

            console.log(`⏰ Activity logged: Time entry by ${user.firstName} ${user.lastName} - ${hours} hours`);
        } catch (error) {
            console.error('Error logging time entry:', error);
        }
    }
} 