// src/test.rs
#![cfg(test)]

use crate::{TokenBDB, TokenBDBClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let name = String::from_str(&env, "Buen Dia Builders Token");
    let symbol = String::from_str(&env, "BDB");
    
    client.initialize(&admin, &name, &symbol, &7);
    
    // Verificar que se inicializó correctamente
    assert_eq!(client.name(), name);
    assert_eq!(client.symbol(), symbol);
    assert_eq!(client.decimals(), 7);
    assert_eq!(client.total_supply(), 0);
    assert_eq!(client.admin(), admin);
}

#[test]
fn test_initialize_twice() {
    let env = Env::default();
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    
    // Intentar inicializar de nuevo debe fallar
    let result = client.try_initialize(&admin, &name, &symbol, &7);
    assert!(result.is_err());
}

#[test]
fn test_initialize_invalid_decimals() {
    let env = Env::default();
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    // Decimales > 18 debe fallar
    let result = client.try_initialize(&admin, &name, &symbol, &19);
    assert!(result.is_err());
}

#[test]
fn test_initialize_empty_name() {
    let env = Env::default();
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let name = String::from_str(&env, "");
    let symbol = String::from_str(&env, "TKN");
    
    let result = client.try_initialize(&admin, &name, &symbol, &7);
    assert!(result.is_err());
}

#[test]
fn test_mint() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    
    // Mintear 1000 tokens
    client.mint(&user, &1000);
    
    assert_eq!(client.balance(&user), 1000);
    assert_eq!(client.total_supply(), 1000);
}

#[test]
fn test_mint_not_initialized() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let user = Address::generate(&env);
    
    // Intentar mintear sin inicializar debe fallar
    let result = client.try_mint(&user, &1000);
    assert!(result.is_err());
}

#[test]
fn test_mint_zero_amount() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    
    // Mintear 0 debe fallar
    let result = client.try_mint(&user, &0);
    assert!(result.is_err());
}

#[test]
fn test_transfer() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    client.mint(&alice, &1000);
    
    // Transferir de Alice a Bob
    client.transfer(&alice, &bob, &300);
    
    assert_eq!(client.balance(&alice), 700);
    assert_eq!(client.balance(&bob), 300);
    assert_eq!(client.total_supply(), 1000);
}

#[test]
fn test_transfer_insufficient_balance() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    client.mint(&alice, &100);
    
    // Intentar transferir más de lo que tiene
    let result = client.try_transfer(&alice, &bob, &500);
    assert!(result.is_err());
}

#[test]
fn test_transfer_to_self() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    client.mint(&alice, &1000);
    
    // Transferir a sí mismo debe fallar
    let result = client.try_transfer(&alice, &alice, &100);
    assert!(result.is_err());
}

#[test]
fn test_burn() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    client.mint(&alice, &1000);
    
    // Quemar 300 tokens
    client.burn(&alice, &300);
    
    assert_eq!(client.balance(&alice), 700);
    assert_eq!(client.total_supply(), 700);
}

#[test]
fn test_burn_insufficient_balance() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    client.mint(&alice, &100);
    
    // Intentar quemar más de lo que tiene
    let result = client.try_burn(&alice, &500);
    assert!(result.is_err());
}

#[test]
fn test_approve_and_allowance() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    client.mint(&alice, &1000);
    
    // Alice aprueba a Bob para gastar 500
    client.approve(&alice, &bob, &500);
    
    assert_eq!(client.allowance(&alice, &bob), 500);
}

#[test]
fn test_transfer_from() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let charlie = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    client.mint(&alice, &1000);
    
    // Alice aprueba a Bob para gastar 500
    client.approve(&alice, &bob, &500);
    
    // Bob transfiere 300 de Alice a Charlie
    client.transfer_from(&bob, &alice, &charlie, &300);
    
    assert_eq!(client.balance(&alice), 700);
    assert_eq!(client.balance(&charlie), 300);
    assert_eq!(client.allowance(&alice, &bob), 200); // 500 - 300
}

#[test]
fn test_transfer_from_insufficient_allowance() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let charlie = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    client.mint(&alice, &1000);
    
    // Alice aprueba a Bob para gastar 100
    client.approve(&alice, &bob, &100);
    
    // Bob intenta transferir 500 (más de lo permitido)
    let result = client.try_transfer_from(&bob, &alice, &charlie, &500);
    assert!(result.is_err());
}

#[test]
fn test_revoke_approval() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    client.mint(&alice, &1000);
    
    // Alice aprueba a Bob
    client.approve(&alice, &bob, &500);
    assert_eq!(client.allowance(&alice, &bob), 500);
    
    // Alice revoca la aprobación (approve con 0)
    client.approve(&alice, &bob, &0);
    assert_eq!(client.allowance(&alice, &bob), 0);
}

#[test]
fn test_balance_of_nonexistent_account() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let nobody = Address::generate(&env);
    let name = String::from_str(&env, "Token");
    let symbol = String::from_str(&env, "TKN");
    
    client.initialize(&admin, &name, &symbol, &7);
    
    // Balance de cuenta que nunca recibió tokens debe ser 0
    assert_eq!(client.balance(&nobody), 0);
}

#[test]
fn test_getters_before_initialization() {
    let env = Env::default();
    let contract_id = env.register(TokenBDB, ());
    let client = TokenBDBClient::new(&env, &contract_id);
    
    // Los getters deben devolver valores por defecto antes de inicializar
    assert_eq!(client.name(), String::from_str(&env, ""));
    assert_eq!(client.symbol(), String::from_str(&env, ""));
    assert_eq!(client.decimals(), 0);
    assert_eq!(client.total_supply(), 0);
}