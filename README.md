
# 🎨 Pixel Canvas NFT - Collaborative Art Platform on Sui

> Blockthon 2025 Submission | Collaborative pixel art NFT platform where creators share rewards

[![Sui](https://img.shields.io/badge/Sui-Blockchain-blue)](https://sui.io)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Hackathon](https://img.shields.io/badge/Blockthon-2025-purple)](https://blockthon.org)

## 🚀 Overview

Pixel Canvas NFT is a revolutionary collaborative art platform built on Sui blockchain where multiple users can contribute to creating pixel art masterpieces. When the artwork is complete, it becomes an NFT and auction proceeds are automatically distributed to contributors based on their pixel contributions.

## ✨ Features

- **🎨 Collaborative Canvas**: 100x100 pixel canvas for community art creation
- **💰 Fair Revenue Sharing**: Automatic distribution based on pixel contribution
- **🏆 NFT Minting**: Completed artworks become unique NFTs
- **⚡ Real-time Updates**: Live pixel painting with optimistic updates
- **🔒 On-chain Logic**: Fully decentralized using Sui Move smart contracts

## 🛠️ Tech Stack

- **Blockchain**: Sui Network
- **Smart Contracts**: Move Language
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Wallet Integration**: Sui Wallet Kit
- **State Management**: React Hooks + Optimistic Updates

## 📦 Project Structure
<img width="469" height="439" alt="Screenshot 2025-08-15 at 7 33 26 PM" src="https://github.com/user-attachments/assets/ccab6b25-5c82-47a4-a144-575a7b256007" />

pixel-canvas-nft/
├── pixel_canvas/ # Move smart contracts
│ ├── sources/
│ │ ├── canvas.move # Canvas & pixel management
│ │ ├── pixel_nft.move # NFT minting logic
│ │ ├── auction.move # Auction mechanism
│ │ └── distribution.move # Revenue distribution
│ └── Move.toml
│
└── pixel-canvas-frontend/ # Next.js frontend
├── src/
│ ├── app/ # App router pages
│ ├── components/ # React components
│ └── lib/ # Utilities & Sui integration
└── package.json

## 🚀 Quick Start

### Prerequisites

- Sui CLI
- Node.js 18+
- Sui Wallet

### Smart Contract Deployment

cd pixel_canvas
sui move build
sui client publish --gas-budget 100000000

### Frontend Setup

bashcd pixel-canvas-frontend
npm install
npm run dev

### 📝 Smart Contract Addresses

Package ID: 0x1a0c4327a526617b2a6d13c2f991e375957bc8120bb83c95e0bdcaa14e565463
Network: Sui Devnet

### 🎮 How to Use

Connect Wallet: Connect your Sui wallet
Paint Pixels: Select color and click on canvas pixels (0.001 SUI per pixel)
Complete Artwork: Canvas locks when all 10,000 pixels are painted
Auction: Completed NFT goes to auction
Claim Rewards: Contributors claim their share of auction proceeds

## 🏆 Blockthon 2025 Submission

This project is our submission for Blockthon 2025 sponsored by Sui.

### Judging Criteria

✅ Sui Technical Approach: Leverages Sui's object model and shared objects
✅ Idea & Impact: Novel collaborative NFT creation with fair revenue sharing
✅ Execution: Fully functional with smart contracts deployed on devnet
✅ Wow Factor: Real-time collaborative art with automatic rewards

### 👥 Team

Developer: Lisa Kyoung, JunYeong Lee, Jinyeong Mo, Kyunghoon Kim 
GitHub: @lisakyoung

### 📄 License

MIT License - see LICENSE file

### 🔗 Links

Live Demo
Sui Explorer

Built with ❤️ for Blockthon 2025
