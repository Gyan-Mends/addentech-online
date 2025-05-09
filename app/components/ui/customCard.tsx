import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

const MetricCard = ({ title, value, description, icon, trend }: { title: any; value: any; description: any; icon: any; trend: any }) => {
    return (
        <Card className="bg-[#020817] pr-6 border border-white/20">
            <CardHeader className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium">{title}</span>
                <div className="w-8 h-8 rounded-full text-green-500 bg-primary-500/10 flex items-center justify-center">
                    {icon}
                </div>
            </CardHeader>
            <CardBody>
                <div className="text-2xl font-bold">{value}</div>
                <p
                    className={`text-xs ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"} flex items-center mt-1`}
                >
                    {trend === "up" && <ChevronUpIcon className="mr-1 h-4 w-4" />}
                    {trend === "down" && <ChevronDownIcon className="mr-1 h-4 w-4" />}
                    {description}
                </p>
            </CardBody>
        </Card>
    );
};

export default MetricCard;
