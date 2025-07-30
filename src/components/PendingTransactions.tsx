"use client";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { useWallet } from "@/context/WalletContext";
import TransactionService from "@/services/transaction-service";

interface Transaction {
  to: string;
  value: string;
  data: string;
  executed: boolean;
  numConfirmations: number;
  isConfirmed: boolean;
  txIndex: number;
  status: number
}

const transactionService = TransactionService.getInstance();

export default function PendingTransactions({
  onTransactionConfirmed,
  onTransactionExecuted
}: {
  onTransactionConfirmed?: (txIndex: number) => void;
  onTransactionExecuted ?: (txIndex: number) => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0);
  const { saveStatus, getStatus } = useTransactionStatus();
  const { wallet, contract, currentAddress, isOwner } = useWallet(); 

  const handleConfirm = useCallback(async (txIndex: number) => {
    if(!isOwner) return;

    const currentStatus = getStatus(txIndex)?.status || '';
    if (currentStatus.includes('confirming')) return;

    try {
      saveStatus(txIndex, 'confirming');

      const txResponse = await contract!.confirmTransaction(txIndex);
      saveStatus(txIndex, 'confirming-mined');

      const receipt = await txResponse.wait();
      
      if (receipt.status === 1) {
        saveStatus(txIndex, 'confirmed');
        setTransactions(prevTxs => 
        prevTxs.map(tx => 
          tx.txIndex === txIndex
            ? { 
                ...tx, 
                numConfirmations: tx.numConfirmations + 1,
                isConfirmed: true 
              }
            : tx
        )
      );
        onTransactionConfirmed?.(txIndex);

        return;
      }
      throw new Error('Transaction failed on-chain');
    } catch (error) {
      saveStatus(txIndex, 'confirm-failed');
      throw error;
    }
  }, [saveStatus, getStatus, onTransactionConfirmed]);

  const handleExecute = useCallback(async (txIndex: number) => {
    if(!isOwner) return;
    
    const currentStatus = getStatus(txIndex)?.status || '';
    if (currentStatus.includes('executing')) return;

    try {
      saveStatus(txIndex, 'executing');

      const tx = await contract!.executeTransaction(txIndex, {
        gasLimit: 300000,
      });
      saveStatus(txIndex, 'executing-mined');

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        saveStatus(txIndex, 'executed');
        const txs = [...transactions];
      const updatedTxs = txs.filter(tx => tx.txIndex !== txIndex);
      setTransactions(updatedTxs);
        onTransactionExecuted?.(txIndex);

        return;
      }
      throw new Error('Execution failed on-chain');
    } catch (error) {
      saveStatus(txIndex, 'execute-failed');
      throw error;
    }
  }, [contract, saveStatus, getStatus, onTransactionExecuted]);

  const fetchTransactions = useCallback(async () => {
  if (!wallet || !contract || !currentAddress) return;
  
  setLoading(true);
  try {
    const txArray = await contract.getPendingTransactions(15);
    const txRecords = await transactionService.getAllRecords();
    
    const processedTransactions = await Promise.all(
      txArray.map(async (tx: Transaction) => {
        const txRecord = txRecords.find(r => r.txIndex === Number(tx.txIndex));
        const title = txRecord?.title || "Untitled";

        const isConfirmed = await contract.isConfirmed(tx.txIndex, currentAddress);
        return {
          to: tx.to,
          value: ethers.formatEther(tx.value),
          title,
          data: tx.data,
          executed: tx.executed,
          numConfirmations: Number(tx.numConfirmations),
          txIndex: Number(tx.txIndex),
          isConfirmed,
        };
      })
    );
    
    setTransactions(processedTransactions);
    
    const _threshold = await contract.threshold();
    setThreshold(Number(_threshold));
    
  } catch (error) {
    console.error("Error fetching transactions:", error);
  } finally {
    setLoading(false);
  }
}, [contract, currentAddress]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);


  if (loading && transactions.length === 0) {
    return <div className="p-6 text-gray-400">Loading transactions...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6 border-b border-gray-700">
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
              <div key={tx.txIndex} className="flex items-center justify-between p-6">
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
          
              
                  {!tx.isConfirmed && (
                    <button
                      onClick={() => handleConfirm(tx.txIndex)}
                      disabled={txStatus?.includes('confirming') || loading}
                      className="text-sm cursor-pointer text-primary-400 hover:text-primary-400/80 py-1"
                    >
                            {txStatus?.includes('confirming') ? "Confirming..." : "Sign Transaction"}


                    </button>
                  )}
                  {tx.numConfirmations >= threshold && (
                    <button
                      onClick={() => handleExecute(tx.txIndex)}
                            disabled={txStatus?.includes('executing') || loading}

                      className="text-sm cursor-pointer text-green-400 hover:text-green-300 py-1"
                    >
                            {txStatus?.includes('executing') ? "Executing..." : "Execute"}

                    </button>
                  )}
                </div>}
              </div>
            )})}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            {transactions.length === 0 ? 'No transactions found' : 'No pending transactions'}
          </p>
        )}
      </div>
    </div>
  );
}