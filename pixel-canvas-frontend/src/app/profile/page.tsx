"use client";

import { useCurrentAccount } from "@mysten/dapp-kit"; // CORRECT IMPORT
import { Button } from "@/components/ui/button";
import {
  Copy,
  ExternalLink,
  Palette,
  Trophy,
  Coins,
  Activity,
} from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const currentAccount = useCurrentAccount(); // CORRECT HOOK
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (currentAccount) {
      navigator.clipboard.writeText(currentAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Rest of the component remains the same...
  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400">
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    );
  }

  // Rest of the component code stays the same...
}
