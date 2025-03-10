import { connectDB } from "@/lib/mongodb";
import { NextRequest } from "next/server";
import TrlLevelData from "@/models/trlLevelData";

export async function POST(req: NextRequest) {
  try {
    console.log("Inside POST");
    await connectDB();

    const body = await req.json();
    console.log("Received Data:", body);

    // Save to MongoDB (assuming `TrlLevelData` is a Mongoose model)
    const newTrlData = new TrlLevelData(body);
    await newTrlData.save();

    return new Response(
      JSON.stringify({ message: "TRL data saved successfully" }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
