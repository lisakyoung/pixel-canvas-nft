"use client";

import { ConnectButton } from "@mysten/wallet-kit";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Pixel Canvas NFT
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/canvas"
                className={`hover:text-primary ${pathname === "/canvas" ? "text-primary" : ""}`}
              >
                Canvas
              </Link>
              <Link
                href="/auction"
                className={`hover:text-primary ${pathname === "/auction" ? "text-primary" : ""}`}
              >
                Auction
              </Link>
              <Link
                href="/profile"
                className={`hover:text-primary ${pathname === "/profile" ? "text-primary" : ""}`}
              >
                Profile
              </Link>
            </nav>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
