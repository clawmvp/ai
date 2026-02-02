use anchor_lang::prelude::*;
use crate::{RegisterTournament, errors::TablaError};

pub fn handler(ctx: Context<RegisterTournament>) -> Result<()> {
    let tournament = &mut ctx.accounts.tournament;
    let player = &ctx.accounts.player;
    
    // Check tournament not full or started
    require!(
        !tournament.is_full(),
        TablaError::TournamentFull
    );
    
    require!(
        !tournament.started,
        TablaError::TournamentStarted
    );
    
    // Check player not already registered
    require!(
        !tournament.participants.contains(&player.key()),
        TablaError::TournamentStarted  // Reusing error, should add specific one
    );
    
    // Transfer entry fee
    if tournament.entry_fee > 0 {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: player.to_account_info(),
                to: tournament.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, tournament.entry_fee)?;
        tournament.prize_pool += tournament.entry_fee;
    }
    
    // Add player to participants
    tournament.participants.push(player.key());
    
    msg!("Player {} registered for tournament. Total participants: {}", 
         player.key(), tournament.participants.len());
    
    Ok(())
}
