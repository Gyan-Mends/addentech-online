import { Card, CardBody, CardHeader, Progress } from "@nextui-org/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
  trendPercentage?: number;
  progressValue?: number;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
  isLoading?: boolean;
}

const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend = "stable",
  trendPercentage,
  progressValue,
  color = "primary",
  isLoading = false
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return {
          bg: "bg-blue-500/10",
          icon: "text-blue-500",
          trend: "text-blue-600",
          progress: "success"
        };
      case "secondary":
        return {
          bg: "bg-purple-500/10",
          icon: "text-purple-500",
          trend: "text-purple-600",
          progress: "secondary"
        };
      case "success":
        return {
          bg: "bg-green-500/10",
          icon: "text-green-500",
          trend: "text-green-600",
          progress: "success"
        };
      case "warning":
        return {
          bg: "bg-yellow-500/10",
          icon: "text-yellow-500",
          trend: "text-yellow-600",
          progress: "warning"
        };
      case "danger":
        return {
          bg: "bg-red-500/10",
          icon: "text-red-500",
          trend: "text-red-600",
          progress: "danger"
        };
      default:
        return {
          bg: "bg-gray-500/10",
          icon: "text-gray-500",
          trend: "text-gray-600",
          progress: "default"
        };
    }
  };

  const colorClasses = getColorClasses(color);

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3" />;
      case "down":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="bg-white shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${colorClasses.bg} flex items-center justify-center`}>
              <div className={colorClasses.icon}>
                {icon}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {trendPercentage && (
                <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span>{Math.abs(trendPercentage)}%</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-2">
            <div className={`text-2xl font-bold ${colorClasses.trend}`}>
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                value
              )}
            </div>
            <p className="text-xs text-gray-500">{description}</p>
            {progressValue !== undefined && (
              <Progress
                size="sm"
                value={progressValue}
                color={colorClasses.progress as any}
                className="mt-2"
              />
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default DashboardMetricCard; 