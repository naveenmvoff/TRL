import React, { useEffect } from "react";

interface ExpandProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function Expand({
  title,
  subtitle,
  children,
  onClose,
}: ExpandProps) {
  // Add cleanup on unmount
  useEffect(() => {
    // Prevent background scrolling when popup is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="w-full">
      <div className="bg-slate-100 rounded-lg w-full p-6 shadow-xl">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="rounded-full bg-gray-200 p-1.5 hover:bg-gray-300 transition-colors "
            aria-label="Close panel"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-600"
            >
              <path 
                d="M6 18L18 6M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </button>
        </div>
        
        <div className="bg-white rounded border border-gray-200 p-1 max-h-[calc(100vh-12rem)] overflow-y-auto text-justify">
          {children}
        </div>
      </div>
    </div>
  );
}
