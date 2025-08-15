"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Palette, Users, Trophy, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="w-[40rem] h-[40rem] bg-purple-500 rounded-full blur-[128px] opacity-20" />
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-7xl font-bold mb-6">
              <span className="block text-white">Collaborative</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Pixel Art NFTs
              </span>
              <span className="block text-white">on Sui</span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Create pixel art together. Every pixel counts. Share the rewards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/canvas">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auction">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-lg rounded-xl backdrop-blur-sm"
                >
                  View Auctions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Join the community in creating unique pixel art masterpieces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Palette className="h-8 w-8" />,
                title: "Paint Pixels",
                description:
                  "Choose your color and paint pixels on the shared canvas",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Collaborate",
                description:
                  "Work together with others to complete the artwork",
              },
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Mint NFT",
                description: "Completed artworks become unique NFTs on Sui",
              },
              {
                icon: <Trophy className="h-8 w-8" />,
                title: "Share Rewards",
                description:
                  "Auction proceeds distributed based on contributions",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-purple-500/40"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: "100×100", label: "Canvas Size" },
              { value: "0.001 SUI", label: "Per Pixel" },
              { value: "100%", label: "Revenue Shared" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Create?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Connect your wallet and start painting pixels now
          </p>
          <Link href="/canvas">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-6 text-lg rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              Launch Canvas
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
