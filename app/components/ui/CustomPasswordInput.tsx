import { Input } from "@nextui-org/react";
import React, { useState } from "react";
import { EyeIcon } from "../icons/EyeIcon";
import { EyeFilledIcon } from "../icons/EyeSlash";


interface CustomPasswordInterface{
    className?: string
    name?: string
    isRequired?:boolean,
    label?: string,
    placeholder?:string,
    
}

const CustomPasswordInput = ({
    className,
    name,
    isRequired,
    label,
    placeholder
}: CustomPasswordInterface) => {
    const [isVisible, setIsVisible] = useState(false);
    const handleVisibility = (event: any) => {
        event.preventDefault();
        setIsVisible(!isVisible);
    }

    return (
        <div>
            <Input
                name={name}
                isRequired= {isRequired}
                label={label}
                labelPlacement="outside"
                type={isVisible ? "text" : "password"}
                className={className}
                placeholder={placeholder}
                classNames={{
                    label: "font-nunito text-sm",
                    inputWrapper: `hover:border-primary text-sm font-nunito border-b-2  max-w-sm bg-white hover:bg-white dark:bg-slate-900 dark:border-white/5`
                }}

                endContent={
                    <button
                        className="focus:outline-none"
                        onClick={handleVisibility}
                    >
                        {isVisible ? (
                            <EyeIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                    </button>
                }
            />
        </div>
    )
}

export default CustomPasswordInput