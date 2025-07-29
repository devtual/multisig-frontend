"use client"
import { useEffect, useState } from "react";
import { CheckCircle, Clock, Send, Wallet } from "lucide-react";
import { useWallet } from "@/context/WalletContext";


export default function TransactionsStats({ refreshKey }: { refreshKey: number }) {
  const {wallet} = useWallet();
  const [stats, setStats] = useState({
    contractBalance: "0",
    totalValue: "0",
    pendingTxs: 0,
    executedTxs: 0,
    failedTxs: 0
  });


  useEffect(() => {
    const init = async () => {
        const {
          contractBalance,
          totalValue,
          totalTxs,
          pendingTxs,
          executedTxs,
          failedTxs
        } = await wallet!.getTransactionStats();

        const formattedStats = {
          contractBalance,
          totalValue,
          pendingTxs,
          executedTxs,
          failedTxs
        };

        setStats(formattedStats)
    };

    init();
  }, [refreshKey]);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-primary-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Contract Balance</p>
              <p className="text-2xl font-bold text-white">{stats.contractBalance} ETH</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center">
            <Send className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Balance</p>
              <p className="text-2xl font-bold text-white">{stats.totalValue} ETH</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.pendingTxs}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.executedTxs}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
