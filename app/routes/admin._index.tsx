import { Card, CardHeader, Progress, Tab, Tabs } from "@nextui-org/react"
import { BarChart2, BookOpen, Folder, Tag, Users } from "lucide-react"
import { useState } from "react"
import { CardBody } from "~/components/acternity/3d"
import MetricCard from "~/components/ui/customCard"
import AdminLayout from "~/layout/adminLayout"

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState("daily");

  const renderContent = () => {
    switch (selectedTab) {
      case "daily":
        return <p className="text-muted-foreground/50">Daily Activity Content</p>;
      case "weekly":
        return <p className="text-muted-foreground/50">Weekly Activity Content</p>;
      case "monthly":
        return <p className="text-muted-foreground/50">Monthly Activity Content</p>;
      default:
        return <p className="text-muted-foreground/50">Select a tab to view content</p>;
    }
  };
  return (
    <AdminLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Departments"
          value="12"
          description="+2 from last month"
          icon={<Folder className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Total Users"
          value="2,543"
          description="+15% from last month"
          icon={<Users className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Blog Categories"
          value="32"
          description="Same as last month"
          icon={<Tag className="h-4 w-4" />}
          trend="neutral"
        />
        <MetricCard
          title="Blogs"
          value="128"
          description="+12 from last week"
          icon={<BookOpen className="h-4 w-4" />}
          trend="up"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7 mt-4">
        <Card className="md:col-span-4 border border-white/20 bg-[#020817]">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-base font-medium">User Activity</span>
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value)}>
              <Tab >Daily</Tab>
              <Tab >Weekly</Tab>
              <Tab >Monthly</Tab>
            </Tabs>
          </CardHeader>
          <CardBody>
            <div className="h-[300px] flex items-center justify-center">
              {renderContent()}
            </div>
          </CardBody>
        </Card>

        <Card className="md:col-span-3 border border-white/20 bg-[#020817] px-10">
          <CardHeader>
            <p className="text-base font-medium">Report</p>
            <p>Monthly overview</p>
          </CardHeader>
          <CardBody className="space-y-4 ">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="font-medium">New Users</span>
                </div>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="font-medium">Blog Posts</span>
                </div>
                <span>63%</span>
              </div>
              <Progress value={63} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="font-medium">Comments</span>
                </div>
                <span>42%</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="font-medium">Engagement</span>
                </div>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2 w-[100%]" />
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default Dashboard