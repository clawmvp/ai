use anchor_lang::prelude::*;
use crate::{MakeMove, errors::TablaError};

pub fn handler(ctx: Context<MakeMove>, from_position: u8, to_position: u8) -> Result<()> {
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
    
    // Must roll dice first
    require!(
        game.dice_rolled,
        TablaError::DiceNotRolled
    );
    
    // Validate the move
    require!(
        game.is_valid_move(from_position, to_position, &player.key()),
        TablaError::InvalidMove
    );
    
    // Execute the move
    game.execute_move(from_position, to_position, &player.key());
    
    // Check for winner
    if let Some(winner) = game.check_winner() {
        game.winner = Some(winner);
        game.game_ended = Some(Clock::get()?.unix_timestamp);
        msg!("Game won by: {}", winner);
    }
    
    // Reset dice and switch turn
    game.dice_rolled = false;
    game.current_turn = if game.current_turn == game.player_one {
        game.player_two
    } else {
        game.player_one
    };
    
    msg!("Move executed: {} -> {}", from_position, to_position);
    
    Ok(())
}
