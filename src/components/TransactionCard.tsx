import { TransactionStatusIcon } from './TransactionStatusIcon';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { ITransaction, TransactionStatus } from '@/types';
import { dateFormat } from '@/helpers/common';


type TransactionCardProps = {
  transaction: ITransaction;
  threshold: number;
  onClick?: (tx: ITransaction) => void;
  onConfirm?: (event: React.MouseEvent<HTMLButtonElement>, txIndex: number) => void;
  onExecute?: (event: React.MouseEvent<HTMLButtonElement>, txIndex: number) => void;
  onCancel?: (event: React.MouseEvent<HTMLButtonElement>, txIndex: number) => void;
  status?: string;
  isOwner: boolean;
};

const txStatus = ["pending", "processing", "completed", "failed", "cancelled", "expired"];

export const TransactionCard = ({
  transaction,
  threshold,
  onClick,
  onConfirm,
  onExecute,
  onCancel,
  status,
  isOwner
}: TransactionCardProps) => {
  const shortenedAddress = (address: string) =>
    typeof address === 'string' && address.startsWith('0x')
      ? `${address.slice(0, 10)}...`
      : address;


  return (
    <div className="p-4 hover:bg-gray-750 cursor-pointer transition-colors" 
      onClick={() => onClick?.(transaction)}
      role="button">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <TransactionStatusIcon status={txStatus[transaction.status]} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-white">{transaction.value} ETH</h3>
              <TransactionStatusBadge status={txStatus[transaction.status]} />
            </div>
            <p className="text-sm text-gray-400">{transaction.title}</p>
            {/* <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs text-gray-500">To: {shortenedAddress(transaction.to)}</span>
            </div> */}
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-400">{dateFormat(transaction.timestamp)}</p>
          {(transaction.status !== TransactionStatus.Completed && transaction.status !== TransactionStatus.Cancelled) &&
            <>
              <div className="flex items-center justify-end mt-1">
                <span className="text-xs text-yellow-400">
                  Signatures: {transaction.numConfirmations}/{threshold}
                </span>
              </div>
              {isOwner && <div className="flex justify-end gap-3 mt-3">
                {!transaction.isConfirmed && (
                  <>
                  <button
                    onClick={(event) => onConfirm?.(event, transaction.txIndex)}
                    disabled={status?.includes("confirming") || status?.includes('cancelling')}
                    className='text-sm cursor-pointer px-2 py-1 rounded-md min-w-10 bg-green-500 text-white hover:bg-green-500/80'
                  >
                    {status?.includes("confirming") ? "Confirming..." : "Confirm"}
                  </button>
                  
                  <button
                      onClick={(event) => onCancel?.(event, transaction.txIndex)}
                      disabled={status?.includes("confirming") || status?.includes('cancelling')}
                      className="text-sm cursor-pointer px-2 py-1 rounded-md min-w-10 bg-red-500 text-white hover:bg-red-500/80"
                    >
                      {status?.includes('cancelling') ? "Cancelling..." : "Cancel"}
                    </button>
                  </>
                )}
                {transaction.numConfirmations >= threshold && (
                  <button
                    onClick={(event) => onExecute?.(event, transaction.txIndex)}
                    disabled={status?.includes("executing")}
                    className='text-sm cursor-pointer px-2 py-1 rounded-md min-w-10 bg-primary-500 text-white hover:bg-primary-500/80'
                  >
                    {status?.includes("executing") ? "Executing..." : "Execute"}
                  </button>
                )}
              </div>}
            </>
          }
        </div>
      </div>
    </div>
  );
};