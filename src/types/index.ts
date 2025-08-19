export type ITransaction = {
    to: string;
    title: string;
    value: string;
    data: string;
    numConfirmations: number;
    isConfirmed: boolean;
    txIndex: number;
    status: TransactionStatus;
    timestamp: number;
}

export enum TransactionStatus {
    Pending,
    Processing,
    Completed,
    Failed,
    Cancelled,
    Expired
}

export type ITransactionRecord = {
  txIndex: number;
  title: string;
  txHash: string;
  submittedBy: string;
  timestamp?: Date;
}

export type IApiResponse = {
    status?: boolean;
    result?: any;
    message?: string;
    code?: number;
}

export type OwnerStatus = "pending" | "approved" | "rejected";

export type IOwner = {
  _id: string;
  name: string;
  email: string;
  address: string;
  status: OwnerStatus;
  updatedAt: string;
}
