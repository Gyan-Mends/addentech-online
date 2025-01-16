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
    endContent?: string
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
                    label: "font-nunito text-sm text-default-100",
                    inputWrapper: "bg-white shadow-sm dark:bg-[#333]  border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-success hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-sm"
                }}
            />
        </div>
    )
}

export default CustomInput