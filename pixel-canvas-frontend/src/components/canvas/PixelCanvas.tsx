"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { toast } from "sonner";
import { paintPixel, getCanvas, suiClient } from "@/lib/sui";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  MousePointer,
  Pipette,
} from "lucide-react";

const CANVAS_SIZE = 100;
const PIXEL_SIZE = 10;
const COLORS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#FFC0CB",
  "#A52A2A",
  "#808080",
  "#FFD700",
  "#4B0082",
];

interface Pixel {
  position: number;
  color: string;
  owner?: string;
  pending?: boolean;
}

export default function PixelCanvas({ canvasId }: { canvasId?: string }) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<Map<number, Pixel>>(new Map());
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<"paint" | "eyedropper">("paint");
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [isPainting, setIsPainting] = useState(false);

  // Load canvas data
  useEffect(() => {
    if (canvasId) {
      loadCanvasData();
    }
  }, [canvasId]);

  const loadCanvasData = async () => {
    if (!canvasId) return;

    const canvas = await getCanvas(canvasId);
    if (canvas) {
      // Convert canvas data to pixel map
      const pixelMap = new Map<number, Pixel>();
      canvas.pixels.forEach((pixel) => {
        pixelMap.set(pixel.position, {
          position: pixel.position,
          color: `#${pixel.color.toString(16).padStart(6, "0")}`,
          owner: pixel.owner,
        });
      });
      setPixels(pixelMap);
      redrawCanvas();
    }
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    pixels.forEach((pixel, position) => {
      const x = (position % CANVAS_SIZE) * PIXEL_SIZE;
      const y = Math.floor(position / CANVAS_SIZE) * PIXEL_SIZE;

      ctx.fillStyle = pixel.color;
      ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);

      if (pixel.pending) {
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
      }
    });

    // Draw grid
    if (isGridVisible) {
      ctx.strokeStyle = "rgba(128, 128, 128, 0.2)";
      ctx.lineWidth = 0.5;

      for (let i = 0; i <= CANVAS_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * PIXEL_SIZE, 0);
        ctx.lineTo(i * PIXEL_SIZE, CANVAS_SIZE * PIXEL_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * PIXEL_SIZE);
        ctx.lineTo(CANVAS_SIZE * PIXEL_SIZE, i * PIXEL_SIZE);
        ctx.stroke();
      }
    }
  }, [pixels, isGridVisible]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentAccount || !canvasId) {
      toast.error("Please connect wallet first");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (PIXEL_SIZE * zoom));
    const y = Math.floor((e.clientY - rect.top) / (PIXEL_SIZE * zoom));
    const position = y * CANVAS_SIZE + x;

    if (position < 0 || position >= CANVAS_SIZE * CANVAS_SIZE) return;

    if (tool === "eyedropper") {
      const pixel = pixels.get(position);
      if (pixel) {
        setSelectedColor(pixel.color);
        setTool("paint");
      }
      return;
    }

    // Check if pixel is already painted
    if (pixels.has(position)) {
      toast.error("Pixel already painted");
      return;
    }

    // Optimistic update
    const newPixel: Pixel = {
      position,
      color: selectedColor,
      owner: currentAccount.address,
      pending: true,
    };

    setPixels((prev) => new Map(prev).set(position, newPixel));

    try {
      // Convert color to number
      const colorInt = parseInt(selectedColor.slice(1), 16);

      // Get payment coin (simplified - in production, properly handle coin selection)
      const coins = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: "0x2::sui::SUI",
      });

      if (coins.data.length === 0) {
        throw new Error("No SUI coins found");
      }

      await paintPixel(
        currentAccount,
        canvasId,
        position,
        colorInt,
        coins.data[0].coinObjectId
      );

      // Update pixel as confirmed
      setPixels((prev) => {
        const updated = new Map(prev);
        const pixel = updated.get(position);
        if (pixel) {
          pixel.pending = false;
        }
        return updated;
      });

      toast.success("Pixel painted successfully!");
    } catch (error) {
      // Revert optimistic update
      setPixels((prev) => {
        const updated = new Map(prev);
        updated.delete(position);
        return updated;
      });

      toast.error("Failed to paint pixel");
      console.error(error);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // Restore previous state
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      // Restore next state
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border">
        <h3 className="font-semibold text-sm">Tools</h3>

        <div className="flex flex-col gap-2">
          <Button
            variant={tool === "paint" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("paint")}
          >
            <MousePointer className="w-4 h-4 mr-2" />
            Paint
          </Button>

          <Button
            variant={tool === "eyedropper" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("eyedropper")}
          >
            <Pipette className="w-4 h-4 mr-2" />
            Eyedropper
          </Button>
        </div>

        {/* Color Palette */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Colors</h3>
          <div className="grid grid-cols-5 gap-1">
            {COLORS.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  selectedColor === color
                    ? "border-primary scale-110"
                    : "border-transparent hover:border-gray-400"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>

          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">View</h3>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              variant={isGridVisible ? "default" : "outline"}
              size="icon"
              onClick={() => setIsGridVisible(!isGridVisible)}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* History */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo2 className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="relative overflow-auto border-2 border-border rounded-lg bg-white dark:bg-gray-950"
          style={{ maxWidth: "100%", maxHeight: "80vh" }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE * PIXEL_SIZE}
            height={CANVAS_SIZE * PIXEL_SIZE}
            className="cursor-crosshair"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              imageRendering: "pixelated",
            }}
            onClick={handleCanvasClick}
            onMouseMove={(e) => {
              if (isPainting && e.buttons === 1) {
                handleCanvasClick(e);
              }
            }}
            onMouseDown={() => setIsPainting(true)}
            onMouseUp={() => setIsPainting(false)}
            onMouseLeave={() => setIsPainting(false)}
          />
        </div>
      </div>

      {/* Info Panel */}
      <div className="w-64 space-y-4">
        <div className="p-4 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">Canvas Info</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size:</span>
              <span>
                {CANVAS_SIZE}x{CANVAS_SIZE}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Painted:</span>
              <span>
                {pixels.size} / {CANVAS_SIZE * CANVAS_SIZE}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Progress:</span>
              <span>
                {Math.round((pixels.size / (CANVAS_SIZE * CANVAS_SIZE)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {currentAccount && (
          <div className="p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Your Stats</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pixels:</span>
                <span>
                  {
                    Array.from(pixels.values()).filter(
                      (p) => p.owner === currentAccount.address
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contribution:</span>
                <span>
                  {Math.round(
                    (Array.from(pixels.values()).filter(
                      (p) => p.owner === currentAccount.address
                    ).length /
                      Math.max(1, pixels.size)) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
