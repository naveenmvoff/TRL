import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const userID = url.searchParams.get("userID");

        await connectDB();
        
        if (userID) {
            console.log("Fetching PM data for userID:", userID);
            const user = await User.findById(userID);
            
            if (!user) {
                return NextResponse.json({ 
                    success: false, 
                    message: "Product Manager not found" 
                }, { status: 404 });
            }
            
            // Return only necessary data
            return NextResponse.json({
                success: true,
                name: user.name,
                email: user.email,
                role: user.role
            }, { status: 200 });
        }

        // Fetch all Product Managers
        const users = await User.find({ role: "Product Manager" })
            .select('name email role');
        
        return NextResponse.json({
            success: true,
            users
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching product manager data:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to fetch product manager data" 
        }, { status: 500 });
    }
}
