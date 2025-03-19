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
  console.log("productProgressData ", productProgressData);
  // State for active section
  const productCount = products?.length || 0;

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
    console.log("ajgfsdjkshgdjkadgaa", section);
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
    const [tooltipData, setTooltipData] = useState<any>(null);

    // Unified click handler for both bar and tooltip
    const handleClick = (data: any) => {
      console.log("Clicked Product ID:", data.productID);
      // Your navigation logic here
    };

    const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <button
            type="button"
            className="bg-white p-4 border rounded shadow hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClick(data);
            }}
            style={{ pointerEvents: "all" }}
          >
            <p className="font-bold text-primary  text-left">{`${data.name}`}</p>
            <p className="text-[#f8572ebb] text-left">{`${data.progress}% Complete`}</p>
            {/* <p className="text-xs text-blue-500 mt-1 text-left">
              Click for details →
            </p> */}
          </button>
        );
      }
      return null;
    };

    // Transform progress data into chart format
    const chartData = progressData.map((product) => ({
      name: product.productName,
      progress: product.completionPercentage,
      productID: product.productId,
    }));

    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            onClick={(data) =>
              data && handleClick(data.activePayload?.[0]?.payload)
            }
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[1, 9]}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
              label={{
                value: "TRL Level",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              ticks={[]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={CustomTooltip}
              wrapperStyle={{
                zIndex: 1000,
                pointerEvents: "auto",
                cursor: "pointer",
              }}
              wrapperClassName="hover:bg-black"
            />
            <Bar
              yAxisId="right"
              dataKey="progress"
              fill="#4f46e5"
              cursor="pointer"
              onClick={(data) => handleClick(data)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  console.log("activeSection", activeSection);

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
                {/* <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-primary">
                      Total Products
                    </h3>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="p-6 pt-0">
                    <div className="text-2xl font-bold text-primary">{productCount}</div>
                    <p className="text-xs text-gray-500">+2 from last month</p>
                  </div>
                </div> */}

                {/* Average TRL Card */}
                {/* <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
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
                    <p className="text-xs text-gray-500">+0.8 from last quarter</p>
                  </div>
                </div> */}

                {/* Product Managers Card */}
                {/* <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
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
                </div> */}

                {/* Product Factories Card */}
                {/* <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
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
                </div> */}
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
                        <div className="flex items-center justify-center h-full" >
                          <p className="text-primary">Loading chart data...</p>
                        </div>
                      ) : (
                        <TrlProgressChart
                          // products={products}
                          // trlItemsData={trlItemsData}
                          progressData={productProgressData}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
