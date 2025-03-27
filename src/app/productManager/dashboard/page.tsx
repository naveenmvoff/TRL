"use client";

import NavBar from "@/components/navbar/navbar";
import SidebarPM from "@/components/sidebar-pm";
import type { FC } from "react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SwitchTrl from "@/components/switch-trl";

interface Product {
  _id: string;
  product: string;
  description: string;
  problemStatement: string;
  solutionExpected: string;
  productManagerID: string;
  productViewer: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProductDetailsProps {
  userName: string;
  email: string;
  factoryNumber: string;
  PMID?: string;
  productsData: Product[] | null;
}

const ProductDetails: FC<ProductDetailsProps> = ({
  userName,
  email,
  factoryNumber,
  productsData,
}) => {
  const router = useRouter();

  if (!productsData) return <div>Loading...</div>;

  const handleProductClick = (productId: string, index: number) => {
    localStorage.setItem("currentProductIndex", index.toString());
    router.push(`/productManager/product-details/${productId}`);
  };

  return (
    <div className="p-6 bg-secondary min-h-full">
      {/* User Info Section */}
      <div className="bg-white rounded-md p-6 mb-4 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-primary mb-1">
          Hello, {userName}
        </h2>
        {/* <h2 className="text-black font-medium mb-4">PMID, {PMID}</h2> */}
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="text-gray-600 font-semibold w-32">
              Manager Email :
            </span>
            <span className="text-gray-800">{email}</span>
          </div>
          <div className="flex">
            <span className="text-gray-600 font-semibold w-32">
              Factory Number :
            </span>
            <span className="text-gray-800 ">{factoryNumber}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsData && productsData.length > 0 ? (
          productsData.map((item, index) => (
            <div
              key={item._id || index}
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-lg hover:scale-105 hover:bg-gray-100 hover:z-10 transition-all duration-300 ease-in-out cursor-pointer"
              onClick={() => handleProductClick(item._id, index)}
            >
              <div className="pb-3">
                <h2 className="text-xl font-bold text-indigo-600">
                  {item.product || "No Product Name"}
                </h2>
              </div>

              <div className="pb-1">
                <h3 className="text-md font-semibold text-gray-700">
                  Description
                </h3>
                <p className="mt-1 text-sm text-gray-600 whitespace-pre-line line-clamp-1 text-justify">
                  {item.description || "No description available"}
                </p>
              </div>
              <div className="pb-1">
                <h3 className="text-md font-semibold text-gray-700">
                  Problem Statement
                </h3>
                <p className="mt-1 text-sm text-gray-600 whitespace-pre-line line-clamp-1 text-justify">
                  {item.problemStatement || "No description available"}
                </p>
              </div>
              <div className="pb-1">
                <h3 className="text-md font-semibold text-gray-700">
                  Expected Solution
                </h3>
                <p className="mt-1 text-sm text-gray-600 whitespace-pre-line line-clamp-1 text-justify">
                  {item.solutionExpected || "No description available"}
                </p>
              </div>

              <div className="pt-4 mt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <div>
                    Created:{" "}
                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-lg">
            <p>No products are currently assigned to you!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
    <h1 className="mt-4 text-lg font-semibold text-indigo-600">Loading...</h1>
  </div>
);

export default function ProductManager() {
  const { data: Session } = useSession();
  interface ProductData {
    products: Product[];
  }
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log("productData********", productData);
  const PMID = Session?.user?.id;
  console.log("PMID: ", PMID);

  useEffect(() => {
    // Add overflow hidden to prevent page scrollbar
    document.body.style.overflow = "hidden";

    // Clean up on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    // Try to load product IDs from localStorage
    const savedIds = localStorage.getItem("dashboardProductIds");
    if (savedIds) {
      setProductIds(JSON.parse(savedIds));
    }

    const fetchPMData = async () => {
      setIsLoading(true);
      if (PMID) {
        try {
          const response = await fetch(
            `/api/product-manager/pm?id=${Session.user.id}`
          );
          const data = await response.json();
          setProductData(data);

          // Extract and save product IDs in order
          const ids = data.products.map((product: Product) => product._id);
          setProductIds(ids);
          localStorage.setItem("dashboardProductIds", JSON.stringify(ids));
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (!savedIds || PMID) {
      fetchPMData();
    }
  }, [Session, PMID]);

  if (isLoading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-white">
        <NavBar role="Product Manager" />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <SidebarPM />
          <div className="flex-grow overflow-hidden">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <NavBar role="Product Manager" />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {" "}
        {/* 4rem = Navbar height */}
        <SidebarPM />
        <div className="flex-grow overflow-y-auto bg-secondary">
          <ProductDetails
            userName={Session?.user?.name || ""}
            email={Session?.user?.email || ""}
            factoryNumber={Session?.user?.factory || "Not assigned"}
            productsData={productData?.products || []}
          />
          {/* <div className="sr-only"> */}
          <div className="hidden">
            <SwitchTrl productIds={productIds} />
          </div>
        </div>
      </div>
    </div>
  );
}
