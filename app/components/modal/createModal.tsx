import {
  Drawer,
  DrawerContent,
  DrawerBody,
} from "@heroui/drawer";
import { ReactNode } from "react";

interface CreateModalProps {
  children: ReactNode;
  modalTitle: string;
  className?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void; // Updated to pass the current state
}

const CreateModal = ({ children, modalTitle, onOpenChange, className, isOpen }: CreateModalProps) => {
  // Handle close explicitly
  const handleClose = () => {
    onOpenChange(false); // Explicitly set the modal state to closed
  };

  return (
    <>
      <Drawer
        className="!bg-[#020817] border border-l border-l-white/30"
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleClose}
      >
        <DrawerContent >
          <DrawerBody>
            {children}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default CreateModal;

