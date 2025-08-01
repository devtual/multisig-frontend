'use client';
import React, { useEffect, useState } from 'react';
import { Shield, X } from 'lucide-react';
import WalletOption from '@/components/login/WalletOption';
import WalletInstallModal from '@/components/login/WalletInstallModal';
import { logInWithEthereum } from '@/lib/siwe-client';
import { WalletProvider } from '@/lib/wallet-provider';
import { MultiSigService } from '@/services/multisig-service';

export default function Login() {
  const [showModal, setShowModal] = useState(false);
  const [hasWallet, setHasWallet] = useState<boolean>(false);

    useEffect(() => {
      if (typeof window !== 'undefined' && window.ethereum) {
        setHasWallet(true);
      }
    }, []);

    const handleWallet = async () => {
      if (!hasWallet) return setShowModal(true);

      const isConnected = await WalletProvider.isConnected();
      if (!isConnected) {
        await WalletProvider.connect();
      }

      await MultiSigService.initialize();
      await logInWithEthereum();
    };

  
    return (
      <div className="flex items-center justify-center px-4 pt-10 z-50">
        <div className="border border-gray-700 bg-gray-800 overflow-hidden rounded-2xl shadow-xl w-full max-w-sm px-6 py-10 relative">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-primary-500/20 rounded-full p-3">
              <Shield className="h-8 w-8 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold mb-6">Sign in</h2>
          </div>
  
          <WalletOption
            hasWallet={hasWallet}
            onClick={handleWallet}
          />
  
          <WalletInstallModal open={showModal} onClose={() => setShowModal(false)} />
        </div>
      </div>
    );
}

