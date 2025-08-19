"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Lock, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import Input from "./Input";
import Label from "./Label";
import { useWallet } from "@/context/WalletContext";
import TransactionService from "@/services/transaction-service";
import { newTransSchema } from "@/schemas";
import { toast } from "react-toastify";
import { Notification, NotificationType } from "@/helpers/notification";
import { TransactionAmount } from "./TransactionAmount";
import { useDebouncedValue } from "@/hooks/useDebounceValue";

type Props = {
};

const transactionService = TransactionService.getInstance();

const SubmitTransactionForm: React.FC<Props> = () => {
  const { wallet, contract, isOwner } = useWallet();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    recipient: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [usdtValue, setUsdtValue] = useState("0.0000");

  const debouncedAmount = useDebouncedValue(formData.amount, 600);

  useEffect(() => {
    const ethValue = parseFloat(debouncedAmount);

    if (!ethValue || isNaN(ethValue)) {
      setUsdtValue("0.00");
      return;
    }

    const fetchPrice = async () => {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await res.json();
      const price = data.ethereum.usd;
      setUsdtValue((ethValue * price).toFixed(2));
    };

    fetchPrice();
  }, [debouncedAmount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet || !contract || !isOwner) return;

    setIsSubmitted(true)    
    setErrors({})

    const result = newTransSchema.safeParse(formData);

    if (!result.success) {
        const fieldErrors: { [key: string]: string } = {};

        result.error.issues.forEach((err: any) => {
            if (err.path.length > 0) fieldErrors[err.path[0]] = err.message;
        });

        setErrors(fieldErrors);
        setIsSubmitted(false)
        return;
    }

    if (Number(usdtValue) < 10) {
      Notification.show("Amount must be greater than 10 USDT", NotificationType.Error);
      return;
    }

  const hasSufficientBalance = await wallet.checkContractBalance(formData.amount);
  
  if (!hasSufficientBalance) {
    const stats = await contract.getTransactionStats();
    const contractBalanceEth = ethers.formatEther(stats[0]);
    
    Notification.show(
      <div>
        <h6>Insufficient Balance</h6>
        <p className="text-sm">
          Required: {formData.amount} ETH | Available: {contractBalanceEth} ETH
        </p>
      </div>,
      NotificationType.Error
    )

    return;
  }

    


    try {
      const { title, amount, recipient } = formData;

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

      const txIndex = Number(parsedEvent.args.txIndex);

      if (typeof txIndex !== "number" || isNaN(txIndex)) {
        throw new Error("Could not retrieve transaction index from event");
      }

      await transactionService.saveRecord(txHash, txIndex, title);

      setMessage({ type: "success", text: "Transaction submitted successfully!" });
      // setFormData({ title: "", amount: "", recipient: "" });
    } catch (err: any) {
      console.log("Message", err)
      // setMessage({ type: "error", text: err.message || "Transaction failed" });
    } finally {
      setLoading(false);
    }
  };

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
                name="title"
                placeholder="What is this transaction for?"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <p className="text-red-600 mt-1 text-sm">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount" title="Amount (ETH)" />
                <p className="text-gray-400">≈ {usdtValue} USDT</p>
              </div>
              <Input
                id="amount"
                type="number"
                step="0.000001"
                name="amount"
                placeholder="0.000000"
                value={formData.amount}
                onChange={handleChange}
              />
              {errors.amount && <p className="text-red-600 mt-1 text-sm">{errors.amount}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient" title="Recipient Address" />
            <Input
              id="recipient"
              placeholder="0x..."
              name="recipient"
              value={formData.recipient}
              onChange={handleChange}
            />
            {errors.recipient && <p className="text-red-600 mt-1 text-sm">{errors.recipient}</p>}
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
              disabled={isSubmitted}
            >
              <Send className="h-4 w-4" />
              {isSubmitted ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubmitTransactionForm;
