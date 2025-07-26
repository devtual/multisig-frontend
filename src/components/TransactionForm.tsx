
"use client"
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { contractAbi, contractAddress } from "@/config";

export default function TransactionForm() {
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [currentAccount, setCurrentAccount] = useState<string>("");
  
    useEffect(() => {
      const init = async () => {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          const multiSigContract = new ethers.Contract(
            contractAddress,
            contractAbi,
            signer
          );
          
          setContract(multiSigContract);
          setCurrentAccount(await signer.getAddress());
        }
      };
  
      init();
    }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        if(contract){
            
      const tx = await contract.submitTransaction(
        to,
        ethers.parseEther(value),
        "0x"
      );
      await tx.wait();
      
        }
      // Refresh transaction list
    } catch (error) {
      console.error("Error submitting transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2">Recipient Address</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Amount (ETH)</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border rounded"
            step="0.0001"
            min="0"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-700 text-white py-2 px-4 rounded"
          >
            {loading ? "Submitting..." : "Submit Transaction"}
          </button>
        </div>
      </div>
    </form>
  );
}