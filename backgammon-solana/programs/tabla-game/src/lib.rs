use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;
use state::*;

declare_id!("TabLa1111111111111111111111111111111111111");

#[program]
pub mod tabla_game {
    use super::*;

    /// Initialize a new backgammon game between two players
    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        stake_amount: u64,
    ) -> Result<()> {
        instructions::initialize_game::handler(ctx, stake_amount)
    }

    /// Make a move in the game
    pub fn make_move(
        ctx: Context<MakeMove>,
        from_position: u8,
        to_position: u8,
    ) -> Result<()> {
        instructions::make_move::handler(ctx, from_position, to_position)
    }

    /// Roll dice using VRF randomness
    pub fn roll_dice(ctx: Context<RollDice>) -> Result<()> {
        instructions::roll_dice::handler(ctx)
    }

    /// Claim winnings after game completion
    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        instructions::claim_winnings::handler(ctx)
    }

    /// Create a new tournament
    pub fn create_tournament(
        ctx: Context<CreateTournament>,
        entry_fee: u64,
        max_participants: u8,
    ) -> Result<()> {
        instructions::create_tournament::handler(ctx, entry_fee, max_participants)
    }

    /// Register for a tournament
    pub fn register_tournament(ctx: Context<RegisterTournament>) -> Result<()> {
        instructions::register_tournament::handler(ctx)
    }

    /// Mint custom board NFT
    pub fn mint_board_nft(
        ctx: Context<MintBoardNFT>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::mint_board_nft::handler(ctx, name, symbol, uri)
    }
}

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = player_one,
        space = 8 + GameState::INIT_SPACE,
        seeds = [b"game", player_one.key().as_ref(), player_two.key().as_ref()],
        bump
    )]
    pub game: Account<'info, GameState>,
    
    #[account(mut)]
    pub player_one: Signer<'info>,
    
    /// CHECK: Player two doesn't sign, verified by address
    pub player_two: UncheckedAccount<'info>,
    
    #[account(
        init,
        payer = player_one,
        space = 8 + 8,
        seeds = [b"escrow", game.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakeMove<'info> {
    #[account(mut)]
    pub game: Account<'info, GameState>,
    
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct RollDice<'info> {
    #[account(mut)]
    pub game: Account<'info, GameState>,
    
    pub player: Signer<'info>,
    
    /// CHECK: Switchboard VRF account
    pub vrf: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub game: Account<'info, GameState>,
    
    #[account(mut)]
    pub winner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"escrow", game.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    /// CHECK: Platform fee recipient
    #[account(mut)]
    pub platform_wallet: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTournament<'info> {
    #[account(
        init,
        payer = organizer,
        space = 8 + Tournament::INIT_SPACE,
        seeds = [b"tournament", organizer.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub tournament: Account<'info, Tournament>,
    
    #[account(mut)]
    pub organizer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterTournament<'info> {
    #[account(mut)]
    pub tournament: Account<'info, Tournament>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintBoardNFT<'info> {
    #[account(mut)]
    pub mint: Signer<'info>,
    
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// CHECK: Token program
    pub token_program: AccountInfo<'info>,
    
    /// CHECK: Metadata program
    pub token_metadata_program: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
    
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct Escrow {
    pub amount: u64,
}
