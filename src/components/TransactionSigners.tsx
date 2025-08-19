import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./Card"
import { ArrowRight, Users } from 'lucide-react'
import { MultiSigService } from '@/services/multisig-service';
import { IOwner } from '@/types';
import { getOwners } from '@/backend/actions/owners';
import ownerService from '@/services/owner-service';
import { formatAddress } from '@/helpers/common';
import Link from 'next/link';

export default async function TransactionSigners() {
  const contract = await MultiSigService.getReadOnlyContract();
  const [onChainOwners, dbOwners] = await Promise.all([contract.getOwners(), getOwners()]);
  const owners = await ownerService.getOnChainOwners(onChainOwners, dbOwners, 3);

  return (
    <Card>
      <CardHeader className='flex-row justify-between'>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Signers
        </CardTitle>
        <Link href="/owners" className="text-primary-400 hover:text-primary-400/80 flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {owners.map((owner:IOwner, idx:number) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{owner.name}</p>
                <p className="text-sm text-gray-400">{formatAddress(owner.address)}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
