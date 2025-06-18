import { ReactNode, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, Pagination } from "@nextui-org/react";
import { Loader2, Database } from "lucide-react";

interface ColumnInterface {
    title?: string;
    allowSort?: boolean;
}

interface CustomTbleInterface{
    totalPages: number,
    loadingState?: any,
    columns: ColumnInterface[];
    children?: ReactNode[] | any;
    page?: number,
    setPage: (page: number) => void
}


const CustomTble = (
    {
        totalPages,
        loadingState,
        columns,
        children,
        page,
        setPage,
    }:CustomTbleInterface ) => {

    return (
        <div className="z-0">
            <Table className="mt-6 " aria-label="Example table with custom cells"
                classNames={{
                    base: "h-[76vh] overflow-y-auto w-screen md:w-full overflow-x-auto  shadow-none",
                    wrapper:
                        "dark:bg-slate-900 vertical-scrollbar horizontal-scrollbar shadow-none bg-white rounded-2xl dark:border border-white/5",
                    th: "dark:bg-slate-800",
                    td: "font-nunito text-xs text-slate-500 dark:text-slate-200 ",
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

export default CustomTble
