module pixel_canvas::canvas {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    // ===== Constants =====
    const CANVAS_WIDTH: u64 = 100;
    const CANVAS_HEIGHT: u64 = 100;
    const TOTAL_PIXELS: u64 = 10000; // 100x100
    
    // ===== Error codes =====
    const EInvalidPixelPosition: u64 = 1;
    const EPixelAlreadyPainted: u64 = 2;
    const ECanvasCompleted: u64 = 3;
    const EInsufficientPayment: u64 = 4;

    // ===== Structs =====
    
    /// Main canvas object - shared object that everyone can interact with
    struct Canvas has key {
        id: UID,
        pixels: Table<u64, PixelData>,
        contributors: Table<address, u64>, // address -> pixel count
        total_painted: u64,
        is_completed: bool,
        pixel_price: u64, // Price per pixel in MIST
    }

    /// Individual pixel data
    struct PixelData has store, copy, drop {
        color: u32, // RGB color as single u32
        owner: address,
        timestamp: u64,
    }

    /// Admin capability for canvas management
    struct CanvasAdminCap has key, store {
        id: UID,
        canvas_id: ID,
    }

    // ===== Events =====
    
    struct PixelPainted has copy, drop {
        canvas_id: ID,
        position: u64,
        color: u32,
        painter: address,
    }

    struct CanvasCompleted has copy, drop {
        canvas_id: ID,
        total_pixels: u64,
    }

    // ===== Public Functions =====

    /// Create a new canvas - Modified to transfer the cap instead of returning
    public fun create_canvas(pixel_price: u64, ctx: &mut TxContext) {
        let canvas = Canvas {
            id: object::new(ctx),
            pixels: table::new(ctx),
            contributors: table::new(ctx),
            total_painted: 0,
            is_completed: false,
            pixel_price,
        };

        let canvas_id = object::id(&canvas);
        
        // Make canvas a shared object
        transfer::share_object(canvas);

        // Transfer admin capability to creator
        let admin_cap = CanvasAdminCap {
            id: object::new(ctx),
            canvas_id,
        };
        
        transfer::public_transfer(admin_cap, tx_context::sender(ctx));
    }

    /// Paint a pixel on the canvas
    public fun paint_pixel(
        canvas: &mut Canvas,
        position: u64,
        color: u32,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Validate position
        assert!(position < TOTAL_PIXELS, EInvalidPixelPosition);
        
        // Check canvas not completed
        assert!(!canvas.is_completed, ECanvasCompleted);
        
        // Check if pixel already painted
        assert!(!table::contains(&canvas.pixels, position), EPixelAlreadyPainted);
        
        // Verify payment
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= canvas.pixel_price, EInsufficientPayment);
        
        // Store payment (we'll use this for distribution later)
        transfer::public_transfer(payment, @pixel_canvas);
        
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);
        
        // Create and store pixel data
        let pixel_data = PixelData {
            color,
            owner: sender,
            timestamp,
        };
        
        table::add(&mut canvas.pixels, position, pixel_data);
        
        // Update contributor count
        if (table::contains(&canvas.contributors, sender)) {
            let count = table::borrow_mut(&mut canvas.contributors, sender);
            *count = *count + 1;
        } else {
            table::add(&mut canvas.contributors, sender, 1);
        };
        
        // Update total painted
        canvas.total_painted = canvas.total_painted + 1;
        
        // Check if canvas is completed
        if (canvas.total_painted == TOTAL_PIXELS) {
            canvas.is_completed = true;
            event::emit(CanvasCompleted {
                canvas_id: object::id(canvas),
                total_pixels: TOTAL_PIXELS,
            });
        };
        
        // Emit paint event
        event::emit(PixelPainted {
            canvas_id: object::id(canvas),
            position,
            color,
            painter: sender,
        });
    }

    /// Get canvas completion status
    public fun is_completed(canvas: &Canvas): bool {
        canvas.is_completed
    }

    /// Get total painted pixels
    public fun get_painted_count(canvas: &Canvas): u64 {
        canvas.total_painted
    }

    /// Get contributor's pixel count
    public fun get_contributor_pixels(canvas: &Canvas, contributor: address): u64 {
        if (table::contains(&canvas.contributors, contributor)) {
            *table::borrow(&canvas.contributors, contributor)
        } else {
            0
        }
    }

    // ===== Test Functions =====
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        create_canvas(1000000, ctx); // 0.001 SUI per pixel for testing
    }
}