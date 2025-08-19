import { dateFormat, formatAddress } from "@/helpers/common";
import { ITransaction } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react"; // Or any close icon


interface TransactionModalProps {
  transaction: ITransaction | null;
  onClose: () => void;
}

const txStatus = ["pending", "processing", "completed", "failed", "cancelled", "expired"];

const TransactionModal = ({ transaction, onClose }: TransactionModalProps) => {
  return (
    <AnimatePresence>
      {transaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
              Transaction Details
            </h2>

            <div className="space-y-4">
              <DetailRow label="Amount" value={`${transaction.value} ETH`} />
              <DetailRow label="Date" value={dateFormat(transaction.timestamp)} />
              <DetailRow label="Description" value={transaction.title} />
              <DetailRow label="Recipient" value={formatAddress(transaction.to)} />
              <DetailRow label="Status" value={txStatus[transaction.status]} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionModal;

const DetailRow = ({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) => (
  <div className="flex justify-between">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    {children || <span className="font-medium text-gray-800 dark:text-gray-200">{value}</span>}
  </div>
);