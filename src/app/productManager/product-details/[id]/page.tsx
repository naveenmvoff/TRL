"use client"; // This is required at the top for client components in Next.js App Router

import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar-pm";

import { useParams } from "next/navigation";
import { ObjectId } from "mongoose";

interface TRLItem {
  id: number;
  level: number;
  maturityLevel: string;
  startDate: string;
  estimatedDate: string;
  extendedDate?: string;
  status: "Completed" | "In Progress" | "Pending";
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

export default function ProductDetails() {
  const [trlItems, setTrlItems] = useState<TRLItem[]>([
    // {
    //   id: 1,
    //   level: 1,
    //   maturityLevel: "Research & Exploration",
    //   startDate: "2025-01-10",
    //   estimatedDate: "2025-02-10",
    //   status: "Completed",
    // }

  ]);

  const trlItemsArray = trlItems.map((item) => ({
    /////////////////////////////////////////////////////////////////////////// TO BE CONTINUED
  }))
  // const [trlItems, setTrlItems] = useState([]);
  console.log("trlItems   ********: ", trlItems);

  const completedItems = trlItems.filter(
    (item) => item.status === "Completed"
  ).length;
  const progressPercentage = Math.round(
    (completedItems / trlItems.length) * 100
  );

  const [productDetails, setProductDetails] = useState<ProductDetails | null>(
    null
  );

  console.log("TRL ITEMS: ", trlItems);
  // console.log("productDetails******** : ", productDetails);

  const params = useParams();
  const id = params.id as string;
  // console.log("Product ID: ", id);

  // // =============GET PRODUCT DETAILS===============
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/product-manager/product?id=${id}`);
        const data = await response.json();
        // console.log("ProductDetails : ", data);
        setProductDetails(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProductDetails();
  }, [id]);

  // // =============GET TRL LEVEL DETAILS===============
  useEffect(() => {
    const fetchTrlDetails = async () => {
      try {
        const response = await fetch("/api/trl");
        const data = await response.json();
        console.log("TRL Master Data=====", data);

        if (data.success) {
          // Update your state with the TRL data
          console.log("TRL Master Data of Data=====", data);
          setTrlItems(data.data);
        } else {
          console.error("Failed to fetch TRL details:", data.error);
        }
      } catch (error) {
        console.error("Error fetching TRL details:", error);
      }
    };

    fetchTrlDetails();
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      <NavBar role="Product Manager" />
      <div className="flex flex-col sm:flex-row">
        <Sidebar />

        <div className="flex-1 flex justify-center">
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
                <div key={section.title} className="mb-4">
                  <h3 className="text-base font-semibold text-gray-700">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
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
                          "Actions",
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
                          key={item.id}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } text-sm`}
                        >
                          <td className="pl-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">
                                {item.level}
                              </div>
                              <span className="font-semibold">
                                TRL {item.level}
                              </span>
                            </div>
                          </td>
                          <td className="pl-4 py-3 whitespace-nowrap">
                            {item.maturityLevel}
                          </td>
                          <td className="pl-4 py-3 whitespace-nowrap">
                            {item.startDate || "-"}
                          </td>
                          <td className="pl-4 py-3 whitespace-nowrap">
                            {item.estimatedDate || "-"}
                          </td>
                          <td className="pl-4 py-3 whitespace-nowrap">
                            {item.extendedDate || "-"}
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
                          <td className="pl-4 py-3 whitespace-nowrap">
                            <button className="text-primary hover:text-primary2 transition">
                              <Pencil className="h-4 w-4" />
                            </button>
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
          </div>
        </div>
      </div>
    </div>
  );
}
