// export default function CreateNewProduct() {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-2/3">
//         <div className="flex flex-row justify-between items-start">
//           <h3 className="text-lg font-semibold text-black">
//             Create New Product
//           </h3>
//           <p
//             onClick={() => setShowPopupCreateNewProduct(false)}
//             className="text-lg font-semibold text-red1 hover:text-black hover:font-bold "
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={1.5}
//               stroke="currentColor"
//               className="size-7"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
//               />
//             </svg>
//           </p>
//         </div>
//         <div className="space-y">
//           <p className="text-md font-regular text-black mt-2">Product name</p>
//           <input
//             type="text"
//             value={productName}
//             onChange={(e) => setProductName(e.target.value)}
//             placeholder="Enter product name"
//             className="w-1/3 p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
//           />

//           <p className="text-md font-regular text-black mt-2">
//             Product Manager Name & Email
//           </p>

//           <select
//             value={selectedManager}
//             onChange={(e) => setSelectedManager(e.target.value)}
//             className="w-2/3 p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
//           >
//             <option className="text-black bg-gray-300">
//               Select product manager
//             </option>
//             {managers.map((manager) => (
//               <option key={manager._id} value={manager._id}>
//                 {manager.name} - {manager.email}
//               </option>
//             ))}
//           </select>

//           <p className="text-md font-regular text-black mt-2">Description</p>
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             placeholder="Enter the description of the product"
//             className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
//             rows={4}
//           />
//           <p className="text-md font-regular text-black mt-2">
//             Problem statement
//           </p>
//           <textarea
//             value={problemStatement}
//             onChange={(e) => setProblemStatement(e.target.value)}
//             placeholder="Enter the problem statement of the product"
//             className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
//             rows={4}
//           />

//           <p className="text-md font-regular text-black mt-2">
//             Solution Expected
//           </p>
//           <textarea
//             value={solutionExpected}
//             onChange={(e) => setSolutionExpected(e.target.value)}
//             placeholder="Enter the expected solution of the product"
//             className="w-full p-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
//             rows={4}
//           />

//           {/* {errorMessages.length > 0 && (
//               <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 my-2">
//                 {errorMessages.map((msg, index) => (
//                   <p key={index}>{msg}</p>
//                 ))}
//               </div>
//             )} */}

//           <div className="mt-6 flex justify-end gap-4">
//             <button
//               onClick={() => setShowPopupCreateNewProduct(false)}
//               className="px-4 py-2 bg-red1 rounded-md hover:bg-red2"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleCreateProduct}
//               disabled={loading}
//               className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
//             >
//               {loading ? "Creating..." : "Create"}
//             </button>
//             ;
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
