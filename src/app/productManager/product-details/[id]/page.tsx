"use client"; // This is required at the top for client components in Next.js App Router

import React, { useState, useEffect, useMemo } from "react";
import {
  IoArrowBackCircle,
  // IoChevronForwardCircle,
  // IoChevronBackCircle,
} from "react-icons/io5";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar-pm";
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
  trlLevelId: string;
  subLevelId: string;
  description: string;
  documentationLink: string;
  otherNotes: string;
  demoRequired: boolean;
  demoStatus: string;
  startDate: string;
  estimatedDate: string;
  extendedDate: string;
  status: string;
}

interface SectionType {
  title: string;
  content: string | undefined;
}

interface ChartData {
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

  console.log("trlItems==", trlItems);

  const [productId, setProductId] = useState<string>(() => {
    if (clientSideParams && typeof clientSideParams.id === "string") {
      return clientSideParams.id;
    }
    return params.id;
  });

  const [productDetails, setProductDetails] = useState<ProductDetails | null>(
    null
  );
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(
    null
  );
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const fetchTrlMasterData = async () => {
    try {
      const response = await fetch("/api/trl", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("data===", data);

      if (data.success && Array.isArray(data.data)) {
        const sortedData = data.data.sort(
          (a: TrlMasterItem, b: TrlMasterItem) =>
            a.trlLevelNumber - b.trlLevelNumber
        );

        console.log("sortedData", sortedData);

        setTrlItems(
          sortedData.map((item: TrlMasterItem) => ({
            _id: item._id,
            TrlLevelNumber: item.trlLevelNumber,
            trlLevelName: item.trlLevelName,
            subLevels: item.subLevels,
            status: "Pending",
          }))
        );
      } else {
        throw new Error(data.error || "Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching TRL master data:", error);
      setTrlItems([]);
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
      const data = await response.json();
      setProductDetails(data);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const fetchTrlDetails = async () => {
    if (!productId) return;

    try {
      const [masterResponse, detailsResponse] = await Promise.all([
        fetch("/api/trl", {
          headers: {
            Accept: "application/json",
          },
        }),
        fetch(`/api/trl-level?productId=${productId}`, {
          headers: {
            Accept: "application/json",
          },
        }),
      ]);

      const responses = await Promise.all([
        masterResponse.json().catch(() => ({ success: false })),
        detailsResponse.json().catch(() => ({ success: false })),
      ]);

      const [masterData, detailsData] = responses;

      if (masterData.success && detailsData.success) {
        // Sort master data by TRL level number
        const sortedMasterData = masterData.data.sort(
          (a: TrlMasterItem, b: TrlMasterItem) =>
            a.trlLevelNumber - b.trlLevelNumber
        );

        const combinedData = sortedMasterData.map(
          (masterItem: TrlMasterItem) => {
            const levelDetails = detailsData.data.filter(
              (detail: TrlLevelDetail) => detail.trlLevelId === masterItem._id
            );

            const sortedSubLevels = [...(masterItem.subLevels || [])].sort(
              (a, b) => a.subLevelNumber - b.subLevelNumber
            );

            const firstSubLevel = sortedSubLevels[0];
            const lastSubLevel = sortedSubLevels[sortedSubLevels.length - 1];

            const firstSubLevelDetails = levelDetails.find(
              (d: TrlLevelDetail) => d.subLevelId === firstSubLevel?._id
            );
            const lastSubLevelDetails = levelDetails.find(
              (d: TrlLevelDetail) => d.subLevelId === lastSubLevel?._id
            );

            return {
              _id: masterItem._id,
              TrlLevelNumber: masterItem.trlLevelNumber,
              trlLevelName: masterItem.trlLevelName,
              subLevels: sortedSubLevels,
              description: firstSubLevelDetails?.description || "",
              status: calculateOverallStatus(levelDetails),
              documentationLink: firstSubLevelDetails?.documentationLink || "",
              otherNotes: firstSubLevelDetails?.otherNotes || "",
              demoRequired: firstSubLevelDetails?.demoRequired || false,
              demoStatus: firstSubLevelDetails?.demoStatus || "Pending",
              startDate: firstSubLevelDetails?.startDate || "",
              estimatedDate: lastSubLevelDetails?.estimatedDate || "",
              extendedDate: lastSubLevelDetails?.extendedDate || "",
            };
          }
        );

        setTrlItems(combinedData);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (error) {
      console.error("Error fetching TRL data:", error);
      setTrlItems([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientSideParams && typeof clientSideParams.id === "string") {
      setProductId(clientSideParams.id);
    }
  }, [pathname, clientSideParams]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const savedIds = localStorage.getItem("dashboardProductIds");
        if (savedIds) {
          setProductIds(JSON.parse(savedIds));
        }
        await fetchTrlMasterData();
        await fetchProductDetails();
        await fetchTrlDetails();
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  useEffect(() => {
    // Initial load
    const loadChartData = () => {
      const savedData = localStorage.getItem("productProgressData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setChartData(parsedData);
      }
    };

    // Load initial data
    loadChartData();

    // Set up storage event listener for updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "productProgressData") {
        const newData = event.newValue ? JSON.parse(event.newValue) : [];
        setChartData(newData);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const currentProductProgress = useMemo(
    () => chartData.find((item) => item.productID === productId)?.progress ?? 0,
    [chartData, productId]
  );

  const progressPercentage = currentProductProgress;

  const handleTRLClick = (
    productId: string,
    trlId: string,
    levelName: string,
    levelNumber: number,
    subLevels: TRLItem["subLevels"]
  ) => {
    router.push(
      `/productManager/product-details/${productId}/${trlId}?name=${encodeURIComponent(
        levelName
      )}&level=${levelNumber}&subLevels=${encodeURIComponent(
        JSON.stringify(subLevels)
      )}`
    );
  };

  const handleSectionClick = (section: SectionType) => {
    setSelectedSection(section);
  };

  const handleExpandClose = () => {
    setSelectedSection(null);
  };

  const handleIndexChange = (index: number, newProductId: string) => {
    router.push(`/productManager/product-details/${newProductId}`);
  };

  const renderTableBody = () => (
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
              <span className="text-xs font-medium">{item.status}</span>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );

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

                <div className="flex items-center  px-4 py-2 rounded-full font-bold">
                  <h1
                    className="text-gray-600 hover:cursor-pointer transition-all"
                    onClick={() => router.push(`/productManager/dashboard`)}
                  >
                    Home
                  </h1>
                  <MdOutlineArrowForwardIos
                    className="text-gray-400"
                    size={17}
                  />
                  <h1 className="text-primary font-bold hover:cursor-context-menu">
                    TRL Level
                  </h1>
                </div>
              </div>

              <div className="flex-row">
                <SwitchTrl
                  productIds={productIds}
                  onIndexChange={handleIndexChange}
                />
              </div>
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
                      {isNaN(progressPercentage) ? "0" : progressPercentage}%
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
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                    ),
                  },
                ].map((section, index) => (
                  <div
                    key={index}
                    className={`group flex flex-col flex-1 p-4 rounded-lg border border-gray-200 bg-gray-50 transition-all hover:bg-white hover:shadow-lg cursor-pointer`}
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
                    {renderTableBody()}
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
        <div className="fixed inset-0 z-50">
          <Expand title={selectedSection.title} onClose={handleExpandClose}>
            <div className="mt-4 p-4">
              <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">
                {selectedSection.content || "No content available"}
              </p>
            </div>
          </Expand>
        </div>
      )}
    </div>
  );
}
