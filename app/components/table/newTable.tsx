import { ReactNode, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, Pagination } from "@nextui-org/react";
import { Loader2, Database } from "lucide-react";

interface ColumnInterface {
    title: string;
    allowSort?: boolean;
}


export default function NewCustomTable(
    {
        totalPages,
        loadingState,
        columns,
        children,
        page,
        setPage,
    }: {
        totalPages: number,
        loadingState: any,
        columns: ColumnInterface[];
        children: ReactNode[] | any;
        page: number,
        setPage: (page: number) => void
    }) {

    return (
        <div className="z-0">
            <Table className="mt-6" aria-label="Example table with custom cells"
                classNames={{
                    base: "h-[68vh] overflow-y-auto w-full overflow-x-auto shadow-none",
                    wrapper:
                        "bg-dashboard-secondary vertical-scrollbar horizontal-scrollbar !border border-white/10 min-w-full",
                    th: "bg-dashboard-primary",
                    td: "font-nunito text-xs text-dashboard-secondary whitespace-nowrap",
                }}
            >
                <TableHeader className="" >
                    {columns.map((column, index: number) => (
                        <TableColumn
                            key={index}
                            allowsSorting={column?.allowSort}
                        >
                            {column?.title}
                        </TableColumn>
                    ))}
                </TableHeader>
                <TableBody
                    loadingState={loadingState}
                    loadingContent={<Loader2 className="text-white animate-spin" />}
                    emptyContent={
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Database size={64} className="mb-4 opacity-50" />
                            <p className="text-lg">No data available</p>
                        </div>
                    }
                >
                    {children}
                </TableBody>
            </Table>

            <div className="flex w-full mt-2">
                {totalPages > 1 && (
                    <Pagination
                        page={page}
                        total={totalPages}
                        onChange={(page: number) => setPage(page)}
                        color="primary"
                        showControls
                        showShadow
                        size="sm"
                        classNames={{
                            item: "font-montserrat font-semibold bg-white dark:bg-slate-800 dark:text-white",
                            next: "font-montserrat font-semibold bg-white dark:bg-slate-800 dark:text-white",
                            prev: "font-montserrat font-semibold bg-white dark:bg-slate-800 dark:text-white",
                        }}
                    />
                )}
            </div>

        </div>
    );
}
