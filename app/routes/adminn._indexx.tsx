import { useState, useEffect } from 'react';
import AdminLayout from "~/layout/adminLayout";
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { getSession } from '~/session';
import ProductIcon from '~/components/icons/ProductsIcon';
import CustomedCard from '~/components/ui/CustomedCard';
// import adminDashboardController from '~/controllers/AdminDashBoardController';
import { Link, useLoaderData } from '@remix-run/react';
// import UserIcon from '~/components/icons/UserIcon';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import { RegistrationInterface, SalesInterface } from '~/interfaces/interface';
import CustomTable from '~/components/table/table';
import { SalesColumns } from '~/components/table/columns';
import { Button, TableCell, TableRow } from '@nextui-org/react';
// import productsController from '~/controllers/productsController';
import SupplierIcon from '~/components/icons/SupplierIcon';
import CategoryIcon from '~/components/icons/CatIcon';
import SaleIcon from '~/components/icons/Sales';
import SalesIcon from '~/components/icons/SalesIcon';
import UserIcon from '~/components/icons/UserIcon';




const Admin = () => {
    const [loading, setLoading] = useState(true);
    const [rowsPerPage, setRowsPerPage] = useState(8)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // // Graph data
    // const graphData = [
    //     { name: "Daily", total: dailyTotal },
    //     { name: "Weekly", total: weeklyTotal },
    //     { name: "Monthly", total: monthlyTotal },
    //     { name: "Yearly", total: yearlyTotal },
    //     { name: "Older", total: olderTotal },
    // ];


    return (
        <   AdminLayout pageName="Dashboard">

            <div className='mt-6 lg:grid lg:grid-cols-4 gap-4'>
                <Link to="/admin/departments">
                    <CustomedCard
                        title='Total Departments'
                        // total={productCount}
                        icon={
                            <ProductIcon className="h-[20px] w-[20px] text-success" />
                        }
                    />
                </Link>
                <Link to="/admin/users">
                    <CustomedCard
                        title='Total Users'
                    // total={usersCount}
                        icon={
                            <UserIcon className="h-[20px] w-[20px] text-success" />
                        }
                    />
                </Link>
                <Link to="/admin/cetegories">
                    <CustomedCard
                        title='Blog Categories'
                        // total={suppliersCount}
                        icon={
                            <SupplierIcon className="h-[20px] w-[20px] text-success" />
                        }
                    />
                </Link>
                <Link to="/admin/blogs">
                    <CustomedCard
                        title=' Blogs'
                        // total={categoryCount}
                        icon={
                            <CategoryIcon className="h-[20px] w-[20px] text-success" />
                        }
                    />
                </Link>
            </div>



            <div className='mt-4 lg:grid lg:grid-cols-2 gap-4'>
                {/* chart */}
                <div>
                    <div className='h-[54vh] py-4 px-2  bg-[#333] shadow-md rounded-xl border border-black/5 dark:bg-[#333] dark:border-white/5 flex justify-between mt-2'>
                        {/* <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="#ffffff" />
                                <YAxis stroke="#ffffff" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#333",
                                        border: "1px solid #555",
                                    }}
                                    labelStyle={{ color: "#ffffff" }}
                                    itemStyle={{ color: "#ffffff" }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="total" stroke="#4caf50" />
                            </LineChart>
                        </ResponsiveContainer> */}

                    </div>
                </div>

                <div className='flex flex-col gap-2 '>
                    <div>
                        <div className='h-[26vh] py-2 px-4  bg-[#333] shadow-md rounded-xl border border-white/5  dark:bg-[#333] dark:border-white/5 mt-2'>
                            <p className='font-nunito text-white'>Report</p>

                        </div>
                    </div>
                    {/* <div className='flex flex-col gap-6 mt-6'>
                        <div className='lg:grid lg:grid-cols-2 gap-6'>
                            <Link to="/admin/products">
                                <CustomedCard
                                    title='Daily Sales'
                                    icon={
                                        <SaleIcon className="h-[20px] w-[20px] text-success" />
                                    }
                                />
                            </Link>
                            <Link to="/admin/users">
                                <CustomedCard
                                    title='Weekly Sales'
                                    icon={
                                        <SalesIcon className="h-[20px] w-[20px] text-success" />
                                    }
                                />
                            </Link>
                        </div>
                        <div className='lg:grid lg:grid-cols-2 gap-6'>
                            <Link to="/admin/products">
                                <CustomedCard
                                    title='Monthly Sales'
                                    icon={
                                        <SalesIcon className="h-[20px] w-[20px] text-success" />
                                    }
                                />
                            </Link>
                            <Link to="/admin/users">
                                <CustomedCard
                                    title='Yearly Sales'
                                    icon={
                                        <SalesIcon className="h-[20px] w-[20px] text-success" />
                                    }
                                />
                            </Link>
                        </div>
                    </div> */}
                </div>
            </div>
            <div className='mb-5'>
                <div className='rounded-2xl transition-all h-[54vh] mt-10  duration-200 dark:bg-[#333] border border-white/5 shadow-md  dark:border-white/5 py-2 px-4 flex flex-col gap-2'>
                    <p className='font-nunito text-white'>Recent Activities</p>

                    {/* <CustomTable
                        columns={SalesColumns}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                    >
                        {sales.map((sale: SalesInterface, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{sale._id}</TableCell>
                                <TableCell>
                                    {sale?.attendant?.firstName} {sale?.attendant?.middleName}
                                </TableCell>
                                <TableCell>GHC {sale?.totalAmount}</TableCell>
                                <TableCell>GHC {sale?.amountPaid}</TableCell>
                                <TableCell>GHC {sale?.balance}</TableCell>
                                <TableCell className="relative flex items-center gap-4">
                                    <Button
                                        size="sm"
                                        color="success"
                                        variant="flat"
                                        onClick={() => {
                                            // Refund logic
                                        }}
                                    >
                                        Refund
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </CustomTable> */}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Admin;





