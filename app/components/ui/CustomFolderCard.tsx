import { Skeleton } from "@nextui-org/react"
import { ReactNode, useEffect, useState } from "react"
import FolderIcon from "../icons/FolderIcon"

interface CustomFolderCardInterface {
    children?: ReactNode,
    className?: string,
    title?: string
    image?: string
    header?: string
    description?: string
}

const CustomFolderCard = ({
    children,
    className,
    title,
    image,
    header,
    description

}: CustomFolderCardInterface) => {
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true)
        }, 1000)
        return () => clearTimeout(timer)
    }, [])
    return (
        <Skeleton className="rounded-2xl w-40" isLoaded={loading}>
            <div className={className}>
                <div className="  p-1">
                   <FolderIcon className="" />
                </div>
                <div className="">
                    <p className="font-poppins">Header</p>
                    <p className="font-nunito">description</p>
                </div>

            </div>
        </Skeleton>
    )
}

export default CustomFolderCard