import { Skeleton } from "@nextui-org/react"
import { ReactNode, useEffect, useState } from "react"
import FileIcon from "../icons/FileIcon"
import DotsIcon from "../icons/DotIcons"

interface CustomFileCardInterface {
    children?: ReactNode,
    className?: string,
    title?: string
    image?:string
    header?:string
    description?: string
}

const CustomFileCard = ({
    children,
    className,
    title,
    image,
    header,
    description

}: CustomFileCardInterface) => {
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true)
        }, 1000)
        return () => clearTimeout(timer)
    }, [])
    return (
        <Skeleton className="rounded-2xl w-80" isLoaded={loading}>
            <div className="flex justify-between items-center p-2 shadow-sm rounded-2xl border bg-white ">
                <div className="flex gap-4">
                    <div className=" h-12 w-12 rounded-lg bg-slate-200 p-1 flex items-center center justify-center">
                        <FileIcon className="text-primary " />
                    </div>
                    <div className="">
                        <p>{header}</p>
                        <p>{description}</p>
                    </div>
                </div>
                <div>
                    <p><DotsIcon className="" /></p>
                </div>
            </div>
        </Skeleton>
    )
}

export default CustomFileCard