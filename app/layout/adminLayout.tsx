"use client"

import { Avatar, Button, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input } from "@nextui-org/react";
import { Link } from "@remix-run/react";
import { ArrowLeft, Bell, BookOpen, ChevronDown, FileText, Folder, LayoutDashboard, Menu, MessageSquare, Search, Settings, Tag, User, Users, X } from "lucide-react";
import { ReactNode, useState } from "react";


const AdminLayout = ({ children }: { children: ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)


    return (
        <div className="flex h-screen bg-[#3B82F61A] font-nunito">
            <div
                className={`${isSidebarOpen ? "w-64" : "w-0 -ml-64"} bg-[#020817] border-r border-r-white/20 transition-all duration-300 ease-in-out flex flex-col z-30 fixed h-full md:relative`}
            >
                <div className="flex items-center justify-between p-4 border-b border-b-white/20">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold font-montserrat">
                            D
                        </div>
                        <span className="ml-2 text-xl font-bold text-blue-500 font-montserrat">
                            DENNISLAW
                        </span>
                    </div>
                    <Button variant="ghost" onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-col flex-1 px-2 py-4 space-y-6">
                    <ul className="flex flex-col ">
                        <Link to="/hod">
                            <li className=" hover:bg-[#3B82F61A] py-3  hover:border-r-4 hover:border-r-primary-500 hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-4 transition-all duration-300 ease-in-out text-gray-200">
                                <LayoutDashboard className=" h-5 w-5 hover:text-white" />
                                Dashboard
                            </li>
                        </Link>
                        <Link to="/admin/users">
                            <li className=" hover:bg-[#3B82F61A] py-3  hover:border-r-4 hover:border-r-primary-500 hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-4 transition-all duration-300 ease-in-out text-gray-200">
                                <User className=" h-5 w-5 hover:text-white" />
                                Users
                            </li>
                        </Link>
                        <Link to="/departments">
                            <li className=" hover:bg-[#3B82F61A] py-3  hover:border-r-4 hover:border-r-primary-500 hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-4 transition-all duration-300 ease-in-out text-gray-200">
                                <Folder className=" h-5 w-5 hover:text-white" />
                                Department
                            </li>
                        </Link>
                        <Link to="/blog">
                            <li className=" hover:bg-[#3B82F61A] py-3  hover:border-r-4 hover:border-r-primary-500 hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-4 transition-all duration-300 ease-in-out text-gray-200">
                                <BookOpen className=" h-5 w-5 hover:text-white" />
                                Blog
                            </li>
                        </Link>
                        <Link to="/categories">
                            <li className=" hover:bg-[#3B82F61A] py-3  hover:border-r-4 hover:border-r-primary-500 hover:bg-opacity-50 hover:text-white font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-4 transition-all duration-300 ease-in-out text-gray-200">
                                <Tag className=" h-5 w-5 hover:text-white" />
                                Categories
                            </li>
                        </Link>
                    </ul>

                    <div className="mt-6">
                        <h3 className="text-xs font-semibold text-muted-foreground mb-2">SETTINGS</h3>
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="p-4 border-t mt-auto">
                    <div className="flex items-center space-x-3">
                        <Avatar>
                            <img src="/placeholder.svg?height=40&width=40" />
                            <p>JD</p>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">John Doe</p>
                            <p className="text-xs text-muted-foreground">Administrator</p>
                        </div>
                        <Dropdown>
                            <DropdownTrigger asChild>
                                <Button variant="ghost">
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem key="account">My Account</DropdownItem>
                                <Divider />
                                <DropdownItem key="profile">Profile</DropdownItem>
                                <DropdownItem key="settings">Settings</DropdownItem>
                                <Divider />
                                <DropdownItem key="logout">Logout</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </div>


            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b bg-[#020817]  border-b-white/20 flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsSidebarOpen(true)}
                            className={isSidebarOpen ? "md:hidden" : ""}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Button variant="bordered" size="sm" className="hidden md:flex rounded-md text-md h-[35px]  border border-white/20">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>

                    <div className="flex-1 max-w-md mx-4 rounded">
                        <Input
                            startContent={
                                <Search className="h-4 w-4 text-default-400" />
                            }
                            type="search"
                            placeholder="Search user..."
                            className="w-full  "
                            classNames={{
                                inputWrapper: "border rounded-md border-white/20 bg-[#020817]"
                            }}
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 rounded-full flex items-center justify-center border border-white/20 ">
                            <div>
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-400"></span>
                            </div>
                        </div>

                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/30">
                    {children}
                </main>
            </div>


        </div>
    );
};

export default AdminLayout;