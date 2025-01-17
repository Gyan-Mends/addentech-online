
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";
import { ReactNode } from "react";

interface DeleteModalProps{
  header:ReactNode,
    content:ReactNode,
    className:string,
    isOpen: boolean,
    onOpenChange: () => void,
    children:ReactNode
}
export default function ConfirmModal({isOpen,onOpenChange,children,content,header,className}: DeleteModalProps) {

  return (
    <>
      <Modal className={className} isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="dark:bg-default-100">
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center justify-center gap-1 font-montserrat font-semibold text-2xl text-danger">{header}</ModalHeader>
              <ModalBody className="flex items-center justify-center">
                <p className="font-nunito text-md">{content}</p>
              </ModalBody>
              <ModalFooter className="flex items-center justify-center ">
                {children}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
