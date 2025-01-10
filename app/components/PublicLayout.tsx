import { Button, Navbar, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@nextui-org/react"
import { Link } from "@remix-run/react"
import { useTheme } from "next-themes";
import { ReactNode, useState } from "react";
import logo from "~/components/images/addentech_logo.png"
import SunIcon from "./icons/SunIcon";
import MoonIcon from "./icons/MoonIcon";
import LocationIcon from "./icons/LocationIcon";
import FacebookIcon from "./icons/FacebookIcon";
import InstagramIcon from "./icons/InstagramIcon";
import InIcon from "./icons/InIcon";
import XIcon from "./icons/XIcon";
import YouTubeIcon from "./icons/YoutubeIcon";


interface PublicLayoutProps {
    children: ReactNode;
}
const PublicLayout = ({ children }: PublicLayoutProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme()
    const menuItems = [
        { text: "Home", href: "/" },
        { text: "About", href: "/about" },
        { text: "Services", href: "/services" },
        { text: "Contact", href: "/contact" },
        { text: "blog", href: "/blog" },
        { text: "team", href: "/team" },
    ];


    return (
        <div className={`transition duration-500  px-4 lg:px-40 overflow-x-hidden ${theme === "light" ? "bg-white " : "bg-[#0b0e13]"}`}>
            {/* navigation bar */}
            <Navbar
                isBordered={false}
                isMenuOpen={isMenuOpen}
                onMenuOpenChange={setIsMenuOpen}
                isBlurred
                position="sticky"
                className="top-0 z-50 py-2 dark:bg-[#0b0e13] bg-white"
            >
                <NavbarContent className="lg:hidden">
                    <NavbarMenuToggle className="text-black dark:text-white" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} />
                </NavbarContent>

                <NavbarContent justify="start" className="">
                    <NavbarItem  >
                        <img className=" w-full" src={logo || "~/components/images/addentech_logo.png"} alt="Addentech Logo" />
                        <p className="dark:text-[#0b0e13] text-white">Addentechnology</p>
                    </NavbarItem>
                </NavbarContent>

                <NavbarContent justify="center" className="hidden lg:flex w-full">
                    <NavbarItem className="flex gap-10 ml-10 dark:text-white">
                        <Link className="font-nunito" to="/">
                            Home
                        </Link>
                        <Link className="font-nunito" to="/contact">
                            Contact
                        </Link>
                        <Link className="font-nunito" to="/services">
                            Services
                        </Link>
                        <Link className="font-nunito" to="/about">
                            About
                        </Link>
                        <Link className="font-nunito" to="/blog">
                            Blog
                        </Link>
                        <Link className="font-nunito" to="/team">
                            Team
                        </Link>
                    </NavbarItem>
                </NavbarContent>

                <NavbarContent justify="end" className="">
                    <NavbarItem  >
                        <button className="text-white" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                            {theme === "light" ? (
                                <SunIcon className="text-[#0b0e13]" />
                            ) : (
                                    <MoonIcon className="text-white" />
                            )}
                        </button>
                    </NavbarItem>
                </NavbarContent>

                <NavbarMenu>
                    {menuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item.text}-${index}`}>
                            <Link
                                className="w-full"
                                to={item.href}
                            >
                                {item.text}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </NavbarMenu>

            </Navbar>

            <div className="">
                {children}
            </div>

            <footer className="mt-10 lg:mt-40">
                <div className="lg:flex dark:bg-[rgb(14,17,22)] shadow-sm lg:h-40 h-full py-4 rounded-2xl border dark:border-white/30 border-black/10 items-center lg:px-20 px-4  justify-between">
                    <div>
                        <p className="dark:text-white font-montserrat font-bold lg:text-4xl text-2xl">Transform your business  </p>
                        <p className="dark:text-white font-montserrat font-bold lg:text-4xl mt-2 text-2xl">with us effortlessly</p>
                    </div>
                    <div className="flex gap-4 mt-6 lg:mt-0">
                        <Link to="/contact">
                            <Button
                                className="bg-[#05ECF2] font-nunito text-lg  hover:transition hover:duration-500  hover:-translate-y-2 "
                            >
                                Contact us
                            </Button>
                        </Link>
                        <Link to="/about">
                            <Button
                                color="default"
                                className="font-nunito bg-[#F2059F] text-lg hover:transition hover:duration-500  hover:-translate-y-2  text-white"
                            >
                                Learn More
                            </Button></Link>
                    </div>
                </div>


                <div className="mt-10 lg:grid lg:grid-cols-3 md:grid md:grid-cols-3 gap-8 py-8 dark:bg-[rgb(14,17,22)] shadow-sm lg:h-80  h-full px-8 rounded-2xl border dark:border-white/30 border-black/10  lg:px-20">
                    {/* location */}
                    {/* location */}
                    <div className="lg:mt-10">
                        <p className="dark:text-white font-poppins text-lg">Locate Us</p>
                        <div className="flex gap-4 mt-4">
                            <div className="flex items-center justify-center  gap-4">
                                <LocationIcon className="dark:text-[#05ECF2] h-6 w-6 hover:text-[#F2059F] hover:transition hover:duration-500" />
                            </div>
                            <div>
                                <p className="dark:text-primary-100 font-nunito">No. 15 Netflix Street, Madina</p>
                                <p className="dark:text-primary-100 font-nunito">Estates</p>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <div className="flex items-center justify-center  gap-4">
                                {/* <PhoneIcon className="dark:text-[#05ECF2] h-6 w-6 hover:text-[#F2059F]" /> */}
                            </div>
                            <div>
                                <p className="dark:text-primary-100 font-nunito">+233-30-291-4988 </p>
                            </div>
                        </div>
                    </div>
                    {/* pages */}
                    {/* pages */}
                    <div className="mt-10 lg:mt-10">
                        <p className="dark:text-white font-poppins text-lg">Services</p>
                        <div className="mt-4 flex flex-col gap-2">
                            <Link to=" ">
                                <p className="dark:text-primary-100 font-nunito hover:text-[#05ECF2] hover:transition hover:duration-500">Brand & Product Design</p>
                            </Link>
                            <Link to=" ">
                                <p className="dark:text-primary-100 font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Design & Development</p>
                            </Link>
                            <Link to=" ">
                                <p className="dark:text-primary-100 font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Cloud Services</p>
                            </Link>
                            <Link to=" ">
                                <p className="dark:text-primary-100 font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Digital Marketing and Consultation</p>
                            </Link>
                            <Link to=" ">
                                <p className="dark:text-primary-100 font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">IT Services</p>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-10 lg:mt-10">
                        <p className="dark:text-white font-poppins text-lg">Pages</p>
                        <div className="mt-4 flex flex-col gap-2">
                            <Link to="/">
                                <p className="dark:text-primary-100 font-nunito hover:text-[#05ECF2] hover:transition hover:duration-500">Home</p>
                            </Link>
                            <Link to="/contact">
                                <p className="dark:text-primary-100 font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Contact</p>
                            </Link>
                            <Link to="/about">
                                <p className="dark:text-primary-100 font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">About Us</p>
                            </Link>
                            <Link to="/blog">
                                <p className="dark:text-primary-100 font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Blog</p>
                            </Link>

                        </div>
                    </div>
                </div>
                <div className="mt-10 lg:grid lg:grid-cols-6 md:grid md:grid-cols-6 gap-10 pb-10">
                    <div className="dark:bg-[rgb(14,17,22)]   rounded-2xl h-20 flex items-center border dark:border-white/30 border-black/10  px-20 col-span-5">
                        <p className="dark:text-white font-nunito font-bold text-lg">Powered by <span className="text-[#05ECF2]">Addentech Dev</span></p>
                    </div>
                    <div className="dark:bg-[rgb(14,17,22)] h-20 lg:h-full mt-4 lg:mt-0 md:mt-0 flex gap-2 items-center justify-center  rounded-2xl border dark:border-white/30 border-black/10">
                        <FacebookIcon className="text-[#05ECF2] h-6 w-6 hover:text-[#F2059F]" />
                        <InstagramIcon className="text-[#05ECF2] h-6 w-6 hover:text-[#F2059F]" />
                        <InIcon className="text-[#05ECF2] h-6 w-6 hover:text-[#F2059F]" />
                        <XIcon className="text-[#05ECF2] h-6 w-6 hover:text-[#F2059F]" />
                        <YouTubeIcon className="text-[#05ECF2] h-6 w-6 hover:text-[#F2059F]" />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
