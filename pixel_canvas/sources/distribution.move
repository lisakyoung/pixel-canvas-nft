module pixel_canvas::distribution {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::event;
    use pixel_canvas::canvas::{Self, Canvas};

    // ===== Error codes =====
    const EAlreadyClaimed: u64 = 2;
    const ENothingToClaim: u64 = 3;

    // ===== Structs =====
    
    /// Distribution pool for auction proceeds
    struct DistributionPool has key {
        id: UID,
        canvas_id: ID,
        total_amount: u64,
        total_pixels: u64,
        claims: Table<address, bool>,
    }

    // ===== Events =====
    
    struct RewardsClaimed has copy, drop {
        pool_id: ID,
        claimer: address,
        amount: u64,
        pixels_contributed: u64,
    }

    // ===== Public Functions =====

    /// Create distribution pool from auction proceeds
    public fun create_distribution_pool(
        canvas: &Canvas,
        total_amount: u64,
        ctx: &mut TxContext
    ) {
        let pool = DistributionPool {
            id: object::new(ctx),
            canvas_id: object::id(canvas),
            total_amount,
            total_pixels: canvas::get_painted_count(canvas),
            claims: table::new(ctx),
        };

        transfer::share_object(pool);
    }

    /// Claim rewards based on contribution
    public fun claim_rewards(
        pool: &mut DistributionPool,
        canvas: &Canvas,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let claimer = tx_context::sender(ctx);
        
        // Check if already claimed
        assert!(!table::contains(&pool.claims, claimer), EAlreadyClaimed);
        
        // Get contributor's pixel count
        let pixels_contributed = canvas::get_contributor_pixels(canvas, claimer);
        assert!(pixels_contributed > 0, ENothingToClaim);
        
        // Calculate reward amount
        let reward_amount = (pool.total_amount * pixels_contributed) / pool.total_pixels;
        
        // Mark as claimed
        table::add(&mut pool.claims, claimer, true);
        
        // Transfer reward
        let reward = coin::split(payment, reward_amount, ctx);
        transfer::public_transfer(reward, claimer);
        
        event::emit(RewardsClaimed {
            pool_id: object::id(pool),
            claimer,
            amount: reward_amount,
            pixels_contributed,
        });
    }
}