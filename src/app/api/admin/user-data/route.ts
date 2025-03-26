import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    await connectDB(); // Connect to MongoDB

    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("userID");

    if (!userID) {
      return NextResponse.json(
        { success: false, message: "Missing userID in request" },
        { status: 400 }
      );
    }

    if (userID) {
      const users = await User.find({ userID: userID, role: { $in: ["Product Manager", "Stakeholders"] } });
      return NextResponse.json(users, { status: 200 });
    } else {
      const users = "No user found";
      return NextResponse.json(
        { users, message: "No user found" },
        { status: 200 }
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
