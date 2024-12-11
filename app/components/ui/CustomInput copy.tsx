import { Input } from "@nextui-org/react";
import { ReactNode } from "react";

interface customInputProps {
    label?: string;
    isRequired?: boolean;
    isClearable?: boolean;
    name?: string;
    placeholder?: string;
    type?: string;
    labelPlacement?: string | any;
    defaultValue?: string;
    endContent?: string;
    onChange?: ReactNode | any;
    className?: string;
}

const CustomInput = ({
    label,
    isRequired,
    isClearable,
    name,
    placeholder,
    type,
    labelPlacement,
    defaultValue,
    endContent,
    onChange,
    className
}: customInputProps) => {
    return (
        <div>
            <Input
                endContent={endContent}
                defaultValue={defaultValue}
                label={label}
                isRequired={isRequired}
                isClearable={isClearable}
                name={name}
                variant="bordered"
                placeholder={placeholder}
                onChange={onChange}
                type={type}
                labelPlacement={labelPlacement}
                className={className}
                classNames={{
                    label: "font-nunito !text-gray-300",
                    inputWrapper: "shadow-sm dark:bg-slate-900 focus:bg-slate-900 border border-1 border-gray-400 text-white",
                }}
            />
        </div>
    );
};

export default CustomInput;
