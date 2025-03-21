"use client"; // This is required at the top for client components in Next.js App Router

import React, { useState, useEffect, useCallback } from "react";
// import { Pencil } from "lucide-react";
import {
  IoArrowBackCircle,
  // IoChevronForwardCircle,
  // IoChevronBackCircle,
} from "react-icons/io5";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar-pm";
import Expand from "@/components/expand"; // Add this import
import Select, { StylesConfig } from 'react-select';

import { useParams, useRouter } from "next/navigation";
import { ObjectId } from "mongoose";
// import { connect } from "http2";
// import { NextRequest, NextResponse } from "next/server";
// import TrlLevelData from "@/models/trlLevelData";
import SwitchTrl from "@/components/switch-trl";

interface ProductDetails {
  createdAt: ObjectId;
  product: string;
  productManagerID: ObjectId;
  productViewer: ObjectId[];
  description: string;
  problemStatement: string;
  solutionExpected: string;
}

interface LevelDetail {
  _id: string;
  subLevelId: string;
  status: string;
  description?: string;
  documentationLink?: string;
  otherNotes?: string;
  demoRequired?: boolean;
  demoStatus?: string;
  startDate?: string;
  estimatedDate?: string;
  extendedDate?: string;
  dateCreated?: string;
  subLevelName?: string;
  currentUpdate?: string;
}

interface TrlDetail {
  _id: string;
  productID: string;
  TrlLevel: string;
  levelCount: number;
  status: string;
  levelDetails: LevelDetail[];
  startDate?: string;
  estimatedDate?: string;
  extendedDate?: string;
  dateCreated?: string;
}

interface TrlMasterData {
  _id: string;
  trlLevelName: string;
  description: string;
  subLevels: {
    subLevelName: string;
    subLevelNumber: number;
    _id: string;
  }[];
}

// Define interface for Select option
interface SelectOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}

// interface ApiResponse<T> {
//   success: boolean;
//   data: T;
//   error?: string;
// }

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
    <h1 className="mt-4 text-lg font-semibold text-indigo-600">Loading...</h1>
  </div>
);

// Helper functions
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const calculateOverallStatus = (levelDetails: LevelDetail[]): string => {
  if (!levelDetails || levelDetails.length === 0) return "Pending";

  const hasCompleted = levelDetails.some(
    (detail) => detail.status === "Completed"
  );
  const hasInProgress = levelDetails.some(
    (detail) => detail.status === "In Progress"
  );
  const allCompleted = levelDetails.every(
    (detail) => detail.status === "Completed"
  );

  if (allCompleted) return "Completed";
  if (hasInProgress || hasCompleted) return "In Progress";
  return "Pending";
};

