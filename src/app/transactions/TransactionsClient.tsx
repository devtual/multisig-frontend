"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { TransactionsFilter } from '@/components/TransactionsFilter';
import { TransactionCard } from '@/components/TransactionCard';
import { ethers } from 'ethers';
import { ITransaction, TransactionStatus } from '@/types';
import TransactionsStats from '@/components/TransactionsStats';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { useWallet } from '@/context/WalletContext';
import Loader from '@/components/Loader';
import { sleep } from '@/helpers/common';
import EmailService from '@/services/email-service';
import NewTransactionButton from '@/components/NewTransactionButton';
import TransactionModal from '@/components/modals/TransactionModal';
import { useTransactionActions } from '@/hooks/useTransactionActions';

const tnxStatus = ["pending", "processing", "completed", "failed"];

type TransactionProps = {
  initialTxs: ITransaction[], 
  totalCount: number;
  threshold: number;
  txRecords: {title: string, txIndex: number}[]
}


export default function TransactionsClient({initialTxs, totalCount, threshold, txRecords}: TransactionProps) {
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState<ITransaction[]>(initialTxs);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const {saveStatus, getStatus} = useTransactionStatus();
  const [refreshCount, setRefreshCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const hasFetchedRef = useRef(true);

  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const { wallet, contract, provider, currentAddress, isOwner } = useWallet();
  const onTransactionExecuted = () => {
    setRefreshCount((prev) => prev + 1);
  }
  const { handleConfirm, handleExecute, handleCancel } = useTransactionActions({
      saveStatus,
      getStatus,
      setTransactions,
      transactions,
      onTransactionExecuted
    });

  useEffect(() => {
    const fetchData = async () => {
      if (!contract || !wallet || !currentAddress) return;

      setLoading(true);
      await sleep(200)
      const offset = (currentPage - 1) * pageSize;

      try {
        const limit = Math.min(pageSize, totalCount - offset);
        if (offset >= totalCount) {
          setHasMore(false);
          return;
        }

        const txBatch = await contract.getPaginatedTransactions(currentPage, pageSize);
        const confirmationPromises = txBatch.map((tx: ITransaction) =>
          contract.isConfirmed(tx.txIndex, currentAddress)
        );
        const confirmations = await Promise.all(confirmationPromises);

        const txArray: ITransaction[] = txBatch.map((tx: any, i:number) => {
        const txRecord = txRecords.find(r => r.txIndex === Number(tx.txIndex));

          const title = txRecord?.title || "Untitled";
          return {
            txIndex: Number(tx.txIndex),
            to: tx.to,
            value: ethers.formatEther(tx.value),
            data: tx.data,
            numConfirmations: Number(tx.numConfirmations),
            isConfirmed: confirmations[i],
            title,
            status: Number(tx.status),
            timestamp: Number(tx.timestamp),
          };
        });

        setTransactions(txArray);
        setHasMore(offset + limit < totalCount);
      } catch (err) {
        console.error("Pagination error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!hasFetchedRef.current) {
      fetchData();
      hasFetchedRef.current = true;
    }
  }, [currentPage]);

  const handleNext = () => {
    if (hasMore) {
      hasFetchedRef.current = false;
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    hasFetchedRef.current = false;
    setHasMore(true)
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleClick = (tx: ITransaction) => {
    setSelectedTransaction(tx)
  }

  // const handleConfirm = useCallback(async (event: React.MouseEvent<HTMLButtonElement>, txIndex: number) => {
  //   event.stopPropagation();

  //   if(!isOwner) return;

  //   const currentStatus = getStatus(txIndex)?.status || '';
  //   if (currentStatus.includes('confirming')) return;

  //   try {
  //     saveStatus(txIndex, 'confirming');

  //     const txResponse = await contract!.confirmTransaction(txIndex);
  //     saveStatus(txIndex, 'confirming-mined');

  //     const receipt = await txResponse.wait();

  //     if (receipt.status === 1) {
  //       saveStatus(txIndex, 'confirmed');
  //       setTransactions(prevTxs =>
  //         prevTxs.map(tx =>
  //           tx.txIndex === txIndex
  //             ? {
  //               ...tx,
  //               numConfirmations: tx.numConfirmations + 1,
  //               isConfirmed: true
  //             }
  //             : tx
  //         )
  //       );

  //       return;
  //     }
  //     throw new Error('Transaction failed on-chain');
  //   } catch (error) {
  //     saveStatus(txIndex, 'confirm-failed');
  //     throw error;
  //   }
  // }, [saveStatus, getStatus]);

  // const handleExecute = useCallback(async (txIndex: number) => {
  //   if(!isOwner) return;
    
  //   const currentStatus = getStatus(txIndex)?.status || '';
  //   if (currentStatus.includes('executing')) return;

  //   try {
  //     saveStatus(txIndex, 'executing');

  //     const tx = await contract!.executeTransaction(txIndex, {
  //       gasLimit: 300000,
  //     });
  //     saveStatus(txIndex, 'executing-mined');

  //     const receipt = await tx.wait();

  //     if (receipt.status === 1 && provider) {
  //       const block: any = await provider.getBlock(receipt.blockNumber);
  //       const timestamp = block.timestamp;

  //       saveStatus(txIndex, 'executed');

  //       setTransactions(prevTxs =>
  //         prevTxs.map(tx =>
  //           tx.txIndex === txIndex
  //             ? {
  //               ...tx,
  //               timestamp,
  //               status: TransactionStatus.Completed
  //             }
  //             : tx
  //         )
  //       )

  //       const tx = transactions.find(tx => tx.txIndex === txIndex);
  //       if(tx)
  //       EmailService.execute("john", {txIndex, value: tx.value, title: tx.title})
  //       setRefreshCount((prev) => prev + 1);
  //       return;
  //     }
  //     throw new Error('Execution failed on-chain');
  //   } catch (error) {
  //     saveStatus(txIndex, 'execute-failed');
  //     throw error;
  //   }
  // }, [contract, saveStatus, getStatus]);

  // const handleCancel = useCallback(async (txIndex: number) => {
  //   if(!isOwner) return;

  //   const currentStatus = getStatus(txIndex)?.status || '';
  //   if (currentStatus.includes('cancelling')) return;

  //   try {
  //     saveStatus(txIndex, 'cancelling');

  //     const txResponse = await contract!.cancelTransaction(txIndex);
  //     saveStatus(txIndex, 'cancelling-mined');

  //     const receipt = await txResponse.wait();
      
  //     if (receipt.status === 1) {
  //       saveStatus(txIndex, 'cancelled');
  //       setTransactions(prevTxs => 
  //       prevTxs.map(tx => 
  //         tx.txIndex === txIndex
  //           ? { 
  //               ...tx, 
  //               cancelled: true 
  //             }
  //           : tx
  //       )
  //     );
  //       // onTransactionConfirmed?.(txIndex);
  //     }
  //     throw new Error('Transaction failed on-chain');
  //   } catch (error) {
  //     saveStatus(txIndex, 'confirm-failed');
  //     throw error;
  //   }
  // }, [saveStatus, getStatus]);

  const filteredTnx = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tnxStatus[tx.status] === filter;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400 mt-2">View and manage all wallet transactions</p>
        </div>
        {isOwner && <NewTransactionButton />}
        {/* <TransactionsFilter filter={filter} setFilter={setFilter} /> */}
      </div>
      <TransactionsStats refreshKey={refreshCount} />
      
      <div className="bg-gray-800 rounded-lg border border-gray-700 relative">
        {loading && <Loader variant="content" />}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Transaction History</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {filteredTnx.map((tx) => (
            <TransactionCard
              key={tx.txIndex}
              transaction={tx}
              threshold={threshold}
              onClick={handleClick}
              onConfirm={handleConfirm}
              onExecute={handleExecute}
              onCancel={handleCancel}
              status={getStatus(tx.txIndex)?.status}
              isOwner={isOwner}
            />
          ))}
        </div>
        <TransactionModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        {totalPages > 1 ? (
          <div className="flex justify-between items-center mt-6 p-6">
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-8 items-center">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 text-sm ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              <button
                onClick={handleNext}
                disabled={totalPages === currentPage}
                className={`flex items-center gap-1 text-sm ${totalPages === currentPage ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

      </div>

      {filteredTnx.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No transactions match your current filter</p>
        </div>
      )}
    </div>
  );
}