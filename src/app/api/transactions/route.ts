import { connectToDatabase } from "@/backend/lib/db";
import Transaction from "@/backend/models/Transaction";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { txIndex, title, txHash, submittedBy } = await req.json();

    if (txIndex === undefined || !title || !txHash || !submittedBy) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    await connectToDatabase();

    const newTx = await Transaction.create({ txIndex, title, txHash, submittedBy });

    return NextResponse.json({ message: "Transaction saved", transaction: newTx }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const transactions = await Transaction.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Transactions fetched successfully",
        transactions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

