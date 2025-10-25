// src/storage.rs
use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug)]
pub enum DataKey {
    Admin,
    TokenName,
    TokenSymbol,
    Decimals,
    TotalSupply,
    Initialized,
    Balance(Address),
    Allowance(Address, Address),
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
}