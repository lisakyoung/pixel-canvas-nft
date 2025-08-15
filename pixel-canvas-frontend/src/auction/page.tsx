"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Gavel, Clock, TrendingUp, Trophy } from "lucide-react";

export default function AuctionPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
            Live Auctions
          </h1>
          <p className="text-gray-300 text-lg">Bid on completed masterpieces</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* NFT Preview */}
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl mb-6 flex items-center justify-center">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">NFT Preview</p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white">
                Genesis Canvas #001
              </h3>
              <p className="text-gray-400">
                A collaborative masterpiece created by 142 artists
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex-1 text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">10K</div>
                  <div className="text-xs text-gray-500">Total Pixels</div>
                </div>
                <div className="flex-1 text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-pink-400">142</div>
                  <div className="text-xs text-gray-500">Contributors</div>
                </div>
                <div className="flex-1 text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">100%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
            </div>
          </div>

          {/* Auction Details */}
          <div className="space-y-6">
            {/* Timer */}
            <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  Auction Ends In
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="text-center">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-3">
                      <div className="text-3xl font-bold text-white">
                        {value}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 capitalize">
                      {unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Bid */}
            <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Current Bid</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">250</span>
                    <span className="text-xl text-purple-400">SUI</span>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Your Bid (SUI)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-400 transition-colors"
                      min="251"
                    />
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
                      Place Bid
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Minimum bid: 251 SUI (current + 1)
                </p>
              </div>
            </div>

            {/* Bid History */}
            <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Gavel className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  Recent Bids
                </h3>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {[
                  { bidder: "0x1a2b...3c4d", amount: 250, time: "2 min ago" },
                  { bidder: "0x5e6f...7g8h", amount: 230, time: "15 min ago" },
                  { bidder: "0x9i0j...1k2l", amount: 200, time: "1 hour ago" },
                  { bidder: "0x3m4n...5o6p", amount: 150, time: "3 hours ago" },
                ].map((bid, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full" />
                      <div>
                        <div className="text-sm text-white font-mono">
                          {bid.bidder}
                        </div>
                        <div className="text-xs text-gray-500">{bid.time}</div>
                      </div>
                    </div>
                    <div className="text-white font-semibold">
                      {bid.amount} SUI
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
