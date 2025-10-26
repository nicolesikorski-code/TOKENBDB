use soroban_sdk::{contracterror, Symbol};

/// Errores personalizados del contrato Token BDB
/// 
/// Usamos #[contracterror] para generar automáticamente
/// los códigos de error y la serialización XDR
#[contracterror]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TokenError {
    /// El contrato ya fue inicializado
    AlreadyInitialized = 1,
    
    /// El contrato no ha sido inicializado
    NotInitialized = 2,
    
    /// Cantidad inválida (negativa o cero cuando no se permite)
    InvalidAmount = 3,
    
    /// Balance insuficiente para la operación
    InsufficientBalance = 4,
    
    /// Allowance insuficiente para transfer_from
    InsufficientAllowance = 5,
    
    /// Número de decimales inválido (más de 18)
    InvalidDecimals = 6,
    
    /// Metadatos inválidos (name o symbol vacíos o muy largos)
    InvalidMetadata = 7,
    
    /// Destinatario inválido (no se puede transferir a sí mismo)
    InvalidRecipient = 8,
    
    /// Error de overflow en operaciones aritméticas
    OverflowError = 9,
    
    /// Error de autorización (no es admin o no tiene permisos)
    Unauthorized = 10,
}
