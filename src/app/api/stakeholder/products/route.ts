import { NextRequest, NextResponse } from "next/server";
import Product from "../../../../models/product";
import { connectDB } from "../../../../lib/mongodb"; // Make sure this connects to MongoDB
// Removing unused import
// import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    try {
      await connectDB();
  
      // const userID = req.nextUrl.searchParams.get("userID");
      const { searchParams } = new URL(req.url);
      const userID = searchParams.get("userID");
      console.log("userID================", userID);
  
      if (!userID) {
        return NextResponse.json(
          { success: false, message: "Missing userID in request" },
          { status: 400 }
        );
      }
      const products = await Product.find({ productViewer: userID });
      
  
      console.log("GET products:", products);
  
      return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error) {
      console.error("GET products error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch products" },
        { status: 500 }
      );
    }
  }