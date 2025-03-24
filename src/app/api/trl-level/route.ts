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
        // console.log("TRL Level Data================: ", trlLevelData);
        
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

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();

        await connectDB();

        const updatedTrlLevel = await TrlLevelData.findByIdAndUpdate(
            id,
            {
                description: body.description,
                currentUpdate: body.currentUpdate,
                documentationLink: body.documentationLink,
                otherNotes: body.otherNotes,
                demoRequired: body.demoRequired,
                demoStatus: body.demoStatus,
                status: body.status,
                startDate: body.startDate,
                estimatedDate: body.estimatedDate,
                extendedDate: body.extendedDate,
            },
            { new: true }
        );

        if (!updatedTrlLevel) {
            return NextResponse.json(
                { success: false, error: "TRL level not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: updatedTrlLevel },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating TRL level:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update TRL level" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const productId = url.searchParams.get('productId');
        
        if (!productId) {
            return NextResponse.json({
                success: false,
                error: "Product ID is required"
            }, { status: 400 });
        }

        await connectDB();
        const result = await TrlLevelData.deleteMany({ productId });
        
        return NextResponse.json({
            success: true,
            message: "TRL level data deleted successfully",
            deletedCount: result.deletedCount
        }, { status: 200 });

    } catch (error) {
        console.error("Error deleting TRL level data:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to delete TRL level data"
        }, { status: 500 });
    }
}