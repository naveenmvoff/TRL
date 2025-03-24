import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrlMaster from "@/models/trlMaster";
import TrlLevelData from "@/models/trlLevelData";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { productId } = await req.json();

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Get all TRL master data
    const trlMasterData = await TrlMaster.find().sort({ trlLevelNumber: 1 });

    // Create TRL level data entries for each sublevel
    const trlLevelPromises = trlMasterData.flatMap((masterLevel) =>
      masterLevel.subLevels.map((subLevel) => ({
        productId,
        trlLevelId: masterLevel._id,
        subLevelId: subLevel._id,
        description: "",
        currentUpdate: "",
        status: "Pending",
        documentationLink: "",
        otherNotes: "",
        demoRequired: false,
        demoStatus: "",
      }))
    );

    // Insert all TRL level data
    await TrlLevelData.insertMany(trlLevelPromises);

    return NextResponse.json(
      { success: true, message: "TRL data initialized successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error initializing TRL data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize TRL data" },
      { status: 500 }
    );
  }
}
