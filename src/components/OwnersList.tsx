"use client";
import { useState } from "react";
import ownerService from "@/services/owner-service";
import { IOwner } from "@/types";
import { useWallet } from "@/context/WalletContext";
import { Wallet } from "lucide-react";
import { dateFormat, formatAddress } from "@/helpers/common";

export default function OwnersList({ initialOwners }: { initialOwners: IOwner[] }) {
  const [owners, setOwners] = useState(initialOwners);
  const { contract, isDeployer } = useWallet();


  const handleApprove = async (id: string, address: string) => {
    if (!window.ethereum) {
      return;
    }

    try {
      const tx = await contract!.addOwner(address);

      await tx.wait();
      await ownerService.updateOwnerStatus(id, "approved");

      setOwners(prev =>
        prev.map(o => (o._id === id ? { ...o, status: "approved" } : o))
      );
    } catch (error) {
      console.error(error);
    }
  }

  const handleReject = async (id: string) => {
    await ownerService.updateOwnerStatus(id, "rejected");
    setOwners(prev =>
      prev.map(o => (o._id === id ? { ...o, status: "rejected" } : o))
    );
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
      <h2 className="text-xl font-semibold text-white flex items-center mb-4">
        Owners
      </h2>
      <div className="divide-y divide-gray-700 bg-gray-800 rounded-lg border border-gray-700">
        {owners.map((owner: IOwner) => (
          <div key={owner._id} className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[linear-gradient(135deg,#9234ea,#1f2937)]">
                <Wallet className="h-6 w-6 text-white" />
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
                    onClick={() => handleApprove(owner._id, owner.address)}
                  >
                    Approve
                  </button>

                  {/* Cancel Button (Red) */}
                  <button
                    className="bg-red-500 hover:bg-red-500/80 cursor-pointer text-white text-sm px-2 py-1 rounded-md transition-colors"
                    onClick={() => handleReject(owner._id)}
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
