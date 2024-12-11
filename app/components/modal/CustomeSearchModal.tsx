import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@nextui-org/react";
import { ReactNode } from "react";
import React from "react";

interface SearchModalProps {
    className: string;
    isOpen: boolean;
    onOpenChange: () => void;
    children: ReactNode;
}
export default function SearchModal({
    isOpen,
    onOpenChange,
    children,
    className,
}: SearchModalProps) {
    return (
        <>
            <Modal
                className="dark:backdrop-blur dark:bg-slate-900/70 dark:bg-opacity-60 backdrop-blur border border-white/5 lg:h-[70vh] lg:w-[40vw] "
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="center"
                backdrop="blur"
                size="xl"
            >
                <ModalContent className="pb-4">
                    {(onClose) => (
                        <>
                            <div className={className}>{children}</div>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
