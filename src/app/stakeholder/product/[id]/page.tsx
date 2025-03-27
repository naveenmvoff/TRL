"use client"; // This is required at the top for client components in Next.js App Router

import React, { useState, useEffect } from "react";
import { IoArrowBackCircle } from "react-icons/io5";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar-stakeholders";
import Expand from "@/components/expand"; // Add this import

import { useParams, useRouter, usePathname } from "next/navigation";
import { ObjectId } from "mongoose";
import SwitchTrl from "@/components/switch-trl";

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

interface TrlMasterItem {
  _id: string;
  trlLevelNumber: number;
  trlLevelName: string;
  subLevels: {
    subLevelName: string;
    subLevelNumber: number;
    _id: string;
  }[];
}

interface TrlLevelDetail {
  _id: string;
  trlLevelId: string;
  subLevelId: string;
  productId: string;
  description?: string;
  documentationLink?: string;
  otherNotes?: string;
  demoRequired?: boolean;
  demoStatus?: string;
  startDate?: string;
  estimatedDate?: string;
  extendedDate?: string;
  status: string;
}

interface SectionType {
  title: string;
  content: string | undefined;
  icon: React.ReactNode;
}

interface ChartDataItem {
  name: string;
  progress: number;
  productID: string;
}

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
    <h1 className="mt-4 text-lg font-semibold text-indigo-600">Loading...</h1>
  </div>
);

// Helper functions
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};


