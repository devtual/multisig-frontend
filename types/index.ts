export type ITransaction = {
    to: string;
    title: string;
    value: string;
    data: string;
    executed: boolean;
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
    Failed
}