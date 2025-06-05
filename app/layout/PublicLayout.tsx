import { useState, useEffect } from "react";
import { Button, Navbar, Spinner } from "@nextui-org/react";
import { Link } from "@remix-run/react";
import {
    ArrowRight,
    ExternalLink,
    Twitter,
    Linkedin,
    Facebook,
    Instagram,
    Menu,
    X,
} from "lucide-react";
import logo from "~/components/images/addentech_logo.png";
import { ThemeSwitcher } from "~/components/ThemeSwitcher";
import ScrollAnimation from "~/components/animation";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

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
            <header className={`px-4 lg:px-[125px] top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
                isScrolled 
                    ? 'fixed bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-black/10' 
                    : 'absolute'
            }`}>
              <div className="container flex h-16 items-center justify-between">
                  {/* Logo */}
                    <div className="flex  items-center">
                        <Link to="/" className="flex flex-col items-center space-x-2">
                           <img src={logo} alt="Addentech Logo" className="w-40 h-20" />

                        </Link>
                  </div>

                  {/* Desktop Navigation */}
                  <nav className="hidden md:flex gap-6">
                      {Object.entries(navigationLinks).map(([name, path]) => (
                          <Link
                    key={name}
                    to={path}
                              className={`text-sm font-medium transition-colors duration-300 ${
                                  isScrolled 
                                      ? 'text-default-500 hover:text-foreground' 
                                      : 'text-white/80 hover:text-white'
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
                          className={`transition-colors duration-300 ${
                              isScrolled 
                                  ? 'text-foreground hover:bg-default-100' 
                                  : 'text-white hover:bg-white/10'
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
                  <nav className="flex flex-col mt-4 space-y-2 md:hidden bg-black/90 backdrop-blur rounded-lg p-4">
                      {Object.entries(navigationLinks).map(([name, path]) => (
                          <Link
                              key={name}
                              to={path}
                              className="px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
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
            <section className="py-20 lg:px-20 px-4 bg-gray-100">
                <div className="container">
                    <ScrollAnimation>
                        <div className="rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 p-8 md:p-12 lg:p-16 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
                        <div className="relative z-10 max-w-3xl">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform your business with us effectively</h2>
                            <p className="text-muted-foreground mb-8 text-lg">
                                Ready to revolutionize your legal practice with cutting-edge technology? Get in touch with our team
                                today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">Contact Us <ArrowRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                    </ScrollAnimation>
                </div>
            </section>

            <footer className="border-t border-t-white-500/20  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-20 px-4">
                <div className="container py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ScrollAnimation>
                            <div className="flex flex-col gap-4">
                            <div className="flex items-center">
                                    <div className="h-8 w-8 rounded bg-pink-500 flex items-center justify-center text-white font-bold font-montserrat">
                                        A
                                </div>
                                    <span className="ml-2 text-xl font-bold text-pink-500 font-montserrat">ADDENTECH</span>
                            </div>
                            <p className="text-muted-foreground mb-4">
                                Transforming the legal landscape with innovative technology solutions.
                            </p>
                            <div className="flex gap-4">
                                {Object.entries(socialLinks).map(([social, { icon: Icon, url }]) => (
                                    <Link
                                        key={social}
                                        to={url}
                                        target="_blank" // Opens the link in a new tab
                                        rel="noopener noreferrer" // Security best practice
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <span className="sr-only">{social}</span>
                                        <div className="h-8 w-8 rounded-full border border-pink-500/40 flex items-center justify-center">
                                            <Icon className="h-4 w-4 text-pink-500" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        </ScrollAnimation>
                        <ScrollAnimation>
                            <div>
                            <h3 className="font-bold font-montserrat mb-4 ">Company</h3>
                            <ul className="space-y-2 ">
                                {Object.entries(navigationLinks).map(([item, url]) => (
                                    <li key={item}>
                                        <Link to={url} className="!text-default-400 hover:text-foreground">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        </ScrollAnimation>
                        <ScrollAnimation>
                            <div>
                            <h3 className="font-medium mb-4">Services</h3>
                            <ul className="space-y-2">
                                {[
                                    "Digital Transformation",
                                    "Software Development",
                                    "AI Solutions",
                                    "E-Discovery",
                                    "Client Portals",
                                ].map((item) => (
                                    <li key={item}>
                                        <Link to="#" className="!text-default-400 hover:text-foreground">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        </ScrollAnimation>
                        <ScrollAnimation>
                            <div>
                            <h3 className="font-medium mb-4">Legal</h3>
                            <ul className="space-y-2">
                                {["Terms", "Privacy", "Cookies", "Licenses", "Settings"].map((item) => (
                                    <li key={item}>
                                        <Link to="#" className="!text-default-400 hover:text-foreground">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        </ScrollAnimation>
                    </div>
                    <div className="border-t border-t-white/10 border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <ScrollAnimation>
                            <p className="text-sm text-muted-foreground">
                                © {new Date().getFullYear()} Addentech. All rights reserved.
                        </p>
                        </ScrollAnimation>
                        <ScrollAnimation>
                            <div className="flex gap-4 mt-4 md:mt-0">
                            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                                Privacy Policy
                            </Link>
                            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                                Terms of Service
                            </Link>
                            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                                Cookies Settings
                            </Link>
                        </div>
                        </ScrollAnimation>
                    </div>
                </div>
            </footer>
      </div>
    );
};

export default PublicLayout;
