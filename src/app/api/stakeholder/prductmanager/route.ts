import { NextResponse } from "next/server"; import { connectDB } from "@/lib/mongodb"; import User from "@/models/user";

export async function GET(request: Request) { try { // Extract userID from the URL or query parameters const url = new URL(request.url); const userID = url.searchParams.get("userID");
await connectDB(); // Connect to MongoDB
  
  // If userID is provided, fetch specific PM data, otherwise fetch all PMs
  if (userID) {
    console.log("Fetching specific PM data for userID:", userID);
    const user = await User.findOne({ 
      _id: userID,
    });
    
    if (!user) {
      return NextResponse.json({ message: "Product Manager not found" }, { status: 404 });
    }
    
    return NextResponse.json(user, { status: 200 });
  } else {
    // Fetch all users with role Product Manager (keep existing functionality)
    const users = await User.find({role: "Product Manager"});
    return NextResponse.json(users, { status: 200 });
  }

} catch (error) {
  console.error("Error fetching product manager data:", error);
  return NextResponse.json({ message: "Failed to fetch product manager data." }, { status: 500 });
}
}