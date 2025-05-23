import User from "~/modal/registration";
import Category from "~/modal/category";
import Blog from "~/modal/blog";
import Departments from "~/modal/department";
import Contact from "~/modal/contact";

class DashboardController {
    async getDashboardData(): Promise<any> {
        try {
            const totalUsers = await User.countDocuments()
            const totalCategories = await Category.countDocuments()
            const totalBlogs = await Blog.countDocuments()
            const totalMessages = await Contact.countDocuments()
            const totalDepartments = await Departments.countDocuments()
            return { totalUsers, totalCategories, totalBlogs, totalMessages, totalDepartments }
        } catch (error) {
            return { error: "Failed to fetch dashboard data" }
        }
    }
}

const dashboard = new DashboardController
export default dashboard