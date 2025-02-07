
import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, TableCell, TableRow } from "@nextui-org/react";
import { ActionFunction, json, LinksFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import BackIcon from "~/components/icons/BackIcon";
import CloseIcon from "~/components/icons/CloseIcon";
import { DeleteIcon } from "~/components/icons/DeleteIcon";
import { EditIcon } from "~/components/icons/EditIcon";
import { EyeIcon } from "~/components/icons/EyeIcon";
import NotificationIcon from "~/components/icons/NotificationIcon";
import { SearchIcon } from "~/components/icons/SearchIcon";
import { FileUploader } from "~/components/icons/uploader";
import UserIcon from "~/components/icons/UserIcon";
import ConfirmModal from "~/components/modal/confirmModal";
import { ComplaintColumns } from "~/components/table/columns";
import NewCustomTable from "~/components/table/newTable";
import { errorToast, successToast } from "~/components/toast";
import CustomInput from "~/components/ui/CustomInput";
import complaintController from "~/controller/compaint";
import { ComplaintInterface } from "~/interface/interface";
import AdminLayout from "~/layout/adminLayout"
import { getSession } from "~/session";
export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" }];
};

const AnonymousReporting = () => {
    const navigate = useNavigate()
    const [content, setContent] = useState()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [coplaintId, setComplaintId] = useState('');
    const [base64Image, setBase64Image] = useState<any>();
    const [dataValue, setDataValue] = useState();
    const actionData = useActionData<any>();
    const navigation = useNavigation()
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const submit = useSubmit()
    const {
        complaint,
        totalPages
    } = useLoaderData<{
        complaint: ComplaintInterface[],
        totalPages: number
    }>()

    const ReactQuill = typeof window === "object" ? require("react-quill") : () => false
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };
    const generateRandomReference = () => {
        return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    };

    const handleConfirmModalClosed = () => {
        setIsConfirmModalOpened(false)
    }
    const handleClick = () => {
        setIsDrawerOpen(!isDrawerOpen)
        const randomRef = generateRandomReference();
        setComplaintId(randomRef);
    };



    return (
        <AdminLayout handleOnClick={handleClick}>

            <NewCustomTable
                columns={ComplaintColumns}
                loadingState={navigation.state === "loading" ? "loading" : "idle"}
                totalPages={totalPages}
                page={1}
                setPage={(page) => (
                    navigate(`?page=${page}`)
                )}>
                {complaint?.map((com: ComplaintInterface, index: number) => (
                    <TableRow key={index}>

                        <TableCell className="text-xs">{com.unique_id}</TableCell>
                        <TableCell><img className="w-10 h-10 rounded" src={com.attachment} alt="" /></TableCell>
                        <TableCell>{com.description}</TableCell>
                        <TableCell>{com.status}</TableCell>
                        <TableCell className="relative flex items-center gap-4">
                            <button className="text-primary " onClick={() => {
                                setIsViewDrawerOpen(true)
                                setDataValue(com)
                            }}>
                                <EyeIcon className="" />
                            </button>
                            <button className="text-danger" onClick={() => {
                                setIsConfirmModalOpened(true)
                                setDataValue(com)
                            }}>
                                <DeleteIcon />
                            </button>

                        </TableCell>
                    </TableRow>
                ))}
            </NewCustomTable>

            {/* Creeat memo drawer */}
            {/* Creeat memo drawer */}
            <div
                className={`w-[40vw] h-[100vh] bg-default-50 overflow-y-scroll border dark:border-white/10  fixed top-0 right-0 z-10 transition-transform duration-500 p-6 ${isDrawerOpen ? "transform-none" : "translate-x-full"}`}
            >
                <div className="flex justify-between gap-10 ">
                    <p className="font-nunito">Use this opportunity to raise anonymous complaint</p>
                    <button
                        onClick={() => {
                            setIsDrawerOpen(false);
                        }}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>
                <hr className="mt-4 border border-default-400" />

                <Form className="flex flex-col gap-6 pt-4" method="post">
                    <div className="flex flex-col">
                        <label htmlFor="" className="font-nunito">Unique Id</label>
                        <input
                            name="uniqueId"
                            className="text-sm mt-2 dark:bg-default-50 shadow-sm   border border-white/30 focus:bg-[#333]  focus focus:bg-[#333] hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full h-10 rounded-xl pl-2"
                            value={coplaintId} type="text" />
                    </div>
                    <p className="font-nunito text-danger text-xs">Keep your unique code for future edit and status check</p>
                    <div>
                        <label htmlFor="" className="font-nunito">Description</label>
                        <input type="hidden" name="description" value={content} />
                        <ReactQuill
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            className='md:!h-[20vh] mt-2 font-nunito rounded w-full mb-12 !font-nunito'
                        />
                    </div>

                    <div className="mt-6 ">
                        <label className="font-nunito block text-sm" htmlFor="">Image</label>
                        <input value={base64Image} name="attachment" type="text" hidden />
                        <div className="relative inline-block w-40 h-40 border-2 border-dashed border-gray-600 rounded-xl dark:border-white/30 mt-2">
                            <input
                                name="image"
                                required
                                placeholder=" "
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                type="file"
                                onChange={(event: any) => {
                                    const file = event.target.files[0];
                                    if (file) {
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                            setBase64Image(reader.result)
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }}
                            />
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"><FileUploader className="h-20 w-20 text-white" /></span>
                        </div>
                    </div>
                    <input name="intent" value="complain" type="hidden" />

                    <button className="w-40 font-montserrat" color="primary">Make Complaint</button>

                </Form>

            </div>

            <div
                className={`w-[20vw] h-[100vh] bg-default-50 overflow-y-scroll border dark:border-white/10  fixed top-0 right-0 z-10 transition-transform duration-500 p-6 ${isViewDrawerOpen ? "transform-none" : "translate-x-full"}`}
            >
                <div className="flex justify-between gap-10 ">
                    <p className="font-nunito">Complsaint Details</p>
                    <button
                        onClick={() => {
                            setIsViewDrawerOpen(false);
                        }}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>
                <hr className="mt-4 border border-default-400" />
                <div className="mt-6 flex justify-between">
                    <p className="font-nunito text-sm">Unique ID:</p>
                    <p className="font-nunito text-sm">{dataValue?.unique_id}</p>
                </div>
                <div className="mt-6 flex justify-between">
                    <p className="font-nunito text-sm">Status:</p>
                    <p className="font-nunito text-sm">{dataValue?.status}</p>
                </div>
                <div className="mt-6">
                    <p className="font-nunito text-sm">Complaint:</p>
                    <p className="font-nunito text-sm mt-2">{dataValue?.description}</p>
                </div>
                <div className="mt-6">
                    <p className="font-nunito text-sm">Image</p>
                    <img src={dataValue?.attachment} className="mt-2 h-40 w-full rounded-2xl" alt="" />
                </div>
            </div>


            <ConfirmModal className="dark:bg-default-50 border border-white/10" header="Confirm Delete" content="Are you sure to delete user?" isOpen={isConfirmModalOpened} onOpenChange={handleConfirmModalClosed}>
                <div className="flex gap-4">
                    <Button color="success" variant="flat" className="font-montserrat font-semibold" size="sm" onPress={handleConfirmModalClosed}>
                        No
                    </Button>
                    <Button color="danger" variant="flat" className="font-montserrat font-semibold " size="sm" onClick={() => {
                        setIsConfirmModalOpened(false)
                        if (dataValue) {
                            submit({
                                intent: "delete",
                                id: dataValue?._id
                            }, {
                                method: "post"
                            })
                        }
                    }} >
                        Yes
                    </Button>
                </div>
            </ConfirmModal>

        </AdminLayout >
    )
}

export default AnonymousReporting

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData()
    const intent = formData.get("intent") as string
    const description = formData.get("description") as string
    const base64Image = formData.get("attachment") as string
    const unique_id = formData.get("uniqueId") as string
    const id = formData.get("id") as string


    switch (intent) {
        case "complain":
            const complaint = await complaintController.createComplaint({
                description,
                base64Image,
                unique_id
            })

            return complaint

        case "delete":
            const deleteComplaint = await complaintController.DeleteComplaint({
                id
            })
            return deleteComplaint

        default:
            break;
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") as string;

    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");
    // if (!token) {
    //     return redirect("/")
    // }
    const { complaint, totalPages } = await complaintController.getComplaints({
        request,
        page,
        search_term
    });


    return json({ complaint, totalPages });
}