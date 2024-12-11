import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { ReactNode, Children } from "react";
import { ChevronDownIcon } from "../icons/ArrowDown";

interface CustomDropDownInterface {
    children?: ReactNode | any;
    name?: string;
}

const CustomDropDown = ({
    children,
    name,
}: CustomDropDownInterface) => {
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button
                    className="font-montserrat font-bold"
                    color="primary"
                >
                    <ChevronDownIcon /> {name}
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
                {Children?.map(children, (child) => (
                    <DropdownItem className="font-nunito">
                        {child}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
};

export default CustomDropDown;
