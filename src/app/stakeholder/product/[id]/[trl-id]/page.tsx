"use client";
import { IoArrowBackCircle } from "react-icons/io5";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import NavBar from "@/components/navbar/navbar";
import SideBar from "@/components/sidebar-stakeholders";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Expand from "@/components/expand";

import "react-datepicker/dist/react-datepicker.css";

interface TRLItem {
  trlLevelId: string | undefined;
  productId: string | undefined;
  _id: string | undefined;
  id: string;
  subLevelId?: string;
  segregation: string;
  description: string;
  currentUpdate: string;
  status: "Completed" | "In Progress" | "Pending";
  documentationLink?: string;
  otherNotes?: string;
  demoRequired?: boolean;
  demoStatus?: string;
  startDate?: Date;
  estimatedDate?: Date;
  extendedDate?: Date;
}

interface FormDataValue {
  _id?: string;
  productId?: string;
  trlLevelId?: string;
  subLevelId?: string;
  description: string;
  currentUpdate: string;
  documentationLink: string;
  otherNotes: string;
  demoRequired: boolean;
  demoStatus: string;
  status: string;
  startDate: Date | null;
  estimatedDate: Date | null;
  extendedDate: Date | null;
}

interface TrlLevelDataItem {
  _id: string;
  userId: string;
  productId: string;
  trlLevelId: string;
  subLevelId: string;
  description: string;
  currentUpdate: string;
  status: string;
  documentationLink: string;
  otherNotes: string;
  demoRequired: boolean;
  demoStatus: string;
  startDate: string | Date;
  estimatedDate: string | Date;
  extendedDate: string | Date;
}

interface SubLevel {
  _id: string;
  subLevelName: string;
  subLevelNumber: number;
}

const formatDate = (date: Date | null) => {
  if (!date) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
    <h1 className="mt-4 text-lg font-semibold text-indigo-600">Loading...</h1>
  </div>
);

