use anchor_lang::prelude::*;
use crate::{InitializeGame, errors::TablaError};

pub fn handler(ctx: Context<InitializeGame>, stake_amount: u64) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let escrow = &mut ctx.accounts.escrow;
    
    // Initialize game state
    game.player_one = ctx.accounts.player_one.key();
    game.player_two = ctx.accounts.player_two.key();
    game.current_turn = game.player_one;  // Player one starts
    
    game.initialize_board();
    
    game.dice1 = 0;
    game.dice2 = 0;
    game.dice_rolled = false;
    
    game.player_one_off = 0;
    game.player_two_off = 0;
    
    game.winner = None;
    game.stake_amount = stake_amount;
    game.game_started = Clock::get()?.unix_timestamp;
    game.game_ended = None;
    game.bump = ctx.bumps.game;
    
    // Transfer stake to escrow
    if stake_amount > 0 {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.player_one.to_account_info(),
                to: escrow.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, stake_amount)?;
        escrow.amount = stake_amount;
    }
    
    msg!("Game initialized between {} and {}", game.player_one, game.player_two);
    msg!("Stake amount: {} lamports", stake_amount);
    
    Ok(())
}
