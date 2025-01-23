import { Button, Navbar, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, Switch } from "@nextui-org/react"
import { Link, useLocation, useNavigation } from "@remix-run/react"
import { useTheme } from "next-themes";
import { ReactNode, useState } from "react";
import logo from "~/components/images/header-logo-blue.svg"
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
    const location = useLocation()
    const menuItems = [
        { text: "Home", href: "/" },
        { text: "About", href: "/about" },
        { text: "Services", href: "/services" },
        { text: "Contact", href: "/contact" },
        { text: "blog", href: "/blog" },
        { text: "team", href: "/team" },
    ];
    const navigation = useNavigation();

    // Determine if the page is currently transitioning
    const isLoading = navigation.state === "loading";


    return (
        <div className={`transition duration-500  px-40  overflow-x-hidden  ${theme === "light" ? "bg-white " : ""}`}>
            {/* navigation bar */}
            <div className="relative">
                <Navbar
                isBordered={false}
                isMenuOpen={isMenuOpen}
                onMenuOpenChange={setIsMenuOpen}
                isBlurred
                className="top-0 left-0 w-full py-1 flex fixed z-50"
            >
                <NavbarContent className="lg:hidden">
                    <NavbarMenuToggle
                        className="text-black dark:text-white"
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    />
                </NavbarContent>

                <NavbarContent justify="start">
                    <NavbarItem>
                        <div className="w-40 h-10 text-white">
                            <img
                                className="w-40 h-10 text-white"
                                src={logo || "~/components/images/addentech_logo.png"}
                                alt="Addentech Logo"
                            />
                        </div>
                    </NavbarItem>
                </NavbarContent>

                <NavbarContent justify="center" className="hidden lg:flex w-full">
                    <NavbarItem className="flex gap-6 ml-10 dark:text-white">
                        <Link
                            className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/' ? 'bg-primary rounded-lg' : ''
                                }`}
                            to="/"
                        >
                            Home
                        </Link>
                        <Link
                            className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/contact' ? 'bg-primary rounded-lg' : ''
                                }`}
                            to="/contact"
                        >
                            Contact
                        </Link>
                        <Link
                            className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/services' ? 'bg-primary rounded-lg' : ''
                                }`}
                            to="/services"
                        >
                            Services
                        </Link>
                        <Link
                            className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/about' ? 'bg-primary rounded-lg' : ''
                                }`}
                            to="/about"
                        >
                            About
                        </Link>
                        <Link
                            className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/blog' ? 'bg-primary rounded-lg' : ''
                                }`}
                            to="/blog"
                        >
                            Blog
                        </Link>
                        <Link
                            className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/s' ? 'bg-primary rounded-lg' : ''
                                }`}
                            to="/team"
                        >
                            Team
                        </Link>
                    </NavbarItem>
                </NavbarContent>

                <NavbarContent justify="end">
                    <NavbarItem>
                        <Switch
                            className=""
                            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                            size="md"
                            thumbIcon={({ className }) =>
                                theme === "light" ? <SunIcon className={className} /> : <MoonIcon className={className} />
                            }
                        />
                    </NavbarItem>
                </NavbarContent>

                <NavbarMenu>
                    {menuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item.text}-${index}`}>
                            <Link className="w-full" to={item.href}>
                                {item.text}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </NavbarMenu>
            </Navbar>
            </div>
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
                </div>
            )}

            <div className="">
                {children}
            </div>


            <footer className="mt-10 lg:mt-40">
                <div className="lg:flex  shadow-sm lg:h-40 h-full py-4 rounded-2xl border dark:border-white/30 border-black/10 items-center lg:px-20 px-4  justify-between">
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


                <div className="mt-10 lg:grid lg:grid-cols-3 md:grid md:grid-cols-3 gap-8 py-8  shadow-sm lg:h-80  h-full px-8 rounded-2xl border dark:border-white/30 border-black/10  lg:px-20">
                    {/* location */}
                    {/* location */}
                    <div className="lg:mt-10">
                        <p className="dark:text-default-500 font-poppins text-lg">Locate Us</p>
                        <div className="flex gap-4 mt-4">
                            <div className="flex items-center justify-center  gap-4">
                                <LocationIcon className="dark:text-[#05ECF2] h-6 w-6 hover:text-[#F2059F] hover:transition hover:duration-500" />
                            </div>
                            <div>
                                <p className="dark:text-white font-nunito">No. 15 Netflix Street, Madina</p>
                                <p className="dark:text-white font-nunito">Estates</p>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <div className="flex items-center justify-center  gap-4">
                                {/* <PhoneIcon className="dark:text-[#05ECF2] h-6 w-6 hover:text-[#F2059F]" /> */}
                            </div>
                            <div>
                                <p className="dark:text-white font-nunito">+233-30-291-4988 </p>
                            </div>
                        </div>
                    </div>
                    {/* pages */}
                    {/* pages */}
                    <div className="mt-10 lg:mt-10">
                        <p className="dark:text-default-500 font-poppins text-lg">Services</p>
                        <div className="mt-4 flex flex-col gap-2">
                            <Link to=" ">
                                <p className="dark:text-white font-nunito hover:text-[#05ECF2] hover:transition hover:duration-500">Brand & Product Design</p>
                            </Link>
                            <Link to=" ">
                                <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Design & Development</p>
                            </Link>
                            <Link to=" ">
                                <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Cloud Services</p>
                            </Link>
                            <Link to=" ">
                                <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Digital Marketing and Consultation</p>
                            </Link>
                            <Link to=" ">
                                <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">IT Services</p>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-10 lg:mt-10">
                        <p className="dark:text-default-500 font-poppins text-lg">Pages</p>
                        <div className="mt-4 flex flex-col gap-2">
                            <Link to="/">
                                <p className="dark:text-white font-nunito hover:text-[#05ECF2] hover:transition hover:duration-500">Home</p>
                            </Link>
                            <Link to="/contact">
                                <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Contact</p>
                            </Link>
                            <Link to="/about">
                                <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">About Us</p>
                            </Link>
                            <Link to="/blog">
                                <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Blog</p>
                            </Link>

                        </div>
                    </div>
                </div>

            </footer>
        </div>
    );
};

export default PublicLayout;
