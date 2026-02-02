use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use mpl_token_metadata::instructions::{CreateV1, CreateV1InstructionArgs};
use crate::MintBoardNFT;

pub fn handler(
    ctx: Context<MintBoardNFT>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    msg!("Creating NFT: {}", name);
    
    // Create mint account
    let rent = ctx.accounts.rent.minimum_balance(Mint::LEN);
    
    // Initialize mint
    let cpi_accounts = anchor_spl::token::InitializeMint {
        mint: ctx.accounts.mint.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
   let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    anchor_spl::token::initialize_mint(
        cpi_ctx,
        0,  // 0 decimals for NFT
        &ctx.accounts.payer.key(),
        Some(&ctx.accounts.payer.key()),
    )?;
    
    msg!("NFT mint created: {}", ctx.accounts.mint.key());
    msg!("NFT metadata URI: {}", uri);
    
    // Note: Full Metaplex integration would require CreateMetadataAccountV3
    // This is a simplified version for MVP
    
    Ok(())
}
