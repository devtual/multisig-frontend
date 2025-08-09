import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function VerifyAccount() {
    return (
        <div className="flex flex-col items-center justify-center text-center bg-gray-800 absolute inset-0">
            <div className="flex gap-6 items-center">
                <Image src="/logo.svg" width="30" height="30" alt="Logo" />
                <div className="flex space-x-2">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className="w-2 h-2 bg-purple-600 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </div>
                <Image
                    src="/metamask.svg"
                    width="30" height="30" alt="Metamask"
                />
            </div>
            <p className="mt-4 text-base font-medium text-white">
                Verify your <br /> account to continue
            </p>
        </div>
    );
}
