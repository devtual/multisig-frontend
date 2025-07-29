'use client';
import Image from 'next/image';
import React from 'react';

interface Props {
  hasWallet: boolean;
  onClick: () => void;
}

export default function WalletOption({ hasWallet, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full cursor-pointer px-5 py-3 mb-4 border border-gray-600 bg-gray-700/50 rounded-lg transition hover:bg-gray-600/40"
    >
      <span className="font-medium">MetaMask</span>
      <div className="flex items-center space-x-2">
        {hasWallet && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Installed</span>
        )}
        <Image src="/metamask.svg" alt="MetaMask" width={20} height={20} />
      </div>
    </button>
  );
}
