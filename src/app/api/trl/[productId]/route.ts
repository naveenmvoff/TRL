import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrlLevelData from "@/models/trlLevelData";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectDB();
    const { productId } = params;

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const trlData = await TrlLevelData.find({ productId })
      .sort({ trlLevelNumber: 1 });

    return NextResponse.json(
      { 
        success: true, 
        data: trlData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching TRL data:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch TRL data",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
