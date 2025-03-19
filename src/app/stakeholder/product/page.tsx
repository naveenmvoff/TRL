"use client";

import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar-stakeholders";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Search, User } from "lucide-react";

export default function ProductPage() {
  const { data: Session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[] | null>(null);
  const [productManagers, setProductManagers] = useState<
    Record<string, string>
  >({});

  // Fetch products for the user
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!Session?.user?.id) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/stakeholder/products?userID=${Session.user.id}`
        );
        const data = await response.json();
        console.log("Products data:", data);

        if (data.success) {
          setProducts(data.products);
          setFilteredProducts(data.products);
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
    }
  }, [Session]);

  // Handle search
  useEffect(() => {
    if (!products) return;

    if (searchTerm === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Fetch product manager names for all products
  useEffect(() => {
    const fetchProductManagers = async () => {
      if (!filteredProducts || filteredProducts.length === 0) return;

      const managerIds = [
        ...new Set(
          filteredProducts
            .map((product) => product.productManagerID)
            .filter(Boolean)
        ),
      ];

      const managers: Record<string, string> = {};

      for (const managerId of managerIds) {
        try {
          const response = await fetch(
            `/api/stakeholder/productmanager?userID=${managerId}`
          );
          const data = await response.json();

          if (data.success && data.name) {
            managers[managerId] = data.name;
          } else {
            managers[managerId] = "Unknown Manager";
          }
        } catch (error) {
          console.error(`Error fetching manager ${managerId}:`, error);
          managers[managerId] = "Error loading manager";
        }
      }

      setProductManagers(managers);
    };

    fetchProductManagers();
  }, [filteredProducts]);

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

  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      <NavBar role="Stakeholder" />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto bg-secondary">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              Products
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-lg hover:scale-105 hover:bg-gray-100 hover:z-20 transition-all duration-300 ease-in-out cursor-pointer"
                  onClick={() => console.log(product._id)}
                >
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-bold text-indigo-600 mb-1">
                      {product.product}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      <span>
                        {product.productManagerID
                          ? `Product Manager: ${
                              productManagers[product.productManagerID] ||
                              "Loading..."
                            }`
                          : "Product Manager: Not assigned"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div>
                      <h3 className="text-md font-semibold text-gray-700">
                        Description
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 whitespace-pre-line line-clamp-1 text-justify">
                        {product.description || "No description available"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-md font-semibold text-gray-700">
                        Problem Statement
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 whitespace-pre-line line-clamp-1 text-justify">
                        {product.problemStatement ||
                          "No problem statement available"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-md font-semibold text-gray-700">
                        Expected Solution
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 whitespace-pre-line line-clamp-1 text-justify">
                        {product.solutionExpected ||
                          "No expected solution available"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t">
                    <div className="flex justify-between text-xs text-gray-500">
                      <div>
                        Created:{" "}
                        {new Date(product.createdAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-lg">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <Search className="h-6 w-6" />
                </div>
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
