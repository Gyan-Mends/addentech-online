import { Button } from "@nextui-org/react";
import { useNavigate, useLocation } from "@remix-run/react";
import { ReactNode, useEffect, useState } from "react";
import LoaderIcon from "~/components/icons/LoaderIcon";
import OfflineIcon from "~/components/icons/OfflineIcon";

// Define the props type for Offline component
interface OfflineProps {
    children: ReactNode;
    className?: string;
    redirectTo?: string; // Add optional prop for redirect path
}

const Offline = ({ children, className , redirectTo }:OfflineProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOnline, setIsOnline] = useState(true);
    const [isRefresh, setIsRefresh] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleNetworkChange = () => {
                setIsOnline(navigator.onLine);
            };

            // Initial network status
            setIsOnline(navigator.onLine);

            window.addEventListener("online", handleNetworkChange);
            window.addEventListener("offline", handleNetworkChange);

            return () => {
                window.removeEventListener("online", handleNetworkChange);
                window.removeEventListener("offline", handleNetworkChange);
            };
        }
    }, []);

    useEffect(() => {
        if (isOnline && redirectTo && location.pathname === "/") {
            // Redirect to the specified path after a delay
            const timer = setTimeout(() => {
                navigate(redirectTo);
            }, 3500); // Adjust the delay as needed

            return () => clearTimeout(timer); // Cleanup timeout
        } else {
            console.log("Network is offline. Waiting for reconnection...");
        }
    }, [isOnline, navigate, redirectTo, location.pathname]);

    // Function to refresh the page
    const handleRefresh = () => {
        setIsRefresh(true); // Set refresh to true immediately
        setTimeout(() => {
            window.location.reload();
        }, 2000); // Adjust the delay as needed
    };

    return (
        <div className={className}>
            {isOnline ? (
                <>{children}</>
            ) : (
                <div className="w-full h-full flex flex-col gap-4 items-center justify-center bg-slate-900 text-white">
                    <div>
                        <p className="text-white">
                            <OfflineIcon className="h-10 w-10 text-white" />
                        </p>
                    </div>
                    <p className="mb-4 font-nunito font-semibold">
                        You are currently offline. Please check your internet connection.
                    </p>
                    <Button
                        color="primary"
                        onClick={handleRefresh}
                        className="border-l-4 shadow-sm border-white font-montserrat font-semibold rounded-l-2xl text-white py-2 px-4 bg-blue-500 hover:bg-blue-700">
                        Refresh Page
                    </Button>
                    {isRefresh && (
                        <div>
                            <LoaderIcon className="text-white w-10 h-10" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Offline;
