import React, { ReactNode } from "react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import UserIcon from "../icons/UserIcon";
import CartIcon from "../icons/CartIcon";
import FolderIcon from "../icons/FolderIcon";
interface CustomBreadCrumbsInterface {
    children?: ReactNode
}

const CustomBreadCrumbs = ({
    children
}: CustomBreadCrumbsInterface) => {
    return (
        <Breadcrumbs className="flex">
            <BreadcrumbItem><FolderIcon className="" /></BreadcrumbItem>
            {children}
        </Breadcrumbs>
    );
}

export default CustomBreadCrumbs
