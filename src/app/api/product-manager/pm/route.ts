import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/product";
import mongoose from "mongoose";  // Import mongoose to check for valid ObjectId

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    console.log("Received pmId:", id);

    if (!id) {
      return NextResponse.json(
        { message: "No Product Manager ID (pmId) provided." },
        { status: 400 }
      );
    }

    await connectDB();

    // Optional: Check if ID is valid ObjectId to avoid mongoose errors
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid PM ID format." },
        { status: 400 }
      );
    }

    // Fetch products linked to this productManagerID
    const productData = await Product.find({ productManagerID: id })
      // .populate("createdBy", "name email")
      // .populate("productManagerID", "name email")
      // .populate("productViewer", "name email");
    console.log("productData in API ========", productData);

    // if (!productData || productData.length === 0) {
    //   return NextResponse.json(
    //     { message: "No products found for this PM ID." },
    //     { status: 404 }
    //   );
    // }
    if (productData.length === 0) {
      return NextResponse.json(
        { message: "No products found for this Product Manager.", products: [] },
        { status: 200 }
      );
    }

    // Return found products
    return NextResponse.json({ products: productData }, { status: 200 });

  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch product details." },
      { status: 500 }
    );
  }
}



// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import User from "@/models/user";
// import Product from "@/models/product";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");
//     console.log("pmId", id);


//     await connectDB();

//     if (id) {
//       // If PM-ID is provided, fetch specific PM
//       const ProductData = await Product.find({
//         productManagerID: id,
//       });
//       console.log("ProductData in API", NextResponse.json(ProductData || {}, { status: 200 }));
//       return NextResponse.json(ProductData || {}, { status: 200 });
//     } else {
//       return NextResponse.json(
//         { message: "No ID provided." },
//         { status: 400 }
//       );
//     }
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     return NextResponse.json(
//       { message: "Failed to fetch users." },
//       { status: 500 }
//     );
//   }
// }
