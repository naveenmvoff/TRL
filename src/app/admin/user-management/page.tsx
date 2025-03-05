// // // E:\Task\TRL\trl\src\app\admin\user-management\page.tsx:
"use client";

import React, { useState, useEffect } from "react";
import NavBar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import { User } from "lucide-react";
import notify from "@/lib/notify";
import { useSession } from "next-auth/react";


interface User {
  createdBy: User;
  _id: string;
  name: string;
  email: string;
  role: string;
  factory?: number | null;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showIfPm, setShowIfPm] = useState(false);
  const [nameEdit, setNameEdit] = useState("");
  const [email, setEmail] = useState("");
  const [RoleEdit, setRoleEdit] = useState("");
  const [error, setError] = useState("");
  const [showPopupEdit, setShowPopupEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPopupDelete, setShowPopupDelete] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [savingUser, setsavingUser] = useState(false);
  
  const {data:Session} = useSession();
  const createdBy = Session?.user.id;
  console.log("createdBy: ========", createdBy);

  // Fetch users Detials
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/user-management", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data); // Set the fetched users in state
      } else {
        console.error("Failed to fetch users.");
        notify("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value1 = e.target.value;
    const value = value1.toLowerCase();
    setEmail(value);

    if (!validateEmail(value)) {
      setError("Please provide a valid email.");
    } else {
      setError("");
    }
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleEdit(e.target.value);
    setShowIfPm(e.target.value === "Product Manager");
    if (isEditing && editingUser) {
      setEditingUser({ ...editingUser, role: e.target.value });
    }
  };

  // Edit User Data
                const handleEditClick = (user: User) => {
                  setIsEditing(true);
                  setEditingUser(user);
                  setNameEdit(user.name);
                  setEmail(user.email);
                  setRoleEdit(user.role);
                  setShowIfPm(user.role === "Product Manager");
                  setShowPopupEdit(true);
                };

                // handleClosePopupEdit for Update New User
                const handleClosePopupEdit = () => {
                  setShowPopupEdit(false);
                  setShowIfPm(false);
                  setIsEditing(false);
                  setEditingUser(null);
                  resetForm();
                };


  // handleClosePopup for Create New User
  const handleClosePopup = () => {
    setShowPopup(false);
    setShowIfPm(false);
    resetForm(); // Clear form inputs when the popup closes
    fetchUsers();
  };

  // Clear form inputs when the popup closes
  const resetForm = () => {
    // Clear form inputs when the popup closes
    setEmail("");
    setError("");
    // (document.querySelector('input[placeholder="Enter user name"]') as HTMLInputElement).value = "";
    // (document.querySelector('select') as HTMLSelectElement).value = "";
    // const factoryInput = document.querySelector('input[placeholder="Enter user factory number"]') as HTMLInputElement;
    // if (factoryInput) factoryInput.value = "";

    setIsEditing(false);
    setEditingUser(null);
    const nameInput = document.querySelector(
      'input[placeholder="Enter user name"]'
    ) as HTMLInputElement;
    const roleSelect = document.querySelector("select") as HTMLSelectElement;
    const factoryInput = document.querySelector(
      'input[placeholder="Enter user factory number"]'
    ) as HTMLInputElement;

    if (nameInput) nameInput.value = "";
    if (roleSelect) roleSelect.value = "";
    if (factoryInput) factoryInput.value = "";
  };

  // // Add new User
  const handleSaveUser = async () => {
  
    const name = (
      document.querySelector(
        'input[placeholder="Enter user name"]'
      ) as HTMLInputElement
    ).value;
    console.log("Name: ", name);
    const email = (
      document.querySelector(
        'input[placeholder="Enter user email"]'
      ) as HTMLInputElement
    ).value;
    console.log("Email: ", email);
    // const role = (document.querySelector('select').value) as string;

    const selectElement = document.querySelector("select");
    const role = selectElement ? (selectElement.value as string) : null;
    console.log("Role: ", role);
    const factoryNumber = (
      document.querySelector(
        'input[placeholder="Enter user factory number"]'
      ) as HTMLInputElement
    )?.value;
    if (!name || !email || !role) {
      // alert("Please fill all required fields");
      // notify("Please fill all required fields");
      notify("Please fill all required fields", "error");

      return;
    }

    if (!validateEmail(email)) {
      notify("Please provide a valid email.", "error");
      return;
    }

    try {
   
      setsavingUser(true);
      const response = await fetch("/api/admin/user-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, role, factoryNumber }),
      });

      const result = await response.json();

      if (response.ok) {
        setsavingUser(false);
        // alert(result.message);
        notify(result.message, "success");
        resetForm(); // Clear form inputs after a successful save
        handleClosePopup(); // Close the popup after successful creation
      } else {
        setsavingUser(false);
        // alert(result.message);
        notify(result.message);
      }
    } catch (error) {
      setsavingUser(false);
      console.error("Error:", error);
      // alert("Something went wrong. Please try again.");
      notify("Something went wrong. Please try again.");
    }
  };

  
  // // Update User detials in the Data Base
  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const name = (
      document.querySelector(
        'input[placeholder="Enter user name"]'
      ) as HTMLInputElement
    ).value;
    const email = (
      document.querySelector(
        'input[placeholder="Enter user email"]'
      ) as HTMLInputElement
    ).value;
    const selectElement = document.querySelector("select");
    const role = selectElement ? (selectElement.value as string) : null;
    const factoryNumber = (
      document.querySelector(
        'input[placeholder="Enter user factory number"]'
      ) as HTMLInputElement
    )?.value;

    if (!name || !email || !role) {
      // alert("Please fill all required fields");
      // notify("Please fill all required fields");
      notify("Please fill all required fields", "warning");
      return;
    }

    try {
      const response = await fetch("/api/admin/user-management", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: editingUser._id,
          name,
          email,
          role,
          factoryNumber,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // alert(result.message);
        notify(result.message);
        // handleClosePopupEdit();
      } else {
        // alert(result.message);
        notify(result.message);
      }

      fetchUsers(); // recall the data to update the user details
    } catch (error) {
      console.error("Error:", error);
      // alert("Something went wrong. Please try again.");
      notify("Something went wrong. Please try again.");
    }
  };


  // Delete User Click
  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowPopupDelete(true);
  };

  // // Delete User detials in the Data Base!
  const handleDeleteUser = async (userId: string) => {
    // if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch("/api/admin/user-management", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // alert("User deleted successfully!");
        notify("User deleted successfully!", "success");
        setUsers(users.filter((user) => user._id !== userId)); // Remove user from state
      } else {
        // alert("Failed to delete user.");
        notify("Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      // alert("Something went wrong. Please try again.");
      notify("Something went wrong. Please try again.");
    }
  };


  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      <NavBar role="Admin" />
      <div className="flex flex-col sm:flex-row">
        <Sidebar />
        <div className="flex-1 p-4 sm:p-6">
          {/* Header section aligned with product management */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-primary">User Management</h2>
            <button
              onClick={() => setShowPopup(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
            >
              Create New User
            </button>
          </div>

          {/* Table with consistent responsive behavior */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              <table className="w-full min-w-[400px] sm:min-w-full border-collapse">
                <thead className="bg-[#DDDDDD] text-black text-md font-bold sticky top-0 z-10">
                  <tr>
                    <th className="pl-4 py-3 text-left">User Name</th>
                    <th className="pl-1 py-3 text-left">User Email</th>
                    <th className="pl-1 py-3 text-left">Role</th>
                    <th className="pl-1 py-3 text-left">PF No</th>
                    <th className="pl-1 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="text-sm text-black hover:bg-gray-50">
                      <td className="pl-4 py-3 whitespace-nowrap text-left">{user.name}</td>
                      <td className="pl-1 py-3 whitespace-nowrap text-left">{user.email}</td>
                      <td className="pl-1 py-3 whitespace-nowrap text-left">{user.role}</td>
                      <td className="pl-1 py-3 whitespace-nowrap text-left">{user.factory ?? "-"}</td>
                      <td className="pl-1 py-3 whitespace-nowrap text-left">
                        <button
                          onClick={() => handleDeleteClick(user._id)}
                          className="text-red1 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create New User Modal with consistent styling */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-lg min-w-96 max-h-[100vh] ">
              <div className="max-h-[90vh]">
                <div className="flex flex-row justify-between items-start sticky top-0 bg-white">
                  <h3 className="text-lg font-semibold text-black">Create New User</h3>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-red1 hover:text-black"
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
                  </button>
                </div>

                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-md font-regular text-black">Name</p>
                    <input
                      type="text"
                      placeholder="Enter user name"
                      className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <p className="text-md font-regular text-black">Email</p>
                    <input
                      type="email"
                      placeholder="Enter user email"
                      value={email}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        error ? "border-red-500" : "border-secondary"
                      } text-black rounded-md focus:outline-none focus:ring-2 ${
                        error ? "focus:ring-red-500" : "focus:ring-secondary"
                      }`}
                    />
                  </div>

                  <div>
                    <p className="text-md font-regular text-black">Role</p>
                    <select
                      onChange={handleRoleChange}
                      className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="" className="text-black bg-gray-300">Select Role</option>
                      <option value="Stakeholders" className="text-black">Stakeholders</option>
                      <option value="Product Manager" className="text-black">Product Manager</option>
                    </select>
                  </div>

                  {showIfPm && (
                    <div>
                      <p className="text-md font-regular text-black">Factory Number</p>
                      <input
                        type="text"
                        placeholder="Enter user factory number"
                        className="w-2/3 p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  )}

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      onClick={handleClosePopup}
                      className="px-4 py-2 bg-red1 text-white rounded-md hover:bg-red2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveUser}
                      disabled={savingUser}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
                    >
                      {!savingUser ? "Create" : "Creating!"}
                    </button>
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
              <p className="text-black mb-6">Are you sure you want to delete this user?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowPopupDelete(false)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (selectedUserId) {
                      await handleDeleteUser(selectedUserId);
                    }
                    setShowPopupDelete(false);
                    setSelectedUserId(null);
                  }}
                  className="px-4 py-2 bg-red1 text-white rounded-md hover:bg-red2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}




      </div>
    </div>
  );



}
