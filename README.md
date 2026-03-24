# NFT-Rental-Platform
// ===============================
// README.md
// ===============================

/*
# NFT Rental Platform on Stellar (Soroban)

## Project Description
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f66f5c66-3d95-40ba-bf5b-fa37904e8422" />


This project is a basic implementation of an NFT Rental Platform built using Soroban smart contracts on the Stellar blockchain. It allows NFT owners to list their NFTs for rent and enables users to rent them for a specific duration.

## What it does
- NFT owners can list their NFTs with a rental price per day.
- Users can rent listed NFTs for a chosen number of days.
- The contract tracks rental status (available or rented).
- NFTs can be returned after rental.

## Features
- Simple NFT listing system
- Rental mechanism with duration-based pricing
- On-chain storage of rental state
- Ownership authentication using Stellar addresses
- View function to check NFT rental status

## Deployed Smart Contract Link
https://stellar.expert/explorer/testnet/contract/CCQUCNHL3VZJ2PFPNLZOT6LS5TEC32E2XY4I2RT6PJ7JGZCD7QNO4X4Q

## Future Improvements (Important)
- Integrate token payments (XLM or custom tokens)
- Add rental expiry using timestamps
- Prevent unauthorized returns
- Support multiple NFTs per owner with metadata
- Add escrow mechanism
- UI frontend (React + Stellar SDK)

## Tech Stack
- Soroban (Stellar Smart Contracts)
- Rust

## How to Run
1. Install Stellar CLI & Soroban SDK
2. Build contract:
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```
3. Deploy using Stellar CLI


This is a basic prototype and not production-ready. Security checks, payment logic, and time-based rental enforcement are required for real-world use.
*/
