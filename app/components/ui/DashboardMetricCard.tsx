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
          bg: "bg-avatar-blue",
          icon: "text-dashboard-primary",
          trend: "text-dashboard-primary",
          progress: "success"
        };
      case "secondary":
        return {
          bg: "bg-avatar-purple",
          icon: "text-dashboard-primary",
          trend: "text-dashboard-primary",
          progress: "secondary"
        };
      case "success":
        return {
          bg: "bg-status-active",
          icon: "text-dashboard-primary",
          trend: "text-dashboard-primary",
          progress: "success"
        };
      case "warning":
        return {
          bg: "bg-avatar-orange",
          icon: "text-dashboard-primary",
          trend: "text-dashboard-primary",
          progress: "warning"
        };
      case "danger":
        return {
          bg: "bg-status-admin",
          icon: "text-dashboard-primary",
          trend: "text-dashboard-primary",
          progress: "danger"
        };
      default:
        return {
          bg: "bg-dashboard-tertiary",
          icon: "text-dashboard-secondary",
          trend: "text-dashboard-secondary",
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
        return "text-status-active";
      case "down":
        return "text-status-admin";
      default:
        return "text-dashboard-muted";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="bg-dashboard-secondary shadow-sm border border-dashboard hover:shadow-md transition-all duration-300">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${colorClasses.bg} flex items-center justify-center`}>
              <div className={colorClasses.icon}>
                {icon}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-dashboard-secondary">{title}</p>
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
                <div className="animate-pulse bg-dashboard-tertiary h-8 w-16 rounded"></div>
              ) : (
                value
              )}
            </div>
            <p className="text-xs text-dashboard-muted">{description}</p>
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