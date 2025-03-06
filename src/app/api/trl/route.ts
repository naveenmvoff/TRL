import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import TRL from "@/models/trlMasterSchema";

export async function GET() {
  try {
    await connectDB();
    const TRLDetails = await TRL.find();
    console.log("TRLDetails", TRLDetails);
    
    // Return the data with proper response
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
