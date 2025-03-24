"use client";

import React, { useCallback } from "react";
import Select from "react-select";
import { useState, useEffect } from "react";
import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import notify from "@/lib/notify";
import { useSession } from "next-auth/react";

interface User {
  _id: string;
  name: string;
}

interface Product {
  userID: User;
  _id: string;
  product: string;
  productManagerID: string;
  productViewer: string[];
  description: string;
  problemStatement: string;
  solutionExpected: string;
  createdAt: string;
}

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
    <h1 className="mt-4 text-lg font-semibold text-indigo-600">Loading...</h1>
  </div>
);

export default function ProductManagementPage() {
  const [showPopupCreateNewProduct, setShowPopupCreateNewProduct] =
    useState(false);
  const [managers, setManagers] = useState<
    { _id: string; name: string; email: string }[]
  >([]);
  const [accessUsers, setAccessUsers] = useState<
    { _id: string; name: string; email: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState("");
  const [selectedManagerID, setselectedManagerID] = useState("");
  // useState to manage which manager is selected
  // This state is used in the UI to display the selected manager's name in the dropdown
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedManagerName, setSelectedManagerName] = useState("");
  const [description, setDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [solutionExpected, setSolutionExpected] = useState("");
  const [selectedViewers, setselectedViewers] = useState<string[]>([]);
  const [selectedViewersID, setSelectedViewersID] = useState<string[]>([]);
  const [selectedProductID, setSelectedProductID] = useState<string | null>(
    null
  );
  const [showPopupDelete, setShowPopupDelete] = useState(false);
  const [showPopupEdit, setShowPopupEdit] = useState(false);
  const [trlDetials, setTrlDetials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Error messages are displayed in the UI when needed
  // Commenting out until used to avoid ESLint warnings
  // const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const { data: Session } = useSession();
  const userID = Session?.user?.id;
  console.log("userID: ", userID);
  const [productDetails, setProductDetails] = useState<Product[]>([]);

  console.log("trlDetials", trlDetials);

  // TO Get Product DATA for Dashboard
  const productData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/products?userID=${userID}`, {
        method: "GET",
      });

      if (response) {
        const data = await response.json();
        setProductDetails(data.products);
      } else {
        console.error("Failed to fetch Product.");
      }
    } catch (error) {
      console.error("Error fetching Products:", error);
    }
  }, [userID]);

  useEffect(() => {
    if (Session?.user?.id) {
      console.log("userID: ", Session.user.id);
      productData(); // Pass userID as an argument
    }
  }, [Session, productData]);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/products");
        const data = await response.json();

        if (data.success) {
          setProductDetails(data.products);
        } else {
          console.log("Error!, Failed to fetch products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();

    pmData();
    userData();
  }, [productData]);

  // TO Get ONLY PM DATA
  const pmData = async () => {
    try {
      const response = await fetch("/api/admin/pm-data", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setManagers(data);
      } else {
        console.error("Failed to fetch users.");
        notify("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  //====== Fetch the TRL Master Data ======

  const trlMasterData = async () => {
    console.log("Inside TRL Master Data - Admin");

    try {
      const response = await fetch("/api/trl");
      console.log("ItrlMD - Got responce");
      const data = await response.json();
      if (data.success) {
        setTrlDetials(data.data);
      } else {
        console.error("Failed to fetch TRL details:", data.error);
      }
    } catch (error) {
      console.log("Unable to GET TRL Details", error);
      return {
        success: false,
        error: "Failed to fetch TRL details",
      };
    }
  };

  // TO Get ALL USER DATA
  const userData = async () => {
    try {
      const response = await fetch("/api/admin/user-data", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setAccessUsers(data);
      } else {
        console.error("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Create New Product
  const handleCreateProduct = async () => {
    console.log("clicked");

    if (
      !productName ||
      !description ||
      !problemStatement ||
      !solutionExpected
    ) {
      console.log("Please fill all required fields");
      notify("Please fill all required fields", "error");
      return;
    }

    try {
      const payload = {
        userID: Session?.user.id,
        product: productName,
        productManagerID: selectedManagerID,
        productViewer: selectedViewers,
        description,
        problemStatement,
        solutionExpected,
      };

      console.log("Sending data to API:", payload);

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("API Response: ", response, data);
      console.log("API Data: ", data);

      if (!response.ok) {
        if (data.errors) {
          // setErrorMessages(data.errors);
        } else {
          notify("Failed to create product", "error");
        }
      } else {
        notify("Product created successfully!", "success");
        resetForm();
        setShowPopupCreateNewProduct(false);
        productData();
        createTrlLevels(data.product._id, trlDetials);
      }
    } catch (error) {
      console.error("Error:", error);
      notify("Please fill all required fields", "error");
    } finally {
      setLoading(false);
    }
  };

  const createTrlLevels = async (
    productID: string,
    trlDetails: Array<{ _id: string; subLevels: Array<{ _id: string }> }>
  ) => {
    for (const trl of trlDetails) {
      const trlLevelID = trl._id;

      for (const subLevel of trl.subLevels) {
        const payload = {
          userID: userID,
          productId: productID,
          trlLevelId: trlLevelID,
          subLevelId: subLevel._id,
          description: "",
          currentUpdate: "",
          status: "to do",
          documentationLink: "",
          otherNotes: "",
          demoRequired: false,
          demoStatus: "pending",
          startDate: "",
          estimatedDate: "",
          extendedDate: "",
        };

        console.log("Payload****", payload);

        try {
          const response = await fetch("/api/admin/product-trl", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            console.error("Failed to send TRL data:", response.statusText);
          } else {
            console.log("TRL data sent successfully");
          }
        } catch (error) {
          console.error("Error sending TRL data:", error);
        }
      }
    }
  };

  const handleDeleteClick = (productID: string) => {
    setSelectedProductID(productID);
    setShowPopupDelete(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const productResponse = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await productResponse.json();

      if (!productResponse.ok) {
        notify(data.message || "Failed to delete product", "error");
        return;
      }

      if (data.success) {
        notify("Product deleted successfully", "success");
        await productData();
        setShowPopupDelete(false);
        setSelectedProductID(null);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      notify("Error occurred while deleting product", "error");
    }
  };

  const handleEditClick = (productID: string) => {
    setSelectedProductID(productID);

    const selectedProduct = productDetails.find(
      (product) => product._id === productID
    );

    if (selectedProduct) {
      setProductName(selectedProduct.product);
      setselectedManagerID(selectedProduct.productManagerID);
      
      // Find the manager and set their name
      const manager = managers.find(m => m._id === selectedProduct.productManagerID);
      setSelectedManagerName(manager ? `${manager.name} - ${manager.email}` : '');
      
      setSelectedViewersID(selectedProduct.productViewer);
      setDescription(selectedProduct.description);
      setProblemStatement(selectedProduct.problemStatement);
      setSolutionExpected(selectedProduct.solutionExpected);
    }

    setShowPopupEdit(true);
  };

  const handleUpdateProduct = async () => {
    setLoading(true);
    console.log("UPDATE CLICKED ");
    console.log("selectedViewersID----IN--UPDATE", selectedViewersID);
    console.log("selectedProductID-----IN--UPDATE", selectedProductID);

    if (!selectedProductID) {
      console.error("Error: No product ID selected.");
      notify("Error: No product ID selected.");
      setLoading(false);
      return;
    }

    const updatedProduct = {
      userID: Session?.user.id,
      productId: selectedProductID,
      product: productName,
      productManagerID: selectedManagerID,
      productViewer: selectedViewersID,
      description: description,
      problemStatement: problemStatement,
      solutionExpected: solutionExpected,
    };

    try {
      const response = await fetch(`/api/admin/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      console.log("Response Status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Product details updated successfully:", data);
        notify("Product details updated successfully", "success");
        setShowPopupEdit(false);
        productData();
      } else {
        const error = await response.json();
        console.error("Failed to update product:", error);
        notify("Failed to update product.", "error");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      notify("Error updating product.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductName("");
    setselectedManagerID("");
    setDescription("");
    setProblemStatement("");
    setSolutionExpected("");
  };

  const test = accessUsers.map((accessUsers) => ({
    value: accessUsers._id,
    label: `${accessUsers.name} - ${accessUsers.email}`,
  }));

  const managerOptions = managers.map((manager) => ({
    value: manager._id,
    label: `${manager.name} - ${manager.email}`,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white w-full overflow-hidden">
        <NavBar role="admin" />
        <div className="flex h-[calc(100vh-4rem)]">
          <Sidebar />
          <div className="flex-grow">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (productDetails.length === 0) {
    console.log("No products found");
  }

  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      <NavBar role="admin" />
      <div className="flex flex-col sm:flex-row">
        <Sidebar />
        <div className="flex-1 p-4 sm:p-6 bg-secondary">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-primary">
              Product Management
            </h2>
            <button
              onClick={() => {
                setShowPopupCreateNewProduct(true);
                trlMasterData();
              }}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
            >
              Create New Product
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              {/* <table className="w-full min-w-[400px] sm:min-w-full border-collapse">
                <thead className="bg-[#DDDDDD] text-black text-md font-bold sticky top-0 z-10">
                  <tr>
                    <th className="pl-4 py-3 text-left">Products</th>
                    <th className="pl-1 py-3 text-left">Manager</th>
                    <th className="pl-1 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(Array.isArray(productDetails) ? productDetails : []).map(
                    (data) => {
                      return (
                        <tr key={data._id} className="text-sm text-black">
                          <td className="pl-4 py-3 whitespace-nowrap text-left">
                            {data.product}
                          </td>
                          <td className="pl-1 py-3 whitespace-nowrap text-left">
                            {managers.find(
                              (i) => i._id === data.productManagerID
                            )?.name || "PM not assigned!"}
                          </td>
                          <td className="pl-1 py-3 whitespace-nowrap text-left">
                            <button
                              onClick={() => handleEditClick(data._id)}
                              className="text-primary hover:underline mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(data._id)}
                              className="text-red1 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ) 
                    }
                  )}
                </tbody>
              </table> */}
              <table className="w-full min-w-[400px] sm:min-w-full border-collapse">
  <thead className="bg-[#DDDDDD] text-black text-md font-bold sticky top-0 z-10">
    <tr>
      <th className="pl-4 py-3 text-left">Products</th>
      <th className="pl-1 py-3 text-left">Manager</th>
      <th className="pl-1 py-3 text-left">Actions</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {(Array.isArray(productDetails) && productDetails.length > 0) ? (
      productDetails.map((data) => (
        <tr key={data._id} className="text-sm text-black">
          <td className="pl-4 py-3 whitespace-nowrap text-left">
            {data.product}
          </td>
          <td className="pl-1 py-3 whitespace-nowrap text-left">
            {managers.find((i) => i._id === data.productManagerID)?.name || "PM not assigned!"}
          </td>
          <td className="pl-1 py-3 whitespace-nowrap text-left">
            <button
              onClick={() => handleEditClick(data._id)}
              className="text-primary hover:underline mr-2"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(data._id)}
              className="text-red1 hover:underline"
            >
              Delete
            </button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td
          colSpan={3}
          className="pl-4 py-3 text-center text-gray-500 italic"
        >
          No Product is Available, Create New Product
        </td>
      </tr>
    )}
  </tbody>
</table>

            </div>
          </div>
        </div>

        {showPopupCreateNewProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 max-h-[100vh] overflow-hidden">
              <div className="max-h-[90vh] overflow-y-auto ">
                <div className="flex flex-row justify-between items-start sticky top-0 bg-white  overflow-y-auto">
                  <h3 className="text-lg items-start font-semibold text-black">
                    Create New Product
                  </h3>
                  <p
                    onClick={() => setShowPopupCreateNewProduct(false)}
                    className="text-lg font-semibold text-red1 hover:text-black hover:font-bold "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </p>
                </div>
                <div className="space-y">
                  <p className="text-md font-regular text-black mt-2">
                    Product Name <span className="text-red-500">*</span>
                  </p>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    className="w-1/3 p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  />

                  <p className="text-md font-regular text-black mt-2">
                    Product Manager Name & Email
                  </p>

                  <Select
                    options={managerOptions}
                    defaultValue={
                      selectedManagerID
                        ? {
                            label: selectedManagerName,
                            value: selectedManagerID,
                          }
                        : null
                    }
                    onChange={(option) => option && setselectedManagerID(option.value)}
                    className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  ></Select>

                  <p className="text-md font-regular text-black mt-2">
                    Select Viewers
                  </p>

                  <Select
                    options={test}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    onChange={(selectedOptions) =>
                      setselectedViewers(
                        selectedOptions.map((option) => option.value)
                      )
                    }
                    className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  ></Select>

                  <p className="text-md font-regular text-black mt-2">
                    Description <span className="text-red-500">*</span>
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter the description of the product"
                    className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                    rows={4}
                  />
                  <p className="text-md font-regular text-black mt-2">
                    Problem statement <span className="text-red-500">*</span>
                  </p>
                  <textarea
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    placeholder="Enter the problem statement of the product"
                    className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                    rows={4}
                  />

                  <p className="text-md font-regular text-black mt-2">
                    Solution Expected <span className="text-red-500">*</span>
                  </p>
                  <textarea
                    value={solutionExpected}
                    onChange={(e) => setSolutionExpected(e.target.value)}
                    placeholder="Enter the expected solution of the product"
                    className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                    rows={4}
                  />

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      onClick={() => setShowPopupCreateNewProduct(false)}
                      className="px-4 py-2 bg-red1 rounded-md hover:bg-red2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateProduct}
                      disabled={loading}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
                    >
                      {loading ? "Creating..." : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPopupDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
              <p className="text-black mb-6">
                Are you sure you want to delete this user?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowPopupDelete(false)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (selectedProductID) {
                      await handleDeleteProduct(selectedProductID);
                    }
                    setShowPopupDelete(false);
                    setSelectedProductID(null);
                  }}
                  className="px-4 py-2 bg-red1 text-white rounded-md hover:bg-red2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showPopupEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 max-h-[100vh] overflow-hidden">
              <div className="max-h-[90vh] overflow-y-auto ">
                <div className="flex flex-row justify-between items-start sticky top-0 bg-white  overflow-y-auto">
                  <h3 className="text-lg items-start font-semibold text-black">
                    Update Product
                  </h3>
                  <p
                    onClick={() => setShowPopupEdit(false)}
                    className="text-lg font-semibold text-red1 hover:text-black hover:font-bold "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </p>
                </div>

                <div className="space-y">
                  <p className="text-md font-regular text-black mt-2">
                    Product Name
                  </p>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    className="w-1/3 p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  />

                  <p className="text-md font-regular text-black mt-2">
                    Product Manager Name & Email
                  </p>

                  <Select
                    options={managerOptions}
                    value={selectedManagerID ? {
                      value: selectedManagerID,
                      label: managers.find(m => m._id === selectedManagerID)
                        ? `${managers.find(m => m._id === selectedManagerID)?.name} - ${managers.find(m => m._id === selectedManagerID)?.email}`
                        : ''
                    } : null}
                    onChange={(option) => {
                      if (option) {
                        setselectedManagerID(option.value);
                        setSelectedManagerName(option.label);
                      }
                    }}
                    className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  />

                  <p className="text-md font-regular text-black mt-2">
                    Select Viewers
                  </p>
                  <Select
                    options={test}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    onChange={(selectedOptions) =>
                      setSelectedViewersID(
                        selectedOptions.map((option) => option.value)
                      )
                    }
                    defaultValue={test.filter((option) =>
                      selectedViewersID.find((id) => id == option.value)
                    )}
                    className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  ></Select>

                  <p className="text-md font-regular text-black mt-2">
                    Description
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter the description of the product"
                    className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                    rows={4}
                  />
                  <p className="text-md font-regular text-black mt-2">
                    Problem statement
                  </p>
                  <textarea
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    placeholder="Enter the problem statement of the product"
                    className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                    rows={4}
                  />

                  <p className="text-md font-regular text-black mt-2">
                    Solution Expected
                  </p>
                  <textarea
                    value={solutionExpected}
                    onChange={(e) => setSolutionExpected(e.target.value)}
                    placeholder="Enter the expected solution of the product"
                    className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                    rows={4}
                  />

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      onClick={() => setShowPopupEdit(false)}
                      className="px-4 py-2 bg-red1 rounded-md hover:bg-red2"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleUpdateProduct}
                      disabled={loading}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
                    >
                      {loading ? "Updating..." : "Update"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