// Used in the UI to set background colors for status badges
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'delayed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [_trlMasterData, setTrlMasterData] = useState<TrlMasterData[]>([]);
  const [trlDetails, setTrlDetails] = useState<TrlDetail[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);

  useEffect(() => {
    // Add overflow hidden to prevent page scrollbar
    document.body.style.overflow = 'hidden';
    
    // Clean up on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const completedItems = trlDetails.filter(
    (item) => item.status === "Completed"
  ).length;
  const progressPercentage = Math.round(
    (completedItems / trlDetails.length) * 100
  );

  const [productDetails, setProductDetails] = useState<ProductDetails | null>(
    null
  );

  const [selectedSection, setSelectedSection] = useState<{
    title: string;
    content?: string;
    icon: React.ReactNode;
  } | null>(null);

  const [isAnyPopupOpen, setIsAnyPopupOpen] = useState(false);

  console.log("Product ID: ", productId);

  const fetchTrlMasterData = useCallback(async () => {
    console.log("Inside TRL Master Data - PM");

    try {
      const response = await fetch("/api/trl");
      console.log("ItrlMD - Got responce");
      if (response.ok) {
        const data = await response.json();
        setTrlMasterData(
          data.data.map((item: TrlMasterData) => ({
            _id: item._id,
            trlLevelName: item.trlLevelName,
            description: item.description,
            subLevels: item.subLevels,
          }))
        );
      } else {
        console.error("Failed to fetch TRL master data");
      }
    } catch (error) {
      console.error("Error fetching TRL master data:", error);
    }
  }, []);

  const fetchProductDetails = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      console.log("Product ID in Request: ", productId);
      const response = await fetch(
        `/api/product-manager/product?id=${productId}`
      );
      console.log("ProductDetails - Got responce", response);
      const data = await response.json();
      console.log("ProductDetails : ", data);
      setProductDetails(data);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  }, [productId]);

  const fetchTrlDetails = useCallback(async () => {
    if (!productId) return;
    console.log("Inside fetchTrlDetails");

    try {
      // Get TRL master data first
      await fetchTrlMasterData();

      // Now fetch the TRL details for this product
      const response = await fetch(`/api/trl/${productId}`);
      console.log("ITRLDT - Got response");
      
      if (response.ok) {
        const responseData = await response.json();
        console.log("TRLDT - Got data");
        console.log(responseData);

        if (responseData.success && responseData.data) {
          const trlDetailsResponse: TrlDetail[] = responseData.data;
          
          // If no TRL details exist for this product, create default ones
          if (trlDetailsResponse.length === 0) {
            console.log("No TRL details found, creating defaults");
            // Return early as nothing else to process
            setIsLoading(false);
            return;
          }

          // Process the TRL details to create a complete dataset
          // Here we're adding masterId to identify each TRL level for easy reference
          const combinedData = _trlMasterData.map((masterItem: TrlMasterData) => {
            // Find the matching TRL detail for this master item
            const matchingDetail = trlDetailsResponse.find(
              (detail) => detail.TrlLevel === masterItem.trlLevelName
            );

            // If we found a matching detail, use it, otherwise create default values
            const levelDetails = matchingDetail?.levelDetails || [];

            // Get the first and last sublevel details for dates
            const firstSubLevelDetails = levelDetails[0];
            const lastSubLevelDetails = levelDetails[levelDetails.length - 1];

            // Calculate the overall status based on level details
            const status = calculateOverallStatus(levelDetails);

            return {
              _id: masterItem._id,
              productID: productId,
              TrlLevel: masterItem.trlLevelName,
              levelCount: masterItem.subLevels?.length || 0,
              status: status,
              levelDetails: levelDetails,
              startDate: firstSubLevelDetails?.startDate || "",
              estimatedDate: lastSubLevelDetails?.estimatedDate || "",
              extendedDate: lastSubLevelDetails?.extendedDate || "",
              dateCreated: firstSubLevelDetails?.dateCreated || "",
            };
          });

          setTrlDetails(combinedData);
          setIsLoading(false);
        }
      } else {
        console.error("Failed to fetch TRL details");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching TRL details:", error);
      setIsLoading(false);
    }
  }, [productId, fetchTrlMasterData, _trlMasterData]);

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const savedIds = localStorage.getItem("dashboardProductIds");
        if (savedIds) {
          setProductIds(JSON.parse(savedIds));
        }

        await Promise.all([
          fetchTrlMasterData(),
          fetchProductDetails(),
          fetchTrlDetails(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, fetchProductDetails, fetchTrlDetails, fetchTrlMasterData]);

  const handleTRLClick = (
    productId: string,
    trlId: string,
    levelName: string,
    levelNumber: number,
    subLevels: LevelDetail[]
  ) => {
    router.push(
      `/productManager/product-details/${productId}/${trlId}?name=${encodeURIComponent(
        levelName
      )}&level=${levelNumber}&subLevels=${encodeURIComponent(
        JSON.stringify(subLevels)
      )}`
    );
  };

  const handleSectionClick = (section: {
    title: string;
    content?: string;
    icon: React.ReactNode;
  }) => {
    if (!isAnyPopupOpen) {
      setSelectedSection(section);
      setIsAnyPopupOpen(true);
    }
  };

  const handleExpandClose = () => {
    setSelectedSection(null);
    setIsAnyPopupOpen(false);
  };

  const handleIndexChange = (index: number, newProductId: string) => {
    router.push(`/productManager/product-details/${newProductId}`);
  };

  // Define TRL level select styles using the proper StylesConfig type from react-select
  const trlSelectStyles: StylesConfig<SelectOption, false> = {
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: "white",
      width: "inherit",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    control: (base) => ({
      ...base,
      background: "white",
      borderColor: "#e2e8f0",
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#5D4FEF"
        : state.isDisabled
        ? "#f3f4f6"
        : "white",
      color: state.isSelected
        ? "white"
        : state.isDisabled
        ? "#9ca3af"
        : "black",
      cursor: state.isDisabled
        ? "not-allowed"
        : "pointer",
      "&:hover": {
        backgroundColor: state.isSelected
          ? "#5D4FEF"
          : state.isDisabled
          ? "#f3f4f6"
          : "#deebff",
        color: state.isSelected
          ? "white"
          : state.isDisabled
          ? "#9ca3af"
          : "black",
      },
    }),
  };

  const handleTrlChange = (option: SelectOption | null) => {
    if (!option) return;
    
    const selectedTrlId = option.value;
    console.log("Selected TRL:", selectedTrlId);
    
    // Navigate to the details page for this specific TRL
    router.push(`/productManager/product-details/${productId}/${selectedTrlId}`);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-white">
        <NavBar role="Product Manager" />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <Sidebar />
          <div className="flex-grow overflow-hidden">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <NavBar role="Product Manager" />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar />
        <div className="flex-grow overflow-y-auto bg-secondary">
          <main className="p-6">
            <div className="flex flex-row items-center justify-between space-x-4 mb-4">
              <div className="flex items-center gap-2">
              
                <IoArrowBackCircle
                
                onClick={() => router.push(`/productManager/dashboard`)}
                  className="text-gray-600 hover:text-gray-700 hover:cursor-pointer transition-colors"
                  size={35}
                />


                <div className="flex items-center bg-gray-600 px-4 py-2 rounded-full font-bold">
                  <h1
                    className="text-gray-200 hover:cursor-pointer transition-all"
                    onClick={() => router.push(`/productManager/dashboard`)}
                  >
                    Home
                  </h1>
                  <MdOutlineArrowForwardIos size={20} />
                  <h1 className="text-white hover:cursor-context-menu">
                    TRL Level
                  </h1>
                </div>
              </div>

              <SwitchTrl
                productIds={productIds}
                onIndexChange={handleIndexChange}
              />
            </div>

            <h2 className="text-xl font-semibold text-primary mb-1">
              {productDetails?.product || "No Product Name"}
            </h2>
            <div className="flex flex-row bg-white border rounded-lg p-6 shadow-md items-center gap-8 mb-4">
              
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
              
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#E5E7EB"
                      strokeWidth="10"
                      fill="none"
                    />
                
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#4F46E5"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray="282.74"
                      strokeDashoffset={
                        282.74 - (progressPercentage / 100) * 282.74
                      }
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-500 ease-in-out"
                    />
                  </svg>
              
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">
                      {progressPercentage}%
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Completed
                    </span>
                  </div>
                </div>
              </div>

             
              <div className="flex flex-row justify-between flex-grow gap-4">
                {[
                  {
                    title: "Description",
                    content: productDetails?.description,
                    icon: (
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                    ),
                  },
                  {
                    title: "Problem Statement",
                    content: productDetails?.problemStatement,
                    icon: (
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    ),
                  },
                  {
                    title: "Solution Expected",
                    content: productDetails?.solutionExpected,
                    icon: (
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        ></path>
                      </svg>
                    ),
                  },
                ].map((section, index) => (
                  <div
                    key={index}
                    className={`group flex flex-col flex-1 p-4 rounded-lg border border-gray-200 bg-gray-50 transition-all hover:bg-white hover:shadow-lg ${
                      isAnyPopupOpen
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }`}
                    onClick={() => handleSectionClick(section)}
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-1 rounded-md bg-indigo-100 mr-2">
                        {section.icon}
                      </div>
                      <h3 className="text-base font-semibold text-gray-800">
                        {section.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
                      {section.content || "Not specified"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* TRL Level Select Dropdown */}
            <div className="mb-6 w-full md:w-1/3">
              <label
                htmlFor="trl-level"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                TRL Level
              </label>
              <Select
                id="trl-level"
                instanceId="trl-level-select"
                value={
                  trlDetails.length > 0
                    ? {
                        value: trlDetails[0]._id,
                        label: trlDetails[0].TrlLevel,
                      }
                    : null
                }
                options={trlDetails.map((trl) => ({
                  value: trl._id,
                  label: trl.TrlLevel,
                }))}
                onChange={handleTrlChange}
                placeholder="Select TRL Level"
                isSearchable
                className="w-full text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                styles={trlSelectStyles}
                menuPortalTarget={document.body}
                menuPosition="absolute"
              />
            </div>

            <div className="bg-white border rounded-lg p-6 mb-4">
              <h2 className="text-lg font-semibold text-primary mb-4">
                TRL Work Flow
              </h2>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                  <table className="w-full min-w-[600px] border-collapse">
                    <thead className="bg-gray-600 text-gray-100 text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        {[
                          "TRL Level",
                          "Maturity Level",
                          "Start Date",
                          "Estimated Date",
                          "Extended Date",
                          "Status",
       
                        ].map((header) => (
                          <th
                            key={header}
                            className="pl-4 py-3 text-left uppercase tracking-wide"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white text-black">
                      {trlDetails.map((item, index) => (
                        <tr
                          key={item._id}
                          onClick={() =>
                            handleTRLClick(
                              productId,
                              item._id,
                              item.TrlLevel || "",
                              item.levelCount || 0,
                              item.levelDetails || []
                            )
                          }
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } text-sm cursor-pointer hover:bg-gray-200 transition`}
                        >
                          <td className="pl-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">
                                {item.levelCount}
                              </div>
                              <span className="font-medium">TRL</span>
                            </div>
                          </td>
                          <td className="pl-4 py-3 whitespace-nowrap font-medium">
                            {item.TrlLevel}
         
                          </td>
                          <td className="pl-4 py-3 whitespace-nowrap">
                            {formatDate(item.startDate)}
                          </td>
                          <td className="pl-4 py-3 whitespace-nowrap">
                            {formatDate(item.estimatedDate)}
                          </td>
                          <td className="pl-4 py-3 whitespace-nowrap">
                            {formatDate(item.extendedDate)}
                          </td>
                          <td className="pl-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  item.status === "Completed"
                                    ? "bg-green-500"
                                    : item.status === "In Progress"
                                    ? "bg-yellow-500"
                                    : "bg-gray-400"
                                }`}
                              ></span>
                              <span className="text-xs font-medium">
                                {item.status}
                              </span>
        
                            </div>
                          </td>
       
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {trlDetails.length === 0 && (
                    <div className="py-6 text-center text-gray-500">
                      No TRL data available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-5/6 max-h-[90vh] overflow-hidden">
            <div className="max-h-[85vh] overflow-y-auto">
              <Expand title={selectedSection.title} onClose={handleExpandClose}>
                <div className="mt-4 p-4">
                  <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">
                    {selectedSection.content || "No content available"}
                  </p>
                </div>
              </Expand>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
