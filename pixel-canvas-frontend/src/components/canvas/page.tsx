"use client";

import PixelCanvas from "@/components/canvas/PixelCanvas";
import { useCurrentAccount } from "@mysten/dapp-kit"; // CORRECT IMPORT
import { AlertCircle } from "lucide-react";

export default function CanvasPage() {
  const currentAccount = useCurrentAccount(); // CORRECT HOOK
  const canvasId = process.env.NEXT_PUBLIC_CANVAS_OBJECT_ID;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
            Pixel Canvas
          </h1>
          <p className="text-gray-300 text-lg">
            Paint your vision, one pixel at a time
          </p>
        </div>

        {!currentAccount ? (
          <div className="max-w-md mx-auto">
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-6 backdrop-blur-sm">
              <AlertCircle className="w-8 h-8 text-yellow-400 mb-3" />
              <h3 className="text-lg font-semibold text-yellow-100 mb-2">
                Wallet Connection Required
              </h3>
              <p className="text-yellow-200/80">
                Please connect your wallet to start painting pixels
              </p>
            </div>
          </div>
        ) : !canvasId ? (
          <div className="max-w-md mx-auto">
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-6 backdrop-blur-sm">
              <AlertCircle className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-blue-100 mb-2">
                Canvas Not Initialized
              </h3>
              <p className="text-blue-200/80">
                Admin needs to create a canvas first
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
            <PixelCanvas canvasId={canvasId} />
          </div>
        )}
      </div>
    </div>
  );
}
