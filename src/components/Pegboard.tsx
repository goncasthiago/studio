'use client';

import type { BeadPosition } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';

type PegboardProps = {
  rows: number;
  cols: number;
  beads: BeadPosition[];
  isInteractive: boolean;
  onPegClick?: (row: number, col: number) => void;
  overlayImage?: string;
  overlayScale?: number;
  overlayX?: number;
  overlayY?: number;
  className?: string;
  isPickerMode?: boolean;
};

export default function Pegboard({
  rows,
  cols,
  beads,
  isInteractive,
  onPegClick,
  overlayImage,
  overlayScale = 1,
  overlayX = 0,
  overlayY = 0,
  className,
  isPickerMode = false,
}: PegboardProps) {
  // Memoize the grid calculation to prevent re-computing on every render
  const grid = React.useMemo(() => {
    const newGrid: (string | null)[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(null)
    );
    beads.forEach((bead) => {
      if (
        bead.row >= 0 &&
        bead.row < rows &&
        bead.col >= 0 &&
        bead.col < cols
      ) {
        newGrid[bead.row][bead.col] = bead.color;
      }
    });
    return newGrid;
  }, [rows, cols, beads]);

  return (
    <div
      className={cn(
        'relative aspect-square bg-[#E2E2E0] border shadow-inner rounded-lg p-2 sm:p-3 overflow-hidden mx-auto',
        isPickerMode && 'cursor-crosshair',
        className
      )}
      style={{
        width: 'min(90vw, 80vh, 700px)',
        height: 'min(90vw, 80vh, 700px)',
      }}
    >
      {overlayImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 rounded-lg pointer-events-none transition-transform duration-200"
          style={{
            backgroundImage: `url(${overlayImage})`,
            transform: `scale(${overlayScale}) translate(${overlayX}%, ${overlayY}%)`,
          }}
        />
      )}
      <div
        className="relative grid w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '1px',
        }}
      >
        {grid.map((rowItems, rowIndex) =>
          rowItems.map((color, colIndex) => {
            const Comp = isInteractive ? 'button' : 'div';
            return (
              <Comp
                key={`${rowIndex}-${colIndex}`}
                aria-label={`Peg at row ${rowIndex + 1}, column ${
                  colIndex + 1
                }`}
                className={cn(
                  'w-full h-full rounded-full border border-black/10 transition-all duration-100',
                  isInteractive &&
                    !isPickerMode &&
                    'cursor-pointer hover:scale-125 hover:z-10',
                  isInteractive && isPickerMode && 'cursor-crosshair'
                )}
                style={{
                  backgroundColor: color || 'transparent',
                  boxShadow: color ? `inset 0 1px 1px rgba(0,0,0,0.2)` : '',
                }}
                onClick={() =>
                  isInteractive && onPegClick?.(rowIndex, colIndex)
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
