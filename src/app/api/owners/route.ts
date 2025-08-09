import { NextRequest, NextResponse } from "next/server";
import Owner from "@/backend/models/Owner";
import { connectToDatabase } from "@/backend/lib/db";
import { addOwnerRequestEmail } from "@/backend/lib/email";

export async function POST(req: NextRequest) {
    try {
        const { name, email, address } = await req.json();

        if (!name || !email || !address) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectToDatabase();

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

        await addOwnerRequestEmail(name, email);

        return NextResponse.json(
            { message: "Owner added", owner: newOwner },
            { status: 201 }
        );
    } catch (error) {
        console.log("Error", error)
        return NextResponse.json(
            { message: "Failed to create owner" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectToDatabase();

        const owners = await Owner.find();

        return NextResponse.json({ owners }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to fetch owners" },
            { status: 500 }
        );
    }
}
