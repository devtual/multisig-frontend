import React, { Suspense } from 'react'
import TransactionsClient from './TransactionsClient'
import { Metadata } from 'next'
import Loader from '@/components/Loader';
import { getTransactions } from '@/backend/actions/transactions';

export const metadata: Metadata = {
  title: 'Transactions'
}

export default async function TransactoinsPage({searchParams}: {
  searchParams: Promise<{ page?: string }>
}) {
  const {page} = await searchParams;
  const {transactions, totalCount, threshold, txRecords } = await getTransactions(Number(page) || 1);
  

  return (
    <Suspense fallback={<Loader variant="fullscreen" />}>
      <TransactionsClient initialTxs={transactions} totalCount={totalCount} threshold={threshold} 
        txRecords={txRecords}
      />
    </Suspense>
  )
}
