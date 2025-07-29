export class WalletProvider {
    public static isAvailable(): boolean {
        return typeof window !== "undefined" && !!window.ethereum;
    }

    public static async isConnected(): Promise<boolean> {
        if (!this.isAvailable()) return false;

        try {
            const accounts = await window.ethereum!.request({
                method: "eth_accounts",
            });

            return Array.isArray(accounts) && accounts.length > 0;
        } catch (error) {
            console.error("Failed to check connection:", error);
            return false;
        }
    }

    public static async connect(): Promise<boolean> {
        if (!this.isAvailable()) return false;

        try {
            const accounts = await window.ethereum!.request({ method: "eth_requestAccounts", });
            return Array.isArray(accounts) && accounts.length > 0;

        } catch (error) {
            console.error("Wallet connection failed:", error);
            return false;
        }
    }

    public static async switchToSepolia(): Promise<void> {
        if (!this.isAvailable()) {
            throw new Error("Ethereum provider not found");
        }

        const sepoliaChainId = "0xaa36a7"; // 11155111 in hex

        try {
            await window.ethereum!.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: sepoliaChainId }],
            });
        } catch (error: any) {
            // If Sepolia is not added to MetaMask
            if (error.code === 4902) {
                try {
                    await window.ethereum!.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: sepoliaChainId,
                                chainName: "Sepolia Test Network",
                                rpcUrls: ["https://rpc.sepolia.org"],
                                nativeCurrency: {
                                    name: "SepoliaETH",
                                    symbol: "ETH",
                                    decimals: 18,
                                },
                                blockExplorerUrls: ["https://sepolia.etherscan.io"],
                            },
                        ],
                    });
                } catch (addError) {
                    console.error("Failed to add Sepolia network:", addError);
                    throw addError;
                }
            } else {
                console.error("Failed to switch network:", error);
                throw error;
            }
        }
    }

    public static onAccountChanged(){
        if (this.isAvailable()) {
            window.ethereum!.removeAllListeners?.("accountsChanged");
            window.ethereum!.on('accountsChanged', () => window.location.reload());
        }
    }
}
