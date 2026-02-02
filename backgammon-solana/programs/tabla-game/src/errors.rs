use anchor_lang::prelude::*;

#[error_code]
pub enum TablaError {
    #[msg("Not your turn to play")]
    NotYourTurn,
   
    #[msg("Dice must be rolled before making a move")]
    DiceNotRolled,
   
    #[msg("Invalid move according to game rules")]
    InvalidMove,
   
    #[msg("Game has already ended")]
    GameEnded,
   
    #[msg("Tournament is full")]
    TournamentFull,
   
    #[msg("Tournament has already started")]
    TournamentStarted,
   
    #[msg("Insufficient balance for stake")]
    InsufficientFunds,
   
    #[msg("Only the winner can claim winnings")]
    NotWinner,
   
    #[msg("Invalid dice roll value")]
    InvalidDiceRoll,
}
