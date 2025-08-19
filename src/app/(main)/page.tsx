import { getPendingTransactions } from "@/backend/actions/transactions";
import DashboardClient from "@/components/DashboardClient";
import Loader from "@/components/Loader";
import { Suspense } from "react";

export default async function DashboardPage() {
  const {transactions, threshold } = await getPendingTransactions();

  return <Suspense fallback={<Loader variant="fullscreen" />}>
    <DashboardClient initialTxs={transactions} threshold={threshold} />
  </Suspense>
}
