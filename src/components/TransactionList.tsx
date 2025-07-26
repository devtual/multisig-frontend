"use client";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { MultiSigWallet } from "@/helpers/MultiSigWallet";

interface Transaction {
  to: string;
  value: string;
  data: string;
  executed: boolean;
  numConfirmations: number;
  isConfirmed: boolean;
}

const wallet = MultiSigWallet.getInstance();


export default function TransactionList({}: {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);
  const [numConfirmationsRequired, setNumConfirmationsRequired] = useState();
  const [currentPage, setCurrentPage] = useState(1);
    const [contract, setContract] = useState<ethers.Contract | null>(null);

  const transactionsPerPage = 10;

  // Memoized fetch function
  const fetchTransactions = useCallback(async () => {
    const contract =  await wallet.getContract();
      const currentAccount =  await wallet.getCurrentAccount();

    
    if (!contract || !currentAccount) return;
    
    setLoading(true);

    setContract(contract);
    try {
      const count = Number(await contract.getTransactionCount());
      const batchSize = 50;
      const txArray: Transaction[] = [];
      
      for (let i = 0; i < count; i += batchSize) {
        const batchEnd = Math.min(i + batchSize, count);
        const batchPromises = [];
        
        for (let j = i; j < batchEnd; j++) {
          batchPromises.push(
            Promise.all([
              contract.getTransaction(j),
              contract.isConfirmed(j, currentAccount)
            ])
          );
        }
        
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(([tx, isConfirmed], index) => {
          txArray.push({
            to: tx.to,
            value: ethers.formatEther(tx.value),
            data: tx.data,
            executed: tx.executed,
            numConfirmations: Number(tx.numConfirmations),
            isConfirmed,
          });
        });
      }
      
      setTransactions(txArray);
      const numConfirmationReq = await contract.numConfirmationsRequired();
      setNumConfirmationsRequired(numConfirmationReq);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refresh]);

  // Pagination logic
  const indexOfLastTx = currentPage * transactionsPerPage;
  const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTx, indexOfLastTx);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const handleConfirm = async (txIndex: number) => {
    try {
      setLoading(true);
      if(contract){
        const tx = await contract.confirmTransaction(txIndex);
        await tx.wait();
        setRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error confirming transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (txIndex: number) => {
    try {
      setLoading(true);
      if(contract){
      const tx = await contract.executeTransaction(txIndex, {
        gasLimit: 300000, // Increased gas limit
      });
      await tx.wait();
      setRefresh((prev) => prev + 1);
    }
    } catch (error) {
      console.error("Error executing transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && transactions.length === 0) {
    return <div>Loading transactions...</div>;
  }
  
  return (

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Pending Transactions</h2>
            <Link href="/transactions" className="text-blue-400 hover:text-blue-300 flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
                  <div>
                    <h3 className="font-medium text-white">{tx.value} to {tx.to.substring(0, 7)}...{tx.to.substring(37)}</h3>
                    <p className="text-sm text-gray-400">Signatures: {tx.numConfirmations} / {numConfirmationsRequired}</p>
                  </div>
                </div>
                <div className="text-right">
                  {/* <p className="font-medium text-yellow-400"></p> */}
                  {tx.executed ? (
                    <p className="text-green-500">Executed</p>
                  ) : (
                    <p className="text-yellow-500">Pending</p>
                  )}

                  {!tx.executed && (
                    <>
                      {!tx.isConfirmed && (
                        <button
                          onClick={() => handleConfirm(index)}
                          disabled={loading}
                          className="text-sm text-blue-500 hover:text-blue-700"
                        >
                          Sign Transaction
                        </button>
                      )}
                      {tx.numConfirmations >=
                        Number(numConfirmationsRequired) && (
                        <button
                          onClick={() => handleExecute(index)}
                          disabled={loading}
                          className="text-green-500 hover:text-green-700"
                        >
                          Execute
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 text-sm disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 text-sm disabled:opacity-50"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
        </div>
      </div>
  );
}