import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/product";
import mongoose from "mongoose";  // Import mongoose to check for valid ObjectId




// //==================GET THE PRODUCT THAT LINKED TO THIS PMID===================

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
    
    console.log("productData in API ========", productData);
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
