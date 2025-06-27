"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Share2, Palette, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getColorName, generateColorShades } from '@/lib/color-utils';
import { Popover, PopoverTrigger } from '@/components/ui/popover';

type Point = { x: number; y: number };

const ColorPickerView = () => {
  const router = useRouter();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pickerPos, setPickerPos] = useState<Point>({ x: 0, y: 0 });
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [pickedColor, setPickedColor] = useState('#000000');
  const [isDragging, setIsDragging] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [atBoundary, setAtBoundary] = useState(false);

  useEffect(() => {
    const dataUrl = sessionStorage.getItem('capturedImage');
    if (dataUrl) {
      setImageSrc(dataUrl);
    } else {
      router.push('/camera');
    }
  }, [router]);

  const shades = useMemo(() => generateColorShades(pickedColor), [pickedColor]);

  const updateColor = useCallback((x: number, y: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    
    const pixel = context.getImageData(x, y, 1, 1).data;
    const hex = `#${('000000' + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6)}`;
    setPickedColor(hex);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(0, Math.min(x, rect.width - 1));
    y = Math.max(0, Math.min(y, rect.height - 1));
    
    setPickerPos({ x, y });
    updateColor(x, y);

    setAtBoundary(y >= rect.height - 20);
  };
  
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (!isPickerVisible) setIsPickerVisible(true);
    handlePointerMove(e);
  };

  const onImageLoad = (img: HTMLImageElement) => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Fit image to container while maintaining aspect ratio
    const containerAspect = container.clientWidth / container.clientHeight;
    const imageAspect = img.width / img.height;

    let drawWidth, drawHeight, offsetX, offsetY;
    if (containerAspect > imageAspect) { // Container is wider than image
      drawWidth = container.clientWidth;
      drawHeight = container.clientWidth / imageAspect;
      offsetX = 0;
      offsetY = (container.clientHeight - drawHeight) / 2;
    } else { // Container is taller than image
      drawHeight = container.clientHeight;
      drawWidth = container.clientHeight * imageAspect;
      offsetY = 0;
      offsetX = (container.clientWidth - drawWidth) / 2;
    }

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    const initialPos = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
    setPickerPos(initialPos);
    updateColor(initialPos.x, initialPos.y);
  };

  useEffect(() => {
    if (imageSrc) {
        const img = new window.Image();
        img.src = imageSrc;
        img.onload = () => onImageLoad(img);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  const handleCopy = () => {
    const text = `${getColorName(pickedColor)} - ${pickedColor}`;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!', description: text });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/?color=${pickedColor.substring(1)}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Share link copied!', description: 'Send it to a friend.' });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden cursor-crosshair"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      
      {isPickerVisible && (
        <div
          className="absolute pointer-events-none transition-all duration-75"
          style={{
            left: pickerPos.x,
            top: pickerPos.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Reticle */}
          <div className={cn("w-16 h-16 rounded-full border-4 bg-white/20 backdrop-blur-sm transition-colors", atBoundary && "border-red-500 animate-pulse")} style={{ borderColor: atBoundary ? undefined : pickedColor }}>
             <div className="w-full h-full rounded-full border-2 border-white/50" />
          </div>

          {/* Callout */}
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-64">
            <div className="bg-background/80 backdrop-blur-md rounded-lg shadow-2xl p-2 text-foreground transition-all duration-200">
               {isPaletteOpen ? (
                   <div className="p-2">
                     <div className="flex justify-between items-center mb-2">
                       <h3 className="font-bold">Shades</h3>
                       <Button variant="ghost" size="icon" className="w-6 h-6" onClick={(e) => {e.stopPropagation(); setIsPaletteOpen(false)}}>
                         <X className="w-4 h-4" />
                       </Button>
                     </div>
                     <div className="flex justify-center items-center gap-1">
                        {shades.darker.map(s => <div key={s} onClick={(e) => { e.stopPropagation(); setPickedColor(s)}} className="w-6 h-10 rounded cursor-pointer" style={{backgroundColor: s}}/>)}
                        <div className="w-8 h-12 rounded border-2" style={{backgroundColor: pickedColor, borderColor: 'hsl(var(--primary))'}}/>
                        {shades.lighter.map(s => <div key={s} onClick={(e) => { e.stopPropagation(); setPickedColor(s)}} className="w-6 h-10 rounded cursor-pointer" style={{backgroundColor: s}}/>)}
                     </div>
                   </div>
               ) : (
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-md" style={{ backgroundColor: pickedColor }} />
                    <div className="flex-grow">
                        <p className="font-bold text-sm">{getColorName(pickedColor)}</p>
                        <p className="font-code text-xs text-muted-foreground">{pickedColor}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => {e.stopPropagation(); handleCopy()}}><Copy className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => {e.stopPropagation(); handleShare()}}><Share2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => {e.stopPropagation(); setIsPaletteOpen(true)}}><Palette className="w-4 h-4" /></Button>
                </div>
               )}
            </div>
          </div>
        </div>
      )}

      {!isPickerVisible && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-white text-2xl font-bold bg-black/50 px-6 py-3 rounded-lg">Tap and drag to pick a color</p>
        </div>
      )}

      <div className="absolute bottom-5 right-5 z-20">
         <Button onClick={() => router.push('/camera')} variant="secondary" size="lg" className="rounded-full">
            <RefreshCw className="w-5 h-5 mr-2" /> Retake
         </Button>
      </div>

    </div>
  );
};

export default ColorPickerView;