export default function ProductManager() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const trlLevelName = searchParams.get("name");
  const trlLevelNumber = searchParams.get("level");
  const trlId = params["trl-id"] as string; 
  const subLevelsParam = searchParams.get("subLevels");
  const subLevels = subLevelsParam
    ? JSON.parse(decodeURIComponent(subLevelsParam))
    : [];
  const [trlLevelContent, setTrlLevelContent] = useState<TRLItem[]>([]);
  const [showPopupView, setShowPopupView] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TRLItem | null>(null);
  const [formData, setFormData] = useState<FormDataValue | null>(null);
  const [expandedContent, setExpandedContent] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const fetchTrlDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/trl-level?productId=${id}`);
        const data = await response.json();

        if (data.success) {
          setTrlLevelContent(
            data.data.map((item: TrlLevelDataItem) => ({
              _id: item._id,
              userId: item.userId,
              productId: item.productId,
              trlLevelId: item.trlLevelId,
              subLevelId: item.subLevelId,
              description: item.description,
              currentUpdate: item.currentUpdate,
              status: item.status,
              documentationLink: item.documentationLink,
              otherNotes: item.otherNotes,
              demoRequired: item.demoRequired,
              demoStatus: item.demoStatus,
              startDate: item.startDate,
              estimatedDate: item.estimatedDate,
              extendedDate: item.extendedDate,
            }))
          );
        } else {
          console.error("Failed to fetch TRL details:", data.error);
        }
      } catch (error) {
        console.error("Error fetching TRL details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrlDetails();
  }, [id]);

  const filteredContent = trlLevelContent.filter(
    (item: TRLItem) => item.trlLevelId === trlId
  );

  const combinedTrlItems = subLevels.map((subLevel: SubLevel) => {
    const matchingContent = trlLevelContent.find(
      (content: TRLItem) => content.subLevelId === subLevel._id
    );

    return {
      id: subLevel._id,
      segregation: subLevel.subLevelName,
      description: matchingContent?.description || "-",
      currentUpdated: matchingContent?.currentUpdate || "-",
      status: matchingContent?.status || "Pending",
      documentationLink: matchingContent?.documentationLink,
      otherNotes: matchingContent?.otherNotes,
      demoRequired: matchingContent?.demoRequired,
      demoStatus: matchingContent?.demoStatus,
    };
  });

  const handleView = (item: TRLItem) => {
    const matchingContent = filteredContent.find(
      (content: TRLItem) => content.subLevelId === item.id
    );

    if (matchingContent) {
      setSelectedItem(item);
      setFormData({
        _id: matchingContent._id,
        productId: matchingContent.productId,
        trlLevelId: matchingContent.trlLevelId,
        subLevelId: matchingContent.subLevelId,
        description: matchingContent.description || "",
        currentUpdate: matchingContent.currentUpdate || "",
        documentationLink: matchingContent.documentationLink || "",
        otherNotes: matchingContent.otherNotes || "",
        demoRequired: matchingContent.demoRequired || false,
        demoStatus: matchingContent.demoStatus || "pending",
        status: matchingContent.status || "to do",
        startDate: matchingContent.startDate
          ? new Date(matchingContent.startDate)
          : null,
        estimatedDate: matchingContent.estimatedDate
          ? new Date(matchingContent.estimatedDate)
          : null,
        extendedDate: matchingContent.extendedDate
          ? new Date(matchingContent.extendedDate)
          : null,
      });
    }
    setShowPopupView(true);
  };

  const handleExpandClose = () => {
    setExpandedContent(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-white">
        <NavBar role="Stakeholder" />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <SideBar />
          <div className="flex-grow overflow-hidden">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <NavBar role="Stakeholder" />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <SideBar />
        <div className="flex-grow overflow-y-auto bg-secondary">
          <main className="p-6">
            <div className="flex flex-row items-center justify-between space-x-4">
              <div className="flex flex-row items-center justify-between space-x-4 mb-4">
                <div className="flex items-center gap-2">
                  <IoArrowBackCircle
                    onClick={() =>
                      router.push(`/stakeholder/product/${id}`)
                    }
                    className="text-gray-600 hover:text-gray-700 hover:cursor-pointer transition-colors"
                    size={35}
                  />

                  <div className="flex items-center bg-gray-600 px-4 py-2 rounded-full font-bold">
                    <h1
                      className="text-gray-200 hover:cursor-pointer transition-all"
                      onClick={() => router.push(`/stakeholder/product`)}
                    >
                      Home
                    </h1>
                    <MdOutlineArrowForwardIos size={20} />
                    <h1
                      className="text-gray-200 hover:cursor-pointer transition-all"
                      onClick={() =>
                        router.push(`/stakeholder/product/${id}`)
                      }
                    >
                      TRL Level
                    </h1>
                    <MdOutlineArrowForwardIos size={20} />
                    <h1 className="text-white hover:cursor-context-menu">
                      {trlLevelName}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-md shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-medium text-gray-800">
                  Product Details
                </h2>
                <h3 className="text-lg font-medium text-gray-700 mt-2">
                  TRL {trlLevelNumber} - {trlLevelName}
                </h3>
              </div>
              <div>
                <div className="overflow-x-auto ">
                  <table className="w-full rounded-md">
                    <thead className="bg-gray-700">
                      <tr className="border-t border-b font-normal text-sm text-gray-50">
                        <th className="py-3 px-6 text-left">
                          TRL SEGREGATION
                        </th>
                        <th className="py-3 px-6 text-left">
                          DESCRIPTION
                        </th>
                        <th className="py-3 px-6 text-left">
                          CURRENT UPDATED
                        </th>
                        <th className="py-3 px-6 text-left">
                          STATUS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedTrlItems.map((item: TRLItem) => (
                        <tr
                          key={item.id}
                          className="border-b cursor-pointer hover:bg-gray-100"
                          onClick={() => handleView(item)}
                        >
                          <td className="py-4 px-6 text-black">
                            {item.segregation}
                          </td>

                          <td className="py-4 px-6 text-black">
                            {item.description.split(" ").length > 5
                              ? `${item.description
                                  .split(" ")
                                  .slice(0, 5)
                                  .join(" ")}...`
                              : item.description}
                          </td>
                          <td className="py-4 px-6 text-black">
                            {item.description.split(" ").length > 5
                                ? `${item.description
                                    .split(" ")
                                    .slice(0, 5)
                                    .join(" ")}...`
                                : item.currentUpdate}
                          </td>
                          <td className="py-4 px-6 text-black">
                            <span
                              className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                                item.status === "Completed"
                                  ? "bg-green-200"
                                  : item.status === "In Progress"
                                  ? "bg-yellow-200"
                                  : item.status === "Pending"
                                  ? "bg-blue-200"
                                  : "bg-gray-200"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {combinedTrlItems.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 text-center text-gray-500"
                          >
                            No data available for this TRL level
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
        {showPopupView && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-5/6 max-h-[90vh] overflow-hidden">
              <div className="max-h-[85vh] overflow-y-auto">
                <div className="flex flex-row justify-between items-start sticky top-0 bg-white z-10">
                  <div>
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2 tracking-wide">
                      <span className="relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-prtext-primary after:transition-all after:duration-300 hover:after:w-full">
                        View Panel
                      </span>
                    </h3>
                    <h3 className="text-lg items-start font-semibold text-black">
                      {selectedItem?.segregation || "TRL SEGREGATION"}
                    </h3>
                  </div>
                  <p
                    onClick={() => setShowPopupView(false)}
                    className="rounded-full bg-gray-200 p-1.5 hover:bg-gray-300 transition-colors "
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
                  </p>
                </div>
                <div className="space-y">
                  <div className="flex flex-row gap-4 justify-between">
                    <div className="w-1/2 flex flex-col">
                      <p className="text-md font-regular text-black mt-2">
                        Description
                      </p>
                      <p className="w-full p-2 border text-black rounded-md bg-gray-50 overflow-hidden text-justify">
                        {formData?.description ? (
                          formData.description.split(" ").length > 60 ? (
                            <>
                              {formData.description
                                .split(" ")
                                .slice(0, 60)
                                .join(" ")}
                              <span
                                onClick={() =>
                                  setExpandedContent({
                                    title: "Description",
                                    content: formData?.description || "-",
                                  })
                                }
                                className="text-primary font-medium cursor-pointer"
                              >
                                {" "}
                                Read More
                              </span>
                            </>
                          ) : (
                            formData.description
                          )
                        ) : (
                          "-"
                        )}
                      </p>

                      <p className="text-md font-regular text-black mt-2">
                        Current Update
                      </p>
                      <p className="w-full p-2 border text-black rounded-md bg-gray-50 overflow-hidden text-justify">
                        {formData?.currentUpdate ? (
                          formData.currentUpdate.split(" ").length > 60 ? (
                            <>
                              {formData.currentUpdate
                                .split(" ")
                                .slice(0, 60)
                                .join(" ")}
                              <span
                                onClick={() =>
                                  setExpandedContent({
                                    title: "Current Update",
                                    content: formData?.currentUpdate || "-",
                                  })
                                }
                                className="text-primary font-medium cursor-pointer"
                              >
                                {" "}
                                Read More
                              </span>
                            </>
                          ) : (
                            formData.currentUpdate
                          )
                        ) : (
                          "-"
                        )}
                      </p>

                      <p className="text-md font-regular text-black mt-2">
                        Demo Required
                      </p>
                      <p className="w-full p-2 border text-black rounded-md bg-gray-50">
                        {formData?.demoRequired ? "Yes" : "No"}
                      </p>

                      <p className="text-md font-regular text-black mt-2">
                        Demo Status
                      </p>
                      <p className="w-full p-2 border text-black rounded-md bg-gray-50">
                        {formData?.demoStatus || "-"}
                      </p>
                    </div>

                    <div className="w-1/2 flex flex-col">
                      <p className="text-md font-regular text-black mt-2">
                        Documentation Link
                      </p>
                      <p className="w-full p-2 border text-black rounded-md bg-gray-50">
                        {formData?.documentationLink || "-"}
                      </p>

                      <p className="text-md font-regular text-black mt-2">
                        Other Notes
                      </p>
                      <p className="w-full p-2 border text-black rounded-md bg-gray-50 overflow-hidden text-justify">
                        {formData?.otherNotes ? (
                          formData.otherNotes.split(" ").length > 60 ? (
                            <>
                              {formData.otherNotes
                                .split(" ")
                                .slice(0, 60)
                                .join(" ")}
                              <span
                                onClick={() =>
                                  setExpandedContent({
                                    title: "Other Notes",
                                    content: formData?.otherNotes || "-",
                                  })
                                }
                                className="text-primary font-medium cursor-pointer"
                              >
                                {" "}
                                Read More
                              </span>
                            </>
                          ) : (
                            formData.otherNotes
                          )
                        ) : (
                          "-"
                        )}
                      </p>

                      <div className="flex flex-row gap-4">
                        <div>
                          <p className="text-md font-regular text-black mt-2">
                            Start Date
                          </p>
                          <p className="w-28 p-2 border text-black rounded-md bg-gray-50">
                            {formatDate(formData?.startDate ?? null) || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-md font-regular text-black mt-2">
                            Estimated Date
                          </p>
                          <p className="w-28 p-2 border text-black rounded-md bg-gray-50">
                            {formatDate(formData?.estimatedDate ?? null) || "-"}
                          </p>
                        </div>

                        <div className="pr-4">
                          <p className="text-md font-regular text-black mt-2">
                            Extended Date
                          </p>
                          <p className="w-28 p-2 border text-black rounded-md bg-gray-50">
                            {formatDate(formData?.extendedDate ?? null) || "-"}
                          </p>
                        </div>
                      </div>

                      <p className="text-md font-regular text-black mt-2">
                        Status
                      </p>
                      <p className="w-28 p-2 border text-black rounded-md bg-gray-50">
                        {formData?.status || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      onClick={() => setShowPopupView(false)}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {expandedContent && (
        <Expand title={expandedContent.title} onClose={handleExpandClose}>
          <div className="mt-4 p-4">
            <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">
              {expandedContent.content}
            </p>
          </div>
        </Expand>
      )}
    </div>
  );
}
