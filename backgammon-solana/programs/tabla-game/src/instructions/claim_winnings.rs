use anchor_lang::prelude::*;
use crate::{ClaimWinnings, errors::TablaError};

const PLATFORM_FEE_BPS: u64 = 500; // 5% = 500 basis points

pub fn handler(ctx: Context<ClaimWinnings>) -> Result<()> {
    let game = &ctx.accounts.game;
    let escrow = &ctx.accounts.escrow;
    
    // Verify game has ended with a winner
    require!(
        game.winner.is_some(),
        TablaError::GameEnded
    );
    
    let winner_key = game.winner.unwrap();
    
    // Verify signer is the winner
    require!(
        winner_key == ctx.accounts.winner.key(),
        TablaError::NotWinner
    );
    
    // Calculate payouts
    let total_pot = escrow.amount * 2;  // Both players staked
    let platform_fee = (total_pot * PLATFORM_FEE_BPS) / 10000;
    let winner_payout = total_pot - platform_fee;
    
    // Transfer to winner
    **escrow.to_account_info().try_borrow_mut_lamports()? -= winner_payout;
    **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += winner_payout;
    
    // Transfer platform fee
    **escrow.to_account_info().try_borrow_mut_lamports()? -= platform_fee;
    **ctx.accounts.platform_wallet.to_account_info().try_borrow_mut_lamports()? += platform_fee;
    
    msg!("Winnings claimed: {} lamports to winner, {} lamports platform fee", 
         winner_payout, platform_fee);
    
    Ok(())
}
