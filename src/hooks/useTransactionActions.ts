import { useWallet } from "@/context/WalletContext";
import emailService from "@/services/email-service";
import { ITransaction, TransactionStatus } from "@/types";
import { useCallback } from "react";

type UseTransactionActionsProps = {
  saveStatus: (txIndex: number, status: string) => void;
  getStatus: (txIndex: number) => { status: string } | undefined;
  setTransactions: React.Dispatch<React.SetStateAction<ITransaction[]>>;
  transactions: ITransaction[];
  isPendingTx?: boolean;
  onTransactionExecuted?: () => void; // required
}

export const useTransactionActions = ({
  saveStatus,
  getStatus,
  setTransactions,
  transactions,
  isPendingTx = false,
  onTransactionExecuted
}: UseTransactionActionsProps) => {

  const {contract, isOwner, provider, currentAddress} = useWallet()
  const handleConfirm = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>, txIndex: number) => {
      event.stopPropagation();
      if (!isOwner) return;

      const currentStatus = getStatus(txIndex)?.status || '';
      if (currentStatus.includes('confirming')) return;

      try {
        saveStatus(txIndex, 'confirming');
        const txResponse = await contract!.confirmTransaction(txIndex);
        saveStatus(txIndex, 'confirming-mined');

        const receipt = await txResponse.wait();

        if (receipt.status === 1) {
          saveStatus(txIndex, 'confirmed');
          setTransactions(prevTxs =>
            prevTxs.map(tx =>
              tx.txIndex === txIndex
                ? {
                    ...tx,
                    numConfirmations: tx.numConfirmations + 1,
                    isConfirmed: true
                  }
                : tx
            )
          );

          const tx = transactions.find(tx => tx.txIndex === txIndex)!;
          emailService.confirm(currentAddress, {txIndex, value: tx.value, title: tx.title})
          
          return;
        }
        throw new Error('Transaction failed on-chain');
      } catch (error) {
        saveStatus(txIndex, 'confirm-failed');
        throw error;
      }
    },
    [contract, isOwner, saveStatus, getStatus, setTransactions]
  );

  const handleExecute = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>, txIndex: number) => {
      event.stopPropagation();
      if (!isOwner) return;

      const currentStatus = getStatus(txIndex)?.status || '';
      if (currentStatus.includes('executing')) return;

      try {
        saveStatus(txIndex, 'executing');
        const txResponse = await contract!.executeTransaction(txIndex, {
          gasLimit: 300000
        });
        saveStatus(txIndex, 'executing-mined');

        const receipt = await txResponse.wait();

        if (receipt.status === 1 && provider) {
          const block: any = await provider.getBlock(receipt.blockNumber);
          const timestamp = block.timestamp;

          const tx = transactions.find(tx => tx.txIndex === txIndex)!;
          emailService.execute(currentAddress, {txIndex, value: tx.value, title: tx.title})
          
          saveStatus(txIndex, 'executed');

          if(isPendingTx){
            const txs = [...transactions];
            const updatedTxs = txs.filter(tx => tx.txIndex !== txIndex);
            setTransactions(updatedTxs);
            onTransactionExecuted?.();
            return;
          } 

          onTransactionExecuted?.();
          
          setTransactions(prevTxs =>
            prevTxs.map(tx =>
              tx.txIndex === txIndex
                ? {
                  ...tx,
                  timestamp,
                  status: TransactionStatus.Completed
                }
                : tx
            )
          )
          return;
        }

        throw new Error('Execution failed on-chain');
      } catch (error) {
        saveStatus(txIndex, 'execute-failed');
        throw error;
      }
    },
    [contract, isOwner, saveStatus, getStatus, setTransactions, transactions, provider]
  );

  const handleCancel = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>, txIndex: number) => {
      event.stopPropagation();
      if (!isOwner) return;

      const currentStatus = getStatus(txIndex)?.status || '';
      if (currentStatus.includes('cancelling')) return;

      try {
        saveStatus(txIndex, 'cancelling');
        const txResponse = await contract!.cancelTransaction(txIndex);
        saveStatus(txIndex, 'cancelling-mined');

        const receipt = await txResponse.wait();

        if (receipt.status === 1) {
          saveStatus(txIndex, 'cancelled');
          setTransactions(prevTxs =>
            prevTxs.map(tx =>
              tx.txIndex === txIndex
                ? {
                    ...tx,
                    cancelled: true
                  }
                : tx
            )
          );
          return;
        }
        throw new Error('Transaction failed on-chain');
      } catch (error) {
        saveStatus(txIndex, 'confirm-failed');
        throw error;
      }
    },
    [contract, isOwner, saveStatus, getStatus, setTransactions]
  );

  return { handleConfirm, handleExecute, handleCancel };
};
