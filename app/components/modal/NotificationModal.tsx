import React, { ReactNode } from 'react';

interface NotificationProps {
    isOpen: boolean;
    onOpenChange: () => void;
    children:ReactNode
}

const NotificationModal = ({ isOpen, onOpenChange,children}: NotificationProps) => {
    return (
        <div 
            className={`absolute inset-0 flex items-center justify-end transition-all duration-300 ease-in-out ${isOpen ? ' ' : 'opacity-0 pointer-events-none'}`}
            aria-hidden={!isOpen}
        >
            <div className={`bg-slate-800 w-60 h-full relative transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <button 
                    onClick={onOpenChange} 
                    className="absolute top-4 right-4 text-white">
                    Close
                </button>
                {/* Modal content goes here */}
                {children}
            </div>
        </div>
    );
};

export default NotificationModal;
