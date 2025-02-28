"use client";

import React from "react";
import Select from "react-select";
import { useState, useEffect } from "react";
import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import notify from "@/lib/notify";
import { set } from "mongoose";
// import CreateNewProductComp from "@/components/admin-createnewproduct/admin";

interface Product {
  _id: string;
  product: string;
  productManagerID: string;
  productViewer: string[];
  description: string;
  problemStatement: string;
  solutionExpected: string;
}

export default function ProductDashboard() {
  const [showPopupCreateNewProduct, setShowPopupCreateNewProduct] =
    useState(false);
  const [managers, setManagers] = useState<
    { _id: string; name: string; email: string }[]
  >([]);
  const [accessUsers, setAccessUsers] = useState<
    { _id: string; name: string; email: string }[]
  >([]);

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState("");
  const [selectedManagerID, setselectedManagerID] = useState("");
  const [description, setDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [solutionExpected, setSolutionExpected] = useState("");
  const [productDetails, setProductDetails] = useState<Product[]>([]);
  const [selectedViewers, setselectedViewers] = useState<string[]>([]);
  const [selectedViewersID, setSelectedViewersID] = useState<string[]>([]);
  const [selectedProductID, setSelectedProductID] = useState<string | null>(
    null
  );
  const [showPopupDelete, setShowPopupDelete] = useState(false);
  const [showPopupEdit, setShowPopupEdit] = useState(false);


  // console.log("selectedViewersID-------------", selectedViewersID);
  // console.log("selectedViewers&&&&&&&&&&&&&&", selectedViewers);



  useEffect(() => {
    pmData();
    productData();
    userData();
  }, []);

  // TO Get ONLY PM DATA
  const pmData = async () => {
    try {
      const response = await fetch("/api/admin/pm-data", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        // console.log("data-----------------------pm", data);
        setManagers(data);
      } else {
        console.error("Failed to fetch users.");
        notify("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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
        // console.log("DATA of Viewers", data);
      } else {
        console.error("Failed to fetch users.");
        // notify("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // TO Get Product DATA for Dashboard

  const productData = async () => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "GET",
      });
      console.log("GET", response);
      if (response) {
        const data = await response.json();
        // console.log("GET ALL PRODUCT DATA -----------------------", data);

        setProductDetails(data);
      } else {
        console.error("Failed to fetch Product.");
        // notify("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching Products:", error);
    }
  };

  // // Create New Product
  const handleCreateProduct = async () => {
    console.log("clicked");

    if (
      !productName ||
      // !selectedManagerID ||
      !description ||
      !problemStatement ||
      !solutionExpected
    ) {
      console.log("Please fill all required fields");
      notify("Please fill all required fields", "error");
    }

    try {
      const payload = {
        product: productName,
        productManagerID: selectedManagerID,
        productViewer: selectedViewers,
        description,
        problemStatement,
        solutionExpected,
      };

      console.log("Sending data to API:", payload); // Debugging

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("API Response:", response, data);

      if (!response.ok) {
        if (data.errors) {
          setErrorMessages(data.errors);
        } else {
          notify("Failed to create product", "error");
        }
      } else {
        notify("Product created successfully!", "success");
        resetForm();
        setShowPopupCreateNewProduct(false);
        productData();
      }
    } catch (error) {
      console.error("Error:", error);
      notify("Please fill all required fields", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete User Click
  const handleDeleteClick = (productID: string) => {
    setSelectedProductID(productID);
    setShowPopupDelete(true);
  };

  // // Delete User detials in the Data Base!
  const handleDeleteUser = async (productID: string) => {
    // if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productID }),
      });

      if (response.ok) {
        // alert("User deleted successfully!");
        notify("User deleted successfully!", "success");
        productData();

        // setProductDetails(productDetails.filter((product) => product._id !== userId)); // Remove user from state
      } else {
        // alert("Failed to delete user.");
        notify("Failed to delete user.", "error");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      // alert("Something went wrong. Please try again.");
      notify("Something went wrong. Please try again.", "error");
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
      setSelectedViewersID(selectedProduct.productViewer);
      // setSelectedProductID(selectedProduct.productManagerID);
      setDescription(selectedProduct.description);
      setProblemStatement(selectedProduct.problemStatement);
      setSolutionExpected(selectedProduct.solutionExpected);
    }

    setShowPopupEdit(true);
  };

  // const handleUpdateProduct = async () => {
  //   setLoading(true);

  //   if (!selectedProductID) {
  //     console.error("Error: No product ID selected.");
  //     notify("Error: No product ID selected.");
  //     setLoading(false);
  //     return;
  //   }

  //   const updatedProduct = {
  //     _id: selectedProductID, // Ensure _id is sent in the request body
  //     product: productName,
  //     productManagerID: selectedManagerID,
  //     description: description,
  //     problemStatement: problemStatement,
  //     solutionExpected: solutionExpected,
  //   };

  //   console.log("Sending PUT request to: /api/admin/products");
  //   console.log("Updated Product Data:", updatedProduct);

  //   try {
  //     const response = await fetch(`/api/admin/products`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(updatedProduct), // Send ID in the body
  //     });

  //     console.log("Response Status:", response.status);

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("Product updated successfully:", data);
  //       notify("Product updated successfully", "success");
  //       setShowPopupEdit(false);
  //       productData(); // Refresh product data
  //     } else {
  //       const error = await response.json();
  //       console.error("Failed to update product:", error);
  //       notify("Failed to update product.", "error");
  //     }
  //   } catch (error) {
  //     console.error("Error updating product:", error);
  //     notify("Error updating product.", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
      _id: selectedProductID, // Ensure _id is sent in the request body
      product: productName,
      productManagerID: selectedManagerID,
      productViewer: selectedViewersID,
      description: description,
      problemStatement: problemStatement,
      solutionExpected: solutionExpected,
    };

    // console.log("Sending PUT request to: /api/admin/products");
    // console.log("Updated Product Data:************", updatedProduct);

    try {
      const response = await fetch(`/api/admin/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct), // Send ID in the body
      });

      console.log("Response Status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Product details updated successfully:", data);
        notify("Product details updated successfully", "success");
        setShowPopupEdit(false);
        productData(); // Refresh product data
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

  // console.log( {accessUsers.map((accessUsers) => ({
  //   value: accessUsers._id,
  //   label: `${accessUsers.name} - ${accessUsers.email}`,
  // }))})

  let test = accessUsers.map((accessUsers) => ({
    value: accessUsers._id,
    label: `${accessUsers.name} - ${accessUsers.email}`,
  }));

  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      <NavBar role="admin" />
      <div className="flex flex-col sm:flex-row">
        <Sidebar />
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-primary">
              Product Management
            </h2>
            <button
              onClick={() => setShowPopupCreateNewProduct(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
            >
              Create New Product
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              <table className="w-full min-w-[400px] sm:min-w-full border-collapse">
                <thead className="bg-[#DDDDDD] text-black text-md font-bold sticky top-0 z-10">
                  <tr>
                    <th className="pl-4 py-3 text-left">Products</th>
                    <th className="pl-1 py-3 text-left">Manager</th>
                    <th className="pl-1 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productDetails.map((data) => {
                    return (
                      <tr key={data._id} className="text-sm text-black">
                        <td className="pl-4 py-3 whitespace-nowrap text-left">
                          {data.product}
                        </td>
                        {/* <td className="pl-1 py-3 whitespace-nowrap text-left">
                          {managers
                            .filter((i) => i._id === data.productManagerID)
                            .map((i) => i.name).length || "-"}
                        </td> */}

                        <td className="pl-1 py-3 whitespace-nowrap text-left">
                          {managers.find((i) => i._id === data.productManagerID)
                            ?.name || "PM not assigned!"}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create New Product */}
        {/* CreateNewProductComp() */}
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
                    options={managers.map((manager) => ({
                      value: manager._id,
                      label: `${manager.name} - ${manager.email}`,
                    }))}
                    onChange={(e: any) => setselectedManagerID(e.value)}
                    className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  ></Select>

                  <p className="text-md font-regular text-black mt-2">
                    Select Viewers
                  </p>

                  <Select
                    options={accessUsers.map((accessUsers) => ({
                      value: accessUsers._id,
                      label: `${accessUsers.name} - ${accessUsers.email}`,
                    }))}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    // onChange={(e : any) => setselectedViewers(e.value)}
                    onChange={(selectedOptions) =>
                      setselectedViewers(
                        selectedOptions.map((option) => option.value)
                      )
                    }
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
                    ;
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal with consistent styling */}
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
                      await handleDeleteUser(selectedProductID);
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
                    Create New Product
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

                  {/* <Select
                    options={managers.map((manager) => ({
                      // console.log(selectedManagerID);
                      value: manager._id,
                      label: `${manager.name} - ${manager.email}`,
                    }))}
                    defaultValue={
                      managers.length > 0 ? { value: managers[0]._id, label: `${managers[2].name} - ${managers[0].email}`, }: null
                    }
                    onChange={(e: any) => setselectedManagerID(e.value)}
                    className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  ></Select> */}

                  <Select
                    options={managers.map((manager) => ({
                      value: manager._id,
                      label: `${manager.name} - ${manager.email}`,
                    }))}
                    defaultValue={
                      managers.find(
                        (manager) => manager._id === selectedManagerID
                      )
                        ? {
                            value: selectedManagerID,
                            label: `${
                              managers.find(
                                (manager) => manager._id === selectedManagerID
                              )?.name
                            } - ${
                              managers.find(
                                (manager) => manager._id === selectedManagerID
                              )?.email
                            }`,
                          }
                        : null
                    }
                    onChange={(e: any) => setselectedManagerID(e.value)}
                    className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  />

                  <p className="text-md font-regular text-black mt-2">
                    Select Viewers
                  </p>
                  <Select
                    options={test}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    // onChange={(e: any) => setselectedViewers(e.value)}
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

                  {/* <Select
                    options={accessUsers.map((accessUsers) => ({
                      value: accessUsers._id,
                      label: `${accessUsers.name} - ${accessUsers.email}`,
                    }))}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    // onChange={(e : any) => setselectedViewers(e.value)}
                    onChange={(selectedOptions) =>
                      setselectedViewers(
                        selectedOptions.map((option) => option.value)
                      )
                    }
                    className="w-2/3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  ></Select> */}

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
