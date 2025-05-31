import React from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Progress,
  Card,
  CardHeader,
  CardBody
} from "@nextui-org/react";

interface PerformanceItem {
  name: string;
  completed: number;
  pending: number;
  inProgress: number;
}

interface PerformanceTableProps {
  title: string;
  data: PerformanceItem[];
  description?: string;
  className?: string;
}

const PerformanceTable: React.FC<PerformanceTableProps> = ({ 
  title, 
  data, 
  description,
  className = "" 
}) => {
  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <h4 className="font-bold text-large">{title}</h4>
        {description && <p className="text-tiny text-default-500">{description}</p>}
      </CardHeader>
      <CardBody>
        <Table aria-label={title} removeWrapper className="min-w-full">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>COMPLETED</TableColumn>
            <TableColumn>IN PROGRESS</TableColumn>
            <TableColumn>PENDING</TableColumn>
            <TableColumn>COMPLETION RATE</TableColumn>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const total = item.completed + item.inProgress + item.pending;
              const completionRate = total > 0 ? Math.round((item.completed / total) * 100) : 0;
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-success">{item.completed}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-warning">{item.inProgress}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-danger">{item.pending}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        size="sm" 
                        value={completionRate} 
                        color={completionRate > 66 ? "success" : completionRate > 33 ? "warning" : "danger"}
                        className="max-w-md"
                      />
                      <span className="text-xs">{completionRate}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default PerformanceTable;
