"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Header from "./Header";
import Loader from "./Loader";
import { WalletContext } from "@/context/WalletContext";
import { getSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { WalletProvider } from "@/lib/wallet-provider";
import { MultiSigService } from "@/services/multisig-service";


export default function Startup({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<MultiSigService | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [isDeployer, setIsDeployer] = useState(false);
  const pathname = usePathname()

  useEffect(() => {
  const initWallet = async () => {
    try {

      if (!WalletProvider.isAvailable()) return;

      const isConnected = await WalletProvider.isConnected();
      if (!isConnected) return;

      await WalletProvider.onAccountChanged();
      
      await WalletProvider.switchToSepolia();

      const success = await MultiSigService.initialize();
      console.log("Success", success)
      if (!success) return;

      
        
      const wallet = MultiSigService.getInstance();
      const [contract, provider, isDeployer, address] = await Promise.all([
        wallet.getContract(),
        wallet.getProvider(),
        wallet.isDeployer(),
        wallet.getCurrentAccount(),
      ]);

      const session = await getSession();

      if (session?.address?.toLowerCase() !== address.toLowerCase() && pathname !== "/login") {
        await signOut();
        return;
      }

      setWallet(wallet);
      setContract(contract);
      setProvider(provider);
      setIsDeployer(isDeployer);
      setCurrentAddress(address);
    } catch (error) {
      console.error("Wallet initialization failed:", error);
    } finally {
      console.log("Finally call")
      setLoading(false);
    }
  };

  initWallet();
}, [pathname]);


  if (loading) {
    return (
      <div className="bg-gray-900 flex items-center justify-center min-h-screen text-white">
        <Loader />
      </div>
    );
  }

  return (
    <WalletContext.Provider value={{wallet, contract, currentAddress, provider, isDeployer }}>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header isDeployer={isDeployer} />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </WalletContext.Provider>
  );
}
