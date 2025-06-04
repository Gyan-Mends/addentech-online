import { Divider } from "@nextui-org/react"

const Drawer = ({
    isDrawerOpened,
    handleDrawerClosed,
    title,
    children
}: {
    isDrawerOpened: boolean,
    handleDrawerClosed: () => void,
    title: string,
    children: React.ReactNode
}) => {
    return (
        <>
            {/* Mobile backdrop */}
            {isDrawerOpened && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={handleDrawerClosed}
                />
            )}
            
            <div className={`overflow-scroll fixed top-0 right-0 z-50 h-full bg-white shadow-lg transition-transform transform ${isDrawerOpened ? "translate-x-0" : "translate-x-full"
                } w-full sm:w-[80vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw] border-l border-l-black/10`}>
               <div className="flex justify-between p-4">
                        <p className="font-montserrat text-lg font-semibold">{title}</p>
                        <button
                            className="text-gray-600 hover:text-gray-900 focus:outline-none"
                            onClick={() => handleDrawerClosed()}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-6 w-6"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <Divider className="mt-0.5" />
                {children}
            </div>
        </>
    )
}

export default Drawer
