import { createContext, useContext } from "react";
import { ethers } from "ethers";
import { MultiSigService } from "@/services/multisig-service";

type WalletContextType = {
  wallet: MultiSigService | null;
  contract: ethers.Contract | null;
  provider: ethers.Provider | null;
  currentAddress: string;
  isDeployer: boolean;
};

export const WalletContext = createContext<WalletContextType>({
  wallet: null,
  contract: null,
  provider: null,
  currentAddress: "",
  isDeployer: false,
});


export const useWallet = () => useContext(WalletContext);
