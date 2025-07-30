"use client"
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Input from "./Input";
import Label from "./Label";
import { useWallet } from "@/context/WalletContext";
import { WalletProvider } from "@/lib/wallet-provider";

export default function ContractFunding() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [balance, setBalance] = useState("");
  const {wallet, contract, isDeployer} = useWallet();
  
  useEffect(() => {
    const init = async () => {
      if (WalletProvider.isAvailable() && wallet) {
        const balance = await wallet.getAccountBalance();
        setBalance(balance)
      }
    }

    init();
  },[])

  const fundContract = async () => {
    if(!isDeployer) return;
    
    if (!amount || isNaN(Number(amount))) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed!");
      }

      const amountWei = ethers.parseEther(amount);

      if(contract){

        const tx = await contract.fund({
          value: amountWei
        });
        
        await tx.wait();
      } 
      setSuccess(`Successfully deposited ${amount} ETH`);
      setAmount("");
    } catch (err) {
      console.error("Funding error:", err);
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4">Fund Contract</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          
        </label>
        <Label title={`Amount (ETH) ${balance}`} />
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full"
          placeholder="0.1"
          step="0.01"
          min="0.001"
        />
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <button
        onClick={fundContract}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white ${
          loading ? "bg-primary-500/80 cursor-not-allowed" : "bg-primary-500 hover:bg-primary-500/80"
        }`}
      >
        {loading ? "Processing..." : "Send ETH to Contract"}
      </button>
    </div>
  );
}