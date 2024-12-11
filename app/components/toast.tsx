import toast from "react-hot-toast";
import CheckedIcon from "./icons/CheckedIcon";
import ErrorIcon from "./icons/ErrorIcon";

export const errorToast = (message: string) => {
    return toast(
        (t) => (
            <div className="flex flex-col gap-2 ">
                <div className="flex gap-2">
                    <ErrorIcon className=" text-2xl text-danger" />
                    <span className="font-poppins text-slate-800">{message}</span>
                </div>
            </div>
        ),
        {
            id: "error-toast",
            className: "border-b-[6px] border-red-500 rounded-2xl",
        }
    );
};
export const successToast = (message: string) => {
    return toast(() => (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                <CheckedIcon className=" text-2xl text-primary" />
                <span className="font-poppins text-slate-800">{message}</span>
            </div>
        </div>
    ),
        {
            className: "border-b-[6px] border-primary rounded-2xl",
        }
    );
};