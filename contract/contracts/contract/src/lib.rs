// ===============================
// Soroban Smart Contract (Rust)
// NFT Rental Platform (Basic)
// ===============================

#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Map};

#[derive(Clone)]
#[contract]
pub struct NFTRentalContract;

#[contractimpl]
impl NFTRentalContract {

    // List NFT for rent
    pub fn list_nft(env: Env, owner: Address, nft_id: Symbol, price_per_day: i128) {
        owner.require_auth();

        let mut rentals: Map<Symbol, (Address, i128, bool)> = env
            .storage()
            .instance()
            .get(&symbol_short!("rentals"))
            .unwrap_or(Map::new(&env));

        rentals.set(nft_id.clone(), (owner, price_per_day, false));

        env.storage().instance().set(&symbol_short!("rentals"), &rentals);
    }

    // Rent NFT
    pub fn rent_nft(env: Env, renter: Address, nft_id: Symbol, days: i128) {
        renter.require_auth();

        let mut rentals: Map<Symbol, (Address, i128, bool)> = env
            .storage()
            .instance()
            .get(&symbol_short!("rentals"))
            .unwrap();

        let (owner, price, is_rented) = rentals.get(nft_id.clone()).unwrap();

        if is_rented {
            panic!("Already rented");
        }

        let total_price = price * days;

        // NOTE: Payment logic should be added here (token transfer)

        rentals.set(nft_id.clone(), (owner, price, true));

        env.storage().instance().set(&symbol_short!("rentals"), &rentals);
    }

    // Return NFT
    pub fn return_nft(env: Env, nft_id: Symbol) {
        let mut rentals: Map<Symbol, (Address, i128, bool)> = env
            .storage()
            .instance()
            .get(&symbol_short!("rentals"))
            .unwrap();

        let (owner, price, _) = rentals.get(nft_id.clone()).unwrap();

        rentals.set(nft_id.clone(), (owner, price, false));

        env.storage().instance().set(&symbol_short!("rentals"), &rentals);
    }

    // View NFT status
    pub fn get_status(env: Env, nft_id: Symbol) -> (Address, i128, bool) {
        let rentals: Map<Symbol, (Address, i128, bool)> = env
            .storage()
            .instance()
            .get(&symbol_short!("rentals"))
            .unwrap();

        rentals.get(nft_id).unwrap()
    }
}


