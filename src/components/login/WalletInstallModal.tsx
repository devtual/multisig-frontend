'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function WalletInstallModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 -m-[1px] flex items-end p-3 rounded-lg bg-gray-900/50"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <motion.div
            className="bg-gray-900 w-full rounded-xl p-4 flex flex-col items-center text-center relative"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <p className="text-base font-semibold mb-3">Get Wallet</p>
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-3">
              <Image
                src="/metamask.svg"
                alt="MetaMask Icon"
                width={40}
                height={40}
              />
            </div>

            <a
              href="https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700/50 hover:bg-gray-700/40 text-white w-full text-sm px-4 py-2 rounded-full flex items-center justify-center space-x-2 transition"
            >
              <Image src="/chrome.svg" alt="Chrome" width={20} height={20} />
              <span>Install Chrome extension</span>
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
