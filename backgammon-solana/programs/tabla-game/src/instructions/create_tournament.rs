use anchor_lang::prelude::*;
use crate::CreateTournament;

pub fn handler(ctx: Context<CreateTournament>, entry_fee: u64, max_participants: u8) -> Result<()> {
    let tournament = &mut ctx.accounts.tournament;
    
    tournament.organizer = ctx.accounts.organizer.key();
    tournament.entry_fee = entry_fee;
    tournament.max_participants = max_participants;
    tournament.participants = Vec::new();
    tournament.prize_pool = 0;
    tournament.started = false;
    tournament.completed = false;
    tournament.created_at = Clock::get()?.unix_timestamp;
    tournament.bump = ctx.bumps.tournament;
    
    msg!("Tournament created with entry fee: {} lamports, max participants: {}", 
         entry_fee, max_participants);
    
    Ok(())
}
