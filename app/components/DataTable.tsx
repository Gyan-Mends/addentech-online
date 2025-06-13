import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Spinner,
} from "@nextui-org/react";
import { Search } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  pagination?: boolean;
  search?: boolean;
  perPage?: number;
  isLoading?: boolean;
  emptyContent?: React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  pagination = false,
  search = false,
  perPage = 10,
  isLoading = false,
  emptyContent = "No data available",
}) => {
  const [page, setPage] = useState(1);
  const [filteredData, setFilteredData] = useState<any[]>(data);
  const [searchTerm, setSearchTerm] = useState("");

  // Update filtered data when the original data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Handle search functionality
  useEffect(() => {
    if (!search || !searchTerm) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) => {
      return columns.some((column) => {
        const value = item[column.key];
        if (!value) return false;
        
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    setFilteredData(filtered);
    setPage(1); // Reset to first page when searching
  }, [searchTerm, data, columns, search]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentData = pagination
    ? filteredData.slice(startIndex, endIndex)
    : filteredData;

  return (
    <div className="space-y-4">
      {search && (
        <div className="w-full flex justify-end mb-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search className="h-4 w-4  border border-white/20 text-white" />}
            className="max-w-xs"
            classNames={{
              inputWrapper: "bg-dashboard-secondary border border-white/20 text-white",
              input: "!text-white"
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner color="primary" size="lg" />
        </div>
      ) : (
        <Table
       
          aria-label="Data table"
          classNames={{
            base: "h-[68vh] overflow-y-auto w-full overflow-x-auto shadow-none",
            wrapper:
                "bg-dashboard-secondary vertical-scrollbar horizontal-scrollbar !border border-white/10 min-w-full",
            th: "bg-dashboard-primary",
            td: "font-nunito text-xs text-dashboard-secondary whitespace-nowrap",
        }}
          bottomContent={
            pagination && totalPages > 1 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  page={page}
                  total={totalPages}
                  onChange={setPage}
                  showControls
                />
              </div>
            ) : null
          }
         
        >
          <TableHeader>
            {columns.map((column) => (
              <TableColumn key={column.key} className="!text-white bg-dashboard-primary">{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody
            emptyContent={isLoading ? <Spinner color="primary" /> : emptyContent}
            items={currentData}
          >
            {(item) => (
              <TableRow key={item?._id || Math.random().toString()}>
                {columns.map((column) => (
                  <TableCell key={`${item?._id || Math.random().toString()}-${column.key}`}>
                    {column.render ? column.render(item) : item[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
