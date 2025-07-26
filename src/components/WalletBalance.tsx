"use client"
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { MultiSigWallet } from "../helpers/MultiSigWallet";

export default function WalletBalance({ contract }: { contract: ethers.Contract }) {
  const [balance, setBalance] = useState<string>("0");

  useEffect(() => {
    
    const fetchBalance = async () => {
            if (window.ethereum) {

      
      const bal = await contract.getBalance();
      setBalance(ethers.formatEther(bal));
        }
    };
    fetchBalance();
  }, [contract]);

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6">
      <h3 className="font-bold text-lg">Contract Balance</h3>
      <p className="text-2xl">{balance} ETH</p>
    </div>
  );
}