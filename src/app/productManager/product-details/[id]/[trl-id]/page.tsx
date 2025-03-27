"use client"; // This is required at the top for client components in Next.js App Router

import { Pencil } from "lucide-react";
// import { FileText } from "lucide-react";
import {
  IoArrowBackCircle,
  // IoChevronForwardCircle,
  // IoChevronBackCircle,
} from "react-icons/io5";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import NavBar from "@/components/navbar/navbar";
import SideBar from "@/components/sidebar-pm";
// import { ObjectId } from "mongoose";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
// import SwitchTrlLevel from "@/components/switch-trlLevel";
import notify from "@/lib/notify";
import Expand from "@/components/expand";
// import SwitchTrlLevel from "@/components/switch-trlLevel";

import DatePicker from "react-datepicker";
import Select, { StylesConfig } from "react-select";

import "react-datepicker/dist/react-datepicker.css";

interface TRLItem {
  trlLevelId: string | undefined;
  productId: string | undefined;
  _id: string | undefined;
  id: string;
  userId?: string;
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

interface FormData {
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

interface StatusSelectProps {
  value: string;
  onChange: (newValue: string) => void;
  isDisabled?: boolean;
  className?: string;
  placeholder?: string;
}

interface SelectOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}

// Common select styles for all selects in the page
const commonSelectStyles: StylesConfig<SelectOption, false> = {
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menu: (base) => ({
    ...base,
    position: "relative",
    zIndex: 9999,
    backgroundColor: "white",
    width: "inherit",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
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
    color: state.isSelected ? "white" : state.isDisabled ? "#9ca3af" : "black",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
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

const statusSelectStyles: StylesConfig<SelectOption, false> = {
  ...commonSelectStyles,
  control: (base) => ({
    ...base,
    background: "white",
    borderColor: "#e2e8f0",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#5D4FEF"
      : state.isDisabled
      ? "#f3f4f6"
      : "white",
    color: state.isSelected ? "white" : state.isDisabled ? "#9ca3af" : "black",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
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

const StatusSelect = ({
  value,
  onChange,
  isDisabled,
  className,
  placeholder,
}: StatusSelectProps) => {
  const handleSelectChange = (selectedOption: SelectOption | null) => {
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  };

  const statusOptions: SelectOption[] = [
    {
      value: "Completed",
      label: "Completed",
      isDisabled: isDisabled,
    },
    { value: "In Progress", label: "In Progress" },
    { value: "Pending", label: "Pending" },
  ];

  return (
    <Select
      options={statusOptions}
      value={{
        value: value,
        label: value,
      }}
      onChange={handleSelectChange}
      className={className}
      menuPortalTarget={document.body}
      styles={statusSelectStyles}
      placeholder={placeholder}
    />
  );
};

const formatDate = (date: Date | null) => {
  if (!date) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const canMarkAsCompleted = (data: FormData | null): boolean => {
  if (!data) return false;
  return !!(
    data.description &&
    data.currentUpdate &&
    data.startDate &&
    data.estimatedDate
  );
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
  // This name is used for display purposes in the UI heading
  const trlLevelName = searchParams.get("name");
  const trlLevelNumber = searchParams.get("level");
  const trlId = params["trl-id"] as string; // Add this line to get trl-id
  const subLevelsParam = searchParams.get("subLevels");
  const subLevels = subLevelsParam
    ? JSON.parse(decodeURIComponent(subLevelsParam))
    : [];
  const [trlLevelContent, setTrlLevelContent] = useState<TRLItem[]>([]);
  const [showPopupEdit, setShowPopupEdit] = useState(false);
  const [showPopupView, setShowPopupView] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TRLItem | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedContent, setExpandedContent] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trlIds, setTrlIds] = useState<string[]>([]);
  console.log("formData", formData);

  const paramsing = useParams();
  const id = paramsing.id as string;

  console.log("id", id);

  // Add overflow hidden to body
  useEffect(() => {
    // Add overflow hidden to prevent page scrollbar
    document.body.style.overflow = "hidden";

    // Clean up on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // // =============GET TRL LEVEL DETAILS from LevelData Schema===============
  useEffect(() => {
    // Load trlIds from localStorage
    const savedTrlIds = localStorage.getItem("productDetailsTrlIds");
    if (savedTrlIds) {
      setTrlIds(JSON.parse(savedTrlIds));
    }

    const fetchTrlDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/trl-level?productId=${id}`);
        const data = await response.json();
        console.log("TRL Details : ", data.data);

        if (data.success) {
          setTrlLevelContent(
            data.data.map((item: TRLItem) => ({
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
              // status: item.status.charAt(0).toUpperCase() + item.status.slice(1)
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

  // Filter trlLevelContent based on trlId
  const filteredContent = trlLevelContent.filter(
    (item: TRLItem) => item.trlLevelId === trlId
  );

  console.log("Filtered TRL Content:", filteredContent);

  // Combine subLevels with trlLevelContent
  const combinedTrlItems = subLevels.map(
    (subLevel: { _id: string; subLevelName: string }) => {
      // Find matching content from trlLevelContent
      const matchingContent = trlLevelContent.find(
        (content: TRLItem) => content.subLevelId === subLevel._id
      );
      // console.log("Matching Content:", matchingContent);

      return {
        id: subLevel._id,
        segregation: subLevel.subLevelName,
        description: matchingContent?.description || "-",
        currentUpdate: matchingContent?.currentUpdate || "-",
        status: matchingContent?.status || "Pending",
        documentationLink: matchingContent?.documentationLink,
        otherNotes: matchingContent?.otherNotes,
        demoRequired: matchingContent?.demoRequired,
        demoStatus: matchingContent?.demoStatus,
      };
    }
  );

  const handleEdit = (item: TRLItem) => {
    // Find matching content from filteredContent
    const matchingContent = filteredContent.find(
      (content) => content.subLevelId === item.id
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
    setShowPopupEdit(true);
    setTouchedFields({}); // Reset touched fields when opening edit popup
  };

  const handleView = (item: TRLItem) => {
    const matchingContent = filteredContent.find(
      (content) => content.subLevelId === item.id
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

  const handleSubmitEdit = async () => {
    if (!formData) return;

    // Check all required fields
    const hasRequiredFields = !!(
      formData.description &&
      formData.currentUpdate &&
      formData.startDate &&
      formData.estimatedDate
    );

    // Set all fields as touched to show validation messages
    setTouchedFields({
      description: true,
      currentUpdate: true,
      startDate: true,
      estimatedDate: true,
    });

    // If required fields are missing, show error and return
    if (!hasRequiredFields) {
      notify("Please fill in all required fields before updating!");
      return;
    }

    // Check if trying to mark as completed
    if (formData.status === "Completed" && !canMarkAsCompleted(formData)) {
      notify(
        "Please fill in all required fields (Description, Current Update, Start Date, and Estimated Date) before marking as Completed"
      );
      return;
    }

    try {
      console.log("formData received!", formData);
      const response = await fetch(`/api/trl-level/${formData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: formData.description,
          currentUpdate: formData.currentUpdate,
          documentationLink: formData.documentationLink,
          otherNotes: formData.otherNotes,
          demoRequired: formData.demoRequired,
          demoStatus: formData.demoStatus,
          status: formData.status,
          startDate: formData.startDate,
          estimatedDate: formData.estimatedDate,
          extendedDate: formData.extendedDate,
        }),
      });

      if (response.ok) {
        setShowPopupEdit(false);
        // Refresh the data
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating TRL data:", error);
    }
  };

  // Function to handle expanding and closing sections
  // Currently not in use but kept for future functionality
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleExpandClose = () => {
    setExpandedContent(null);
  };

  // Function to handle index changes
  // Currently not in use but kept for future functionality
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleIndexChange = (index: number, newTrlId: string) => {
    // Find the TRL level details for the new TRL ID
    const trlLevel = trlIds.findIndex((id) => id === newTrlId);
    if (trlLevel !== -1) {
      // Navigate to the new TRL ID page
      router.push(
        `/productManager/product-details/${id}/${newTrlId}?name=${trlLevelName}&level=${trlLevelNumber}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-white">
        <NavBar role="Product Manager" />
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
      <NavBar role="Product Manager" />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <SideBar />
        <div className="flex-grow overflow-y-auto bg-secondary">
          <main className="p-6">
            <div className="flex flex-row items-center justify-between space-x-4">
              <div className="flex flex-row items-center justify-between space-x-4 mb-4">
                <div className="flex items-center gap-2">
                  <IoArrowBackCircle
                    onClick={() =>
                      router.push(`/productManager/product-details/${id}`)
                    }
                    className="text-gray-600 hover:text-gray-700 hover:cursor-pointer transition-colors"
                    size={35}
                  />

                  <div className="flex items-center px-4 py-2 rounded-full font-bold">
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
                    <h1
                      className="text-gray-600 hover:cursor-pointer transition-all"
                      onClick={() =>
                        router.push(`/productManager/product-details/${id}`)
                      }
                    >
                      TRL Level
                    </h1>
                    <MdOutlineArrowForwardIos
                      className="text-gray-400"
                      size={17}
                    />
                    <h1 className="text-primary font-bold hover:cursor-context-menu">
                      {trlLevelName}
                    </h1>
                  </div>

                  {/* /7/7/7 */}
                </div>

                {/* /7/7/7 */}
              </div>

              {/* /7/7/7 */}
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
                        <th className="py-3 px-6 text-left">TRL SEGREGATION</th>
                        <th className="py-3 px-6 text-left">DESCRIPTION</th>
                        <th className="py-3 px-6 text-left">CURRENT UPDATE</th>
                        <th className="py-3 px-6 text-left">STATUS</th>
                        <th className="py-3 px-6 text-left">ACTIONS</th>
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
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(item);
                                }}
                                className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#5D4FEF] to-[#4a3ecb] p-2 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
                              >
                                <span className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
                                <Pencil
                                  size={23}
                                  className="text-white transition-colors duration-300 group-hover:text-[#d1d5db]"
                                />
                              </button>
                            </div>
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
        {showPopupEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-5/6 max-h-[90vh] overflow-hidden">
              <div className="max-h-[85vh] overflow-y-auto">
                <div className="flex flex-row justify-between items-start sticky top-0 bg-white z-10">
                  <div>
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2 tracking-wide">
                      <span className="relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-prtext-primary after:transition-all after:duration-300 hover:after:w-full">
                        Modify Panel
                      </span>
                    </h3>

                    <h3 className="text-lg items-start font-semibold text-black">
                      {selectedItem?.segregation || "TRL SEGREGATION"}
                    </h3>
                  </div>

                  <p
                    onClick={() => {
                      setShowPopupEdit(false);
                      setTouchedFields({}); // Reset touched fields when closing
                    }}
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
                      <p className="text-md font-regular text-black mt-2 flex items-center">
                        Description <span className="text-red-500">*</span>
                      </p>
                      <textarea
                        value={formData?.description || ""}
                        onChange={(e) =>
                          setFormData(
                            formData
                              ? {
                                  ...formData,
                                  description: e.target.value,
                                }
                              : null
                          )
                        }
                        onBlur={() =>
                          setTouchedFields((prev) => ({
                            ...prev,
                            description: true,
                          }))
                        }
                        placeholder="Enter the Description of the Stage"
                        className={`w-full p-2 border 
                          ${
                            touchedFields.description && !formData?.description
                              ? "border-red-300"
                              : "border-gray-300"
                          } 
                          text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none`}
                        rows={4}
                        style={{ textAlign: "justify" }}
                      />
                      <h1>
                        {touchedFields.description &&
                          !formData?.description && (
                            <span className="text-red-500 text-sm ml-1">
                              Description Required
                            </span>
                          )}
                      </h1>

                      <p className="text-md font-regular text-black mt-2">
                        Current Update <span className="text-red-500">*</span>
                      </p>
                      <textarea
                        value={formData?.currentUpdate || ""}
                        onChange={(e) =>
                          setFormData(
                            formData
                              ? {
                                  ...formData,
                                  currentUpdate: e.target.value,
                                }
                              : null
                          )
                        }
                        onBlur={() =>
                          setTouchedFields((prev) => ({
                            ...prev,
                            currentUpdate: true,
                          }))
                        }
                        placeholder="Enter the Current Update of the Stage"
                        className={`w-full p-2 border 
                          ${
                            touchedFields.currentUpdate &&
                            !formData?.currentUpdate
                              ? "border-red-300"
                              : "border-gray-300"
                          } 
                          text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none`}
                        rows={4}
                        style={{ textAlign: "justify" }}
                      />

                      <h1>
                        {touchedFields.currentUpdate &&
                          !formData?.currentUpdate && (
                            <span className="text-red-500 text-sm ml-1">
                              Current Update Required
                            </span>
                          )}
                      </h1>

                      <p className="text-md font-regular text-black mt-2">
                        Demo Required
                      </p>

                      <Select
                        options={[
                          { value: "true", label: "Yes" },
                          { value: "false", label: "No" },
                        ]}
                        value={{
                          value: formData?.demoRequired ? "true" : "false",
                          label: formData?.demoRequired ? "Yes" : "No",
                        }}
                        onChange={(selectedOption) => {
                          if (selectedOption) {
                            const boolValue = selectedOption.value === "true";
                            if (formData) {
                              setFormData({
                                ...formData,
                                demoRequired: boolValue,
                                // Reset demoStatus when switching to No
                                demoStatus: boolValue
                                  ? formData.demoStatus
                                  : "",
                              });
                            }
                          }
                        }}
                        className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        menuPortalTarget={document.body} // This ensures the menu is portalled to the body
                        menuPosition="absolute"
                        styles={commonSelectStyles}
                      />
                      {formData?.demoRequired && (
                        <>
                          <p className="text-md font-regular text-black mt-2">
                            Demo Status
                          </p>
                          <div className="relative z-[1000]">
                            {" "}
                            {/* Add this wrapper div */}
                            <Select
                              options={[
                                { value: "completed", label: "Completed" },
                                { value: "pending", label: "Pending" },
                              ]}
                              value={{
                                value: formData?.demoStatus || "pending",
                                label: formData?.demoStatus
                                  ? formData.demoStatus
                                      .charAt(0)
                                      .toUpperCase() +
                                    formData.demoStatus.slice(1)
                                  : "Pending",
                              }}
                              onChange={(selectedOption) => {
                                if (selectedOption) {
                                  setFormData(
                                    formData
                                      ? {
                                          ...formData,
                                          demoStatus: selectedOption.value,
                                        }
                                      : null
                                  );
                                }
                              }}
                              className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                              menuPortalTarget={document.body}
                              menuPosition="absolute"
                              menuPlacement="auto"
                              styles={commonSelectStyles}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="w-1/2 flex flex-col">
                      <p className="text-md font-regular text-black mt-2">
                        Documentation Link
                      </p>
                      {/* <textarea
                        value={formData?.documentationLink || ""}
                        onChange={(e) =>
                          setFormData(
                            formData
                              ? {
                                  ...formData,
                                  documentationLink: e.target.value,
                                }
                              : null
                          )
                        }
                        onBlur={(e) => {
                          const links = e.target.value
                            .split(",")
                            .map((link) => link.trim())
                            .filter((link) => link !== "");

                          const urlPattern =
                            /^(https?:\/\/)?([\w.-]+)(\.[\w.-]+)(\/[\w.-]*)*\/?$/;

                          if (links.some((link) => !urlPattern.test(link))) {
                            alert("One or more links are invalid");
                          }
                        }}
                        placeholder="Provide the Document Links (comma separated)"
                        className={`w-full p-2 border ${
                          formData?.documentationLink &&
                          formData.documentationLink
                            .split(",")
                            .some(
                              (link) =>
                                !/^(https?:\/\/)?([\w.-]+)(\.[\w.-]+)(\/[\w.-]*)*\/?$/.test(
                                  link.trim()
                                )
                            )
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-secondary"
                        } text-black rounded-md focus:outline-none resize-none`}
                        rows={2}
                      /> */}

                      {/* <textarea
                        value={formData?.documentationLink || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(
                            formData
                              ? { ...formData, documentationLink: value }
                              : null
                          );

                          const links = value
                            .split(",")
                            .map((link) => link.trim())
                            .filter((link) => link !== "");

                          const urlPattern =
                            /^(https?:\/\/)?([\w.-]+)(\.[\w.-]+)(\/[\w.-]*)*\/?$/;

                          const invalidLinks = links.filter(
                            (link) => !urlPattern.test(link)
                          );

                          if (invalidLinks.length > 0) {
                            alert(
                              `Invalid link(s) found:\n\n${invalidLinks.join(
                                "\n"
                              )}\n\nPlease provide valid links.`
                            );
                          }
                        }}
                        placeholder="Provide the Document Links (comma separated)"
                        className={`w-full p-2 border ${
                          formData?.documentationLink &&
                          formData.documentationLink
                            .split(",")
                            .some(
                              (link) =>
                                !/^(https?:\/\/)?([\w.-]+)(\.[\w.-]+)(\/[\w.-]*)*\/?$/.test(
                                  link.trim()
                                )
                            )
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-secondary"
                        } text-black rounded-md focus:outline-none resize-none`}
                        rows={2}
                      /> */}

                      <textarea
                        value={formData?.documentationLink || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(
                            formData
                              ? { ...formData, documentationLink: value }
                              : null
                          );
                        }}
                        onBlur={(e) => {
                          const links = e.target.value
                            .split(",")
                            .map((link) => link.trim())
                            .filter((link) => link !== "");

                          const urlPattern =
                            /^(https?:\/\/)?((([\w-]+\.)+[\w-]+)|localhost)(:\d+)?(\/[\w-.~:/?#[\]@!$&'()*+,;=%]*)?$/;

                          if (links.some((link) => !urlPattern.test(link))) {
                            notify("Please provide valid links", "warning");
                          }
                        }}
                        placeholder="Provide the Document Links (comma separated)"
                        className={`w-full p-2 border ${
                          formData?.documentationLink &&
                          formData.documentationLink
                            .split(",")
                            .some(
                              (link) =>
                                !/^(https?:\/\/)?((([\w-]+\.)+[\w-]+)|localhost)(:\d+)?(\/[\w-.~:/?#[\]@!$&'()*+,;=%]*)?$/.test(
                                  link.trim()
                                )
                            )
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-secondary"
                        } text-black rounded-md focus:outline-none resize-none`}
                        rows={2}
                      />

                      {/* <textarea
                        value={formData?.documentationLink || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(
                            formData
                              ? { ...formData, documentationLink: value }
                              : null
                          );
                        }}
                        onBlur={(e) => {
                          const links = e.target.value
                            .split(",")
                            .map((link) => link.trim())
                            .filter((link) => link !== "");

                          const urlPattern =
                            /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;

                          if (links.some((link) => !urlPattern.test(link))) {
                            alert("Please provide valid links");
                          }
                        }}
                        placeholder="Provide the Document Links (comma separated)"
                        className={`w-full p-2 border ${
                          formData?.documentationLink &&
                          formData.documentationLink
                            .split(",")
                            .some(
                              (link) =>
                                !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(
                                  link.trim()
                                )
                            )
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-secondary"
                        } text-black rounded-md focus:outline-none resize-none`}
                        rows={2}
                      /> */}

                      {/* <textarea
                        value={formData?.documentationLink || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(
                            formData
                              ? { ...formData, documentationLink: value }
                              : null
                          );

                          const links = value
                            .split(",")
                            .map((link) => link.trim())
                            .filter((link) => link !== "");

                          const urlPattern =
                            /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;

                          if (links.some((link) => !urlPattern.test(link))) {
                            alert("Please provide valid links");
                          }
                        }}
                        placeholder="Provide the Document Links (comma separated)"
                        className={`w-full p-2 border ${
                          formData?.documentationLink &&
                          formData.documentationLink
                            .split(",")
                            .some(
                              (link) =>
                                !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(
                                  link.trim()
                                )
                            )
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-secondary"
                        } text-black rounded-md focus:outline-none resize-none`}
                        rows={2}
                      /> */}

                      {/* <textarea
                        value={formData?.documentationLink || ""}
                        onChange={(e) =>
                          setFormData(
                            formData
                              ? {
                                  ...formData,
                                  documentationLink: e.target.value,
                                }
                              : null
                          )
                        }
                        onBlur={(e) => {
                          const links = e.target.value
                            .split(",")
                            .map((link) => link.trim())
                            .filter((link) => link !== "");

                          const urlPattern =
                            /^(https?:\/\/)?([\w.-]+)(\.[\w.-]+)(\/[\w.-]*)*\/?$/;

                          const invalidLinks = links.filter(
                            (link) => !urlPattern.test(link)
                          );

                          if (invalidLinks.length > 0) {
                            alert(
                              `Invalid link(s) found:\n\n${invalidLinks.join(
                                "\n"
                              )}\n\nPlease provide valid links.`
                            );
                          }
                        }}
                        placeholder="Provide the Document Links (comma separated)"
                        className={`w-full p-2 border ${
                          formData?.documentationLink &&
                          formData.documentationLink
                            .split(",")
                            .some(
                              (link) =>
                                !/^(https?:\/\/)?([\w.-]+)(\.[\w.-]+)(\/[\w.-]*)*\/?$/.test(
                                  link.trim()
                                )
                            )
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-secondary"
                        } text-black rounded-md focus:outline-none resize-none`}
                        rows={2}
                      /> */}

                      <p className="text-md font-regular text-black mt-2">
                        Any Others Notes
                      </p>
                      <textarea
                        value={formData?.otherNotes || ""}
                        onChange={(e) =>
                          setFormData(
                            formData
                              ? {
                                  ...formData,
                                  otherNotes: e.target.value,
                                }
                              : null
                          )
                        }
                        placeholder="Enter any other notes"
                        className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                        rows={4}
                        style={{ textAlign: "justify" }}
                      />

                      <div className="flex flex-row gap-4">
                        <div>
                          <p className="text-md font-regular text-black mt-2">
                            Start Date <span className="text-red-500">*</span>
                          </p>
                          <DatePicker
                            selected={formData?.startDate || null}
                            onChange={(date: Date | null) =>
                              formData &&
                              setFormData({
                                ...formData,
                                startDate: date,
                                // Clear later dates if start date is after them
                                estimatedDate:
                                  date &&
                                  formData.estimatedDate &&
                                  date > formData.estimatedDate
                                    ? null
                                    : formData.estimatedDate,
                                extendedDate:
                                  date &&
                                  formData.extendedDate &&
                                  date > formData.extendedDate
                                    ? null
                                    : formData.extendedDate,
                              })
                            }
                            onBlur={() =>
                              setTouchedFields((prev) => ({
                                ...prev,
                                startDate: true,
                              }))
                            }
                            className={`w-28 p-2 border ${
                              touchedFields.startDate && !formData?.startDate
                                ? "border-red-300"
                                : "border-gray-300"
                            } text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary`}
                            dateFormat="dd/MM/yyyy"
                          />
                          <h1>
                            {touchedFields.startDate &&
                              !formData?.startDate && (
                                <span className="text-red-500 text-sm ml-1">
                                  Required
                                </span>
                              )}
                          </h1>
                        </div>

                        <div>
                          <p className="text-md font-regular text-black mt-2">
                            Estimated Date{" "}
                            <span className="text-red-500">*</span>
                          </p>
                          <DatePicker
                            selected={formData?.estimatedDate || null}
                            onChange={(date: Date | null) =>
                              formData &&
                              setFormData({
                                ...formData,
                                estimatedDate: date,
                                // Clear extended date if estimated date is after it
                                extendedDate:
                                  date &&
                                  formData.extendedDate &&
                                  date > formData.extendedDate
                                    ? null
                                    : formData.extendedDate,
                              })
                            }
                            onBlur={() =>
                              setTouchedFields((prev) => ({
                                ...prev,
                                estimatedDate: true,
                              }))
                            }
                            className={`w-28 p-2 border ${
                              touchedFields.estimatedDate &&
                              !formData?.estimatedDate
                                ? "border-red-300"
                                : "border-gray-300"
                            } text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary`}
                            dateFormat="dd/MM/yyyy"
                            // placeholderText="Select estimated date"
                            minDate={formData?.startDate || undefined} // Add one day to start date
                            disabled={!formData?.startDate}
                          />

                          <h1>
                            {touchedFields.estimatedDate &&
                              !formData?.estimatedDate && (
                                <span className="text-red-500 text-sm ml-1">
                                  Required
                                </span>
                              )}
                          </h1>
                        </div>

                        <div>
                          <p className="text-md font-regular text-black mt-2">
                            Extended Date
                          </p>
                          <DatePicker
                            selected={formData?.extendedDate || null}
                            onChange={(date: Date | null) =>
                              formData &&
                              setFormData({ ...formData, extendedDate: date })
                            }
                            className="w-28 p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                            dateFormat="dd/MM/yyyy"
                            minDate={
                              formData?.estimatedDate
                                ? new Date(
                                    formData.estimatedDate.getTime() + 86400000
                                  )
                                : undefined
                            } // Add one day to estimated date
                            disabled={!formData?.estimatedDate}
                          />
                        </div>
                      </div>

                      <p className="text-md font-regular text-black mt-2">
                        Status
                      </p>

                      <StatusSelect
                        value={formData?.status || ""}
                        onChange={(value) =>
                          setFormData(
                            formData ? { ...formData, status: value } : null
                          )
                        }
                        isDisabled={!canMarkAsCompleted(formData)}
                        className="w-36 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Select status"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setShowPopupEdit(false);
                        setTouchedFields({}); // Reset touched fields when canceling
                      }}
                      className="px-4 py-2 bg-red1 rounded-md hover:bg-red2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitEdit}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
                    >
                      Update
                    </button>
                    ;
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
                      
                      <div className="w-full p-2 border text-black rounded-md bg-gray-50">
                        {formData?.documentationLink
                          ? formData.documentationLink
                              .split(",")
                              .map((link, index) =>
                                link.trim() ? (
                                  <a
                                    key={index}
                                    href={link.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-500 hover:underline truncate"
                                  >
                                    {link.trim()}
                                  </a>
                                ) : null
                              )
                          : "-"}
                      </div>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="max-w-3xl w-full">
            <Expand
              title={expandedContent.title}
              onClose={() => setExpandedContent(null)}
            >
              <div className="p-4">
                <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">
                  {expandedContent.content}
                </p>
              </div>
            </Expand>
          </div>
        </div>
      )}
    </div>
  );
}
