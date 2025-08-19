"use client";
import { useState } from "react";
import ownerService from "@/services/owner-service";
import { IOwner } from "@/types";
import { useWallet } from "@/context/WalletContext";
import { Wallet } from "lucide-react";
import { formatAddress } from "@/helpers/common";
import { addDeployerAsOwner } from "@/backend/actions/owners";
import { Notification, NotificationType } from "@/helpers/notification";
import { usePendingApprovals } from "@/hooks/usePendingApprovals";

export default function OwnersList({ initialOwners }: { initialOwners: IOwner[] }) {
  const [owners, setOwners] = useState(initialOwners);
  const { contract, isDeployer, isOwner } = useWallet();
  const [loading, setLoading] = useState(false);
  const {
    isPending,
    markPending,
    clearPending
  } = usePendingApprovals(contract!);


  const handleAddDeployer = async () => {
    if (loading)
      return;

    setLoading(true);
    try {
      const result = await addDeployerAsOwner();
      if (result?.status) {
        Notification.show(result.message, NotificationType.Success);
      } else {
        Notification.show(result.message, NotificationType.Error);
      }
    } catch (err: any) {
      Notification.show(err.message || "Failed to add deployer", NotificationType.Error);
    } finally {
      setLoading(false);
    }
  };


  const handleApprove = async (id: string, address: string) => {
    if (!window.ethereum) {
      return;
    }

    try {
      if (isPending(address, "approve")) return;

      markPending(address, "approve", "initiating");

      const tx = await contract!.addOwner(address);

      markPending(address, "approve", tx.hash);
      

      await tx.wait();
      await ownerService.updateOwnerStatus(id, "approved");
      
      setOwners(prev =>
        prev.map(o => (o._id === id ? { ...o, status: "approved" } : o))
      );
      
      const owner = owners.find(o => o._id === id);
      Notification.show(owner?.name + "approved successfully", NotificationType.Success);
      clearPending(address, "approve");
    } catch (error:any) {
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        Notification.show("Transaction was rejected by the owner", NotificationType.Error);
      } else {
        console.error("Unexpected error:", error);
        Notification.show("Something went wrong. Please try again.", NotificationType.Error);
      }

      clearPending(address, "approve");
    }
  }

  const handleReject = async (id: string, address: string) => {
    try {
      if (isPending(address, "reject")) return;

      markPending(address, "reject", "rejecting");

      await ownerService.updateOwnerStatus(id, "rejected");

      setOwners(prev =>
        prev.map(o => (o._id === id ? { ...o, status: "rejected" } : o))
      );

      Notification.show("Owner rejected successfully", NotificationType.Success);
    } catch (error) {
      console.error(error);
      Notification.show("Failed to reject owner", NotificationType.Error);
    } finally {
      clearPending(address, "reject");
    }
  };

  const handleRemove = async (id: string, address: string) => {
  if (!window.ethereum) return;

  try {
    if (isPending(address, "reject")) return;

    // 1. send transaction
    const tx = await contract!.removeOwner(address);
    markPending(address, "reject", tx.hash);

    // 2. wait for confirmation
    await tx.wait();

    // 3. update DB
    await ownerService.updateOwnerStatus(id, "rejected");

    // 4. update UI
    setOwners(prev =>
      prev.map(o => (o._id === id ? { ...o, status: "rejected" } : o))
    );

    Notification.show("Owner rejected successfully", NotificationType.Success);
    clearPending(address, "reject");
  } catch (error: any) {
    if (error.code === 4001 || error.code === "ACTION_REJECTED") {
      Notification.show("Transaction was rejected in MetaMask", NotificationType.Error);
    } else {
      console.error(error);
      Notification.show("Something went wrong while rejecting", NotificationType.Error);
    }
    clearPending(address, "reject");
  }
};



  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-500";
      case "pending":
        return "text-amber-500";
      case "rejected":
        return "text-red-500";
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center mb-4">
          Owners
        </h2>
        {(isDeployer && !isOwner) && <button
          className="bg-green-500 hover:bg-green-500/80 cursor-pointer text-white text-sm px-2 py-1 rounded-md transition-colors"
          onClick={handleAddDeployer}
        >
          Add Deployer
        </button>}
      </div>
      <div className="divide-y divide-gray-700 bg-gray-800 rounded-lg border border-gray-700">
        {owners.map((owner: IOwner) => (
          <div key={owner._id} className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[linear-gradient(135deg,#9234ea,#1f2937)]">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium">{owner.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{formatAddress(owner.address)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* <div className="text-right">
                          <p className="text-sm text-muted-foreground">Joined</p>
                          <p className="text-sm text-foreground">{dateFormat(owner.updatedAt)}</p>
                        </div> */}
              {(owner.status === "pending" && isDeployer) ? (
                <div className="flex gap-2">
                  {/* Approve Button (Green) */}
                  <button
                    className="bg-green-500 hover:bg-green-500/80 cursor-pointer text-white text-sm px-2 py-1 rounded-md transition-colors"
                    disabled={isPending(owner.address, "approve")}
                    onClick={() => handleApprove(owner._id, owner.address)}
                  >
                    {isPending(owner.address, "approve") ? "Pending..." : "Approve"}
                  </button>

                  {/* Cancel Button (Red) */}
                  <button
                    disabled={isPending(owner.address, "reject")}
                    className="bg-red-500 hover:bg-red-500/80 cursor-pointer text-white text-sm px-2 py-1 rounded-md transition-colors"
                    onClick={() => handleReject(owner._id, owner.address)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <span className={`capitalize ${getStatusColor(owner.status)}`}>
                  {owner.status}
                </span>
              )}
            </div>
          </div>
        ))}

      </div>
    </>
  );
}
