import React, { ReactNode } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";

interface EditModalProps {
    children: ReactNode;
    modalTitle: string;
    className?: string;
    isOpen: boolean;
    onOpenChange: () => void;
}

export default function ViewModal({ children, modalTitle, className, isOpen, onOpenChange }: EditModalProps) {
    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="center"
            >
                <ModalContent className={className}>
                    <>
                        <ModalHeader className="flex flex-col gap-1">{modalTitle}</ModalHeader>
                        <ModalBody>
                            {children}
                        </ModalBody>
                    </>
                </ModalContent>
            </Modal>
        </>
    );
}
