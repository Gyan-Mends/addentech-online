import { Card, CardBody, CardHeader, Button, Chip, Avatar, Progress } from "@nextui-org/react";
import { motion } from "framer-motion";
import { MoreHorizontal, ExternalLink, RefreshCw } from "lucide-react";
import React from "react";

interface DashboardWidgetProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  status?: "loading" | "error" | "success" | "warning";
  className?: string;
  headerContent?: React.ReactNode;
  isRefreshable?: boolean;
  onRefresh?: () => void;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  description,
  icon,
  children,
  action,
  status,
  className = "",
  headerContent,
  isRefreshable = false,
  onRefresh
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "loading":
        return "default";
      case "error":
        return "danger";
      case "success":
        return "success";
      case "warning":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`w-full ${className}`}
    >
      <Card className="bg-white shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <div className="text-gray-600">
                {icon}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                {status && (
                  <Chip size="sm" color={getStatusColor()} variant="flat">
                    {status}
                  </Chip>
                )}
              </div>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {headerContent}
            {isRefreshable && onRefresh && (
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onClick={onRefresh}
                className="text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {action && (
              <Button
                size="sm"
                color="primary"
                variant="flat"
                endContent={action.href ? <ExternalLink className="h-3 w-3" /> : undefined}
                as={action.href ? "a" : "button"}
                href={action.href}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardBody className="pt-0">
          {status === "loading" ? (
            <div className="space-y-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : status === "error" ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Failed to load data</p>
            </div>
          ) : (
            children
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

// Helper component for quick stat items
export const QuickStat: React.FC<{
  label: string;
  value: string | number;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  color?: "green" | "red" | "blue" | "gray";
}> = ({ label, value, trend, trendValue, color = "blue" }) => {
  const getColorClasses = () => {
    switch (color) {
      case "green":
        return "text-green-600";
      case "red":
        return "text-red-600";
      case "blue":
        return "text-blue-600";
      default:
        return "text-gray-600";
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
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <div className="text-right">
        <div className={`text-lg font-bold ${getColorClasses()}`}>{value}</div>
        {trendValue && (
          <div className={`text-xs ${getTrendColor()}`}>{trendValue}</div>
        )}
      </div>
    </div>
  );
};

// Helper component for team member items
export const TeamMemberItem: React.FC<{
  name: string;
  role?: string;
  avatar?: string;
  stats?: { completed: number; pending: number; inProgress?: number };
  onClick?: () => void;
}> = ({ name, role, avatar, stats, onClick }) => {
  const completionRate = stats 
    ? Math.round((stats.completed / Math.max(stats.completed + stats.pending + (stats.inProgress || 0), 1)) * 100)
    : 0;

  return (
    <div 
      className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${onClick ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
      onClick={onClick}
    >
      <Avatar 
        size="sm" 
        name={name} 
        src={avatar}
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 truncate">{name}</h4>
        {role && <p className="text-xs text-gray-500">{role}</p>}
        {stats && (
          <div className="flex gap-2 mt-1 text-xs">
            <span className="text-green-600">✓ {stats.completed}</span>
            <span className="text-yellow-600">⏳ {stats.inProgress || 0}</span>
            <span className="text-gray-600">📋 {stats.pending}</span>
          </div>
        )}
      </div>
      {stats && (
        <div className="text-right flex-shrink-0">
          <Progress
            size="sm"
            value={completionRate}
            className="w-16"
            color={completionRate >= 70 ? "success" : "warning"}
          />
          <div className="text-xs text-gray-500 mt-1">{completionRate}%</div>
        </div>
      )}
    </div>
  );
};

export default DashboardWidget;