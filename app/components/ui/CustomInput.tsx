import { Input } from "@nextui-org/react"
import { ReactNode } from "react"

interface customInputProps {
    label?: string
    isRequired?: boolean
    isClearable?: boolean
    name?: string
    placeholder?: string
    type?: string
    labelPlacement?: string |any
    defaultValue?: string
    endContent?: string | any
    onChange?:ReactNode | any
    className?: string
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
                variant="bordered"
                endContent={endContent}
                defaultValue={defaultValue}
                label={label}
                isRequired={isRequired}
                isClearable={isClearable}
                name={name}
                placeholder={placeholder}
                onChange={onChange}
                type={type}
                labelPlacement={labelPlacement}
                className={className}
                classNames={{
                    label: "font-nunito text-sm !text-white",
                    input: "text-gray-400 placeholder:text-gray-400",
                    inputWrapper: "border text-gray-400 border-white/20 bg-dashboard-secondary outline-none shadow-sm hover:bg-dashboard-secondary hover:border-white/20 focus-within:border-white/20 focus-within:outline-none focus-within:shadow-none focus-within:ring-0 focus-within:ring-offset-0"
                }}
            />
        </div>
    )
}

export default CustomInput