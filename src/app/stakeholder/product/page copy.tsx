"use client";

import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar-stakeholders";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Check, Search, User, UserRound } from "lucide-react";

export default function ProductPage() {
  const { data: Session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  // Fetch products for the user
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!Session?.user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/stakeholder/products?userID=${Session.user.id}`);
        const data = await response.json();
        console.log("Products data:", data);
        
        if (data.success) {
          setProducts(data.products);
          setFilteredProducts(data.products);
          // Select the first product by default if available
          if (data.products && data.products.length > 0) {
            setSelectedProduct(data.products[0]);
          }
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
      const filtered = products.filter(
        product => product.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Handle product selection
  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
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
              <h1 className="mt-4 text-lg font-semibold text-indigo-600">Loading...</h1>
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
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-primary">Products</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product List Panel */}
            <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm">
              {/* <div className="flex items-center mb-4 px-2 py-2 border rounded-md">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search products..."
                  className="flex-1 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div> */}
              
              <div className="max-h-[75vh] overflow-y-auto space-y-2">
                {filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className={`p-3 border rounded-md cursor-pointer transition hover:bg-gray-50 flex items-center justify-between ${
                        selectedProduct?._id === product._id
                          ? "border-indigo-500 bg-indigo-50"
                          : ""
                      }`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-indigo-600">
                          {product.product}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(product.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedProduct?._id === product._id && (
                        <Check className="h-4 w-4 text-indigo-500" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No products found
                  </div>
                )}
              </div>
            </div>
            
            {/* Product Details Panel */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              {selectedProduct ? (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-2xl font-bold text-indigo-600 mb-1">
                      {selectedProduct.product}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      <span>Product Manager: {selectedProduct.productManagerID || "Not assigned"}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">Description</h3>
                      <p className="mt-2 text-gray-600 whitespace-pre-line">
                        {selectedProduct.description || "No description available"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">Problem Statement</h3>
                      <p className="mt-2 text-gray-600 whitespace-pre-line">
                        {selectedProduct.problemStatement || "No problem statement available"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">Expected Solution</h3>
                      <p className="mt-2 text-gray-600 whitespace-pre-line">
                        {selectedProduct.solutionExpected || "No expected solution available"}
                      </p>
                    </div>
                    
                    {/* <div>
                      <h3 className="text-lg font-semibold text-gray-700">Viewers</h3>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedProduct.productViewer && selectedProduct.productViewer.length > 0 ? (
                          selectedProduct.productViewer.map((viewer: string, index: number) => (
                            <div 
                              key={index} 
                              className="flex items-center p-2 bg-gray-50 rounded-md text-sm"
                            >
                              <UserRound className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-gray-600">{viewer}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No viewers assigned</p>
                        )}
                      </div>
                    </div> */}
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm text-gray-500">
                        <div>Created: {new Date(selectedProduct.createdAt).toLocaleDateString()}</div>
                        {/* <div>Last Updated: {new Date(selectedProduct.updatedAt).toLocaleDateString()}</div> */}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-gray-500">
                  <div className="rounded-full bg-gray-100 p-3 mb-4">
                    <Search className="h-6 w-6" />
                  </div>
                  <p>Select a product to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
