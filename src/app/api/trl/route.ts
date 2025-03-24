import { NextResponse } from "next/server";
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


// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import TrlMaster from "@/models/trlMaster";

// export async function GET() {
//   try {
//     await connectDB();
//     const trlData = await TrlMaster.find({}).sort({ trlLevelNumber: 1 });
//     console.log("Step 1");
//     if (!trlData) {
//       console.log("Step 1 fail");
//       return NextResponse.json(
//         { success: false, error: "No TRL data found" },
//         { status: 404 }
//       );
//     }

//     console.log("Step 2")
//     console.log("trlData**", trlData)
//     return NextResponse.json({ success: true, data: trlData }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching TRL master data:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch TRL master data",
//         details: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }
