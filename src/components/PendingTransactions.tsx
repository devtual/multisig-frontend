"use client";
import { useState, useCallback } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import { AlertTriangle, ArrowRight, FileText } from "lucide-react";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { useWallet } from "@/context/WalletContext";
import TransactionService from "@/services/transaction-service";
import { ITransaction, TransactionStatus } from "@/types";
import Loader from "./Loader";
import { sleep } from "@/helpers/common";
import { useTransactionActions } from "@/hooks/useTransactionActions";

const transactionService = TransactionService.getInstance();

type PendingTransactionProps = {
  initialTxs: ITransaction[], 
  threshold: number;
  onTransactionExecuted?: () => void;
}

export default function PendingTransactions({initialTxs, threshold, onTransactionExecuted}: PendingTransactionProps) {
  const [transactions, setTransactions] = useState<ITransaction[]>(initialTxs);
  const [loading, setLoading] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);
  const { saveStatus, getStatus } = useTransactionStatus();
  const { wallet, contract, currentAddress, isOwner } = useWallet();

  const { handleConfirm, handleExecute, handleCancel } = useTransactionActions({
    isPendingTx: true,
    saveStatus,
    getStatus,
    setTransactions,
    transactions,
    onTransactionExecuted
  });


  const fetchTransactions = useCallback(async () => {
  if (!wallet || !contract || !currentAddress) return;
  
  setLoading(true);
  await sleep(200)
  try {
    const txArray = await contract.getPendingTransactions(15);
    const txRecords = await transactionService.getAllRecords();
    
    const txns = await Promise.all(
      txArray.map(async (tx: ITransaction) => {

        const txRecord = txRecords.find(r => r.txIndex === Number(tx.txIndex));
        const title = txRecord?.title || "Untitled";

        const isConfirmed = await contract.isConfirmed(tx.txIndex, currentAddress);
        return {
          to: tx.to,
          value: ethers.formatEther(tx.value),
          title,
          data: tx.data,
          numConfirmations: Number(tx.numConfirmations),
          txIndex: Number(tx.txIndex),
          isConfirmed,
          status: tx.status
        };
      })
    )

    console.log("txns", txns)
    
    setTransactions(txns);
    
  } catch (error) {
    console.error("Error fetching transactions:", error);
  } finally {
    setLoading(false);
  }
}, [contract, currentAddress]);

  // useEffect(() => {
  //   fetchTransactions();
  // }, [fetchTransactions]);


  if (loading && transactions.length === 0) {
    return <Loader variant="fullscreen" />;
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            {/* <Clock className="h-5 w-5 text-yellow-500" /> */}
            Pending Transactions
            <span className="text-sm text-gray-400 ml-2">
              ({transactions.length})
            </span>
          </h2>
          <Link href="/transactions" className="text-primary-400 hover:text-primary-400/80 flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
      
      <div>
        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {transactions.map((tx) => {
                const txStatus = getStatus(tx.txIndex)?.status;

              return (
              <div key={tx.txIndex} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
                  <div>
                    <h3 className="font-medium text-white">
                      {tx.value} ETH to {tx.to.substring(0, 7)}...{tx.to.substring(37)}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Signatures: {tx.numConfirmations} / {threshold}
                    </p>
                  </div>
                </div>
                {isOwner && <div className="flex flex-col items-end gap-2">
                  {(tx.isConfirmed && tx.numConfirmations !== threshold) && <p className="text-yellow-500">Pending</p>}
                  {(!tx.isConfirmed && tx.status !== TransactionStatus.Cancelled) && (
                    <div className="flex gap-3">
                    <button
                      onClick={(event) => handleConfirm(event, tx.txIndex)}
                      disabled={txStatus?.includes('cancelling') || txStatus?.includes('confirming') || loading}
                      className="text-sm cursor-pointer px-2 py-1 rounded-md min-w-10  text-white bg-green-400 hover:bg-green-400/80"
                    >
                      {txStatus?.includes('confirming') ? "Confirming..." : "Confirm"}
                    </button>
                    <button
                      onClick={(event) => handleCancel(event, tx.txIndex)}
                      disabled={txStatus?.includes('confirming') || txStatus?.includes('cancelling') || loading}
                      className="text-sm cursor-pointer px-2 py-1 rounded-md min-w-10 bg-red-500 text-white hover:bg-red-500/80"
                    >
                      {txStatus?.includes('cancelling') ? "Cancelling..." : "Cancel"}
                    </button>
                    </div>
                  )}
                  {tx.numConfirmations >= threshold && (
                    <button
                      onClick={(event) => handleExecute(event, tx.txIndex)}
                            disabled={txStatus?.includes('executing') || loading}

                      className="text-sm cursor-pointer px-2 py-1 rounded-md min-w-10 bg-primary-500 hover:bg-primary-500/80"
                    >
                      {txStatus?.includes('executing') ? "Executing..." : "Execute"}
                    </button>
                )}
                </div>}
              </div>
            )})}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              {transactions.length === 0 ? 'No transactions found' : 'No pending transactions'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}