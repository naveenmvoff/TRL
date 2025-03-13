"use client";
import { Pencil, FileText } from "lucide-react";
import NavBar from "@/components/navbar/navbar";
import SideBar from "@/components/sidebar-pm";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ObjectId } from "mongoose";
import Select from "react-select";

import DatePicker from "react-datepicker";

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

const formatDate = (date: Date | null) => {
  if (!date) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function ProductManager() {
  const params = useParams();
  const searchParams = useSearchParams();
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
  const [formData, setFormData] = useState<FormDataValue | null>(null);
  console.log("formData", formData);

  const paramsing = useParams();
  const id = paramsing.id as string;

  // // =============GET TRL LEVEL DETAILS from LevelData Schema===============
  useEffect(() => {
    const fetchTrlDetails = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/trl-level?productId=${id}`);
        const data = await response.json();
        console.log("TRL Details : ", data.data);

        if (data.success) {
          setTrlLevelContent(
            data.data.map((item: any) => ({
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
      }
    };

    fetchTrlDetails();
  }, [id]);

  // Filter trlLevelContent based on trlId
  const filteredContent = trlLevelContent.filter(
    (item: any) => item.trlLevelId === trlId
  );

  console.log("Filtered TRL Content:", filteredContent);

  // Combine subLevels with trlLevelContent
  const combinedTrlItems = subLevels.map((subLevel: any) => {
    // Find matching content from trlLevelContent
    const matchingContent = trlLevelContent.find(
      (content: any) => content.subLevelId === subLevel._id
    );
    // console.log("Matching Content:", matchingContent);

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

    try {
      console.log("formData recived!", formData);
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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavBar role="Product Manager" />
      <div className="flex flex-1">
        {" "}
        {/* Changed this container */}
        <div className="min-w-[180px] max-w-[240px] flex-shrink-0 border-r bg-white">
          <SideBar />
        </div>
        <div className="flex-1 overflow-y-auto">
          <main className="bg-gray-100 p-6 min-h-[calc(100vh-4rem)]">
            <div className="bg-white rounded-md shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-medium text-gray-800">
                  Product Details
                </h2>
                <h3 className="text-lg font-medium text-gray-700 mt-2">
                  TRL {trlLevelNumber} - {trlLevelName}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-t border-b text-sm text-gray-600">
                      <th className="py-3 px-6 text-left font-medium">
                        TRL SEGREGATION
                      </th>
                      <th className="py-3 px-6 text-left font-medium">
                        DESCRIPTION
                      </th>
                      <th className="py-3 px-6 text-left font-medium">
                        CURRENT UPDATED
                      </th>
                      <th className="py-3 px-6 text-left font-medium">
                        STATUS
                      </th>
                      <th className="py-3 px-6 text-left font-medium">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedTrlItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b cursor-pointer hover:bg-gray-100"
                        onClick={() => handleView(item)}
                      >
                        <td className="py-4 px-6 text-black">
                          {item.segregation}
                        </td>
                        <td className="py-4 px-6 text-black">
                          {item.description}
                        </td>
                        <td className="py-4 px-6 text-black">
                          {item.currentUpdated}
                        </td>
                        <td className="py-4 px-6 text-black">
                          <span
                            className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                              item.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : item.status === "progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
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
          </main>
        </div>
        {showPopupEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-lg w-5/6 max-h-[100vh] overflow-hidden">
              {/* <div className="max-h-[90vh] overflow-y-auto "> */}
              <div className="max-h-[90vh] overflow-y-auto ">
                <div className="flex flex-row justify-between items-start sticky top-0 bg-white  overflow-y-auto">
                  <div>
                    {/* <h3 className="text-lg font-semibold text-blue-500 flex items-center gap-2">
                      <span className="border-b-2 border-blue-500">
                        EDIT TAB
                      </span>
                    </h3> */}

                    <h3 className="text-xl font-bold text-blue-500 flex items-center gap-2 tracking-wide">
                      <span className="relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full">
                        Modify Panel
                      </span>
                    </h3>

                    <h3 className="text-lg items-start font-semibold text-black">
                      {selectedItem?.segregation || "TRL SEGREGATION"}
                    </h3>
                  </div>

                  <p
                    onClick={() => setShowPopupEdit(false)}
                    className="text-lg font-semibold text-red1 hover:text-black hover:font-bold"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
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
                        placeholder="Enter the Description of the Stage"
                        className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                        rows={4}
                      />

                      <p className="text-md font-regular text-black mt-2">
                        Current Update
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
                        placeholder="Enter the Current Update of the Stage"
                        className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                        rows={4}
                      />

                      <p className="text-md font-regular text-black mt-2">
                        Demo Required
                      </p>

                      <Select
                        options={[
                          { value: true, label: "Yes" },
                          { value: false, label: "No" },
                        ]}
                        value={{
                          value: formData?.demoRequired || false,
                          label: formData?.demoRequired ? "Yes" : "No",
                        }}
                        onChange={(e: any) =>
                          formData &&
                          setFormData({
                            ...formData,
                            demoRequired: e.value,
                            description: formData.description,
                            currentUpdate: formData.currentUpdate,
                            documentationLink: formData.documentationLink,
                            otherNotes: formData.otherNotes,
                            demoStatus: formData.demoStatus,
                            status: formData.status,
                          })
                        }
                        className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                      />

                      <p className="text-md font-regular text-black mt-2">
                        If Yes, Demo Status
                      </p>

                      <Select
                        options={[
                          { value: "completed", label: "completed" },
                          { value: "pending", label: "pending" },
                        ]}
                        value={{
                          value: formData?.demoStatus || "",
                          label: formData?.demoStatus || "",
                        }}
                        onChange={(e: any) =>
                          setFormData(
                            formData
                              ? {
                                  ...formData,
                                  demoStatus: e.value,
                                  description: formData.description,
                                  currentUpdate: formData.currentUpdate,
                                  documentationLink: formData.documentationLink,
                                  otherNotes: formData.otherNotes,
                                  demoRequired: formData.demoRequired,
                                  status: formData.status,
                                }
                              : null
                          )
                        }
                        className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                    </div>

                    <div className="w-1/2 flex flex-col">
                      <p className="text-md font-regular text-black mt-2">
                        Documentation Link
                      </p>
                      <textarea
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
                        placeholder="Provide the Document Link"
                        className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                        rows={1}
                      />

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
                      />

                      <div className="flex flex-row gap-4">
                        <div className="pr-4">
                          <p className="w-28 text-md font-regular text-black mt-2">
                            Start Date
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
                            className="w-28 p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select start date"
                          />
                        </div>

                        <div className="pr-4">
                          <p className="w-28 text-md font-regular text-black mt-2">
                            Estimated Date
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
                            className="w-28 p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select estimated date"
                            minDate={formData?.startDate || undefined} // Add one day to start date
                            disabled={!formData?.startDate}
                          />
                        </div>

                        <div className="pr-4">
                          <p className="w-28 text-md font-regular text-black mt-2">
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
                            placeholderText="Select extended date"
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

                      <Select
                        options={[
                          { value: "Completed", label: "Completed" },
                          { value: "In Progress", label: "In Progress" },
                          { value: "Pending", label: "Pending" },
                        ]}
                        value={{
                          value: formData?.status || "",
                          label: formData?.status || "",
                        }}
                        onChange={(e: any) =>
                          formData &&
                          setFormData({
                            ...formData,
                            status: e.value,
                          })
                        }
                        className="w-36 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          menu: (base) => ({
                            ...base,
                            position: "relative",
                            zIndex: 9999,
                          }),
                          control: (base) => ({
                            ...base,
                            background: "white",
                            borderColor: "#e2e8f0",
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? "#5D4FEF"
                              : "white",
                            color: state.isSelected ? "white" : "black",
                            "&:hover": {
                              backgroundColor: state.isSelected
                                ? "#5D4FEF"
                                : "#deebff",
                              color: state.isSelected ? "white" : "black",
                            },
                          }),
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      onClick={() => setShowPopupEdit(false)}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-lg w-5/6 max-h-[100vh] overflow-hidden">
              <div className="max-h-[90vh] overflow-y-auto ">
                <div className="flex flex-row justify-between items-start sticky top-0 bg-white  overflow-y-auto">
                  <div>
                    <h3 className="text-xl font-bold text-blue-500 flex items-center gap-2 tracking-wide">
                      <span className="relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full">
                        View Panel
                      </span>
                    </h3>
                    <h3 className="text-lg items-start font-semibold text-black">
                      {selectedItem?.segregation || "TRL SEGREGATION"}
                    </h3>
                  </div>
                  <p
                    onClick={() => setShowPopupView(false)}
                    className="text-lg font-semibold text-red1 hover:text-black hover:font-bold"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
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
                      <p className="w-full p-2 border text-black rounded-md bg-gray-50">
                        {formData?.description || "-"}
                      </p>

                      <p className="text-md font-regular text-black mt-2">
                        Current Update
                      </p>
                      <p className="w-full p-2 border text-black rounded-md bg-gray-50">
                        {formData?.currentUpdate || "-"}
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
                      <p className="w-full p-2 border text-black rounded-md bg-gray-50">
                        {formData?.otherNotes || "-"}
                      </p>
                      <div className="flex flex-row gap-4">
                        <div>
                          <p className="text-md font-regular text-black mt-2">
                            Start Date
                          </p>
                          <p className="w-28 p-2 border text-black rounded-md bg-gray-50">
                            {formatDate(formData?.startDate) || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-md font-regular text-black mt-2">
                            Estimated Date
                          </p>
                          <p className="w-28 p-2 border text-black rounded-md bg-gray-50">
                            {formatDate(formData?.estimatedDate) || "-"}
                          </p>
                        </div>

                        <div className="pr-4">
                          <p className="text-md font-regular text-black mt-2">
                            Extended Date
                          </p>
                          <p className="w-28 p-2 border text-black rounded-md bg-gray-50">
                            {formatDate(formData?.extendedDate) || "-"}
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
    </div>
  );
}
