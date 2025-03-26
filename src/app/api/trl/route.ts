import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TRL from "@/models/trlMasterSchema";

export async function GET() {
  try {
    await connectDB();
    const TRLDetails = await TRL.find().sort({ trlLevelNumber: 1 });
    
    return NextResponse.json({
      success: true,
      data: TRLDetails
    }, { status: 200 });

  } catch (error) {
    console.log("Unable to GET TRL Details", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch TRL details"
    }, { status: 500 });
  }
}
