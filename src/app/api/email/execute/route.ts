import { dbConnect } from '@/backend/lib/db';
import { sendExecutionEmail } from '@/backend/lib/email';
import Owner from '@/backend/models/Owner';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req:NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, {status: 405})
  }

  try {
    await dbConnect();
    
        const { owner, txDetail } = await req.json();
    
        const owners = await Owner.find({ status: "approved" }, { name: 1, email: 1, address: 1, _id: 0 });
        const confirmingOwner = owners.find(o => o.address === owner.toLowerCase());
        console.log("confirmingOwner", owner, confirmingOwner)

        if (!confirmingOwner) {
          return NextResponse.json(
            { message: "Confirming owner not found" },
            { status: 404 }
          );
        }
    
        const otherApprovedOwners = owners.filter(
          o => o.address !== owner
        );
    
        for (const owner of otherApprovedOwners) {
          await sendExecutionEmail(confirmingOwner, owner, txDetail);
        }
    
    return NextResponse.json({ success: true }, {status: 200})
  } catch (error:any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, {status: 500})
  }
}