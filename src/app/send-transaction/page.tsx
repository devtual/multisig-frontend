import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TransactionSigners from "../../../components/TransactionSigners";
import TransactionTimeline from "../../../components/TransactionTimeline";
import SubmitTransactionForm from "../../../components/SubmitTransactionForm";

export default function SendTransaction() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Send Transaction</h1>
                    <p className="text-muted-foreground">
                        Create a new transaction requiring multiple signatures
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <SubmitTransactionForm />
                </div>

                <div className="space-y-6">
                    <TransactionSigners />
                    <TransactionTimeline />
                </div>
            </div>
        </div>
    );
};

