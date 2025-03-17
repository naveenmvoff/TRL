"use client";

import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar-stakeholders";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart2, Download, RefreshCw } from "lucide-react";

export default function ProductOverview() {
  const { data: Session } = useSession();
  console.log("Session:", Session?.user?.id);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trlLevels, setTrlLevels] = useState<any[] | null>(null);
  const [products, setProducts] = useState<any[] | null>(null);
  const [recivedProductIDs, setRecivedProductIDs] = useState<any[] | null>([]);
  const [trlItemsData, setTrlItemsData] = useState<any[] | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productProgressData, setProductProgressData] = useState<any[]>([]);

  console.log("products ", products);
  console.log("trlItemsData ", trlItemsData);
  // State for active section
  const [activeSection, setActiveSection] = useState<string>("overview");

  // Function to handle product selection
  const handleProductSelection = (productID: string) => {
    console.log("Selecting product:", productID);
    setRecivedProductIDs((prev) => {
      if (prev.includes(productID)) {
        return prev.filter((id) => id !== productID);
      }
      return [...prev, productID];
    });
  };

  // Function to change the active section
  const changeSection = (section: string) => {
    setActiveSection(section);
  };

  // =============GET TRL MASTER DETAILS from TRL MASTER Schema===============
  useEffect(() => {
    const fetchTrlMasterData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/trl");
        console.log("TRL API response received");
        const data = await response.json();
        console.log("TRL Master Data:", data?.data);

        if (data.success) {
          // Process TRL data
          setTrlLevels(data.data);
          setTimeout(() => setIsLoading(false), 500); // Simulate loading for demo
        } else {
          setError(data.error || "Failed to fetch TRL details");
          console.error("Failed to fetch TRL details:", data.error);
          setIsLoading(false);
        }
      } catch (error) {
        console.log("Unable to GET TRL Details", error);
        setError("Failed to fetch TRL details");
        setIsLoading(false);
      }
    };

    fetchTrlMasterData();
  }, []);

  // Fetch products for the user
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!Session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/stakeholder/products?userID=${Session.user.id}`
        );
        const data = await response.json();
        console.log("Products data:", data);

        if (data.success) {
          setProducts(data.products);
          // Store all product IDs from the API response
          if (data.products && data.products.length > 0) {
            const allProductIds = data.products.map(
              (product: any) => product._id
            );
            setRecivedProductIDs(allProductIds);
          }
        } else {
          console.error("Failed to fetch products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (Session?.user?.id) {
      fetchUserProducts();
    }
  }, [Session]);

  // =============GET TRL LEVEL DETAILS from LevelData Schema===============
  useEffect(() => {
    const fetchTrlDetails = async () => {
      if (!recivedProductIDs || recivedProductIDs.length === 0) return;
      try {
        setIsLoading(true);
        console.log("Fetching TRL details for product IDs:", recivedProductIDs);

        // Fetch data for all selected products
        const results = await Promise.all(
          recivedProductIDs.map(async (productId) => {
            const detailsResponse = await fetch(
              `/api/trl-level?productId=${productId}`
            );
            const data = await detailsResponse.json();

            if (data.success) {
              // If this product has TRL data, return it with the product ID
              console.log("suss");
              return {
                productId,
                trlData: data.data,
              };
            }
            return {
              productId,
              trlData: [],
            };
          })
        );

        // Process and combine all TRL data
        const processedData = results.reduce((acc: any[], result) => {
          if (result.trlData && result.trlData.length > 0) {
            // Add product ID reference to each TRL item
            const trlItems = result.trlData.map((item: any) => ({
              ...item,
              productId: result.productId,
            }));
            return [...acc, ...trlItems];
          }
          return acc;
        }, []);

        // Sort by TRL level number if needed
        const sortedData = processedData.sort(
          (a: any, b: any) => a.TrlLevelNumber - b.TrlLevelNumber
        );

        console.log("Processed TRL Data:", sortedData);
        setTrlItemsData(sortedData);

        // Calculate progress data for each product
        calculateProductProgressData(sortedData, recivedProductIDs, products);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching TRL data:", error);
        setIsLoading(false);
      }
    };

    if (recivedProductIDs.length > 0) {
      fetchTrlDetails();
    }
  }, [recivedProductIDs, products]);

  // Calculate progress data for each product based on TRL level completion
  const calculateProductProgressData = (
    trlData: any[],
    productIDs: string[],
    productsList: any[] | null
  ) => {
    if (!productsList) return;

    const progressData = productIDs
      .map((productId) => {
        const product = productsList.find((p) => p._id === productId);
        if (!product) return null;

        // Get all TRL items for this product
        const productTrlItems = trlData.filter(
          (item) => item.productId === productId
        );

        // Group items by TRL level and sublevel
        const groupedByTrlLevel: Record<
          string,
          {
            levelId: string;
            levelNumber: number;
            levelName: string;
            sublevels: any[];
            totalSublevels: number;
            completedSublevels: number;
          }
        > = {};

        // Process each TRL item
        productTrlItems.forEach((item) => {
          const trlLevelId = item.trlLevelId;

          // Initialize the TRL level group if it doesn't exist
          if (!groupedByTrlLevel[trlLevelId]) {
            groupedByTrlLevel[trlLevelId] = {
              levelId: trlLevelId,
              levelNumber: item.TrlLevelNumber,
              levelName: item.TrlLevelName,
              sublevels: [],
              totalSublevels: 0,
              completedSublevels: 0,
            };
          }

          // Add the sublevel to the TRL level group
          groupedByTrlLevel[trlLevelId].sublevels.push(item);
          groupedByTrlLevel[trlLevelId].totalSublevels++;

          // Check if the sublevel is completed
          if (item.status?.toLowerCase() === "completed") {
            groupedByTrlLevel[trlLevelId].completedSublevels++;
          }
        });

        // Convert grouped data to array and sort by TRL level number
        const trlLevelsArray = Object.values(groupedByTrlLevel).sort(
          (a, b) => a.levelNumber - b.levelNumber
        );

        // Calculate overall completion percentage for the product
        const totalSublevels = trlLevelsArray.reduce(
          (sum, level) => sum + level.totalSublevels,
          0
        );
        const completedSublevels = trlLevelsArray.reduce(
          (sum, level) => sum + level.completedSublevels,
          0
        );

        const completionPercentage =
          totalSublevels > 0
            ? Math.round((completedSublevels / totalSublevels) * 100)
            : 0;

        return {
          productId,
          productName: product.product,
          trlLevels: trlLevelsArray,
          totalSublevels,
          completedSublevels,
          completionPercentage,
        };
      })
      .filter(Boolean);

    setProductProgressData(progressData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white w-full overflow-hidden">
        <NavBar role="Stakeholder" />
        <div className="flex h-[calc(100vh-4rem)]">
          <Sidebar />
          <div className="flex-grow">
            <div className="flex flex-col justify-center items-center h-screen bg-secondary">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
              <h1 className="mt-4 text-lg font-semibold text-indigo-600">
                Loading...
              </h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate average TRL if trlLevels data is available
  const averageTRL = trlLevels
    ? (
        trlLevels.reduce((sum, level) => sum + level.trlLevelNumber, 0) /
        trlLevels.length
      ).toFixed(1)
    : "N/A";

  const TrlProgressChart = ({
    products,
    trlItemsData,
    progressData,
  }: {
    products: any[];
    trlItemsData: any[];
    progressData: any[];
  }) => {
    // Use the progress data for the chart instead of calculating it here
    const data =
      progressData.length > 0
        ? progressData.map((product) => ({
            name: product.productName,
            progress: product.completionPercentage,
            levels: product.trlLevels.map((level: any) => ({
              level: level.levelNumber,
              completed: level.completedSublevels,
              total: level.totalSublevels,
            })),
          }))
        : [];

    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              // domain={[0, 9]}
              // ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              label={{
                // value: "TRL Level",
                value: "Completion %",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              formatter={(value, name, props) => {
                return [`${value}% Complete`, "TRL Progress"];
              }}
            />
            <Bar dataKey="progress" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      <NavBar role="Stakeholder" />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={changeSection}
        />
        <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto bg-secondary">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              Hello, {Session?.user?.name || "Stakeholder"}
            </h2>
          </div>

          {/* Overview Section */}
          {activeSection === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Products Card */}
                <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-primary">
                      Total Products
                    </h3>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="p-6 pt-0">
                    <div className="text-2xl font-bold text-primary">8</div>
                    <p className="text-xs text-gray-500">+2 from last month</p>
                  </div>
                </div>

                {/* Average TRL Card */}
                <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-primary">
                      Average TRL
                    </h3>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="p-6 pt-0">
                    <div className="text-2xl font-bold text-primary">
                      {averageTRL}
                    </div>
                    <p className="text-xs text-gray-500">
                      +0.8 from last quarter
                    </p>
                  </div>
                </div>

                {/* Product Managers Card */}
                <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-primary">
                      Product Managers
                    </h3>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="p-6 pt-0">
                    <div className="text-2xl font-bold text-primary">8</div>
                    <p className="text-xs text-gray-500">+1 from last month</p>
                  </div>
                </div>

                {/* Product Factories Card */}
                <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-primary">
                      Product Factories
                    </h3>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="p-6 pt-0">
                    <div className="text-2xl font-bold text-primary">8</div>
                    <p className="text-xs text-gray-500">Same as last month</p>
                  </div>
                </div>
              </div>

              {/* Product Overview Chart */}
              <div className="grid gap-4 md:grid-cols-1">
                <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 col-span-1">
                  <div className="p-6 pb-2">
                    <h3 className="text-lg font-medium text-primary">
                      Product Overview
                    </h3>
                  </div>
                  <div className="p-6 pt-0 pl-2">
                    {/* Product Chart */}
                    <div className="w-full h-[400px] flex flex-col">
                      {!trlLevels || !products || !trlItemsData ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">Loading chart data...</p>
                        </div>
                      ) : (
                        <TrlProgressChart
                          products={products}
                          trlItemsData={trlItemsData}
                          progressData={productProgressData}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          {activeSection === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 px-3 py-1 text-sm h-8"
                    onClick={() => {
                      // Refresh products data
                      if (Session?.user?.id) {
                        setIsLoading(true);
                        fetch(
                          `/api/stakeholder/products?userID=${Session.user.id}`
                        )
                          .then((response) => response.json())
                          .then((data) => {
                            if (data.success) {
                              setProducts(data.products);
                              if (
                                data.products &&
                                data.products.length > 0 &&
                                recivedProductIDs.length === 0
                              ) {
                                setRecivedProductIDs([data.products[0]._id]);
                              }
                            }
                            setIsLoading(false);
                          })
                          .catch((error) => {
                            console.error("Error refreshing products:", error);
                            setIsLoading(false);
                          });
                      }
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4 text-indigo-500" />
                    Refresh
                  </button>
                  <button className="inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 px-3 py-1 text-sm h-8">
                    <Download className="mr-2 h-4 w-4 text-indigo-500" />
                    Export
                  </button>
                </div>
              </div>

              {/* Products Table Card */}
              <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6 pb-3">
                  <h3 className="text-lg font-medium text-primary">
                    Product List
                  </h3>
                  <p className="text-sm text-gray-500">
                    All products assigned to {Session?.user?.name}
                  </p>
                </div>
                <div className="p-0">
                  {/* Products Table */}
                  <div className="rounded-lg overflow-hidden border-t">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b">
                          <tr>
                            <th className="px-6 py-3 font-medium">
                              <div className="flex items-center">
                                <span>Product</span>
                              </div>
                            </th>
                            <th className="px-6 py-3 font-medium">
                              Description
                            </th>
                            <th className="px-6 py-3 font-medium">TRL Level</th>
                            <th className="px-6 py-3 font-medium">
                              Created Date
                            </th>
                            <th className="px-6 py-3 font-medium">
                              <span className="sr-only">Select</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {products?.map((product) => {
                            const isSelected = recivedProductIDs.includes(
                              product._id
                            );
                            // Find highest TRL level for this product
                            const productTrlItems =
                              trlItemsData?.filter(
                                (item) => item.productId === product._id
                              ) || [];

                            const highestTrlLevel =
                              productTrlItems.length > 0
                                ? Math.max(
                                    ...productTrlItems.map(
                                      (item) => item.TrlLevelNumber
                                    )
                                  )
                                : 0;

                            return (
                              <tr
                                key={product._id}
                                className={`hover:bg-gray-50 ${
                                  isSelected
                                    ? "bg-indigo-50 hover:bg-indigo-100"
                                    : ""
                                }`}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="text-sm font-medium text-gray-900">
                                      {product.product}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500 max-w-xs truncate">
                                    {product.description}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {highestTrlLevel > 0
                                      ? `Level ${highestTrlLevel}`
                                      : "Not assigned"}
                                  </div>
                                  {/* Add TRL Progress bar */}
                                  {productProgressData.length > 0 && (
                                    <div className="mt-1">
                                      {(() => {
                                        const productProgress =
                                          productProgressData.find(
                                            (p) => p.productId === product._id
                                          );
                                        if (productProgress) {
                                          return (
                                            <div className="w-full">
                                              <div className="flex justify-between text-xs mb-1">
                                                <span>
                                                  {
                                                    productProgress.completedSublevels
                                                  }
                                                  /
                                                  {
                                                    productProgress.totalSublevels
                                                  }{" "}
                                                  complete
                                                </span>
                                                <span>
                                                  {
                                                    productProgress.completionPercentage
                                                  }
                                                  %
                                                </span>
                                              </div>
                                              <div className="h-1.5 w-full bg-gray-200 rounded-full">
                                                <div
                                                  className="h-1.5 bg-indigo-600 rounded-full"
                                                  style={{
                                                    width: `${productProgress.completionPercentage}%`,
                                                  }}
                                                ></div>
                                              </div>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(
                                    product.createdAt
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() =>
                                      handleProductSelection(product._id)
                                    }
                                    className={`px-3 py-1 rounded-md ${
                                      isSelected
                                        ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                        : "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                    }`}
                                  >
                                    {isSelected ? "Selected" : "Select"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRL Details Card */}
              {recivedProductIDs.length > 0 && (
                <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6 pb-2">
                    <h3 className="text-lg font-medium text-primary">
                      TRL Progress Details -{" "}
                      {
                        products?.find((p) => recivedProductIDs.includes(p._id))
                          ?.product
                      }
                    </h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="space-y-6">
                      {!trlItemsData || trlItemsData.length === 0 ? (
                        <div className="text-center p-6">
                          <h3 className="text-lg font-medium text-gray-900">
                            No TRL data found
                          </h3>
                          <p className="mt-2 text-sm text-gray-500">
                            This product doesn't have any TRL assessments yet.
                          </p>
                        </div>
                      ) : (
                        trlItemsData.map((trlItem) => (
                          <div
                            key={trlItem._id}
                            className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-lg">
                                  TRL Level {trlItem.TrlLevelNumber}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {trlItem.TrlLevelName}
                                </p>
                              </div>
                              <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">
                                {trlItem.status}
                              </div>
                            </div>

                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700">
                                Progress
                              </h5>
                              <div className="mt-1 h-2 w-full bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-indigo-600 rounded-full"
                                  style={{
                                    width: `${
                                      // trlItem.status === "Completed"
                                      trlItem.status?.toLowerCase() === "completed"
                                        ? 100
                                        // : trlItem.status === "In Progress"
                                        : trlItem.status?.toLowerCase() === "progress" ||
                                        trlItem.status?.toLowerCase() === "in progress"
                                        ? 50
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              {/* Show sublevel progress info */}
                              {(() => {
                                const productProgress = productProgressData.find(
                                  p => p.productId === trlItem.productId
                                );
                                if (productProgress) {
                                  const levelProgress = productProgress.trlLevels.find(
                                    (l: any) => l.levelId === trlItem.trlLevelId
                                  );
                                  if (levelProgress) {
                                    const levelPercentage = levelProgress.totalSublevels > 0
                                      ? Math.round((levelProgress.completedSublevels / levelProgress.totalSublevels) * 100)
                                      : 0;
                                    return (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {levelProgress.completedSublevels}/{levelProgress.totalSublevels} sublevels complete ({levelPercentage}%)
                                      </div>
                                    );
                                  }
                                }
                                return null;
                              })()}
                            </div>

                            {trlItem.documentName && (
                              <p className="mt-3 text-sm">
                                <span className="font-medium">
                                  Documentation:
                                </span>{" "}
                                <a
                                  href={trlItem.documentLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800"
                                >
                                  View Documentation
                                </a>
                              </p>
                            )}

                            {(trlItem.startDate || trlItem.estimatedDate) && (
                              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                {trlItem.startDate && (
                                  <div>
                                    <span className="font-medium">
                                      Start Date:
                                    </span>{" "}
                                    {new Date(
                                      trlItem.startDate
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                                {trlItem.estimatedDate && (
                                  <div>
                                    <span className="font-medium">
                                      Estimated Completion:
                                    </span>{" "}
                                    {new Date(
                                      trlItem.estimatedDate
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
