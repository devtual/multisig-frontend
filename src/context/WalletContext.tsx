import { createContext, useContext } from "react";
import { ethers } from "ethers";

type WalletContextType = {
  contract: ethers.Contract | null;
  provider: ethers.Provider | null;
  currentAddress: string;
  isDeployer: boolean;
};

export const WalletContext = createContext<WalletContextType>({
  contract: null,
  provider: null,
  currentAddress: "",
  isDeployer: false,
});


export const useWallet = () => useContext(WalletContext);
