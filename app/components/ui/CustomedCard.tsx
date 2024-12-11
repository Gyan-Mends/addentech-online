import { ReactNode } from "react";
import ProductIcon from "../icons/ProductsIcon";

type Prop = {
    title?: string;
    total?: number;
    icon?: ReactNode
};

const CustomedCard = ({ title, total, icon }: Prop) => {
    return (
        <div className="rounded-2xl transition-all duration-200 dark:bg-[#333] border border-white/5 shadow-md  dark:border-white/5 py-2 px-4 flex flex-col gap-2">
            <div className="flex">
                <p className="font-nunito text-white">{title}</p>
                <p className="font-nunito text-white"></p>
            </div>
            <div className="flex gap-2 items-center">
                {icon}
                <p className="font-nunito font-semibold text-md text-white">{total}</p>
            </div>
        </div>
    );
};

export default CustomedCard;
