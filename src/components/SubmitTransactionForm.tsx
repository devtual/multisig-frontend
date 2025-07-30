"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { Lock, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import Input from "./Input";
import Label from "./Label";
import { useWallet } from "@/context/WalletContext";
import { sleep } from "@/helpers/common";
import TransactionService from "@/services/transaction-service";

type Props = {
};

const transactionService = TransactionService.getInstance();

const SubmitTransactionForm: React.FC<Props> = () => {
  const { wallet, contract, currentAddress, isOwner } = useWallet();
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    recipient: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet || !contract || !isOwner) return;

    setLoading(true);
    setMessage(null);

    try {
      const { title, amount, recipient } = formData;

      if (!ethers.isAddress(recipient)) {
        throw new Error("Invalid recipient address");
      }

      const valueInWei = ethers.parseEther(amount);
      const tx = await contract.submitTransaction(recipient, valueInWei, "0x");
      const txHash = tx.hash;
      const receipt = await tx.wait();


      const event = receipt.logs?.find((log: ethers.Log) => {
        try {
          return contract.interface.parseLog(log)?.name === "SubmitTransaction";
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error("Could not find SubmitTransaction event in receipt");
      }

      const parsedEvent: any = contract.interface.parseLog(event);
      console.log(typeof parsedEvent.args.txIndex);

      const txIndex = Number(parsedEvent.args.txIndex);

      if (typeof txIndex !== "number" || isNaN(txIndex)) {
        throw new Error("Could not retrieve transaction index from event");
      }

      await saveRecord(txIndex, title, txHash);

      setMessage({ type: "success", text: "Transaction submitted successfully!" });
      // setFormData({ title: "", amount: "", recipient: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Transaction failed" });
    } finally {
      setLoading(false);
    }
  };

  const saveRecord = async (txIndex: number, title: string, txHash: string, attemptsLeft = 5) => {
    const saved = await transactionService.saveRecord({ txIndex, title, txHash, submittedBy: currentAddress })
    if (!saved) {
      console.warn(`❗️ Failed to save record (attempts left: ${attemptsLeft - 1})`);

      if (attemptsLeft > 1) {
        await sleep(1000);
        return saveRecord(txIndex, title, txHash, attemptsLeft - 1);
      } else {
        // const fallbackKey = "failed-transactions";

        // const data = {
        //   txIndex,
        //   title,
        //   txHash,
        //   submittedBy: currentAddress,
        //   timestamp: new Date().toISOString(),
        // };

        // const existing = localStorage.getItem(fallbackKey);
        // const txArray = existing ? JSON.parse(existing) : [];

        // txArray.push(data);
        // localStorage.setItem(fallbackKey, JSON.stringify(txArray));
      }
    }
  }

  if(!isOwner){
    return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Restricted Access
        </CardTitle>
        <CardDescription>
          This section is only accessible to contract owners. 
        </CardDescription>
      </CardHeader>
    </Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Transaction Details
        </CardTitle>
        <CardDescription>
          Fill in the transaction information and submit for signatures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title" title="Title" />
              <Input
                id="title"
                placeholder="What is this transaction for?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" title="Amount (ETH)" />
              <Input
                id="amount"
                type="number"
                step="0.000001"
                placeholder="0.000000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient" title="Recipient Address" />
            <Input
              id="recipient"
              placeholder="0x..."
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
            />
          </div>

          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {message.text}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
              disabled={loading}
            >
              <Send className="h-4 w-4" />
              {loading ? "Submitting..." : "Submit for Signatures"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubmitTransactionForm;
