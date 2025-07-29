import { ITransactionRecord } from "@/types";

export default class TransactionService {
  private static instance:TransactionService;

  private constructor(){}

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  public async getAllRecords(): Promise<ITransactionRecord[]> {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const data = await res.json();
      return data.transactions || [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }

  public async saveRecord(tx: {
    txIndex: number;
    title: string;
    txHash: string;
    submittedBy?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      });

      if (!res.ok) throw new Error("Failed to post transaction");
      return true;
    } catch (error) {
      console.error("Error posting transaction:", error);
      return false;
    }
  }
}
