"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { TransactionsFilter } from '../../../components/TransactionsFilter';
import { TransactionCard } from '../../../components/TransactionCard';
import { ethers } from 'ethers';
import { ITransaction, TransactionStatus } from '../../../types';
import TransactionsStats from '../../../components/TransactionsStats';
import { useTransactionStatus } from '../../../hooks/useTransactionStatus';
import { useWallet } from '../../../context/WalletContext';

// type Transaction = {
//   id: string;
//   type: string;
//   to: string;
//   from: string;
//   amount: string;
//   status: string;
//   signatures?: {
//     current: number;
//     required: number;
//   };
//   timestamp: string;
//   hash: string;
//   description: string;
// };

const transactionStatus = ["pending", "processing", "completed", "failed"]

export default function Transactions() {
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(0);
  const { saveStatus, getStatus } = useTransactionStatus();
  const [refreshCount, setRefreshCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const { contract, provider, currentAddress} = useWallet();

  const transactionsPerPage = 5;

  const fetchTransactions = useCallback(async () => {
    if (!contract || !currentAddress) return;

    try {
      const count = Number(await contract.getTransactionCount());
      const batchSize = 50;
      const txArray: ITransaction[] = [];
      
      for (let i = 0; i < count; i += batchSize) {
        const batchEnd = Math.min(i + batchSize, count);
        const batchPromises = [];
        
        for (let j = i; j < batchEnd; j++) {
          batchPromises.push(
            Promise.all([
              contract.getTransaction(j),
              contract.isConfirmed(j, currentAddress)
            ])
          );
        }
        
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(([tx, isConfirmed], index) => {
          txArray.push({
            to: tx.to,
            title: "Payment to vendor for services",
            value: ethers.formatEther(tx.value),
            data: tx.data,
            executed: tx.executed,
            numConfirmations: Number(tx.numConfirmations),
            txIndex: Number(tx.txIndex),
            isConfirmed,
            status: tx.status,
            timestamp: tx.timestamp
          })
        })
      }

      setTransactions(txArray);

      const _threshold = await contract.threshold();
      setThreshold(Number(_threshold));

    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

   const tnxStatus = ["pending", "processing", "completed", "failed"]
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tnxStatus[tx.status] === filter;
  });

  // Pagination logic
  const indexOfLastTx = currentPage * transactionsPerPage;
  const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTx, indexOfLastTx);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const handleConfirm = useCallback(async (txIndex: number) => {
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

        return;
      }
      throw new Error('Transaction failed on-chain');
    } catch (error) {
      saveStatus(txIndex, 'confirm-failed');
      throw error;
    }
  }, [saveStatus, getStatus]);

  const handleExecute = useCallback(async (txIndex: number) => {
    const currentStatus = getStatus(txIndex)?.status || '';
    if (currentStatus.includes('executing')) return;

    try {
      saveStatus(txIndex, 'executing');

      const tx = await contract!.executeTransaction(txIndex, {
        gasLimit: 300000,
      });
      saveStatus(txIndex, 'executing-mined');

      const receipt = await tx.wait();

      if (receipt.status === 1 && provider) {
        const block: any = await provider.getBlock(receipt.blockNumber);
        const timestamp = block.timestamp;

        saveStatus(txIndex, 'executed');

        setTransactions(prevTxs =>
          prevTxs.map(tx =>
            tx.txIndex === txIndex
              ? {
                ...tx,
                timestamp,
                executed: true,
                status: TransactionStatus.Completed
              }
              : tx
          )
        )
        setRefreshCount((prev) => prev + 1);
        return;
      }
      throw new Error('Execution failed on-chain');
    } catch (error) {
      saveStatus(txIndex, 'execute-failed');
      throw error;
    }
  }, [contract, saveStatus, getStatus]);


 

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400 mt-2">View and manage all wallet transactions</p>
        </div>

        <TransactionsFilter filter={filter} setFilter={setFilter} />
      </div>

      {/* Stats
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard 
          icon={<Clock className="h-8 w-8 text-yellow-500" />} 
          label="Pending" 
          value="2" 
        />
        <StatsCard 
          icon={<CheckCircle className="h-8 w-8 text-green-500" />} 
          label="Completed" 
          value="18" 
        />
        <StatsCard 
          icon={<XCircle className="h-8 w-8 text-red-500" />} 
          label="Failed" 
          value="3" 
        />
        <StatsCard 
          icon={<Send className="h-8 w-8 text-blue-500" />} 
          label="Total Volume" 
          value="1,247 ETH" 
        />
      </div> */}

      <TransactionsStats refreshKey={refreshCount} />

      {/* Transactions List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Transaction History</h2>
        </div>

        <div className="divide-y divide-gray-700">
          {currentTransactions.map((tx) => (
            <TransactionCard
              key={tx.txIndex}
              transaction={tx}
              threshold={threshold}
              onConfirm={handleConfirm}
              onExecute={handleExecute}
              status={getStatus(tx.txIndex)?.status}
            />
          ))}
        </div>
        {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 p-6">
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className='flex gap-8 items-center'>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 text-sm ${
                      currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 text-sm ${
                      currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No transactions found</h3>
          <p className="text-gray-400">No transactions match your current filter</p>
        </div>
      )}
    </div>
  );
}