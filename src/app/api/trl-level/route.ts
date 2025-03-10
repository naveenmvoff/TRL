import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrlLevelData from "@/models/trlLevelData";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const productId = url.searchParams.get('productId');
        
        if (!productId) {
            return NextResponse.json({
                success: false,
                error: "Product ID is required"
            }, { status: 400 });
        }

        console.log("Product ID: ", productId);
        
        await connectDB();
        const trlLevelData = await TrlLevelData.find({ productId })
        console.log("TRL Level Data================: ", trlLevelData);
        
        return NextResponse.json({
            success: true,
            data: trlLevelData
        }, { status: 200 });

    } catch (error) {
        console.log("Unable to GET TRL Level Data", error);
        return NextResponse.json({
            success: false,
            error: "Failed to fetch TRL level data"    
        }, { status: 500 });
    }
}