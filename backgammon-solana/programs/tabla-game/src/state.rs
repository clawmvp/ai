use anchor_lang::prelude::*;

/// Main game state for backgammon
#[account]
#[derive(InitSpace)]
pub struct GameState {
    pub player_one: Pubkey,
    pub player_two: Pubkey,
    
    pub current_turn: Pubkey,
    
    /// Board state: 24 points + 2 bars + 2 off positions = 28 positions
    /// Each position stores count of checkers (positive = player 1, negative = player 2)
    #[max_len(28)]
    pub board: Vec<i8>,
    
    pub dice1: u8,
    pub dice2: u8,
    pub dice_rolled: bool,
    
    pub player_one_off: u8,  // Number of checkers off the board
    pub player_two_off: u8,
    
    pub winner: Option<Pubkey>,
    pub stake_amount: u64,
    
    pub game_started: i64,
    pub game_ended: Option<i64>,
    
    pub bump: u8,
}

impl GameState {
    /// Initialize a new backgammon board with standard starting positions
    pub fn initialize_board(&mut self) {
        self.board = vec![0; 28];
       
        // Standard backgammon starting position
        // Positions 0-23 are the points, 24-25 are bars, 26-27 are off
       
        // Player 1 (positive numbers)
        self.board[0] = 2;   // 2 checkers on point 1
        self.board[11] = 5;  // 5 checkers on point 12
        self.board[16] = 3;  // 3 checkers on point 17
        self.board[18] = 5;  // 5 checkers on point 19
       
        // Player 2 (negative numbers)
        self.board[23] = -2;  // 2 checkers on point 24
        self.board[12] = -5;  // 5 checkers on point 13
        self.board[7] = -3;   // 3 checkers on point 8
        self.board[5] = -5;   // 5 checkers on point 6
    }
   
    /// Validate if a move is legal
    pub fn is_valid_move(&self, from: u8, to: u8, player: &Pubkey) -> bool {
        let from_idx = from as usize;
        let to_idx = to as usize;
       
        if from_idx >= 28 || to_idx >= 28 {
            return false;
        }
       
        let is_player_one = player == &self.player_one;
        let board_position = self.board[from_idx];
       
        // Check if there's a checker at the from position belonging to the player
        if is_player_one && board_position <= 0 {
            return false;
        }
        if !is_player_one && board_position >= 0 {
            return false;
        }
       
        // Check if the destination allows the move (not blocked by opponent)
        let dest_position = self.board[to_idx];
        if is_player_one && dest_position < -1 {
            return false;  // Blocked by 2+ opponent checkers
        }
        if !is_player_one && dest_position > 1 {
            return false;
        }
       
        true
    }
   
    /// Execute a move
    pub fn execute_move(&mut self, from: u8, to: u8, player: &Pubkey) {
        let from_idx = from as usize;
        let to_idx = to as usize;
        let is_player_one = player == &self.player_one;
       
        // Remove checker from source
        if is_player_one {
            self.board[from_idx] -= 1;
            self.board[to_idx] += 1;
           
            // Check if hitting opponent's blot
            if self.board[to_idx] == 0 {
                self.board[24] -= 1;  // Send to player 2's bar
            }
        } else {
            self.board[from_idx] += 1;
            self.board[to_idx] -= 1;
           
            if self.board[to_idx] == 0 {
                self.board[25] += 1;  // Send to player 1's bar
            }
        }
    }
   
    /// Check if player has won
    pub fn check_winner(&self) -> Option<Pubkey> {
        if self.player_one_off == 15 {
            Some(self.player_one)
        } else if self.player_two_off == 15 {
            Some(self.player_two)
        } else {
            None
        }
    }
}

/// Tournament state
#[account]
#[derive(InitSpace)]
pub struct Tournament {
    pub organizer: Pubkey,
    pub entry_fee: u64,
    pub max_participants: u8,
    
    #[max_len(64)]
    pub participants: Vec<Pubkey>,
    
    pub prize_pool: u64,
    pub started: bool,
    pub completed: bool,
    
    pub created_at: i64,
    pub bump: u8,
}

impl Tournament {
    pub fn can_start(&self) -> bool {
        self.participants.len() >= 2 && !self.started
    }
   
    pub fn is_full(&self) -> bool {
        self.participants.len() >= self.max_participants as usize
    }
}

/// Player rating for matchmaking
#[account]
#[derive(InitSpace)]
pub struct PlayerRating {
    pub player: Pubkey,
    pub elo_rating: u16,
    pub games_played: u32,
    pub games_won: u32,
    pub total_winnings: u64,
}

impl PlayerRating {
    pub const INITIAL_RATING: u16 = 1200;
   
    pub fn win_rate(&self) -> f32 {
        if self.games_played == 0 {
            0.0
        } else {
            self.games_won as f32 / self.games_played as f32
        }
    }
}
