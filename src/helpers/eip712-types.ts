import { CONTRACT_ADDRESS } from "@/config";

export const domain = {
  name: "KeyGuard Wallet",
  version: "1",
  chainId: "0xaa36a7",
  verifyingContract: CONTRACT_ADDRESS,
};

export const types = {
  Transaction: [
    { name: "txHash", type: "bytes32" },
    { name: "txIndex", type: "uint256" },
    { name: "title", type: "string" },
    { name: "submittedBy", type: "string" },
    { name: "nonce", type: "uint256" },
    { name: "timestamp", type: "uint256" },
  ],
};
