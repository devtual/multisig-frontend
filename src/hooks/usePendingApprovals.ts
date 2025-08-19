import { useEffect, useState } from "react";
import { ethers } from "ethers";

const STORAGE_KEY = "pending_approvals";

export function usePendingApprovals(contract: ethers.Contract) {
    const [pendingTxs, setPendingTxs] = useState<Record<string, string>>({});

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setPendingTxs(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingTxs));
    }, [pendingTxs]);

    useEffect(() => {
        async function checkReceipts() {
            const provider = contract.runner?.provider as ethers.Provider;
            if (!provider) return;



            for (const [owner, hash] of Object.entries(pendingTxs)) {
                if (!hash.startsWith("0x") || hash.length !== 66) continue;

                const receipt = await provider.getTransactionReceipt(hash);
                if (receipt) {
                    setPendingTxs((prev) => {
                        const { [owner]: _, ...rest } = prev;
                        return rest;
                    });
                }
            }
        }

        if (Object.keys(pendingTxs).length > 0) {
            checkReceipts();
        }
    }, [pendingTxs, contract]);

    async function hasApproved(ownerAddress: string): Promise<boolean> {
        try {
            return await contract.isOwner(ownerAddress);
        } catch {
            return false;
        }
    }

    function markPending(address: string, action: "approve" | "reject", hash: string) {
        setPendingTxs((prev) => ({
            ...prev,
            [`${address}_${action}`]: hash,
        }));
    }

    function clearPending(address: string, action: "approve" | "reject") {
        setPendingTxs((prev) => {
            const { [`${address}_${action}`]: _, ...rest } = prev;
            return rest;
        });
    }

    function isPending(address: string, action: "approve" | "reject") {
        return !!pendingTxs[`${address}_${action}`];
    }


    return {
        pendingTxs,
        isPending,
        markPending,
        clearPending,
        hasApproved,
    };
}
