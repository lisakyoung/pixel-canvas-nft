module pixel_canvas::auction {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::option::{Self, Option};

    // ===== Error codes =====
    const EAuctionEnded: u64 = 1;
    const EBidTooLow: u64 = 2;
    const EAuctionNotEnded: u64 = 3;
    
    // ===== Structs =====
    
    /// Auction object for NFT
    struct Auction has key {
        id: UID,
        nft_id: ID,
        seller: address,
        start_price: u64,
        current_bid: u64,
        highest_bidder: Option<address>,
        end_time: u64,
        ended: bool,
    }

    /// Bid receipt for bidders
    struct BidReceipt has key, store {
        id: UID,
        auction_id: ID,
        bidder: address,
        amount: u64,
    }

    // ===== Events =====
    
    struct AuctionCreated has copy, drop {
        auction_id: ID,
        nft_id: ID,
        start_price: u64,
        end_time: u64,
    }

    struct BidPlaced has copy, drop {
        auction_id: ID,
        bidder: address,
        amount: u64,
    }

    struct AuctionEnded has copy, drop {
        auction_id: ID,
        winner: address,
        final_price: u64,
    }

    // ===== Public Functions =====

    /// Create a new auction
    public fun create_auction(
        nft_id: ID,
        start_price: u64,
        duration_ms: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        let end_time = current_time + duration_ms;

        let auction = Auction {
            id: object::new(ctx),
            nft_id,
            seller: tx_context::sender(ctx),
            start_price,
            current_bid: 0,
            highest_bidder: option::none(),
            end_time,
            ended: false,
        };

        event::emit(AuctionCreated {
            auction_id: object::id(&auction),
            nft_id,
            start_price,
            end_time,
        });

        transfer::share_object(auction);
    }

    /// Place a bid
    public fun place_bid(
        auction: &mut Auction,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ): BidReceipt {
        let current_time = clock::timestamp_ms(clock);
        let bid_amount = coin::value(&payment);
        
        // Check auction hasn't ended
        assert!(current_time < auction.end_time, EAuctionEnded);
        assert!(!auction.ended, EAuctionEnded);
        
        // Check bid is high enough
        let min_bid = if (auction.current_bid == 0) {
            auction.start_price
        } else {
            auction.current_bid + (auction.current_bid / 10) // 10% increment
        };
        assert!(bid_amount >= min_bid, EBidTooLow);
        
        // Store payment for now (will handle refunds separately)
        transfer::public_transfer(payment, @pixel_canvas);
        
        // Update auction state
        let bidder = tx_context::sender(ctx);
        auction.current_bid = bid_amount;
        auction.highest_bidder = option::some(bidder);
        
        event::emit(BidPlaced {
            auction_id: object::id(auction),
            bidder,
            amount: bid_amount,
        });

        // Create bid receipt
        BidReceipt {
            id: object::new(ctx),
            auction_id: object::id(auction),
            bidder,
            amount: bid_amount,
        }
    }

    /// End auction and get winner
    public fun end_auction(
        auction: &mut Auction,
        clock: &Clock,
    ): Option<address> {
        let current_time = clock::timestamp_ms(clock);
        
        // Check auction can be ended
        assert!(current_time >= auction.end_time, EAuctionNotEnded);
        assert!(!auction.ended, EAuctionEnded);
        
        auction.ended = true;
        
        if (option::is_some(&auction.highest_bidder)) {
            let winner = *option::borrow(&auction.highest_bidder);
            
            event::emit(AuctionEnded {
                auction_id: object::id(auction),
                winner,
                final_price: auction.current_bid,
            });
            
            option::some(winner)
        } else {
            option::none()
        }
    }
}