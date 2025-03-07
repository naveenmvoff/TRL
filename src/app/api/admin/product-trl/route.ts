import { connectDB } from "@/lib/mongodb";
import { NextRequest } from "next/server";
import TrlLevelData from "@/models/trlLevelData";


export async function POST(req: NextRequest) { 
    try {
        await connectDB();
        const body = await req.json();
    } catch (error) {
        
    }
}