import { NextRequest, NextResponse } from "next/server";
import Owner from "@/backend/models/Owner";
import { dbConnect } from "@/backend/lib/db";
import { sendOwnerReqEmail } from "@/backend/lib/email";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, address } = await req.json();

        if (!name || !email || !address) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await dbConnect();

        const ownerExists = await Owner.findOne({
            $or: [{ email }, { address: address.toLowerCase() }],
        });

        if (ownerExists) {
            return NextResponse.json(
                { message: "Owner already exists" },
                { status: 400 }
            );
        }

        const newOwner = await Owner.create({
            name,
            email,
            address,
            status: "pending",
        });

        sendOwnerReqEmail(name, email);

        await session.commitTransaction();

        return NextResponse.json(
            { message: "Owner added", owner: newOwner },
            { status: 201 }
        );
    } catch (error) {
        console.log("Error", error)
        await session.abortTransaction();

        return NextResponse.json(
            { message: "Failed to create owner" },
            { status: 500 }
        );
    } finally {
        session.endSession();
    }
}
