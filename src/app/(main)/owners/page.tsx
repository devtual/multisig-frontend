import { getOwners, mergeOwners } from '@/backend/actions/owners';
import Loader from '@/components/Loader';
import OwnersList from '@/components/OwnersList';
import { MultiSigService } from '@/services/multisig-service';
import React, { Suspense } from 'react'

export default async function OwnersPage() {
  const contract = await MultiSigService.getReadOnlyContract();
  const [onChainOwners, dbOwners] = await Promise.all([contract.getOwners(), getOwners()]);

  const owners = await mergeOwners(onChainOwners, dbOwners);
  
  return <Suspense fallback={<Loader variant='fullscreen' />}>
    <OwnersList initialOwners={owners} />
  </Suspense>
}
