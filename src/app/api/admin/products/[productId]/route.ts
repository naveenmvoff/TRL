import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/product";
import TrlLevelData from "@/models/trlLevelData";
import mongoose from "mongoose";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectDB();
    const { productId } = params;

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    // First delete all associated TRL level data
    await TrlLevelData.deleteMany({ productId });

    // Then delete the product
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Product and associated TRL data deleted successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product and associated data" },
      { status: 500 }
    );
  }
}
