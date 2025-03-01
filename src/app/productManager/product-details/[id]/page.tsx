"use client";

import NavBar from "@/components/navbar/navbar";
import SidebarPM from "@/components/sidebar-pm";
import type { FC } from "react";
import { BiEditAlt  } from "react-icons/bi";
import { BiDetail  } from "react-icons/bi";


const PenLineIcon: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

const FileTextIcon: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

interface TechFlowItem {
  id: string;
  description: string;
}

interface ProductDetailsProps {
  userName: string;
  email: string;
  factoryNumber: string;
  techFlowItems: TechFlowItem[];
}

const ProductDetails: FC<ProductDetailsProps> = ({
  userName,
  email,
  factoryNumber,
  techFlowItems,
}) => {
  return (
    <div className="p-6 bg-slate-100 min-h-full">
      <h1 className="text-lg font-bold text-gray-800 mb-4">Product Details</h1>

      {/* User Info Section */}
      <div className="bg-white rounded-md p-6 mb-4 shadow-sm">
        <h2 className="text-black font-medium mb-4">Hello, {userName}</h2>

        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="text-gray-600 w-48">Product Manager Email :</span>
            <span className="text-gray-800">{email}</span>
          </div>
          <div className="flex">
            <span className="text-gray-600 w-48">Product Factory Number :</span>
            <span className="text-gray-800">{factoryNumber}</span>
          </div>
        </div>
      </div>

      {/* TechFlow Items Section */}
      <div className="bg-white rounded-md p-6 shadow-sm">
        {techFlowItems.map((item, index) => (
          <div key={item.id}>
            <div className="flex justify-between items-start py-3">
              <div>
                <h3 className="font-medium text-gray-800">TechFlow</h3>
                <p className="text-sm text-gray-600">
                  description, {item.description}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="text-indigo-600 hover:text-indigo-800">
                  <BiEditAlt  className="w-7 h-7"/>
                </button>
                <button className="text-indigo-600 hover:text-indigo-800">
                  <BiDetail className="w-7 h-7"/>
                </button>
              </div>
            </div>
            {index < techFlowItems.length - 1 && (
              <div className="border-b border-gray-200"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function productManager() {
  const techFlowItems = [
    { id: "1", description: "Lorem ipsum is simply dummy text of the p" },
    { id: "2", description: "Lorem ipsum is simply dummy text of the p" },
    { id: "3", description: "Lorem ipsum is simply dummy text of the p" },
  ];

  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      <NavBar role="Product Manager" />
      <div className="flex h-[calc(100vh-4rem)]"> {/* 4rem = Navbar height */}
        <SidebarPM />
        <div className="flex-grow overflow-y-auto">
          <ProductDetails
            userName="John Doe"
            email="johndoe@abcd.com"
            factoryNumber="1"
            techFlowItems={techFlowItems}
          />
        </div>
      </div>
    </div>
  );
}

