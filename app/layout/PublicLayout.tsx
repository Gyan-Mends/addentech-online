import { Button, Navbar } from "@nextui-org/react"
import { Link } from "@remix-run/react"

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            {/* <Navbar /> */}
            <header className="px-4 lg:px-[125px] sticky top-0 z-40 w-full border-b border-blue-500/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold font-montserrat">
                                    D
                                </div>
                                <span className="ml-2 text-xl font-bold text-blue-500 font-montserrat">DENNISLAW</span>
                            </div>
                        </Link>
                        <nav className="hidden md:flex gap-6 ml-10">
                            <Link
                                to="/"
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Home
                            </Link>
                            <Link
                                to="/services"
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Services
                            </Link>
                            <Link
                                to="/team"
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Team
                            </Link>
                            <Link
                                to="/about"
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                About
                            </Link>
                            <Link
                                to="/blog"
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Blog
                            </Link>
                            <Link
                                to="#blog"
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Pricing
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="hidden md:flex">
                            Log in
                        </Button>
                        <Link to="/contact">
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                                Contact Us
                            </Button></Link>
                    </div>
                </div>
            </header>

            <div className="flex min-h-screen flex-col">
                {children}
            </div>

            {/* CTA Section */}
            <section className="py-20 lg:px-20 bg-black">
                <div className="container">
                    <div className="rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 p-8 md:p-12 lg:p-16 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
                        <div className="relative z-10 max-w-3xl">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform your business with us effectively</h2>
                            <p className="text-muted-foreground mb-8 text-lg">
                                Ready to revolutionize your legal practice with cutting-edge technology? Get in touch with our team
                                today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">Contact Sales</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="border-t border-t-white/10  font-nunito border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-20">
                <div className="container py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <div className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
                                DennisLaw
                            </div>
                            <p className="text-muted-foreground mb-4">
                                Transforming the legal landscape with innovative technology solutions.
                            </p>
                            <div className="flex gap-4">
                                {["twitter", "linkedin", "facebook", "instagram"].map((social) => (
                                    <Link key={social} to="#" className="text-muted-foreground hover:text-foreground">
                                        <span className="sr-only">{social}</span>
                                        <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center">
                                            {/* <ExternalLink className="h-4 w-4" /> */}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold font-montserrat mb-4 ">Company</h3>
                            <ul className="space-y-2 ">
                                {["About", "Careers", "Press", "News", "Contact"].map((item) => (
                                    <li key={item} >
                                        <Link to="#" className="!text-blue-200 hover:text-foreground">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
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
                                        <Link to="#" className="!text-blue-200 hover:text-foreground">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium mb-4">Legal</h3>
                            <ul className="space-y-2">
                                {["Terms", "Privacy", "Cookies", "Licenses", "Settings"].map((item) => (
                                    <li key={item}>
                                        <Link to="#" className="!text-blue-200 hover:text-foreground">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-t-white/10 border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} DennisLaw. All rights reserved.
                        </p>
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
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default PublicLayout