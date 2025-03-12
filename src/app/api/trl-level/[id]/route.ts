import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrlLevelData from "@/models/trlLevelData";

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