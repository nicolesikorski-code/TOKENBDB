use soroban_sdk::{Address, String, Symbol, symbol_short};

/// Claves para el storage del contrato
/// 
/// Usamos símbolos para las claves de storage
pub struct DataKey;

impl DataKey {
    pub const INITIALIZED: Symbol = symbol_short!("INIT");
    pub const ADMIN: Symbol = symbol_short!("ADMIN");
    pub const TOKEN_NAME: Symbol = symbol_short!("NAME");
    pub const TOKEN_SYMBOL: Symbol = symbol_short!("SYMBOL");
    pub const DECIMALS: Symbol = symbol_short!("DECIMALS");
    pub const TOTAL_SUP: Symbol = symbol_short!("TOTAL_SUP");
    
    pub fn balance(account: Address) -> Symbol {
        symbol_short!("BALANCE")
    }
    
    pub fn allowance(from: Address, spender: Address) -> Symbol {
        symbol_short!("ALLOWANCE")
    }
}

/// Estructura para metadatos del token
/// 
/// Se usa en eventos para proporcionar información completa
/// sobre el token cuando se inicializa
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
}
