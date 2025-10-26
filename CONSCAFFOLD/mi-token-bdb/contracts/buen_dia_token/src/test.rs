use soroban_sdk::{Address, Env, String};

use crate::{TokenBDB, TokenTrait};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TokenBDB);
    let client = TokenBDBClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let name = String::from_str(&env, "Buen Dia Token");
    let symbol = String::from_str(&env, "BDB");
    let decimals = 7u32;

    client.initialize(&admin, &name, &symbol, &decimals);
    
    assert_eq!(client.name(), name);
    assert_eq!(client.symbol(), symbol);
    assert_eq!(client.decimals(), decimals);
    assert_eq!(client.total_supply(), 0);
    assert_eq!(client.admin(), admin);
}

#[test]
fn test_mint() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TokenBDB);
    let client = TokenBDBClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let name = String::from_str(&env, "Buen Dia Token");
    let symbol = String::from_str(&env, "BDB");
    let decimals = 7u32;

    // Initialize
    client.initialize(&admin, &name, &symbol, &decimals);
    
    // Mint tokens
    let amount = 1000i128;
    client.mint(&admin, &user, &amount);
    
    assert_eq!(client.balance(&user), amount);
    assert_eq!(client.total_supply(), amount);
}
