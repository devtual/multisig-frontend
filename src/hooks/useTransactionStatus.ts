import { useState, useEffect } from 'react';

type TxStatus = {
  status: string;
  timestamp: number;
};

type TxStatusMap = Record<number, TxStatus>;

const STORAGE_KEY = 'multisigTxStatus';

export function useTransactionStatus() {
  const [statuses, setStatuses] = useState<TxStatusMap>({});

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setStatuses(saved ? JSON.parse(saved) : {});
  }, []);

  const saveStatus = (txIndex: number, status: string) => {
    const newStatuses = {
      ...statuses,
      [txIndex]: {
        status,
        timestamp: Date.now()
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatuses));
    setStatuses(newStatuses);
  };

  const getStatus = (txIndex: number): TxStatus | undefined => {
    return statuses[txIndex];
  };

  const clearStatus = (txIndex: number) => {
    const newStatuses = { ...statuses };
    delete newStatuses[txIndex];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatuses));
    setStatuses(newStatuses);
  };

  return {
    statuses,
    saveStatus,
    getStatus,
    clearStatus
  };
}