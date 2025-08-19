import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/backend/lib/db";
import Owner from "@/backend/models/Owner";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {

        const { id } = await params;

        const { status } = await req.json();

        if (!id) {
            return NextResponse.json(
                { message: "Missing owner ID" },
                { status: 400 }
            );
        }

        if (!["approved", "rejected"].includes(status)) {
            return NextResponse.json(
                { message: "Invalid status" },
                { status: 400 }
            );
        }

        await dbConnect();

        const updatedOwner = await Owner.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedOwner) {
            return NextResponse.json(
                { message: "Owner not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Status updated", owner: updatedOwner },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to update owner" },
            { status: 500 }
        );
    }
}
