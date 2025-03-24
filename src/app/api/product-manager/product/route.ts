import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/product";
import TrlLevelData from "@/models/trlLevelData";

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if TRL data exists for this product
    const trlDataExists = await TrlLevelData.exists({ productId: id });
    
    // If no TRL data exists, initialize it
    if (!trlDataExists) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trl-level/init`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: id }),
        });
      } catch (error) {
        console.error("Error initializing TRL data:", error);
      }
    }

    return NextResponse.json(product);
  } catch{
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
