import { ethers } from "ethers";
import { contractAbi, contractAddress } from "../config";

type Transaction = {
    to: string;
    value: string;
    data: string;
    executed: boolean;
    numConfirmations: number;
    isConfirmed: boolean;
    txIndex: number;
}

export class MultiSigWallet {
    private static instance: MultiSigWallet;
    private contract: ethers.Contract;
    private signer: ethers.Signer;
    private provider: ethers.Provider;

    private constructor(
        provider: ethers.Provider,
        signer: ethers.Signer,
        contract: ethers.Contract,
    ) {
        this.provider = provider;
        this.signer = signer;
        this.contract = contract;
    }

    public static getInstance(): MultiSigWallet {
        if (!MultiSigWallet.instance) {
            throw new Error("MultiSigWallet not initialized. Call initialize() first.");
        }
        return MultiSigWallet.instance;
    }


    public static async initialize() {
        if (!window.ethereum) {
            throw new Error("Ethereum provider not found");
        }

        window.ethereum.on('accountsChanged', () => window.location.reload());

        await this.switchToSepolia();

        if (!MultiSigWallet.instance) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            MultiSigWallet.instance = new MultiSigWallet(provider, signer, contract);
        }
    }

    public getProvider(): ethers.Provider {
        return this.provider;
    }

    public getContract(): ethers.Contract {
        return this.contract;
    }

    public getSigner(): ethers.Signer {
        return this.signer;
    }

    public static async switchToSepolia() {
        const sepoliaChainId = "0xaa36a7"; // Sepolia chainId in hex
        if (window.ethereum) {
            try {
                // 1. Try to switch to Sepolia
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: sepoliaChainId }],
                });
            } catch (switchError: any) {
                // 2. If the network is not added (error code 4902), add it
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [
                                {
                                    chainId: sepoliaChainId,
                                    chainName: "Sepolia Test Network",
                                    rpcUrls: ["https://rpc.sepolia.org"], // public Sepolia RPC
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
                        console.error("Failed to add Sepolia network", addError);
                    }
                } else {
                    console.error("Failed to switch network", switchError);
                }
            }
        }
    }

    public async getCurrentAccount(): Promise<string> {
        return await this.signer.getAddress();
    }

    public formatEther(wei: string): string {
        return ethers.formatEther(wei);
    }

    public parseEther(ether: string): bigint {
        return ethers.parseEther(ether);
    }

    public async isDeployer(): Promise<boolean> {
        try {
            return await this.contract.isDeployer();
        } catch (error) {
            console.error("Failed to check deployer status", error);
            return false;
        }
    }

    public async getContractBalance(): Promise<string> {
        try {
            const balance = await this.contract.getBalance();
            return this.formatEther(balance);
        } catch (error) {
            console.error("Error getting contract balance", error);
            return "0";
        }
    }

    public async getAccountBalance(): Promise<string> {
        try {
            const address = await this.getCurrentAccount();
            const balance = await this.contract.getAccountBalance(address);
            return this.formatEther(balance);
        } catch (error) {
            console.error("Error getting account balance", error);
            return "0";
        }
    }

    public async getOwnerNames(): Promise<{ address: string; name: string }[]> {
        try {
            const ownerAddresses = await this.contract.getOwners();
            const ownersWithNames = await Promise.all(
                ownerAddresses.map(async (addr: string) => {
                const name = await this.contract.ownerNames(addr);
                    return { address: addr, name };
                })
            );
            return ownersWithNames;
        } catch (error) {
            console.error("Error getting owners", error);
            return []
        }
    }

    public async getTransactionStats(): Promise<{
        contractBalance: string;
        totalValue: string;
        totalTransactions: number;
        pendingTransactions: number;
        executedTransactions: number;
    }> {
        try {
            const [
                contractBalance,
                totalValue,
                totalTransactions,
                pendingTransactions,
                executedTransactions,
            ] = await this.contract.getTransactionStats();

            return {
                contractBalance: this.formatEther(contractBalance),
                totalValue: this.formatEther(totalValue),
                totalTransactions: Number(totalTransactions),
                pendingTransactions: Number(pendingTransactions),
                executedTransactions: Number(executedTransactions),
            };
        } catch (error) {
            console.error("Error fetching transaction stats:", error);
            return {
                contractBalance: "0",
                totalValue: "0",
                totalTransactions: 0,
                pendingTransactions: 0,
                executedTransactions: 0,
            };
        }
    }


    public async submitTransaction(
        to: string,
        value: string,
        data: string = "0x"
    ): Promise<ethers.ContractTransactionResponse> {
        if (!this.contract) {
            throw new Error("Wallet not initialized");
        }

        const valueWei = ethers.parseEther(value);
        return this.contract.submitTransaction(to, valueWei, data);
    }

    public async getPendingTransaction() {
        const count = Number(await this.contract.getTransactionCount());
        const txArray: Transaction[] = [];
        const transactionsToFetch = Math.min(15, count); // Get last 15 or all if less than 15

        for (let i = count - 1; i >= Math.max(0, count - transactionsToFetch); i--) {
            const [tx, isConfirmed] = await Promise.all([
                this.contract.getTransaction(i),
                this.contract.isConfirmed(i, this.getCurrentAccount())
            ]);

            txArray.push({
                to: tx.to,
                value: ethers.formatEther(tx.value),
                data: tx.data,
                executed: tx.executed,
                numConfirmations: Number(tx.numConfirmations),
                isConfirmed,
                txIndex: i
            });
        }

        return txArray;
    }
}