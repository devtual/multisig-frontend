import { getOwners } from '@/backend/actions/owners';
import OwnersList from '@/components/OwnersList';
import { MultiSigService } from '@/services/multisig-service';
import ownerService from '@/services/owner-service';
import React from 'react'

export default async function OwnersPage() {
  const contract = await MultiSigService.getReadOnlyContract();
  const [onChainOwners, dbOwners] = await Promise.all([contract.getOwners(), getOwners()]);
  const owners = await ownerService.mergeOwners(onChainOwners, dbOwners);
  return <OwnersList initialOwners={owners} />;
}
