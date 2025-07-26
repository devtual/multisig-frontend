"use client"
import { MetaMaskInpageProvider } from "@metamask/providers";
import Link from "next/link";
import { Plus } from "lucide-react";
import PendingTransactions from "../../components/PendingTransactions";
import TransactionsStats from "../../components/TransactionsStats";
import { useState } from "react";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export default function WalletDashboard() {
  const [refreshCount, setRefreshCount] = useState(0);

  const onTransactionExecuted = async (pending: number) => {
    setRefreshCount((prev) => prev + 1);
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage your multi-signature wallets and transactions</p>
        </div>
        <Link
          href="/send-transaction"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Send Transaction
        </Link>
      </div>
      <TransactionsStats refreshKey={refreshCount} />
      <PendingTransactions onTransactionExecuted={onTransactionExecuted} />
    </div>
  );
}
