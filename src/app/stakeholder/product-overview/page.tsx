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
  ChevronDown 
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
  children 
}: { 
  className?: string, 
  children: React.ReactNode 
}) => (
  <div className={`p-6 pb-2 ${className || ''}`}>
    {children}
  </div>
);

const CardTitle = ({ 
  className, 
  children 
}: { 
  className?: string, 
  children: React.ReactNode 
}) => (
  <h3 className={`text-lg font-medium text-primary ${className || ''}`}>
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-500">
    {children}
  </p>
);

const CardContent = ({ 
  className, 
  children 
}: { 
  className?: string, 
  children: React.ReactNode 
}) => (
  <div className={`p-6 pt-0 ${className || ''}`}>
    {children}
  </div>
);

// Tabs Component
interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContextProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextProps | undefined>(undefined);

const Tabs: React.FC<TabsProps> = ({ defaultValue, className, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

const TabsList: React.FC<TabsListProps> = ({ className, children }) => {
  return (
    <div className={`flex space-x-1 border-b border-gray-200 ${className || ''}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children }) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const { activeTab, setActiveTab } = context;
  
  return (
    <button
      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        activeTab === value 
          ? 'border-b-2 border-indigo-600 text-indigo-600' 
          : 'text-gray-500 hover:text-primary hover:border-b-2 hover:border-gray-300'
      }`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const TabsContent: React.FC<TabsContentProps> = ({ value, className, children }) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  const { activeTab } = context;
  
  if (activeTab !== value) return null;
  
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Dropdown Menu Component
interface DropdownMenuContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextProps | undefined>(undefined);

interface DropdownMenuProps {
  children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children, asChild }) => {
  const context = React.useContext(DropdownMenuContext);
  
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within a DropdownMenu component');
  }
  
  const { isOpen, setIsOpen } = context;
  
  return (
    <div onClick={() => setIsOpen(!isOpen)}>
      {children}
    </div>
  );
};

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "left" | "right" | "center" | "end";
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ children, align = "left" }) => {
  const context = React.useContext(DropdownMenuContext);
  
  if (!context) {
    throw new Error('DropdownMenuContent must be used within a DropdownMenu component');
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
      <div className="py-1">
        {children}
      </div>
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
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "" 
}) => {
  const variantClasses = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300",
  };
  
  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-3 py-1 text-sm",
  };
  
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
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
    return colors[level as keyof typeof colors] || "bg-indigo-500 hover:bg-indigo-400";
  };

  return (
    <div className="flex items-center mb-3 group">
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md mr-3 text-white font-bold text-sm" 
           style={{ backgroundColor: `var(--${getColorByLevel(level).split(' ')[0].replace('bg-', '')})` }}>
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
  const sortedLevels = [...trlLevels].sort((a, b) => a.trlLevelNumber - b.trlLevelNumber);

  // For now, we'll assign random TRL levels to products for visualization
  // In the future, this will be replaced with actual TRL level data for each product
  const getRandomTRLLevel = () => {
    return Math.floor(Math.random() * 9) + 1; // Random number between 1-9
  };

  // Assign a TRL level to each product for visualization purposes
  const productsWithTRL = products ? products.map(product => ({
    ...product,
    trlLevel: getRandomTRLLevel() // This will be replaced with actual data
  })) : [];

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
                {[9, 8, 7, 6, 5, 4, 3, 2, 1].map(level => (
                  <div key={level} className="flex items-center">
                    <span className="text-xs text-gray-500 w-6 text-right">{level}</span>
                  </div>
                ))}
              </div>
              
              {/* Chart Grid and Bars */}
              <div className="flex-1 relative h-full">
                {/* Horizontal Grid Lines */}
                {[9, 8, 7, 6, 5, 4, 3, 2, 1].map(level => (
                  <div 
                    key={level} 
                    className="absolute w-full border-t border-gray-100 flex items-center"
                    style={{ bottom: `${(level - 1) * (100 / 9)}%`, height: '1px' }}
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
                        <div key={product._id} className="flex flex-col items-center w-1/4 px-2">
                          <div 
                            className="w-full rounded-t-md transition-all duration-500 ease-in-out hover:opacity-80"
                            style={{ 
                              height: barHeight, 
                              backgroundColor: barColor,
                              minHeight: '10px'
                            }}
                          ></div>
                          <div className="w-full text-center mt-2">
                            <p className="text-xs font-medium truncate" title={product.product}>
                              {product.product}
                            </p>
                            <p className="text-xs text-gray-500">TRL {product.trlLevel}</p>
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
          
          {/* Legend for TRL Levels */}
          <div className="mt-8 grid grid-cols-3 gap-2">
            {sortedLevels.map(level => (
              <div key={level.trlLevelNumber} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${210 + level.trlLevelNumber * 15}, 70%, 60%)` }}></div>
                <span className="text-xs">
                  <span className="font-medium">{level.trlLevelNumber}:</span> {level.trlLevelName}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Product List */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
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
        </div>
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

const ProductsTable = ({ products }: { products: Product[] | null }) => {
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
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-indigo-50 transition-colors">
                <td className="px-4 py-3 font-medium text-primary">No products available</td>
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
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b hover:bg-indigo-50 transition-colors">
                <td className="px-4 py-3 font-medium text-primary">{product.product}</td>
                <td className="px-4 py-3">{product.productManagerID}</td>
                <td className="px-4 py-3">{product.productManagerID}</td>
                <td className="px-4 py-3">{product.productViewer}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    product.productManagerID === "Active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {product.productManagerID}
                  </span>
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

export default function admin() {
  const { data: Session } = useSession();
  console.log("Session:", Session?.user?.id);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trlLevels, setTrlLevels] = useState<TRLLevel[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

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
        const response = await fetch(`/api/stakeholder/products?userID=${Session.user.id}`);
        const data = await response.json();
        console.log("Products data:", data);
        
        if (data.success) {
          setProducts(data.products);
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
  const averageTRL = trlLevels ? 
    (trlLevels.reduce((sum, level) => sum + level.trlLevelNumber, 0) / trlLevels.length).toFixed(1) : 
    "N/A";

  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      <NavBar role="Stakeholder" />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto bg-secondary">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-primary">Hello, {Session?.user?.name || "Stakeholder"}</h2>
            
          </div>
          
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">8</div>
                    <p className="text-xs text-gray-500">+2 from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average TRL</CardTitle>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{averageTRL}</div>
                    <p className="text-xs text-gray-500">+0.8 from last quarter</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Product Managers</CardTitle>
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">8</div>
                    <p className="text-xs text-gray-500">+1 from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Product Factories</CardTitle>
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
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <RefreshCw className="mr-2 h-4 w-4 text-indigo-500" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="mr-2 h-4 w-4 text-indigo-500" />
                    Export
                  </Button>
                </div>
              </div>
              <ProductsTable products={products} />
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Analytics</CardTitle>
                  <CardDescription>Detailed analytics will be available soon.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-md">
                    <div className="text-center">
                      <BarChart2 className="h-12 w-12 mx-auto text-indigo-300 mb-4" />
                      <p>Analytics dashboard coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
