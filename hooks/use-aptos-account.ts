"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface UseAptosAccountResult {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: (walletName?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  availableWallets: string[];
}

export function useAptosAccount(): UseAptosAccountResult {
  const { account, connected, connect, disconnect, wallets } = useWallet();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const connectWallet = async (walletName?: string) => {
    try {
      // default to Petra if none specified
      const targetWallet = walletName || wallets[0]?.name || "Petra";
      await connect(targetWallet);
      console.log("✅ Connected to wallet:", targetWallet);
    } catch (err) {
      console.error("❌ Wallet connect failed:", err);
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
      console.log("👋 Wallet disconnected");
    } catch (err) {
      console.error("❌ Wallet disconnect failed:", err);
    }
  };

  return {
    address: account?.address?.toString() ?? null,
    isConnected: connected,
    isLoading,
    connect: connectWallet,
    disconnect: disconnectWallet,
    availableWallets: wallets.map((w) => w.name),
  };
}
