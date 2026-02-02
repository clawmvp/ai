use anchor_lang::prelude::*;
use crate::{RollDice, errors::TablaError};

pub fn handler(ctx: Context<RollDice>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player = &ctx.accounts.player;
    
    // Validate it's the player's turn
    require!(
        game.current_turn == player.key(),
        TablaError::NotYourTurn
    );
    
    // Check game hasn't ended
    require!(
        game.winner.is_none(),
        TablaError::GameEnded
    );
    
    // Dice must not already be rolled this turn
    require!(
        !game.dice_rolled,
        TablaError::InvalidDiceRoll
    );
    
    // TODO: Integrate with Switchboard VRF for true randomness
    // For MVP, using pseudo-random based on recent blockhash + clock
    // In production, MUST use Switchboard VRF or Pyth randomness
    
    let clock = Clock::get()?;
    let recent_blockhash = ctx.accounts.vrf.key();
    
    // Simple pseudo-random (NOT cryptographically secure - placeholder for VRF)
    let seed = recent_blockhash.to_bytes();
    let timestamp_bytes = clock.unix_timestamp.to_le_bytes();
    
    let mut combined = [0u8; 40];
    combined[..32].copy_from_slice(&seed);
    combined[32..].copy_from_slice(&timestamp_bytes);
    
    let hash = solana_program::hash::hash(&combined);
    
    game.dice1 = ((hash.to_bytes()[0] % 6) + 1) as u8;
    game.dice2 = ((hash.to_bytes()[1] % 6) + 1) as u8;
    game.dice_rolled = true;
    
    msg!("Dice rolled: {} and {}", game.dice1, game.dice2);
    
    Ok(())
}
