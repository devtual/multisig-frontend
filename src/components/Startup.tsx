"use client";
import React, { useEffect, useState } from "react";
import { MultiSigWallet } from "@/helpers/MultiSigWallet";
import { ethers } from "ethers";
import Header from "./Header";
import Loader from "./Loader";
import { WalletContext } from "@/context/WalletContext";

export default function Startup({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [isDeployer, setIsDeployer] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await MultiSigWallet.initialize();
        const wallet = MultiSigWallet.getInstance();
        const contract = wallet.getContract();
        const provider = wallet.getProvider();
        const deployer = await wallet.isDeployer();
        const address = await wallet.getCurrentAccount();


        setContract(contract);
        setProvider(provider);
        setIsDeployer(deployer);
        setCurrentAddress(address);
      } catch (error) {
        console.error("Wallet init error:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading || !contract) {
    return (
      <div className="bg-gray-900 flex items-center justify-center min-h-screen text-white">
        <Loader />
      </div>
    );
  }

  return (
    <WalletContext.Provider value={{ contract, currentAddress, provider, isDeployer }}>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header isDeployer={isDeployer} />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </WalletContext.Provider>
  );
}
