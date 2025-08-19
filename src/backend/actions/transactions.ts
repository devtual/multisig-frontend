"use server";
import { dbConnect } from "../lib/db";
import Transaction from "../models/Transaction";
import { ethers } from 'ethers';
import { ITransaction } from '@/types';
import { MultiSigService } from "@/services/multisig-service";
import { getServerSession } from "next-auth/next";
import authOptions from "../lib/auth.config";

export async function getTransactions(page = 1 ,pageSize = 10) {
  const contract = await MultiSigService.getReadOnlyContract();
  const session = await getServerSession(authOptions);
  const currentAddress = session?.address;

  await dbConnect();

  const [countRaw, txRecords, thresholdRaw] = await Promise.all([
    contract.transactionCount(),
    await Transaction.find({}, {_id: 0, title: 1, txIndex: 1}).lean().sort({ createdAt: -1 }),
    contract.threshold()
  ]);

  const count = Number(countRaw);
  const threshold = Number(thresholdRaw);
  
  const txBatch = await contract.getPaginatedTransactions(page, pageSize);

  const confirmationPromises = txBatch.map((tx: ITransaction) =>
    contract.isConfirmed(tx.txIndex, currentAddress)
  );

  const confirmations = await Promise.all(confirmationPromises);

  const transactions: ITransaction[] = txBatch.map((tx: any, i: number) => {
    const txRecord = txRecords.find(r => r.txIndex === Number(tx.txIndex));

    return {
      txIndex: Number(tx.txIndex),
      to: tx.to,
      value: ethers.formatEther(tx.value),
      data: tx.data,
      numConfirmations: Number(tx.numConfirmations),
      isConfirmed: confirmations[i],
      title: txRecord?.title || "Untitled",
      status: Number(tx.status),
      timestamp: Number(tx.timestamp),
    };
  });

  const txSafeRecords = txRecords.map(item => ({
      title: item.title,
      txIndex: item.txIndex
    }))

  return {
    transactions,
    totalCount: count,
    threshold,
    txRecords: txSafeRecords
  };
}

export async function getPendingTransactions() {
  const contract = await MultiSigService.getReadOnlyContract();
  const session = await getServerSession(authOptions);
  const currentAddress = session?.address;

  await dbConnect();

  const [txRecords, thresholdRaw] = await Promise.all([
    await Transaction.find({}, {_id: 0, title: 1, txIndex: 1}).lean().sort({ createdAt: -1 }),
    contract.threshold()
  ]);
  
  const threshold = Number(thresholdRaw);
  const txBatch = await contract.getPendingTransactions(15);

  const confirmationPromises = txBatch.map((tx: ITransaction) =>
    contract.isConfirmed(tx.txIndex, currentAddress)
  );

  const confirmations = await Promise.all(confirmationPromises);

  const transactions: ITransaction[] = txBatch.map((tx: any, i: number) => {
  const txRecord = txRecords.find(r => r.txIndex === Number(tx.txIndex));

    return {
      txIndex: Number(tx.txIndex),
      to: tx.to,
      value: ethers.formatEther(tx.value),
      data: tx.data,
      numConfirmations: Number(tx.numConfirmations),
      isConfirmed: confirmations[i],
      title: txRecord?.title || "Untitled",
      status: Number(tx.status),
      timestamp: Number(tx.timestamp),
    };
  });

  const txSafeRecords = txRecords.map(item => ({
      title: item.title,
      txIndex: item.txIndex
  }))
  
  return {
    transactions,
    threshold,
    txRecords: txSafeRecords
  };
}