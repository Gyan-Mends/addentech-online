import React from "react";
import MoonIcon from "../icons/MoonIcon"; // Adjust the import path as necessary
import MorningIcon from "../icons/MorningIcon";
import SunIcon from "../icons/SunIcon";

export function getGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (hour < 12) {
        return (
            <div className="lg:grid lg:grid-cols-2 flex items-center justify-center">
                <div>
                    <p className=" font-nunito">{currentTime}</p>
                    <p className="mt-4">
                        Good Morning
                    </p>
                </div>
                <div>
                    <MorningIcon className="h-40 w-full opacity-20" />
                </div>
            </div>
        );
    } else if (hour < 18) {
        return (
            <div className="lg:grid lg:grid-cols-2 flex items-center justify-center">
                <div>
                    <p className=" font-nunito">{currentTime}</p>
                    <p className="mt-4">
                        Good Afternoon
                    </p>
                </div>
                <div>
                    <SunIcon className="h-40 w-40 opacity-20" />
                </div>
            </div>
        );
    } else {
        return (
            <div className=" flex items-center justify-between gap-4">
                <div>
                    <p className=" font-nunito">{currentTime}</p>
                    <p className="mt-4">
                        Good Evening
                    </p>
                </div>
                <div className="">
                    <MoonIcon className="h-20 w-20 opacity-20" />
                </div>
            </div>
        );
    }
}
