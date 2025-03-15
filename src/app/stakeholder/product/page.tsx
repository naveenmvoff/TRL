"use client";

import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar-stakeholders";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import React from "react";
import { RefreshCw, Download } from "lucide-react";

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-secondary">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
    <h1 className="mt-4 text-lg font-semibold text-indigo-600">Loading...</h1>
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
  let variantClasses = "";
  let sizeClasses = "";
  
  switch(variant) {
    case "default":
      variantClasses = "bg-indigo-600 text-white hover:bg-indigo-700";
      break;
    case "outline":
      variantClasses = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";
      break;
    default:
      variantClasses = "bg-indigo-600 text-white hover:bg-indigo-700";
  }
  
  switch(size) {
    case "default":
      sizeClasses = "h-10 px-4 py-2";
      break;
    case "sm":
      sizeClasses = "h-8 px-3 py-1 text-sm";
      break;
    default:
      sizeClasses = "h-10 px-4 py-2";
  }
  
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </button>
  );
};

// Products Table Component
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

function ProductsTable({ products }: { products: Product[] | null }) {
  if (!products || products.length === 0) {
    return (
      <div className="rounded-md bg-white p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
        <p className="mt-2 text-sm text-gray-500">
          You don't have any products to display.
        </p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Problem Statement</th>
              <th className="px-6 py-3">Expected Solution</th>
              <th className="px-6 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white text-sm">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{product.product}</td>
                <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{product.description}</td>
                <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{product.problemStatement}</td>
                <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{product.solutionExpected}</td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { data: Session } = useSession();
  console.log("Session:", Session?.user?.id);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[] | null>(null);

  // Fetch products for the user
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!Session?.user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/stakeholder/products?userID=${Session.user.id}`);
        const data = await response.json();
        console.log("Products data:", data);
        
        if (data.success) {
          setProducts(data.products);
        } else {
          console.error("Failed to fetch products:", data.message);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      }
    };
    
    if (Session?.user?.id) {
      fetchUserProducts();
    } else {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      <NavBar role="Stakeholder" />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto bg-secondary">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-primary">Products</h2>
          </div>
          
          <div className="space-y-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}
