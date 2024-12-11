import FileIcon from "../icons/FileIcon";

interface CustomFilePreviewInterface{
    file?:string,
    reminder?:string,
    fileName?:string,
    description?:string,
    modifiedData?:string,
    size?:string,
    catalogueName:string
    uploaderName:string
}

const CustomFilePreview = ({
    file,
    reminder,
    fileName,
    description,
    modifiedData,
    size,
    catalogueName,
    uploaderName
}:CustomFilePreviewInterface) => {
    return (
        <div className="h-[100vh] w-80 border bg-white tl-rounded-xl bl-rounded-xl p-4 flex flex-col gap-4">
            <div className="flex justify-between">
                <p className="font-montserrat font-bold">File Preview</p>
                <p></p>
            </div>
            {/* file */}
            <div className="h-80 w-full border rounded-lg">
                <img className="h-80 w-full rounded-lg" src={file} alt="" />
            </div>

            <div className="flex gap-4">
                <div className="h-10 w-10 border rounded-lg flex justify-center items-center">
                    <FileIcon className="text-primary" />
                </div>
                <div>
                    <div className="flex">
                        <p className="font-nunito text-sm">Reminder: </p>
                        <p className="font-nunito text-sm">{reminder}reminder</p>
                    </div>
                    <div>
                        <p className="font-nunito text-sm">{fileName} File Name</p>
                    </div>
                </div>
            </div>

            <hr className="border-t border-slate-400 my-1" />

            <div>
                <p className="font-montserrat font-bold text-sm">Description</p>
                <p className="font-nunito text-xs">
                   {description} Lorem ipsum dolor sit, amet consectetur adipisicing elit. Expedita repudiandae est soluta molestias voluptate, laboriosam ipsum, iure quasi numquam, laborum quibusdam sapiente officia amet reiciendis! Blanditiis optio nam porro est!
                </p>
            </div>

            <hr className="border-t border-slate-400 my-1" />

            <div className="flex flex-col gap-1">
                <p className="font-montserrat font-bold text-sm">Details</p>
                <span className="flex justify-between">
                    <p className="font-nunito text-xs">Last Modified:</p>
                    <p className="font-nunito text-xs">{modifiedData}</p>
                </span>
                <span className="flex justify-between">
                    <p className="font-nunito text-xs">Size:</p>
                    <p className="font-nunito text-xs">{size}2.4MB</p>
                </span>
                <span className="flex justify-between">
                    <p className="font-nunito text-xs">Catalogue:</p>
                    <p className="font-nunito text-xs">{catalogueName}catalogue Name</p>
                </span>
                <span className="flex justify-between">
                    <p className="font-nunito text-xs">Uploaded By:</p>
                    <p className="font-nunito text-xs">{catalogueName}Name</p>
                </span>
            </div>
        </div>
    );
}

export default CustomFilePreview;
