"use client"
import { MetaMaskInpageProvider } from "@metamask/providers";
import PendingTransactions from "@/components/PendingTransactions";
import TransactionsStats from "@/components/TransactionsStats";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import NewTransactionButton from "@/components/NewTransactionButton";
import { ITransaction } from "@/types";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

type DashboardClientProps = {
  initialTxs: ITransaction[], 
  threshold: number
}

export default function DashboardClient({initialTxs, threshold}: DashboardClientProps) {
  const [refreshCount, setRefreshCount] = useState(0);
  const {isOwner} = useWallet()

  const onTransactionExecuted = async () => {
    setRefreshCount((prev) => prev + 1);
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        {isOwner && <NewTransactionButton />}
      </div>
      <TransactionsStats refreshKey={refreshCount} />
      <PendingTransactions initialTxs={initialTxs} threshold={threshold} onTransactionExecuted={onTransactionExecuted} />
    </div>
  );
}
