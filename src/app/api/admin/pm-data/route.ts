import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET() {
    try {
      await connectDB(); // Connect to MongoDB
      const users = await User.find({role:"Product Manager"}); // Fetch all users in the database
      // console.log("only PM Data",users)
      return NextResponse.json(users, { status: 200 });
  
  
    } catch (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({ message: "Failed to fetch users." }, { status: 500 });
    }
  }