import { useCallback } from 'react';
import { useTransactionStatus } from './useTransactionStatus';
import { useWallet } from '@/context/WalletContext';

type TransactionCallbacks = {
  onConfirmed?: (txIndex: number) => void;
  onExecuted?: (txIndex: number) => void;
  onSaveStatus?: (txIndex: number, status: string) => void;
};

export function useTransactionActions(
  callbacks?: TransactionCallbacks
) {
  const { saveStatus, getStatus } = useTransactionStatus();
  const { contract } = useWallet();

  const handleConfirm = useCallback(async (txIndex: number) => {
    const currentStatus = getStatus(txIndex)?.status || '';
    if (currentStatus.includes('confirming')) return;

    try {
      saveStatus(txIndex, 'confirming');

      const txResponse = await contract!.confirmTransaction(txIndex);
      saveStatus(txIndex, 'confirming-mined');

      const receipt = await txResponse.wait();
      
      if (receipt.status === 1) {
        saveStatus(txIndex, 'confirmed');
        callbacks?.onConfirmed?.(txIndex);
        return true;
      }
      throw new Error('Transaction failed on-chain');
    } catch (error) {
      saveStatus(txIndex, 'confirm-failed');
      throw error;
    }
  }, [saveStatus, getStatus, callbacks?.onConfirmed]);

  const handleExecute = useCallback(async (txIndex: number) => {
    const currentStatus = getStatus(txIndex)?.status || '';
    if (currentStatus.includes('executing')) return;

    try {
      saveStatus(txIndex, 'executing');

      const tx = await contract!.executeTransaction(txIndex, {
        gasLimit: 300000,
      });
      saveStatus(txIndex, 'executing-mined');

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        saveStatus(txIndex, 'executed');
        callbacks?.onExecuted?.(txIndex);
        return true;
      }
      throw new Error('Execution failed on-chain');
    } catch (error) {
      saveStatus(txIndex, 'execute-failed');
      throw error;
    }
  }, [contract, saveStatus, getStatus, callbacks?.onExecuted]);

  const getButtonState = (txIndex: number, action: 'confirm' | 'execute') => {
    const status = getStatus(txIndex)?.status || '';
    return {
      disabled: status.includes(`${action}ing`),
      text: status.includes(`${action}ing`) 
        ? `${action.charAt(0).toUpperCase() + action.slice(1)}ing...` 
        : action === 'confirm' ? 'Sign Transaction' : 'Execute'
    };
  };

  return {
    handleConfirm,
    handleExecute,
    getButtonState
  };
}