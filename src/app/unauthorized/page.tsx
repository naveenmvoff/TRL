// AccessDenied.tsx
import React from 'react';
import Link from 'next/link';

const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E5E7F3] to-white p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-[#4F46E5] p-4">
          <div className="flex justify-center">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8m5 4h2a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2h2m9-4v2m0 0v2m0-2h2m-2 0h-2m-4-6h.01M12 6a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
          </div>
        </div>
        
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <div className="w-16 h-1 bg-[#3E32FF] mx-auto my-4 rounded"></div>
            <p className="text-gray-600 mb-6">
              You are unable to access this page. Please contact the administrator.
            </p>
            
            <div className="flex flex-col space-y-3">
              {/* <button className="bg-[#4F46E5] hover:bg-[#3E32FF] text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#3E32FF] focus:ring-opacity-50">
               
              </button> */}
              
              <Link href="/" className="bg-[#4F46E5] hover:bg-[#3E32FF] text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#3E32FF] focus:ring-opacity-50">
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-[#E5E7F3] p-4 text-center text-sm text-gray-600">
          If you believe this is an error, please contact support.
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;