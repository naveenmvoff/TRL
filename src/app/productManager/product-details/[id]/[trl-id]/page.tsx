"use client";
import { Pencil, FileText } from "lucide-react";
import NavBar from "@/components/navbar/navbar";
import SideBar from "@/components/sidebar-pm";
import { useParams } from "next/navigation";

interface TRLItem {
  id: string;
  segregation: string;
  description: string;
  currentUpdated: string;
  status: "Completed" | "In Progress" | "Pending";
}

export default function ProductManager() {
  const params = useParams();
  const trlItems: TRLItem[] = [
    {
      id: "1",
      segregation: "Objectives and Goals",
      description: "Objectives and Goals",
      currentUpdated: "Objectives and Goals",
      status: "Completed",
    },
    {
      id: "2",
      segregation: "Research Findings",
      description: "Research Findings",
      currentUpdated: "Research Findings",
      status: "Completed",
    },
    {
      id: "3",
      segregation: "Market Analysis",
      description: "Market Analysis",
      currentUpdated: "Market Analysis",
      status: "Completed",
    },
    {
      id: "4",
      segregation: "Problem Identification",
      description: "Problem Identification",
      currentUpdated: "Problem Identification",
      status: "Completed",
    },
    {
      id: "5",
      segregation: "Technical Boundaries",
      description: "Technical Boundaries",
      currentUpdated: "Technical Boundaries",
      status: "Completed",
    },
    {
      id: "6",
      segregation: "Concept Development",
      description: "Concept Development",
      currentUpdated: "Concept Development",
      status: "Completed",
    },
    {
      id: "7",
      segregation: "Stakeholder Engagement",
      description: "Stakeholder Engagement",
      currentUpdated: "Stakeholder Engagement",
      status: "Completed",
    },
    {
      id: "8",
      segregation: "Next Steps",
      description: "Next Steps",
      currentUpdated: "Next Steps",
      status: "In Progress",
    },
    {
      id: "9",
      segregation: "Challenges and Barriers",
      description: "Enter Description",
      currentUpdated: "Enter Progress Level",
      status: "Pending",
    },
  ];

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
                  TRL 1 - Research & Exploration
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
                        EDIT/VIEW
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trlItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-4 px-6">{item.segregation}</td>
                        <td className="py-4 px-6">{item.description}</td>
                        <td className="py-4 px-6">{item.currentUpdated}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                              item.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : item.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <button className="text-[#5D4FEF]">
                              <Pencil size={18} />
                            </button>
                            <button className="text-[#5D4FEF]">
                              <FileText size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
