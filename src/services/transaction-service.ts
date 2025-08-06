import { API_ENDPOINT } from "@/config";
import { sleep } from "@/helpers/common";
import { WalletProvider } from "@/lib/wallet-provider";
import { ITransactionRecord } from "@/types";
import { MultiSigService } from "./multisig-service";
import { domain, types } from "@/helpers/eip712-types";

export default class TransactionService {
  private static instance: TransactionService;

  private constructor() { }

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  public async getAllRecords(): Promise<ITransactionRecord[]> {
    try {
      const res = await fetch(API_ENDPOINT + "api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const data = await res.json();
      return data.transactions || [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }

  public async saveRecord(txHash: string, txIndex: number, title: string, attemptsLeft = 5): Promise<boolean> {
    try {
      const payload = await this.signTransactionPayload(txHash, txIndex, title);

      const res = await fetch(API_ENDPOINT + "api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.warn(`❗️ Failed to save record (attempts left: ${attemptsLeft - 1})`);
        if (attemptsLeft > 1) {
          await sleep(1000);
          return this.saveRecord(txHash, txIndex, title, attemptsLeft - 1);
        }
      }

      return true;

    } catch (error: any) {
      if (error.message === "SIGN_REJECTED") {
        console.warn("User rejected signing — saving fallback locally");
        this.saveToLocalFallback(txHash, txIndex, title);
      } else {
        console.error("Error saving transaction:", error);
      }
      return false;
    }
  }


  public async signTransactionPayload(txHash: string, txIndex: number, title: string) {
    if (!WalletProvider.isAvailable()) return;

    try {
      const wallet = MultiSigService.getInstance();
      const signer = await wallet.getSigner();
      const address = await wallet.getCurrentAccount();

      const txData = {
        txHash,
        txIndex,
        title,
        nonce: Math.floor(Math.random() * 1_000_000),
        submittedBy: address,
        timestamp: Date.now()
      };

      const signature = await signer.signTypedData(domain, types, txData);

      return { txData, signature, address };

    } catch (error: any) {
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        throw new Error("SIGN_REJECTED");
      } else {
        console.error("Unexpected signing error:", error);
        throw error;
      }
    }
  }

  private saveToLocalFallback(txHash: string, txIndex: number, title: string) {
    const fallbackKey = "unsaved-tnx";

    const data = {
      txHash,
      txIndex,
      title,
      timestamp: Date.now()
    };

    const existing = localStorage.getItem(fallbackKey);
    const txArray = existing ? JSON.parse(existing) : [];
    const fIndex = txArray.findIndex((tx:any) => tx.txIndex === txIndex);

    if (fIndex !== -1) {
      txArray[fIndex] = data;
    } else {
      txArray.push(data);
    }

    localStorage.setItem(fallbackKey, JSON.stringify(txArray));
  }
}
