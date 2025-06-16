import { useState, useEffect } from "react";
import { Button, Navbar, Spinner } from "@nextui-org/react";
import { Link, useLocation } from "@remix-run/react";
import {
    ArrowRight,
    ExternalLink,
    Twitter,
    Linkedin,
    Facebook,
    Instagram,
    Menu,
    X,
    Youtube,
    MapPin,
    Mail,
    Phone,
} from "lucide-react";
import logo from "~/components/images/addentech_logo.png";
import ctaBackground from "~/components/images/cta2_files/geometric-background-vector-white-cube-patterns_53876-126683.jpg";
import { ThemeSwitcher } from "~/components/ThemeSwitcher";
import ScrollAnimation from "~/components/animation";


const PublicLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Check if we're on the homepage
    const isHomepage = location.pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const socialLinks = {
        twitter: { icon: Twitter, url: "https://twitter.com/yourprofile" },
        linkedin: { icon: Linkedin, url: "https://linkedin.com/in/yourprofile" },
        facebook: { icon: Facebook, url: "https://facebook.com/yourprofile" },
        instagram: { icon: Instagram, url: "https://instagram.com/yourprofile" },
    };

    const navigationLinks = {
        Home: "/",
        Services: "/services",
        Team: "/team",
        About: "/about",
        Blog: "/blog",
        //   Pricing: "/pricing",
    };

    const handleToggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handlePageLoad = (callback: () => void) => {
        setIsLoading(true);
        callback();
        setIsLoading(false);
    };

    return (
        <div className="scroll-smooth">
            {/* Navbar */}
            <header className={`px-4 lg:px-[125px] top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled
                ? 'fixed bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 '
                : 'absolute'
                }`}>
                <div className="container flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex  items-center">
                        <Link to="/" className="flex flex-col items-center space-x-2">
                            <img src={logo} alt="Addentech Logo" className="w-40 h-12" />

                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-6">
                        {Object.entries(navigationLinks).map(([name, path]) => (
                            <Link
                                key={name}
                                to={path}
                                className={`text-sm font-medium transition-colors duration-300 ${!isScrolled && isHomepage
                                        ? 'text-white hover:text-white/80'
                                        : isScrolled
                                            ? 'text-black hover:text-pink-500'
                                            : 'text-black hover:text-pink-500'
                                    }`}
                            >
                                {name}
                            </Link>
                        ))}
                    </nav>


                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleMenu}
                            aria-label="Toggle menu"
                            className={`transition-colors duration-300 ${isScrolled
                                ? 'text-foreground hover:bg-default-100'
                                : ' hover:bg-white/10'
                                }`}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* <ThemeSwitcher /> */}
                        {/* <Link to="/addentech-login">
                            <Button className="border border-pink-500/50 border-2" variant="ghost" size="sm">
                          Log in
                      </Button>
                        </Link> */}
                        <Link to="/contact">
                            <button
                                className="bg-gradient py-2 px-4 rounded text-white font-semibold hover:bg-pink-600 transition-colors"
                            >
                                Contact Us
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <nav className="flex flex-col mt-4 space-y-2 md:hidden  backdrop-blur rounded-lg p-4">
                        {Object.entries(navigationLinks).map(([name, path]) => (
                            <Link
                                key={name}
                                to={path}
                                className="px-4 py-2 text-sm font-medium  transition-colors hover:text-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {name}
                            </Link>
                        ))}
                    </nav>
                )}
            </header>

            {/* Loading Spinner */}
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                    <Spinner size="lg" color="white" />
                </div>
            )}

            {/* Page Content */}
            <div
                className="flex min-h-screen flex-col font-nunito"
                onClick={() => handlePageLoad(() => console.log("Page load"))}
            >
                {children}
            </div>

            {/* CTA Section */}
            <section
                className="py-20 lg:px-20 px-4 relative overflow-hidden"
                style={{
                    backgroundImage: `url(${ctaBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Section Overlay */}
                <div className="absolute inset-0 bg-black/10" />

                <div className="container relative z-10">
                    <ScrollAnimation>
                        <div className=" p-8 md:p-12 lg:p-16 relative overflow-hidden">
                            {/* Card Overlay */}
                            <div className="absolute inset-0  rounded-2xl" />

                            <div className="relative z-10 max-w-3xl">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4  drop-shadow-lg">
                                    Transform your business with us effectively
                                </h2>
                                <p className=" mb-8 text-lg drop-shadow-md">
                                    Ready to revolutionize your legal practice with cutting-edge technology? Get in touch with our team today.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button className="bg-pink-500 text-white hover:bg-pink-600 shadow-lg transition-all duration-300">
                                        Contact Us <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ScrollAnimation>
                </div>
            </section>
            <footer className="border-t border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-[150px] px-4">
                {/* Main Footer Content */}
                <div className="py-16">
                    <div className="mx-auto px-4 sm:px-6 lg:px-0">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

                            {/* About Addentech */}
                            <div className="lg:col-span-2">
                                <div className="mb-6">
                                    <img src={logo} alt="Addentech Logo" className="w-40 h-12" />
                                </div>
                                <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
                                    Transforming the legal landscape with innovative technology solutions. We provide cutting-edge
                                    digital transformation services to help law firms and legal professionals thrive in the modern era.
                                </p>
                                <div className="flex space-x-4">
                                    {Object.entries(socialLinks).map(([social, { icon: Icon, url }]) => (
                                        <Link
                                            key={social}
                                            to={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full border border-pink-500/40 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all duration-300"
                                        >
                                            <Icon className="w-5 h-5 text-pink-500 hover:text-white" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Our Services */}
                            <div>
                                <h4 className="font-bold font-montserrat text-lg mb-6">Our Services</h4>
                                <ul className="space-y-3">
                                    <li><Link to="/services" className="text-muted-foreground hover:text-pink-500 transition-colors">Digital Transformation</Link></li>
                                    <li><Link to="/services" className="text-muted-foreground hover:text-pink-500 transition-colors">Software Development</Link></li>
                                    <li><Link to="/services" className="text-muted-foreground hover:text-pink-500 transition-colors">AI Solutions</Link></li>
                                    <li><Link to="/services" className="text-muted-foreground hover:text-pink-500 transition-colors">E-Discovery</Link></li>
                                    <li><Link to="/services" className="text-muted-foreground hover:text-pink-500 transition-colors">Client Portals</Link></li>
                                    <li><Link to="/services" className="text-muted-foreground hover:text-pink-500 transition-colors">Legal Tech Consulting</Link></li>
                                </ul>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="font-bold font-montserrat text-lg mb-6">Quick Links</h4>
                                <ul className="space-y-3">
                                    {Object.entries(navigationLinks).map(([name, path]) => (
                                        <li key={name}>
                                            <Link to={path} className="text-muted-foreground hover:text-pink-500 transition-colors">
                                                {name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div>
                                    <h4 className="font-bold font-montserrat text-lg mb-4">Contact Us</h4>
                                    <div className="space-y-3">
                                        <p className="flex items-center gap-3 text-muted-foreground">
                                            <MapPin className="w-5 h-5 " />
                                            <span>Accra, Ghana</span>
                                        </p>
                                        <p className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 " />
                                            <a href="mailto:info@addentech.com" className="text-muted-foreground hover:text-pink-500 transition-colors">
                                                info@addentech.com
                                            </a>
                                        </p>
                                        <p className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 " />
                                            <a href="tel:+233123456789" className="text-muted-foreground hover:text-pink-500 transition-colors">
                                                +233 (0) 123 456 789
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold font-montserrat text-lg mb-4">Get Started</h4>
                                    <p className="text-muted-foreground text-sm mb-4">
                                        Ready to transform your legal practice with cutting-edge technology?
                                    </p>

                                </div>

                                <div>
                                    <h4 className="font-bold font-montserrat text-lg mb-4">Our Expertise</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">Legal Tech</span>
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">Cloud Solutions</span>
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">AI & ML</span>
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">Case Management</span>
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">Document Automation</span>
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">Compliance</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-gray-200 py-6">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                            <div className="text-muted-foreground text-sm">
                                © {new Date().getFullYear()} Addentech. All rights reserved.
                            </div>
                            

                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
