"use client";

import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar-stakeholders";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart2,
  Filter,
  Plus,
  RefreshCw,
  Download,
  ChevronDown,
} from "lucide-react";

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-secondary">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
    <h1 className="mt-4 text-lg font-semibold text-indigo-600">Loading...</h1>
  </div>
);

// Card Component
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
    {children}
  </div>
);

const CardHeader = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <div className={`p-6 pb-2 ${className || ""}`}>{children}</div>;

const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <h3 className={`text-lg font-medium text-primary ${className || ""}`}>
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-500">{children}</p>
);

const CardContent = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <div className={`p-6 pt-0 ${className || ""}`}>{children}</div>;

// Dropdown Menu Component
interface DropdownMenuContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const DropdownMenuContext = React.createContext<
  DropdownMenuContextProps | undefined
>(undefined);

interface DropdownMenuProps {
  children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  asChild,
}) => {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error(
      "DropdownMenuTrigger must be used within a DropdownMenu component"
    );
  }

  const { isOpen, setIsOpen } = context;

  return <div onClick={() => setIsOpen(!isOpen)}>{children}</div>;
};

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "left" | "right" | "center" | "end";
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  align = "left",
}) => {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error(
      "DropdownMenuContent must be used within a DropdownMenu component"
    );
  }

  const { isOpen, setIsOpen } = context;

  if (!isOpen) return null;

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      className={`absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${alignmentClasses[align]}`}
      onClick={() => setIsOpen(false)}
    >
      <div className="py-1">{children}</div>
    </div>
  );
};

interface DropdownMenuItemProps {
  children: React.ReactNode;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children }) => (
  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer">
    {children}
  </div>
);

// Button Component
interface ButtonProps {
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "sm";
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
}) => {
  const variantClasses = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300",
  };

  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-3 py-1 text-sm",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// TRL Level Component
interface TRLLevelProps {
  level: number;
  name: string;
}

const TRLLevel: React.FC<TRLLevelProps> = ({ level, name }) => {
  const getColorByLevel = (level: number) => {
    const colors = {
      1: "bg-indigo-300 hover:bg-indigo-200",
      2: "bg-indigo-400 hover:bg-indigo-300",
      3: "bg-indigo-500 hover:bg-indigo-400",
      4: "bg-indigo-500 hover:bg-indigo-400",
      5: "bg-indigo-600 hover:bg-indigo-500",
      6: "bg-indigo-600 hover:bg-indigo-500",
      7: "bg-indigo-700 hover:bg-indigo-600",
      8: "bg-indigo-700 hover:bg-indigo-600",
      9: "bg-indigo-800 hover:bg-indigo-700",
    };
    return (
      colors[level as keyof typeof colors] ||
      "bg-indigo-500 hover:bg-indigo-400"
    );
  };

  return (
    <div className="flex items-center mb-3 group">
      <div
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md mr-3 text-white font-bold text-sm"
        style={{
          backgroundColor: `var(--${getColorByLevel(level)
            .split(" ")[0]
            .replace("bg-", "")})`,
        }}
      >
        {level}
      </div>
      <div className="flex-grow">
        <div className="text-sm font-medium text-primary">{name}</div>
        <div className="text-xs text-gray-600">TRL Level {level}</div>
      </div>
    </div>
  );
};

// Sample Product Chart Component
interface ProductChartProps {
  trlLevels: Array<{
    trlLevelNumber: number;
    trlLevelName: string;
  }> | null;
  products: Product[] | null;
}

