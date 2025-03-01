"use client";  // This is required at the top for client components in Next.js App Router

import React, { useState } from "react";
import { Pencil } from "lucide-react";
import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";

// Define types
interface TeamMember {
  id: number;
  name: string;
  role: string;
}

interface TRLItem {
  id: number;
  level: number;
  maturityLevel: string;
  startDate: string;
  estimatedDate: string;
  extendedDate?: string;
  status: "Completed" | "In Progress" | "Pending";
}

export default function ProductDetails() {
  const [teamMembers] = useState<TeamMember[]>([
    { id: 1, name: "John Doe", role: "UI/UX Designer" },
    { id: 2, name: "Jane Smith", role: "UI Designer" },
  ]);

  const [trlItems] = useState<TRLItem[]>([
    { id: 1, level: 1, maturityLevel: "Concept", startDate: "2025-01-10", estimatedDate: "2025-02-10", status: "Completed" },
    { id: 2, level: 2, maturityLevel: "Technology Formulated", startDate: "2025-02-12", estimatedDate: "2025-04-10", extendedDate: "2025-04-20", status: "In Progress" },
    { id: 3, level: 3, maturityLevel: "Proof of Concept", startDate: "", estimatedDate: "", status: "Pending" },
  ]);

  const completedItems = trlItems.filter((item) => item.status === "Completed").length;
  const progressPercentage = Math.round((completedItems / trlItems.length) * 100);

  const handleAddNewMember = () => {
    alert("Implement 'Add New Member' functionality.");
  };

  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      <NavBar role="Product Manager" />
      <div className="flex flex-col sm:flex-row">
        <Sidebar />

        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Product Details and Team Members */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Details */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-primary mb-4">Product Details</h2>
                {[
                  { title: "TechFlow", content: "Lorem Ipsum is simply dummy text..." },
                  { title: "Problem Statement", content: "Lorem Ipsum is simply dummy text..." },
                  { title: "Solution Expected", content: "Lorem Ipsum is simply dummy text..." },
                ].map((section) => (
                  <div key={section.title} className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">{section.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{section.content}</p>
                  </div>
                ))}
              </div>

              {/* Team Members */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-primary">Team Members</h2>
                  <button
                    onClick={handleAddNewMember}
                    className="text-sm text-primary hover:underline"
                  >
                    + Add New Member
                  </button>
                </div>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TRL Progress Bar */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">TRL Progress</h2>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xl font-bold">{progressPercentage}%</span>
              </div>
            </div>

            {/* TRL Work Flow Table */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">TRL Work Flow</h2>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                  <table className="w-full min-w-[600px] border-collapse">
                    <thead className="bg-gray-100 text-black text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        {["TRL Level", "Maturity Level", "Start Date", "Estimated Date", "Extended Date", "Status", "Actions"].map((header) => (
                          <th key={header} className="pl-4 py-3 text-left uppercase tracking-wide">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {trlItems.map((item, index) => (
                        <tr key={item.id} className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} text-sm`}>
                          <td className="pl-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">
                                {item.level}
                              </div>
                              <span className="font-semibold">TRL {item.level}</span>
                            </div>
                          </td>
                          <td className="pl-4 py-3 whitespace-nowrap">{item.maturityLevel}</td>
                          <td className="pl-4 py-3 whitespace-nowrap">{item.startDate || "-"}</td>
                          <td className="pl-4 py-3 whitespace-nowrap">{item.estimatedDate || "-"}</td>
                          <td className="pl-4 py-3 whitespace-nowrap">{item.extendedDate || "-"}</td>
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
