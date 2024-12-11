//   // Function to generate receipt content
//   const generateReceiptContent = () => {
//     let receipt = `
//         <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; }
//                     .receipt-container { padding: 20px; }
//                     .receipt-header, .receipt-footer { text-align: center; }
//                     .receipt-items { margin-top: 20px; }
//                     .item { display: flex; justify-content: space-between; }
//                     .total { font-weight: bold; margin-top: 20px; }
//                 </style>
//             </head>
//             <body>
//                 <div class="receipt-container">
//                     <div class="receipt-header">
//                         <h2>Receipt</h2>
//                         <p>Thank you for your purchase!</p>
//                     </div>
//                     <div class="receipt-items">
//     `;

import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import { ReactNode } from "react";

//     // carts.forEach((cart) => {
//     //     receipt += `
//     //         <div class="item">
//     //             <span>${cart.product.name}</span>
//     //             <span>${cart.quantity} x ${cart.price} = Ghc ${cart.quantity * cart.price}</span>
//     //         </div>
//     //     `;
//     // });

//     receipt += `
//             </div>
//             <div class="total">
//                 <div class="item">
//                     <span>Total Quantity</span>
//                     <span>${totalQuantity}</span>
//                 </div>
//                 <div class="item">
//                     <span>Total Amount</span>
//                     <span>Ghc ${totalPrice}</span>
//                 </div>
//                 <div class="item">
//                     <span>Amount Paid</span>
//                     <span>Ghc ${amountPaid}</span>
//                 </div>
//                 <div class="item">
//                     <span>Balance</span>
//                     <span>Ghc ${balance}</span>
//                 </div>
//             </div>
//             <div class="receipt-footer">
//                 <p>Attendant: ${user.name}</p>
//                 <p>Date: ${new Date().toLocaleString()}</p>
//             </div>
//         </div>
//         </body>
//     </html>
//     `;

//     return receipt;
// };

interface ReceiptModalProps {
    children: ReactNode;
    className?: string;
    isOpen: boolean;
    onOpenChange: () => void;
}

const generateReceiptContent = ({ children, className, isOpen, onOpenChange }: ReceiptModalProps) => {

        <Modal className="p-20"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="top"
        >
            <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1"></ModalHeader>
              <ModalBody>
                {children}
              </ModalBody>
            </>
          )}
        </ModalContent>
        </Modal>
    
}

