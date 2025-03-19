"use client"; // This is required at the top for client components in Next.js App Router

import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar-stakeholders";
import Expand from "@/components/expand"; // Add this import

import { useParams, useRouter } from "next/navigation";
import { ObjectId } from "mongoose";
import { connect } from "http2";
import { NextRequest, NextResponse } from "next/server";
import TrlLevelData from "@/models/trlLevelData";

interface TRLItem {
  _id: string;
  TrlLevelNumber?: number;
  trlLevelName?: string;
  status: string;
  subLevels?: {
    subLevelName: string;
    subLevelNumber: number;
    _id: string;
  }[];
  description?: string;
  documentationLink?: string;
  otherNotes?: string;
  demoRequired?: boolean;
  demoStatus?: string;
  startDate?: string;
  estimatedDate?: string;
  extendedDate?: string;
}

interface ProductDetails {
  createdAt: ObjectId;
  product: string;
  productManagerID: ObjectId;
  productViewer: ObjectId[];
  description: string;
  problemStatement: string;
  solutionExpected: string;
}

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
    <h1 className="mt-4 text-lg font-semibold text-indigo-600">Loading...</h1>
  </div>
);

export default function ProductDetails() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [trlItems, setTrlItems] = useState<TRLItem[]>([]);
  console.log("TRL Master Items: ", trlItems);

  const completedItems = trlItems.filter(
    (item) => item.status === "Completed"
  ).length;
  const progressPercentage = Math.round(
    (completedItems / trlItems.length) * 100
  );

  const [productDetails, setProductDetails] = useState<ProductDetails | null>(
    null
  );

  const [selectedSection, setSelectedSection] = useState<{
    title: string;
    content: string | undefined;
  } | null>(null);

  const [isAnyPopupOpen, setIsAnyPopupOpen] = useState(false);

  const params = useParams();
  const id = params.id as string;
  console.log("Product ID: ", id);

  // Add this helper function at the top of your component
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Add this function before the component
  const calculateOverallStatus = (levelDetails: any[]) => {
    if (!levelDetails || levelDetails.length === 0) return "Pending";

    const hasCompleted = levelDetails.some(detail => detail.status === "Completed");
    const hasInProgress = levelDetails.some(detail => detail.status === "In Progress");
    const allCompleted = levelDetails.every(detail => detail.status === "Completed");

    if (allCompleted) return "Completed";
    if (hasInProgress || hasCompleted) return "In Progress";
    return "Pending";
  };


  // // =============GET TRL MASTER DETAILS from TRL MASTER Schema===============
  useEffect(() => {
    const trlMasterData = async () => {
      console.log("Inside TRL Master Data - PM");

      try {
        const response = await fetch("/api/trl");
        console.log("ItrlMD - Got responce");
        const data = await response.json();
        console.log("TRL Master Data=====", data);
        if (data.success) {
          setTrlItems(
            data.data.map((item: any) => ({
              _id: item._id,
              TrlLevelNumber: item.trlLevelNumber,
              trlLevelName: item.trlLevelName,
              subLevels: item.subLevels,
              status: "Pending", // or however you determine status
            }))
          );
        } else {
          console.error("Failed to fetch TRL details:", data.error);
        }
      } catch (error) {
        console.log("Unable to GET TRL Details", error);
        return Response.json(
          {
            success: false,
            error: "Failed to fetch TRL details",
          },
          { status: 500 }
        );
      }
    };
    trlMasterData();
  }, [id]);


  // // =============GET PRODUCT DETAILS ONLY ===============
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        console.log("Product ID in Request: ", id);
        const response = await fetch(`/api/product-manager/product?id=${id}`);
        console.log("ProductDetails - Got responce", response);
        const data = await response.json();
        console.log("ProductDetails : ", data);
        setProductDetails(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProductDetails();
  }, [id]);


  // // =============GET TRL LEVEL DETAILS from LevelData Schema===============
  useEffect(() => {
    const fetchTrlDetails = async () => {
      if (!id) return;
      try {
        // First fetch master data
        const masterResponse = await fetch("/api/trl");
        const masterData = await masterResponse.json();

        // Then fetch level details
        const detailsResponse = await fetch(`/api/trl-level?productId=${id}`);
        const detailsData = await detailsResponse.json();

        if (masterData.success && detailsData.success) {
          // Combine the data
          const combinedData = masterData.data.map((masterItem: any) => {
            // Find all sublevels details for this TRL level
            const levelDetails = detailsData.data.filter(
              (detail: any) => detail.trlLevelId === masterItem._id
            );

            // Sort sublevels by their number
            const sortedSubLevels = masterItem.subLevels?.sort(
              (a: any, b: any) => a.subLevelNumber - b.subLevelNumber
            );

            // Find first sublevel details
            const firstSubLevel = sortedSubLevels?.[0];
            const firstSubLevelDetails = firstSubLevel
              ? levelDetails.find((d: any) => d.subLevelId === firstSubLevel._id)
              : null;
            
            // Find last sublevel details
            const lastSubLevel = sortedSubLevels?.[sortedSubLevels.length - 1];
            const lastSubLevelDetails = lastSubLevel
              ? levelDetails.find((d: any) => d.subLevelId === lastSubLevel._id)
              : null;

            return {
              _id: masterItem._id,
              TrlLevelNumber: masterItem.trlLevelNumber,
              trlLevelName: masterItem.trlLevelName,
              subLevels: masterItem.subLevels,
              description: firstSubLevelDetails?.description || "",
              status: calculateOverallStatus(levelDetails),
              documentationLink: firstSubLevelDetails?.documentationLink || "",
              otherNotes: firstSubLevelDetails?.otherNotes || "",
              demoRequired: firstSubLevelDetails?.demoRequired || false,
              demoStatus: firstSubLevelDetails?.demoStatus || "",
              // Use first sublevel's start date
              startDate: firstSubLevelDetails?.startDate || "",
              // Use last sublevel's estimated and extended dates
              estimatedDate: lastSubLevelDetails?.estimatedDate || "",
              extendedDate: lastSubLevelDetails?.extendedDate || "",
            };
          });

          setTrlItems(combinedData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching TRL data:", error);
        setIsLoading(false);
      }
    };

    fetchTrlDetails();
  }, [id]);

  const handleTRLClick = (
    productId: string,
    trlId: string,
    levelName: string,
    levelNumber: number,
    subLevels: any[]
  ) => {
    router.push(
      `/stakeholder/product/${productId}/${trlId}?name=${encodeURIComponent(
        levelName
      )}&level=${levelNumber}&subLevels=${encodeURIComponent(
        JSON.stringify(subLevels)
      )}`
    );
  };

  const handleSectionClick = (section: any) => {
    if (!isAnyPopupOpen) {
      setSelectedSection(section);
      setIsAnyPopupOpen(true);
    }
  };

  const handleExpandClose = () => {
    setSelectedSection(null);
    setIsAnyPopupOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white w-full overflow-hidden">
        <NavBar role="Stakeholder" />
        <div className="flex h-[calc(100vh-4rem)]">
          <Sidebar />
          <div className="flex-grow">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      {/* Use z-index to ensure proper stacking */}
      <NavBar role="Stakeholder" className="z-10" />
      <div className="flex flex-col sm:flex-row relative z-0">
        <Sidebar />
        <div className="flex-1 flex justify-center bg-secondary">
          <div className="mt-5 w-full max-w-full px-4 sm:px-6 space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">
                Product Details
              </h2>
              {[
                {
                  title: "Description",
                  content: productDetails?.description,
                },
                {
                  title: "Problem Statement",
                  content: productDetails?.problemStatement,
                },
                {
                  title: "Solution Expected",
                  content: productDetails?.solutionExpected,
                },
              ].map((section) => (
                <div 
                  key={section.title} 
                  className={`mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors ${
                    isAnyPopupOpen ? 'pointer-events-none opacity-50' : ''
                  }`}
                  onClick={() => handleSectionClick(section)}
                >
                  <h3 className="text-base font-semibold text-gray-700">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1 overflow-hidden text-ellipsis">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* TRL Progress Bar */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">
                TRL Progress
              </h2>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className="bg-primary h-8 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span className="text-primary text-xl font-bold">
                  {progressPercentage}%
                </span>
              </div>
            </div>

            {/* TRL Work Flow Table */}
            <div className="bg-white border rounded-lg p-6 mb-4">
              <h2 className="text-lg font-semibold text-primary mb-4">
                TRL Work Flow
              </h2>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                  <table className="w-full min-w-[600px] border-collapse">
                    <thead className="bg-gray-100 text-black text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        {[
                          "TRL Level",
                          "Maturity Level",
                          "Start Date",
                          "Estimated Date",
                          "Extended Date",
                          "Status",
                          // "Actions",
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
                      {trlItems.map((item, index) => (
                        <tr
                          key={item._id}
                          onClick={() =>
                            handleTRLClick(
                              id,
                              item._id,
                              item.trlLevelName || "",
                              item.TrlLevelNumber || 0,
                              item.subLevels || []
                            )
                          }
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } text-sm cursor-pointer hover:bg-gray-300 transition`}
                        >
                          <td className="pl-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">
                                {item.TrlLevelNumber}
                              </div>
                              <span className="font-medium">TRL</span>
                            </div>
                          </td>
                          <td className="pl-4 py-3 whitespace-nowrap font-medium">
                            {item.trlLevelName}
                            {/* <div className="text-xs text-gray-500">
                              {item.description}
                            </div> */}
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
                              {/* {item.demoRequired && (
                                <span className="ml-2 text-xs text-blue-600">
                                  Demo {item.demoStatus}
                                </span>
                              )} */}
                            </div>
                          </td>
                          {/* <td className="pl-4 py-3 whitespace-nowrap">
                            <button className="text-primary hover:text-primary2 transition">
                              <Pencil className="h-4 w-4" />
                            </button>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {trlItems.length === 0 && (
                    <div className="py-6 text-center text-gray-500">
                      No TRL data available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Move the Expand component here, outside the main content flow */}
      {selectedSection && (
        <Expand
          title={selectedSection.title}
          onClose={handleExpandClose}
        >
          <div className="mt-4 p-4">
            <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">
              {selectedSection.content || "No content available"}
            </p>
          </div>
        </Expand>
      )}
    </div>
  );
}
