import React, { ReactNode } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Button } from "@nextui-org/react";

interface CreateModalProps {
  children: (onClose: () => void) => ReactNode;
  modalTitle: string;
  className?:string;
  isOpen: boolean,
  onOpenChange: () => void
}

export default function CreateModal({ children, modalTitle,onOpenChange,className, isOpen }: CreateModalProps) {
    
  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        className={className}
      >
        <ModalContent className="dark:bg-[#333]">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 font-nunito">{modalTitle}</ModalHeader>
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
