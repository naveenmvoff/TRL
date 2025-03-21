import { NextResponse } from "next/server"; 
import { connectDB } from "@/lib/mongodb"; 
import User from "@/models/user";

export async function GET(/* request: Request */) { 
  try { 
    // Extract userID from the URL or query parameters 
    // const url = new URL(request.url); 
    // const userID = url.searchParams.get("userID");
    
    await connectDB(); // Connect to MongoDB
  
    // Fetch all users with role Product Manager
    const users = await User.find({role: "Product Manager"});
    return NextResponse.json(users, { status: 200 });

  } catch (error) {
    console.error("Error fetching product manager data:", error);
    return NextResponse.json({ message: "Failed to fetch product manager data." }, { status: 500 });
  }
}