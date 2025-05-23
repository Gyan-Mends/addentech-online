import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

const MetricCard = ({ title, value, description, icon, trend }: { title: any; value: any; description: any; icon: any; trend: any }) => {
    return (
        <Card className="bg-white pr-6 border shadow-sm border-black/20">
            <CardHeader className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium">{title}</span>
                <div className="w-8 h-8 rounded-full text-pink-500 bg-pink-500/10 flex items-center justify-center">
                    {icon}
                </div>
            </CardHeader>
            <CardBody>
                <div className="text-2xl font-bold">{value}</div>
                <p
                    className={`text-xs ${trend === "up" ? "text-pink-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"} flex items-center mt-1`}
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
