import { TransactionStatusIcon } from './TransactionStatusIcon';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { ITransaction } from '@/types';
import { dateFormat } from '@/helpers/common';


type TransactionCardProps = {
  transaction: ITransaction;
  threshold: number;
  onConfirm?: (txIndex: number) => void;
  onExecute?: (txIndex: number) => void;
  status?: string;
  isOwner: boolean;
};

const tnxStatus = ["pending", "processing", "completed", "failed"];

export const TransactionCard = ({
  transaction,
  threshold,
  onConfirm,
  onExecute,
  status,
  isOwner
}: TransactionCardProps) => {
  const shortenedAddress = (address: string) =>
    typeof address === 'string' && address.startsWith('0x')
      ? `${address.slice(0, 10)}...`
      : address;


  return (
    <div className="p-6 hover:bg-gray-750 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <TransactionStatusIcon status={tnxStatus[transaction.status]} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-white">{transaction.value} ETH</h3>
              <TransactionStatusBadge status={tnxStatus[transaction.status]} />
            </div>
            <p className="text-sm text-gray-400">{transaction.title}</p>
            <div className="flex items-center space-x-4 mt-1">
              {/* <span className="text-xs text-gray-500">From: {transaction.from}</span> */}
              <span className="text-xs text-gray-500">To: {shortenedAddress(transaction.to)}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-400">{dateFormat(transaction.timestamp)}</p>
          {!transaction.executed &&
            <>
              <div className="flex items-center justify-end mt-1">
                <span className="text-xs text-yellow-400">
                  Signatures: {transaction.numConfirmations}/{threshold}
                </span>
              </div>
              {isOwner && <div className="flex flex-col items-end gap-2">
                {!transaction.isConfirmed && (
                  <button
                    onClick={() => onConfirm?.(transaction.txIndex)}
                    disabled={status?.includes("confirming")}
                    className='text-sm cursor-pointer text-primary-400 hover:text-primary-400/80 py-1'
                  >
                    {status?.includes("confirming") ? "Confirming..." : "Sign Transaction"}
                  </button>
                )}
                {transaction.numConfirmations >= threshold && (
                  <button
                    onClick={() => onExecute?.(transaction.txIndex)}
                    disabled={status?.includes("executing")}
                    className='text-sm cursor-pointer text-green-400 hover:text-green-300 py-1'
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