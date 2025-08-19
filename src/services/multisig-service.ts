import { ethers, JsonRpcProvider } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config";

export class MultiSigService {
    private static instance: MultiSigService;
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

    public static getInstance(): MultiSigService {
        if (!MultiSigService.instance) {
            throw new Error("MultiSigService not initialized. Call initialize() first.");
        }
        return MultiSigService.instance;
    }


    public static async initialize() {
        if (!window.ethereum) {
            throw new Error("Ethereum provider not found");
        }

        try {

            if (!MultiSigService.instance) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

                MultiSigService.instance = new MultiSigService(provider, signer, contract);
            }

            return true;
        } catch (error) {
            console.log("Initialize error");
            return false;
        }
    }

    public static getReadOnlyContract(): ethers.Contract {
        const provider = new JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/nEdWHAIQiIv82oxqY8qH9pt7R4Wio3vh");
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
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

    public async getCurrentAccount(): Promise<string> {
        return await this.signer.getAddress();
    }

    public formatEther(wei: string): string {
        return ethers.formatEther(wei);
    }

    public parseEther(ether: string): bigint {
        return ethers.parseEther(ether);
    }

    public async checkContractBalance(amount: string): Promise<boolean> {
    try {
        const stats = await this.contract.getTransactionStats();
        const contractBalanceWei = stats[0];
        const requiredWei = ethers.parseEther(amount);
        
        return contractBalanceWei >= requiredWei;
    } catch (error) {
        console.error("Failed to check balance:", error);
        return false;
    }
    };

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
            const balance = await this.provider.getBalance(address);
            return this.formatEther(balance.toString());
        } catch (error) {
            console.error("Error getting account balance", error);
            return "0";
        }
    }


    public async getTransactionStats(): Promise<{
        contractBalance: string;
        totalValue: string;
        totalTxs: number;
        pendingTxs: number;
        executedTxs: number;
        failedTxs: number;
    }> {
        try {
            const stats = await this.contract.getTransactionStats();

            return {
                contractBalance: this.formatEther(stats[0]),
                totalValue: this.formatEther(stats[1]),
                totalTxs: Number(stats[2]),
                pendingTxs: Number(stats[3]),
                executedTxs: Number(stats[4]),
                failedTxs: Number(stats[5])
            };
        } catch (error) {
            console.error("Error fetching transaction stats:", error);
            return {
                contractBalance: "0",
                totalValue: "0",
                totalTxs: 0,
                pendingTxs: 0,
                executedTxs: 0,
                failedTxs: 0
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
}

