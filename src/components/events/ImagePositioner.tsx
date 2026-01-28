import { useState, useRef, useCallback, useEffect } from 'react';
import { Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePositionerProps {
  imageUrl: string;
  position: { x: number; y: number };
  onChange: (position: { x: number; y: number }) => void;
  className?: string;
}

export function ImagePositioner({ imageUrl, position, onChange, className }: ImagePositionerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startOffset, setStartOffset] = useState({ x: 0, y: 0 });

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
    setStartOffset({ x: position.x, y: position.y });
  }, [position]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((clientX - startPos.x) / rect.width) * 100;
    const deltaY = ((clientY - startPos.y) / rect.height) * 100;

    // Invert the delta since we're moving the view, not the image
    const newX = Math.max(0, Math.min(100, startOffset.x - deltaX));
    const newY = Math.max(0, Math.min(100, startOffset.y - deltaY));

    onChange({ x: newX, y: newY });
  }, [isDragging, startPos, startOffset, onChange]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-48 rounded-lg overflow-hidden bg-secondary cursor-move select-none",
        isDragging && "cursor-grabbing",
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <img
        src={imageUrl}
        alt="Event preview"
        className="w-full h-full object-cover pointer-events-none"
        style={{ objectPosition: `${position.x}% ${position.y}%` }}
        draggable={false}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      
      {/* Overlay with drag hint */}
      <div className={cn(
        "absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity",
        isDragging ? "opacity-0" : "opacity-100 hover:opacity-70"
      )}>
        <div className="bg-background/90 px-3 py-2 rounded-lg flex items-center gap-2 text-sm text-foreground shadow-lg">
          <Move className="w-4 h-4" />
          <span>Dra för att justera position</span>
        </div>
      </div>
    </div>
  );
}
