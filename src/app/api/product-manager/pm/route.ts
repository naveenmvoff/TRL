import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import Product from "@/models/product";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    console.log("pmId", id);


    await connectDB();

    if (id) {
      // If PM-ID is provided, fetch specific PM
      const ProductData = await Product.find({
        productManagerID: id,
      });
      return NextResponse.json(ProductData || {}, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "No ID provided." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users." },
      { status: 500 }
    );
  }
}
