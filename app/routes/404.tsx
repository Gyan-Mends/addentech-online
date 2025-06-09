import { useEffect } from "react";
import { Home, Search } from "lucide-react";
import { Link, useLocation } from "@remix-run/react";
import ScrollAnimation from "~/components/animation";
import { Button } from "@nextui-org/react";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error(
            "404 Error: User attempted to access non-existent route:",
            location.pathname
        );
    }, [location.pathname]);

    return (
        <div className="min-h-screen font-nunito flex flex-col items-center justify-center  px-6 text-center">
            <div className="space-y-10 max-w-lg">
                {/* Animated 404 number */}
                <ScrollAnimation>
                    <h1 className="text-9xl lg:-mt-20 font-extrabold tracking-tighter animate-pulse bg-clip-text ">
                        404
                    </h1>

                </ScrollAnimation>
                {/* Illustration */}
                <ScrollAnimation>
                    <div className="relative">
                        <div className="w-24 h-24 mx-auto rounded-full  flex items-center justify-center border-4 border-primary/20 shadow-lg">
                            <Search className="w-12 h-12 text-pink-500/70 animate-spin" />
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-primary/30 to-transparent"></div>
                    </div>
                </ScrollAnimation>

                {/* Message */}
                <ScrollAnimation>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-pink-500">Page Not Found</h2>
                        <p className="text-muted-foreground text-lg">
                            Oops! The page you're looking for seems to have wandered off into the digital void.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            You tried to access:{" "}
                            <span className="font-mono  px-2 py-1 rounded">
                                {location.pathname}
                            </span>
                        </p>
                    </div>
                </ScrollAnimation>

                {/* Actions */}
                <ScrollAnimation>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/" className="flex">
                            <Button
                                size="lg"
                                className="gap-2 flex items-center bg-pink-500 rounded-lg text-white justify-center w-full sm:w-auto"
                            >
                                <Home className="w-5 h-5" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </ScrollAnimation>
                <p className="text-muted-foreground mt-12 text-sm">
                    If you believe this is an error, please contact{" "}
                    <a href="mailto:support@example.com" className="text-primary hover:underline">
                        support
                    </a>.
                </p>
            </div>

            {/* Bottom message */}

        </div>
    );
};

export default NotFound;
