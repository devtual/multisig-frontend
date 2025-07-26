"use client"
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { MultiSigWallet } from "../helpers/MultiSigWallet";
import Input from "./Input";
import Label from "./Label";

interface ContractFundingProps {
  contractAddress: string;
  contractAbi: any[];
}


export default function ContractFunding() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [balance, setBalance] = useState("");
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const wallet = MultiSigWallet.getInstance();
        const contract = await wallet.getContract();
        const balance = await wallet.getAccountBalance();
        setContract(contract);
        setBalance(balance)
      }
    }

    init();
  },[])

  const fundContract = async () => {
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
      

      // Send transaction
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
          loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Processing..." : "Send ETH to Contract"}
      </button>
    </div>
  );
}