// src/errors.rs
use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TokenError {
    // Errores de inicialización
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidDecimals = 3,
    InvalidMetadata = 4,
    
    // Errores de autorización
    Unauthorized = 10,
    
    // Errores de operaciones
    InvalidAmount = 20,
    InsufficientBalance = 21,
    InsufficientAllowance = 22,
    InvalidRecipient = 23,
    OverflowError = 24,
}