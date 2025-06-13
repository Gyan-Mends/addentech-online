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
                    inputWrapper: "border !text-white border-white/20  hover:border-b-pink-500 hover:transition-all hover:duration-300 hover:ease-in-out  bg-dashboard-secondary shadow-sm"
                }}
            />
        </div>
    )
}

export default CustomInput