const ProductChart: React.FC<ProductChartProps> = ({ trlLevels, products }) => {
  if (!trlLevels || trlLevels.length === 0) {
    return (
      <div className="h-[500px] w-full flex items-center justify-center">
        <p className="text-gray-500">No TRL data available</p>
      </div>
    );
  }

  // Sort TRL levels by trlLevelNumber
  const sortedLevels = [...trlLevels].sort(
    (a, b) => a.trlLevelNumber - b.trlLevelNumber
  );

  // For now, we'll assign random TRL levels to products for visualization
  // In the future, this will be replaced with actual TRL level data for each product
  const getRandomTRLLevel = () => {
    return Math.floor(Math.random() * 9) + 1; // Random number between 1-9
  };

  // Assign a TRL level to each product for visualization purposes
  const productsWithTRL = products
    ? products.map((product) => ({
        ...product,
        trlLevel: getRandomTRLLevel(), // This will be replaced with actual data
      }))
    : [];

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-6">
        {/* Bar Chart Visualization */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Product TRL Status</h3>

          <div className="relative overflow-x-auto">
            <div className="flex items-end h-[400px] space-x-1">
              {/* TRL Level Scale (Y-axis) */}
              <div className="flex flex-col justify-between h-full pr-2 py-2">
                {[...sortedLevels]
                  .sort((a, b) => b.trlLevelNumber - a.trlLevelNumber)
                  .map((level) => (
                    <div
                      key={level.trlLevelNumber}
                      className="flex items-center"
                    >
                      <span
                        className="text-xs text-gray-500 w-6 text-right cursor-context-menu"
                        title={level.trlLevelName}
                      >
                        {level.trlLevelNumber}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Chart Grid and Bars */}
              <div className="flex-1 relative h-full">
                {/* Horizontal Grid Lines */}
                {[...sortedLevels]
                  .sort((a, b) => b.trlLevelNumber - a.trlLevelNumber)
                  .map((level) => (
                    <div
                      key={level.trlLevelNumber}
                      className="absolute w-full border-t border-gray-100 flex items-center"
                      style={{
                        bottom: `${(level.trlLevelNumber - 1) * (100 / 9)}%`,
                        height: "1px",
                      }}
                    >
                      <span className="text-xs text-gray-400 absolute -left-8 -top-2 w-6 text-right"></span>
                    </div>
                  ))}

                {/* Product Bars */}
                {productsWithTRL.length > 0 ? (
                  <div className="flex justify-around h-full items-end w-full">
                    {productsWithTRL.map((product, index) => {
                      const barHeight = `${(product.trlLevel / 9) * 100}%`;
                      const barColor = `hsl(${210 + index * 40}, 70%, 60%)`;

                      return (
                        <div
                          key={product._id}
                          className="flex flex-col items-center w-1/4 px-2"
                        >
                          <div
                            className="w-full rounded-t-md transition-all duration-500 ease-in-out hover:opacity-80"
                            style={{
                              height: barHeight,
                              backgroundColor: barColor,
                              minHeight: "10px",
                            }}
                          ></div>
                          <div className="w-full text-center mt-2">
                            <p
                              className="text-xs font-medium truncate"
                              title={product.product}
                            >
                              {product.product}
                            </p>
                            <p className="text-xs text-gray-500">
                              TRL {product.trlLevel}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">No product data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/*  Product List */}
        {/* <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Product List</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products && products.map((product) => (
              <div 
                key={product._id} 
                className="p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-primary">{product.product}</h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

// Sample Products Table Component
interface Product {
  _id: string;
  userID: string;
  product: string;
  productManagerID: string;
  productViewer: string[];
  description: string;
  problemStatement: string;
  solutionExpected: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductID{
  _id: string;
}
const ProductsTable = ({
  products,
  selectedProductIDs,
  onSelectProduct,
}: {
  products: Product[] | null;
  selectedProductIDs: string[];
  onSelectProduct: (productID: string) => void;
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">TRL</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Factory</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-indigo-50 transition-colors">
                <td className="px-4 py-3 font-medium text-primary">
                  No products available
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">TRL</th>
              <th className="px-4 py-3">Manager</th>
              <th className="px-4 py-3">Factory</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className={`border-b hover:bg-indigo-50 transition-colors ${
                  selectedProductIDs.includes(product._id) ? "bg-indigo-50" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-primary">
                  {product.product}
                </td>
                <td className="px-4 py-3">{product.productManagerID}</td>
                <td className="px-4 py-3">{product.productManagerID}</td>
                <td className="px-4 py-3">{product.productViewer}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.productManagerID === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.productManagerID}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 ${
                      selectedProductIDs.includes(product._id)
                        ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                        : ""
                    }`}
                    onClick={() => onSelectProduct(product._id)}
                  >
                    {selectedProductIDs.includes(product._id) ? "Selected" : "Select"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface TRLLevel {
  _id: string;
  trlLevelNumber: number;
  trlLevelName: string;
  subLevels: any[];
  __v: number;
}

// TRL Details Card Component
interface TRLDetailsCardProps {
  trlItemsData: any[] | null;
  productName: string | undefined;
}

const TRLDetailsCard: React.FC<TRLDetailsCardProps> = ({ trlItemsData, productName }) => {
  if (!trlItemsData || trlItemsData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>TRL Details for {productName || "Selected Product"}</CardTitle>
          <CardDescription>No TRL data available for this product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-gray-500">
            No Technology Readiness Level information found for this product.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>TRL Details for {productName || "Selected Product"}</CardTitle>
        <CardDescription>
          Technology Readiness Level information for the selected product
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trlItemsData.map((trlItem) => (
            <div key={trlItem._id} className="border rounded-md p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Level {trlItem.TrlLevelNumber}: {trlItem.trlLevelName}
                </h3>
                <TRLLevel level={trlItem.TrlLevelNumber} name={trlItem.trlLevelName} />
              </div>
              {trlItem.description && (
                <p className="mt-2 text-sm text-gray-500">
                  {trlItem.description}
                </p>
              )}
              {trlItem.documentationLink && (
                <p className="mt-2 text-sm">
                  <a
                    href={trlItem.documentationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    View Documentation
                  </a>
                </p>
              )}
              {(trlItem.startDate || trlItem.estimatedDate) && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {trlItem.startDate && (
                    <div>
                      <span className="font-medium">Start Date:</span>{" "}
                      {new Date(trlItem.startDate).toLocaleDateString()}
                    </div>
                  )}
                  {trlItem.estimatedDate && (
                    <div>
                      <span className="font-medium">Estimated Completion:</span>{" "}
                      {new Date(trlItem.estimatedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ProductOverview() {
  const { data: Session } = useSession();
  console.log("Session:", Session?.user?.id);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trlLevels, setTrlLevels] = useState<TRLLevel[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [selectedProductIDs, setSelectedProductIDs] = useState<any[] | null>([]);
  const [trlItemsData, setTrlItemsData] = useState<any[] | null>(null);
  
  console.log("Product **:", products);
  console.log("Product ID****:", selectedProductIDs);
  // Use state for navigation instead of URL fragments
  const [activeSection, setActiveSection] = useState<string>("overview");

  // Function to handle product selection
  const handleProductSelection = (productID: string) => {
    console.log("Selecting product:", productID);
    setSelectedProductIDs(prev => {
      if (prev.includes(productID)) {
        return prev.filter(id => id !== productID);
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
          // Set the first product's ID to state if there are any products
          if (data.products && data.products.length > 0) {
            setSelectedProductIDs([data.products[0]._id]);
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
      if (selectedProductIDs.length === 0) return;
      try {
        setIsLoading(true);
        console.log("Fetching TRL details for product IDs:", selectedProductIDs);
        
        // Fetch data for all selected products
        const results = await Promise.all(selectedProductIDs.map(async (productId) => {
          const detailsResponse = await fetch(`/api/trl-level?productId=${productId}`);
          return detailsResponse.json();
        }));

        // Process the results...
        // ...existing TRL processing code...

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching TRL data:", error);
        setIsLoading(false);
      }
    };

    if (selectedProductIDs.length > 0) {
      fetchTrlDetails();
    }
  }, [selectedProductIDs]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white w-full overflow-hidden">
        <NavBar role="Stakeholder" />
        <div className="flex h-[calc(100vh-4rem)]">
          <Sidebar />
          <div className="flex-grow">
            <LoadingSpinner />
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
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Products
                    </CardTitle>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">8</div>
                    <p className="text-xs text-gray-500">+2 from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average TRL
                    </CardTitle>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {averageTRL}
                    </div>
                    <p className="text-xs text-gray-500">
                      +0.8 from last quarter
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Product Managers
                    </CardTitle>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">8</div>
                    <p className="text-xs text-gray-500">+1 from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Product Factories
                    </CardTitle>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">8</div>
                    <p className="text-xs text-gray-500">Same as last month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-1">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Product Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ProductChart trlLevels={trlLevels} products={products} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Products Section */}
          {activeSection === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => {
                      // Refresh products data
                      if (Session?.user?.id) {
                        setIsLoading(true);
                        fetch(`/api/stakeholder/products?userID=${Session.user.id}`)
                          .then(response => response.json())
                          .then(data => {
                            if (data.success) {
                              setProducts(data.products);
                              if (data.products && data.products.length > 0 && selectedProductIDs.length === 0) {
                                setSelectedProductIDs([data.products[0]._id]);
                              }
                            }
                            setIsLoading(false);
                          })
                          .catch(error => {
                            console.error("Error refreshing products:", error);
                            setIsLoading(false);
                          });
                      }
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4 text-indigo-500" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="mr-2 h-4 w-4 text-indigo-500" />
                    Export
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Product List</CardTitle>
                  <CardDescription>
                    All products assigned to {Session?.user?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ProductsTable
                    products={products}
                    selectedProductIDs={selectedProductIDs}
                    onSelectProduct={handleProductSelection}
                  />
                </CardContent>
              </Card>

              {selectedProductIDs.length > 0 && (
                <TRLDetailsCard 
                  trlItemsData={trlItemsData} 
                  productName={products?.find(p => selectedProductIDs.includes(p._id))?.product}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