const calculateOverallStatus = (levelDetails: TrlLevelDetail[]) => {
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

export default function ProductDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const clientSideParams = useParams();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);
  const [trlItems, setTrlItems] = useState<TRLItem[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);

  const [productId, setProductId] = useState<string>(() => {
    if (clientSideParams && typeof clientSideParams.id === "string") {
      return clientSideParams.id;
    }
    return params.id;
  });

  const [chartData, setChartData] = useState<Array<{name: string, progress: number, productID: string}>>([]);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Add effect to listen for localStorage changes
  useEffect(() => {
    // Initial load
    const loadChartData = () => {
      const savedData = localStorage.getItem('productProgressData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setChartData(parsedData);
        // Find and set current product's progress using proper type
        const currentProduct = parsedData.find((item: ChartDataItem) => item.productID === productId);
        if (currentProduct) {
          setCurrentProgress(currentProduct.progress);
        }
      }
    };

    loadChartData();

    // Set up storage event listener for real-time updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'productProgressData' && event.newValue) {
        const newData = JSON.parse(event.newValue);
        setChartData(newData);
        const currentProduct = newData.find((item: ChartDataItem) => item.productID === productId);
        if (currentProduct) {
          setCurrentProgress(currentProduct.progress);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [productId]);

  useEffect(() => {
    if (clientSideParams && typeof clientSideParams.id === "string") {
      setProductId(clientSideParams.id);
    }
  }, [pathname, clientSideParams]);

  useEffect(() => {
    // Add overflow hidden to prevent page scrollbar
    document.body.style.overflow = 'hidden';
    
    // Clean up on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    console.log("Current productIds state:", productIds);
    if (productIds && productIds.length > 0) {
      console.log("SwitchTrl should be visible with", productIds.length, "items");
    } else {
      console.log("SwitchTrl might not be visible due to empty productIds");
    }
  }, [productIds]);

  const completedItems = trlItems.filter(
    (item) => item.status === "Completed"
  ).length;
  const progressPercentage = Math.round(
    (completedItems / trlItems.length) * 100
  );

  const [productDetails, setProductDetails] = useState<ProductDetails | null>(
    null
  );

  const [selectedSection, setSelectedSection] = useState<SectionType | null>(null);

  const [isAnyPopupOpen, setIsAnyPopupOpen] = useState(false);

  console.log("Product ID: ", productId);

  useEffect(() => {
    if (!productId) return;

    const fetchTrlMasterData = async () => {
      console.log("Inside TRL Master Data - PM");

      try {
        const response = await fetch("/api/trl");
        console.log("ItrlMD - Got responce");
        const data = await response.json();
        console.log("TRL Master Data=====", data);
        if (data.success) {
          setTrlItems(
            data.data.map((item: TrlMasterItem) => ({
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

    const fetchProductDetails = async () => {
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
    };

    const fetchTrlDetails = async () => {
      if (!productId) return;
      try {
        const masterResponse = await fetch("/api/trl");
        const masterData = await masterResponse.json();

        const detailsResponse = await fetch(
          `/api/trl-level?productId=${productId}`
        );
        const detailsData = await detailsResponse.json();

        if (masterData.success && detailsData.success) {
          // Sort master data by TRL level number
          const sortedMasterData = masterData.data.sort(
            (a: TrlMasterItem, b: TrlMasterItem) => a.trlLevelNumber - b.trlLevelNumber
          );

          const combinedData = sortedMasterData.map((masterItem: TrlMasterItem) => {
            const levelDetails = detailsData.data.filter(
              (detail: TrlLevelDetail) => detail.trlLevelId === masterItem._id
            );

            const sortedSubLevels = masterItem.subLevels?.sort(
              (a, b) => a.subLevelNumber - b.subLevelNumber
            );

            const firstSubLevel = sortedSubLevels?.[0];
            const firstSubLevelDetails = firstSubLevel
              ? levelDetails.find((d: TrlLevelDetail) => d.subLevelId === firstSubLevel._id)
              : null;

            const lastSubLevel = sortedSubLevels?.[sortedSubLevels.length - 1];
            const lastSubLevelDetails = lastSubLevel
              ? levelDetails.find((d: TrlLevelDetail) => d.subLevelId === lastSubLevel._id)
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
              startDate: firstSubLevelDetails?.startDate || "",
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

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const savedIds = localStorage.getItem("dashboardProductIds");
        if (savedIds) {
          setProductIds(JSON.parse(savedIds));
          console.log("Product IDs loaded from localStorage:", JSON.parse(savedIds));
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
  }, [productId]);

  const handleTRLClick = (
    productId: string,
    trlId: string,
    levelName: string,
    levelNumber: number,
    subLevels: {subLevelName: string; subLevelNumber: number; _id: string}[]
  ) => {
    router.push(
      `/stakeholder/product/${productId}/${trlId}?name=${encodeURIComponent(
        levelName
      )}&level=${levelNumber}&subLevels=${encodeURIComponent(
        JSON.stringify(subLevels)
      )}`
    );
  };

  const handleSectionClick = (section: SectionType) => {
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
    router.push(`/stakeholder/product/${newProductId}`);
  };

  // Add this useEffect after your other useEffects
  useEffect(() => {
    // Monitor chartData changes for debugging and future features
    console.log('Chart data updated:', chartData);
    
    // This data will be used for chart visualizations and progress tracking
    const totalProducts = chartData.length;
    const averageProgress = chartData.reduce((sum, item) => sum + item.progress, 0) / (totalProducts || 1);
    
    console.log('Average progress across all products:', averageProgress);
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-white">
        <NavBar role="Stakeholder" />
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
    <div className="min-h-screen bg-white w-full overflow-hidden">
      <NavBar role="Stakeholder" />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <div className="flex-1 space-y-4 p-6 pt-6 overflow-auto bg-secondary">
          <main className="">
            <div className="flex flex-row items-center justify-between space-x-4 mb-4">
              <div className="flex items-center gap-2">
              
                <IoArrowBackCircle
                
                    onClick={() => router.push(`/stakeholder/product`)}
                  className="text-gray-600 hover:text-gray-700 hover:cursor-pointer transition-colors"
                  size={35}
                />


                <div className="flex items-center px-4 py-2 rounded-full font-bold">
                  <h1
                    className="text-gray-600 hover:cursor-pointer transition-all"
                    onClick={() => router.push(`/stakeholder/product`)}
                  >
                    Home
                  </h1>
                  <MdOutlineArrowForwardIos className="text-gray-400" size={17} />
                  <h1 className="text-primary font-bold hover:cursor-context-menu">
                    TRL Level
                  </h1>
                </div>
              </div>

              {productIds && productIds.length > 0 ? (
                <div >
                  <SwitchTrl
                      productIds={productIds}
                      onIndexChange={handleIndexChange}
                    />
                </div>
              ) : (
                <div className="text-red-500">No product IDs available</div>
              )}
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
                      {currentProgress}%
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
                      {trlItems.map((item, index) => (
                        <tr
                          key={item._id}
                          onClick={() =>
                            handleTRLClick(
                              productId,
                              item._id,
                              item.trlLevelName || "",
                              item.TrlLevelNumber || 0,
                              item.subLevels || []
                            )
                          }
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } text-sm cursor-pointer hover:bg-gray-200 transition`}
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
                  {trlItems.length === 0 && (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-hidden">
              <Expand title={selectedSection.title} onClose={handleExpandClose}>
                <div className="p-4 overflow-y-auto">
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
