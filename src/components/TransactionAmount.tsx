"use client";
import { getEthPrice } from "@/lib/price-feed";
import { useEffect, useState } from "react";

export function TransactionAmount({ ethValue }: { ethValue: number }) {
    const [usdtValue, setUsdtValue] = useState("0.0000");
  
    useEffect(() => {
        const fetchPrice = async () => {
            const price = await getEthPrice();
            const value = price ? (ethValue * price).toFixed(2) : "...";
            setUsdtValue(value)
        }

        fetchPrice();
    }, [ethValue])

  return (
    <p className="text-white">≈ {usdtValue} USDT</p>
  );
}
