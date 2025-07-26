'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./Card"
import { Users } from 'lucide-react'
import { MultiSigWallet } from '@/helpers/MultiSigWallet'

export default function TransactionSigners() {
  const [owners, setOwners] = useState<{ address: string; name: string }[]>([]);

  useEffect(() => {
    const fetchOwners = async () => {
      const wallet = MultiSigWallet.getInstance();
      const ownersList = await wallet.getOwnerNames();
      setOwners(ownersList);
    };

    fetchOwners();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Signers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {owners.map((owner, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-dark-300 rounded-lg">
              <div>
                <p className="font-medium">{owner.name}</p>
                <p className="text-sm text-muted-foreground">Signer</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
