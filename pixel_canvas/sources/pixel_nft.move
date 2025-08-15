module pixel_canvas::pixel_nft {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};
    use std::string::String;
    use sui::event;
    use pixel_canvas::canvas::{Self, Canvas, CanvasAdminCap};

    // ===== Error codes =====
    const ECanvasNotCompleted: u64 = 1;

    // ===== Structs =====
    
    /// The NFT representing the completed pixel art
    struct PixelArtNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: Url,
        canvas_id: ID,
        total_pixels: u64,
        creators_count: u64,
    }

    // ===== Events =====
    
    struct NFTMinted has copy, drop {
        nft_id: ID,
        canvas_id: ID,
    }

    // ===== Public Functions =====

    /// Mint NFT from completed canvas
    public fun mint_from_canvas(
        canvas: &Canvas,
        _admin_cap: &CanvasAdminCap,
        name: String,
        description: String,
        image_url: vector<u8>,
        creators_count: u64,
        ctx: &mut TxContext
    ): PixelArtNFT {
        // Verify canvas is completed
        assert!(canvas::is_completed(canvas), ECanvasNotCompleted);
        
        // Create NFT
        let nft = PixelArtNFT {
            id: object::new(ctx),
            name,
            description,
            image_url: url::new_unsafe_from_bytes(image_url),
            canvas_id: object::id(canvas),
            total_pixels: canvas::get_painted_count(canvas),
            creators_count,
        };

        // Emit minting event
        event::emit(NFTMinted {
            nft_id: object::id(&nft),
            canvas_id: object::id(canvas),
        });

        nft
    }
}