"use client";

import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar-stakeholders";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import React from "react";
import { BarChart2 } from "lucide-react";

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-secondary">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
    <h1 className="mt-4 text-lg font-semibold text-indigo-600">Loading...</h1>
  </div>
);

// Card Component
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children }) => (
  <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 ${className || ''}`}>
    {children}
  </div>
);

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => (
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

// Sample Product Chart Component
interface ProductChartProps {
  trlLevels: Array<{
    trlLevelNumber: number;
    trlLevelName: string;
  }> | null;
  products: Product[] | null;
}

function ProductChart({ trlLevels, products }: ProductChartProps) {
  if (!trlLevels || !products) return <div>Loading chart data...</div>;

  // Calculate product distribution
  const trlDistribution = Array(9).fill(0);  // TRL levels 1-9
  
  products.forEach((product: any) => {
    const trlLevel = product.trlLevelNumber;
    if (trlLevel >= 1 && trlLevel <= 9) {
      trlDistribution[trlLevel - 1]++;
    }
  });

  // Calculate percentages for the radar chart
  const total = trlDistribution.reduce((a, b) => a + b, 0);
  const percentages = trlDistribution.map(value => total > 0 ? (value / total) * 100 : 0);
  
  // Format data for display
  const chartData = trlLevels.map((level: any, index: number) => ({
    level: level.trlLevelNumber,
    name: level.trlLevelName,
    count: trlDistribution[level.trlLevelNumber - 1] || 0,
    percentage: percentages[level.trlLevelNumber - 1] || 0
  })).sort((a: any, b: any) => a.level - b.level);
  
  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {chartData.map((item: any) => (
          <div 
            key={item.level}
            className={`
              relative bg-white p-6 rounded-lg border shadow-sm 
              transform transition-transform duration-200 hover:scale-105
              ${item.count > 0 ? 'border-indigo-200 hover:border-indigo-400' : 'border-gray-200'}
            `}
          >
            <div className="absolute top-3 right-3 bg-indigo-100 text-indigo-800 rounded-full px-2 py-1 text-xs font-bold">
              Level {item.level}
            </div>
            
            <h3 className="mt-2 text-xl font-bold text-gray-800 truncate">
              {item.name}
            </h3>
            
            <div className="mt-2 h-1 w-full bg-gray-200 rounded">
              <div 
                className="h-1 bg-indigo-600 rounded" 
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Products:</span>
              <span className="text-lg font-bold text-indigo-700">{item.count}</span>
            </div>
            
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-gray-500">Percentage:</span>
              <span className="text-lg font-bold text-indigo-700">{item.percentage.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Product Interface
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

interface TRLLevel {
  _id: string;
  trlLevelNumber: number;
  trlLevelName: string;
  subLevels: any[];
  __v: number;
}

export default function Overview() {
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
          
          <div className="space-y-4">
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
                <CardHeader className="">
                  <CardTitle>Product Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ProductChart trlLevels={trlLevels} products={products} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
