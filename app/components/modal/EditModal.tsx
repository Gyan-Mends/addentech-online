import React, { ReactNode } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";

interface EditModalProps {
  children: (onClose: () => void) => ReactNode;
  modalTitle: string;
  className?:string;
  isOpen: boolean;
  onOpenChange: () => void;
}

export default function EditModal({ children, modalTitle,  className, isOpen, onOpenChange }: EditModalProps) {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        className={className}
      >
        <ModalContent className=" dark:bg-[#333]">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{modalTitle}</ModalHeader>
              <ModalBody>
                {children(onClose)}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
