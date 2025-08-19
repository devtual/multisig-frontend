import authOptions from "@/backend/lib/auth.config";
import { dbConnect } from "@/backend/lib/db";
import Transaction from "@/backend/models/Transaction";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { domain, types } from "@/helpers/eip712-types";


export async function POST(req: Request) {
  try {
    const { txData, signature, address } = await req.json();
    const { txIndex, title, txHash, submittedBy } = txData;


    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (txIndex === undefined || !title || !txHash || !submittedBy) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const recoveredAddress = ethers.verifyTypedData(domain, types, txData, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ error: "Signature does not match address" }, {status: 401});
    }

    const currentTime = Date.now();
    if (Math.abs((currentTime - txData.timestamp)/1000) > 120) {
      return NextResponse.json({ error: "Timestamp is too old or in the future" }, {status: 400});
    }


    await dbConnect();

    const newTx = await Transaction.create({ txIndex, title, txHash, submittedBy });

    return NextResponse.json({ message: "Transaction saved", transaction: newTx }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {

      const session = await getServerSession(authOptions)
      if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }


    await dbConnect();

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

